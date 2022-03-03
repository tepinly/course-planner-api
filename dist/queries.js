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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePatternRecurrence = exports.deleteSingleRecurrence = exports.deleteLesson = exports.updatePatternRecurrence = exports.updateSingleRecurrence = exports.updateLesson = exports.fetchUniqueLesson = exports.fetchLessons = exports.fetchUniqueRecurrence = exports.fetchRecurrence = exports.createRecurrenceRecord = exports.createLessonRecord = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createLessonRecord = (user, title, description) => __awaiter(void 0, void 0, void 0, function* () {
    const newLesson = yield prisma.lesson.create({
        data: {
            user: user,
            title: title,
            description: description
        }
    });
    return yield newLesson;
});
exports.createLessonRecord = createLessonRecord;
const createRecurrenceRecord = (id, interval, startDate, expDate) => __awaiter(void 0, void 0, void 0, function* () {
    const newRecurrence = yield prisma.recurrence.create({
        data: {
            lessonId: id,
            interval: interval,
            start: startDate,
            expire: expDate
        }
    });
    return yield newRecurrence;
});
exports.createRecurrenceRecord = createRecurrenceRecord;
const fetchRecurrence = (lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    const recurrence = yield prisma.recurrence.findMany({
        where: {
            lessonId: lessonId
        }
    });
    return yield recurrence;
});
exports.fetchRecurrence = fetchRecurrence;
const fetchUniqueRecurrence = (recurrenceId) => __awaiter(void 0, void 0, void 0, function* () {
    const recurrence = yield prisma.recurrence.findUnique({
        where: {
            id: recurrenceId
        }
    });
    return yield recurrence;
});
exports.fetchUniqueRecurrence = fetchUniqueRecurrence;
const fetchLessons = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const lessons = yield prisma.lesson.findMany({
        where: {
            user: userId
        }
    });
    let recurrences = [];
    for (const lesson of lessons) {
        recurrences.push(yield (0, exports.fetchRecurrence)(lesson.id));
    }
    return { recurrences: recurrences, lessons: yield lessons };
});
exports.fetchLessons = fetchLessons;
const fetchUniqueLesson = (lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    const lesson = yield prisma.lesson.findUnique({
        where: {
            id: lessonId
        }
    });
    let recurrence = yield (0, exports.fetchRecurrence)(lesson.id);
    return { recurrence: recurrence, lesson: yield lesson };
});
exports.fetchUniqueLesson = fetchUniqueLesson;
const updateLesson = (lessonId, newTitle, newDescription) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedTitle = newTitle.length == 0 ? '' : yield prisma.lesson.update({
        where: {
            id: lessonId
        },
        data: {
            title: newTitle
        }
    });
    const updatedDescription = newDescription.length == 0 ? '' : yield prisma.lesson.update({
        where: {
            id: lessonId
        },
        data: {
            description: newDescription
        }
    });
});
exports.updateLesson = updateLesson;
const updateSingleRecurrence = (recurrenceId, newDate) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield prisma.recurrence.update({
        where: {
            id: recurrenceId
        },
        data: {
            start: newDate,
            expire: newDate
        }
    });
    return yield updated;
});
exports.updateSingleRecurrence = updateSingleRecurrence;
const updatePatternRecurrence = (recurrenceId, index, newDate, followUp) => __awaiter(void 0, void 0, void 0, function* () {
    const recurrence = yield (0, exports.fetchUniqueRecurrence)(recurrenceId);
    const interval = yield recurrence.interval;
    const expDate = yield recurrence.expire;
    const startDate = parseInt(yield recurrence.start);
    const indexDate = startDate + ((yield interval) * index);
    const updated = yield prisma.recurrence.update({
        where: {
            id: recurrenceId
        },
        data: {
            expire: String(indexDate - (yield interval))
        }
    });
    if (!followUp) {
        yield (0, exports.createRecurrenceRecord)(recurrence.lessonId, 0, String(newDate), String(newDate));
        yield (0, exports.createRecurrenceRecord)(recurrence.lessonId, interval, String(indexDate + interval), String(expDate));
        return yield updated;
    }
    (0, exports.createRecurrenceRecord)(recurrence.lessonId, interval, String(newDate), String(expDate));
    return yield updated;
});
exports.updatePatternRecurrence = updatePatternRecurrence;
const deleteLesson = (lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteRecurrence = prisma.recurrence.deleteMany({
        where: {
            lessonId: lessonId
        }
    });
    const deleteLesson = prisma.lesson.delete({
        where: {
            id: lessonId
        }
    });
    return yield prisma.$transaction([deleteRecurrence, deleteLesson]);
});
exports.deleteLesson = deleteLesson;
const deleteSingleRecurrence = (recurrenceId) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteRecurrence = yield prisma.recurrence.delete({
        where: {
            id: recurrenceId
        }
    });
    return yield deleteRecurrence;
});
exports.deleteSingleRecurrence = deleteSingleRecurrence;
const deletePatternRecurrence = (recurrenceId, index, followUp) => __awaiter(void 0, void 0, void 0, function* () {
    const recurrence = yield (0, exports.fetchUniqueRecurrence)(recurrenceId);
    const interval = yield recurrence.interval;
    const expDate = yield recurrence.expire;
    const startDate = parseInt(yield recurrence.start);
    const indexDate = startDate + ((yield interval) * index);
    const updated = yield prisma.recurrence.update({
        where: {
            id: recurrenceId
        },
        data: {
            expire: String(indexDate - (yield interval))
        }
    });
    const deleteRecurrence = yield prisma.recurrence.delete({
        where: {
            id: recurrenceId
        }
    });
    if (!followUp)
        yield (0, exports.createRecurrenceRecord)(recurrence.lessonId, interval, String(indexDate + interval), String(expDate));
    return yield deleteRecurrence;
});
exports.deletePatternRecurrence = deletePatternRecurrence;
