// backend/index.js

import { setupSocketIO } from "./socketController.js";
import characterRoutes from "./routes/characters.js";
import roomRoutes from "./routes/room.js";
import recordRoutes from "./routes/record.js";
import express from "express";
import path from "path";

import http from "http";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: ["http://localhost:5173", "http://52.87.171.134"], // 允許的前端來源
    origin: ['http://localhost:5173', 'http://52.87.171.134:3000'], // 允許的前端來源
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocketIO(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 靜態文件服務
// app.use(
//   express.static(path.join(__dirname, "../"), {
//     setHeaders: function (res, path) {
//       if (path.endsWith(".js")) {
//         // 設定 JavaScript 文件的正確 MIME 類型
//         res.set("Content-Type", "application/javascript");
//       }
//     },
//   })
// );

// Express 提供前端的靜態檔案 (非常重要!)
app.use(express.static(path.join(__dirname, 'public')));

app.use(characterRoutes);
app.use(roomRoutes);
app.use(recordRoutes);

// 讓所有未知的 request 都回傳 index.html (支援 Vue Router history mode)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://localhost:3000");
});

