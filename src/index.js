require('dotenv').config()
const fs = require('fs')
const common = require('../lib/external')

// TODO: put an express server here

console.log('2-1-1 trial api testing')
async function listAllTopics () {
  console.log('Get all topics and subtopics from 2-1-1 API.')
  try {
    const topics = await common.listTopic().catch(err => console.error(err))
    const fullList = await Promise.all(topics.map(async (x) => {
      const subTopics = await common.listTopic(x).catch(() => ({ [x]: ['n/a'] }))
      return {
        [x]: subTopics
      }
      // console.log(subTopics)
    }))
    const json = JSON.stringify({ list: fullList })
    /*
    fs.writeFile('topics.json', json, function (err) {
      if (err) {
        console.log(err)
      }
    })
    */
    console.log(json)
  } catch (e) {
    console.error(e)
  }
}

async function searchMeals () {
  const param = {
    term: '',
    locationText: 'Toronto',
    latitude: 45.1510532655634,
    longitude: -79.398193359375,
    maxDistanceInKilometers: 10.5,
    requireWheelchairAccess: false
  }
  const results = await common.searchMeals(param)
    .catch(err => console.error(err.code)) // log the whole err
  // console.log(results)
  const json = JSON.stringify(results)
  fs.writeFile('meal211Toronto.json', json, function (err) {
    if (err) {
      console.log(err)
    }
  })
  console.log('saved!')
}

async function getResourceInfo() {
  const result = await common.getResourceInfo('34388-2')
    .catch(err => console.error(err.code))
  console.log(result)
}

// const main = listAllTopics
// const main = searchMeals
const main = getResourceInfo
main()
