<template>
  <div class="board" :style="{ gridTemplateColumns: `repeat(${width}, 1fr)` }">
    <span class="cell" v-for="i of width * height" :key="i"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { key, SET_GAME, State } from './store'
import { BOARD_H, BOARD_W } from './config'

export default defineComponent({
  setup() {
    const route = useRoute()
    const store = useStore<State>(key)

    const loadFromRoute = () => {
      route.params.id === store.state.gid ||
        store.commit(SET_GAME, route.params.id)
    }
    loadFromRoute()

    watch(route, () => loadFromRoute())

    return {
      width: BOARD_W,
      height: BOARD_H,
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
    &::before {
      content: '';
      display: block;
      margin-bottom: 100%;
    }
  }
}
</style>
