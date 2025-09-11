// constanst


const DEBUG = false

const SCORE_ID = 'score'
const BTN_ID = 'btn'
const BTN_COLOR_ID = 'btn-color'
const SHOP_BTN_TITLE_ID = 'shop-btn-title'
const SHOP_ID = 'shop-items'
const SPEAKER_ID = 'speaker'
const COLOR_WHEEL_ID = 'color-wheel'
const COLOR_WHEEL_SVG_ID = 'color-wheel-svg'

const COLOR_WHEEL_WIDTH = 150
const COLOR_WHEEL_HEIGHT = 150

const N_STARS = window.screen.availWidth < 700 ? 20 : 20
const STARS = []

const SHOP_BTN_TITLE_1 = 'Shop'
const SHOP_BTN_TITLE_2 = 'Back'

const PRESS_SOUNDS = {
  bruh: 'static/sound/bruh-1.mp3',
  explosion: 'static/sound/explosion-1.mp3',
  yeehaw: 'static/sound/yeehaw-1.mp3',
}

const MUSIC_BREAK = 5000  // ms
const MUSIC_TRACKS = [
  { 
    file: 'static/sound/music-1.mp3', 
    duration: 123 * 1000,
  },
  { 
    file: 'static/sound/music-2.mp3', 
    duration: 218 * 1000,
  },
  { 
    file: 'static/sound/music-3.mp3', 
    duration: 131 * 1000,
  },
  { 
    file: 'static/sound/music-4.mp3', 
    duration: 240 * 1000,
  },
]


// events


const PRESS_EVENTS = [
  {
    // name: 'basic',
    probability: null,
    sound: PRESS_SOUNDS.bruh,
    add: 1
  },
  {
    // name: 'unlucky',
    probability: 0.002,
    sound: PRESS_SOUNDS.explosion,
    add: -200,
  },
  {
    // name: 'lucky',
    probability: 0.001,
    sound: PRESS_SOUNDS.yeehaw,
    add: 100,
  },
]

const p = 
  1 - PRESS_EVENTS.slice(1).reduce((acc, cur) => acc + cur.probability, 0)

if (typeof p === 'undefined' || p === null || Number.isNaN(p) || p < 0) {
  throw new Error('Probabilities don`t sum up to one.')
}

PRESS_EVENTS[0].probability = p


// globals


let score = 0

let humanClicks = 0
let clicksSent = 0

let playPressSound = true
// let showEruda = false

const scoreEl = document.getElementById(SCORE_ID)
const btnEl = document.getElementById(BTN_ID)
const shopBtnTitleEl = document.getElementById(SHOP_BTN_TITLE_ID)
const shopEl = document.getElementById(SHOP_ID)
const speakerEl = document.getElementById(SPEAKER_ID)

scoreEl.innerText = score
shopBtnTitleEl.innerText = SHOP_BTN_TITLE_1


// helpers


class NotImplementedError extends Error {
  constructor() {
    super('Not Implemented')
    this.name = 'NotImplementedError'
  }
}

function updateScore(add) {
  score += add
  scoreEl.innerText = score 
  updateBuyBtns(ITEMS)
}

function randEvent(evs) {
  const val = Math.random()
  let compare = 0
  for (let i = 0; i < evs.length; i++) {
    compare += evs[i].probability
    if (val < compare) return evs[i] 
  }

  throw new Error('Should have returned.')
}

function randInt(max) {
  return Math.floor(Math.random() * max)
}

function updateItemHTML(item) {
  document.getElementById(item.levelId).innerText = item.level
  document.getElementById(item.priceId).innerText = item.price
  document.getElementById(item.textId).innerText = item.text
}

function btnId(id) {
  return `item-buy-btn-${id}`
} 

function priceId(id) {
  return `item-price-${id}`
} 

function levelId(id) {
  return `item-level-${id}`
} 

function textId(id) {
  return `item-text-${id}`
} 

function updateBuyBtns(items) {
  items.forEach(item => {
    document.getElementById(item.btnId)
      .disabled = !item.canBuy
  })
} 

function playRandTrack() {
  const t = MUSIC_TRACKS[randInt(MUSIC_TRACKS.length)]
  const audio = new Audio(t.file)
  audio.play()
  console.log(t)
  return t.duration
}

function trackTimeout(dur) {
  setTimeout(
    () => trackTimeout(playRandTrack()), 
    dur + MUSIC_BREAK,
  )
}


// items


class Item {
  constructor(id, name, img, textTemplate, levels) {
    this.id = id
    this.name = name
    this.img = img
    this._textTemplate = textTemplate
    this.levels = levels
    this.level = 1
    this.fullLevel = false
  }

  effect() {
    throw new NotImplementedError
  }

  get textVals() {
    return []
  }

  get text() {
    let txt = this._textTemplate
    this.textVals.forEach(val => txt = txt.replace('?', val))
    return txt
  }

  get canBuy() {
    // return true
    return !this.fullLevel && score >= this.price
  }

  get price() {
    if (this.fullLevel) return '-'
    if (DEBUG) return 20
    return this.levels[this.level-1].price
  }

  get levelStuff() {
    return this.levels[this.level - 1]
  }

  get priceId() {
    return priceId(this.id)
  }

  get btnId() {
    return btnId(this.id)
  }

  get levelId() {
    return levelId(this.id)
  }

  get textId() {
    return textId(this.id)
  }

  levelUp() {
    if (this.fullLevel) throw new Error('Full level')
    this.effect()
    if (this.levels.length === this.level) {
      this.fullLevel = true
    } else {
      this.level++
    }
  }
}

class AutoClicker extends Item {
  constructor(id) {
    super(
      'item-autoclicker',
      'Auto-Clicker', 
      '/static/img/auto-clicker.svg',
      'Auto-clicks the button once per five seconds.',
      [{ price: 1000 },
      { price: 2000 },
      { price: 5000 },
      { price: 10000 },
      { price: 50000 }]
    )
  }

  effect() {
    const hand = document.createElement('img')
    hand.src = '/static/img/auto-clicker.svg'
    hand.classList.add('autoclicker-hand')
    hand.style.left = `${this.level - 0.9}em`

    document.body.appendChild(hand)

    setInterval(() => {
      hand.classList.add('autoclicker-push-btn')

      setTimeout(onPressButton, 1000)

      setTimeout(() => {
        hand.classList.remove('autoclicker-push-btn')
      }, 2000)
    }, 5000)
  }
}

class ColorWheel extends Item {
  constructor(id) {
    super(
      'item-colorwheel',
      'Color Wheel', 
      '/static/img/color-wheel.svg',
      'Change color of the button.',
      [{ price: 1000 }],
    )
  }

  effect() {
    const canvas = document.getElementById(COLOR_WHEEL_ID)
    const ctx = canvas.getContext('2d')
    const svg = document.getElementById(COLOR_WHEEL_SVG_ID)

    ctx.drawImage(
      svg, 
      0, 
      0, 
      COLOR_WHEEL_HEIGHT,
      COLOR_WHEEL_WIDTH,
    )
    canvas.style.display = 'block'

    canvas.addEventListener('click', onPressColorWheel)
  }
}

class Bananas extends Item {
  static get DURATION() {
    return 10000
  }

  static get CSS_SIZE() {
    return '7em'
  }

  constructor(id) {
    super(
      'item-bananas',
      'Bananas', 
      '/static/img/bananas.svg',
      'Gets you fresh bananas.',
      [{ price: 10000 },
      { price: 50000 },
      { price: 100000 }],
    )

    // you can press bananas once
    this.pressed = new Set()
  }

  effect() {
    const bananas = document.createElement('img')
    bananas.src = '/static/img/bananas.svg'
    bananas.classList.add('bananas')

    bananas.addEventListener('click', (ev) => {
      if (this.pressed.has(this.level)) return
      this.pressed.add(this.level) 
      updateScore(this.level * 100)
      new Audio(PRESS_SOUNDS.yeehaw).play()
    })

    document.body.appendChild(bananas)

    setInterval(() => {
      let frames
      const val1 = randInt(101)
      const val2 = randInt(101)

      const dir = randInt(4)
      switch(dir) {
        case 0: {
          frames = [
            {
              top: `${val1}%`,
              left: `-${Bananas.CSS_SIZE}`,
            },
            {
              top: `${val2}%`,
              left: `calc(100% + ${Bananas.CSS_SIZE})`,
            },
          ]
          break;
        }
        case 1: {
          frames = [
            {
              left: `${val1}%`,
              top: `-${Bananas.CSS_SIZE}`,
            },
            {
              left: `${val2}%`,
              top: `calc(100% + ${Bananas.CSS_SIZE})`,
            },
          ]
          break;
        }
        case 2: {
          frames = [
            {
              top: `${val1}%`,
              right:  `-${Bananas.CSS_SIZE}`,
            },
            {
              top: `${val2}%`,
              right: `calc(100% + ${Bananas.CSS_SIZE})`,
            },
          ]
          break;
        }
        case 3: {
          frames = [
            {
              left: `${val1}%`,
              bottom: `-${Bananas.CSS_SIZE}`,
            },
            {
              left: `${val2}%`,
              bottom: `calc(100% + ${Bananas.CSS_SIZE})`,
            },
          ]
          break;
        }
        default: throw new Error(dir)
      }

      bananas.style.display = 'block'
      bananas.animate(frames, {
        duration: Bananas.DURATION,
        iterations: 1,
      })

      setTimeout(
        () => {
          bananas.style.display = 'none'
          this.pressed.delete(this.level)
        },
        Bananas.DURATION - 100,
      )
    }, 3000)
  }
}
const ITEMS = [
  new AutoClicker(),
  new ColorWheel(),
  new Bananas(),
]

// items to the shop

ITEMS.forEach(item => {
  const div = document.createElement('div')
  div.classList.add('shop-item')
  div.id = item.id

  if (!div.id) throw new Error('Id missing.')

  div.innerHTML = `
<h2 class="shop-item-title">${item.name}</h2>
<h3 class="shop-item-level">Level 
  <span id="${item.levelId}">${item.level}</span>
</h3>
<br>
<img class="shop-item-img" src="${item.img}" alt="">
<p id="${item.textId}" class="shop-item-text">${item.text}</p>
<h3 class="shop-item-price">Price
  <span id="${item.priceId}">${item.price}</span>
</h3>
  `

  const btn = document.createElement('button')
  btn.id = item.btnId
  btn.classList.add('shop-item-btn')
  btn.onclick = () => onPressBuyItem(item)
  btn.disabled = true
  btn.innerHTML = '<b>Buy</b>'
  div.appendChild(btn)

  document.getElementById('shop-items').appendChild(div)
})


// click statistics


setInterval(() => {
  if (humanClicks === clicksSent) return

  const n = humanClicks - clicksSent
  const data = new FormData
  data.append('n', n)

  fetch('/clicks/', { 
    method: 'POST',
    body: data,
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status)
      clicksSent += n 
    })
    .catch(console.log)
}, 30000)


// spawn stars


for (let i = 0; i < N_STARS; i++) {
  const div = document.createElement('div')
  div.classList.add('star')

  const color = randInt(2) ? 'blue-star-color' : 'pink-star-color'
  div.classList.add(color)

  // x-axis
  div.style.left = `${randInt(111) - 5}%`

  if (randInt(2)) div.style.animationName = 'falling-and-rotating-ccw'

  STARS.push(div)

  setTimeout(() => document.body.appendChild(div), randInt(20000))
}


// music


trackTimeout(playRandTrack())


// press handlers


function onPressShopBtn() {
  const d = shopEl.style.display
  switch(d) {
    case 'none': {
      shopEl.style.display = 'grid'    
      shopBtnTitleEl.innerText = SHOP_BTN_TITLE_2
      break
    }

    case '': {
      shopEl.style.display = 'grid'    
      shopBtnTitleEl.innerText = SHOP_BTN_TITLE_1
      break
    }

    case 'grid': {
      shopEl.style.display = 'none'    
      shopBtnTitleEl.innerText = SHOP_BTN_TITLE_1
      break
    }

    default: throw new Error(
      `Unexpected display style '${d}'`
    )
  }
}

function onPressButton(human) {
  if (human) humanClicks += 1

  const ev = randEvent(PRESS_EVENTS)

  // mute only basic sound
  if (ev.add !== 1 || playPressSound) {
    new Audio(ev.sound).play()
  }

  updateScore(ev.add)

  btnEl.animate([
    { top: '55%', offset: 0.5 },
  ], {
    duration: 200,
    iterations: 1,
  })
}

function onPressBuyItem(item) {
  if (!item.canBuy) throw new Error('Cannot buy item!')
  const price = item.price
  item.levelUp()
  updateScore(-1 * price)
  updateItemHTML(item)
}

function onPressColorWheel(ev) {
  const canvas = document.getElementById(COLOR_WHEEL_ID)
  const ctx = canvas.getContext('2d')
  const data = ctx.getImageData(
    0, 
    0, 
    COLOR_WHEEL_HEIGHT,
    COLOR_WHEEL_WIDTH,
  ).data

  const x = ev.clientX
  const y = Math.floor(ev.clientY - canvas.getBoundingClientRect().y)

  const i = 4 * (y * COLOR_WHEEL_HEIGHT + x)

  const red = data[i]
  const green = data[i + 1]
  const blue = data[i + 2]

  const div = document.getElementById(BTN_COLOR_ID)
  div.style.setProperty(
    'background-color', 
    `rgba(${red}, ${green}, ${blue})`
  )
}

function onPressSpeaker() {
  playPressSound = !playPressSound

  if (playPressSound) {
    speakerEl.classList.remove('speaker-mute')
  } else {
    speakerEl.classList.add('speaker-mute')
  }
}
