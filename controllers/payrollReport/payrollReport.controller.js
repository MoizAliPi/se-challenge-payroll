const express = require("express");
const payrollReportService = require("../../services/payrollReport.service");

const router = express.Router();

/**
 * Returns the payroll report of all employees.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.get("/", async (req, res) => {
  payrollReportService
    .getReport()
    .then((report) => {
      res.status(200).json({
        payrollReport: {
          employeeReport: report,
        },
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error getting the payroll report");
    });
});

module.exports = router;
