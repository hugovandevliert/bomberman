var socket = io(":5000");

socket.emit('new player');

setInterval(function () {
    socket.emit('movement', movement);
}, 1000 / 60);

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
};

document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 87: // W
            movement.up = true;
            break;
        case 65: // A
            movement.left = true;
            break;
        case 83: // S
            movement.down = true;
            break;
        case 68: // D
            movement.right = true;
            break;
    }
});
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 87: // W
            movement.up = false;
            break;
        case 65: // A
            movement.left = false;
            break;
        case 83: // S
            movement.down = false;
            break;
        case 68: // D
            movement.right = false;
            break;
    }
});

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

socket.on('state', function (game) {
    context.clearRect(0, 0, 800, 600);

    // draw grid
    for (var i = 0; i < game.grid.length; i++) {
        for (var j = 0; j < game.grid[i].length; j++) {
            context.strokeStyle = 'black';
            if (game.grid[i][j].item == 'wall') {
                context.fillRect(game.grid[i][j].x, game.grid[i][j].y, 50, 50);
            } else {
                context.strokeRect(game.grid[i][j].x, game.grid[i][j].y, 50, 50);
            }
        }
    }

    context.fillStyle = 'green';
    for (var id in game.players) {
        var player = game.players[id];
        context.beginPath();
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.fill();
    }
});
