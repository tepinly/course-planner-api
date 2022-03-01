const express = require('express')
const app = express()
app.use(express.json())
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
    return d.getTime() / 1000;
}

const createLessonRecord = async (title: string, description: string) => {
  const newLesson = await prisma.lesson.create({
    data: {
      title: title,
      description: description
    }
  })
  return newLesson
}

const createRecurrenceRecord = async (id: number, interval: number, startDate: number, expDate: number) => {
  const newRecurrence = await prisma.recurrence.create({
    data: {
      lessonId: id,
      interval: interval,
      start: startDate,
      expire: expDate
    }
  })
  return newRecurrence
}

app.get('/', async (req: any, res: any) => {
  res.send(`received`)
})

/**
 * Date is passed as string in format YYYY-MM-DD
 * Recurrence is array of week days
 */
app.post('/lesson/create', async (req: any, res: any) => {
  const lesson: Lesson = req.body[0]
  let startDate: number = new Date(lesson.start).getTime() / 1000
  let expDate: number = new Date(lesson.exp ?? lesson.start).getTime() / 1000
  let interval: number
  const newLesson = await createLessonRecord(lesson.title, lesson.description)
  
  if (lesson.recurrence.length === 0) {
    const newRecurrence = await createRecurrenceRecord(await newLesson.id, interval = 0, startDate, expDate)
  }

  else if (lesson.recurrence[0].match('all')) {
    interval = 24 * 60 * 60
    const newRecurrence = await createRecurrenceRecord(await newLesson.id, interval, startDate, expDate)
  }

  else {
    const days: Array<number> = lesson.recurrence.filter((day: string) => day in weekDays).map((day: string)  => weekDays[day])
    interval = 7 * 24 * 60 * 60
    const temp: Date = new Date(startDate * 1000)
    const lessonKey = await newLesson.id

    for (const day of days) {
      startDate = nextDay(temp, day)
      console.log(startDate + "\n")
      const newRecurrence = await createRecurrenceRecord(lessonKey, interval, startDate, expDate)
    }
  }

  res.send(`Record created 👌`)
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})