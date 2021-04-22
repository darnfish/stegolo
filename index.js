const fs = require('fs')
const ms = require('ms')

module.exports = class Stegolo {
  constructor(items, options) {
    this.items = items

    if(!options)
      throw new Error('No options found, please provide them in the second arg of the Stegolo constructor')

    if(!options.limit || options.limit <= 0)
      throw new Error('No limit found, please provide a positive integer above zero')

    if(!options.interval)
      throw new Error('No interval found, please provide a ms integer or string (e.g. 1h)')

    this.options = options

    this.run = 0
  }

  // User funcs
  each(fn) {
    if(this.manyFn)
      throw new Error('You can\'t supply multiple callbacks. Please remove your .many call')

    this.eachFn = fn
  }

  many(fn) {
    if(this.eachFn)
      throw new Error('You can\'t supply multiple callbacks. Please remove your .each call')

    this.manyFn = fn
  }

  serialize(fn) {
    this.serializeFn = fn
  }

  deserialize(fn) {
    this.deserializeFn = fn
  }

  // User funcs + logic
  async start() {
    if(this.saveEnabled && (!this.serialize || !this.deserialize))
      console.warn('Save is enabled, but no serialize or deserialize callbacks were set. To surpress this warning, pass save: false into your constructor config')

    this.items = this.removeUsedItems(this.items)

    if(this.items.length === 0)
      return

    if(this.runOnStart)
      await this.onInterval()

    if(this.items.length > 0)
      this.interval = setInterval(() => this.onInterval(), this.intervalMs)
  }

  // Internal funcs
  load(deserialize = true) {
    let items = []
    if(fs.existsSync(this.filename)) {
      const rawItems = fs.readFileSync(this.filename, 'utf8')
      const parsedItems = JSON.parse(rawItems)

      items = parsedItems
    }

    if(deserialize && this.deserializeFn)
      items = items.map(this.deserializeFn)

    return items
  }

  save(items) {
    // Serialize the items
    if(this.serializeFn)
      items = items.map(this.serializeFn)

    // Load the old items and add the new items
    const savedItems = this.load(false)
    savedItems.push(...items)

    // Save that shit
    fs.writeFileSync(this.filename, JSON.stringify(savedItems), 'utf8')
  }

  removeUsedItems(items) {
    const oldItems = this.load(!this.deserializeFn)

    items = items.filter(item => {
      if(this.serializeFn)
        return !oldItems.includes(this.serializeFn(item))

      return !oldItems.includes(item)
    })

    return items
  }

  async onInterval() {
    // Get the next items from the items array
    const nextItems = this.items.splice(0, this.limitAmt)

    switch(this.method) {
    case 'each':
      // For each item
      for(let i = 0; i < nextItems.length; i++) {
        // Run the individual item + await
        await this.eachFn(nextItems[i], i)

        // Save the current item
        this.save([nextItems[i]])
      }

      break
    case 'many':
      // Run items in the manyFn
      await this.manyFn(nextItems, this.run)

      // Save all the items
      this.save(nextItems)

      break
    }

    // Increase run count
    this.run += 1

    // Delete interval if there are no more items
    if(this.items.length === 0)
      clearInterval(this.interval)
  }

  get limitAmt() {
    return this.options.limit
  }

  get intervalMs() {
    if(typeof this.options.interval === 'string')
      return ms(this.options.interval)

    return this.options.interval
  }

  // Options
  get method() {
    if(this.eachFn)
      return 'each'

    return 'many'
  }

  get filename() {
    return './stegolo.json'
  }

  get runOnStart() {
    return typeof this.options.runOnStart === 'undefined' || this.options.runOnStart
  }

  get saveEnabled() {
    return typeof this.options.save === 'undefined' || this.options.save
  }
}
