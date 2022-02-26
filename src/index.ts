const express = require('express')
const app = express()
const axios = require('axios').default
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
require('dotenv').config()
const { PORT } = process.env

app.get('/', async (req: any, res: any) => {
  res.send(`received`)
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})