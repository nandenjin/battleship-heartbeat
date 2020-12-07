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
import { computed, defineComponent, watch } from 'vue'
import { useStore } from 'vuex'
import { RouterView, useRoute } from 'vue-router'
import { key, SIGNIN, SIGNOUT, State } from './store'

export default defineComponent({
  setup() {
    const store = useStore<State>(key)
    const route = useRoute()

    return {
      uid: computed(() => store.state.uid),
      signin: () => store.dispatch(SIGNIN),
      signout: () => store.dispatch(SIGNOUT),
    }
  },
  components: {
    RouterView,
  },
})
</script>
