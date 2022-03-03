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
const express = require('express');
const app = express();
app.use(express.json());
const queries = require('./queries');
const helper = require('./helper');
require('dotenv').config();
const { PORT } = process.env;
const weekDays = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
    all: 7
};
function createRecurrence(lessonId, lesson, startDate, expDate) {
    return __awaiter(this, void 0, void 0, function* () {
        let interval;
        if (lesson.recurrence.length === 0) {
            const newRecurrence = yield queries.createRecurrenceRecord(lessonId, interval = 0, startDate, startDate);
        }
        else if (lesson.recurrence[0].match('all')) {
            interval = 24 * 60 * 60;
            const newRecurrence = yield queries.createRecurrenceRecord(lessonId, interval, startDate, expDate);
        }
        else {
            const days = lesson.recurrence.filter((day) => day in weekDays).map((day) => weekDays[day]);
            interval = 7 * 24 * 60 * 60;
            const temp = new Date(parseInt(startDate) * 1000);
            const lessonKey = lessonId;
            let start;
            for (const day of days) {
                start = String(helper.nextDay(temp, day));
                const newRecurrence = yield queries.createRecurrenceRecord(lessonKey, interval, start, expDate);
            }
        }
    });
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`received`);
}));
/**
 * Date is passed as string in UTC format
 * Recurrence is array of week days
 */
app.post('/lesson/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const lesson = req.body[0];
    let startDate = String(new Date(lesson.start).getTime() / 1000);
    let expDate = String(new Date((_a = lesson.exp) !== null && _a !== void 0 ? _a : lesson.start).getTime() / 1000);
    const newLesson = yield queries.createLessonRecord(lesson.user, lesson.title, lesson.description);
    yield queries.createRecurrence(yield newLesson.id, lesson, startDate, expDate);
    res.send(`Record created 👌`);
}));
app.get('/lesson/fetch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body[0].user;
    const userLessons = yield (queries.fetchLessons(userId));
    const schedule = [];
    let count;
    let start;
    let weekDay;
    let index = 0;
    for (const lesson of userLessons.recurrences) {
        schedule.push({ lessonId: userLessons.lessons[index].id, title: userLessons.lessons[index].title, description: userLessons.lessons[index].description, content: [] });
        for (const recurrence of lesson) {
            count = 0;
            start = new Date(parseInt(recurrence.start) * 1000);
            const expire = new Date(parseInt(recurrence.expire) * 1000);
            const interval = recurrence.interval;
            if (interval == 604800) {
                count = Math.floor((expire.getDate() - start.getDate()) / 7) + 1;
                weekDay = helper.getKeyByValue(weekDays, (start).getDay());
            }
            else if (interval == 86400) {
                count = expire.getDate() - start.getDate();
                weekDay = 'daily';
            }
            else {
                weekDay = helper.getKeyByValue(weekDays, (start).getDay());
                count = 1;
            }
            schedule[index].content.push({
                recurrenceId: recurrence.id,
                start: start, lessons: count, weekDay: weekDay, expires: expire
            });
        }
        index++;
    }
    res.send(schedule);
}));
app.put('/lesson/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body[0];
    const newTitle = request.hasOwnProperty('newTitle') ? request.newTitle : '';
    const newDescription = request.hasOwnProperty('newDescription') ? request.newDescription : '';
    if (newTitle.length > 0 || newDescription.length > 0)
        yield queries.updateLesson(request.lessonId, newTitle, newDescription);
    if (request.hasOwnProperty('recurrenceId')) {
        const newDate = new Date(request.newDate).getTime() / 1000;
        const recurrence = yield queries.fetchUniqueRecurrence(request.recurrenceId);
        const originalInterval = yield recurrence.interval;
        if ((yield originalInterval) == 0) {
            yield queries.updateSingleRecurrence(request.recurrenceId, newDate);
            return res.send(`Lesson updated 👌`);
        }
        yield queries.updatePatternRecurrence(request.recurrenceId, request.index, newDate, request.hasOwnProperty('followUp') ? true : false);
    }
    res.send(`Lesson updated 👌`);
}));
app.delete('/lesson/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body[0];
    if (request.hasOwnProperty('lessonId')) {
        yield queries.deleteLesson(request.lessonId);
        return res.send(`Lesson deleted 🚮`);
    }
    const recurrence = yield queries.fetchUniqueRecurrence(request.recurrenceId);
    const originalInterval = yield recurrence.interval;
    if ((yield originalInterval) == 0) {
        yield queries.deleteSingleRecurrence(request.recurrenceId);
    }
    yield queries.deletePatternRecurrence(request.recurrenceId, request.index, request.hasOwnProperty('followUp') ? true : false);
}));
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
