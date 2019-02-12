const MapsAdapter = require('./map-adapter')

class Location {
  static async fromAddress (address, maps = MapsAdapter) {
    try {
      const coords = await maps.lookupAddress(address + ' Toronto')
      return new Location({...coords})
    } catch (_error) {
      console.error(_error)
      return new Location({})
    }
  }

  static async fromCoords (coords, maps = MapsAdapter) {
    try {
      const data = await maps.lookupCoords(coords)
      return new Location({...data})
    } catch (_error) {
      console.error(_error)
      return new Location({...coords})
    }
  }

  constructor ({latitude = 'invalid', longitude = 'invalid', city = 'unknown', address = 'unknown'}) {
    this.latitude = parseFloat(latitude)
    this.longitude = parseFloat(longitude)
    this.city = city
    this.address = address
  }

  coords () {
    return {
      latitude: this.latitude,
      longitude: this.longitude
    }
  }

  isInsideToronto () {
    return this.city === 'Toronto'
  }

  isOutsideToronto () {
    return !this.isInsideToronto()
  }

  isUnknown () {
    return Number.isNaN(this.latitude) ||
      Number.isNaN(this.longitude) ||
      Math.abs(this.latitude) > 90 ||
      Math.abs(this.longitude) > 180
  }
}

module.exports = Location
