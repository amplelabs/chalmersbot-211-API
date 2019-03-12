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
                'website'
            ]
        );
    });

    const destructuredData = _.map(selectedData, (record) => {
        console.log(`Parsing ${record['id_cioc']}`);
        record['ampl_hours_details'] = stageOne.destructure(_.get(record, 'hours'));
        record['ampl_program_details'] = stageOne.destructure(_.get(record, 'desc_program'));
        record['ampl_eligibilty'] = stageOne.destructure(_.get(record, 'eligibilty'));
        return record;
    });

    return destructuredData;
};

// TODO: remove after debug
stageOne.destructureCount = 0;

stageOne.destructure = (complexString) => {
    stageOne.destructureCount += 1;

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

        parts = _.filter(parts, (part) => _.isEmpty);
    } catch (error) {
        console.log(`failed to parse ${complexString}, error: ${error}`);
    }

    console.log(`${stageOne.destructureCount / 3} records parsed `);


    return parts;
};


module.exports = stageOne;
