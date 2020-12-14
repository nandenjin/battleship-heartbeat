<template>
  <div class="player-running-or-finished">
    <template v-if="myState">
      <div v-if="gameStatus === GameStatus.RUNNING">
        <div v-if="tokenRole === myRole">You can put piece</div>
        <div v-else>Waiting other...</div>
      </div>
      <div v-else-if="gameStatus === GameStatus.FINISHED">
        <div v-if="winner === myRole">You win</div>
        <div v-else>You lose</div>
      </div>
    </template>
    <div
      class="board-wrap board-wrap--host"
      :class="{ 'is-active': tokenRole === Role.GUEST }"
    >
      <div class="name">{{ (host?.uid || '?').substr(0, 6) }}</div>
      <board
        :cursors="[{ role: Role.GUEST, cursor: guest?.cursor }]"
        :boards="[
          {
            role: Role.HOST,
            board:
              gameStatus === GameStatus.RUNNING && myRole === Role.GUEST
                ? and(host?.board || [], guest?.attack || [])
                : host?.board,
          },
        ]"
        :attacks="[{ role: Role.GUEST, attack: guest?.attack }]"
      />
    </div>
    <div
      class="board-wrap board-wrap--guest"
      :class="{ 'is-active': tokenRole === Role.HOST }"
    >
      <div class="name">{{ (guest?.uid || '?').substr(0, 6) }}</div>
      <board
        :cursors="[{ role: Role.HOST, cursor: host?.cursor }]"
        :boards="[
          {
            role: Role.GUEST,
            board:
              gameStatus === GameStatus.RUNNING && myRole === Role.HOST
                ? and(guest?.board || [], host?.attack || [])
                : guest?.board,
          },
        ]"
        :attacks="[{ role: Role.HOST, attack: host?.attack }]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
} from 'vue'
import { Store, useStore } from 'vuex'
import Board from './Board.vue'
import { GameStatus, key, PlayerState, Role, SET_ATTACK, State } from './store'
import { pieceLength, and, setBit } from './util'

const handleEnterEvent = (key: string, store: Store<State>) => {
  if (key !== ' ') return

  const myState: PlayerState | null = store.getters.myState
  if (!myState) return

  store.commit(SET_ATTACK, setBit(myState.attack || [], myState.cursor, 1))
}

export default defineComponent({
  components: { Board },
  setup() {
    const store = useStore<State>(key)
    const host = computed(() => store.state.players.host)
    const guest = computed(() => store.state.players.guest)
    const state = reactive({
      Role,
      GameStatus,
      and,
      tokenRole: computed(() =>
        pieceLength(host.value?.attack || []) <=
        pieceLength(guest.value?.attack || [])
          ? Role.HOST
          : Role.GUEST
      ),

      host,
      guest,
      myRole: computed(() => store.getters.role),
      myState: computed(() => store.getters.myState),
      gameStatus: computed(() => store.getters.gameStatus),
      winner: computed(() => store.getters.winner),
    })

    const onKeyDown = ({ key }: KeyboardEvent) => {
      // Permission
      if (![Role.HOST, Role.GUEST].includes(store.getters.role)) return
      if (state.gameStatus !== GameStatus.RUNNING) return
      if (state.tokenRole !== store.getters.role) return
      handleEnterEvent(key, store)
    }

    onMounted(() => window.addEventListener('keydown', onKeyDown))
    onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

    return state
  },
})
</script>

<style lang="scss" scoped>
@import './style.scss';

.player-running-or-finished {
  text-align: center;

  .board-wrap {
    display: inline-block;
    margin: 10px;

    &:not(.is-active) {
      opacity: 0.5;
    }

    .board {
      border: 2px solid #888;
      padding: 5px;
    }

    .name {
      width: 50px;
      padding: 3px 5px;
      font-size: 13px;
      text-align: left;
      color: #fff;
    }

    &--host .board {
      border-color: $color-host;
    }

    &--guest .board {
      border-color: $color-guest;
    }

    &--host .name {
      background-color: $color-host;
    }

    &--guest .name {
      background-color: $color-guest;
    }
  }
}
</style>
