const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);

  server.close(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  server.close(() => {
    process.exit(1);
  });
});
