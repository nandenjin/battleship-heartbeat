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
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { JOIN, key, State, SUBMIT_BOARD } from './store'
import { PIECE_LENGTH } from './config'
import Board from './Board.vue'
import { getBit, isEmpty, pieceLength } from './util'

export default defineComponent({
  components: { Board },
  setup() {
    const store = useStore<State>(key)

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
