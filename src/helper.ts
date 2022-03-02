export const getKeyByValue = (object: any, value: any) =>{
  return Object.keys(object).find(key => object[key] === value);
}

export const nextDay = (d: Date, dow: number) => {
  d.setDate(d.getDate() + (dow + (7 - d.getDay())) % 7);
  return d.getTime() / 1000;
}

export const stringifyDate = (date: Date) => {
  return date.getDate() +
    "/" + (date.getMonth() + 1) +
    "/" + date.getFullYear() +
    " " + date.getHours() +
    ":" + date.getMinutes()
}