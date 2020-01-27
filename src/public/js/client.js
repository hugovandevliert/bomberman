var socket = io(":5000");

socket.emit('new player');

setInterval(function () {
    socket.emit('movement', movement);
}, 1000 / 60);

var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    bomb: false
};

document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case "w":
            movement.up = true;
            break;
        case "a":
            movement.left = true;
            break;
        case "s":
            movement.down = true;
            break;
        case "d":
            movement.right = true;
            break;
        case " ":
            movement.bomb = true;
            break;
    }
});
document.addEventListener('keyup', function (event) {
    switch (event.key) {
        case "w":
            movement.up = false;
            break;
        case "a":
            movement.left = false;
            break;
        case "s":
            movement.down = false;
            break;
        case "d":
            movement.right = false;;
            break;
        case " ":
            movement.bomb = false;
            break;
    }
});

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

socket.on('state', function (grid) {
    context.clearRect(0, 0, 800, 600);

    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            var cell = grid[i][j];
            context.fillStyle = 'black';
            context.strokeRect(cell.x, cell.y, 50, 50);
            if (cell.solid) {
                context.fillRect(cell.x, cell.y, 50, 50);
            } else if (cell.item) {
                context.fillStyle = 'gray';
                context.fillRect(cell.x, cell.y, 50, 50);
            }
            if (cell.bomb) {
                context.fillStyle = 'red';
                context.beginPath();
                context.arc(cell.x + 25, cell.y + 25, 15, 0, 2 * Math.PI);
                context.fill();
            }
            if (cell.player) {
                context.fillStyle = 'green';
                context.beginPath();
                context.arc(cell.x + 25, cell.y + 25, 10, 0, 2 * Math.PI);
                context.fill();
            }
        }
    }
});

document.getElementById('message-form').onsubmit = function (event) {
    event.preventDefault();
    var message = document.getElementById('message-input');
    socket.emit('chat message', message.value);
    message.value = '';
};

socket.on('chat message', function (message) {
    var node = document.createElement('li');
    var textnode = document.createTextNode(message);
    node.appendChild(textnode);
    document.getElementById('message-list').appendChild(node);
});
