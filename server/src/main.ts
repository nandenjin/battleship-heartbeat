import { resolve } from 'path'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import express from 'express'
import { v4 as uuid } from 'uuid'
import consola from 'consola'
import { ClientListItem, Controller, Mode, Role } from './types'
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
  hrs?: number[]
}

const game: {
  mode: Mode
} = {
  mode: Mode.NONE,
}

interface Client {
  id: string
  uid: string | null
  socket: Socket
  controller?: string | null
  state: ServerPlayerState
  role: Role
}
const clients: Client[] = []

const controllers: Controller[] = []

io.on('connection', (socket: Socket) => {
  consola.log('Client connected')
  const client: Client = {
    id: socket.id,
    uid: null,
    socket,
    role: Role.AUDIENCE,
    state: {},
  }
  clients.push(client)

  socket.on('setUid', ({ uid }) => {
    client.uid = uid
    consola.log(`[setUid] ${uid}`)
  })

  socket.on('setRole', ({ role }: { uid: string; role: Role }) => {
    const { uid } = client
    consola.log(`[setRole] ${uid} = ${Role[role]}`)
    client.role = role
    broadcastState()
  })

  socket.on('submitBoard', ({ role, board }: { role: Role; board: string }) => {
    consola.log(`[submitBoard] ${Role[role]}`)
    client.state = { ...client.state, board }
    broadcastState()
  })

  socket.on('setCursor', ({ role, cursor }: { role: Role; cursor: number }) => {
    consola.log(`[setCursor] ${Role[role]}`)
    client.state = { ...client.state, cursor }
    broadcastState()
  })

  socket.on('setAttack', ({ role, attack }: { role: Role; attack: string }) => {
    consola.log(`[setAttack] ${Role[role]}`)
    client.state = { ...client.state, attack }
    broadcastState()
  })

  socket.on(
    'assignControllerToClient',
    ({
      client: clientId,
      controller: controllerId,
    }: {
      client: string
      controller: string
    }) => {
      const client = clients.find(({ id }) => clientId === id)
      if (client) {
        client.controller = controllerId
      } else {
        consola.error(`Client not found: ${clientId}`)
      }
    }
  )

  socket.on('disconnect', () => {
    clients.splice(clients.indexOf(client), 1)
    consola.log('Client disconnected')
  })

  tellState(socket)
})

const tellState = (socket: Socket) => {
  const host = clients.find(({ role }) => role === Role.HOST)
  socket.emit('host', host ? { ...host.state, uid: host.uid } : null)

  const guest = clients.find(({ role }) => role === Role.GUEST)
  socket.emit('guest', guest ? { ...guest.state, uid: guest.uid } : null)

  socket.emit('mode', game.mode)

  socket.emit(
    'clients',
    clients.map<ClientListItem>(({ id, uid, role, controller }) => ({
      id,
      uid,
      role,
      controller,
    }))
  )
  socket.emit('controllers', controllers)
}

const broadcastState = () => clients.forEach(({ socket }) => tellState(socket))

server.listen(3000, () => {
  consola.info('Ready')
})

const osc = new OscServer(8888, '0.0.0.0')
osc.on(
  'message',
  (
    [path, ...args]: [string, ...unknown[]],
    { address }: { address: string }
  ) => {
    let controller = controllers.find(c => c.address === address)
    if (!controller) {
      const id = uuid()
      controller = { id, address }
      controllers.push(controller)
      consola.log(`Controller connected: ${address} = ${id}`)
    }
    const connectedClients = clients.filter(
      client => client.controller === controller?.id
    )
    switch (path) {
      case '/opr': {
        const opr = args[0] as number
        controller.lastOpr = opr

        if (connectedClients.length === 0) {
          consola.warn(
            'Operation will be ignored bacause no clients is linked.'
          )
        }

        consola.log(`[Opr] ${args[0]} : ${address}`)
        connectedClients.forEach(({ socket }) => socket.emit('opr', opr))

        break
      }
      case '/hr': {
        const client = connectedClients[0]

        if (client) {
          client.state.hrs = client.state.hrs || []
          client.state.hrs.push(args[0] as number)
          client.state.hrs.splice(
            0,
            Math.max(client.state.hrs.length - HRS_SAVE_NUM, 0)
          )
        }

        break
      }
      case '/mode': {
        game.mode = args[0] as Mode
        break
      }
      case '/restart': {
        consola.info('Restarting...')
        for (const client of clients) {
          client.state = {}
          client.socket.emit('reset')
        }
        break
      }
    }
    broadcastState()
  }
)
