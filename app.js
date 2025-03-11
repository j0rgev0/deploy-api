const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const apartmentsJSON = require('./apartments.json')
const { validateApartment, validatePartialApartment } = require('./apartments')

const app = express()
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://apartments.com'
    ]

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
})) // SOLUCION CORS
app.disable('x-powered-by')

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://apartments.com'
]

app.get('/', (req, res) => {
  res.json({ message: 'HELLO WORLD' })
})

// Todos los recursos que sean APARTMENTS se identifican con /movies
app.get('/apartments', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { features } = req.query
  if (features) {
    const filteredMovies = apartmentsJSON.filter((apartment) =>
      apartment.features.some((g) => g.toLowerCase() === features.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(apartmentsJSON)
})

app.get('/apartments/:id', (req, res) => {
  const { id } = req.params
  const apartment = apartmentsJSON.find((apartment) => apartment.id === id)
  if (apartment) return res.json(apartment)

  res.status(404).json({ message: 'Apartment not found' })
})

app.post('/apartments', (req, res) => {
  const result = validateApartment(req.body)

  if (result.error) {
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }

  const newApartment = {
    id: crypto.randomUUID(),
    ...result.data
  }

  apartmentsJSON.push(newApartment)
  res.status(201).json(newApartment)
})

app.delete('/apartments/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { id } = req.params
  const apartmentIndex = apartmentsJSON.findIndex(
    (apartment) => apartment.id === id
  )

  if (apartmentIndex === -1) {
    return res.status(404).json({ message: 'Apartment not found' })
  }

  apartmentsJSON.splice(apartmentIndex, 1)

  return res.json({ message: 'Apartmnet deleted' })
})

app.patch('/apartments/:id', (req, res) => {
  const result = validatePartialApartment(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const apartmentIndex = apartmentsJSON.findIndex(
    (apartment) => apartment.id === id
  )

  if (apartmentIndex === -1) {
    return res.status(404).json({ menssege: 'Apartment not found' })
  }

  const updatedApartment = {
    ...apartmentsJSON[apartmentIndex],
    ...result.data
  }

  apartmentsJSON[apartmentIndex] = updatedApartment

  return res.json(updatedApartment)
})

app.options('/apartments/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }
  res.send(200)
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
