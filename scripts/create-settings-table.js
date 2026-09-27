/**
 * One-off migration: creates the `settings` table on the database pointed
 * to by .env.local (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME — the same
 * production credentials the app itself uses, since Preview and Publish
 * share one database). Run this instead of GoDaddy's Export/Import SQL UI,
 * which was failing/canceling on the `uploads` table's large image blobs.
 *
 * Usage: node scripts/create-settings-table.js
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// No dotenv dependency in this project — parse .env.local's simple
// KEY=value lines directly instead of adding one for a one-off script.
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const [, key, rawValue = ""] = match;
    const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    key_name VARCHAR(80) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

async function main() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error(
      "Missing DB_HOST, DB_USER or DB_NAME — check .env.local."
    );
    process.exitCode = 1;
    return;
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : undefined,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    await connection.query(CREATE_SETTINGS_TABLE);
    console.log(`Success: 'settings' table exists on ${DB_NAME}@${DB_HOST}.`);
  } catch (err) {
    console.error("Failed to create 'settings' table:", err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
