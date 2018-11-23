require('dotenv').config()
const axios = require('axios')

function sum (a, b) {
  return a + b
}

const listTopic = () => {
  return new Promise((resolve, reject) => {
    axios.get(process.env.TRIAL_API_URL)
      .then((resp) => {
        if (Number(resp.status) === 200) {
          const topic = resp.data.map(x => x.name)
          resolve(topic)
        }
        reject(new Error(`Error code: ${resp.status}`))
      })
      .catch(err => reject(err))
  })
}

module.exports = {
  sum,
  listTopic
}
