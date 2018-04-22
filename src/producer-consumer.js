const amqp = require("amqplib");
const Random = require("random-js");
const { ulid } = require("ulid");

const { sleep } = require("./utils");

const random = new Random(Random.engines.mt19937().autoSeed());

const ex = "rabbit";
const [
  queueName = "test",
  inKey = "inference.new.*",
  outKey = "",
  ..._rest
] = process.argv.slice(2);

console.log(`[${queueName}] ${inKey} => ${outKey}`);

async function sendReply(chan) {
  const message = ulid();
  const msg = { message };
  const json = JSON.stringify(msg);

  return chan.publish(ex, outKey, Buffer.from(json));
}

function handleMessage(chan) {
  return async msg => {
    console.log(`[<] ${msg.content.toString()}`);
    await sleep(random.integer(150, 1500));
    console.log(`[!] ${msg.content.toString()}`);

    if (outKey !== "") {
      await sendReply(chan);
      console.log(`[>] sentReply`);
    }

    chan.ack(msg);
  };
}

async function main() {
  const conn = await amqp.connect("amqp://guest:guest@localhost");
  const chan = await conn.createChannel();

  let e = await chan.assertExchange(ex, "topic", { durable: false });
  let q = await chan.assertQueue(queueName, { exclusive: false });

  chan.bindQueue(q.queue, e.exchange, inKey);
  chan.prefetch(1);

  chan.consume(q.queue, handleMessage(chan), { noAck: false });

  process.once("SIGINT", () => {
    console.log("cleaning up");
    conn.close();
  });
}

main().catch(reason => {
  console.log(reason);
});
