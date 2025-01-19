require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");
const errorHandler = require("./middlewares/errorHandler");
const { connectRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const searchRoutes = require("./routes/searchRoute");
const { handlePostCreated } = require("./consumers/postConsumer");

const app = express();
const PORT = process.env.PORT || 3004;

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

app.use(
  "/api/search",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  searchRoutes
);

// error handler
app.use(errorHandler);

//
async function startServer() {
  try {
    await connectRabbitMQ();
    await consumeEvent("post.created", handlePostCreated);
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
