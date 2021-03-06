import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
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
    uid: null,
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
    [SET_USER]: (state, payload: firebase.User | null) => {
      state.uid = payload ? payload.uid : null
    },
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
    [SIGNIN]: () => firebase.auth().signInAnonymously(),
    [SIGNOUT]: () => firebase.auth().signOut(),
    [CREATE_GAME]: async ({ state, commit }) => {
      const ref = await firebase.database().ref('games').push({
        createdBy: state.uid,
      })
      commit(SET_GAME, ref.key)
    },
    [JOIN]: async ({ state, getters }) => {
      if (!state.uid) return
      if ([Role.HOST, Role.GUEST].includes(getters.role)) return
      if (!state.players.host) {
        await getPlayerRef(Role.HOST)?.child(`uid`).set(state.uid)
      } else if (!state.players.guest) {
        await getPlayerRef(Role.GUEST)?.child(`uid`).set(state.uid)
      }
    },
    [SUBMIT_BOARD]: async ({ state, getters }) => {
      await getPlayerRef(getters.role)?.child(`board`).set(ntos(state.board))
    },
  },
})

firebase.initializeApp(FIREBASE_CONFIG)

firebase.auth().onAuthStateChanged(user => store.commit(SET_USER, user))

let gameRef: firebase.database.Reference | null = null
const getPlayerRef = (role: Role): firebase.database.Reference | null => {
  switch (role) {
    case Role.HOST:
      return gameRef?.child(`host`) || null
    case Role.GUEST:
      return gameRef?.child(`guest`) || null
  }
  return null
}

store.subscribe(({ type }, { gid }) => {
  if (type !== SET_GAME) return
  router.replace('/' + gid ?? '')
  if (gid) {
    gameRef = firebase.database().ref(`/games/${gid}`)

    const convert = (s: Record<string, never>): PlayerState | null =>
      s
        ? ({
            ...(s || {}),
            board: s.board ? ston(s.board) : undefined,
            attack: s.attack ? ston(s.attack) : undefined,
          } as PlayerState)
        : null
    gameRef
      .child('host')
      .on('value', v => store.commit(SET_HOST, convert(v.val())))
    gameRef
      .child('guest')
      .on('value', v => store.commit(SET_GUEST, convert(v.val())))
  } else {
    gameRef = null
    store.commit(SET_HOST, null)
    store.commit(SET_GUEST, null)
  }
})

store.watch(
  state => state.cursor,
  async cursor => {
    const role: Role = store.getters.role
    if (role === Role.HOST) {
      await gameRef?.child(`host/cursor`).set(cursor)
    } else if (role === Role.GUEST) {
      await gameRef?.child(`guest/cursor`).set(cursor)
    }
  }
)

store.watch(
  state => state.attack,
  async attack => {
    const role: Role = store.getters.role
    if (role === Role.HOST) {
      await gameRef?.child(`host/attack`).set(ntos(attack))
    } else if (role === Role.GUEST) {
      await gameRef?.child(`guest/attack`).set(ntos(attack))
    }
  }
)
