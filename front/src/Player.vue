<template><div>Player</div></template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { key, SET_GAME, State } from './store'

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

    return {}
  },
})
</script>
