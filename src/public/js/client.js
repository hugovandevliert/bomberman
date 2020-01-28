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
canvas.width = 750;
canvas.height = 550;
var context = canvas.getContext('2d');
context.strokeStyle = 'black';
context.fillStyle = 'black';
context.font = '30px serif';
context.textAlign = 'center';
context.textBaseline = 'middle';

socket.on('state', function (grid) {
    context.clearRect(0, 0, 750, 550);

    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            var cell = grid[i][j];
            context.strokeRect(cell.x, cell.y, 50, 50);
            if (cell.solid) {
                context.fillRect(cell.x, cell.y, 50, 50);
            } else if (cell.item) {
                if (cell.item == 'crate') {
                    context.fillStyle = 'gray';
                    context.fillRect(cell.x, cell.y, 50, 50);
                } else if (cell.item == 'speed-boost') {
                    context.fillText('🏃', cell.x + 25, cell.y + 25);
                } else if (cell.item == 'bomb-amount-increase') {
                    context.fillText('💣', cell.x + 25, cell.y + 25);
                    context.fillText('➕', cell.x + 25, cell.y + 25);
                } else if (cell.item == 'bomb-range-increase') {
                    context.fillText('🎆', cell.x + 25, cell.y + 25);
                }
            }
            if (cell.bomb) {
                context.fillText('💣', cell.x + 25, cell.y + 25);
            }
            if (cell.player) {
                context.fillText(cell.player, cell.x + 25, cell.y + 25);
            }
            if (cell.exploding) {
                context.fillText('💥', cell.x + 25, cell.y + 25);
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
