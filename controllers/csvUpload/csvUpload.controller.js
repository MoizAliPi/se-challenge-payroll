const express = require("express");
const fs = require("fs");
const csv = require("fast-csv");
const csvUploadService = require("../../services/csvUpload.service");
const upload = require("../../utils/csv-upload-filter.utils");

const router = express.Router();

/**
 * Uploads the csv file to the database.
 *
 * @param {Object} req - The request object - contains the csv file to upload.
 * @param {Object} res - The response object.
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send({
        message: "Invalid CSV file",
      });
    }

    let csvData = [];
    let filePath = __basedir + "/uploads/" + req.file.filename;

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return res.status(400).send({
        message: "File already exists",
      });
    }

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
