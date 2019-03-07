const _ = require('lodash');
/**
 * Converts 211 new (v2) data format into a simpler form where
 * only attributes of interest are selected
 * and plain text with markup/special characters is denormalized
 * into multi-line structure for subsequent processing
 *
 * eg.
 **/
const stageOneParser = async (raw211Data) => {
    const selectedData = _.map(raw211Data, (record) => {
        _.pick(record, [
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
        ]);
    });

    const destructuredData = _.map(selectedData, (record) => {
        record['ampl_hours_details'] = destructure(_.get(record, 'hours'));
        record['ampl_program_detials'] = destructure(_.get(record, 'desc_program'));
        return record;
    })

};

const destructure = (complexString) => {
    _.split(complexString, /\n|*|<br\s*/?)
}

export default [
    stageOneParser
];
