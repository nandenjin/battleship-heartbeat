import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import { router } from './router'
import { BOARD_H, BOARD_W } from './config'

export enum Role {
  HOST,
  GUEST,
  AUDIENCE,
}

export interface PlayerState {
  uid: string
  cursor: number
}

export interface State {
  uid: string | null
  gid: string | null
  cursor: number
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

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  strict: true,
  state: () => ({
    uid: null,
    gid: null,
    cursor: Math.floor(BOARD_W * BOARD_H * Math.random()),
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
  },
  mutations: {
    [SET_USER]: (state, payload: firebase.User | null) => {
      state.uid = payload ? payload.uid : null
    },
    [SET_GAME]: (state, payload: string) => {
      state.gid = payload ?? null
    },
    [SET_CURSOR]: (state, cursor: number) => {
      state.cursor = cursor
    },
    [SET_HOST]: (state, payload: PlayerState) => {
      state.players.host = payload
    },
    [SET_GUEST]: (state, payload: PlayerState) => {
      state.players.guest = payload
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
      console.log(state)
      if (!state.players.host) {
        await gameRef?.child(`host/uid`).set(state.uid)
      } else if (!state.players.guest) {
        await gameRef?.child(`guest/uid`).set(state.uid)
      }
    },
  },
})

firebase.initializeApp(FIREBASE_CONFIG)

firebase.auth().onAuthStateChanged(user => store.commit(SET_USER, user))

let gameRef: firebase.database.Reference | null = null

store.watch(
  state => state.gid,
  gid => {
    router.replace('/' + gid ?? '')
    gameRef = firebase.database().ref(`/games/${gid}`)

    gameRef.child('host').on('value', v => store.commit(SET_HOST, v.val()))
    gameRef.child('guest').on('value', v => store.commit(SET_GUEST, v.val()))
  }
)

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
