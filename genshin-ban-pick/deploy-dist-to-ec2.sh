#!/bin/bash

### === 設定參數 === ###
EC2_USER=ec2-user
EC2_HOST=52.87.171.134
PEM_FILE="/Users/wangxiaoyu/Desktop/aws key/aws-discord-bot-farmer-licence-key.pem"
REMOTE_DIR=/home/ec2-user/Genshin-Ban-Pick/Genshin-Ban-Pick/genshin-ban-pick

### === Build dist locally === ###
echo "🛠️ 正在前端打包..."
npm install
npm run build

### === Zip dist === ###
echo "📦 壓縮 dist/..."
zip -r dist.zip dist > /dev/null

### === Upload to EC2 === ###
echo "🚀 上傳 dist.zip 到 EC2..."
scp -i "$PEM_FILE" dist.zip $EC2_USER@$EC2_HOST:$REMOTE_DIR
rm dist.zip

### === Deploy dist on EC2 === ###
echo "🧩 在 EC2 解壓並啟動前端..."
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << EOF
  cd $REMOTE_DIR
  unzip -o dist.zip > /dev/null
  rm dist.zip
  npm install -g serve > /dev/null 2>&1
  pm2 delete genshin-client > /dev/null 2>&1
  pm2 start serve --name genshin-client -- -s dist
  echo "✅ 前端部署完成： http://$EC2_HOST:3000"
EOF