const moment = require('moment-timezone')
const mealInfoFile = require('../data/meal.json')
const Meal = require('./meal')

module.exports = {
  meals: (mealInfo = mealInfoFile) => {
    // const pred = new Eligibility(eligibility)
    const concat = (x, y) => x.concat(y)
    const flatMap = (xs, f) => xs.map(f).reduce(concat, [])
    return flatMap(mealInfo, (orgInfo) => Meal.fromJson(orgInfo)) // .filter(pred.all())
  }
}
