const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const csvUploadRouter = require("../controllers/csvUpload.controller");
const payrollReportRouter = require("../controllers/payrollReport.controller");

// Create a database connection
const db = new sqlite3.Database("employee-time-report.db", (err) => {
  if (err) {
    console.error(err);
  }
  console.log("Connected to database");
});

router.get("/health", (_req, res) => {
  db.all("SELECT * FROM time_report", (err, rows) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).json({ status: "Cannot connect to database" });
    } else {
      console.log("Rows:", rows);
      res.status(200).json({ status: "OK" });
    }
  });
});
router.use("/upload-csv", csvUploadRouter);
router.use("/payroll-report", payrollReportRouter);

module.exports = router;
