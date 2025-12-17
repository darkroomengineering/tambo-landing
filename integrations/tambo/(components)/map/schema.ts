import { z } from 'zod'

// Schema for map component props
export const MapSchema = z.object({
  height: z
    .number()
    .default(356)
    .describe('Height of the map component in pixels'),
  center: z
    .object({
      lng: z.number().describe('Longitude of the map center'),
      lat: z.number().describe('Latitude of the map center'),
    })
    .optional()
    .describe('Initial center location of the map [longitude, latitude]'),
  zoom: z
    .number()
    .default(12)
    .describe('Initial zoom level of the map'),
  selectedArea: z
    .object({
      west: z.number().describe('Western boundary (longitude)'),
      east: z.number().describe('Eastern boundary (longitude)'),
      south: z.number().describe('Southern boundary (latitude)'),
      north: z.number().describe('Northern boundary (latitude)'),
    })
    .optional()
    .describe('Currently selected bounding box area on the map'),
  location: z
    .string()
    .optional()
    .describe('Human-readable location description (e.g., "New York City, NY")'),
})

