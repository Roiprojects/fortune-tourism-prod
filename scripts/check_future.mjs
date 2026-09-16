import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query(`SELECT id, travel_date::text as t_text, travel_date FROM day_book_entries WHERE id = 59`);
  console.log('Row 59:', res.rows[0]);
  await pool.end();
}
main();
