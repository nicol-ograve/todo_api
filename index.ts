const fastify = require("fastify")();
const fastifyPostgres = require("@fastify/postgres");

// DB plugin
fastify.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL,
});

fastify.get("/todos", async (request: any, reply: any) => {
  const client = await fastify.pg.connect();
  const { user } = request.query;
  let query = "SELECT * FROM todos";
  const params = [];
  if (user) {
    query += " WHERE user = $1";
    params.push(user);
  }
  const { rows } = await client.query(query, params);

  client.release();
  return rows;
});

fastify.post("/todos", async (request: any, reply: any) => {
  const { id, text } = request.body;
  const { user } = request.query;
  const { rows } = await fastify.pg.query(
    "INSERT INTO todos (id, text, user) VALUES ($1, $2, $3) RETURNING *",
    [id, text, user],
  );
  return rows[0];
});

fastify.delete("/todos/:id", async (request: any, reply: any) => {
  const { id } = request.params;
  const { rows } = await fastify.pg.query(
    "DELETE FROM todos WHERE id = $1 RETURNING *",
    [id],
  );
});

fastify.put("/todos/:id", async (request: any, reply: any) => {
  const { id } = request.params;
  const { text } = request.body;
  const { rows } = await fastify.pg.query(
    "UPDATE todos SET text = $1 WHERE id = $2 RETURNING *",
    [text, id],
  );
  return rows[0];
});

fastify.listen({ host: "0.0.0.0", port: 8080 }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
