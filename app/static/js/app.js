// constanst


const SCORE_ID = 'score'
const BTN_ID = 'btn'
const SHOP_BTN_ID = 'shop-btn'

const N_STARS = 100
const STARS = []

const PRESS_SOUNDS = {
  bruh: 'static/sound/bruh-1.mp3',
  explosion: 'static/sound/explosion-1.mp3',
  yeehaw: 'static/sound/yeehaw-1.mp3',
}


// events


const PRESS_EVENTS = [
  {
    name: 'basic',
    probability: null,
    sound: PRESS_SOUNDS.bruh,
    add: 1
  },
  {
    name: 'unlucky',
    probability: 0.005,
    sound: PRESS_SOUNDS.explosion,
    add: -50,
  },
  {
    name: 'lucky',
    probability: 0.01,
    sound: PRESS_SOUNDS.yeehaw,
    add: 100,
  },
]

PRESS_EVENTS[0].probability = 
  1 - Math.sumPrecise(PRESS_EVENTS.slice(1).map(ev => ev.probability))

if (PRESS_EVENTS[0].probability < 0) {
  throw new Error('Probabilities don`t sum up to one.')
}


// globals


let score = 0

let clicks = 0
let clicksSent = 0

let showEruda = false

const scoreEl = document.getElementById(SCORE_ID)
const btnEl = document.getElementById(BTN_ID)

scoreEl.innerText = score


// helpers


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


function onPressShop() {

}


function onPressButton() {
  btnEl.classList.add('push-btn')
  setTimeout(() => btnEl.classList.remove('push-btn'), 200)

  clicks += 1

  const ev = randEvent(PRESS_EVENTS)

  const audio = new Audio(ev.sound)
  audio.currentTime = 0
  audio.play()

  score += ev.add
  scoreEl.innerText = score 
}
