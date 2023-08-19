// const db = require("./config/db");
// const express = require("express");
// const cors = require("cors");
const tmdbRoutes = require("./routes/tmdbRoutes");

// const app = express();

// const PORT = 3000;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors()); // Use the cors middleware

// app.use("/", tmdbRoutes); // Mount the tmdbRoutes

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });

const fastify = require("fastify")({ logger: true });
const port = 3000;
fastify.register(require("./routes/tmdbRoutes"));
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
