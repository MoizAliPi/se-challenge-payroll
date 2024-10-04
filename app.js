const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();

// Create a database connection
const db = new sqlite3.Database("employees-database.db", (err) => {
  if (err) {
    console.error(err);
  }
  console.log("Connected to database");
});

// Middleware
app.use(bodyParser.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
