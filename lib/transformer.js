//
// For transformation json returned from external provider to Chalmers' format
//
//////////////////////////////////////////////////////////////////////////////////////////////////

var ServiceEnum = {
  Meal: 1,
  Shelter: 2,
  Clothing: 3,
};

/*
  Expected json format for meal skill
  {
    "address": String,
    "organizationName": String,
    "program": String,
    "phone_number": String,
    "latitude": Number,
    "longitude": Number,
    "meals": [Meals]
  }
  
  Meals:
  {
    "startTime": TIME FORMAT STRING HH:MM Military Time,
    "endTime": TIME FORMAT STRING HH:MM Military Time,
    "dayOfWeek": [...Set("Mon","Tue","Wed","Thu","Fri","Sat","Sun")],
    "type": "Breakfast|Lunch|Dinner|Snack",
    "notes": String,
    "gender": "male|female|mix",
    "age": [lowerBound, upperBound],
    "race": [RACES]
  }

  2-1-1 json (after processed)
  { 
    resourceID: '34411-2',
    resourceName: 'Out of the Cold. Overnight Shelters - Tuesday Overnight Hostel, January to March - Beth Sholom Synagogue',
    resourceDescription: 'Capacity 60 * supper and breakfast available to both those staying overnight and to members of the public',
    operationHours: 'January 1, 2019 to March 19, 2019 -- Tue 5:15 pm-7 am',
    serviceArea: ' Toronto',
    languages: [ 'English' ],
    ageBand: { lowerBoundAge: 0, upperBoundAge: 0 },
    phone: null,
    latitude: '43.6981150',
    longitude: '-79.4377310',
    wheelchairAccess: false,
    physicalAddressDetail: 
    { 
      address: 'Beth Sholom Synagogue; 1445 Eglinton Ave W',
      address_2: '',
      community: 'York',
      city: 'Toronto',
      state_code: 'ON',
      zip_code: 'M6C 2E6',
      country: 'Canada' 
    } 
  },
*/

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
