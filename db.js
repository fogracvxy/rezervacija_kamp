const Pool = require("pg").Pool;
require("dotenv").config();
//podaci za login na bazu
const pool = new Pool({
  user: "postgres",
  password: process.env.password,
  host: "localhost",
  port: 5432,
  database: "rezervacija",
});

module.exports = pool;
