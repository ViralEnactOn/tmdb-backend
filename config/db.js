const knex = require("knex");
const config = require("./knexconfig");

const db = knex(config.development);

module.exports = db;
