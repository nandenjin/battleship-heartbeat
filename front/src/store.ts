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
  },
})

firebase.initializeApp(FIREBASE_CONFIG)

firebase.auth().onAuthStateChanged(user => store.commit(SET_USER, user))

store.watch(
  state => state.gid,
  gid => {
    router.replace('/' + gid ?? '')
  }
)
