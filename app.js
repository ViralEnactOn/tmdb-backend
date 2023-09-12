const express = require("express");
const cors = require("cors");
const sendResponse = require("./config/responseUtil");

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/ping", async (req, res) => {
  res.send("Version 1.0.0");
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  return sendResponse(res, err.message || "Something went wrong on the server");
});

app.use("/movie", movieRoutes);
app.use("/user", authenticationRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/favorite", favoriteRoutes);
app.use("/reaction", reactionRoutes);
app.use("/chart", chartRoutes);
app.use("/rating", ratingRoutes);
app.use("/comment", commentRoutes);

module.exports = app;
