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
        msg.innerHTML = `<strong>You:</strong> ${message}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;

        input.value = '';
    });

    document.getElementById('chat-toggle').addEventListener('click', (e) => {
        if (e.detail === 0) return; // 忽略拖動 mouseup 導致的 click
        const windowEl = document.getElementById('chat-window');
        windowEl.classList.toggle('hidden');
    });

    makeDraggable(document.getElementById('floating-chat'), document.getElementById('chat-toggle'));
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

function makeDraggable(element, dragHandle = element) {
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    let shouldBlockClick = false;

    dragHandle.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        const onMouseMove = (e) => {
            isDragging = true;
            shouldBlockClick = true;
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            element.style.position = 'fixed';
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = 'none';
        isDragging = false;
    });

    // 🔒 阻止拖曳後觸發的 click
    dragHandle.addEventListener('click', (e) => {
        if (shouldBlockClick) {
            e.preventDefault();
            e.stopImmediatePropagation();
            shouldBlockClick = false;
        }
    });
}