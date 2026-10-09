import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://fortu851:wUNXTe5joMO1ckaBMB0354ScA@168.119.64.101:5432/fortu851";

export const pool = new Pool({
  connectionString,
  host: process.env.PGHOST || "168.119.64.101",
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || "fortu851",
  user: process.env.PGUSER || "fortu851",
  password: process.env.PGPASSWORD || "wUNXTe5joMO1ckaBMB0354ScA",
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

let columnsEnsured = false;

export async function ensureBusinessColumns() {
  if (columnsEnsured) return;
  columnsEnsured = true;
  try {
    await pool.query(`
      -- flight_bookings
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS passenger_name TEXT;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS date_of_birth DATE;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS passenger_age INTEGER;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS passenger_gender TEXT;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS infant TEXT;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS passport_id TEXT;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS ticket_number TEXT;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS seat_number TEXT;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS customer_id INTEGER;

      -- train_bookings
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS passenger_name TEXT;
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS passenger_phone TEXT;
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS date_of_birth DATE;
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS passenger_age INTEGER;
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS infant TEXT;
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS seat_berth TEXT;
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS ticket_status TEXT;
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS customer_id INTEGER;

      -- bus_bookings
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS passenger_name TEXT;
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS passenger_phone TEXT;
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS date_of_birth DATE;
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS passenger_age INTEGER;
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS infant TEXT;
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS seat_number TEXT;
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS customer_id INTEGER;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(20) UNIQUE NOT NULL,
        pnr_number VARCHAR(20) UNIQUE NOT NULL,
        booking_id VARCHAR(30) UNIQUE NOT NULL,
        booking_date TIMESTAMP DEFAULT NOW(),
        passenger_name TEXT NOT NULL,
        passenger_phone TEXT NOT NULL,
        number_of_members INTEGER NOT NULL DEFAULT 1,
        package_name TEXT,
        tour_type TEXT,
        trip_type TEXT,
        from_location TEXT,
        to_location TEXT,
        boarding_point TEXT,
        departure_datetime TIMESTAMP,
        driver_name TEXT,
        driver_phone TEXT,
        taxi_number TEXT,
        vehicle_type TEXT,
        total_amount NUMERIC(12,2) DEFAULT 0,
        advance_amount NUMERIC(12,2) DEFAULT 0,
        amount_paid NUMERIC(12,2) DEFAULT 0,
        balance_amount NUMERIC(12,2) DEFAULT 0,
        payment_status TEXT DEFAULT 'Pending',
        booking_status TEXT DEFAULT 'Confirmed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS booking_payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        payment_id VARCHAR(50),
        gateway_order_id VARCHAR(100),
        transaction_id VARCHAR(100),
        amount NUMERIC(12,2) NOT NULL,
        payment_method TEXT DEFAULT 'UPI',
        payment_status TEXT DEFAULT 'Success',
        paid_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_ticket ON bookings(ticket_number);
      CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings(pnr_number);
      CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
      CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
      CREATE INDEX IF NOT EXISTS idx_bookings_departure ON bookings(departure_datetime);
      CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at);
      CREATE INDEX IF NOT EXISTS idx_booking_payments_booking ON booking_payments(booking_id);
    `);

    await pool.query(`
      -- ============================================================
      -- BOOKING MANAGEMENT SYSTEM EXTENSIONS (additive, safe)
      -- ============================================================

      -- Human-friendly sequential document numbers (ENQ-/BK-)
      CREATE SEQUENCE IF NOT EXISTS enquiry_number_seq START 1;
      CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;

      -- ---- enquiries extensions ----
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS enquiry_number VARCHAR(20);
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS category VARCHAR(10) DEFAULT 'OTHER';
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS whatsapp TEXT;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS return_date TEXT;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS pickup_time TEXT;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS trip_type TEXT;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS vehicle_name TEXT;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS passenger_count INTEGER;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'WEBSITE';
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS converted_booking_id INTEGER;
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(80);

      CREATE UNIQUE INDEX IF NOT EXISTS uq_enquiries_enquiry_number ON enquiries(enquiry_number);
      CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
      CREATE INDEX IF NOT EXISTS idx_enquiries_category ON enquiries(category);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_enquiries_idempotency ON enquiries(idempotency_key) WHERE idempotency_key IS NOT NULL;

      -- ---- bookings extensions ----
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_number VARCHAR(20);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS enquiry_id TEXT;
      ALTER TABLE bookings ALTER COLUMN enquiry_id TYPE TEXT USING enquiry_id::text;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS enquiry_number VARCHAR(20);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS category VARCHAR(10) DEFAULT 'CAR';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source TEXT DEFAULT 'ADMIN';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_address TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS company_name TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS gst_number TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_time TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_date DATE;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS number_of_days INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS distance_km NUMERIC(10,2);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rate_per_km NUMERIC(10,2);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS min_km INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS base_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_allowance NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS toll_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parking_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS permit_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS state_tax_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_charge NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS additional_charges NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bus_type TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bus_number TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bus_operator TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seating_capacity INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS train_name TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS train_number TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_class TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS departure_time TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrival_date DATE;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrival_time TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ticket_status TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ticket_amount NUMERIC(12,2);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS airline TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS flight_number TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cabin_class TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS baggage TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_instructions TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

      -- ---- NEW: Booking system redesign extensions ----
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(20);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(10);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_id INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coach TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS berth TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS departure_airport TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrival_airport TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pnr_external TEXT;
      ALTER TABLE day_book_entries ADD COLUMN IF NOT EXISTS pnr TEXT;
      ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS pnr TEXT;
      ALTER TABLE train_bookings ADD COLUMN IF NOT EXISTS pnr TEXT;
      ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS pnr TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ticket_confirmation TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ticket_cost NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_charge_booking NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seat_preference TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_operator TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_class TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_date_flight DATE;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fare_breakdown TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS itinerary TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hotel_preference TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_id TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_title TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS adults_count INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS children_count INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS infants_count INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quota TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS berth_preference TEXT;

      -- ---- booking_passengers (for train, bus, flight, tour) ----
      CREATE TABLE IF NOT EXISTS booking_passengers (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        seat_berth TEXT,
        ticket_number TEXT,
        phone TEXT,
        dob TEXT,
        passport_number TEXT,
        passport_expiry TEXT,
        nationality TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS dob TEXT;
      ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS passport_number TEXT;
      ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS passport_expiry TEXT;
      ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS nationality TEXT;
      CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking ON booking_passengers(booking_id);

      -- ---- enquiries: booking_type for new workflow ----
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS booking_type VARCHAR(10);

      CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_booking_number ON bookings(booking_number);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_booking_reference ON bookings(booking_reference) WHERE booking_reference IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_bookings_category ON bookings(category);
      CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(booking_source);
      CREATE INDEX IF NOT EXISTS idx_bookings_enquiry_id ON bookings(enquiry_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_enquiry_number ON bookings(enquiry_number);
      CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);
      CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);

      -- ---- booking_payments extensions (audit-safe payments) ----
      ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS reference_number TEXT;
      ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS received_by TEXT DEFAULT 'Admin';
      ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS payment_date DATE;
      ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
      ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
      ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      -- ---- booking_passengers (multi-passenger for train/flight/bus) ----
      CREATE TABLE IF NOT EXISTS booking_passengers (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        seat_berth TEXT,
        ticket_number TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking ON booking_passengers(booking_id);

      -- ---- refunds (never mixed with normal payments) ----
      CREATE TABLE IF NOT EXISTS refunds (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
        refund_date DATE DEFAULT CURRENT_DATE,
        refund_method TEXT,
        transaction_ref TEXT,
        reason TEXT,
        notes TEXT,
        created_by TEXT DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_refunds_booking ON refunds(booking_id);

      -- ---- audit / activity logs ----
      CREATE TABLE IF NOT EXISTS booking_activity_logs (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER,
        enquiry_id TEXT,
        action TEXT NOT NULL,
        entity TEXT,
        entity_ref TEXT,
        old_value TEXT,
        new_value TEXT,
        details TEXT,
        actor TEXT DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE booking_activity_logs ALTER COLUMN enquiry_id TYPE TEXT USING enquiry_id::text;
      CREATE INDEX IF NOT EXISTS idx_activity_booking ON booking_activity_logs(booking_id);
      CREATE INDEX IF NOT EXISTS idx_activity_enquiry ON booking_activity_logs(enquiry_id);

      -- ---- booking_documents (ticket uploads, generated PDFs, receipts) ----
      CREATE TABLE IF NOT EXISTS booking_documents (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        document_type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        storage_file_id INTEGER,
        storage_path TEXT,
        uploaded_by TEXT DEFAULT 'Admin',
        uploaded_at TIMESTAMP DEFAULT NOW(),
        version INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        notes TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_booking_documents_booking ON booking_documents(booking_id);

      -- ---- booking reference sequence ----
      CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1;
    `);

    // ---- Backfills (idempotent: only touch rows still missing numbers) ----
    await pool.query(`
      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (ORDER BY id) AS rn,
               COALESCE(EXTRACT(YEAR FROM created_at)::int, EXTRACT(YEAR FROM NOW())::int) AS yr
        FROM enquiries
        WHERE enquiry_number IS NULL
      )
      UPDATE enquiries e
      SET enquiry_number = 'ENQ-' || ranked.yr || '-' || LPAD(ranked.rn::text, 6, '0')
      FROM ranked
      WHERE e.id = ranked.id;

      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (ORDER BY id) AS rn,
               COALESCE(EXTRACT(YEAR FROM created_at)::int, EXTRACT(YEAR FROM NOW())::int) AS yr
        FROM bookings
        WHERE booking_number IS NULL
      )
      UPDATE bookings b
      SET booking_number = 'BK-' || ranked.yr || '-' || LPAD(ranked.rn::text, 6, '0')
      FROM ranked
      WHERE b.id = ranked.id;
    `);

    // Keep sequences ahead of any manually assigned numbers
    const seqSync = await pool.query(`
      SELECT
        (SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(enquiry_number, '^ENQ-[0-9]{4}-', ''), '')::bigint, 0)) FROM enquiries WHERE enquiry_number LIKE 'ENQ-%') AS max_enq,
        (SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(booking_number, '^BK-[0-9]{4}-', ''), '')::bigint, 0)) FROM bookings WHERE booking_number LIKE 'BK-%') AS max_bk,
        (SELECT last_value FROM enquiry_number_seq) AS cur_enq,
        (SELECT last_value FROM booking_number_seq) AS cur_bk
    `);
    const s = seqSync.rows[0];
    if (Number(s.max_enq) > Number(s.cur_enq)) {
      await pool.query(`SELECT setval('enquiry_number_seq', $1)`, [Number(s.max_enq)]);
    }
    if (Number(s.max_bk) > Number(s.cur_bk)) {
      await pool.query(`SELECT setval('booking_number_seq', $1)`, [Number(s.max_bk)]);
    }

    // Keep booking_ref_seq ahead of any manually assigned FT- references
    try {
      const refSync = await pool.query(`
        SELECT
          COALESCE(MAX(NULLIF(REGEXP_REPLACE(booking_reference, '^FT-[0-9]{4}-', ''), '')::bigint), 0) AS max_ref,
          (SELECT last_value FROM booking_ref_seq) AS cur_ref
        FROM bookings WHERE booking_reference LIKE 'FT-%'
      `);
      const r = refSync.rows[0];
      if (Number(r.max_ref) > Number(r.cur_ref)) {
        await pool.query(`SELECT setval('booking_ref_seq', $1)`, [Number(r.max_ref)]);
      }
    } catch (_) { /* sequence may not exist yet on first run */ }
  } catch (err) {
    console.error("Column verification error:", err);
  }
}

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  await ensureBusinessColumns();
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      console.log("Executed query", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error("Database Query Error:", { text, error });
    throw error;
  }
}
