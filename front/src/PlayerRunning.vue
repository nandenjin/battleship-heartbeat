<template>
  <div>
    <board
      :cursors="[{ role: Role.GUEST, cursor: guest.cursor }]"
      :boards="[{ role: Role.HOST, board: host.board }]"
    />
    <board
      :cursors="[{ role: Role.HOST, cursor: host.cursor }]"
      :boards="[{ role: Role.GUEST, board: guest.board }]"
    />
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
