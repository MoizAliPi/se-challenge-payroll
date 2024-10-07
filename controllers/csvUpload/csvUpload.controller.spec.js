const request = require("supertest");
const app = require("../../app");
const fs = require("fs");

describe("csvUplodController", () => {
  let server;

  beforeAll(() => {
    server = app.listen();
  });

  afterAll(() => {
    server.close();
  });

  it("should upload a valid CSV file", async () => {
    const validCsvPath = "../uploads/time-report-42.csv";

    const response = await request(server)
      .post("/upload-csv") // Replace '/upload' with your actual upload route
      .attach("file", await fs.readFileSync(validCsvPath), "time-report-42.csv")
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("CSV file uploaded successfully");
  });

  it("should reject an invalid CSV file", async () => {
    const invalidCsvPath = "../uploads/invalid.csv";

    const response = await request(server)
      .post("/upload-csv")
      .attach("file", await fs.readFileSync(invalidCsvPath), "invalid.csv")
      .send();

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Invalid CSV file");
  });
});
