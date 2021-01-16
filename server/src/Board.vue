<template>
  <div class="board" :style="{ gridTemplateColumns: `repeat(${width}, 1fr)` }">
    <span v-for="i of width * height" :key="i" class="cell">
      <span
        class="cursor"
        :class="{
          'cursor--host': hostCursor === i - 1,
          'cursor--guest': guestCursor === i - 1,
        }"
      ></span>
      <span class="rader rader--as-host">{{
        raderAsHost[i - 1] > 0 ? Math.ceil(raderAsHost[i - 1]) : ''
      }}</span>
      <span class="rader rader--as-guest">{{
        raderAsGuest[i - 1] > 0 ? Math.ceil(raderAsGuest[i - 1]) : ''
      }}</span>
      <span
        class="piece"
        :class="{
          'piece--host': getBit(hostBoard, i - 1),
          'piece--guest': getBit(guestBoard, i - 1),
          'piece--host-attacked': getBit(and(hostBoard, guestAttack), i - 1),
          'piece--guest-attacked': getBit(and(guestBoard, hostAttack), i - 1),
        }"
      >
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { BOARD_H, BOARD_W } from './config'
import { Role } from './types'
import { getBit, and } from './util'

const computeRader = (board: number[], attack: number[]): number[] => {
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
}

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
    raders: {
      type: Array as PropType<
        { asRole: Role; board: number[]; attack: number[] }[]
      >,
      default: [],
    },
  },
  setup(props) {
    const hostCursor = computed(
      () => props.cursors?.find(({ role }) => role === Role.HOST)?.cursor
    )
    const guestCursor = computed(
      () => props.cursors?.find(({ role }) => role === Role.GUEST)?.cursor
    )
    const hostBoard = computed(
      () => props.boards?.find(({ role }) => role === Role.HOST)?.board || []
    )
    const guestBoard = computed(
      () => props.boards?.find(({ role }) => role === Role.GUEST)?.board || []
    )
    const hostAttack = computed(
      () => props.attacks?.find(({ role }) => role === Role.HOST)?.attack || []
    )
    const guestAttack = computed(
      () => props.attacks?.find(({ role }) => role === Role.GUEST)?.attack || []
    )
    const raderAsHost = computed(() => {
      const rader = props.raders?.find(({ asRole }) => asRole === Role.HOST)
      return rader ? computeRader(rader.board, rader.attack) : []
    })
    const raderAsGuest = computed(() => {
      const rader = props.raders?.find(({ asRole }) => asRole === Role.GUEST)
      return rader ? computeRader(rader.board, rader.attack) : []
    })

    return {
      width: BOARD_W,
      height: BOARD_H,
      hostCursor,
      guestCursor,
      hostBoard,
      guestBoard,
      hostAttack,
      guestAttack,
      raderAsHost,
      raderAsGuest,
      getBit,
      and,
    }
  },
})
</script>

<style lang="scss">
@import './style.scss';

.board {
  display: grid;
  width: 600px;
  grid-gap: 10px;

  .cell {
    position: relative;
    background-color: rgba(255, 255, 255, 0.1);

    &::before {
      content: '';
      display: block;
      margin-bottom: 100%;
    }

    .cursor {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      &::before,
      &::after {
        position: absolute;
        font-family: 'Material Icons';
        display: none;
        content: 'visibility';
        width: 22px;
        height: 22px;
        line-height: 22px;
        font-size: 25px;
      }

      &::before {
        color: $color-host;
        top: 15%;
        right: 12%;
      }

      &::after {
        color: $color-guest;
        bottom: 15%;
        left: 12%;
      }

      &--host::before,
      &--guest::after {
        display: inline-block;
      }
    }

    .rader {
      display: inline-block;
      position: absolute;
      width: 20px;
      height: 20px;
      line-height: 20px;
      font-size: 20px;
      text-align: center;

      &--as-host {
        right: 15%;
        bottom: 15%;
        color: $color-guest;
      }

      &--as-guest {
        top: 15%;
        left: 15%;
        color: $color-host;
      }
    }

    .piece {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      &::before,
      &::after {
        content: 'favorite';
        position: absolute;
        font-family: 'Material Icons';
        width: 22px;
        height: 22px;
        font-size: 25px;
        line-height: 22px;
        display: none;
      }

      &--host::before {
        top: 15%;
        left: 12%;
        color: $color-host;
        display: inline-block;
      }
      &--guest::after {
        right: 12%;
        bottom: 15%;
        color: $color-guest;
        display: inline-block;
      }

      &--host-attacked::before,
      &--guest-attacked::after {
        content: 'favorite_border';
      }
    }
  }
}
</style>
