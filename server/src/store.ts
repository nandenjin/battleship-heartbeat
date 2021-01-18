import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import { v4 as uuid } from 'uuid'
import { router } from './router'
import { BOARD_H, BOARD_W } from './config'
import { and, isEqual, ntos, ston } from './util'
import { ClientListItem, Controller, Mode, Role } from './types'
import { socket } from './socket'

export enum GameStatus {
  PREPARING,
  RUNNING,
  FINISHED,
}

export interface PlayerState {
  uid: string
  cursor: number
  board?: number[]
  attack?: number[]
  hrs?: number[]
}

export interface State {
  uid: string | null
  gid: string | null
  cursor: number
  board: number[]
  attack: number[]
  players: {
    host: PlayerState | null
    guest: PlayerState | null
  }
  mode: Mode
  clients: ClientListItem[]
  controllers: Controller[]
}

export const SET_USER = 'set_user'
export const SIGNIN = 'signin'
export const SIGNOUT = 'signout'
export const SET_GAME = 'set_game'
export const CREATE_GAME = 'create_game'
export const SET_CURSOR = 'set_cursor'
export const JOIN = 'join'
export const SET_HOST = 'set_host'
export const SET_GUEST = 'set_guest'
export const SET_BOARD = 'set_board'
export const SET_ATTACK = 'set_attack'
export const SUBMIT_BOARD = 'submit_board'
export const SET_MODE = 'set_mode'
export const SET_CLIENTS = 'set_clients'
export const SET_CONTROLLERS = 'set_controllers'
export const ASSIGN_CONTROLLER_TO_CLIENT = 'assign_controller_to_client'

export const key: InjectionKey<Store<State>> = Symbol()

const uid = localStorage.uid || (localStorage.uid = uuid())

export const store = createStore<State>({
  strict: true,
  state: () => ({
    uid,
    gid: null,
    cursor: Math.floor(BOARD_W * BOARD_H * Math.random()),
    board: [],
    attack: [],
    players: {
      host: null,
      guest: null,
    },
    mode: Mode.NONE,
    clients: [],
    controllers: [],
  }),
  getters: {
    role: ({ uid, players }) =>
      players.host?.uid === uid
        ? Role.HOST
        : players.guest?.uid === uid
        ? Role.GUEST
        : Role.AUDIENCE,
    winner: ({ players }): Role | null => {
      if (!players.host?.attack || !players.guest?.attack) return null
      if (!players.host?.board || !players.guest?.board) return null
      if (
        isEqual(
          players.host.board,
          and(players.host.board || [], players.guest.attack || [])
        )
      )
        return Role.GUEST
      if (
        isEqual(
          players.guest.board,
          and(players.guest.board || [], players.host.attack || [])
        )
      )
        return Role.HOST
      return null
    },
    gameStatus: ({ players }, { winner }): GameStatus => {
      if (!players.host?.board || !players.guest?.board) {
        return GameStatus.PREPARING
      } else if (winner !== null) {
        return GameStatus.FINISHED
      }
      return GameStatus.RUNNING
    },
    myState: ({ players }, { role }): PlayerState | null => {
      switch (role) {
        case Role.HOST:
          return players.host
        case Role.GUEST:
          return players.guest
      }
      return null
    },
  },
  mutations: {
    [SET_GAME]: (state, payload: State['gid']) => {
      state.gid = payload ?? null
    },
    [SET_CURSOR]: (state, cursor: State['cursor']) => {
      state.cursor = cursor
    },
    [SET_HOST]: (state, payload: State['players']['host']) => {
      state.players.host = payload
    },
    [SET_GUEST]: (state, payload: State['players']['guest']) => {
      state.players.guest = payload
    },
    [SET_BOARD]: (state, board: State['board']) => {
      state.board = board
    },
    [SET_ATTACK]: (state, attack: State['attack']) => {
      state.attack = attack
    },
    [SET_MODE]: (state, mode: Mode) => {
      state.mode = mode
    },
    [SET_CLIENTS]: (state, clients: ClientListItem[]) => {
      state.clients = clients
    },
    [SET_CONTROLLERS]: (state, controllers: Controller[]) => {
      state.controllers = controllers
    },
  },
  actions: {
    [CREATE_GAME]: async ({ commit }) => {
      commit(SET_GAME, 'g') // Return static value temporarily
    },
    [JOIN]: async ({ state, getters }) => {
      if (!state.uid) return
      if ([Role.HOST, Role.GUEST].includes(getters.role)) return
      if (!state.players.host) {
        socket.emit('setRole', { uid: state.uid, role: Role.HOST })
      } else if (!state.players.guest) {
        socket.emit('setRole', { uid: state.uid, role: Role.GUEST })
      }
    },
    [SUBMIT_BOARD]: async ({ state, getters }) => {
      socket.emit('submitBoard', {
        role: getters.role,
        board: ntos(state.board),
      })
    },
    [ASSIGN_CONTROLLER_TO_CLIENT]: (
      _,
      payload: { client: string; controller: string }
    ) => {
      socket.emit('assignControllerToClient', payload)
    },
  },
})

socket.on('connect', () => socket.emit('setUid', { uid }))
socket.on('mode', (mode: Mode) => store.commit(SET_MODE, mode))
socket.on('clients', (clients: ClientListItem[]) =>
  store.commit(SET_CLIENTS, clients)
)
socket.on('controllers', (controllers: Controller[]) =>
  store.commit(SET_CONTROLLERS, controllers)
)
socket.on('reset', () => {
  store.commit(SET_BOARD, [])
  store.commit(SET_ATTACK, [])
})

store.subscribe(({ type }, { gid }) => {
  if (type !== SET_GAME) return
  router.replace('/' + gid ?? '')
  if (gid) {
    const convert = (s: Record<string, never>): PlayerState | null =>
      s
        ? ({
            ...(s || {}),
            board: s.board ? ston(s.board) : undefined,
            attack: s.attack ? ston(s.attack) : undefined,
          } as PlayerState)
        : null
    socket.on('host', (data: Record<string, never>) =>
      store.commit(SET_HOST, convert(data))
    )
    socket.on('guest', (data: Record<string, never>) =>
      store.commit(SET_GUEST, convert(data))
    )
  } else {
    store.commit(SET_HOST, null)
    store.commit(SET_GUEST, null)
  }
})

store.watch(
  state => state.cursor,
  async cursor => {
    const role: Role = store.getters.role
    socket.emit('setCursor', { role, cursor })
  }
)

store.watch(
  state => state.attack,
  async attack => {
    const role: Role = store.getters.role
    socket.emit('setAttack', { role, attack: ntos(attack) })
  }
)
