<template>
  <div class="board" :style="{ gridTemplateColumns: `repeat(${width}, 1fr)` }">
    <span
      class="cell"
      :class="{
        'is-focused-host': players.host?.cursor === i - 1,
        'is-focused-guest': players.guest?.cursor === i - 1,
      }"
      v-for="i of width * height"
      :key="i"
    ></span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { key, Role, SET_CURSOR, SET_GAME, State } from './store'
import { BOARD_H, BOARD_W } from './config'
import { off } from 'process'

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

      const newCursor = cursor.value + offset

      // No change
      if (newCursor === cursor.value) return

      // Horizontal limit
      if (
        Math.abs(offset) < BOARD_W &&
        Math.floor(cursor.value / BOARD_W) !== Math.floor(newCursor / BOARD_W)
      )
        return

      // Vertical Limit
      if (newCursor < 0 || BOARD_W * BOARD_H <= newCursor) return

      store.commit(SET_CURSOR, newCursor)
    }

    onMounted(() => window.addEventListener('keydown', onKeyDown))
    onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

    return {
      width: BOARD_W,
      height: BOARD_H,
      cursor,
      isPlayer,
      players: store.state.players,
    }
  },
})
</script>

<style lang="scss">
.board {
  display: grid;
  width: 300px;

  .cell {
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
  }
}
</style>
