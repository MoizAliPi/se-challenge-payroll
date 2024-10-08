const express = require("express");
const bodyParser = require("body-parser");

// routes
const routes = require("./routes");

const app = express();

// Middleware
app.use(bodyParser.json());

// mount the routes
app.use("/api", routes);

module.exports = app;
