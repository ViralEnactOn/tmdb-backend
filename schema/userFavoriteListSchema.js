const db = require("../config/db");

const userFavoriteMovieSchema = db.schema.createTable(
  "user_favorite_list",
  (table) => {
    table.increments("id");
    table.integer("user_id").unsigned(); // Adding foreign key column
    table.foreign("user_id").references("user.id"); // Assuming a 'user' table
    table.string("type");
    table.json("items");
    table.timestamp("created_at").defaultTo(db.fn.now());
    table.timestamp("updated_at").defaultTo(db.fn.now());
  }
);

module.exports = { userFavoriteMovieSchema };
