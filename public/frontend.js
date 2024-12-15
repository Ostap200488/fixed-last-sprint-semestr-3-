const socket = new WebSocket('ws://localhost:3000/ws');

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'chat') {
      
        const chatWidget = document.querySelector('.chat-widget');
        const msgDiv = document.createElement('div');
        msgDiv.textContent = `${message.timestamp} [${message.username}]: ${message.text}`;
        chatWidget.appendChild(msgDiv);
    } else if (message.type === 'notification') {
        // Display notifications
        const chatWidget = document.querySelector('.chat-widget');
        const notifDiv = document.createElement('div');
        notifDiv.textContent = message.message;
        chatWidget.appendChild(notifDiv);
    }
};


function updateOnlineUsers(users) {
    const onlineUsersList = document.getElementById('online-users');
    onlineUsersList.innerHTML = '';
    users.forEach(username => {
        const li = document.createElement('li');
        li.textContent = username;
        onlineUsersList.appendChild(li);
    });
}
