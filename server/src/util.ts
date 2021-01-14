import { BOARD_W } from './config'

export const normalize = (n: number[]): number[] => {
  let f = false
  for (let i = n.length - 1; i >= 0; i--) {
    if (!n[i] || n[i] <= 0) {
      if (f) {
        n[i] = 0
      } else {
        n.splice(i, 1)
      }
    } else {
      f = true
    }
  }
  return n
}
export const ntos = (n: number[]): string => normalize(n).join('.')
export const ston = (s: string): number[] =>
  normalize(s.split('.').map(p => +p))
export const isEmpty = (n: number[]): boolean => n.every(p => p === 0)
export const isEqual = (a: number[], b: number[]): boolean =>
  ntos(a) === ntos(b)
export const getBit = (n: number[], i: number): boolean =>
  !!(((n[i >>> 5] || 0) >>> (i & 31)) & 1)
export const setBit = (
  n: number[],
  i: number,
  v: boolean | number
): number[] => {
  const nn = n.map(p => p)
  nn[i >>> 5] = (n[i >>> 5] || 0) & (0xffffffff - (0b1 << (i & 31)))
  nn[i >>> 5] += (v ? 1 : 0) << (i & 31)
  return normalize(nn)
}
export const invBit = (n: number[], i: number): ReturnType<typeof setBit> =>
  setBit(n, i, !getBit(n, i))
export const and = (a: number[], b: number[]): number[] => {
  const n = []
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    n[i] = (a[i] || 0) & (b[i] || 0)
  }
  return normalize(n)
}

export const pieceLength = (n: number[]): number => {
  let l = 0
  for (let i = 0; i < BOARD_W * BOARD_W; i++) {
    l += getBit(n, i) ? 1 : 0
  }
  return l
}
