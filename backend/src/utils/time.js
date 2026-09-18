const SLOT_DURATION_MINUTES = 30;

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function isValidTimeFormat(time) {
  return typeof time === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

// Builds the full list of 30-minute slots between start and end (end exclusive
// as a slot start). Each slot is { startTime, endTime }.
function generateSlots(startTime, endTime, durationMinutes = SLOT_DURATION_MINUTES) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots = [];

  for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
    slots.push({
      startTime: minutesToTime(t),
      endTime: minutesToTime(t + durationMinutes),
    });
  }

  return slots;
}

// Half-open interval overlap: touching ranges (13:00-14:00 followed by
// 14:00-15:00) are NOT considered overlapping.
function rangesOverlap(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(endA) > timeToMinutes(startB);
}

module.exports = {
  SLOT_DURATION_MINUTES,
  timeToMinutes,
  minutesToTime,
  isValidTimeFormat,
  generateSlots,
  rangesOverlap,
};
