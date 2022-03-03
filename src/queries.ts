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
      lessonId: lessonId
    }
  })

  return await recurrence
}

export const fetchUniqueRecurrence = async (recurrenceId: number) => {
  const recurrence = await prisma.recurrence.findUnique({
    where: {
      id: recurrenceId
    }
  })

  return await recurrence
}

export const fetchLessons = async (userId: number) => {
  const lessons = await prisma.lesson.findMany({
    where: {
      user: userId
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
      id: lessonId
    }
  })

  let recurrence = await fetchRecurrence(lesson.id)

  return { recurrence: recurrence, lesson: await lesson }
}

export const updateLesson = async (lessonId: number, newTitle: string, newDescription: string) => {
  const updatedTitle = newTitle.length == 0 ? '' : await prisma.lesson.update({
    where: {
      id: lessonId
    },
    data: {
      title: newTitle
    }
  })

  const updatedDescription = newDescription.length == 0 ? '' : await prisma.lesson.update({
    where: {
      id: lessonId
    },
    data: {
      description: newDescription
    }
  })
}

export const updateSingleRecurrence = async (recurrenceId: number, newDate: string) => {
  const updated = await prisma.recurrence.update({
    where: {
     id: recurrenceId
    },
    data: {
      start: newDate,
      expire: newDate
    }
  })

  return await updated
}

export const updatePatternRecurrence = async (recurrenceId: number, index: number, newDate: number, followUp: Boolean) => {
  const recurrence = await fetchUniqueRecurrence(recurrenceId)
  const interval = await recurrence.interval
  const expDate = await recurrence.expire
  const startDate = parseInt(await recurrence.start)

  const indexDate: number = startDate + (await interval * index)

  const updated = await prisma.recurrence.update({
    where: {
      id: recurrenceId
    },
    data: {
      expire: String(indexDate - await interval)
    }
  })

  if (!followUp && indexDate + interval <= parseInt(expDate)) {
    await createRecurrenceRecord(recurrence.lessonId, 0, String(newDate), String(newDate))
    await createRecurrenceRecord(recurrence.lessonId, interval, String(indexDate + interval), String(expDate))
    return await updated
  }

  createRecurrenceRecord(recurrence.lessonId, interval, String(newDate), String(expDate))
  return await updated
}

export const deleteLesson = async (lessonId: number) => {
  const deleteRecurrence = prisma.recurrence.deleteMany ({
    where: {
      lessonId : lessonId
    }
  })

  const deleteLesson = prisma.lesson.delete({
    where: {
      id: lessonId
    }
  })

  return await prisma.$transaction([deleteRecurrence, deleteLesson])
}

export const deleteSingleRecurrence = async (recurrenceId: number) => {
  const deleteRecurrence = await prisma.recurrence.delete({
    where: {
      id: recurrenceId
    }
  })

  return await deleteRecurrence
}

export const deletePatternRecurrence = async (recurrenceId: number, index: number, followUp: Boolean) => {
  if (index == 0) return await prisma.recurrence.delete({
    where: {
      id: recurrenceId
    }
  })

  const recurrence = await fetchUniqueRecurrence(recurrenceId)
  const interval = await recurrence.interval
  const expDate = await recurrence.expire
  const startDate = parseInt(await recurrence.start)

  const indexDate: number = startDate + (await interval * index)

  const updated = await prisma.recurrence.update({
    where: {
      id: recurrenceId
    },
    data: {
      expire: String(indexDate - await interval)
    }
  })
  
  if (!followUp && (indexDate + interval) <= parseInt(expDate)) return await createRecurrenceRecord(recurrence.lessonId, interval, String(indexDate + interval), String(expDate))
  
  const deleteRecurrence = await prisma.recurrence.delete({
    where: {
      id: recurrenceId
    }
  })

  return await deleteRecurrence
}