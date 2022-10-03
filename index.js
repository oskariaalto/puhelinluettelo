const { request, response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()

let persons = [
    { 
    name: "Arto Hellas", 
    number: "040-123456",
    id: 1
    },
    { 
    name: "Ada Lovelace", 
    number: "39-44-5323523",
    id: 2
    },
    { 
    name: "Dan Abramov", 
    number: "12-43-234345",
    id: 3
    },
    { 
    name: "Mary Poppendieck", 
    number: "39-23-6423122",
    id: 4
    }
]

app.use(express.json())

morgan.token('data', function getData(request) {
    const body = request.body
    return JSON.stringify({name:body.name, number: body.number})
})


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data', {
    skip: function(req,res){
    const skipOrNot = req.method!=="POST"
        ?req.method!=="POST"
        :res.statusCode!==200
    return skipOrNot }
}))

app.use(morgan('tiny', {
    skip: function(req,res){
    const skipOrNot = req.method==="POST"
        ?res.statusCode===200
        :req.method==="POST"
    return skipOrNot }
}))

const generateID = ()=>{
    const maxId = persons.length>0
        ?Math.max(...persons.map(p=>p.id))
        :0
    return (Math.random()*maxId+maxId)/1
}

app.get('/api/persons',(req,res)=>{
    res.json(persons)
})
app.get('/info', (req,res)=>{
    const leng = persons.length
    const atm = Date()
    res.send(`<p> Phonebook has info  for ${leng} people</p><p>${atm}</p>`)
})
app.get('/api/persons/:id', (request,response)=>{
    const id = Number(request.params.id)
    const person = persons.find(person => person.id===id)
    if(person) {
        response.json(person)
    } else{
        response.status(404).end()
    }
})
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(note => note.id !== id)
  
    response.status(204).end()
})
app.post('/api/persons', (requeast, response) =>{
    const body = requeast.body

    if(!body.name || !body.number) {
        const missing = !body.name
            ?'name missing'
            :'number missing'
        return response.status(400).json({
            error: missing
        })
    }
    else if(persons.find(p => p.name===body.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateID()
    }
    persons = persons.concat(person) 
    response.json(person)
})


const PORT=3001
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})