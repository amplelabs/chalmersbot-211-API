// creates meals.json in expected fromat 

const _ = require('lodash');
const moment = require('moment');

// TODO: move ParseUtil to V2
const parseUtil = require('../../lib/ParseUtil');

const stageThree = {}; 

stageThree.createAmpleData = (destructuredData) => {
    let ampleData = stageThree.removeUnusableRecords(destructuredData);

    ampleData = _.map(ampleData, (record) => {
        const ampleRecord = {};
        _.set(ampleRecord, 'organizationName', _.get(record, 'agency_name'));
        _.set(ampleRecord, 'program', _.get(record, 'id_cioc'));
        _.set(ampleRecord, 'phone_number', _.get(record, 'phone_office'));
        _.set(ampleRecord, 'latitude', _.toFinite(_.get(record, 'site_latitude')));
        _.set(ampleRecord, 'longitude', _.toFinite(_.get(record, 'site_longitude')));
        _.set(ampleRecord, 'website', _.get(record, 'website', ''));
        
        let address = _.join(
            [
                _.get(record, 'site_address', ''),
                _.get(record, 'site_city', ''),
                _.get(record, 'site_province', ''),
                _.get(record, 'site_country', ''),
                _.get(record, 'site_postalcode', ''),
            ],
            ','
        );

        // address = address.replace(/,\s*,/, '');
        _.set(ampleRecord, 'address', address);
        const meals = stageThree.createMeals(record);
        console.log(`total meals for org ${meals.length}`);

        _.set(ampleRecord, 'meals', meals);
        return ampleRecord;
    });

    console.log(`stage 3 returns ${ampleData.length} records`);
    

    // remove bad records which haven't been parsed correctly yet.
    ampleData = _.filter(ampleData, (record) => {
        return ! _.includes(stageThree.badRecords, record.program);
    });

    return ampleData;
}

stageThree.createMeals = (record) => {

    console.log(`creating meals for  ${record['id_cioc']}`);

    const meals = [];
    const hoursDetails = _.get(record, 'ampl_hours_details');

    _.forEach(hoursDetails, (hour) => {
        console.log(`creating meals for ${hour}`);
        const meal = stageThree.createMeal(hour);
        meals.push(meal);
    });

    return stageThree.filterMealsWithInvalidDates(meals);
}

stageThree.removeUnusableRecords = (destructuredData) => {
    return _.filter(destructuredData, (record) => {
        return !_.isEmpty(_.get(record, 'ampl_hours_details'));
    });
}

stageThree.createMeal = (hour) => {

    console.log(`hour: ${hour}`);

    const meal = {};
    const tokens = _.chain(hour)
        .split(/\s/)
        .filter(t => !_.isEmpty(t))
        .value();

    let startTime;
    let endTime;
    let startPeriod;
    let endPeriod;
    const unknownTokens = [];
    let dayOfWeek = [];

    _.forEach(tokens, (token) => {

        console.log(`parsing token, ${token} as ... `);
        token = token.replace(/;|,|\)|\(/g, '');

        if(parseUtil.isDayRange(token)) {
            console.log(`dateRange, ${token}`);
            dayOfWeek.push(...stageThree.getDaysForRange(token));
            return;
        } 

        // 8 pm-10 pm 
        const additionalTokens = token.split('-');

        _.forEach(additionalTokens, (additionalToken) => {
            const day = parseUtil.isWeekDay(additionalToken);

            if (!_.isEmpty(day)) {
                console.log(`dayofWeek ${day}`);
                dayOfWeek.push(day);
                return;
            }

            const isTime = parseUtil.isTime(additionalToken);

            if (isTime) {
                console.log(`as  time  ${additionalToken}`);

                if (!startTime) {
                    console.log(`setting start time ${isTime}`);
                    startTime = isTime;
                } else {
                    endTime = isTime;
                }
                return;
            }

            const isPeriod = parseUtil.isPeriod(additionalToken);

            if (isPeriod) {
                console.log(`is Period, ${additionalToken}`);
                if (!startPeriod) {
                    startPeriod = isPeriod;
                } else {
                    endPeriod = isPeriod;
                }
                return;
            }

            console.log (`unknown`);
            unknownTokens.push(token);
        });
    });

    console.log(`Unknown tokens ${JSON.stringify(unknownTokens)}`);


    _.set(meal, 'dayOfWeek', _.uniq(dayOfWeek));

    console.log(_.get(meal, 'dayOfWeek', ':('));

    const startDate = moment(`${startTime} ${startPeriod}`, 'LT');
    let endDate = moment(`${endTime} ${endPeriod}`, 'LT');

    // Set end to  start + hour when not given
    if (endDate === 'Invalid date') {
       endDate =  moment(startDate).add(1, 'hours');
    }

    const startTimeHHMM = startDate.format('HH:mm');
    const endTimeHHMM = endDate.format('HH:mm'); 

    _.set(meal, 'startTime', startTimeHHMM);
    _.set(meal, 'endTime', endTimeHHMM);
    _.set(meal, 'type', '');
    _.set(meal, 'notes', '');
    _.set(meal, 'age', []);
    _.set(meal, 'race', []);
    _.set(meal, 'gender', '');

    console.log(`meal : ${JSON.stringify(meal)}`);

    return meal;
};


stageThree.getDaysForRange = (dayRange) => {
    let [ startDay, endDay] = _.split(dayRange, '-');
    startDay = parseUtil.isWeekDay(startDay);
    endDay = parseUtil.isWeekDay(endDay);

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const startIndex = _.indexOf(daysOfWeek, startDay);
    const endIndex = _.indexOf(daysOfWeek, endDay);

    const days = _.slice(daysOfWeek, startIndex, endIndex + 1);
    return days;
}


stageThree.filterMealsWithInvalidDates = (meals) => {
    return _.filter(meals, (meal) => {
        return meal.startTime !== 'Invalid date' && meal.endTime !== 'Invalid date';
    });
}

// These records have minor inconsistencies which can be fixed later on
stageThree.badRecords = [
    'MET0886',
    'MET7783',
    'MET1229',
    'MET1022',
    'MET1476',
    'MET5235',
    'MET0710',
    'MET2818',
    'MET1062',
    'MET4356',
    'MET1062',
    'MET0347',
    'MET3058',
    'MET3542',
    'MET3615',
    'MET4426',
    'MET4662',
    'MET4872',
    'MET5024',
    'MET3193',
    'MET4078',
    'MET5294',
    'MET5606',
    'MET8276',
    'MET0002',
    'MET0086',
    'MET0345',
    'MET0743',
    'MET1219',
    'MET4852',
    'MET1219',
    'MET7504'
]

module.exports = stageThree;