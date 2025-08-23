let lastEvent = null

document.getElementById('score-rect').addEventListener('dblclick', () => {
  if (!eruda) {
    console.log('Eruda not found.')
    return
  }

  const now = new Date

  // two second cooldown 
  if (lastEvent) {
    const diff = now.valueOf() - lastEvent.valueOf()  // ms
    if (diff < 2000) {
      console.log('Too soon')
      return
    }
  }

  lastEvent = now

  console.log('Toggle eruda')

  if (showEruda) {
    eruda.destroy()
    showEruda = false
  } else {
    eruda.init()
    showEruda = true
  }
})
