const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createLessonRecord = async (user: number, title: string, description: string) => {
  const newLesson = await prisma.lesson.create({
    data: {
      user: user,
      title: title,
      description: description
    }
  })
  return await newLesson
}

const createRecurrenceRecord = async (id: number, interval: number, startDate: string, expDate: string) => {
  const newRecurrence = await prisma.recurrence.create({
    data: {
      lessonId: id,
      interval: interval,
      start: startDate,
      expire: expDate
    }
  })
  return await newRecurrence
}

const fetchRecurrence = async (lessonId: number) => {
  const recurrence = await prisma.recurrence.findMany({
    where: {
      lessonId: {
        equals: lessonId
      }
    }
  })

  return await recurrence
}

const fetchUniqueRecurrence = async (recurrenceId: number) => {
  const recurrence = await prisma.recurrence.findUnique({
    where: {
      id: {
        equals: recurrenceId
      }
    }
  })

  return await recurrence
}

const fetchLessons = async (userId: number) => {
  const lessons = await prisma.lesson.findMany({
    where: {
      user: {
        equals: userId
      }
    }
  })

  let recurrences: Array<any> = []

  for (const lesson of lessons) {
    recurrences.push(await fetchRecurrence(lesson.id))
  }

  return { recurrences: recurrences, lessons: await lessons }
}

const fetchUniqueLesson = async (lessonId: number) => {
  const lesson = await prisma.lesson.findUnique({
    where: {
      lesson: {
        equals: lessonId
      }
    }
  })

  let recurrence = await fetchRecurrence(lesson.id)

  return { recurrence: recurrence, lesson: await lesson }
}

module.exports = {
  createLessonRecord: createLessonRecord,
  createRecurrenceRecord: createRecurrenceRecord,
  fetchLessons: fetchLessons
};