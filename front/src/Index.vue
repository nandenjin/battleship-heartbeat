<template>
  <div>Index</div>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue'
import { useStore } from 'vuex'
import { CREATE_GAME, key, State } from './store'

export default defineComponent({
  setup() {
    const store = useStore<State>(key)

    watch(
      computed(() => store.state.uid),
      uid => (uid ? store.dispatch(CREATE_GAME) : null)
    )

    return {}
  },
})
</script>
