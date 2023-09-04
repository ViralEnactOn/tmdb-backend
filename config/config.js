require("dotenv").config();

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjYTRjM2I5YTY1NzE1Zjk5MDIxNGZjY2MyNjc1ZjFiYSIsInN1YiI6IjY0YWUyY2EzNmEzNDQ4MDEyY2U3MjllMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A_-waPMhwZ0EwSkzIy99k6RbLThh9iyhTrLUmp_McHg",
  },
};
module.exports = {
  app: {
    base_url: process.env.BASE_URL,
    front_end_url: process.env.FRONT_END_URL,
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  tmdb_service: {
    api_key: process.env.API_KEY,
    api_url: process.env.API_URL,
    image_url: process.env.IMAGE_URL,
    mobile_image_url: process.env.MOBILE_IMAGE_URL,
    options: options,
  },
  jwt: {
    secret_key: process.env.SECRET_KEY,
  },
};
