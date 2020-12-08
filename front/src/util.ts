export const ntos = (n: number[]): string => n.join('.')
export const ston = (s: string): number[] => s.split('.').map(p => +p)
export const isEmpty = (n: number[]): boolean => n.every(p => p === 0)
export const isEqual = (a: number[], b: number[]): boolean =>
  ntos(a) === ntos(b)
export const getBit = (n: number[], i: number): boolean =>
  ((n[Math.floor(i / 32)] || 0) >>> i % 32) % 2 === 1
export const setBit = (
  n: number[],
  i: number,
  v: boolean | number
): number[] => {
  const nn = n.map(p => p)
  nn[Math.floor(i / 32)] =
    (n[Math.floor(i / 32)] || 0) & (0xffffffff - (0b1 << i % 32))
  nn[Math.floor(i / 32)] += (v ? 0b1 : 0b0) << i % 32
  return nn
}
export const invBit = (n: number[], i: number): ReturnType<typeof setBit> =>
  setBit(n, i, !getBit(n, i))
