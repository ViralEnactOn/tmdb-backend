const db = require("../config/db");

const userFavoriteMovieSchema = db.schema.createTable(
  "user_favorite_movie",
  (table) => {
    table.increments("id");
    table.string("type");
    table.json("items");
    table.integer("user_id").unsigned(); // Adding foreign key column
    table.foreign("user_id").references("user.id");
    table.timestamp("created_at").defaultTo(db.fn.now());
    table.timestamp("updated_at").defaultTo(db.fn.now());
  }
);

module.exports = { userFavoriteMovieSchema };
