//
// For transformation json returned from external provider to Chalmers' format
//

var ServiceEnum = {
  Meal: 1,
  Shelter: 2,
  Clothing: 3
}

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

/*
  TODO:
  - replace all common words of the week to standard form (seems like 3 letter resp is mostly use e.g. Mon, Thu etc.)
  - replace all common time day notation to starndard form (moment.js?)
    - change 'am-' and 'pm-' to 'am to' and 'pm to'
    - change '--' to ':'. seems like before '--' is comment or meal description
      - check for the text before ' -- ', filter out the 'meal' ones if is available
  - check for null for all string field
*/

const RECORD_SEPERATOR = ' * '
const COMMENT_SEPERATOR = ' -- '
const RE_COMMENT_SEPERATOR = /(?<=[a-zA-Z\s)])(:)(?=[^0-9])/gm

// extending strings
function stripHTMLTag (str) {
  if (str === undefined) str = this
  return str.replace(/<(?:.|\n)*?>/gm, '')
}

function stripLinebreak (str) {
  if (str === undefined) str = this
  return str.replace(/(\r\n\t|\n|\r\t|\r)/gm, '')
}

/*
  TODO: figure out what to do with this ... A new string class?
  class MyString extends String {
    something() { return this.split(' ').join(''); }
  }
  ref: https://stackoverflow.com/questions/30257915/extend-a-string-class-in-es6
*/
String.prototype.stripHTMLTag = stripHTMLTag
String.prototype.stripLinebreak = stripLinebreak

function GenericTransformer (jsonFromProvider) {
  const chalmersJson = {
    organizationName: `${jsonFromProvider.resourceID} - ${jsonFromProvider.resourceName}`,
    address: Object.values(jsonFromProvider.physicalAddressDetail).join(' '),
    program: jsonFromProvider.resourceDescription,
    phone_number: jsonFromProvider.phone === null ? 'na' : jsonFromProvider.phone
    // meals: []
  }
  const keys = Object.keys(chalmersJson)
  return {
    ...keys.reduce((a, x) => { return { ...a, [x]: chalmersJson[x].stripHTMLTag().stripLinebreak() } }, {}),
    latitude: jsonFromProvider.latitude,
    longitude: jsonFromProvider.longitude
  }
}

const WEEKDAYS = { 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6, 'sun': 7 }

function MealTransformer (jsonFromProvider) {
  const extractDay = (str) => {
    // TODO: add support for range e.g. mon-fri / mon - fri etc.
    // NOTE: some entry has full spelling like Monday etc. See 34341-2
    const keys = Object.keys(WEEKDAYS)
    return keys.filter(x => str.includes(x))
    // const out = keys.filter(x => str.includes(x))
    // console.log(out)
    // return out
  }
  const extractTime = (str) => {
    // To be impl
  }
  const parse = (str) => {
    return str
      .split(RECORD_SEPERATOR)
      .map((x) => {
        const tmp = x
          .replace(RE_COMMENT_SEPERATOR, COMMENT_SEPERATOR)
          .toLowerCase()
          .split(COMMENT_SEPERATOR)
        if (tmp.length === 1) return { notes: 'na', dayOfWeek: extractDay(tmp[0]), tmp: tmp[0] }
        return { notes: tmp[0], dayOfWeek: extractDay(tmp[1]), tmp: tmp[1] }
      })
      .filter(x => x.dayOfWeek.length !== 0)
  }
  const meals = () => {
    const info = jsonFromProvider.operationHours === null ||
    jsonFromProvider.operationHours.length === 0
      ? jsonFromProvider.resourceDescription : jsonFromProvider.operationHours
    return parse(
      info
        .stripHTMLTag()
        .stripLinebreak()
    )
  }
  return { ...GenericTransformer(jsonFromProvider), meals: meals() }
}

function TransformerFactory (service) {
  switch (service) {
    case ServiceEnum.Meal:
      return MealTransformer
    default:
      throw new Error('Service not supported!')
  }
}

// some temp testing here
const meals = JSON.parse(require('../meal211Toronto'));///.filter(x => x.resourceID === '34334-2')
const id = Math.floor((Math.random() * meals.length))
console.log(MealTransformer(meals[id]))

//
//
//
module.exports = {
  ServiceEnum,
  TransformerFactory,
  MealTransformer
}
