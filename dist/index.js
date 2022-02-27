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
    return d;
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`received`);
}));
/**
 * Date is passed as string in format YYYY-MM-DD
 * Recurrence is array of week days
 */
app.get('/lesson/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lesson = req.body[0];
    if (lesson.recurrence.length > 0) {
        if (lesson.recurrence[0].match('all')) {
            const interval = 24 * 60 * 60 * 1000;
            const startDate = new Date(lesson.start).getTime();
            const expDate = new Date(lesson.exp).getTime();
            res.send(`${interval} - ${startDate} - ${expDate}`);
            return;
        }
        const days = lesson.recurrence.filter((day) => day in weekDays).map((day) => weekDays[day]);
    }
}));
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
