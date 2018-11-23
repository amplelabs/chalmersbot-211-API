require('dotenv').config()
const fs = require('fs');
const common = require('../lib/common')

console.log('2-1-1 trial api testing')
async function main () {
  try {
    const topics = await common.listTopic().catch(err => console.error(err))
    const fullList = await Promise.all(topics.map(async (x) => {
      const subTopics = await common.listTopic(x).catch(err => ({[x]:['n/a']}))
      return {
        [x]: subTopics
      }
      // console.log(subTopics)
    }))
    const json = JSON.stringify({list: fullList})
    fs.writeFile("topics.json", json, function(err) {
      if (err) {
          console.log(err);
      }
  });
  } catch (e) {
    console.error(e)
  }
}

main()
