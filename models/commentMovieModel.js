const db = require("../config/db");

const commentMovieSchema = db.schema.createTable("user_comment", (table) => {
  table.increments("id");
  table.integer("movie_id").unsigned();
  table.integer("parent_comment_id").unsigned();
  table.integer("user_id").unsigned();
  table.text("text");
  table.foreign("movie_id").references("movies.id");
  table.foreign("parent_comment_id").references("comments.id");
  table.foreign("user_id").references("users.id"); // Assuming a 'users' table
});

module.exports = { commentMovieSchema };
