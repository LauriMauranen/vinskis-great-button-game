const scoreId = 'score'
const btnId = 'btn'

const btnSrc = "https://m.media-amazon.com/images/I/51AaftUj5KL._AC_SL1000_.jpg" 

const p = document.getElementById(scoreId)
const btn = document.getElementById(btnId)

let clicks = 0
let clicksSent = 0


const pressSounds = [
  'static/sound/bruh-1.mp3',
  'static/sound/explosion-1.mp3',
  'static/sound/yeehaw-1.mp3',
]

p.innerText = 0


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
      return res.json()
    })
    .then((data) => {
      clicksSent += n 
    })
    .catch(console.log)
}, 30000)


function onPress() {
  btn.src = "https://thumbs.dreamstime.com/z/red-button-isolated-white-background-pressed-d-illustration-red-button-isolated-white-background-270798034.jpg?ct=jpeg" 

  const minus = Math.random() < 0.01 
  const plus = Math.random() < 0.01 

  clicks += 1

  let audio

  if (plus) {
    audio = new Audio(pressSounds[2])
  } else if (minus) {
    audio = new Audio(pressSounds[1])
  } else {
    audio = new Audio(pressSounds[0])
  }

  audio.currentTime = 0
  audio.play()

  setTimeout(() => btn.src = btnSrc, 300)

  p.innerText = Number(p.innerText) + 1 + plus * 99 - (!plus && minus) * 51
}
