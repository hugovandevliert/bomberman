class Game {
    constructor(height, width, players) {
        this.players = players;

        this.grid = [height];
        for (var i = 0; i < height; i++) {
            this.grid[i] = [width];
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var item = null;
                if (i % 2 && j % 2) {
                    item = 'wall';
                }
                this.grid[i][j] = new Cell(j * 50, i * 50, item);
            }
        }
    }

    update() {
        for (var key in this.players) {
            switch (this.players[key].nextMove) {
                case 'left':
                    this.players[key].x -= 50;
                    break;
                case 'up':
                    this.players[key].y -= 50;
                    break;
                case 'right':
                    this.players[key].x += 50;
                    break;
                case 'down':
                    this.players[key].y += 50;
                    break;
                default:
                    break;
            }

            this.players[key].nextMove = '';
        }
    }
}

class Cell {
    constructor(x, y, item) {
        this.x = x;
        this.y = y;
        this.item = item;
    }
}

module.exports = Game;
