// packages
import { buildSchema } from 'graphql'

// build schema
const placeSchema = buildSchema(`
  type Query {
    placedata(url: String!, cache: Boolean): PlaceData
  }

  type PlaceData {
    geometry: Geometry
    name: String
    desc: String
    address: Address
    businessStatus: String
    openingHours: [OpeningHour]
    website: String
    phone: String
  }

  type Geometry {
    lat: Float
    lng: Float
    zoom: Float
  }

  type Address {
    global: String
    long: String
  }

  type OpeningHour {
    isOpen: Boolean
    start: String
    end: String
  }
`)

export default placeSchema
