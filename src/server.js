var fs = require('fs');
var https = require('https');
var express = require('express');
var socketIO = require('socket.io');

var game = require('./game');

var options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

var app = express();
var server = https.createServer(options, app).listen(5000);
var io = socketIO.listen(server);

app.use(express.static('src/public'));

var currentGame = new game(11, 13);

io.on('connection', function (socket) {
    socket.on('new player', function () {
        console.log('New player connected:', socket.id)
        currentGame.addPlayer(socket.id);
    });

    socket.on('movement', function (data) {
        var player = currentGame.players[socket.id] || {};
        if (data.bomb) {
            player.droppedBomb = true;
        }
        if (data.left) {
            player.nextMove = 'left';
        } else if (data.up) {
            player.nextMove = 'up';
        } else if (data.right) {
            player.nextMove = 'right';
        } else if (data.down) {
            player.nextMove = 'down';
        }
    });

    socket.on('chat message', function (message) {
        io.sockets.emit('chat message', socket.id + ': ' + message);
    });

    socket.on('disconnect', function () {
        console.log('Player left:', socket.id)
        currentGame.removePlayer(socket.id);
    });
});

setInterval(function () {
    io.sockets.emit('state', currentGame.grid);
}, 1000 / 60);

setInterval(function () {
    currentGame.update();
}, 1000 / 2);
