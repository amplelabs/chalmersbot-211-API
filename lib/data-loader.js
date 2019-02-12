const Meal = require('./meal')

exports.loadMeal = (json) => {
  const concat = (x, y) => x.concat(y)
  const flatMap = (xs, f) => xs.map(f).reduce(concat, [])
  return flatMap(json, (orgInfo) => Meal.fromJson(orgInfo))
}
