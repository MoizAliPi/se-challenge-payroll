const express = require("express");
const fs = require("fs");
const csv = require("fast-csv");
const csvUploadService = require("../services/csvUpload.service");
const upload = require("../utils/csv-upload-filter.utils");

const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send({
        message: "Please upload a CSV file!",
      });
    }

    let csvData = [];
    let filePath = __basedir + "/uploads/" + req.file.filename;
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        csvData.push(row);
      })
      .on("end", async () => {
        const message = await csvUploadService.upload(csvData);
        res.send(message);
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading CSV file"); // Handle errors gracefully
  }
});

module.exports = router;
