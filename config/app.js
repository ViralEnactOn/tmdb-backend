const express = require("express");
const cors = require("cors");
const sendResponse = require("../config/responseUtil");

const {
  movieRoutes,
  authenticationRoutes,
  watchlistRoutes,
  favoriteRoutes,
  reactionRoutes,
  chartRoutes,
  ratingRoutes,
  commentRoutes,
} = require("../routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((err, req, res, next) => {
  console.error(err.stack);

  return sendResponse(res, err.message || "Something went wrong on the server");
});

const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.use("/movie", asyncMiddleware(movieRoutes));
app.use("/user", authenticationRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/favorite", favoriteRoutes);
app.use("/reaction", reactionRoutes);
app.use("/chart", asyncMiddleware(chartRoutes));
app.use("/rating", ratingRoutes);
app.use("/comment", commentRoutes);

module.exports = app;
