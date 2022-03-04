/* Get object key by passing value */
export const getKeyByValue = (object: any, value: any) =>{
  return Object.keys(object).find(key => object[key] === value);
}

/* Get the nearest weekDay from the start date */
export const nextDay = (d: Date, dow: number) => {
  d.setDate(d.getDate() + (dow + (7 - d.getDay())) % 7);
  return d.getTime() / 1000;
}