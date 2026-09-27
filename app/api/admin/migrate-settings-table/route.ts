import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { isAdminAuthenticated } from '@/lib/auth';

// One-off migration: creates the `settings` table (see schema.sql) on
// whichever database DB_HOST/DB_NAME point to — same SQL as schema.sql.
// GoDaddy's Export/Import SQL UI was failing on the `uploads` table's
// large image blobs, so this runs the statement from inside the app
// itself, where DB_HOST=localhost resolves correctly. Safe to call more
// than once (IF NOT EXISTS); remove this route once confirmed applied.
//
// Uses a plain connection + query() rather than lib/db's pooled
// execute() — CREATE TABLE is DDL, which some MySQL versions reject
// over the server-side prepared-statement protocol execute() uses.
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 500 });
  }

  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT ? Number(DB_PORT) : undefined,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(80) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/admin/migrate-settings-table failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await connection?.end();
  }
}
