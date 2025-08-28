// constanst


const SCORE_ID = 'score'
const BTN_ID = 'btn'
const SHOP_BTN_TITLE_ID = 'shop-btn-title'
const GAME_ID = 'game'
const SHOP_ID = 'shop'

const N_STARS = window.screen.availWidth < 700 ? 25 : 25
const STARS = []

const SHOP_BTN_TITLE_1 = 'Shop'
const SHOP_BTN_TITLE_2 = 'Back'

const ITEM_IDS = Object.freeze({
  autoclicker: 'item-autoclicker',
})

const GAME_VIEWS = Object.freeze({
  GAME: 'GAME',
  SHOP: 'SHOP',
})

const PRESS_SOUNDS = {
  bruh: 'static/sound/bruh-1.mp3',
  explosion: 'static/sound/explosion-1.mp3',
  yeehaw: 'static/sound/yeehaw-1.mp3',
}


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
    probability: 0.005,
    sound: PRESS_SOUNDS.explosion,
    add: -50,
  },
  {
    // name: 'lucky',
    probability: 0.01,
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

let clicks = 0
let clicksSent = 0

let showEruda = false

let view = GAME_VIEWS.GAME

const scoreEl = document.getElementById(SCORE_ID)
const btnEl = document.getElementById(BTN_ID)
const shopBtnTitleEl = document.getElementById(SHOP_BTN_TITLE_ID)
const gameEl = document.getElementById(GAME_ID)
const shopEl = document.getElementById(SHOP_ID)

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

function updateBuyBtn(item) {
  document.getElementById(item.btnId)
    .disabled = !item.canBuy
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
  }

  effect() {
    throw new NotImplementedError
  }

  removeEffect() {
    throw new NotImplementedError
  }

  get textVals() {
    throw new NotImplementedError
  }

  get text() {
    let txt = this._textTemplate
    this.textVals.forEach(val => txt = txt.replace('?', val))
    return txt
  }

  get canBuy() {
    return true
    // return !this.isFullLevel && score >= this.price
  }

  get price() {
    if (this.isFullLevel) return '-'
    return this.levels[this.level-1].price
  }

  get isFullLevel() {
    return this.levels.length === this.level
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
    if (this.isFullLevel) throw new Error('Full level')
    this.removeEffect()
    this.effect()
    this.level++
  }
}

class AutoClicker extends Item {
  constructor(id) {
    super(
      id,
      'Auto Clicker', 
      '/static/img/button.png',
      'Auto-clicks the button ? times per second.',
      [{ eff: 5000, price: 1000 },
      { eff: 4000, price: 2000 },
      { eff: 2500, price: 4000 },
      { eff: 2000, price: 8000 },
      { eff: 1000, price: 16000 },
      { eff: 900, price: 32000 },
      { eff: 800, price: 64000 },
      { eff: 700, price: 128000 },
      { eff: 600, price: 256000 },
      { eff: 500, price: 512000 }]
    )

    this.interval = null
  }

  effect() {
    this.interval = 
      setInterval(onPressButton, this.levelStuff.eff)
  }

  removeEffect() {
    clearInterval(this.interval)  
  }

  get textVals() {
    const val = (1000 / this.levelStuff.eff).toFixed(1)
    return [val]
  }
}

const ITEMS = [
  new AutoClicker(1),
  new AutoClicker(2),
]

// items to the shop

ITEMS.forEach(item => {
  const div = document.createElement('div')
  div.classList.add('shop-item')
  div.id = item.id

  if (!div.id) throw new Error('Id missing.')

  div.innerHTML = `
<h2>${item.name}</h2>
<h3>Level 
  <span id="${item.levelId}">${item.level}</span>
</h3>
<br>
<img src="${item.img}" alt="">
<p id="${item.textId}">${item.text}</p>
<h3>Price
  <span id="${item.priceId}">${item.price}</span>
</h3>
  `

  const btn = document.createElement('button')
  btn.id = item.btnId
  btn.onclick = () => onPressBuyItem(item)
  btn.disabled = !item.canBuy
  btn.innerHTML = '<b>Buy</b>'
  div.appendChild(btn)

  document.getElementById('shop-items').appendChild(div)
})


// click statistics


setInterval(() => {
  if (clicks === clicksSent) return

  const n = clicks - clicksSent
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


// press handlers


function onPressShopBtn() {
  switch(view) {
    case GAME_VIEWS.GAME: {
      view = GAME_VIEWS.SHOP
      gameEl.style.display = 'none'    
      shopEl.style.display = 'block'    
      shopBtnTitleEl.innerText = SHOP_BTN_TITLE_2
      break
    }

    case GAME_VIEWS.SHOP: {
      view = GAME_VIEWS.GAME
      shopEl.style.display = 'none'    
      gameEl.style.display = 'block'    
      shopBtnTitleEl.innerText = SHOP_BTN_TITLE_1
      break
    }

    default: throw new Error('Unexpected game view.')
  }
}


function onPressButton() {
  btnEl.classList.add('push-btn')
  setTimeout(() => btnEl.classList.remove('push-btn'), 200)

  clicks += 1

  const ev = randEvent(PRESS_EVENTS)

  const audio = new Audio(ev.sound)
  audio.currentTime = 0
  audio.play()

  updateScore(ev.add)

  ITEMS.forEach(updateBuyBtn)
}

function onPressBuyItem(item) {
  if (!item.canBuy) throw new Error('Cannot buy item!')
  updateScore(-1*item.price)
  item.levelUp()
  updateItemHTML(item)
}
