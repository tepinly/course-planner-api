"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyDate = exports.nextDay = exports.getKeyByValue = void 0;
const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
};
exports.getKeyByValue = getKeyByValue;
const nextDay = (d, dow) => {
    d.setDate(d.getDate() + (dow + (7 - d.getDay())) % 7);
    return d.getTime() / 1000;
};
exports.nextDay = nextDay;
const stringifyDate = (date) => {
    return date.getDate() +
        "/" + (date.getMonth() + 1) +
        "/" + date.getFullYear() +
        " " + date.getHours() +
        ":" + date.getMinutes();
};
exports.stringifyDate = stringifyDate;
