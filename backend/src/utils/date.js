// All appointment dates are handled as plain YYYY-MM-DD strings and stored
// as UTC-midnight Date objects, so local timezone never shifts the day.
function parseDateOnly(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function isValidDateString(dateString) {
  return typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !Number.isNaN(parseDateOnly(dateString).getTime());
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function isPastDate(dateString) {
  return dateString < todayDateString();
}

module.exports = { parseDateOnly, formatDateOnly, isValidDateString, todayDateString, isPastDate };
