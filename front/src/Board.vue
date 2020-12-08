<template>
  <div class="board" :style="{ gridTemplateColumns: `repeat(${width}, 1fr)` }">
    <span
      class="cell"
      :class="{
        'is-focused-host': hostCursor === i - 1,
        'is-focused-guest': guestCursor === i - 1,
        'host-piece': getBit(hostBoard, i - 1),
        'guest-piece': getBit(guestBoard, i - 1),
        'host-attack': getBit(hostAttack, i - 1),
        'guest-attack': getBit(guestAttack, i - 1),
      }"
      v-for="i of width * height"
      :key="i"
    ></span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { BOARD_H, BOARD_W } from './config'
import { Role } from './store'
import { getBit } from './util'

export default defineComponent({
  props: {
    cursors: {
      type: Array as PropType<{ role: Role; cursor: number }[]>,
    },
    boards: {
      type: Array as PropType<{ role: Role; board: number[] }[]>,
    },
    attacks: {
      type: Array as PropType<{ role: Role; attack: number[] }[]>,
    },
  },
  setup(props) {
    return {
      width: BOARD_W,
      height: BOARD_H,
      hostCursor: computed(
        () => props.cursors?.find(({ role }) => role === Role.HOST)?.cursor
      ),
      guestCursor: computed(
        () => props.cursors?.find(({ role }) => role === Role.GUEST)?.cursor
      ),
      hostBoard: computed(
        () => props.boards?.find(({ role }) => role === Role.HOST)?.board || []
      ),
      guestBoard: computed(
        () => props.boards?.find(({ role }) => role === Role.GUEST)?.board || []
      ),
      hostAttack: computed(
        () =>
          props.attacks?.find(({ role }) => role === Role.HOST)?.attack || []
      ),
      guestAttack: computed(
        () =>
          props.attacks?.find(({ role }) => role === Role.GUEST)?.attack || []
      ),
      getBit,
    }
  },
})
</script>

<style lang="scss">
$color-host: #f08;
$color-guest: #08f;

.board {
  display: grid;
  width: 300px;

  .cell {
    position: relative;
    background-color: #eee;
    margin: 1px;
    border: 2px solid transparent;

    &.is-focused-host {
      border-color: $color-host;
    }

    &.is-focused-guest {
      border-color: $color-guest;
    }

    &::before {
      content: '';
      display: block;
      margin-bottom: 100%;
    }

    &.host-piece::after,
    &.guest-piece::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      width: 50%;
      height: 50%;
    }

    &.host-piece::after {
      background-color: $color-host;
    }

    &.guest-piece::after {
      background-color: $color-guest;
    }
  }
}
</style>
