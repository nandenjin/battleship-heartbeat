<template>
  <div class="board" :style="{ gridTemplateColumns: `repeat(${width}, 1fr)` }">
    <span
      v-for="i of width * height"
      :key="i"
      class="cell"
      :class="{
        'is-focused--host': hostCursor === i - 1,
        'is-focused--guest': guestCursor === i - 1,
        'piece--host': getBit(hostBoard, i - 1),
        'piece--guest': getBit(guestBoard, i - 1),
        'attack--host': getBit(hostAttack, i - 1),
        'attack--guest': getBit(guestAttack, i - 1),
      }"
      ><span class="rader">{{
        rader[i - 1] > 0 ? Math.ceil(rader[i - 1]) : ''
      }}</span></span
    >
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { BOARD_H, BOARD_W } from './config'
import { Role } from './types'
import { getBit } from './util'

export default defineComponent({
  props: {
    cursors: {
      type: Array as PropType<{ role: Role; cursor: number }[]>,
      default: [],
    },
    boards: {
      type: Array as PropType<{ role: Role; board: number[] }[]>,
      default: [],
    },
    attacks: {
      type: Array as PropType<{ role: Role; attack: number[] }[]>,
      default: [],
    },
    raderFor: {
      type: Array as PropType<number[]>,
      default: [],
    },
    raderAs: {
      type: Array as PropType<number[]>,
      default: [],
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
      rader: computed(() => {
        const board = props.raderFor
        const attack = props.raderAs

        const rader = Array(BOARD_W * BOARD_H).fill(-1)

        if (board && attack) {
          for (let i = 0; i < BOARD_W * BOARD_H; i++) {
            let lmin = Infinity
            if (getBit(attack, i)) {
              for (let j = 0; j < BOARD_W * BOARD_H; j++) {
                if (getBit(board, j)) {
                  const ix = i % BOARD_W
                  const iy = Math.floor(i / BOARD_W)
                  const jx = j % BOARD_W
                  const jy = Math.floor(j / BOARD_W)
                  const l = Math.abs(ix - jx) + Math.abs(iy - jy)
                  lmin = Math.min(lmin, l)
                }
              }
            }
            rader[i] = lmin < Infinity ? lmin : -1
          }
        }
        return rader
      }),
      getBit,
    }
  },
})
</script>

<style lang="scss">
@import './style.scss';

.board {
  display: grid;
  width: 300px;

  .cell {
    position: relative;
    background-color: #eee;
    margin: 1px;
    border: 2px solid transparent;

    &.is-focused--host {
      border-color: $color-host;
    }

    &.is-focused--guest {
      border-color: $color-guest;
    }

    &::before {
      content: '';
      display: block;
      margin-bottom: 100%;
    }

    &.piece--host::after,
    &.piece--guest::after {
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

    &.piece--host::after {
      background-color: $color-host;
    }

    &.piece--guest::after {
      background-color: $color-guest;
    }

    &.attack--host {
      background-color: lighten($color-host, 40%);
    }

    &.attack--guest {
      background-color: lighten($color-guest, 40%);
    }

    .rader {
      display: inline-block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      width: 15px;
      height: 15px;
      text-align: center;
      line-height: 15px;
    }
  }
}
</style>
