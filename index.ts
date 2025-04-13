const fastify = require("fastify")();
const fastifyPostgres = require("@fastify/postgres");

// DB plugin
fastify.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL,
});

fastify.get("/todos", async (request: any, reply: any) => {
  const client = await fastify.pg.connect();
  const { rows } = await client.query("SELECT * FROM todos");
  client.release();
  return rows;
});

fastify.listen({ host: "0.0.0.0", port: 8080 }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
