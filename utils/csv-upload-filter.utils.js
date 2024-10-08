const multer = require("multer");
const path = require("path");

// Set global directory
global.__basedir = path.join(__dirname, "..");

/**
 * Stores the file in request body in
 * the local filesystem.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

/**
 * Returns true if the given file is of type
 * 'csv' and matches the regex pattern for the
 * file name.
 */
const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes("csv")) {
    const regex = /^time-report-\d+\.csv$/;
    if (file.originalname.match(regex)) {
      cb(null, true);
    } else {
      cb(
        "Invalid file name; it should match 'time-report-x' where x is an integer",
        false
      );
    }
  } else {
    cb("Please upload only csv file.", false);
  }
};

const upload = multer({ storage: storage, fileFilter: csvFilter });

module.exports = upload;
