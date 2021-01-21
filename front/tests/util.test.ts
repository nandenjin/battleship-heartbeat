import {
  and,
  getBit,
  invBit,
  isEmpty,
  isEqual,
  normalize,
  ntos,
  pieceLength,
  setBit,
  ston,
} from '../src/util'

describe('normalize()', () => {
  it('Trims zero values', () => {
    expect(normalize([0, 0, 0])).toMatchObject([])
    expect(normalize([1, 0])).toMatchObject([1])
  })

  it('Not modifies nomalized values', () => {
    expect(normalize([0, 0, 1])).toMatchObject([0, 0, 1])
    expect(normalize([2, 3, 4])).toMatchObject([2, 3, 4])
  })
})

describe('ntos()', () => {
  it('Returns correct value', () => expect(ntos([0, 0, 10])).toBe('0.0.10'))
  it('Returns empty string for empty array', () => expect(ntos([])).toBe(''))
})

describe('ston()', () => {
  it('Returns correct value', () =>
    expect(ston('0.0.10')).toMatchObject([0, 0, 10]))
  it('Returns empty array for empty string', () =>
    expect(ston('')).toMatchObject([]))
})

describe('isEmpty()', () => {
  it('Returns true for empty array', () => expect(isEmpty([])).toBe(true))
  it('Returns true for array of zero', () =>
    expect(isEmpty([0, 0, 0])).toBe(true))
  it('Returns false for non-empty array', () =>
    expect(isEmpty([0, 10])).toBe(false))
})

describe('isEqual()', () => {
  it('Returns true for equal array', () => {
    expect(isEqual([], [])).toBe(true)
    expect(isEqual([10], [10])).toBe(true)
  })
  it('Returns true for zero array', () => expect(isEqual([0], [])).toBe(true))
  it('Returns false for non-equal array', () => {
    expect(isEqual([0, 1], [1, 1])).toBe(false)
    expect(isEqual([1, 0], [1, 1])).toBe(false)
  })
})

describe('getBit()', () => {
  it('Returns correct value', () => {
    expect(getBit([], 0)).toBe(false)
    expect(getBit([1], 0)).toBe(true)
    expect(getBit([1024], 10)).toBe(true)
    expect(getBit([0, 2], 33)).toBe(true)
    expect(getBit([0, 1], 33)).toBe(false)
  })
})

describe('setBit()', () => {
  it('Returns correct value', () => {
    expect(setBit([], 0, 1)).toMatchObject([1])
    expect(setBit([1], 0, 0)).toMatchObject([])
    expect(setBit([], 10, 1)).toMatchObject([1024])
    expect(setBit([], 32, 1)).toMatchObject([0, 1])
  })
})

describe('invBit()', () => {
  it('Returns correct value', () => {
    expect(invBit([], 0)).toMatchObject([1])
    expect(invBit([1], 0)).toMatchObject([])
    expect(invBit([], 10)).toMatchObject([1024])
    expect(invBit([], 32)).toMatchObject([0, 1])
  })
})

describe('and()', () => {
  it('Returns correct value', () => {
    expect(and([], [])).toMatchObject([])
    expect(and([1], [])).toMatchObject([])
    expect(and([], [1024])).toMatchObject([])
    expect(and([1, 1024], [1025, 1024])).toMatchObject([1, 1024])
  })
})

describe('pieceLength()', () => {
  it('Returns correct value', () => {
    expect(pieceLength([])).toBe(0)
    expect(pieceLength([1])).toBe(1)
    expect(pieceLength([1024])).toBe(1)
    expect(pieceLength([1025])).toBe(2)
    expect(pieceLength([1024, 1])).toBe(2)
  })
})
