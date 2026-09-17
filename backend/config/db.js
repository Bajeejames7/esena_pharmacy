const mysql = require("mysql2");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

// Managed MySQL hosts (Aiven, PlanetScale, etc.) require TLS. Set DB_SSL=true
// in .env for those; local/dev MySQL typically doesn't need it.
// rejectUnauthorized:false matches "ssl-mode=REQUIRED" (encrypt, don't verify
// the CA) rather than "VERIFY_IDENTITY" — good enough without pinning Aiven's
// CA cert, since the connection is still encrypted end-to-end.
const sslConfig = process.env.DB_SSL === "true"
  ? { rejectUnauthorized: false }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  ssl: sslConfig,
  // 'acquireTimeout' is removed to stop the warning log
});

// Create a promise-based version of the pool
const promisePool = pool.promise();

// Verification check (Runs once on startup)
promisePool.getConnection()
  .then(connection => {
    console.log("--- Database Connection Verified ---");
    connection.release();
  })
  .catch(err => {
    console.error("--- DATABASE CONNECTION ERROR ---");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
  });

module.exports = promisePool;