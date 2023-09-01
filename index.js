const express = require("express");
const cors = require("cors");
const sendResponse = require("./config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");

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

app.use((err, req, res, next) => {
  console.error(err.stack);

  return sendResponse(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    ReasonPhrases.INTERNAL_SERVER_ERROR,
    err.message || "Something went wrong on the server"
  );
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);

  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
