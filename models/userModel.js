const db = require("../config/db");

const userSchema = db.schema.createTable("user", (table) => {
  table.increment("id");
  table.string("name");
  table.string("email");
  table.string("password");
  table.boolean("isVerified");
  table.integer("OTP");
});

module.exports = { userSchema };
