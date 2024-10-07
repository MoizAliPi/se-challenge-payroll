const express = require("express");
const bodyParser = require("body-parser");

// routes
const routes = require("./routes");

const app = express();

// Middleware
app.use(bodyParser.json());

// mount the routes
app.use("/api", routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
