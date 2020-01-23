var fs = require('fs');
var https = require('https');
var express = require('express');
var socketIO = require('socket.io');

var game = require('./public/js/game');
var player = require('./public/js/player');

var options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

var app = express();
var server = https.createServer(options, app).listen(5000);
var io = socketIO.listen(server);

app.use(express.static('src/public'));

var currentGame = new game(11, 13, {});

io.on('connection', function (socket) {
    socket.on('new player', function () {
        currentGame.players[socket.id] = new player(25, 25);
    });

    socket.on('movement', function (data) {
        var player = currentGame.players[socket.id] || {};
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
        io.sockets.emit('chat message', message);
    });

    socket.on('disconnect', function () {
        delete currentGame.players[socket.id];
    });
});

setInterval(function () {
    io.sockets.emit('state', currentGame);
}, 1000 / 60);

setInterval(function () {
    currentGame.update();
}, 1000 / 2);
