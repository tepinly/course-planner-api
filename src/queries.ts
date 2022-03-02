const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export const createLessonRecord = async (user: number, title: string, description: string) => {
  const newLesson = await prisma.lesson.create({
    data: {
      user: user,
      title: title,
      description: description
    }
  })
  return await newLesson
}

export const createRecurrenceRecord = async (id: number, interval: number, startDate: string, expDate: string) => {
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

export const fetchRecurrence = async (lessonId: number) => {
  const recurrence = await prisma.recurrence.findMany({
    where: {
      lessonId: {
        equals: lessonId
      }
    }
  })

  return await recurrence
}

export const fetchUniqueRecurrence = async (recurrenceId: number) => {
  const recurrence = await prisma.recurrence.findUnique({
    where: {
      id: {
        equals: recurrenceId
      }
    }
  })

  return await recurrence
}

export const fetchLessons = async (userId: number) => {
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

export const fetchUniqueLesson = async (lessonId: number) => {
  const lesson = await prisma.lesson.findUnique({
    where: {
      lesson: {
        id: lessonId
      }
    }
  })

  let recurrence = await fetchRecurrence(lesson.id)

  return { recurrence: recurrence, lesson: await lesson }
}

export const updateLesson = async (lessonId: number, newTitle: string, newDescription: string) => {
  const updatedTitle = newTitle.length == 0 ? '' : await prisma.lesson.findUnique({
    where: {
      lesson: {
        id: lessonId
      }
    },
    data: {
      title: newTitle
    }
  })

  const updatedDescription = newDescription.length == 0 ? '' : await prisma.lesson.findUnique({
    where: {
      lesson: {
        id: lessonId
      }
    },
    data: {
      title: newDescription
    }
  })
}

export const updateSingleRecurrence = async (recurrenceId: number, newDate: string) => {
  const updated = await prisma.recurrence.findUnique({
    where: {
      recurrence: {
        id: recurrenceId
      }
    },
    data: {
      start: newDate,
      expire: newDate
    }
  })

  return await updated
}

export const updatePatternRecurrence = async (recurrenceId: number, index: number, newDate: number, split: Boolean) => {
  const recurrence = await queries.fetchUniqueRecurrence(recurrenceId)
  const interval = await recurrence.interval
  const expDate = await recurrence.expire
  const startDate = parseInt(await recurrence.start)

  const indexDate: number = startDate + (interval * index)

  const updated = await prisma.recurrence.findUnique({
    where: {
      recurrence: {
        id: recurrenceId
      }
    },
    data: {
      expire: String(indexDate - interval)
    }
  })

  if (split) {
    createRecurrenceRecord(recurrence.lessonId, interval, String(indexDate), String(indexDate))
    createRecurrenceRecord(recurrence.lessonId, interval, String(indexDate + interval), String(expDate))
    return await updated
  }

  createRecurrenceRecord(recurrence.lessonId, interval, String(indexDate), String(expDate))
  return await updated
}