import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://fortu851:wUNXTe5joMO1ckaBMB0354ScA@168.119.64.101:5432/fortu851",
});

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== Running Ticket & PNR Search Verification Tests ===\n");

  // Test 1: Exact PNR search for FCSBPZEJ
  console.log("Test 1: Search by exact PNR 'FCSBPZEJ'");
  const pnrRes = await pool.query(
    `SELECT b.id, b.ticket_number, b.pnr_number, b.booking_number, b.passenger_name, 
            b.passenger_phone, b.category, b.booking_type, b.from_location, b.to_location, 
            b.total_amount, b.payment_status, b.booking_status, b.departure_datetime
     FROM bookings b
     WHERE b.pnr_number = 'FCSBPZEJ'`
  );
  assert(pnrRes.rows.length === 1, "Exactly 1 record found for PNR FCSBPZEJ");
  const pnrTicket = pnrRes.rows[0];
  assert(pnrTicket.id === 207, `Correct Booking ID 207 (got: ${pnrTicket.id})`);
  assert(pnrTicket.passenger_name === "Zameer Syed", `Passenger is Zameer Syed (got: ${pnrTicket.passenger_name})`);
  assert(pnrTicket.category === "CAR", `Category is CAR (got: ${pnrTicket.category})`);
  assert(pnrTicket.from_location === "Bangalore" && pnrTicket.to_location === "Mysore", `Route is Bangalore -> Mysore`);
  assert(Number(pnrTicket.total_amount) === 2017, `Fare is 2017 (got: ${pnrTicket.total_amount})`);
  assert(pnrTicket.payment_status === "Fully Paid", `Payment status is Fully Paid (got: ${pnrTicket.payment_status})`);
  assert(pnrTicket.booking_status === "CONFIRMED", `Booking status is CONFIRMED (got: ${pnrTicket.booking_status})`);

  // Test 2: Detail verification - Booking 207 does NOT contain Train data
  console.log("\nTest 2: Integrity of Booking 207 details (no cross-contamination)");
  assert(pnrTicket.from_location !== "SBC", "Route origin is NOT SBC (Train station)");
  assert(pnrTicket.to_location !== "MAS", "Route destination is NOT MAS (Chennai Train station)");
  assert(pnrTicket.category !== "TRAIN", "Category is not TRAIN");
  assert(pnrTicket.ticket_number !== "FTRPG2V", "Ticket number is not FTRPG2V (Booking 48)");

  // Test 3: Search by Ticket Number 'FTNINHE'
  console.log("\nTest 3: Search by exact Ticket Number 'FTNINHE'");
  const tktRes = await pool.query(
    `SELECT id, ticket_number, pnr_number, passenger_name, category 
     FROM bookings WHERE ticket_number = 'FTNINHE'`
  );
  assert(tktRes.rows.length === 1, "Exactly 1 record found for ticket FTNINHE");
  assert(tktRes.rows[0].pnr_number === "FCSBPZEJ", `Associated PNR is FCSBPZEJ (got: ${tktRes.rows[0].pnr_number})`);

  // Test 4: Search by Passenger Name 'Zameer'
  console.log("\nTest 4: Search by Passenger Name 'Zameer'");
  const nameRes = await pool.query(
    `SELECT id, ticket_number, pnr_number, passenger_name, category 
     FROM bookings WHERE passenger_name ILIKE '%Zameer%' ORDER BY id DESC`
  );
  assert(nameRes.rows.length >= 1, `Found ${nameRes.rows.length} bookings for passenger Zameer`);
  const foundCar = nameRes.rows.find((r) => r.pnr_number === "FCSBPZEJ");
  assert(Boolean(foundCar), "Found car booking FCSBPZEJ among Zameer bookings");

  // Test 5: Category Isolation
  console.log("\nTest 5: Category isolation verification");
  const trainCats = await pool.query(`SELECT COUNT(*)::int as n FROM bookings WHERE category = 'TRAIN'`);
  const carCats = await pool.query(`SELECT COUNT(*)::int as n FROM bookings WHERE category = 'CAR'`);
  const busCats = await pool.query(`SELECT COUNT(*)::int as n FROM bookings WHERE category = 'BUS'`);
  const flightCats = await pool.query(`SELECT COUNT(*)::int as n FROM bookings WHERE category = 'FLIGHT'`);
  assert(trainCats.rows[0].n > 0, `Train category has ${trainCats.rows[0].n} records`);
  assert(carCats.rows[0].n > 0, `Car category has ${carCats.rows[0].n} records`);
  assert(busCats.rows[0].n > 0, `Bus category has ${busCats.rows[0].n} records`);
  assert(flightCats.rows[0].n > 0, `Flight category has ${flightCats.rows[0].n} records`);

  // Test 6: Verify no outlier departure dates exist
  console.log("\nTest 6: Outlier date sanitization check");
  const outlierRes = await pool.query(
    `SELECT id, booking_number, departure_datetime FROM bookings 
     WHERE departure_datetime > '2099-12-31'::date OR departure_datetime < '2020-01-01'::date`
  );
  assert(outlierRes.rows.length === 0, `Zero outlier departure dates remain (got ${outlierRes.rows.length})`);

  // Test 7: Booking 48 (the Train record from video) state check
  console.log("\nTest 7: Booking 48 state check");
  const b48Res = await pool.query(
    `SELECT id, booking_number, pnr_number, ticket_number, from_location, to_location, category, departure_datetime 
     FROM bookings WHERE id = 48`
  );
  assert(b48Res.rows.length === 1, "Booking 48 exists");
  const b48 = b48Res.rows[0];
  assert(b48.pnr_number === "FCK151E6", `Booking 48 has its own unique PNR: FCK151E6`);
  assert(b48.pnr_number !== "FCSBPZEJ", `Booking 48 PNR does NOT conflict with FCSBPZEJ`);
  assert(new Date(b48.departure_datetime).getFullYear() === 2026, `Booking 48 date year is 2026 (got: ${new Date(b48.departure_datetime).getFullYear()})`);

  console.log(`\n==========================================`);
  console.log(`Tests Complete: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==========================================\n`);

  await pool.end();
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
