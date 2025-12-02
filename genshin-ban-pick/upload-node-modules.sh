#!/bin/bash

# === 設定參數 ===
EC2_USER=ec2-user
EC2_HOST=52.87.171.134
PEM_FILE="/Users/wangxiaoyu/Desktop/aws key/aws-discord-bot-farmer-licence-key.pem"
REMOTE_DIR=/home/ec2-user/Genshin-Ban-Pick/Genshin-Ban-Pick/genshin-ban-pick

# === 壓縮 node_modules ===
echo "📦 壓縮 node_modules..."
zip -r node_modules.zip node_modules > /dev/null

# === 上傳到 EC2 ===
echo "📤 上傳到 EC2..."
scp -i "$PEM_FILE" node_modules.zip $EC2_USER@$EC2_HOST:$REMOTE_DIR

# === 登入 EC2 解壓縮 ===
echo "🔓 登入 EC2 解壓縮..."
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << EOF
  cd $REMOTE_DIR
  unzip -o node_modules.zip > /dev/null
  rm node_modules.zip
  echo "✅ node_modules 解壓完成"
EOF

# === 清除本地壓縮檔 ===
echo "🧹 清除本地壓縮檔"
rm node_modules.zip

echo "🚀 完成同步 node_modules 到 EC2！"