const sqlite3 = require("sqlite3").verbose();

/**
 * Uploads the given csv array data to the database.
 * throws an error if the data could not be inserted
 * into the database.
 */
function upload(data) {
  const db = new sqlite3.Database("employee-time-report.db");
  try {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const sql = `INSERT INTO time_report (employee_id, hours_worked, job_group, date) VALUES (?, ?, ?, ?)`;
      const stmt = db.prepare(sql);

      for (const row of data) {
        const employee_id = row["employee id"];
        const hours_worked = row["hours worked"];
        const job_group = row["job group"];
        const date = row.date;

        stmt.run(employee_id, hours_worked, job_group, date, (err) => {
          if (err) {
            throw err;
          }
        });
      }

      stmt.finalize();
      db.run("COMMIT");
    });

    return "CSV file uploaded successfully!";
  } catch (error) {
    throw error;
  }
}

module.exports = { upload };
