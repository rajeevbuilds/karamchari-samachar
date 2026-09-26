// MySQL connection pool, configured via `.env.local`:
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (DB_PORT optional, defaults to 3306)
//
// The pool is created lazily on the first query rather than at import time,
// and query() throws a clear error if the required env vars are missing.
// Callers in lib/data.ts catch that error and fall back gracefully, so a
// missing or unreachable database never breaks `next build` or crashes a
// page — it just renders empty/default content.

import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error(
      'Database is not configured — set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME in .env.local'
    );
  }

  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT ? Number(DB_PORT) : undefined,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      // Return DATE/DATETIME columns as plain strings (e.g. "2026-07-01")
      // instead of JS Date objects, so they match the ISO date strings the
      // rest of the app already works with.
      dateStrings: true,
    });
  }

  return pool;
}

export async function query<T>(
  sql: string,
  params?: Array<string | number | null | Buffer>
): Promise<T> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T;
}
