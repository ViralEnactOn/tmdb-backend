const express = require("express");
const cors = require("cors");
const movieRoutes = require("./routes/movieRoutes");
const authenticationRoutes = require("./routes/authenticationRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// app.use("/", tmdbRoutes);
app.use("/movie", movieRoutes);
app.use("/user", authenticationRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/favorite", favoriteRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
