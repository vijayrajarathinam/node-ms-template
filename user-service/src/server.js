require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const errorHandler = require("./middlewares/errorHandler");

// express app instance
const app = express();
const PORT = process.env.PORT || 3001;

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongodb connection error", e));

// create redis client
const redisClient = new Redis(process.env.REDIS_URL);

// configuring middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, _, next) => {
  logger.info(
    `Received Request Method ${req.method} to url ${req.url} of body => ${req.body} `
  );
  next();
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

// app.use((req, res, next) => {
//   rateLimiter
//     .consume(req.ip)
//     .then(() => next())
//     .catch((e) => logger.warn("rate limit exceeded for IP ", req.ip));
//   res.status(429).json({ success: false, message: "Too many requests" });
// });

// IP based rate limiting for sensitive endpoints
const sensitiveEndPointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive Endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

const userRoutes = require("./routes/userRoute");

// apply sensitiveEndPointsLimiter to our routes
// app.use("/api/auth/register", sensitiveEndPointsLimiter);
app.use("/api/auth", userRoutes);

// error handler
app.use(errorHandler);

// app running...
app.listen(PORT, () => logger.info(`User Service running on port: ${PORT}`));

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) =>
  logger.error(`Unhandled rejection at`, promise, "reason:", reason)
);
