const amqp = require("amqplib");
const logger = require("./logger");

let channel = null,
  connection = null;

const EXCHANGE_NAME = "social_media.events.media.delete.id";

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to rabbit mq ");
    return channel;
  } catch (e) {
    logger.error("error connecting to rabbit mq", e);
  }
}

async function publishEvent(routingKey, message) {
  if (!channel) await connectRabbitMQ();

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info("Event published :", routingKey);
}
module.exports = { connectRabbitMQ, publishEvent };
