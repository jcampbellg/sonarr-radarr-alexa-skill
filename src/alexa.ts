import express from 'express'
import bodyParser from 'body-parser'
import { skill } from '@/skill'
import fs from 'fs'

const app = express()
app.use(bodyParser.json())

app.post('/', async (req, res) => {
  try {
    // Log request to file
    if (process.env.LOG === 'YES') {
      const log = req.body
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      fs.promises.writeFile(`logs/request-${timestamp}.json`, JSON.stringify(log, null, 2))
    }
    
    const response = await skill.invoke(req.body)
    res.json(response)
  } catch (err) {
    console.error(err)
    res.status(500).send('Skill error')
  }
})

const PORT = process.env.PORT || 4040
app.listen(PORT, () => {
  console.log(`Alexa skill listening on port ${PORT}`)
})
