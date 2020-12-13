<template>
  <div>
    <div v-if="tokenRole === myRole">You can put piece</div>
    <div v-else>Waiting other...</div>
    <div class="board-wrap board-wrap--host">
      <board
        :cursors="[{ role: Role.GUEST, cursor: guest?.cursor }]"
        :boards="[
          {
            role: Role.HOST,
            board:
              myRole === Role.GUEST
                ? and(host?.board || [], guest?.attack || [])
                : host?.board,
          },
        ]"
      />
    </div>
    <div class="board-wrap board-wrap--guest">
      <board
        :cursors="[{ role: Role.HOST, cursor: host?.cursor }]"
        :boards="[
          {
            role: Role.GUEST,
            board:
              myRole === Role.HOST
                ? and(guest?.board || [], host?.attack || [])
                : guest?.board,
          },
        ]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue'
import { useStore } from 'vuex'
import Board from './Board.vue'
import { key, Role, State } from './store'
import { pieceLength, and } from './util'

export default defineComponent({
  components: { Board },
  setup() {
    const store = useStore<State>(key)
    const host = computed(() => store.state.players.host)
    const guest = computed(() => store.state.players.guest)
    const state = reactive({
      Role,
      and,
      tokenRole: computed(() =>
        pieceLength(host.value?.attack || []) <=
        pieceLength(guest.value?.attack || [])
          ? Role.HOST
          : Role.GUEST
      ),

      host,
      guest,
      myRole: computed(() => store.getters.role),
      myState: computed(() => store.getters.myState),
    })

    return state
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
