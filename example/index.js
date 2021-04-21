const ms = require('ms')
const Stegolo = require('.')

const list = new Stegolo([{ name: 'william' }, { name: 'kristine' }], { limit: 2, interval: ms('1s'), runOnStart: true })

list.each(async (item, i) => {
  console.log(item, i)

  await new Promise(resolve => setInterval(resolve, 1000))
})

// list.many((items, i) => {
//   console.log(items, i)
// })

list.serialize(JSON.stringify)
list.deserialize(JSON.parse)

list.start()
