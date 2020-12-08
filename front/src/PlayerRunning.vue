<template>
  <div>
    <div class="board-wrap board-wrap--host">
      <board
        :cursors="[{ role: Role.GUEST, cursor: guest.cursor }]"
        :boards="[{ role: Role.HOST, board: host.board }]"
      />
    </div>
    <div class="board-wrap board-wrap--guest">
      <board
        :cursors="[{ role: Role.HOST, cursor: host.cursor }]"
        :boards="[{ role: Role.GUEST, board: guest.board }]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import Board from './Board.vue'
import { key, Role, State } from './store'

export default defineComponent({
  components: { Board },
  setup() {
    const store = useStore<State>(key)

    return {
      Role,
      host: computed(() => store.state.players.host),
      guest: computed(() => store.state.players.guest),
    }
  },
})
</script>

<style lang="scss" scoped>
@import './style.scss';

.board-wrap {
  display: inline-block;
  border: 2px solid #888;
  margin: 10px;
  padding: 5px;

  &--host {
    border-color: $color-host;
  }

  &--guest {
    border-color: $color-guest;
  }
}
</style>
