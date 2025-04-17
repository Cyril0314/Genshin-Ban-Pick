// scripts/ui/setupChatRoom.js

let nickname = 'Anonymous';

export function setupChatRoom(socket) {
    setupNickName();

    let input = document.getElementById('chat-input');
    let sendButton = document.getElementById('chat-send');

    sendButton.addEventListener('click', () => {
        const message = input.value.trim();
        if (!message) return;

        socket.emit('chat.message.send.request', {
            senderName: nickname,
            message,
            senderId: socket.id
        });

        // 顯示自己發的訊息
        const chatBox = document.querySelector('.chat__messages');
        const msg = document.createElement('div');
        msg.className = 'chat__message self';
        msg.innerHTML = `<strong>${nickname}:</strong> ${message}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;

        input.value = '';
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton.click();
        }
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
