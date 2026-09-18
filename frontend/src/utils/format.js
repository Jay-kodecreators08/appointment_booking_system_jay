const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// "2026-09-18" -> "18 Sep 2026"
export function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// "09:00" -> "09:00 AM"
export function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
}

export function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

// Every 15-minute time from 00:00 to 23:45 as "HH:mm", for a plain <select>
// time picker (avoids the native <input type="time"> scroll-wheel widget).
export function timeOptions(stepMinutes = 15) {
  const options = [];
  for (let m = 0; m < 24 * 60; m += stepMinutes) {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    options.push(`${h}:${mm}`);
  }
  return options;
}
