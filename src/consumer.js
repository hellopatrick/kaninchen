const amqp = require("amqplib");

let answered = 0;

const exchangeName = "rabbit";
const queueName = process.argv.length > 2 ? process.argv[2] : "";
const pattern = "inference.new.*";

function randomInt(a, b) {
  const sleep = Math.floor(Math.random() * (b - a) + a);
  console.log(sleep);
  return sleep;
}

async function main() {
  const conn = await amqp.connect("amqp://guest:guest@localhost");
  const chan = await conn.createChannel();

  let ex = await chan.assertExchange(exchangeName, "topic", { durable: false });
  let q = await chan.assertQueue(queueName, { exclusive: false });

  chan.bindQueue(q.queue, ex.exchange, pattern);
  chan.prefetch(1);
  chan.consume(
    q.queue,
    msg => {
      setTimeout(() => {
        answered += 1;
        console.log(
          " [%d] %s -> %s:'%s'",
          answered,
          msg.fields.consumerTag,
          msg.fields.routingKey,
          msg.content.toString()
        );
        chan.ack(msg);
      }, randomInt(10, 250));
    },
    { noAck: false }
  );

  process.once("SIGINT", () => {
    console.log("cleaning up");
    clearTimeout();
    conn.close();
  });
}

main().catch(reason => {
  console.log(reason);
});
