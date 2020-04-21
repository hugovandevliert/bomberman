class Game {
  constructor(height, width) {
    this.players = {}
    this.playerCount = 0
    this.grid = [height]
    for (var i = 0; i < height; i++) {
      this.grid[i] = [width]
    }
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        var cell = new Cell(j * 50, i * 50)
        if (i % 2 && j % 2) {
          cell.solid = true
        } else if ((i > 1 && i < height - 2) || (j > 1 && j < width - 2)) {
          if (Math.random() < 0.6) {
            cell.item = 'crate'
          }
        }
        this.grid[i][j] = cell
      }
    }
  }

  addPlayer(id) {
    if (this.playerCount === 1) {
      var cell = this.grid[this.grid.length - 1][this.grid[this.grid.length - 1].length - 1]
      var emoji = '👹'
    } else if (this.playerCount === 2) {
      var cell = this.grid[0][this.grid[0].length - 1]
      var emoji = '🤡'
    } else if (this.playerCount === 3) {
      var cell = this.grid[this.grid.length - 1][0]
      var emoji = '😈'
    } else {
      var cell = this.grid[0][0]
      var emoji = '🤖'
    }
    var newPlayer = new Player(emoji)
    cell.players.push(newPlayer)
    this.players[id] = newPlayer
    this.playerCount++
  }

  removePlayer(id) {
    if (this.players[id]) {
      this.players[id].die()
      delete this.players[id]
    }
  }

  update() {
    for (var i = 0; i < this.grid.length; i++) {
      for (var j = 0; j < this.grid[i].length; j++) {
        var cell = this.grid[i][j]
        cell.update()

        for (var k = 0; k < cell.players.length; k++) {
          var player = cell.players[k]
          player.update()

          if (cell.bomb) {
            player.droppedBomb = false
          }
          if (player.droppedBomb && player.canDropBomb()) {
            var cells = [cell]
            for (var direction of Player.directions()) {
              var count = 1
              while (count <= player.bombRange) {
                var explodingCell = this.calculatePosition(i, j, direction, count)
                if (!explodingCell || explodingCell.solid) {
                  break
                }
                cells.push(explodingCell)
                if (explodingCell.isCrate()) {
                  break
                }
                count++
              }
            }
            cell.bomb = new Bomb(player, cells)
            player.dropBomb()
          }

          if (player.nextMove && player.canMove()) {
            var newCell = this.calculatePosition(i, j, player.nextMove, 1)
            if (newCell && newCell.isWalkable()) {
              newCell.players.push(player)
              cell.players.splice(k, 1)
              player.move()
              if (newCell.exploding) {
                player.die()
              }
            }
          }
        }
      }
    }
  }

  calculatePosition(i, j, direction, amount) {
    var newLocation = null
    switch (direction) {
      case 'left':
        if (j - amount >= 0) {
          newLocation = this.grid[i][j - amount]
        }
        break
      case 'up':
        if (i - amount >= 0) {
          newLocation = this.grid[i - amount][j]
        }
        break
      case 'right':
        if (j + amount < this.grid[i].length) {
          newLocation = this.grid[i][j + amount]
        }
        break
      case 'down':
        if (i + amount < this.grid.length) {
          newLocation = this.grid[i + amount][j]
        }
        break
      default:
        break
    }
    return newLocation
  }
}

class Cell {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.solid = false
    this.exploding = false
    this.explodingFadeTime = 5
    this.players = []
    this.item = null
    this.bomb = null
  }

  update() {
    if (this.item && this.players.length > 0) {
      for (var player of this.players) {
        player.consume(this.item)
      }
      this.item = null
    }
    if (this.bomb) {
      this.bomb.update()
    }
    if (this.exploding) {
      this.explodingFadeTime--
      if (this.explodingFadeTime === 0) {
        this.exploding = false
      }
    }
  }

  explode() {
    if (this.bomb) {
      this.bomb.explode()
      this.bomb = null
    }
    for (var player of this.players) {
      player.die()
    }
    if (this.isCrate()) {
      this.item = null
      var chance = Math.random()
      if (chance < 0.2) {
        this.item = 'speed-boost'
      } else if (chance < 0.4) {
        this.item = 'bomb-amount-increase'
      } else if (chance < 0.6) {
        this.item = 'bomb-range-increase'
      }
    }
    this.exploding = true
    this.explodingFadeTime = 5
  }

  isCrate() {
    return this.item === 'crate'
  }

  isWalkable() {
    return !this.solid && !this.bomb && !this.isCrate()
  }

  toJSON() {
    var players = []
    for (var player of this.players) {
      players.push(player.emoji)
    }
    return {
      x: this.x,
      y: this.y,
      solid: this.solid,
      exploding: this.exploding,
      players: players,
      item: this.item,
      bomb: !!this.bomb
    }
  }
}

class Bomb {
  constructor(owner, range) {
    this.owner = owner
    this.range = range
    this.detonationTime = 20
    this.detonated = false
  }

  update() {
    if (this.detonationTime === 0) {
      this.explode()
    }
    this.detonationTime--
  }

  explode() {
    if (!this.detonated) {
      this.detonated = true
      this.owner.bombCount--
      this.range.forEach(function (cell) {
        cell.explode()
      })
    }
  }
}

class Player {
  constructor(emoji) {
    this.emoji = emoji
    this.timeUntilMove = 10
    this.speed = 2
    this.bombCount = 0
    this.bombMaxAmount = 1
    this.bombRange = 1
    this.nextMove = null
    this.droppedBomb = false
  }

  static directions() {
    return ['left', 'up', 'right', 'down']
  }

  update() {
    if (this.timeUntilMove - this.speed < 0) {
      this.timeUntilMove = 0
    } else {
      this.timeUntilMove -= this.speed
    }
    if (!this.canMove()) {
      this.nextMove = null
    }
    if (!this.canDropBomb()) {
      this.droppedBomb = false
    }
  }

  canMove() {
    return this.timeUntilMove === 0 && this.speed > 0
  }

  canDropBomb() {
    return this.bombCount <= this.bombMaxAmount
  }

  move() {
    this.nextMove = null
    this.timeUntilMove = 10
  }

  dropBomb() {
    this.bombCount++
    this.droppedBomb = false
  }

  consume(item) {
    if (item === 'speed-boost') {
      this.speed++
    } else if (item === 'bomb-amount-increase') {
      this.bombMaxAmount++
    } else if (item === 'bomb-range-increase') {
      this.bombRange++
    }
  }

  die() {
    this.emoji = '☠️'
    this.speed = 0
  }
}

module.exports = Game
