// Remove html tags
'use strict';
// remove office hours
// parse meal hours/ type
const _ = require('lodash');

const stageTwo = {};

stageTwo.cleanup = (destructuredData) => {
    let cleanedData;
    try {

        console.log(`starting cleanup`);
        cleanedData = _.map(destructuredData, (record) => {
            return stageTwo.cleanupHourDetails(record);
        });
    } catch (error) {
        console.error(error);
    }
    console.log(`stage 2 returns  ${cleanedData.length} records`);
    return cleanedData;
};


stageTwo.stripHtml = (str) => {
    str = str.replace(/<\/?b>/ig, '');
    // TODO: add more tags if needed
    return str;
};

stageTwo.cleanupHourDetails = (record) => {
    let hourDetails = _.get(record, 'ampl_hours_details', []);

    hourDetails = stageTwo.getHoursOfInterest(hourDetails);

    // remove <b> tags
    hourDetails = _.map(hourDetails, (hours) => {
        return stageTwo.stripHtml(hours);
    });


    record = _.set(record, 'ampl_hours_details', hourDetails);
    return record;
};

stageTwo.stripHtml = (str) => {
    str = str.replace(/<\/?b>/ig, '');
    // TODO: add more tags if needed
    return str;
}

stageTwo.getHoursOfInterest = (hourDetails) => {
    // remove office hours
    hourDetails = _.filter(hourDetails, (hours) => {
        return !hours.match(/office/i);
    });

    // Assume if there is only one record, that's for meals
    if (hourDetails.length === 1) {
        return hourDetails;
    }

    hourDetails = _.filter(hourDetails, (hours) => {
        return hours.match(/meal|dinner|lunch|snack|breakfast|kitchen|box|supper/ig);
    });

    return hourDetails;
}


module.exports = stageTwo;