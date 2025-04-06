// scripts/ui/tacticalBoard.js
import { originalImageSrc } from '../utils/imageUtils.js';

const aetherTab = document.getElementById('aether-tab');
const lumineTab = document.getElementById('lumine-tab');
const aetherBoard = document.getElementById('aether-board');
const lumineBoard = document.getElementById('lumine-board');

export function setupTacticalBoard(roomSetting) {

  // 註冊分頁切換
  aetherTab.addEventListener('click', () => switchTacticalBoard('aether'));
  lumineTab.addEventListener('click', () => switchTacticalBoard('lumine'));

  // 建立所有戰術格子
  const tacticalGrids = Array.from(document.querySelectorAll('.tactical__grid'));
  tacticalGrids.forEach(setupTacticalGrid);

  // 註冊各種事件監聽
  setupTeamMembersUpdatedListener();
  setupImageMovedListener(roomSetting);
  setupImageResetListener();
  setupImageClickListener();
}

// 建立單一 tactical grid（25 格）
function setupTacticalGrid(tacticalGrid) {
  for (let i = 0; i < 25; i++) {
    const cell = createTacticalCell(i);
    tacticalGrid.appendChild(cell);
  }
}

// 根據格子索引建立 cell
function createTacticalCell(i) {
  const cell = document.createElement('div');
  cell.classList.add('tactical__cell');
  cell.dataset.index = i;
  const row = Math.floor(i / 5);
  const col = i % 5;

  if (row === 0 && col === 0) {
    // 第一個 cell：標題 cell，同時顯示「成員」與「隊伍」
    cell.classList.add('tactical__cell--title');

    const spanMemberTitle = document.createElement('span');
    spanMemberTitle.className = 'tactical__title tactical__title--member';
    spanMemberTitle.textContent = '成員';
    cell.appendChild(spanMemberTitle);

    const spanOrderTitle = document.createElement('span');
    spanOrderTitle.className = 'tactical__title tactical__title--order';
    spanOrderTitle.textContent = '隊伍';
    cell.appendChild(spanOrderTitle);
  } else if (row === 0) {
    // 第一行其他格子：用於顯示隊員名稱
    cell.classList.add('tactical__cell--member-name');
    const span = document.createElement('span');
    span.className = 'tactical__member-name';
    cell.appendChild(span);
  } else if (col === 0) {
    // 每行第一個（非第一行）：顯示隊伍編號
    cell.classList.add('tactical__cell--team-order');
    const span = document.createElement('span');
    span.className = 'tactical__team-order';
    span.textContent = `隊伍${row}`;
    cell.appendChild(span);
  } else {
    // 其餘格子為 drop zone
    cell.classList.add('tactical__cell--drop-zone');
    cell.addEventListener('dragover', e => e.preventDefault());
    cell.addEventListener('drop', handleDropOnCell);
  }
  return cell;
}

// 處理 drop 事件
function handleDropOnCell(e) {
  e.preventDefault();
  const imgId = e.dataTransfer.getData('text/plain');
  const draggedClone = document.getElementById(imgId);
  if (draggedClone && draggedClone.dataset.origin === 'tactical-pool') {
    this.appendChild(draggedClone);
  }
}

// 監聽 teamMembersUpdated 事件
function setupTeamMembersUpdatedListener() {
  document.addEventListener('teamMembersUpdated', (e) => {
    const { team, teamMembers } = e.detail;
    const board = document.getElementById(`${team}-board`);
    if (board) {
      const memberSpans = board.querySelectorAll('.tactical__member-name');
      memberSpans.forEach((span, idx) => {
        span.textContent = teamMembers[idx] || '';
      });
    }
  });
}

// 監聽 imageMoved 事件
function setupImageMovedListener(roomSetting) {
  document.addEventListener('imageMoved', (e) => {
    const { imgId, zoneSelector } = e.detail;
    console.log(`imageMoved imgId ${imgId}`);
    console.log(`imageMoved zoneSelector ${zoneSelector}`);

    const dropZone = document.querySelector(zoneSelector);
    console.log(`${dropZone}`);

    if (zoneSelector === '#image-options') {
      // 從所有戰術板移除所有該圖片 clone
      const board = document.querySelector('.tactical__board');
      const clones = board.querySelectorAll(`[id^="${imgId}_tactical_"]`);
      clones.forEach(clone => clone.remove());
    } else if (dropZone.className.includes('pick')) {
      const team = getTeamByZone(dropZone.dataset.zoneId, roomSetting.banPickFlow);
      console.log(`Drop zone ID: ${dropZone.id}`);
      console.log(`Team: ${team}`);
      makeCloneForTacticalPool(team, imgId);
    } else if (dropZone.className.includes('utility')) {
      makeCloneForTacticalPool('aether', imgId);
      makeCloneForTacticalPool('lumine', imgId);
    }
  });
}

// 監聽 imageReset 事件：移除所有戰術板內圖片
function setupImageResetListener() {
  document.addEventListener('imageReset', (e) => {
    const board = document.querySelector('.tactical__board');
    const imgs = board.querySelectorAll('img');
    imgs.forEach(img => img.remove());
  });
}

// 監聽 tactical__cell 內圖片點擊事件：將圖片返回對應 pool
function setupImageClickListener() {
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.tagName === 'IMG' && target.closest('.tactical__cell')) {
      const team = target.dataset.team;
      if (!team) return;
      const board = document.getElementById(`${team}-board`);
      if (board) {
        const pool = board.querySelector('.tactical__pool');
        if (pool) {
          pool.appendChild(target);
        }
      }
    }
  });
}


// 切換戰術板顯示
function switchTacticalBoard(team) {
  if (team === 'aether') {
    aetherBoard.style.display = 'flex';
    lumineBoard.style.display = 'none';
    aetherTab.classList.add('tactical__tab--active');
    lumineTab.classList.remove('tactical__tab--active');
  } else if (team === 'lumine') {
    aetherBoard.style.display = 'none';
    lumineBoard.style.display = 'flex';
    aetherTab.classList.remove('tactical__tab--active');
    lumineTab.classList.add('tactical__tab--active');
  }
}

// 複製圖片至對應戰術池
function makeCloneForTacticalPool(team, imgId) {
  const imgElement = document.getElementById(imgId);
  const board = document.getElementById(`${team}-board`);
  const pool = board.querySelector('.tactical__pool');
  const cloneId = `${imgId}_tactical_${team}`;
  if (pool.querySelector(`#${cloneId}`)) return;

  const cloneImgElement = imgElement.cloneNode(true);
  cloneImgElement.src = originalImageSrc[imgId] || imgElement.src;
  cloneImgElement.id = cloneId;
  cloneImgElement.dataset.origin = 'tactical-pool';
  cloneImgElement.dataset.team = team;
  cloneImgElement.draggable = true;
  cloneImgElement.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', cloneId);
  });

  pool.appendChild(cloneImgElement);
}

// 根據 zoneInput 與 banPickFlow 資料判斷隊伍
function getTeamByZone(zoneInput, banPickFlow) {
  const zoneId = zoneInput.replace(/^zone-/, '');
  if (!zoneId.startsWith("Pick")) return null;
  const record = banPickFlow.find(item => item.zoneId === zoneId && item.action === "pick");
  if (record) {
    return record.player.replace("Team ", "").toLowerCase();
  }
  return null;
}