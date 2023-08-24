const db = require("../config/db");

const likeMovieSchema = db.schema.createTable("user_rating", (table) => {
  table.increments("id");
  table.integer("user_id").unsigned();
  table.foreign("user_id").references("user.id");
  table.integer("movie_id");
  table.string("type");
  table.string("rating");
  table.timestamp("created_at").defaultTo(db.fn.now());
  table.timestamp("updated_at").defaultTo(db.fn.now());
});

module.exports = { likeMovieSchema };
