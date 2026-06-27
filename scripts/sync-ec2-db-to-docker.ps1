#!/usr/bin/env pwsh
# Dump EC2 docker Postgres → restore into local docker-compose Postgres container.
# Mirror of scripts/sync-host-db-to-docker.sh, but the source is the EC2 docker DB
# (genshin-banpick-db inside ec2-user@98.86.73.53) instead of the host PG.
#
# Usage: ./scripts/sync-ec2-db-to-docker.ps1
#
# Override defaults via env if needed:
#   $env:EC2_HOST = 'ec2-user@98.86.73.53'
#   $env:EC2_SSH_KEY = '~/.ssh/aws-discord-bot-farmer-licence-key.pem'
#   ./scripts/sync-ec2-db-to-docker.ps1

# 任何 cmdlet 出錯就丟例外、停腳本（PS 預設只是警告然後繼續往下跑）
# 對 native exe (ssh / docker / wsl ...) 無效——native 失敗必須自己看 $LASTEXITCODE
$ErrorActionPreference = 'Stop'

# --- Config (override via env) ---
# 慣用模式：環境變數有設就用、沒設就吃預設值
# PS 5.1 沒有 ??（null coalescing）只能用 if/else 三元寫法
# 註：空字串會被當 falsy → fallthrough 到 else，對 ID/路徑這類字串夠用
$EC2_HOST               = if ($env:EC2_HOST)                { $env:EC2_HOST }                else { 'ec2-user@98.86.73.53' }
$EC2_SSH_KEY            = if ($env:EC2_SSH_KEY)             { $env:EC2_SSH_KEY }             else { '~/.ssh/aws-discord-bot-farmer-licence-key.pem' }
$EC2_DB_CONTAINER       = if ($env:EC2_DB_CONTAINER)        { $env:EC2_DB_CONTAINER }        else { 'genshin-banpick-db' }   # EC2 上 docker postgres container 名
$EC2_DB_USER            = if ($env:EC2_DB_USER)             { $env:EC2_DB_USER }             else { 'postgres' }
$EC2_DB_NAME            = if ($env:EC2_DB_NAME)             { $env:EC2_DB_NAME }             else { 'genshin_banpick' }

$DOCKER_DB_CONTAINER    = if ($env:DOCKER_DB_CONTAINER)     { $env:DOCKER_DB_CONTAINER }     else { 'genshin-banpick-db' }   # 本機 container 名（剛好同名，不一定要）
$DOCKER_BACKEND_SERVICE = if ($env:DOCKER_BACKEND_SERVICE)  { $env:DOCKER_BACKEND_SERVICE }  else { 'backend' }              # compose service 名（不是 container 名）
$DOCKER_DB_USER         = if ($env:DOCKER_DB_USER)          { $env:DOCKER_DB_USER }          else { 'postgres' }
$DOCKER_DB_NAME         = if ($env:DOCKER_DB_NAME)          { $env:DOCKER_DB_NAME }          else { 'genshin_banpick' }

# 要在哪個 WSL distro 跑 ssh（key 跟 ssh 都在那邊）
$WSL_DISTRO             = if ($env:WSL_DISTRO)              { $env:WSL_DISTRO }              else { 'Ubuntu' }

# dump 檔放本機 %TEMP%，檔名帶時間戳避免覆蓋，腳本結束後不自動刪（方便重 restore）
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$dumpFile  = Join-Path $env:TEMP "${EC2_DB_NAME}_$timestamp.backup"

# Helper: native exe 跑完檢查 exit code，非 0 就 throw
# 為什麼需要：$ErrorActionPreference='Stop' 對 ssh/docker 這類 native exe 無效，必須手動檢查
function Assert-LastExit {
    param([string]$Step)
    if ($LASTEXITCODE -ne 0) {
        throw "[X] $Step failed (exit $LASTEXITCODE)"
    }
}

# Helper: Windows 路徑 → WSL 用的 /mnt/<drive>/... 路徑
# 例: C:\Users\foo\bar  →  /mnt/c/Users/foo/bar
# 為什麼需要：dump 要直接寫到 Windows 檔案，但 redirect 在 bash 那邊做（見 step 1 註解），
# 所以路徑得轉成 bash 看得懂的 /mnt/c/... 格式
function ConvertTo-WslPath {
    param([string]$WindowsPath)
    # 反斜線換正斜線（Win → Unix 風格）
    $p = $WindowsPath -replace '\\', '/'
    # 抓開頭的 drive letter（如 "C:"），後面原樣保留
    if ($p -match '^([A-Za-z]):(.*)') {
        # drive letter 轉小寫接在 /mnt/ 後（WSL mount 慣例）
        return '/mnt/' + $matches[1].ToLower() + $matches[2]
    }
    return $p
}

# --- Pre-flight ---
# 1) WSL 裡的 SSH key 必須存在，不然待會 ssh 會卡在輸入密碼（這腳本是 non-interactive）
wsl -d $WSL_DISTRO -- test -f $EC2_SSH_KEY
if ($LASTEXITCODE -ne 0) {
    throw "[X] SSH key not found in WSL ($WSL_DISTRO): $EC2_SSH_KEY"
}

# 2) 本機 DB container 要在跑，後續 docker exec / docker cp 才能用
# docker ps 列名稱 → Where-Object 精確比對（不用 grep / Select-String，pipeline 更原生）
$running = docker ps --format '{{.Names}}' | Where-Object { $_ -eq $DOCKER_DB_CONTAINER }
if (-not $running) {
    throw "[X] Docker DB container '$DOCKER_DB_CONTAINER' is not running`n   Start it first: docker compose up -d $DOCKER_BACKEND_SERVICE"
}

# --- Run ---
Write-Host "[1/6] Dumping $EC2_DB_USER@EC2:$EC2_DB_CONTAINER/$EC2_DB_NAME -> $dumpFile"

# 踩雷點：stdout redirect 必須在 bash 那層做（寫到 /mnt/c/... = Windows 上同一個檔）
# 為什麼不能用 `wsl ... > $dumpFile`：PS 5.1 的 `>` 預設 UTF-16 LE 編碼，會把
# pg_dump 的 binary 自訂格式 (header "PGDMP") 整個毀掉
# → pg_restore: "input file does not appear to be a valid archive"
$wslDumpPath = ConvertTo-WslPath $dumpFile

# 遠端 EC2 上要跑的指令：docker exec 進 container 用 pg_dump
# -F c               : custom 格式（壓縮、可選擇性 restore，最常用）
# -Z 6               : 壓縮等級 6（zlib 預設）
# --no-owner --no-acl: 略過 owner / GRANT 還原，避免本機沒對應 role 時報錯
$remoteCmd = "docker exec $EC2_DB_CONTAINER pg_dump -U $EC2_DB_USER -d $EC2_DB_NAME -F c -Z 6 --no-owner --no-acl"

# 完整 SSH 一行：ssh 進 EC2 跑 $remoteCmd → 用 bash 的 > 把 stdout 寫到 /mnt/c/... Windows 檔
# -o StrictHostKeyChecking=accept-new : 首次連自動接受 host key，之後變正常驗證（避免互動提示）
$pipeCmd = "ssh -i $EC2_SSH_KEY -o StrictHostKeyChecking=accept-new $EC2_HOST '$remoteCmd' > '$wslDumpPath'"

# 透過 wsl -- bash -c <整字串> 執行（bash -c 一定要一個整體字串參數）
wsl -d $WSL_DISTRO -- bash -c $pipeCmd
Assert-LastExit 'pg_dump over SSH'

# 印 dump 大小（MB）方便目測是不是空檔/異常小
$sizeMb = [math]::Round((Get-Item $dumpFile).Length / 1MB, 2)
Write-Host "      $sizeMb MB"

Write-Host "[2/6] Stopping backend (release DB connections)"
# 後面要 DROP DATABASE，backend 仍連著的話會被擋下（即使有 WITH (FORCE)）
# 停 backend service 把所有 DB 連線收回，DROP 才會乾淨
docker compose stop $DOCKER_BACKEND_SERVICE
Assert-LastExit 'docker compose stop'

Write-Host "[3/6] Dropping & recreating $DOCKER_DB_NAME in $DOCKER_DB_CONTAINER"
# Here-string @"..."@ 包多行 SQL，內嵌 $DOCKER_DB_NAME 變數
# DROP DATABASE 不能在「自己」上面跑，要連到另一個 DB（這裡用預設的 postgres）
# WITH (FORCE) (PG 13+) 強制踢掉殘存連線，雙保險
$sql = @"
DROP DATABASE IF EXISTS "$DOCKER_DB_NAME" WITH (FORCE);
CREATE DATABASE "$DOCKER_DB_NAME";
"@

# 透過 stdin 把 SQL 餵給 docker exec 裡的 psql（避免 PS 5.1 native 參數引號地獄）：
# - docker exec -i      : 保持 STDIN 開啟
# - -v ON_ERROR_STOP=1  : SQL 出錯立刻退出，錯誤不會被吞掉
# - | Out-Null          : 吃掉 psql 成功訊息 (DROP DATABASE / CREATE DATABASE)，輸出更乾淨
$sql | docker exec -i $DOCKER_DB_CONTAINER psql -U $DOCKER_DB_USER -d postgres -v ON_ERROR_STOP=1 | Out-Null
Assert-LastExit 'drop + recreate database'

Write-Host "[4/6] Copying dump into container"
# Container 內的路徑：/tmp/ + 原檔名（去掉 Windows 路徑前綴）
$inContainerPath = "/tmp/$([System.IO.Path]::GetFileName($dumpFile))"
# 把 Windows 上的 dump 檔複製進 container 內，pg_restore 才讀得到
docker cp $dumpFile "${DOCKER_DB_CONTAINER}:${inContainerPath}"
Assert-LastExit 'docker cp'

Write-Host "[5/6] Restoring"
# 在 container 內跑 pg_restore（同版本，避免 host 端版本不符的麻煩）
# --no-owner --no-acl 要跟 dump 時一致
docker exec $DOCKER_DB_CONTAINER pg_restore -U $DOCKER_DB_USER -d $DOCKER_DB_NAME --no-owner --no-acl $inContainerPath
# pg_restore 的雷：碰到已存在的物件 (extensions, schema) 會印 warning 並 exit 非 0，
# 但其實資料還是還原好了。所以這裡不 Assert，只印警告，由使用者後續驗 row count
if ($LASTEXITCODE -ne 0) {
    Write-Host "      pg_restore exited $LASTEXITCODE (likely benign warnings -- verify row counts)"
}

Write-Host "[6/6] Starting backend"
# 把 step 2 停掉的 backend service 開回來，連回新的 DB
docker compose start $DOCKER_BACKEND_SERVICE
Assert-LastExit 'docker compose start'

Write-Host ""
# 不刪 dump 檔：失敗時可重 docker cp + pg_restore，不用再連 EC2 抓一次
Write-Host "Done. Backup retained at $dumpFile"
