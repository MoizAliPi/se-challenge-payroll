const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const csvUploadRouter = require("../controllers/csvUpload/csvUpload.controller");
const payrollReportRouter = require("../controllers/payrollReport/payrollReport.controller");

// Create a database connection
const db = new sqlite3.Database("employee-payroll.db", (err) => {
  if (err) {
    console.error(err);
  }
  console.log("Connected to database");
});

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
  db.all("SELECT * FROM employees", (err, rows) => {
    if (err) {
      console.error("Error querying database:", err);
    } else {
      console.log("Rows:", rows);
    }
  });
});
router.use("/upload-csv", csvUploadRouter);
router.use("/payroll-report", payrollReportRouter);

module.exports = router;
