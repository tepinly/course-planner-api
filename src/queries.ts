const createLessonRecord = async (user: number, title: string, description: string) => {
  const newLesson = await prisma.lesson.create({
    data: {
      user: user,
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

const lessonRecurrence = async (lessonId: number) => {
  const recurrences = await prisma.recurrence.findMany({
    where: {
      lessonId: {
        equals: lessonId
      }
    }
  })

  return recurrences
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
    recurrences.push(lessonRecurrence(lesson.id))
  }

  return recurrences
}

module.exports = {
  createLessonRecord: createLessonRecord,
  createRecurrenceRecord: createRecurrenceRecord,
  fetchLessons: fetchLessons
};