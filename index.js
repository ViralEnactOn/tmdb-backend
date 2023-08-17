const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const tmdbRoutes = require("./routes/tmdbRoutes");

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Use the cors middleware

app.use("/", tmdbRoutes); // Mount the tmdbRoutes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
