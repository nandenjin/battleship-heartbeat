<template>
  <div>
    <div v-if="uid">
      <span>{{ uid }}</span
      ><button @click="signout">Signout</button>
    </div>
    <div v-else>
      <button @click="signin">Signin</button>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { RouterView } from 'vue-router'
import { key, SIGNIN, SIGNOUT, State } from './store'

export default defineComponent({
  components: {
    RouterView,
  },
  setup() {
    const store = useStore<State>(key)

    return {
      uid: computed(() => store.state.uid),
      signin: () => store.dispatch(SIGNIN),
      signout: () => store.dispatch(SIGNOUT),
    }
  },
})
</script>
