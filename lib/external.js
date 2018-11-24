//
// For external communications
//
//////////////////////////////////////////////////////////////////////////////////////////////////

require('dotenv').config()
const axios = require('axios')

const instance = axios.create({
  baseURL: process.env.TRIAL_API_BASEURL,
  timeout: 1000,
  // headers: {}
});

const getResourceInfo = (resourceID) => {
  return new Promise((resolve, reject) => {
    const url = `${process.env.TRIAL_API_RESOURCE_URL}\\${resourceID}`
    instance.get(url)
      .then((resp) => {
        if (Number(resp.status) === 200) {
          resolve(resp.data)
        }
        reject(new Error(`Error code: ${resp.status}`))
      })
      .catch(err => reject(err))
  })
}

// NOTE: topic Homelessness and its subtopics are not returned from this api query
const listTopic = (subTopic = null) => {
  // Ref: https://api211.azure-api.net/free/freeapi/v1/Topics/en
  const url = subTopic === null
    ? process.env.TRIAL_API_TOPIC_URL : `${process.env.TRIAL_API_TOPIC_URL}\\${subTopic}`
  return new Promise((resolve, reject) => {
    instance.get(url)
      .then((resp) => {
        if (Number(resp.status) === 200) {
          const topic = resp.data.map(x => x.name)
          resolve(topic)
        }
        reject(new Error(`Error code: ${resp.status}`))
      })
      .catch(err => reject(err))
  })
}

// TODO: add parameter checks
const search = (query, topic, subtopic) => {
  const url = process.env.TRIAL_API_SEARCH_URL
  return new Promise((resolve, reject) => {
    // Ref:
    // https://api211.portal.azure-api.net/docs/services/5908741b2325490e287b7f59/
    // operations/5908741c2325490788eca1a5/console
    const param = {
      term: query.term,
      locationText: query.locationText,
      locationPoint: {
        latitude: query.latitude,
        longitude: query.longitude
      },
      isDefaultLocation: true, // leave it as is
      maxDistanceInKilometers: query.maxDistanceInKilometers,
      topicPath: `${topic}|${subtopic}`, // casing is important!
      typeOfService: 'string', // leave it as is (?)
      requireWheelchairAccess: query.requireWheelchairAccess,
      languages: [
        'English' // leave it as is
      ],
      communications: [
        'InPerson' // leave it as is -- do not change
      ],
      ageGroups: [
        {
          lowerBoundAge: 0, // leave it as is for now
          upperBoundAge: 0 // leave it as is for now
        }
      ],
      paginationInfo: {
        sortField: 'Distance', // see ref for more info
        sortOrder: 'Ascending', // see ref for more info
        pageIndex: 0, // leave it as is for now
        pageSize: 0 // leave it as is for now
      }
    }
    instance.post(url, param)
      .then((resp) => {
        resolve(resp.data.entries)
      })
      .catch(err => reject(err))
  })
}

const searchMeals = async (query) => {
  const topic = 'Homelessness'
  const subtopic = 'Homeless meals'
  const results = await search(query, topic, subtopic).catch(err => { throw(err) })
  return results.map((x) => ({
    resourceID: x.resourceID, // <- a few more info need to query from this one!
    resourceName: x.resourceName,
    resourceDescription: x.resourceDescription,
    operationHours: x.operationHours,
    serviceArea: x.serviceArea,
    languages: x. languages,
    ageBand: x.ageBand,
    phone: x.phone,
    latitude: x.latitude,
    longitude: x.longitude,
    wheelchairAccess: x.wheelchairAccess,
    physicalAddressDetail: x.physicalAddressDetail
  }))
}

//
//
//////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
  listTopic,
  search,
  searchMeals,
  getResourceInfo
}
