const Stegolo = require('..')

function createStegolo() {
  return new Stegolo([1, 2, 3], { limit: 2, interval: '5s' })
}

test('options should be parsed', () => {
  const stegolo = createStegolo()

  expect(stegolo.limitAmt).toBe(2)
  expect(stegolo.intervalMs).toBe(1000 * 5)
})

test('multiple callbacks can\'t be defined', () => {
  const stegolo = createStegolo()

  stegolo.each(() => {})
  expect(() => {
    stegolo.many(() => {})
  }).toThrow()
})
