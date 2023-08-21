const fastify = require("fastify")({ logger: true, maxParamLength: 1000 });
const path = require("path");
fastify.register(require("@fastify/formbody"));
const tmdbRoutes = require("./routes/tmdbRoutes");

const port = 3000;

fastify.register(tmdbRoutes);

fastify.register(require("@fastify/static"), {
  root: path.resolve(__dirname, "public"),
  prefix: "/public/", // optional: default '/'
});
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
