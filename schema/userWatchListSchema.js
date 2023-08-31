const db = require("../config/db");

const userWatchListSchema = db.schema.createTable("user_watch_list", (table) => {
  table.increments("id");
  table.string("name");
  table.integer("user_id").unsigned(); // Adding foreign key column
  table.foreign("user_id").references("user.id");
  table.json("movies");
  table.boolean("isPublic");
  table.boolean("isDeleted").defaultTo(false);
  table.timestamp("created_at").defaultTo(db.fn.now());
  table.timestamp("updated_at").defaultTo(db.fn.now());
});

module.exports = { userWatchListSchema };
