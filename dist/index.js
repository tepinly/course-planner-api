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
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
function nextDay(d, dow) {
    d.setDate(d.getDate() + (dow + (7 - d.getDay())) % 7);
    return d.getTime() / 1000;
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`received`);
}));
/**
 * Date is passed as string in format YYYY-MM-DD
 * Recurrence is array of week days
 */
app.post('/lesson/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const lesson = req.body[0];
    let startDate = String(new Date(lesson.start).getTime() / 1000);
    let expDate = String(new Date((_a = lesson.exp) !== null && _a !== void 0 ? _a : lesson.start).getTime() / 1000);
    let interval;
    const newLesson = yield queries.createLessonRecord(lesson.user, lesson.title, lesson.description);
    if (lesson.recurrence.length === 0) {
        const newRecurrence = yield queries.createRecurrenceRecord(yield newLesson.id, interval = 0, startDate, startDate);
    }
    else if (lesson.recurrence[0].match('all')) {
        interval = 24 * 60 * 60;
        const newRecurrence = yield queries.createRecurrenceRecord(yield newLesson.id, interval, startDate, expDate);
    }
    else {
        const days = lesson.recurrence.filter((day) => day in weekDays).map((day) => weekDays[day]);
        interval = 7 * 24 * 60 * 60;
        const temp = new Date(parseInt(startDate) * 1000);
        const lessonKey = yield newLesson.id;
        let start;
        for (const day of days) {
            start = String(nextDay(temp, day));
            const newRecurrence = yield queries.createRecurrenceRecord(lessonKey, interval, start, expDate);
        }
    }
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
        schedule.push({ lesson: index, title: userLessons.lessons[index].title, description: userLessons.lessons[index].description, content: [] });
        for (const recurrence of lesson) {
            count = 0;
            start = new Date(parseInt(recurrence.start) * 1000);
            const expire = new Date(parseInt(recurrence.expire) * 1000);
            const interval = recurrence.interval;
            if (interval == 604800) {
                count = Math.floor((expire.getDate() - start.getDate()) / 7);
                weekDay = getKeyByValue(weekDays, (start).getDay());
            }
            else if (interval == 86400) {
                count = expire.getDate() - start.getDate();
                weekDay = 'daily';
            }
            else {
                weekDay = 'none';
                count = 1;
            }
            schedule[index].content.push({
                start: start.getDate() +
                    "/" + (start.getMonth() + 1) +
                    "/" + start.getFullYear(), lessons: count, repeat: weekDay, expires: expire.getDate() +
                    "/" + (expire.getMonth() + 1) +
                    "/" + expire.getFullYear()
            });
        }
        index++;
    }
    res.send(schedule);
}));
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
