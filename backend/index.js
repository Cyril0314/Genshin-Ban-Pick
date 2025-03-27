import { setupSocketIO } from './socketController.js';
import characterRoutes from './routes/characters.js';
import express from 'express';
import path from 'path';

import http from 'http';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 靜態文件服務
app.use(express.static(path.join(__dirname, '../'), {
    setHeaders: function (res, path) {
        if (path.endsWith('.js')) {
            // 設定 JavaScript 文件的正確 MIME 類型
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

setupSocketIO(io);

server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
});

app.use(characterRoutes);

// type: 0 主C
// type: 1 副C
// type: 2 輔助
