require('dotenv').config()
const axios = require('axios')

function sum (a, b) {
  return a + b
}

const listTopic = (subTopic = null) => {
  // Ref: https://api211.azure-api.net/free/freeapi/v1/Topics/en
  const url = subTopic === null
    ? process.env.TRIAL_API_URL : `${process.env.TRIAL_API_URL}\\${subTopic}`
  return new Promise((resolve, reject) => {
    axios.get(url)
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
