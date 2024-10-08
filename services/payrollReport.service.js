const sqlite3 = require("sqlite3").verbose();
const _ = require("lodash");
const {
  getPayDateRange,
  formatDollarAmountFromNumber,
} = require("../utils/payroll-reporting.utils");

const JOB_GROUP_A_RATE = 20;
const JOB_GROUP_B_RATE = 30;

/**
 * return the amount paid to the employee for the
 * given hours worked and the job group.
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
 * fetches all employees from the database.
 */
const getAllEmployees = () => {
  const db = new sqlite3.Database("employee-payroll.db");
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM employees", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * returns the payroll report for the employees stored
 * in the database.
 */
const getReport = async () => {
  try {
    const employees = await getAllEmployees();
    let employeeReport = [];
    for (const employee of employees) {
      // get pay period
      const { startDate, endDate } = getPayDateRange(employee.date);

      // calculate amount paid
      const amountPaid = getAmountPaid(
        employee.hours_worked,
        employee.job_group
      );

      const report = {
        employeeId: employee.employee_id,
        payPeriod: {
          startDate: startDate,
          endDate: endDate,
        },
        amountPaid: amountPaid,
      };
      employeeReport.push(report);
    }

    // sort the data
    const sortedEmployeeReport = _.orderBy(
      employeeReport,
      ["employeeId", "payPeriod.startDate"],
      ["asc", "asc"]
    );

    return sortedEmployeeReport;
  } catch (err) {
    console.error("Error retrieving employees:", err);
  }
};

module.exports = { getReport };
