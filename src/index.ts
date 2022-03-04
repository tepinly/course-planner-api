const express = require('express')
const app = express()
app.use(express.json())
const queries = require('./queries')
const helper = require('./helper')
const jwt = require('jsonwebtoken')

require('dotenv').config()
const { PORT, TOKEN_SECRET } = process.env

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

  if (!lesson.hasOwnProperty('recurrence')) return await queries.createRecurrenceRecord(lessonId, interval = 0, startDate, startDate)
  if (lesson.recurrence[0].match('all')) return await queries.createRecurrenceRecord(lessonId, interval = 24 * 60 * 60, startDate, expDate)

  const days: Array<number> = lesson.recurrence.filter((day: string) => day in weekDays).map((day: string) => weekDays[day])
  const temp: Date = new Date(parseInt(startDate) * 1000)
  const lessonKey = lessonId
  let start: string

  for (const day of days) {
    start = String(helper.nextDay(temp, day))
    await queries.createRecurrenceRecord(lessonKey, interval = 7 * 24 * 60 * 60, start, expDate)
  }
}

function generateAccessToken(username: any) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, TOKEN_SECRET as string, (err: any, user: any) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

app.get('/', async (req: any, res: any) => {
  res.send(`received`)
})

app.post('/generateToken', (req: any, res: any) => {
  const token = generateAccessToken({ username: req.body.username });
  res.json(token);
});

/**
 * Date is passed as string in UTC format
 * Recurrence is array of week days
 */
app.post('/lesson/create', authenticateToken, async (req: any, res: any) => {
  const lesson: Lesson = req.body[0]

  let startDate: string = String(new Date(lesson.start).getTime() / 1000)
  let expDate: string = String(new Date(lesson.exp ? lesson.exp : lesson.start).getTime() / 1000)
  const newLesson = await queries.createLessonRecord(lesson.user, lesson.title, lesson.description)
  await createRecurrence(await newLesson.id, lesson, startDate, expDate)

  res.send(`Record created 👌`)
})

app.get('/lesson/fetch', authenticateToken, async (req: any, res: any) => {
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
        count = Math.floor((expire.getDate() - start.getDate()) / 7) + 1
        weekDay = helper.getKeyByValue(weekDays, (start).getDay())
      }
      else if (interval == 86400) {
        count = expire.getDate() - start.getDate() + 1
        weekDay = 'daily'
      }
      else {
        weekDay = helper.getKeyByValue(weekDays, (start).getDay())
        count = 1
      }

      schedule[index].content.push({
        recurrenceId: recurrence.id,
        start: start, lessons: count, weekDay: weekDay, expires: expire })
    }
    index++
  }

  res.send(schedule)
})

app.put('/lesson/update', authenticateToken, async (req: any, res: any) => {
  const request = req.body[0]

  const newTitle: string = request.hasOwnProperty('newTitle')  ? request.newTitle : ''
  const newDescription: string = request.hasOwnProperty('newDescription')  ? request.newDescription : ''
  if (newTitle.length > 0 || newDescription.length > 0) await queries.updateLesson(request.lessonId, newTitle, newDescription)

  if (request.hasOwnProperty('recurrenceId')) {
    const newDate = new Date(request.newDate).getTime() / 1000
    const recurrence = await queries.fetchUniqueRecurrence(request.recurrenceId)
    const originalInterval = await recurrence.interval

    if (await originalInterval == 0) {
      await queries.updateSingleRecurrence(request.recurrenceId, newDate)
      return res.send(`Lesson updated 👌`)
    }

    await queries.updatePatternRecurrence(request.recurrenceId, request.index, newDate, request.hasOwnProperty('followUp') ? true : false)
  }

  res.send(`Lesson updated 👌`)
})

app.delete('/lesson/delete', authenticateToken, async (req: any, res: any) => {
  const request = req.body[0]
  
  if (request.hasOwnProperty('lessonId')) {
    await queries.deleteLesson(request.lessonId)
    return res.send(`Lesson deleted 🚮`)
  }

  const recurrence = await queries.fetchUniqueRecurrence(request.recurrenceId)
  const lessonId = await recurrence.lessonId
  const originalInterval = await recurrence.interval

  if (await originalInterval == 0) {
    await queries.deleteSingleRecurrence(request.recurrenceId)
    res.send(`Recurrence deleted 🚮`)
  }
  else await queries.deletePatternRecurrence(request.recurrenceId, request.hasOwnProperty('index') ? request.index : 0, request.hasOwnProperty('followUp') ? true : false)

  const lesson = await queries.fetchUniqueLesson(lessonId)
  if (lesson.recurrence.length == 0) await queries.deleteLesson(lessonId)

  res.send(`Recurrence deleted 🚮`)
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})