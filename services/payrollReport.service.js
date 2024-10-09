const sqlite3 = require("sqlite3").verbose();
const _ = require("lodash");
const {
  getPayDateRange,
  formatDollarAmountFromNumber,
  formatDateStringIntoDate,
} = require("../utils/payroll-reporting.utils");

const JOB_GROUP_A_RATE = 20;
const JOB_GROUP_B_RATE = 30;

/**
 * return the amount paid to the employee for the
 * given hours worked and the job group.
 *
 * @param {Number} hoursWorked
 * @param {String} jobGroup
 */
const getAmountPaid = (hoursWorked, jobGroup) => {
  if (jobGroup == "A") {
    return formatDollarAmountFromNumber(hoursWorked * JOB_GROUP_A_RATE);
  }

  return formatDollarAmountFromNumber(hoursWorked * JOB_GROUP_B_RATE);
};

/**
 * Adds the dollar amount to a report if it exists within the
 * pay period.
 *
 * @param {Number} newAmount
 * @param {String} currentAmount
 */
const addAmountToExistingReport = (newAmount, currentAmount) => {
  const curr_amount = parseFloat(currentAmount.replace("$", ""));
  const new_amount = parseFloat(newAmount.replace("$", ""));

  return formatDollarAmountFromNumber(new_amount + curr_amount);
};

/**
 * returns boolean indicating whether the given date
 * resides between the current pay period or not.
 *
 * @param {String} givenDate
 * @param {String} currentStartDate
 * @param {String} currentEndDate
 */
const isWithinCurrenPayPeriod = (
  givenDate,
  currentStartDate,
  currentEndDate
) => {
  const parsedGivenDate = new Date(givenDate);
  const parsedStartDate = new Date(currentStartDate);
  const parsedEndDate = new Date(currentEndDate);

  return parsedGivenDate >= parsedStartDate && parsedGivenDate <= parsedEndDate;
};

/**
 * fetches all employees from the database.
 */
const getAllTimeReports = () => {
  const db = new sqlite3.Database("employee-time-report.db");
  // return the list of reports grouped by each employeeId
  // and ordered by employeeId and date.
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM time_report GROUP BY employee_id, date ORDER BY employee_id asc, strftime('%Y-%m-%d', SUBSTR(date, 7, 4) || '-' || SUBSTR(date, 4, 2) || '-' || SUBSTR(date, 1, 2)) ASC;",
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

/**
 * returns the payroll report for the employees stored
 * in the database.
 */
const getReport = async () => {
  try {
    const timeReports = await getAllTimeReports();
    // calculating the report for first record in the table
    // to allow comparison with the next available record in
    // the loop.
    const { startDate, endDate } = getPayDateRange(timeReports[0].date);
    let employeeReport = [
      {
        employeeId: timeReports[0].employee_id,
        payPeriod: { startDate: startDate, endDate: endDate },
        amountPaid: getAmountPaid(
          timeReports[0].hours_worked,
          timeReports[0].job_group
        ),
      },
    ];
    let currentStartDate = startDate;
    let currentEndDate = endDate;

    for (let i = 1; i < timeReports.length; i++) {
      // if the current time report also exists in the pay period
      // for the same employee then get the paid amount and append
      // it to the previously stored employee report.
      const parsedGivenDate = formatDateStringIntoDate(timeReports[i].date);
      if (
        isWithinCurrenPayPeriod(
          parsedGivenDate,
          currentStartDate,
          currentEndDate
        ) &&
        employeeReport[employeeReport.length - 1].employeeId ==
          timeReports[i].employee_id
      ) {
        const amountPaid = getAmountPaid(
          timeReports[i].hours_worked,
          timeReports[i].job_group
        );
        employeeReport[employeeReport.length - 1].amountPaid =
          addAmountToExistingReport(
            amountPaid,
            employeeReport[employeeReport.length - 1].amountPaid
          );
      } else {
        // create a new report for a different pay period then the current one.
        const { startDate, endDate } = getPayDateRange(timeReports[i].date);
        currentStartDate = startDate;
        currentEndDate = endDate;
        // calculate amount paid
        const amountPaid = getAmountPaid(
          timeReports[i].hours_worked,
          timeReports[i].job_group
        );
        const report = {
          employeeId: timeReports[i].employee_id,
          payPeriod: {
            startDate: startDate,
            endDate: endDate,
          },
          amountPaid: amountPaid,
        };
        employeeReport.push(report);
      }
    }

    // sort the data
    const sortedEmployeeReport = _.orderBy(
      employeeReport,
      ["employeeId", "payPeriod.startDate"],
      ["asc", "asc"]
    );

    return sortedEmployeeReport;
  } catch (err) {
    throw new Error(`Error generating report: ${err.message}`);
  }
};

module.exports = { getReport };
