"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextDay = exports.getKeyByValue = void 0;
/* Get object key by passing value */
const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
};
exports.getKeyByValue = getKeyByValue;
/* Get the nearest weekDay from the start date */
const nextDay = (d, dow) => {
    d.setDate(d.getDate() + (dow + (7 - d.getDay())) % 7);
    return d.getTime() / 1000;
};
exports.nextDay = nextDay;
