import { io } from 'socket.io-client'
export const socket = io()

socket.on('opr', (n: number) => {
  let key = ''
  switch (n) {
    case 1:
      key = 'ArrowUp'
      break
    case 2:
      key = 'ArrowDown'
      break
    case 4:
      key = 'ArrowLeft'
      break
    case 8:
      key = 'ArrowRight'
      break
    case 16:
      key = ' '
      break
  }
  const event = new KeyboardEvent('keydown', { key })
  window.dispatchEvent(event)
})
