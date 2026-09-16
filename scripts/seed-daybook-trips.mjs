import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Seeding current 24-hour and future trips into day_book_entries and bookings...");

  const sampleTrips = [
    {
      serial: "DB-2026-0916-1",
      booking_date: "2026-09-16",
      travel_date: "2026-09-16",
      time: "05:30 PM",
      travel_by: "SEDAN",
      pax_name: "Ramesh Sharma",
      phone: "9845012345",
      from: "BOMMASANDRA",
      to: "TERMINAL 1 (BLR AIRPORT)",
      status: "Confirmed",
      notes: "Trip Type: AIRPORT | Time: 05:30 PM | Vehicle Type: SEDAN | Fare: ₹1399",
      ticket: "FT916A1",
      pnr: "FC916P1",
    },
    {
      serial: "DB-2026-0916-2",
      booking_date: "2026-09-16",
      travel_date: "2026-09-16",
      time: "08:00 PM",
      travel_by: "INNOVA CRYSTA",
      pax_name: "Priya Nair",
      phone: "9886023456",
      from: "WHITEFIELD",
      to: "MYSURU PALACE",
      status: "Confirmed",
      notes: "Trip Type: OUTSTATION | Time: 08:00 PM | Vehicle Type: INNOVA CRYSTA | Fare: ₹4200",
      ticket: "FT916A2",
      pnr: "FC916P2",
    },
    {
      serial: "DB-2026-0917-1",
      booking_date: "2026-09-15",
      travel_date: "2026-09-17",
      time: "06:30 AM",
      travel_by: "TOYOTA INNOVA",
      pax_name: "Karthik Raja",
      phone: "9740463404",
      from: "BENGALURU (SBC)",
      to: "COORG (MADIKERI)",
      status: "Pending",
      notes: "Trip Type: OUTSTATION | Time: 06:30 AM | Vehicle Type: TOYOTA INNOVA | Fare: ₹5800",
      ticket: "FT917A1",
      pnr: "FC917P1",
    },
    {
      serial: "DB-2026-0918-1",
      booking_date: "2026-09-15",
      travel_date: "2026-09-18",
      time: "07:00 AM",
      travel_by: "SEDAN",
      pax_name: "Ananya Deshmukh",
      phone: "9900988907",
      from: "ELECTRONIC CITY",
      to: "TIRUPATI TEMPLE",
      status: "Confirmed",
      notes: "Trip Type: PILGRIMAGE | Time: 07:00 AM | Vehicle Type: SEDAN | Fare: ₹6500",
      ticket: "FT918A1",
      pnr: "FC918P1",
    },
    {
      serial: "DB-2026-0920-1",
      booking_date: "2026-09-14",
      travel_date: "2026-09-20",
      time: "09:00 AM",
      travel_by: "TEMPO TRAVELLER",
      pax_name: "Mohammed Farhan",
      phone: "9845003000",
      from: "INDIRANAGAR",
      to: "OOTY (NILGIRIS)",
      status: "Confirmed",
      notes: "Trip Type: PACKAGE | Time: 09:00 AM | Vehicle Type: TEMPO TRAVELLER | Fare: ₹18500",
      ticket: "FT920A1",
      pnr: "FC920P1",
    },
    {
      serial: "DB-2026-0925-1",
      booking_date: "2026-09-12",
      travel_date: "2026-09-25",
      time: "06:00 AM",
      travel_by: "FORCE URBANIA",
      pax_name: "Vikram Menon",
      phone: "9635817466",
      from: "KORAMANGALA",
      to: "KERALA (MUNNAR)",
      status: "Pending",
      notes: "Trip Type: PACKAGE | Time: 06:00 AM | Vehicle Type: FORCE URBANIA | Fare: ₹22000",
      ticket: "FT925A1",
      pnr: "FC925P1",
    },
    {
      serial: "DB-2026-1001-1",
      booking_date: "2026-09-10",
      travel_date: "2026-10-01",
      time: "07:30 AM",
      travel_by: "INNOVA CRYSTA",
      pax_name: "Suresh Babu",
      phone: "8148734577",
      from: "BENGALURU",
      to: "HAMPI HERITAGE SITE",
      status: "Confirmed",
      notes: "Trip Type: TOUR | Time: 07:30 AM | Vehicle Type: INNOVA CRYSTA | Fare: ₹14500",
      ticket: "FT1001A1",
      pnr: "FC1001P1",
    },
  ];

  for (const t of sampleTrips) {
    // Check if already exists in day_book_entries
    const check = await pool.query(
      `SELECT id FROM day_book_entries WHERE serial_number = $1`,
      [t.serial],
    );
    if (check.rows.length === 0) {
      await pool.query(
        `INSERT INTO day_book_entries (
           serial_number, booking_date, travel_date, travel_by,
           passenger_name, passenger_phone, from_location, to_location,
           status, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          t.serial,
          t.booking_date,
          t.travel_date,
          t.travel_by,
          t.pax_name,
          t.phone,
          t.from,
          t.to,
          t.status,
          t.notes,
        ],
      );
      console.log(`Inserted day_book_entry ${t.serial} (${t.travel_date} ${t.time})`);
    }

    // Check if already exists in bookings
    const bCheck = await pool.query(
      `SELECT id FROM bookings WHERE ticket_number = $1`,
      [t.ticket],
    );
    if (bCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO bookings (
           ticket_number, pnr_number, booking_id, booking_number,
           booking_date, departure_datetime, pickup_time,
           passenger_name, passenger_phone, from_location, to_location,
           vehicle_type, booking_status, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          t.ticket,
          t.pnr,
          `BKG-${t.serial}`,
          `BK-${t.serial}`,
          t.booking_date,
          `${t.travel_date} 00:00:00+05:30`,
          t.time,
          t.pax_name,
          t.phone,
          t.from,
          t.to,
          t.travel_by,
          "CONFIRMED",
          t.notes,
        ],
      );
      console.log(`Inserted booking ${t.ticket} (${t.travel_date} ${t.time})`);
    }
  }

  console.log("Seeding complete!");
  await pool.end();
}

main().catch(console.error);
