const tmdbRoutes = require("./routes/tmdbRoutes");
const fastify = require("fastify")({ logger: true });
const port = 3000;
fastify.register(tmdbRoutes);
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`Server is listening on port ${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
