const CONTAINER_ID = 'chart-container'
const CHARTS = {
  month: 'month',
  year: 'year',
  alltime: 'alltime',
}

let currentChart
let data = []
const containerEl = document.getElementById(CONTAINER_ID)


function dayAndMonth(date) {
  const l = date.split('-')
  return `${l[2]}/${l[1]}`
}

function monthAndYear(date) {
  const l = date.split('-')
  return `${l[1]}/${l[0].slice(2, 4)}`
}


fetch('/clicks/stats/')
  .then(res => {
    if (!res.ok) throw new Error(res.status)
    return res.json()
  })
  .then(d => {
    data = [
      { date: '2019-04-01', n: 1, },
      { date: '2019-04-02', n: 31, },
      { date: '2019-04-03', n: 100, },
      { date: '2019-04-04', n: 1200, },
      { date: '2019-04-05', n: 200, },
      { date: '2019-06-06', n: 632, },
      { date: '2019-06-07', n: 300, },
      { date: '2019-06-08', n: 98, },
      { date: '2019-06-01', n: 1, },
      { date: '2019-07-02', n: 31, },
      { date: '2019-08-03', n: 100, },
      { date: '2019-09-04', n: 1200, },
      { date: '2019-10-05', n: 200, },
      { date: '2019-11-06', n: 632, },
      { date: '2019-12-07', n: 300, },
      { date: '2019-12-08', n: 98, },
      { date: '2020-04-01', n: 1, },
      { date: '2020-05-02', n: 31, },
      { date: '2020-06-03', n: 100, },
      { date: '2020-07-04', n: 1200, },
      { date: '2020-07-05', n: 200, },
      { date: '2020-07-06', n: 632, },
      { date: '2020-07-07', n: 300, },
      { date: '2020-08-08', n: 98, },
      { date: '2020-09-01', n: 1, },
      { date: '2020-09-02', n: 31, },
      { date: '2020-09-03', n: 100, },
      { date: '2020-09-04', n: 1200, },
      { date: '2020-09-05', n: 200, },
      { date: '2020-09-06', n: 632, },
      { date: '2020-09-07', n: 300, },
      { date: '2020-09-08', n: 98, },
    ]

    newChart(CHARTS.month)
  })
  .catch(console.log)


function newChart(type) {
  if (currentChart === type) return

  containerEl.replaceChildren()

  let config = {
    type: 'bar',
  }

  switch(type) {
    case CHARTS.month: {
      const len = data.length
      const d = data.slice(len - 30, len)

      Object.assign(config, {
        data: {
          labels: d.map(row => dayAndMonth(row.date)),
          datasets: [
            {
              label: 'Clicks per day',
              data: d.map(row => row.n),
            },
          ],
        },
      })

      break
    }

    case CHARTS.year: {
      const len = data.length
      const yearData = data.slice(len - 365, len)

      const d = []

      for (let i = 0; i < yearData.length; i++) {
        const last = d[d.length - 1]
        const newStamp = monthAndYear(yearData[i].date)

        if (
          d.length 
          && last.stamp === newStamp
        ) {
          last.n += yearData[i].n
        } else {
          d.push({
            n: yearData[i].n,
            stamp: monthAndYear(yearData[i].date),
          }) 
        } 
      }

      Object.assign(config, {
        data: {
          labels: d.map(row => row.stamp),
          datasets: [
            {
              label: 'Clicks per month',
              data: d.map(row => row.n),
            },
          ],
        },
      })

      break
    }

    // case CHARTS.alltime: {

    //   break
    // }

    default: throw new Error('Unknown chart')
  }

  currentChart = type
  
  const canvas = document.createElement('canvas')
  containerEl.appendChild(canvas)

  new Chart(canvas, config)
}
