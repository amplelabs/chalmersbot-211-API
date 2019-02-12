const fs = require('fs');
const _ = require('lodash');
const ParseUtil = require('./ParseUtil');
const moment = require('moment');
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

const parseOperationHours = (operationHours) => {
    let startMonth;
    let endMonth;
    let startDay;
    let endDay;
    let startTime;
    let endTime;
    let startYear;
    let endYear;
    let weekdays = [];
    let startPeriod;
    let endPeriod;
    const unhandledTokens = [];

    const tokens = _.omit(ParseUtil.tokenize(operationHours), _.isEmpty);
    // assumes start year/month/day/time is always specified before ends
    _.forEach(tokens, (token) => {
        if (ParseUtil.isEmpty(token) || ParseUtil.isSeparator(token) || ParseUtil.isRangeSymbol(token)) {
            return;
        }

        const parsedDay = ParseUtil.isDay(token);

        if (!_.isNil(parsedDay)) {

            if (_.isUndefined(startDay)) {
                startDay = parsedDay;
                return;
            } else if (_.isUndefined(endDay)){
                endDay = parsedDay;
                return;
            }
            // fall through if needed
        }

        const parsedYear = ParseUtil.isYear(token);

        if (!_.isNil(parsedYear)) {
            if (_.isUndefined(startYear)) {
                startYear = parsedYear;
            } else {
                endYear = parsedYear;
            }

            return;
        }

        const parsedMonth = ParseUtil.isMonth(token);

        if (!_.isNil(parsedMonth)) {
            if (_.isUndefined(startMonth)) {
                startMonth = parsedMonth;
            } else {
                endMonth = parsedMonth;
            }
            return;
        }

        if (ParseUtil.isTime(token)) {

            if (_.isUndefined(startTime)) {
                startTime = token;
            } else {
                endTime = token;
            }
            return;
        }

        const parsedPeriod = ParseUtil.isPeriod(token);

        if (!_.isNil(parsedPeriod)) {
            if (_.isUndefined(startPeriod)) {
                startPeriod = parsedPeriod;
            } else {
                endPeriod = parsedPeriod;
            }
            return;
        }

        const parsedWeekDay = ParseUtil.isWeekDay(token);
        if (!_.isUndefined(parsedWeekDay)) {
            weekdays.push(parsedWeekDay);
            return;
        }

        unhandledTokens.push(token);

    });

    // TODO: copy start values where end values are missing.
    return {
        startYear,
        endYear,
        startMonth,
        endMonth,
        startDay,
        endDay,
        startTime,
        startPeriod,
        endTime,
        endPeriod,
        weekdays,
        unhandledTokens
    };
}

/**
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
*/

const createMeal = (operationHours) => {
    const parsedOperationHours = parseOperationHours(operationHours);
    const startTime = _.get(parsedOperationHours, 'startTime', '');
    const endTime = _.get(parsedOperationHours, 'endTime', '');
    const startPeriod = _.get(parsedOperationHours, 'startPeriod', '');
    const endPeriod = _.get(parsedOperationHours, 'endPeriod', '');
    const startDate = moment(`${startTime} ${startPeriod}`, 'LT');
    const endDate = moment(`${endTime} ${endPeriod}`, 'LT');
    const startTimeHHMM = startDate.format('HH:mm');
    const endTimeHHMM = endDate.format('HH:mm');

    return {
        startTime: startTimeHHMM,
        endTime: endTimeHHMM,
        dayOfWeek: _.get(parsedOperationHours, 'weekdays'),
        type: '',
        notes: '',
        gender: '',
        age: '',
        race: []
    };
}

/**
 *
 * @param {
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
 */
const resourcesToMeal = (resources) => {

    let mealSkills = [];

    _.forEach(resources, (resource) => {
        try {
            const mealSkill = {};

            const addressDetail = _.get(resource, 'physicalAddressDetail');
            mealSkill.address = `${_.get(addressDetail, 'address')}, ${_.get(addressDetail, 'address_2')}, ${_.get(addressDetail, 'city')}, ${_.get(addressDetail, 'zip_code')}`
            mealSkill.organizationName = _.get(resource, 'resourceName');
            mealSkill.program = '';
            mealSkill.phone_number = _.get(resource, 'phone');
            mealSkill.latitude = _.toFinite(_.get(resource, 'latitude'));
            mealSkill.longitude = _.toFinite(_.get(resource, 'longitude'));
            // mealSkill.resourceId = _.get(resource, 'resourceID');
            // mealSkill.operationHours = _.get(resource, 'operationHours');

            const operationHours = _.get(resource, 'operationHours');
            const meals = createMeal(operationHours);

            mealSkill.meals = [meals];
            mealSkills.push(mealSkill);
        } catch (error) {
            console.log(`Unable to create mealSkill for ${resource.resourceID}: ${error}`);
        }
    });

    // TODO: remove filter to return all resources
    mealSkills = filterInvalidDates(mealSkills);
    return filterInvalidResources(mealSkills);
}

const filterInvalidResources = (mealSkills) => {
    const invalidResources = [
        '33940-2',
        '33919-2',
        '33814-2',
        '33908-2',
        '33807-2',
        '33933-2',
        '33932-2',
        '33761-2',
        '33809-2',
        '33892-2',
        '33930-2',
        '33931-2',
        '33915-2',
        '33759-2',
        '33964-2',
        '33955-2',
        '33913-2',
        '33775-2',
        '33929-2',
        '33842-2',
        '33855-2',
        '33763-2',
        '33909-2',
        '33774-2',
        '33893-2',
        '33907-2',
        '33742-2',
        '33947-2',
        '33911-2',
        '33853-2',
        '33826-2',
        '33762-2',
        '33946-2',
        '33963-2',
        '33811-2',
        '33820-2',
        '33804-2',
        '33760-2',
        '33792-2',
        '34028-2',
        '33905-2',
        '33924-2',
        '34017-2',
        '34085-2',
        '34084-2',
        '33874-2',
        '34074-2',
        '34001-2',
        '34083-2',
        '34024-2',
        '34039-2',
        '34046-2',
        '33872-2',
        '34086-2',
        '34073-2',
        '34022-2',
        '33888-2',
        '34038-2',
        '33952-2',
        '33887-2',
        '33876-2',
        '34002-2',
        '34016-2',
        '34053-2',
        '34020-2',
        '34019-2',
        '33936-2',
        '34040-2',
        '33875-2',
        '34052-2',
        '34060-2',
        '33922-2',
        '33916-2',
        '33873-2'
    ];

    return _.filter(mealSkills, (mealSkill) => {
        return !_.includes(invalidResources, mealSkill.resourceId);
    });
}

const filterInvalidDates = (mealSkills) => {
    return _.filter(mealSkills, (mealSkill) => {
        // TODO: redo this filter
        let meal = mealSkill.meals[0];
        return meal.startTime !== 'Invalid date' && meal.endTime !== 'Invalid date';
    })
}


// TESTS //

// TODO: move tests to formal test
const testParseOperationHours = async () => {

    const operatingHours = [
        'January 1, 2019 to March 19, 2019 -- Tue 5:15 pm-7 am',
        'November 5, 2018 to April 15, 2019 -- Mon 5 pm-9 pm',
        // 'Throughout the year -- Fri 5 pm-7 pm',
        // 'Soup kitchen -- Wed 9 am-1 pm * Church office -- Mon-Tue, Thu-Fri 9 am-12 noon, 2 pm-4:30 pm',
        'Mon-Fri 9 am-1 pm',
        'November 9, 2018 to March 29, 2019 -- Fri 5 pm-8 am',
    ];

    _.forEach(operatingHours, (str) => {
        const parsedOperationHours = parseOperationHours(str);
        console.log(`OperationHours: ${str}`);
        console.log(JSON.stringify(parsedOperationHours, null, 2));
        console.log(JSON.stringify(createMeal(parsedOperationHours)));
    });
};

const testCreateMealSkill = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('meal211Toronto.json', (err, data) => {
            if (err) {
                return reject(err);
            }
            let mealSkills;
            try {
                mealSkills = resourcesToMeal(JSON.parse(data));
            } catch (error) {
                return reject(error);
            }

            return resolve(mealSkills);
        });
    });
};


// Run through meal Transformer
// testCreateMealSkill()
//     .then((meals) => {
//         console.log(JSON.stringify(meals, null, 2));
//     })
//     .catch((error) => {
//         console.log(error);
//     });

module.exports = {
    resourcesToMeal
}