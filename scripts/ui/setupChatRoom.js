// scripts/ui/chatRoom.js

let nickname = 'Anonymous';

export function setupChatRoom(socket) {
    setupNickName();

    document.getElementById('chat-send').addEventListener('click', () => {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        socket.emit('chat.message.send.request', {
            senderName: nickname,
            message,
            senderId: socket.id
        });

        // 顯示自己發的訊息
        const chatBox = document.getElementById('chat-messages');
        const msg = document.createElement('div');
        msg.className = 'chat-message self';
        msg.innerHTML = `<strong>${nickname}:</strong> ${message}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;

        input.value = '';
    });
}

function setupNickName() {
    // Set nickname
    const storedName = localStorage.getItem('nickname');
    if (storedName) nickname = storedName;
    else nickname = prompt("輸入暱稱:") || nickname;
    localStorage.setItem('nickname', nickname);

    const nicknameDisplay = document.getElementById('current-nickname');
    nicknameDisplay.textContent = `暱稱: ${nickname}`;

    document.getElementById('change-nickname').addEventListener('click', () => {
        const newName = prompt('輸入暱稱:', nickname);
        if (newName && newName !== nickname) {
            nickname = newName;
            localStorage.setItem('nickname', nickname);
            nicknameDisplay.textContent = `暱稱: ${nickname}`;
        }
    });
}
