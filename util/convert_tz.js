function convertTimezone(time) {
  const TIME_DIFF = 8;
  const convertedTimestamp = time.setHours(time.getHours() + TIME_DIFF);
  const convertedDate = new Date(convertedTimestamp).toString().slice(0, 15);
  return convertedDate;
}

module.exports = convertTimezone;
