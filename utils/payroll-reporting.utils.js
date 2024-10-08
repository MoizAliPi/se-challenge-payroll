/**
 * For the given date string, returns the corresponding
 * start and end date from the first or second half of the
 * month. For e.g. returns 1st and 15th for the date 7th.
 * @param {String} date
 * @returns {Object} {startDate, endDate}
 */
const getPayDateRange = (date) => {
  const parsedDate = formatDateStringIntoDate(date);

  // Ensure the date is valid
  if (isNaN(parsedDate)) {
    throw new Error("Invalid date format");
  }

  const biweeklyStartDate = new Date(parsedDate);
  const isBefore16th = biweeklyStartDate.getDate() <= 15;

  const biweeklyEndDate = new Date(biweeklyStartDate);
  if (isBefore16th) {
    biweeklyStartDate.setDate(1);
    biweeklyEndDate.setDate(15);
  } else {
    biweeklyStartDate.setDate(16);
    biweeklyEndDate.setMonth(biweeklyEndDate.getMonth() + 1, 0);
  }

  return {
    startDate: formatDateIntoISODate(biweeklyStartDate),
    endDate: formatDateIntoISODate(biweeklyEndDate),
  };
};

/**
 * Parsing DD/MM/YYYY into a Date object.
 * @param {String} date
 */
const formatDateStringIntoDate = (date) => {
  const splitDate = date.split("/");
  const parsedDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
  return parsedDate;
};

/**
 * Parsing the date into the format of YYYY-MM-DD.
 * @param {Date} date
 * @returns {String} formatted date
 */
const formatDateIntoISODate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats the number amount in dollar string with decimal points.
 * @param {number} number
 * @returns {String} formatted amount
 */
const formatDollarAmountFromNumber = (number) => {
  return number
    ? `$${number.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : undefined;
};

module.exports = {
  getPayDateRange,
  formatDollarAmountFromNumber,
  formatDateStringIntoDate,
};
