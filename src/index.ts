const express = require('express')
const app = express()
app.use(express.json())
const axios = require('axios').default
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
require('dotenv').config()
const { PORT } = process.env

type Lesson = {
  title: string
  description: string
  recurrence: Array<string>
  start: string
  exp: string
}

const weekDays: { [index: string]: number } = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thur: 4,
  fri: 5,
  sat: 6,
  all: 7
}

function nextDay(d: Date, dow: number){
    d.setDate(d.getDate() + (dow+(7-d.getDay())) % 7);
    return d;
}

app.get('/', async (req: any, res: any) => {
  res.send(`received`)
})

/**
 * Date is passed as string in format YYYY-MM-DD
 * Recurrence is array of week days
 */
app.get('/lesson/create', async (req: any, res: any) => {
  const lesson: Lesson = req.body[0]
  if (lesson.recurrence.length > 0) {
    if (lesson.recurrence[0].match('all')) {
      const interval: number = 24 * 60 * 60 *1000
      const startDate = new Date(lesson.start).getTime()
      const expDate = new Date(lesson.exp).getTime()
      res.send(`${interval} - ${startDate} - ${expDate}`)
      return
    }
    const days: Array<number> = lesson.recurrence.filter((day: string) => day in weekDays).map((day: string)  => weekDays[day]);
  }
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})