import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://fortu851:wUNXTe5joMO1ckaBMB0354ScA@168.119.64.101:5432/fortu851",
  ssl: false,
  connectionTimeoutMillis: 10000,
});

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`=== Day Book Entries Linkage & Reconciliation ${isDryRun ? "(DRY RUN)" : "(APPLYING)"} ===\n`);

  // Ensure columns exist on day_book_entries
  await pool.query(`
    ALTER TABLE day_book_entries ADD COLUMN IF NOT EXISTS booking_reference TEXT;
    ALTER TABLE day_book_entries ADD COLUMN IF NOT EXISTS payment_method TEXT;
    ALTER TABLE day_book_entries ADD COLUMN IF NOT EXISTS pnr TEXT;
  `).catch((err) => console.warn("Notice: Column check:", err.message));

  // Fetch all day book entries
  const dbRes = await pool.query(`SELECT * FROM day_book_entries ORDER BY id ASC`);
  console.log(`Found ${dbRes.rows.length} total day_book_entries.`);

  // Fetch all bookings with payments
  const bkgRes = await pool.query(`
    SELECT b.id, b.ticket_number, b.pnr_number, b.booking_number, b.booking_reference,
           b.passenger_name, b.passenger_phone, b.total_amount, b.departure_datetime, b.notes,
           p.primary_payment_method
    FROM bookings b
    LEFT JOIN (
      SELECT booking_id, MAX(payment_method) AS primary_payment_method
      FROM booking_payments
      WHERE payment_status = 'Success' AND NOT COALESCE(is_deleted, false)
      GROUP BY booking_id
    ) p ON p.booking_id = b.id
    ORDER BY b.id ASC
  `);
  console.log(`Found ${bkgRes.rows.length} total bookings.\n`);

  let matchedCount = 0;
  let updatedCount = 0;

  for (const r of dbRes.rows) {
    const rNotes = String(r.notes || "");
    const rPnr = (r.pnr || "").trim();
    const cleanRPhone = String(r.passenger_phone || "").replace(/\D/g, "").slice(-10);

    // 1. First priority: Direct booking_reference / serial_number or Ticket / PNR matching
    let match = bkgRes.rows.find((b) => {
      if (r.booking_reference && (b.booking_number === r.booking_reference || b.ticket_number === r.booking_reference)) return true;
      if (r.serial_number && (b.booking_number === r.serial_number || b.ticket_number === r.serial_number)) return true;
      if (b.ticket_number && (rNotes.includes(b.ticket_number) || rPnr === b.ticket_number)) return true;
      if (b.pnr_number && (rNotes.includes(b.pnr_number) || rPnr === b.pnr_number)) return true;
      if (b.booking_number && rNotes.includes(b.booking_number)) return true;
      return false;
    });

    // 2. Second priority: If no explicit ticket/PNR match, match on Phone + Date + Name
    if (!match && cleanRPhone) {
      match = bkgRes.rows.find((b) => {
        if (!b.passenger_phone) return false;
        const cleanBPhone = String(b.passenger_phone).replace(/\D/g, "").slice(-10);
        if (cleanRPhone === cleanBPhone) {
          const rName = String(r.passenger_name || "").trim().toLowerCase();
          const bName = String(b.passenger_name || "").trim().toLowerCase();
          if (rName && bName && (rName.includes(bName.slice(0, 4)) || bName.includes(rName.slice(0, 4)))) {
            return true;
          }
        }
        return false;
      });
    }


    if (match) {
      matchedCount++;
      const payMethod = match.primary_payment_method || 
        (rNotes.match(/(?:Manual\s*-\s*CASH|Cash Payment|Paid via Cash)/i) ? "CASH" : 
         rNotes.match(/(?:Online UPI|Paid via UPI)/i) ? "UPI" : (r.payment_method || "CASH"));

      console.log(`Matched Day Book ID ${r.id} (${r.serial_number}) -> Booking ID ${match.id} (${match.booking_number}) | Pax: ${match.passenger_name} | Method: ${payMethod}`);

      if (!isDryRun) {
        await pool.query(
          `UPDATE day_book_entries
           SET booking_reference = $1,
               payment_method = $2,
               pnr = COALESCE(pnr, $3)
           WHERE id = $4`,
          [match.booking_number, payMethod, match.pnr_number, r.id]
        );
        updatedCount++;
      }
    } else {
      console.log(`Day Book ID ${r.id} (${r.serial_number}) -> Unlinked standalone Day Book entry (${r.passenger_name})`);
    }
  }

  console.log(`\nReconciliation Summary:`);
  console.log(`- Total Day Book Entries: ${dbRes.rows.length}`);
  console.log(`- Matched to Bookings: ${matchedCount}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Unlinked Standalone Entries: ${dbRes.rows.length - matchedCount}`);
}

main()
  .catch((e) => {
    console.error("Reconciliation error:", e);
    process.exit(1);
  })
  .finally(() => pool.end());
