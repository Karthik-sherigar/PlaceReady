/**
 * Calculates the time remaining until a placement drive.
 * @param {string} driveDate - ISO date string
 * @param {string} driveTime - Time string (e.g., "10:00")
 * @returns {object} - { days, hours, minutes, seconds, completed, displayString }
 */
export const calculateTimeLeft = (driveDate, driveTime) => {
  if (!driveDate || !driveTime) return { completed: true };

  const target = new Date(`${driveDate.split('T')[0]}T${driveTime}`);
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    return { completed: true };
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return {
    days: d,
    hours: h,
    minutes: m,
    seconds: s,
    completed: false,
    displayString: `${d}d ${h}h ${m}m ${s < 10 ? '0' + s : s}s`
  };
};
