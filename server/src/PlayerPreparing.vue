<template>
  <div class="player-preparing">
    <h3>Set up your board</h3>
    <div>Use arrow and space keys to select.</div>
    <board
      :cursors="[{ role, cursor }]"
      :boards="[{ role, board: isCompleted ? myState?.board || [] : board }]"
    />
    <button
      v-if="!isCompleted"
      :disabled="pieceLength(board) !== PIECE_LENGTH"
      class="button"
      @click="submitBoard"
    >
      Submit
    </button>
    <div v-if="isCompleted" class="gray piece-hint waiting">
      Waiting other player...
    </div>
    <div v-else-if="pieceLength(board) < PIECE_LENGTH" class="gray piece-hint">
      {{ PIECE_LENGTH - pieceLength(board) }} remaining
    </div>
    <div v-else-if="pieceLength(board) > PIECE_LENGTH" class="gray piece-hint">
      Too many selection. The limit is {{ PIECE_LENGTH }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'
import { Store, useStore } from 'vuex'
import { JOIN, key, PlayerState, SET_BOARD, State, SUBMIT_BOARD } from './store'
import { Role } from './types'
import { PIECE_LENGTH } from './config'
import Board from './Board.vue'
import { getBit, invBit, isEmpty, pieceLength } from './util'

const handleCommitEvent = (key: string, store: Store<State>) => {
  const { commit, state, getters } = store
  const { board, cursor } = state
  const myState: PlayerState | null = getters.myState

  if (key !== ' ') return
  if (!myState) return

  if (myState.board && !isEmpty(myState.board)) return
  commit(SET_BOARD, invBit(board, cursor))
}

const handleSubmitEvent = (key: string, store: Store<State>) => {
  const { dispatch, state, getters } = store
  const { board } = state
  const myState: PlayerState | null = getters.myState

  if (key !== 'Enter') return
  if (!myState) return

  if (pieceLength(board) !== PIECE_LENGTH) return
  dispatch(SUBMIT_BOARD)
}

export default defineComponent({
  components: { Board },
  setup() {
    const store = useStore<State>(key)

    const onKeyDown = ({ key }: KeyboardEvent) => {
      // Permission
      if (![Role.HOST, Role.GUEST].includes(store.getters.role)) return
      handleCommitEvent(key, store)
      handleSubmitEvent(key, store)
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

<style lang="scss" scoped>
.player-preparing {
  width: 600px;
  margin: 30px auto;
  text-align: center;

  .board {
    margin: 20px auto;
  }

  .piece-hint {
    margin: 10px 0;
  }
}
</style>
