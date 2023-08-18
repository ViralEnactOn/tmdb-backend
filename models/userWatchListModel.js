const db = require("../config/db");

const watchlistSchema = db.schema.createTable("user_watch_list", (table) => {
  table.increments("id");
  table.string("name");
  table.integer("user_id").unsigned(); // Adding foreign key column
  table.foreign("user_id").references("user.id");
  table.json("movies");
  table.boolean("isPublic");
});

module.exports = { watchlistSchema };
