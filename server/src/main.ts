import { resolve } from 'path'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import express from 'express'
import consola from 'consola'
import { Role } from './types'
import { HRS_SAVE_NUM } from './config'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Server: OscServer } = require('node-osc')

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
  hrs?: number[]
}

const game: {
  host: ServerPlayerState | null
  guest: ServerPlayerState | null
} = {
  host: null,
  guest: null,
}

interface Client {
  id: string
  uid: string | null
  socket: Socket
}
const clients: Client[] = []

io.on('connection', (socket: Socket) => {
  consola.log('Client connected')
  const client: Client = {
    id: socket.id,
    uid: null,
    socket,
  }
  clients.push(client)

  socket.on('setUid', ({ uid }) => {
    client.uid = uid
    consola.log(`[setUid] ${uid}`)
  })

  socket.on('setRole', ({ role }: { uid: string; role: Role }) => {
    const { uid } = client
    if (!uid) {
      consola.warn('Client requested to set role but uid is not set.')
      return
    }

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

  socket.on('disconnect', () => {
    clients.splice(clients.indexOf(client), 1)
    consola.log('Client disconnected')
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

const broadcastState = () => clients.forEach(({ socket }) => tellState(socket))

server.listen(3000, () => {
  consola.info('Ready')
})

const osc = new OscServer(8888, '0.0.0.0')
const controllers: string[] = []
osc.on(
  'message',
  (
    [path, ...args]: [string, ...unknown[]],
    { address }: { address: string }
  ) => {
    if (!controllers.includes(address)) {
      controllers.push(address)
      consola.log('Controller connected (new): ' + address)
    }
    switch (path) {
      case '/opr': {
        const index = controllers.indexOf(address)
        if (index > 1) {
          consola.warn(
            'Operation ignored because too many controllers are connected.'
          )
          return
        }

        let player: ServerPlayerState | null = null
        if (index === 0) {
          player = game.host
        } else if (index === 1) {
          player = game.guest
        }

        if (!player) {
          consola.warn(
            'Operation ignored bacause no role is set yet to the client.'
          )
          return
        }

        const { uid } = player

        if (!uid) {
          consola.warn('Operation ignored bacause uid is missing with client.')
          return
        }

        const client = clients.find(({ uid: cuid }) => cuid === uid)

        if (!client) {
          consola.warn(
            'Operation ignored bacause no clients is matched to uid.'
          )
          return
        }

        consola.log(`[Opr] ${args[0]} : ${address}`)
        client.socket.emit('opr', args[0])

        break
      }
      case '/hr': {
        const index = controllers.indexOf(address)

        let player: ServerPlayerState | null = null
        if (index === 0) {
          player = game.host
        } else if (index === 1) {
          player = game.guest
        }

        if (player) {
          player.hrs = player?.hrs || []
          player.hrs.push(args[0] as number)
          player.hrs.splice(0, Math.max(player.hrs.length - HRS_SAVE_NUM, 0))
        }

        broadcastState()
        break
      }
    }
  }
)
