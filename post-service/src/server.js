require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const postRoutes = require("./routes/postRoute");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");
const { connectRabbitMQ } = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3002;

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

// const rateLimiter = new RateLimiterRedis({
//   storeClient: redisClient,
//   keyPrefix: "middleware",
//   points: 10,
//   duration: 1,
// });

// app.use((req, res, next) => {
//   rateLimiter
//     .consume(req.ip)
//     .then(() => next())
//     .catch((e) => logger.warn("rate limit exceeded for IP ", req.ip));
//   res.status(429).json({ success: false, message: "Too many requests" });
// });

// IP based rate limiting for sensitive endpoints
// const sensitiveEndPointsLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 50,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     logger.warn(`Sensitive Endpoint rate limit exceeded for IP: ${req.ip}`);
//     res.status(429).json({ success: false, message: "Too many requests" });
//   },
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.call(...args),
//   }),
// });

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

// error handler
app.use(errorHandler);

//
async function startServer() {
  try {
    await connectRabbitMQ();
    // app running...
    app.listen(PORT, () =>
      logger.info(`Post Service running on port: ${PORT}`)
    );
  } catch (error) {
    logger.error(`failed to start post service`, e);
    process.exit(1);
  }
}
startServer();

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) =>
  logger.error(`Unhandled rejection at`, promise, "reason:", reason)
);
