const socket = io(':5000')

socket.emit('new player')

setInterval(() => {
  socket.emit('movement', movement)
}, 1000 / 60)

const movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  bomb: false
}

document.addEventListener('keydown', (event) => {
  if (document.activeElement.id !== 'message-input') {
    event.preventDefault()

    if (event.key === 'w' || event.key === 'ArrowUp') {
      movement.up = true
    } else if (event.key === 'a' || event.key === 'ArrowLeft') {
      movement.left = true
    } else if (event.key === 's' || event.key === 'ArrowDown') {
      movement.down = true
    } else if (event.key === 'd' || event.key === 'ArrowRight') {
      movement.right = true
    } else if (event.key === ' ') {
      movement.bomb = true
    }
  }
})
document.addEventListener('keyup', (event) => {
  if (document.activeElement.id !== 'message-input') {
    event.preventDefault()

    if (event.key === 'w' || event.key === 'ArrowUp') {
      movement.up = false
    } else if (event.key === 'a' || event.key === 'ArrowLeft') {
      movement.left = false
    } else if (event.key === 's' || event.key === 'ArrowDown') {
      movement.down = false
    } else if (event.key === 'd' || event.key === 'ArrowRight') {
      movement.right = false
    } else if (event.key === ' ') {
      movement.bomb = false
    }
  }
})
document.getElementById('message-form').onsubmit = (event) => {
  event.preventDefault()
  const message = document.getElementById('message-input')
  if (message.value) {
    socket.emit('chat message', message.value)
    message.value = ''
  }
}
document.getElementById('restart').onclick = () => {
  socket.emit('restart')
  this.blur()
}

const canvas = document.getElementById('canvas')
canvas.width = 650
canvas.height = 550
const context = canvas.getContext('2d')
context.strokeStyle = 'black'
context.fillStyle = 'black'
context.font = '30px serif'
context.textAlign = 'center'
context.textBaseline = 'middle'

socket.on('state', (grid) => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.strokeRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const cell = grid[i][j]
      context.strokeRect(cell.x, cell.y, 50, 50)

      if (cell.bomb) {
        context.fillText('💣', cell.x + 25, cell.y + 25)
      }
      for (const player of cell.players) {
        context.fillText(player, cell.x + 25, cell.y + 25)
      }
      if (cell.solid) {
        context.fillStyle = 'black'
        context.fillRect(cell.x, cell.y, 50, 50)
      } else if (cell.exploding) {
        context.fillText('💥', cell.x + 25, cell.y + 25)
      } else if (cell.item) {
        if (cell.item === 'crate') {
          context.fillStyle = 'BurlyWood'
          context.fillRect(cell.x + 1, cell.y + 1, 48, 48)
        } else if (cell.item === 'speed-boost') {
          context.fillText('🏃', cell.x + 25, cell.y + 25)
        } else if (cell.item === 'bomb-amount-increase') {
          context.fillText('🧨', cell.x + 25, cell.y + 25)
        } else if (cell.item === 'bomb-range-increase') {
          context.fillText('🎆', cell.x + 25, cell.y + 25)
        }
      }
    }
  }
})

socket.on('chat message', (message) => {
  const node = document.createElement('li')
  const messageNode = document.createTextNode(message)
  node.appendChild(messageNode)
  const messageList = document.getElementById('message-list')
  messageList.appendChild(node)
  messageList.scrollTop = messageList.scrollHeight
})
