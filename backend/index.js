const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const http = require('http').Server(app);
const io = require('socket.io')(http);

// 靜態文件服務
app.use(express.static(path.join(__dirname, '../'), {
    setHeaders: function (res, path) {
        if (path.endsWith('.js')) {
            // 設定 JavaScript 文件的正確 MIME 類型
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

let imageState = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.roomId = roomId;

        console.log(`[Server] ${socket.id} joined room: ${roomId}`);

        if (!imageState[roomId]) imageState[roomId] = {};
        socket.emit('current-state', imageState[roomId]);
    });

    socket.on('get-state', () => {
        socket.emit('current-state', imageState);
    });

    socket.on('image-move', ({ imgId, zoneSelector, senderId })  => {
        const roomId = socket.roomId;
        if (!roomId) return;

        imageState[roomId][imgId] = zoneSelector;
        socket.to(roomId).emit('image-move', { imgId, zoneSelector, senderId });
    });

    socket.on('reset-images', () => {
        const roomId = socket.roomId;
        if (!roomId) return;

        imageState[roomId] = {};
        socket.to(roomId).emit('reset-images');
    });
});

http.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
});

app.get('/api/characters', (req, res) => {
    const charactersFilePath = path.join(__dirname, 'character/characters.json');
    fs.readFile(charactersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading characters JSON file:', err);
            res.status(500).send('Failed to read characters data');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Define a GET API at the '/api/data' endpoint
app.get('/api/data', (req, res) => {
    // You can fetch data from a database, perform some operations, etc.
    // For this example, we are just sending a JSON object as a response.
    res.json({
        message: "Here is your data!",
        data: [1, 2, 3, 4, 5]
    });
});

// API endpoint to list images
app.get('/api/character/images', (req, res) => {
    const imagesDirectory = path.join(__dirname, '../images');
    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            console.log('Error getting directory information.')
            res.status(500).send('Failed to list images');
        } else {
            // Filter files to ensure they are images and build URL paths
            let imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/.test(file))
                                  .map(image => `/images/${image}`);
            res.json(imageFiles);
        }
    });
});

// type: 0 主C
// type: 1 副C
// type: 2 輔助
