"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const createLessonRecord = (user, title, description) => __awaiter(void 0, void 0, void 0, function* () {
    const newLesson = yield prisma.lesson.create({
        data: {
            user: user,
            title: title,
            description: description
        }
    });
    return newLesson;
});
const createRecurrenceRecord = (id, interval, startDate, expDate) => __awaiter(void 0, void 0, void 0, function* () {
    const newRecurrence = yield prisma.recurrence.create({
        data: {
            lessonId: id,
            interval: interval,
            start: startDate,
            expire: expDate
        }
    });
    return newRecurrence;
});
const lessonRecurrence = (lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    const recurrences = yield prisma.recurrence.findMany({
        where: {
            lessonId: {
                equals: lessonId
            }
        }
    });
    return recurrences;
});
const fetchLessons = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const lessons = yield prisma.lesson.findMany({
        where: {
            user: {
                equals: userId
            }
        }
    });
    let recurrences = [];
    for (const lesson of lessons) {
        recurrences.push(lessonRecurrence(lesson.id));
    }
    return recurrences;
});
module.exports = {
    createLessonRecord: createLessonRecord,
    createRecurrenceRecord: createRecurrenceRecord,
    fetchLessons: fetchLessons
};
