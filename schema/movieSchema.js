const db = require("../config/db");

const movieSchema = db.schema.createTable("movie", (table) => {
  table.integer("id");
  table.string("adult");
  table.string("backdrop_path");
  table.json("genre_ids");
  table.string("original_language");
  table.string("original_title");
  table.text("overview");
  table.float("popularity");
  table.string("poster_path");
  table.string("poster_path_mobile");
  table.string("title");
  table.string("video");
  table.float("vote_average");
  table.string("vote_count");
  // Details Section
  table.string("budget");
  table.string("imdb_id");
  table.string("release_date");
  table.string("revenue");
  table.integer("runtime");
  table.string("status");
  table.json("external_ids");
  table.json("production_countries");
  table.json("spoken_languages");
  table.timestamp("created_at").defaultTo(db.fn.now());
  table.timestamp("updated_at").defaultTo(db.fn.now());
  table.index("id");
});

module.exports = { movieSchema };
