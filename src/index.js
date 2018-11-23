// just a play test file for now
require('dotenv').config()
const common = require('../lib/common')

console.log('2-1-1 trial api testing')

/*
axios.get(process.env.TRIAL_API_URL)
  .then((resp) => {
    console.log(resp)
  })
  .catch(err => console.error(err))
*/

common.listTopic()
  .then(resp => console.log(resp))
  .catch(err => console.error(err))
