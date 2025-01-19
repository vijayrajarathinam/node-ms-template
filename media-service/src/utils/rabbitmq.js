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

async function consumeEvent(routingKey, callback) {
  if (!channel) await connectRabbitMQ();

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg) => {
    if (!msg) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });

  logger.info(`Subscribed to event to routing key ${routingKey}`);
}
module.exports = { connectRabbitMQ, consumeEvent };
