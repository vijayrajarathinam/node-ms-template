const express = require("express");
const multer = require("multer");
const { mediaUpload, getAllMedias } = require("../controllers/mediaController");
const { authenticateRequest } = require("../middlewares/authMiddleware");
const logger = require("../utils/logger");

const mediaRouter = express.Router();

// configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("file");

const multerUtils = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.error("Multer upload error", err);
      return res.status(400).json({
        message: "Multer upload error",
        error: err.message,
        stack: err.stack,
      });
    } else if (err) {
      logger.error("Unknown error while file upload ", err);
      return res.status(400).json({
        message: "Unknown error while file upload ",
        error: err.message,
        stack: err.stack,
      });
    }

    if (!req.file) {
      logger.error("No file found ", err);
      return res.status(400).json({
        message: "No file found ",
        error: err.message,
        stack: err.stack,
      });
    }

    next();
  });
};

mediaRouter.post("/upload", authenticateRequest, multerUtils, mediaUpload);
mediaRouter.get("/all", authenticateRequest, getAllMedias);

module.exports = mediaRouter;
