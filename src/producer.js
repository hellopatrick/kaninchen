const amqp = require("amqplib");
const { ulid } = require("ulid");

const ex = "rabbit";
const key = "inference.new.fresh";

async function main() {
  const conn = await amqp.connect("amqp://guest:guest@localhost");
  const chan = await conn.createChannel();
  const exchange = await chan.assertExchange(ex, "topic", { durable: false });

  const interval = setInterval(async () => {
    const message = ulid();
    const msg = { message };
    const json = JSON.stringify(msg);

    const publish = await chan.publish(ex, key, new Buffer(json));

    console.log("[>] %s:'%s'", key, message);
  }, 250);

  process.once("SIGINT", () => {
    console.log("cleaning up.");
    clearInterval(interval);
    conn.close();
  });
}

main().catch(reason => {
  console.log(reason);
});
