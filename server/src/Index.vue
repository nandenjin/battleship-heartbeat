<template>
  <div v-if="!uid">
    <button class="button" @click="signIn">Sign in</button> to start new game.
  </div>
  <div v-else>
    <button class="button" @click="createGame">Create new game</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { CREATE_GAME, key, SIGNIN, State } from './store'

export default defineComponent({
  setup() {
    const store = useStore<State>(key)

    return {
      uid: computed(() => store.state.uid),
      signIn: () => store.dispatch(SIGNIN),
      createGame: () => store.dispatch(CREATE_GAME),
    }
  },
})
</script>
