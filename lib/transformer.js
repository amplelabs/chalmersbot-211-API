//
// For transformation json returned from external provider to Chalmers' format
//
//////////////////////////////////////////////////////////////////////////////////////////////////

var ServiceEnum = {
  Meal: 1,
  Shelter: 2,
  Clothing: 3,
};

function MealTransformer(jsonFromProvider) {
  const chalmersJson = jsonFromProvider
  return chalmersJson
}

function TransformerFactory(service) {
  switch (type) {
    case ServiceEnum.Meal:
      return MealTransformer
    default:
      throw new Error('Service not supported!')
  }
}

//
//
//////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
  ServiceEnum,
  TransformerFactory
}
