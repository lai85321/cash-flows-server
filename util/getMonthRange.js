function getMonthRange(time) {
  const startTime = new Date(parseInt(time));
  const endTime = new Date(parseInt(time));
  endTime.setMonth(startTime.getMonth() + 1);
  const utcStart = new Date(startTime.toUTCString().slice(0, -4));
  const utcEnd = new Date(endTime.toUTCString().slice(0, -4));
  const monthRange = { start: utcStart, end: utcEnd };
  return monthRange;
}

module.exports = getMonthRange;
