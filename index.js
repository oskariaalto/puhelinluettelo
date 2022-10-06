/* eslint-disable no-undef */
require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

app.use(express.json())

app.use(express.static('build'))

morgan.token('data', function getData(request) {
  const body = request.body
  return JSON.stringify({ name:body.name, number: body.number })
})


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data', {
  skip: function(req,res){
    const skipOrNot = req.method!=='POST'
      ?req.method!=='POST'
      :res.statusCode!==200
    return skipOrNot }
}))

app.use(morgan('tiny', {
  skip: function(req,res){
    const skipOrNot = req.method==='POST'
      ?res.statusCode===200
      :req.method==='POST'
    return skipOrNot }
}))

app.get('/api/persons',(request,response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request,response) => {
  Person.find({}).then(persons => {
    const leng = persons.length
    const atm = Date()
    response.send(`<p> Phonebook has info  for ${leng} people</p><p>${atm}</p>`)
  })
})

app.get('/api/persons/:id', (request,response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      } else{
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request,response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  const person = new Person({
    name: name,
    number: number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if(error.name==='CastError'){
    return response.status(400).sen({ error: 'wrong id' })
  }else if(error.name==='ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})