# Stegolo
forEach, but staggered

## Installation
You already know bro

## Usage
```js
import Stegolo from 'stegolo'

const stegolo = new Stegolo([1, 2, 3], { limit: 2, interval: '1h' })

stegolo.many(items => {
  // hour 0, items = [1, 2]
  // hour 1, items = [3]
})

stegolo.start()
```

## Licence
Steal this shit I don't care
