const CONTAINER_ID = 'chart-container'
const CHARTS = {
  month: 'month',
  year: 'year',
  alltime: 'alltime',
}

const dayMs = 1000 * 60 * 60 * 24

let currentChart
let data = []
const containerEl = document.getElementById(CONTAINER_ID)


function isSameDay(d1, d2) {
  return (
    d1.getDate() === d2.getDate()
    && d1.getMonth() === d2.getMonth()
    && d1.getFullYear() === d2.getFullYear()
  ) 
}
  

function dayAndMonth(date) {
  return `${date.getDate()}/${date.getMonth() + 1}`
}


function monthAndYear(date) {
  const m = date.getMonth() + 1
  const y = String(date.getFullYear()).slice(2, 4)
  return `${m}/${y}`
}


function aggByMonth(data) {
  const d = []

  for (let i = 0; i < data.length; i++) {
    const last = d[d.length - 1]
    const newStamp = monthAndYear(data[i].date)

    if (
      d.length 
      && last.stamp === newStamp
    ) {
      last.n += data[i].n
    } else {
      d.push({
        n: data[i].n,
        stamp: monthAndYear(data[i].date),
      }) 
    } 
  }

  return d
}

function addMissingDays(rows) {
  const now = new Date
  const res = [rows[0]]
  let idx = 1

  while(!isSameDay(now, res[res.length - 1].date)) {
    const lastPlusOne = new Date(
      res[res.length - 1].date.valueOf() + dayMs
    )

    if (idx === rows.length) {
      res.push({ date: lastPlusOne, n: 0 })
      continue
    }

    if (isSameDay(rows[idx].date, lastPlusOne)) {
      res.push(rows[idx++])
    } else {
      res.push({ date: lastPlusOne, n: 0 })
    }
  }

  return res
}


fetch('/clicks/stats/')
  .then(res => {
    if (!res.ok) throw new Error(res.status)
    return res.json()
  })
  .then(d => {
    // d = [
    //   { date: '2022-08-08', n: 38, },
    //   { date: '2022-08-09', n: 98, },
    //   { date: '2022-09-10', n: 20, },
    //   { date: '2022-09-11', n: 84, },
    //   { date: '2022-10-12', n: 37, },
    //   { date: '2022-10-13', n: 16, },
    //   { date: '2024-08-15', n: 28, },
    //   { date: '2024-08-16', n: 78, },
    //   { date: '2024-08-17', n: 28, },
    //   { date: '2024-09-08', n: 18, },
    //   { date: '2024-09-09', n: 78, },
    //   { date: '2024-10-10', n: 48, },
    //   { date: '2024-10-11', n: 28, },
    //   { date: '2024-11-12', n: 92, },
    //   { date: '2024-12-13', n: 94, },
    //   { date: '2025-03-08', n: 97, },
    //   { date: '2025-03-10', n: 91, },
    //   { date: '2025-03-11', n: 48, },
    //   { date: '2025-04-12', n: 28, },
    //   { date: '2025-06-15', n: 0, },
    //   { date: '2025-08-16', n: 0, },
    //   { date: '2025-08-17', n: 0, },
    //   { date: '2025-09-08', n: 28, },
    //   { date: '2025-09-09', n: 18, },
    //   { date: '2025-09-10', n: 8, },
    //   { date: '2025-09-11', n: 0, },
    //   { date: '2025-09-13', n: 10, },
    // ]
    d = d.map(row => ({
      n: row.n,
      date: new Date(row.date),
    }))

    data = addMissingDays(d)

    newChart(CHARTS.month)
  })
  .catch(console.log)


function newChart(type) {
  if (currentChart === type) return

  containerEl.replaceChildren()

  let config = {
    type: 'bar',
  }

  const now = new Date

  switch(type) {
    case CHARTS.month: {
      const d = data.filter(
        row => now - row.date < dayMs * 30
      )

      if (d.length > 30) throw new Error(d.length)

      Object.assign(config, {
        data: {
          labels: d.map(row => dayAndMonth(row.date)),
          datasets: [
            {
              label: 'Clicks per day, one month',
              data: d.map(row => row.n),
            },
          ],
        },
      })

      break
    }

    case CHARTS.year: {
      let d = data.filter(
        row => now - row.date < dayMs * 365
      )

      if (d.length > 365) throw new Error(d.length)

      d = aggByMonth(d)

      Object.assign(config, {
        data: {
          labels: d.map(row => row.stamp),
          datasets: [
            {
              label: 'Clicks per month, one year',
              data: d.map(row => row.n),
            },
          ],
        },
      })

      break
    }

    case CHARTS.alltime: {
      const d = aggByMonth(data)

      Object.assign(config, {
        data: {
          labels: d.map(row => row.stamp),
          datasets: [
            {
              label: 'Clicks per month, all-time',
              data: d.map(row => row.n),
            },
          ],
        },
      })

      break
    }

    default: throw new Error('Unknown chart')
  }

  currentChart = type
  
  const canvas = document.createElement('canvas')
  containerEl.appendChild(canvas)

  new Chart(canvas, config)
}
