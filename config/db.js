const knex = require("knex");
// const config = require("./knexconfig");
const config = require("../config/config");

// const db = knex(config.development);
const development = {
  client: "mysql2",
  connection: {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  },
};

const db = knex(development);

module.exports = db;
