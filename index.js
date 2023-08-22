const express = require("express");
const cors = require("cors");
const tmdbRoutes = require("./routes/tmdbRoutes");
const movieRoutes = require("./routes/movieRoutes");
const authenticationRoutes = require("./routes/authenticationRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/", tmdbRoutes);
app.use("/movie", movieRoutes);
app.use("/user", authenticationRoutes);
app.use("/watch_list", watchlistRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
