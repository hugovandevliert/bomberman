var fs = require('fs');
var https = require('https');
var path = require('path');
var express = require('express');
var socketIO = require('socket.io');

var options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

var app = express();
var server = https.createServer(options, app).listen(5000);
var io = socketIO.listen(server);

var players = {};

io.on('connection', function (socket) {
    socket.on('new player', function () {
        players[socket.id] = {
            x: 300,
            y: 300
        };
    });

    socket.on('movement', function (data) {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= 5;
        }
        if (data.up) {
            player.y -= 5;
        }
        if (data.right) {
            player.x += 5;
        }
        if (data.down) {
            player.y += 5;
        }
    });

    socket.on('disconnect', function () {
        delete players[socket.id];
    });
});

setInterval(function () {
    io.sockets.emit('state', players);
}, 1000 / 60);
