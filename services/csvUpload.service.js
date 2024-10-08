const sqlite3 = require("sqlite3").verbose();

/**
 * Uploads the given csv array data to the database.
 * throws an error if the data could not be inserted
 * into the database.
 */
function upload(data) {
  const db = new sqlite3.Database("employee-payroll.db");
  try {
    const sql = `INSERT INTO employees (employee_id, hours_worked, job_group, date) VALUES (?, ?, ? , ?)`;

    for (const row of data) {
      const employee_id = row["employee id"];
      const hours_worked = row["hours worked"];
      const job_group = row["job group"];
      const date = row.date;

      db.run(sql, [employee_id, hours_worked, job_group, date], (err) => {
        if (err) {
          console.error(err);
          throw err;
        }
      });
    }

    return "CSV file uploaded successfully!";
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to allow the controller to handle it
  }
}

module.exports = { upload };
