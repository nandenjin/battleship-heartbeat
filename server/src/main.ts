import { resolve } from 'path'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import express from 'express'
import consola from 'consola'
import { Role } from './types'

const app = express()
const server = createServer(app)

app.use(express.static('./dist'))
app.use((_, res) => res.sendFile(resolve(__dirname, '../dist/index.html')))

const io = new Server(server)

interface ServerPlayerState {
  attack?: string
  board?: string
  cursor?: number
  uid?: string
}

const game: {
  host: ServerPlayerState | null
  guest: ServerPlayerState | null
} = {
  host: null,
  guest: null,
}

const sockets: Socket[] = []

io.on('connection', socket => {
  consola.log('User connected')
  sockets.push(socket)

  socket.on('setRole', ({ uid, role }: { uid: string; role: Role }) => {
    consola.log(`[setRole] ${uid} = ${Role[role]}`)
    setByRole(role, { uid })
    broadcastState()
  })

  socket.on('submitBoard', ({ role, board }: { role: Role; board: string }) => {
    consola.log(`[submitBoard] ${Role[role]}`)
    setByRole(role, { board })
    broadcastState()
  })

  socket.on('setCursor', ({ role, cursor }: { role: Role; cursor: number }) => {
    consola.log(`[setCursor] ${Role[role]}`)
    setByRole(role, { cursor })
    broadcastState()
  })

  socket.on('setAttack', ({ role, attack }: { role: Role; attack: string }) => {
    consola.log(`[setAttack] ${Role[role]}`)
    setByRole(role, { attack })
    broadcastState()
  })

  tellState(socket)
})

const setByRole = (role: Role, payload: Partial<ServerPlayerState>) => {
  if (role === Role.HOST) {
    game.host = { ...game.host, ...payload }
  } else if (role === Role.GUEST) {
    game.guest = { ...game.guest, ...payload }
  }
}

const tellState = (socket: Socket) => {
  socket.emit('host', game.host)
  socket.emit('guest', game.guest)
}

const broadcastState = () => sockets.forEach(socket => tellState(socket))

server.listen(3000, () => {
  consola.info('Ready')
})
