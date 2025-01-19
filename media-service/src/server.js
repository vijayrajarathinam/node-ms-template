require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mediaRouter = require("./routes/mediaRoute");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");
const { connectRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./consumers/postConsumer");

const app = express();
const PORT = process.env.PORT || 3003;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongodb connection error", e));

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

app.use("/api/media", mediaRouter);

// error handler
app.use(errorHandler);

// app running...
// app.listen(PORT, () => logger.info(`Post Service running on port: ${PORT}`));
async function startServer() {
  try {
    await connectRabbitMQ();
    await consumeEvent("post.deleted", handlePostDeleted);
    // app running...
    app.listen(PORT, () =>
      logger.info(`Media Service running on port: ${PORT}`)
    );
  } catch (error) {
    logger.error(`failed to start media service`, e);
    process.exit(1);
  }
}
startServer();

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) =>
  logger.error(`Unhandled rejection at`, promise, "reason:", reason)
);
