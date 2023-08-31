const express = require("express");
const cors = require("cors");
const {
  movieRoutes,
  authenticationRoutes,
  watchlistRoutes,
  favoriteRoutes,
  reactionRoutes,
  chartRoutes,
  ratingRoutes,
  commentRoutes,
} = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/movie", movieRoutes);
app.use("/user", authenticationRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/favorite", favoriteRoutes);
app.use("/reaction", reactionRoutes);
app.use("/chart", chartRoutes);
app.use("/rating", ratingRoutes);
app.use("/comment", commentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
