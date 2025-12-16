import { z } from 'zod'
// Define Zod schema for seat selector props
export const SeatSelectorSchema = z.object({
  rows: z.number().default(6).describe('Number of seat rows'),
  seatsPerRow: z.number().default(6).describe('Seats per row (A-F format)'),
  takenSeats: z
    .array(z.string())
    .default([
      '1A',
      '1C',
      '1D',
      '1F',
      '2B',
      '2C',
      '2E',
      '3A',
      '3D',
      '3E',
      '3F',
      '4A',
      '4B',
      '4C',
      '4E',
      '5B',
      '5D',
      '5F',
      '6A',
      '6C',
      '6D',
      '6E',
      '6F',
    ])
    .describe('Array of pre-taken seats (e.g., ["1A", "2C", "3F"])'),
  maxSelections: z
    .number()
    .default(1)
    .describe('Maximum number of seats a user can select'),
  label: z
    .string()
    .default('Select Your Seats')
    .describe('Label to display above seat selector'),
})

