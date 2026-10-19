import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://fortu851:wUNXTe5joMO1ckaBMB0354ScA@168.119.64.101:5432/fortu851",
});

async function main() {
  console.log("Checking for bookings with outlier departure dates...");
  const res = await pool.query(
    `UPDATE bookings 
     SET departure_datetime = created_at 
     WHERE departure_datetime > '2099-12-31'::date OR departure_datetime < '2020-01-01'::date
     RETURNING id, booking_number, departure_datetime`
  );
  console.log(`Sanitized ${res.rowCount} records with outlier departure dates:`, res.rows);
  await pool.end();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
