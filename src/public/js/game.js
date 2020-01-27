class Game {
    constructor(height, width) {
        this.players = {};

        this.grid = [height];
        for (var i = 0; i < height; i++) {
            this.grid[i] = [width];
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var cell = new Cell(j * 50, i * 50);
                if (i % 2 && j % 2) {
                    cell.solid = true;
                }
                this.grid[i][j] = cell;
            }
        }
    }

    addPlayer(id) {
        if (this.players.length > 1) {
            var cell = this.grid[this.grid.length - 1][this.grid[this.grid.length - 1].length - 1];
        } else {
            var cell = this.grid[0][0];
        }

        cell.player = true;
        this.players[id] = new Player(cell);
    }

    update() {
        for (var key in this.players) {
            var player = this.players[key];

            if (player.droppedBomb) {
                player.currentLocation.bomb = true;
                player.droppedBomb = false;
            }

            var newY = player.currentLocation.y;
            var newX = player.currentLocation.x;
            switch (player.nextMove) {
                case 'left':
                    if (player.currentLocation.x > 0) {
                        newX -= 50;
                    }
                    break;
                case 'up':
                    if (player.currentLocation.y > 0) {
                        newY -= 50;
                    }
                    break;
                case 'right':
                    if (player.currentLocation.x < this.grid.length * 50) {
                        newX += 50;
                    }
                    break;
                case 'down':
                    if (player.currentLocation.y < this.grid[0].length * 50) {
                        newY += 50;
                    }
                    break;
                default:
                    break;
            }
            player.nextMove = '';

            for (var i = 0; i < this.grid.length - 1; i++) {
                var result = this.grid[i].filter(function (cell) {
                    return !cell.solid && cell.y == newY && cell.x == newX;
                });
                if (result[0]) {
                    var newLocation = result[0];
                }
            }
            if (newLocation == null || newLocation == player.currentLocation) {
                return;
            }

            newLocation.player = true;
            player.currentLocation.player = false;
            player.currentLocation = newLocation;
        }
    }
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.item = null;
        this.solid = false;
        this.player = false;
        this.bomb = false;
    }
}

class Player {
    constructor(startingCell) {
        this.currentLocation = startingCell;
        this.nextMove = null;
        this.droppedBomb = false;
    }
}

module.exports = Game;
