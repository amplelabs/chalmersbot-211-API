'use strict';
const _ = require('lodash');

/**
 * Converts 211 new (v2) data format into a simpler form where
 * only attributes of interest are selected
 * and plain text with markup/special characters is denormalized
 * into multi-line structure for subsequent processing
 *
 *  eg.
 **/
const stageOne = {};

stageOne.stageOneParser = async (raw211Data) => {

    const selectedData = _.map(raw211Data, (record) => {
        return _.pick(
            record,
            [
                'id_program',
                'id_cioc',
                'agency_name',
                'site_latitude',
                'site_longitude',
                'category',
                'desc_program',
                'eligibility',
                'hours',
                'phone_office',
                'phone_tollfree',
                'phone_tty',
                'fax',
                'website',
                'last_verified_date'
            ]
        );
    });

    const destructuredData = _.map(selectedData, (record) => {
        // console.log(`Parsing ${record['id_cioc']}`);
        record['ampl_hours_details'] = stageOne.destructure(_.get(record, 'hours'));
        record['ampl_program_details'] = stageOne.destructure(_.get(record, 'desc_program'));
        record['ampl_eligibilty'] = stageOne.destructure(_.get(record, 'eligibilty'));
        return record;
    });

    return stageOne.getTorontoDataOnly(destructuredData);
};

stageOne.destructure = (complexString) => {

    if (_.isEmpty(complexString)) {
        return [];
    }

    let parts = [];

    try {
        parts = _.chain(complexString)
            .split(/\<br\s*\/?\>/)
            .join('%%')
            .split('\n')
            .join('%%')
            .split(/\*/)
            .join('%%')
            .split('%%')
            .map((x) => _.trim(x))
            .filter((x) => !_.isEmpty(x))
            .value();

        parts = _.filter(parts, (part) => !_.isEmpty(part));
    } catch (error) {
        console.log(`failed to parse ${complexString}, error: ${error}`);
    }

    return parts;
};


stageOne.getTorontoDataOnly = (destructuredData) => {
    return _.filter(destructuredData, (record) => {
        // MET prefix is used for Toronto Metropolitan 
        return _.get(record, 'id_cioc', '').match(/MET/i);
    });
}


module.exports = stageOne;