const CANVAS_ID = 'chart'

fetch('/clicks/stats/')
  .then(res => {
    if (!res.ok) throw new Error(res.status)
    return res.json()
  })
  .then(data => new Chart(
    document.getElementById(CANVAS_ID),
    {
      type: 'bar',
      labels: data.map(row => row.date),
      datasets: [
        {
          label: 'Clicks per day',
          data: data.map(row => row.n),
        },
      ],
    },
  ))
  .catch(console.log)
