class Game {
    constructor(height, width) {
        this.players = {};
        this.playerCount = 0;
        this.grid = [height];
        for (var i = 0; i < height; i++) {
            this.grid[i] = [width];
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var cell = new Cell(j * 50, i * 50);
                if (i % 2 && j % 2) {
                    cell.solid = true;
                } else if ((i > 1 && i < height - 2) || (j > 1 && j < width - 2)) {
                    if (Math.random() < 0.6) {
                        cell.item = 'crate';
                    }
                }
                this.grid[i][j] = cell;
            }
        }
    }

    addPlayer(id) {
        if (this.playerCount == 1) {
            var cell = this.grid[this.grid.length - 1][this.grid[this.grid.length - 1].length - 1];
            var emoji = '👹';
        } else if (this.playerCount == 2) {
            var cell = this.grid[0][this.grid[0].length - 1];
            var emoji = '🤡';
        } else if (this.playerCount == 3) {
            var cell = this.grid[this.grid.length - 1][0];
            var emoji = '😈';
        } else {
            var cell = this.grid[0][0];
            var emoji = '🤖';
        }
        var newPlayer = new Player(emoji);
        cell.player = newPlayer;
        this.players[id] = newPlayer;
        this.playerCount++;
    }

    removePlayer(id) {
        if (this.players[id]) {
            this.players[id].die();
            delete this.players[id];
        }
    }

    update() {
        for (var i = 0; i < this.grid.length; i++) {
            for (var j = 0; j < this.grid[i].length; j++) {
                var cell = this.grid[i][j];
                cell.update();

                if (cell.player) {
                    var player = cell.player;
                    if (player.droppedBomb) {
                        var cells = [cell];

                        for (var direction of Player.directions()) {
                            var count = 1;
                            while (count <= player.bombRange) {
                                var explodingCell = this.calculatePosition(i, j, direction, count);
                                if (!explodingCell || explodingCell.solid) {
                                    break;
                                }
                                cells.push(explodingCell);
                                count++;
                            }
                        }

                        cell.bomb = new Bomb(cells);
                        player.droppedBomb = false;
                    }

                    if (player.nextMove); {
                        var newCell = this.calculatePosition(i, j, player.nextMove, 1);
                        if (newCell && newCell.isWalkable()) {
                            newCell.player = player;
                            cell.player = null;
                        }
                        player.nextMove = null;
                    }
                }
            }
        }
    }

    calculatePosition(i, j, direction, amount) {
        var newLocation = null;
        switch (direction) {
            case 'left':
                if (j - amount >= 0) {
                    newLocation = this.grid[i][j - amount];
                }
                break;
            case 'up':
                if (i - amount >= 0) {
                    newLocation = this.grid[i - amount][j];
                }
                break;
            case 'right':
                if (j + amount < this.grid[i].length) {
                    newLocation = this.grid[i][j + amount];
                }
                break;
            case 'down':
                if (i + amount < this.grid.length) {
                    newLocation = this.grid[i + amount][j];
                }
                break;
            default:
                break;
        }
        return newLocation;
    }
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.solid = false;
        this.exploding = false;
        this.explodingFadeTime = 0;
        this.player = null;
        this.item = null;
        this.bomb = null;
    }

    update() {
        if (this.player && this.item) {
            this.player.consume(this.item);
            this.item = null;
        }
        if (this.bomb) {
            this.bomb.update();
        }
        if (this.exploding) {
            this.explodingFadeTime--;
            if (this.explodingFadeTime == 0) {
                this.exploding = false;
            }
        }
    }

    explode() {
        if (this.bomb) {
            this.bomb.explode();
            this.bomb = null;
        }
        if (this.player) {
            this.player.die();
        }
        if (this.item == 'crate') {
            this.item = null;
            var chance = Math.random();
            if (chance < 0.2) {
                this.item = 'speed-boost';
            } else if (chance < 0.4) {
                this.item = 'bomb-amount-increase';
            } else if (chance < 0.6) {
                this.item = 'bomb-range-increase';
            }
        }
        this.exploding = true;
        this.explodingFadeTime = 3;
    }

    isWalkable() {
        return !this.solid && !this.bomb && this.item != 'crate';
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            solid: this.solid,
            exploding: this.exploding,
            player: this.player ? this.player.emoji : null,
            item: this.item,
            bomb: this.bomb ? true : false,
        }
    }
}

class Bomb {
    constructor(range) {
        this.range = range;
        this.detonationTime = 5;
        this.detonated = false;
    }

    update() {
        if (this.detonationTime == 0) {
            this.explode();
        }
        this.detonationTime--;
    }

    explode() {
        if (!this.detonated) {
            this.detonated = true;
            this.range.forEach(function (cell) {
                cell.explode();
            });
        }
    }
}

class Player {
    constructor(emoji) {
        this.emoji = emoji;
        this.timeUntilMove = 10;
        this.speed = 1;
        this.bombAmount = 1;
        this.bombRange = 1;
        this.nextMove = null;
        this.droppedBomb = false;
    }

    static directions() {
        return ['left', 'up', 'right', 'down'];
    }

    update() {
        this.timeUntilMove--;
    }

    consume(item) {
        if (item == 'speed-boost') {
            this.speed++;
        } else if (item == 'bomb-amount-increase') {
            this.bombAmount++;
        } else if (item == 'bomb-range-increase') {
            this.bombRange++;
        }
    }

    die() {
        this.emoji = '☠️';
        this.speed = 0;
    }
}

module.exports = Game;
