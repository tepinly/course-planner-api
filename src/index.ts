const express = require('express')
const app = express()
app.use(express.json())
const queries = require('./queries')
const helper = require('./helper')

require('dotenv').config()
const { PORT } = process.env

type Lesson = {
  user: number
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
  thu: 4,
  fri: 5,
  sat: 6,
  all: 7
}

async function createRecurrence(lessonId: number, lesson: Lesson, startDate: string, expDate: string) {
  let interval: number
  if (lesson.recurrence.length === 0) {
    const newRecurrence = await queries.createRecurrenceRecord(lessonId, interval = 0, startDate, startDate)
  }

  else if (lesson.recurrence[0].match('all')) {
    interval = 24 * 60 * 60
    const newRecurrence = await queries.createRecurrenceRecord(lessonId, interval, startDate, expDate)
  }
 
  else {
    const days: Array<number> = lesson.recurrence.filter((day: string) => day in weekDays).map((day: string) => weekDays[day])
    interval = 7 * 24 * 60 * 60
    const temp: Date = new Date(parseInt(startDate) * 1000)
    const lessonKey = lessonId
    let start: string

    for (const day of days) {
      start = String(helper.nextDay(temp, day))
      const newRecurrence = await queries.createRecurrenceRecord(lessonKey, interval, start, expDate)
    }
  }
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
  let startDate: string = String(new Date(lesson.start).getTime() / 1000)
  let expDate: string = String(new Date(lesson.exp ?? lesson.start).getTime() / 1000)
  const newLesson = await queries.createLessonRecord(lesson.user, lesson.title, lesson.description)
  const created = await queries.createRecurrence(await newLesson.id, lesson, startDate, expDate)

  res.send(`Record created 👌`)
})

app.get('/lesson/fetch', async (req: any, res: any) => {
  const userId: number = req.body[0].user
  const userLessons = await (queries.fetchLessons(userId))

  const schedule: Array<any> = []
  let count: number
  let start: Date
  let weekDay: any
  let index = 0
  
  for (const lesson of userLessons.recurrences) {
    schedule.push({ lessonId: userLessons.lessons[index].id, title: userLessons.lessons[index].title, description: userLessons.lessons[index].description, content: []})
    for (const recurrence of lesson) {
      count = 0
      start = new Date(parseInt(recurrence.start) * 1000)
      const expire: Date = new Date(parseInt(recurrence.expire) * 1000)
      const interval: number = recurrence.interval
      
      if (interval == 604800) {
        while (start < expire) {
          count++
          start.setDate(start.getDate() + 7)
        }
        weekDay = helper.getKeyByValue(weekDays, (start).getDay())
      }
      else if (interval == 86400) {
        count = expire.getDate() - start.getDate()
        weekDay = 'daily'
      }
      else {
        weekDay = 'none'
        count = 1
      }

      schedule[index].content.push({
        recurrenceId: recurrence.id,
        start: start, lessons: count, repeat: weekDay, expires: expire })
    }
    index++
  }

  res.send(schedule)
})

app.post('/lesson/update', async (req: any, res: any) => {
  const request = req.body[0]
  const lessonId: number = request.lesson
  const weekIndex: number = request.weekIndex
  const lesson:number = request.newDate

})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})