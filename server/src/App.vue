<template>
  <div>
    <div class="user-ctrl">
      <div v-if="uid">
        <span
          class="badge"
          :class="{
            'badge--host': role === Role.HOST,
            'badge--guest': role === Role.GUEST,
          }"
          >{{ uid.substr(0, 6) }}</span
        ><button @click="signout">Signout</button>
      </div>
      <div v-else>You are not signed in.</div>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { RouterView } from 'vue-router'
import { key, SIGNIN, SIGNOUT, State } from './store'
import { Role } from './types'

export default defineComponent({
  components: {
    RouterView,
  },
  setup() {
    const store = useStore<State>(key)

    return {
      Role,
      uid: computed(() => store.state.uid),
      role: computed(() => store.getters.role),
      signin: () => store.dispatch(SIGNIN),
      signout: () => store.dispatch(SIGNOUT),
    }
  },
})
</script>

<style lang="scss" scoped>
@import './style.scss';

.user-ctrl {
  font-size: 14px;
  color: #888;
  text-align: right;

  .badge {
    display: inline-block;
    color: #fff;
    font-size: 12px;
    background-color: #888;
    padding: 2px 5px;
    margin: 0 10px;

    &--host {
      background-color: $color-host;
    }

    &--guest {
      background-color: $color-guest;
    }
  }
}
</style>
