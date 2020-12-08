<template>
  <div>
    <div>
      <span>{{ gid }}</span
      ><button v-if="!isPlayer && uid" @click="join">Join</button>
    </div>
    <div
      class="board"
      :style="{ gridTemplateColumns: `repeat(${width}, 1fr)` }"
    >
      <span
        class="cell"
        :class="{
          'is-focused-host': players.host?.cursor === i - 1,
          'is-focused-guest': players.guest?.cursor === i - 1,
          'my-piece': getBit(board, i - 1),
        }"
        v-for="i of width * height"
        :key="i"
      ></span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Commit, Store, useStore } from 'vuex'
import {
  GameStatus,
  JOIN,
  key,
  PlayerState,
  Role,
  SET_BOARD,
  SET_CURSOR,
  SET_GAME,
  State,
} from './store'
import { BOARD_H, BOARD_W } from './config'
import { off } from 'process'
import { get } from 'http'
import { getBit, invBit, isEmpty, setBit } from './util'

/** Cursor change */
const handleCursorEvent = (key: string, store: Store<State>) => {
  const { commit, state } = store
  const { cursor } = state

  let offset = 0
  switch (key) {
    case 'ArrowUp':
      offset = -BOARD_W
      break
    case 'ArrowDown':
      offset = +BOARD_W
      break
    case 'ArrowLeft':
      offset = -1
      break
    case 'ArrowRight':
      offset = +1
      break
  }

  const newCursor = cursor + offset

  // No change
  if (newCursor === cursor) return

  // Horizontal limit
  if (
    Math.abs(offset) < BOARD_W &&
    Math.floor(cursor / BOARD_W) !== Math.floor(newCursor / BOARD_W)
  )
    return

  // Vertical Limit
  if (newCursor < 0 || BOARD_W * BOARD_H <= newCursor) return

  commit(SET_CURSOR, newCursor)
}

const handleEnterEvent = (key: string, store: Store<State>) => {
  const { commit, state, getters } = store
  const { board, cursor } = state
  const gameStatus: GameStatus = getters.gameStatus
  const myState: PlayerState | null = getters.myState

  if (key !== ' ') return
  if (!myState) return

  switch (gameStatus) {
    case GameStatus.PREPARING: {
      if (myState.board && !isEmpty(myState.board)) return
      commit(SET_BOARD, invBit(board, cursor))
    }
  }
}

const pieceLength = (n: number[]) => {
  let l = 0
  for (let i = 0; i < BOARD_W * BOARD_H; i++) {
    l += getBit(n, i) ? 1 : 0
  }
  return l
}

export default defineComponent({
  setup() {
    const route = useRoute()
    const store = useStore<State>(key)

    // Load game id by URL
    const loadFromRoute = () => {
      route.params.id === store.state.gid ||
        store.commit(SET_GAME, route.params.id)
    }
    loadFromRoute()

    watch(route, () => loadFromRoute())

    const isPlayer = computed(() =>
      [Role.HOST, Role.GUEST].includes(store.getters.role)
    )
    const cursor = computed(() => store.state.cursor)

    const onKeyDown = ({ key }: KeyboardEvent) => {
      // Permission
      if (!isPlayer) return

      handleCursorEvent(key, store)
      handleEnterEvent(key, store)
    }

    onMounted(() => window.addEventListener('keydown', onKeyDown))
    onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

    return {
      uid: computed(() => store.state.uid),
      gid: computed(() => store.state.gid),
      width: BOARD_W,
      height: BOARD_H,
      cursor,
      board: computed(() => store.state.board),
      isPlayer,
      players: store.state.players,
      join: () => {
        store.dispatch(JOIN)
      },
      getBit,
    }
  },
})
</script>

<style lang="scss">
.board {
  display: grid;
  width: 300px;

  .cell {
    position: relative;
    background-color: #eee;
    margin: 1px;
    border: 2px solid transparent;

    &.is-focused-host {
      border-color: #f08;
    }

    &.is-focused-guest {
      border-color: #08f;
    }

    &::before {
      content: '';
      display: block;
      margin-bottom: 100%;
    }

    &.my-piece::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      width: 50%;
      height: 50%;
      background-color: #000;
    }
  }
}
</style>
