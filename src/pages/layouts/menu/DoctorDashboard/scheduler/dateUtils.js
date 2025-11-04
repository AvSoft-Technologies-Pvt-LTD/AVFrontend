/**
 * Utility functions for handling API date format [year, month, day]
 */

/**
 * Convert API date array [2025, 9, 1] to JavaScript Date object
 * Note: API month is 1-indexed (1-12), JS Date month is 0-indexed (0-11)
 */
export const apiDateToJSDate = (apiDate) => {
  if (!apiDate || !Array.isArray(apiDate) || apiDate.length < 3) {
    return null;
  }
  const [year, month, day] = apiDate;
  return new Date(year, month - 1, day);
};

/**
 * Convert JavaScript Date object to API date array [year, month, day]
 * Note: JS Date month is 0-indexed (0-11), API month is 1-indexed (1-12)
 */
export const jsDateToAPIDate = (jsDate) => {
  if (!(jsDate instanceof Date) || isNaN(jsDate)) {
    return null;
  }
  return [jsDate.getFullYear(), jsDate.getMonth() + 1, jsDate.getDate()];
};

/**
 * Convert date string "YYYY-MM-DD" to API date array [year, month, day]
 */
export const dateStringToAPIDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return [year, month, day];
};

/**
 * Convert API date array to date string "YYYY-MM-DD"
 */
export const apiDateToString = (apiDate) => {
  if (!apiDate || !Array.isArray(apiDate) || apiDate.length < 3) {
    return null;
  }
  const [year, month, day] = apiDate;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Convert date string "YYYY-MM-DD" to JavaScript Date object
 */
export const dateStringToJSDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Convert JavaScript Date to "YYYY-MM-DD" string
 */
export const jsDateToString = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
