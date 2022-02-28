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
const axios = require('axios').default;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
const { PORT } = process.env;
const weekDays = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thur: 4,
    fri: 5,
    sat: 6,
    all: 7
};
function nextDay(d, dow) {
    d.setDate(d.getDate() + (dow + (7 - d.getDay())) % 7);
    return d.getTime() / 1000;
}
const createLessonRecord = (title, description) => __awaiter(void 0, void 0, void 0, function* () {
    const newLesson = yield prisma.lesson.create({
        data: {
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
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`received`);
}));
/**
 * Date is passed as string in format YYYY-MM-DD
 * Recurrence is array of week days
 */
app.get('/lesson/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const lesson = req.body[0];
    let startDate = new Date(lesson.start).getTime() / 1000;
    let expDate = new Date((_a = lesson.exp) !== null && _a !== void 0 ? _a : lesson.start).getTime() / 1000;
    let interval;
    const newLesson = yield createLessonRecord(lesson.title, lesson.description);
    if (lesson.recurrence.length === 0) {
        const newRecurrence = yield createRecurrenceRecord(yield newLesson.id, interval = 0, startDate, expDate);
    }
    else if (lesson.recurrence[0].match('all')) {
        interval = 24 * 60 * 60;
        const newRecurrence = yield createRecurrenceRecord(yield newLesson.id, interval, startDate, expDate);
    }
    else {
        const days = lesson.recurrence.filter((day) => day in weekDays).map((day) => weekDays[day]);
        interval = 7 * 24 * 60 * 60;
        const temp = new Date(startDate * 1000);
        const lessonKey = yield newLesson.id;
        for (const day of days) {
            startDate = nextDay(temp, day);
            console.log(startDate + "\n");
            const newRecurrence = yield createRecurrenceRecord(lessonKey, interval, startDate, expDate);
        }
    }
    res.send(`Record created 👌`);
}));
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
