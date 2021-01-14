import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'
import consola from 'consola'

const app = express()
const server = createServer(app)

app.use(express.static('./dist'))

const io = new Server(server)

io.on('connection', () => {
  consola.log('User connected')
})

server.listen(3000, () => {
  consola.info('Ready')
})
