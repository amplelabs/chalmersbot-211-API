const _ = require('lodash');
const ParseUtil = {};

ParseUtil.isYear = (token) => {
    // TODO: update when close to year 2100
    const match = token.match(/^20\d\d$/);
    return match && match[0];
};

ParseUtil.isDay = (token) => {
    // TODO: fails for "00"
    const dayRegEx = /^(([1-9])|(0[1-9])|([12][1-9])|(3[01]))$/;
    const match = token.match(dayRegEx);
    return match && match[0];
}

ParseUtil.isTime = (token) => {
    // TODO: test and support more formats
    const match = token.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])?$/);
    return match && match[0];
}

ParseUtil.isMonth = (token) => {
    return inTrie(months, token);
};

// Mon-Thu, Fri-Sun
ParseUtil.isDayRange = (token) => {
    const [startDay, endDay] = token.split('-');
    return ParseUtil.isWeekDay(startDay) && ParseUtil.isWeekDay(endDay);
}

ParseUtil.isWeekDay = (token) => {
    return inTrie(days, token);
};

ParseUtil.isPeriod = (token) => {
    return inTrie(periods, token);
};

// splits string into parts
ParseUtil.tokenize = (complexString) => {
    return _.split(complexString, /\s|-|,/);
}

// methods to categorize tokens
ParseUtil.isEmpty = (token) => {
    return token === '';
}

ParseUtil.isSeparator = (token) => {
    return _.includes(['--', '-', ','], token);
}

ParseUtil.isRangeSymbol = (token) => {
    return _.includes(['to', '-'], token);
}

/**
 * Test if given value exists in give trie
 * @param {object} trie
 * @param {string} lookupValue
 * @return {string} key/ standardized value for lookup value, if found.
 */
const inTrie = (trie, lookupValue) => {
    const contains = _.partialRight(_.includes, _.toLower(lookupValue));
    return _.findKey(trie, (row) => contains(row));
};

// Maps for known / expected abbreviation
const days = {
    // Add more abbrvs if missing
    Mon: ['monday', 'mon', 'm'],
    Tue: ['tuesday', 'tue', 't'],
    Wed: ['wednesday', 'wed', 'w'],
    Thu: ['thursday', 'thrs', 'th', 'thu'],
    Fri: ['friday', 'fri', 'f'],
    Sat: ['saturday', 'sat', 's'],
    Sun: ['sunday', 'sun', 'su']
};

const months = {
    // Add more abbrvs if missing
    january: ['january', 'jan'],
    febuary: ['feburary', 'feb'],
    march: ['march', 'mar'],
    april: ['april', 'feb'],
    may: ['may'],
    june: ['june', 'jun'],
    july: ['july', 'jul'],
    august: ['august', 'aug'],
    september: ['september', 'sept'],
    october: ['october', 'oct'],
    november: ['november', 'nov'],
    december: ['december', 'dec']
};

const periods = {
    am: ['am', 'a'],
    pm: ['pm', 'p', 'noon']
};

module.exports = ParseUtil;