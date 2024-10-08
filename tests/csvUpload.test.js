const request = require("supertest");
const app = require("../app");
const fs = require("fs");
const csvUploadService = require("../services/csvUpload.service");
const { PassThrough } = require("stream");

jest.mock("fs");
jest.mock("../services/csvUpload.service");

jest.mock("sqlite3", () => {
  const mDatabase = {
    run: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    all: jest.fn().mockReturnThis(),
    close: jest.fn().mockReturnThis(),
  };
  const mSqlite3 = {
    Database: jest.fn(() => mDatabase),
    verbose: jest.fn(() => mSqlite3),
  };
  return mSqlite3;
});

describe("POST /api/upload-csv", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    fs.existsSync.mockReturnValue(false);
    csvUploadService.upload.mockResolvedValue("File uploaded successfully");
  });

  it("should upload the CSV file successfully", async () => {
    fs.createReadStream.mockImplementation(() => {
      const stream = new PassThrough();
      process.nextTick(() => {
        stream.emit("data", {
          date: "14/11/2023",
          "hours worked": 7.5,
          "employee id": "1",
          "job group": "A",
        });
        stream.emit("data", {
          date: "9/11/2023",
          "hours worked": 4,
          "employee id": "2",
          "job group": "B",
        });
        stream.emit("end");
      });
      return stream;
    });

    const res = await request(app)
      .post("/api/upload-csv")
      .attach("file", "../__mocks__/test.csv")
      .expect(200);

    expect(res.text).toBe("File uploaded successfully");
  });

  it("should return 400 if file already exists", async () => {
    fs.existsSync.mockReturnValue(true);
    const res = await request(app)
      .post("/api/upload-csv")
      .attach("file", "../__mocks__/test.csv")
      .expect(400);

    expect(res.body.message).toBe("File already exists");
  });

  it("should return 400 if no file is uploaded", async () => {
    const res = await request(app).post("/api/upload-csv").expect(400);

    expect(res.body.message).toBe("Invalid CSV file");
  });

  it("should return 500 if an error occurs", async () => {
    fs.createReadStream.mockImplementation(() => {
      const stream = new PassThrough();
      process.nextTick(() => {
        stream.emit("error", new Error("Stream error"));
      });
      return stream;
    });

    const res = await request(app)
      .post("/api/upload-csv")
      .attach("file", "../__mocks__/test.csv")
      .expect(500);

    expect(res.text).toBe("Error uploading CSV file");
  });
});
