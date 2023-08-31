const db = require("../config/db");

const userReactionSchema = db.schema.createTable("user_reaction", (table) => {
  table.increments("id");
  table.integer("user_id").unsigned();
  table.foreign("user_id").references("user.id");
  table.integer("movie_id");
  table.string("reaction");
  table.boolean("isDeleted").defaultTo(false);
  table.timestamp("created_at").defaultTo(db.fn.now());
  table.timestamp("updated_at").defaultTo(db.fn.now());
});

module.exports = { userReactionSchema };
