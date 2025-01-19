const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "post-service" },
  transports: [
    // console messages format
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    }),
    // logs only the error messages in error.log
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    // logs all level messages in combined.log
    new winston.transports.File({
      filename: "combined.log",
    }),
  ],
});

module.exports = logger;
