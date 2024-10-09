const sqlite3 = require("sqlite3");
const { upload } = require("../services/csvUpload.service");

jest.mock("sqlite3", () => {
  const mockDatabase = {
    serialize: jest.fn(),
    run: jest.fn(),
    prepare: jest.fn(),
    close: jest.fn(),
  };
  const mockStatement = {
    run: jest.fn(),
    finalize: jest.fn(),
  };
  return {
    verbose: jest.fn(() => ({
      Database: jest.fn(() => mockDatabase),
    })),
    Statement: jest.fn(() => mockStatement),
  };
});

describe("CSV Upload Service", () => {
  let db, stmt;

  beforeEach(() => {
    db = new sqlite3.verbose().Database();
    stmt = new sqlite3.Statement();

    db.serialize.mockImplementation((callback) => callback());
    db.run.mockImplementation((query, callback) => {
      if (callback) {
        callback(null);
      }
    });
    db.prepare.mockReturnValue(stmt);
    stmt.run.mockImplementation((_, __, ___, ____, callback) => {
      if (callback) {
        callback(null);
      }
    });
    stmt.finalize.mockImplementation((callback) => {
      if (callback) {
        callback(null);
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should upload CSV data successfully", () => {
    const data = [
      {
        "employee id": "1",
        "hours worked": 7.5,
        "job group": "A",
        date: "2023-11-14",
      },
      {
        "employee id": "2",
        "hours worked": 4,
        "job group": "B",
        date: "2023-11-09",
      },
    ];

    const result = upload(data);

    expect(db.serialize).toHaveBeenCalled();
    expect(db.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
    expect(db.run).toHaveBeenCalledWith("COMMIT");
    expect(stmt.run).toHaveBeenCalledTimes(data.length);

    data.forEach((row, index) => {
      expect(stmt.run).toHaveBeenNthCalledWith(
        index + 1,
        row["employee id"],
        row["hours worked"],
        row["job group"],
        row.date,
        expect.any(Function)
      );
    });

    expect(result).toBe("CSV file uploaded successfully!");
    expect(stmt.finalize).toHaveBeenCalled();
  });

  it("should throw an error if database insertion fails", () => {
    const data = [
      {
        "employee id": "1",
        "hours worked": 7.5,
        "job group": "A",
        date: "2023-11-14",
      },
    ];

    stmt.run.mockImplementationOnce((_, __, ___, ____, callback) =>
      callback(new Error("Insertion failed"))
    );

    expect(() => upload(data)).toThrow("Insertion failed");
    expect(db.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
    expect(stmt.run).toHaveBeenCalled();
    expect(db.run).not.toHaveBeenCalledWith("COMMIT");
  });
});
