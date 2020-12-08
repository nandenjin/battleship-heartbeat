<template>
  <div>
    <div>
      <span>{{ gid }}</span
      ><button v-if="!myState && uid" @click="join">Join</button>
    </div>
    <player-preparing v-if="isGamePreparing" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Commit, Store, useStore } from 'vuex'
import { GameStatus, JOIN, key, SET_GAME, State } from './store'
import PlayerPreparing from './PlayerPreparing.vue'

export default defineComponent({
  components: {
    PlayerPreparing,
  },
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

    return {
      uid: computed(() => store.state.uid),
      gid: computed(() => store.state.gid),
      isGamePreparing: computed(
        () => store.getters.gameStatus === GameStatus.PREPARING
      ),
      myState: computed(() => store.getters.myState),
      join: () => {
        store.dispatch(JOIN)
      },
    }
  },
})
</script>
