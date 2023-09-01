const db = require("../config/db");

const genreSchema = db.schema.createTable("movie_genre_list", (table) => {
  table.integer("id");
  table.string("name");
});

module.exports = { genreSchema };
