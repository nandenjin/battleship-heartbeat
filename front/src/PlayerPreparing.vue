<template>
  <div>
    <board
      :cursors="[{ role, cursor }]"
      :boards="[{ role, board: isCompleted ? myState?.board || [] : board }]"
    />
    <button
      :disabled="pieceLength(board) !== PIECE_LENGTH"
      @click="submitBoard"
    >
      Submit
    </button>
    <span v-if="isCompleted">Waitiing other player...</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, watch } from 'vue'
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
  SUBMIT_BOARD,
} from './store'
import { BOARD_H, BOARD_W, PIECE_LENGTH } from './config'
import { getBit, invBit, isEmpty, setBit } from './util'
import Board from './Board.vue'

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
  components: { Board },
  setup() {
    const store = useStore<State>(key)
    const isPlayer = computed(() =>
      [Role.HOST, Role.GUEST].includes(store.getters.role)
    )

    const onKeyDown = ({ key }: KeyboardEvent) => {
      // Permission
      if (!isPlayer) return

      handleCursorEvent(key, store)
      handleEnterEvent(key, store)
    }

    onMounted(() => window.addEventListener('keydown', onKeyDown))
    onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

    return {
      gid: computed(() => store.state.gid),
      width: BOARD_W,
      height: BOARD_H,
      PIECE_LENGTH,
      board: computed(() => store.state.board),
      cursor: computed(() => store.state.cursor),
      role: computed(() => store.getters.role),
      myState: computed(() => store.getters.myState),
      isCompleted: computed(
        () =>
          store.getters.myState && !isEmpty(store.getters.myState?.board || [])
      ),
      join: () => {
        store.dispatch(JOIN)
      },
      getBit,
      pieceLength,
      submitBoard: () => store.dispatch(SUBMIT_BOARD),
    }
  },
})
</script>
