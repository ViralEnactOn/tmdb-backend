const db = require("../config/db");

const userSchema = db.schema.createTable("user", (table) => {
  table.increments("id");
  table.string("name");
  table.string("email");
  table.string("password");
  table.boolean("isVerified");
  table.timestamp("created_at").defaultTo(db.fn.now());
  table.timestamp("updated_at").defaultTo(db.fn.now());
});

module.exports = { userSchema };
