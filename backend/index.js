const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');

const app = express();
const server = createServer(app);

//https 的一些設定，如果不需要使用 ssl 加密連線的話，把內容註解掉就好
var options = {
    // key: fs.readFileSync('這個網域的 ssl key 位置'),
    // cert: fs.readFileSync('這個網域的 ssl fullchain 位置')
}

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../index.html'));
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
