import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { isAdminAuthenticated } from '@/lib/auth';

// One-off migration: adds the `circulars.sections` column (see schema.sql)
// and backfills it from the old single-value `section` column, so existing
// rows keep their section as a one-item list. Same pattern as the prior
// posted_at migration — GoDaddy's Export/Import SQL UI fails on this
// database's size, so this runs the statements from inside the app itself,
// where DB_HOST=localhost resolves correctly. Safe to call more than once
// (checks information_schema first, and the backfill only touches rows
// that still have an empty `sections`); remove this route once confirmed
// applied.
//
// Uses a plain connection + query() rather than lib/db's pooled execute() —
// ALTER TABLE is DDL, which some MySQL versions reject over the
// server-side prepared-statement protocol execute() uses.
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

    const [rows] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns
       WHERE table_schema = ? AND table_name = 'circulars' AND column_name = 'sections'`,
      [DB_NAME]
    );
    const alreadyExists = (rows as { cnt: number }[])[0].cnt > 0;

    if (!alreadyExists) {
      await connection.query('ALTER TABLE circulars ADD COLUMN sections TEXT NULL AFTER section');
    }

    const [result] = await connection.query(
      `UPDATE circulars SET sections = section
       WHERE section IS NOT NULL AND section <> '' AND (sections IS NULL OR sections = '')`
    );
    const backfilled = (result as mysql.ResultSetHeader).affectedRows;

    return NextResponse.json({ ok: true, columnAlreadyExisted: alreadyExists, backfilled });
  } catch (err) {
    console.error('POST /api/admin/migrate-circulars-sections failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await connection?.end();
  }
}
