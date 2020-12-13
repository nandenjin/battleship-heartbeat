<template>
  <div>
    <div>
      <span>{{ gid }}</span
      ><button v-if="!myState && uid" @click="join">Join</button>
    </div>
    <player-preparing v-if="gameStatus === GameStatus.PREPARING" />
    <player-running-or-finished
      v-if="
        gameStatus === GameStatus.RUNNING || gameStatus === GameStatus.FINISHED
      "
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Store, useStore } from 'vuex'
import {
  GameStatus,
  JOIN,
  key,
  Role,
  SET_CURSOR,
  SET_GAME,
  State,
} from './store'
import PlayerPreparing from './PlayerPreparing.vue'
import PlayerRunningOrFinished from './PlayerRunningOrFinished.vue'
import { BOARD_H, BOARD_W } from './config'

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

export default defineComponent({
  components: {
    PlayerPreparing,
    PlayerRunningOrFinished,
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

    const onKeyDown = ({ key }: KeyboardEvent) => {
      // Permission
      if (![Role.HOST, Role.GUEST].includes(store.getters.role)) return

      handleCursorEvent(key, store)
    }

    onMounted(() => window.addEventListener('keydown', onKeyDown))
    onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

    return {
      GameStatus,
      uid: computed(() => store.state.uid),
      gid: computed(() => store.state.gid),
      gameStatus: computed(() => store.getters.gameStatus),
      myState: computed(() => store.getters.myState),
      join: () => {
        store.dispatch(JOIN)
      },
    }
  },
})
</script>
