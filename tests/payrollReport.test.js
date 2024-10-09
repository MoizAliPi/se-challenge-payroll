const sqlite3 = require("sqlite3");
const { getReport } = require("../services/payrollReport.service");
const {
  getPayDateRange,
  formatDollarAmountFromNumber,
  formatDateStringIntoDate,
} = require("../utils/payroll-reporting.utils");

jest.mock("sqlite3", () => {
  const mockDatabase = {
    all: jest.fn((query, callback) => {
      callback(null, []);
    }),
  };
  return {
    verbose: jest.fn().mockReturnValue({
      Database: jest.fn().mockImplementation(() => mockDatabase),
    }),
  };
});

jest.mock("../utils/payroll-reporting.utils", () => ({
  getPayDateRange: jest.fn(),
  formatDollarAmountFromNumber: jest.fn(),
  formatDateStringIntoDate: jest.fn(),
}));

describe("getReport", () => {
  let dbMock;

  beforeEach(() => {
    dbMock = new sqlite3.verbose().Database();
    jest.clearAllMocks();
  });

  it("should return a sorted payroll report", async () => {
    const mockTimeReports = [
      { employee_id: 1, hours_worked: 10, job_group: "A", date: "01/11/2023" },
      { employee_id: 2, hours_worked: 5, job_group: "B", date: "20/11/2023" },
    ];

    // db.all method to return mockTimeReports
    dbMock.all.mockImplementation((query, callback) => {
      callback(null, mockTimeReports);
    });

    // mock utility functions
    getPayDateRange.mockImplementation((date) => {
      if (date === "01/11/2023" || date === "14/11/2023") {
        return { startDate: "01/11/2023", endDate: "15/11/2023" };
      }
      return { startDate: "16/11/2023", endDate: "30/11/2023" };
    });

    formatDollarAmountFromNumber.mockImplementation(
      (amount) => `$${amount.toFixed(2)}`
    );
    formatDateStringIntoDate.mockImplementation((date) => new Date(date));

    const result = await getReport();

    const expectedReport = [
      {
        employeeId: 1,
        payPeriod: { startDate: "01/11/2023", endDate: "15/11/2023" },
        amountPaid: "$200.00",
      },
      {
        employeeId: 2,
        payPeriod: { startDate: "16/11/2023", endDate: "30/11/2023" },
        amountPaid: "$150.00",
      },
    ];

    expect(result).toEqual(expectedReport);
    expect(dbMock.all).toHaveBeenCalledTimes(1);
    expect(getPayDateRange).toHaveBeenCalledTimes(mockTimeReports.length);
    expect(formatDollarAmountFromNumber).toHaveBeenCalledTimes(
      mockTimeReports.length
    );
    expect(formatDateStringIntoDate).toHaveBeenCalledTimes(
      mockTimeReports.length - 1
    );
  });

  it("should throw an error if database query fails", async () => {
    dbMock.all.mockImplementation((query, callback) => {
      callback(new Error("Database error"), null);
    });

    await expect(getReport()).rejects.toThrow("Error generating report");
  });
});
