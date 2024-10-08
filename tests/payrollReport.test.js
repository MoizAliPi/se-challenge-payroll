const request = require("supertest");
const express = require("express");
const payrollReportService = require("../services/payrollReport.service");
const app = require("../app");

jest.mock("../services/payrollReport.service");

describe("GET /api/payroll-report", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock history between tests
  });

  it("should return 200 and the payroll report on success", async () => {
    const mockReport = [
      {
        employeeId: 1,
        payPeriod: { startDate: "2024-10-01", endDate: "2024-10-15" },
        amountPaid: "$100.00",
      },
      {
        employeeId: 2,
        payPeriod: { startDate: "2024-10-16", endDate: "2024-10-31" },
        amountPaid: "150.00",
      },
    ];

    payrollReportService.getReport.mockResolvedValue(mockReport);

    const response = await request(app).get("/api/payroll-report").expect(200);

    expect(response.body).toEqual({
      payrollReport: {
        employeeReport: mockReport,
      },
    });

    expect(payrollReportService.getReport).toHaveBeenCalledTimes(1);
  });

  it("should return 500 and an error message when service fails", async () => {
    payrollReportService.getReport.mockRejectedValue(
      new Error("Error generating report")
    );

    const response = await request(app).get("/api/payroll-report").expect(500);

    expect(response.text).toBe("Error getting the payroll report");
    expect(payrollReportService.getReport).toHaveBeenCalledTimes(1);
  });
});
