<template>
  <div>
    <board
      :cursors="[{ role, cursor }]"
      :boards="[{ role, board: isCompleted ? myState?.board || [] : board }]"
    />
    <button
      v-if="!isCompleted"
      :disabled="pieceLength(board) !== PIECE_LENGTH"
      @click="submitBoard"
    >
      Submit
    </button>
    <span v-if="isCompleted">Waiting other player...</span>
    <span v-else-if="pieceLength(board) < PIECE_LENGTH"
      >{{ PIECE_LENGTH - pieceLength(board) }} remaining</span
    >
    <span v-else-if="pieceLength(board) > PIECE_LENGTH"
      >Too many selection. The limit is {{ PIECE_LENGTH }}</span
    >
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'
import { Store, useStore } from 'vuex'
import {
  JOIN,
  key,
  PlayerState,
  Role,
  SET_BOARD,
  State,
  SUBMIT_BOARD,
} from './store'
import { PIECE_LENGTH } from './config'
import Board from './Board.vue'
import { getBit, invBit, isEmpty, pieceLength } from './util'

const handleEnterEvent = (key: string, store: Store<State>) => {
  const { commit, state, getters } = store
  const { board, cursor } = state
  const myState: PlayerState | null = getters.myState

  if (key !== ' ') return
  if (!myState) return

  if (myState.board && !isEmpty(myState.board)) return
  commit(SET_BOARD, invBit(board, cursor))
}

export default defineComponent({
  components: { Board },
  setup() {
    const store = useStore<State>(key)

    const onKeyDown = ({ key }: KeyboardEvent) => {
      // Permission
      if (![Role.HOST, Role.GUEST].includes(store.getters.role)) return
      handleEnterEvent(key, store)
    }

    onMounted(() => window.addEventListener('keydown', onKeyDown))
    onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

    return {
      gid: computed(() => store.state.gid),
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
