const z = require('zod')

const movieSchema = z.object({
  address: z.string({
    invalid_type_error: 'Movie adress must be a string',
    required_error: 'Movie adress is required'
  }),
  neighborhood: z.string(),
  price: z.number(),
  bedrooms: z.number().int().min(1).max(10),
  bathrooms: z.number(),
  area: z.number().positive(),
  description: z.string(),
  features: z.array(
    z.enum(['elevator', 'air conditioning', 'furnished', 'garage', 'terrace', 'community pool', 'low consumption', 'central heating', 'storage room', 'garden', 'concierge', 'heating', 'bright', 'double-glazed windows', 'gym', 'sauna', 'balcony'])
  ),
  images: z.array(z.string().url())
})

function validateApartment (object) {
  return movieSchema.safeParse(object)
}

function validatePartialApartment (input) {
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateApartment,
  validatePartialApartment
}
