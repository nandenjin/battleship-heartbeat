import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import firebase from 'firebase/app'
import 'firebase/auth'

export interface State {
  uid: string | null
}

export const SET_USER = 'set_user'
export const SIGNIN = 'signin'
export const SIGNOUT = 'signout'

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  strict: true,
  state: () => ({
    uid: null,
  }),
  mutations: {
    [SET_USER]: (state, payload: firebase.User | null) => {
      state.uid = payload ? payload.uid : null
    },
  },
  actions: {
    [SIGNIN]: () => firebase.auth().signInAnonymously(),
    [SIGNOUT]: () => firebase.auth().signOut(),
  },
})

firebase.initializeApp({
  apiKey: 'AIzaSyDaHeLY34eviNVYo5PW3BIoAhTrxCayAHs',
  authDomain: 'battleship-heartbeat.firebaseapp.com',
  databaseURL: 'https://battleship-heartbeat.firebaseio.com',
  projectId: 'battleship-heartbeat',
  storageBucket: 'battleship-heartbeat.appspot.com',
  messagingSenderId: '473534340935',
  appId: '1:473534340935:web:a0b42806768f4414677662',
  measurementId: 'G-F6JZC63NQH',
})

firebase.auth().onAuthStateChanged(user => store.commit(SET_USER, user))
