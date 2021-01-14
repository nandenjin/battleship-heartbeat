import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import { io } from 'socket.io-client'
import { v4 as uuid } from 'uuid'
import { router } from './router'
import { BOARD_H, BOARD_W } from './config'
import { and, isEqual, ntos, ston } from './util'

export enum GameStatus {
  PREPARING,
  RUNNING,
  FINISHED,
}

export enum Role {
  HOST,
  GUEST,
  AUDIENCE,
}

export interface PlayerState {
  uid: string
  cursor: number
  board?: number[]
  attack?: number[]
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

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  strict: true,
  state: () => ({
    uid: localStorage.uid || uuid(),
    gid: null,
    cursor: Math.floor(BOARD_W * BOARD_H * Math.random()),
    board: [],
    attack: [],
    players: {
      host: null,
      guest: null,
    },
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
  },
  actions: {
    [CREATE_GAME]: async ({ commit }) => {
      commit(SET_GAME, 'g')
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
  },
})

const socket = io('ws://localhost:3000')

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
      store.commit('SET_HOST', convert(data))
    )
    socket.on('guest', (data: Record<string, never>) =>
      store.commit('SET_GUEST', convert(data))
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
