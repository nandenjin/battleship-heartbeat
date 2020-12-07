import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import { router } from './router'

export interface State {
  uid: string | null
  gid: string | null
}

export const SET_USER = 'set_user'
export const SIGNIN = 'signin'
export const SIGNOUT = 'signout'
export const SET_GAME = 'set_game'
export const CREATE_GAME = 'create_game'

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  strict: true,
  state: () => ({
    uid: null,
    gid: null,
  }),
  mutations: {
    [SET_USER]: (state, payload: firebase.User | null) => {
      state.uid = payload ? payload.uid : null
    },
    [SET_GAME]: (state, payload: string) => {
      state.gid = payload ?? null
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
