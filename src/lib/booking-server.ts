import { query } from "./db";

/* ────────────────────────────────────────────────────────────
   Shared constants
   ──────────────────────────────────────────────────────────── */

export const BOOKING_CATEGORIES = ["CAR", "BUS", "TRAIN", "FLIGHT", "OTHER"] as const;
export type BookingCategory = (typeof BOOKING_CATEGORIES)[number];

export const PAYMENT_METHODS = [
  "CASH",
  "UPI",
  "BANK TRANSFER",
  "CARD",
  "RAZORPAY",
  "OTHER",
] as const;

export const BOOKING_SOURCES = [
  "WEBSITE",
  "PHONE",
  "WHATSAPP",
  "WALK-IN",
  "OFFLINE",
  "ADMIN",
] as const;

export const ENQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTATION SENT",
  "FOLLOW-UP",
  "CONVERTED",
  "CANCELLED",
  "CLOSED",
] as const;

export const BOOKING_STATUSES = [
  "BOOKING REQUESTED",
  "PENDING CONFIRMATION",
  "ADMIN PROCESSING",
  "TICKET BOOKED",
  "TICKET UPLOADED",
  "CONFIRMED",
  "ADVANCE RECEIVED",
  "PARTIALLY PAID",
  "FULLY PAID",
  "IN PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REFUND PENDING",
  "REFUNDED",
] as const;

export const BOOKING_TYPES = ["TAXI", "BUS", "TRAIN", "FLIGHT"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

/** Legacy statuses that must never be auto-upgraded away from */
const OPERATIONAL_STATUSES = [
  "IN PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REFUND PENDING",
  "REFUNDED",
];

/** Map a customer-facing service name to a booking category */
export function serviceToCategory(service?: string | null): string {
  const s = String(service || "").toUpperCase();
  if (s.includes("FLIGHT")) return "FLIGHT";
  if (s.includes("TRAIN")) return "TRAIN";
  if (s.includes("BUS")) return "BUS";
  if (
    s.includes("OUTSTATION") ||
    s.includes("LOCAL") ||
    s.includes("CORPORATE") ||
    s.includes("AIRPORT") ||
    s.includes("HOURLY") ||
    s.includes("TOUR") ||
    s.includes("PACKAGE") ||
    s.includes("TRANSFER")
  ) {
    return "CAR";
  }
  return "OTHER";
}

export function normalizeCategory(raw?: string | null): string {
  const c = String(raw || "").toUpperCase();
  return (BOOKING_CATEGORIES as readonly string[]).includes(c) ? c : "OTHER";
}

export function normalizePaymentMethod(raw?: string | null): string | null {
  if (!raw) return null;
  const m = String(raw).toUpperCase();
  if ((PAYMENT_METHODS as readonly string[]).includes(m)) return m;
  // Legacy values from the existing UI
  if (m === "CASH") return "CASH";
  if (m === "UPI") return "UPI";
  if (m === "CARD") return "CARD";
  if (m === "ADVANCE") return "CASH";
  if (m.includes("BANK") || m === "NEFT" || m === "IMPS" || m === "RTGS") return "BANK TRANSFER";
  if (m.includes("RAZOR")) return "RAZORPAY";
  return "OTHER";
}

/* ────────────────────────────────────────────────────────────
   Money helpers — the server is the single source of truth
   ──────────────────────────────────────────────────────────── */

export function toMoney(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export interface PaymentSummary {
  total: number;
  paid: number;
  refunded: number;
  netPaid: number;
  remaining: number;
  overpaid: number;
  paymentStatus: "Unpaid" | "Partially Paid" | "Fully Paid";
}

/**
 * Recomputes a booking's financial position from the payment transactions
 * (never trusts cached fields), persists the cache, and returns the summary.
 *
 *   TOTAL PAID  = SUM(successful payments)
 *   NET PAID    = TOTAL PAID - SUM(refunds)
 *   REMAINING   = max(0, TOTAL - NET PAID)
 */
export async function recalcBooking(bookingId: number | string): Promise<PaymentSummary> {
  const id = Number(bookingId);
  const res = await query(
    `SELECT b.total_amount,
            b.ticket_amount,
            b.base_amount,
            COALESCE((SELECT SUM(p.amount) FROM booking_payments p
                      WHERE p.booking_id = b.id AND p.payment_status = 'Success'
                        AND NOT COALESCE(p.is_deleted, false)), 0) AS paid,
            COALESCE((SELECT SUM(r.amount) FROM refunds r WHERE r.booking_id = b.id), 0) AS refunded,
            b.booking_status
     FROM bookings b WHERE b.id = $1`,
    [id],
  );
  if (res.rows.length === 0) throw new Error(`Booking ${id} not found`);

  const row = res.rows[0];
  const total = Math.max(0, Number(row.total_amount || row.ticket_amount || row.base_amount || 0));
  const paid = Math.max(0, Number(row.paid) || 0);
  const refunded = Math.max(0, Number(row.refunded) || 0);
  const netPaid = Math.round((paid - refunded) * 100) / 100;
  const remaining = Math.max(0, Math.round((total - netPaid) * 100) / 100);
  const overpaid = Math.max(0, Math.round((netPaid - total) * 100) / 100);

  let paymentStatus: PaymentSummary["paymentStatus"];
  if (netPaid <= 0) paymentStatus = "Unpaid";
  else if (netPaid >= total && total > 0) paymentStatus = "Fully Paid";
  else paymentStatus = "Partially Paid";

  // Auto-advance operational status only upward, never override real states (#45)
  const status = String(row.booking_status || "").toUpperCase();
  let newBookingStatus: string | null = null;
  if (!OPERATIONAL_STATUSES.includes(status)) {
    if (paymentStatus === "Fully Paid" && status !== "FULLY PAID") {
      newBookingStatus = "CONFIRMED";
    } else if (paymentStatus === "Partially Paid" && status === "PENDING CONFIRMATION") {
      newBookingStatus = "ADVANCE RECEIVED";
    }
  }

  await query(
    `UPDATE bookings SET
       amount_paid = $2,
       balance_amount = $3,
       advance_amount = GREATEST(advance_amount, LEAST($4::numeric, total_amount)),
       refunded_amount = $5,
       payment_status = $6,
       booking_status = COALESCE($7, booking_status),
       updated_at = NOW()
     WHERE id = $1`,
    [
      id,
      netPaid,
      remaining,
      Math.min(paid, total || paid),
      refunded,
      paymentStatus,
      newBookingStatus,
    ],
  );

  return { total, paid, refunded, netPaid, remaining, overpaid, paymentStatus };
}

/* ────────────────────────────────────────────────────────────
   Document numbers — ENQ-YYYY-###### / BK-YYYY-######
   ──────────────────────────────────────────────────────────── */

async function nextFromSequence(seq: "enquiry_number_seq" | "booking_number_seq" | "booking_ref_seq"): Promise<number> {
  const r = await query(`SELECT nextval('${seq}') AS n`);
  return Number(r.rows[0].n);
}

export async function generateEnquiryNumber(): Promise<string> {
  const year = new Date().getFullYear();
  try {
    const res = await query(`
      SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(enquiry_number, '^.*-', ''), '')::bigint), 0) AS max_num
      FROM enquiries
    `);
    const maxNum = Number(res.rows[0]?.max_num || 0);
    let seqVal = await nextFromSequence("enquiry_number_seq").catch(() => 0);
    let candidateNum = Math.max(maxNum + 1, seqVal);
    await query(`SELECT setval('enquiry_number_seq', $1, true)`, [candidateNum]).catch(() => {});

    let candidate = `ENQ-${year}-${String(candidateNum).padStart(6, "0")}`;
    let check = await query(`SELECT 1 FROM enquiries WHERE enquiry_number = $1`, [candidate]);
    while (check.rows.length > 0) {
      candidateNum++;
      candidate = `ENQ-${year}-${String(candidateNum).padStart(6, "0")}`;
      check = await query(`SELECT 1 FROM enquiries WHERE enquiry_number = $1`, [candidate]);
    }
    await query(`SELECT setval('enquiry_number_seq', $1, true)`, [candidateNum]).catch(() => {});
    return candidate;
  } catch (err) {
    console.error("Error generating enquiry number:", err);
    return `ENQ-${year}-${String(Date.now()).slice(-6)}`;
  }
}

export async function generateBookingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  try {
    const res = await query(`
      SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(booking_number, '^.*-', ''), '')::bigint), 0) AS max_num
      FROM bookings
    `);
    const maxNum = Number(res.rows[0]?.max_num || 0);
    let seqVal = await nextFromSequence("booking_number_seq").catch(() => 0);
    let candidateNum = Math.max(maxNum + 1, seqVal);
    await query(`SELECT setval('booking_number_seq', $1, true)`, [candidateNum]).catch(() => {});

    let candidate = `BK-${year}-${String(candidateNum).padStart(6, "0")}`;
    let check = await query(`SELECT 1 FROM bookings WHERE booking_number = $1`, [candidate]);
    while (check.rows.length > 0) {
      candidateNum++;
      candidate = `BK-${year}-${String(candidateNum).padStart(6, "0")}`;
      check = await query(`SELECT 1 FROM bookings WHERE booking_number = $1`, [candidate]);
    }
    await query(`SELECT setval('booking_number_seq', $1, true)`, [candidateNum]).catch(() => {});
    return candidate;
  } catch (err) {
    console.error("Error generating booking number:", err);
    return `BK-${year}-${String(Date.now()).slice(-6)}`;
  }
}

export async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear();
  try {
    const res = await query(`
      SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(booking_reference, '^.*-', ''), '')::bigint), 0) AS max_num
      FROM bookings WHERE booking_reference LIKE 'FT-%'
    `);
    const maxNum = Number(res.rows[0]?.max_num || 0);
    let seqVal = await nextFromSequence("booking_ref_seq").catch(() => 0);
    let candidateNum = Math.max(maxNum + 1, seqVal);
    await query(`SELECT setval('booking_ref_seq', $1, true)`, [candidateNum]).catch(() => {});

    let candidate = `FT-${year}-${String(candidateNum).padStart(6, "0")}`;
    let check = await query(`SELECT 1 FROM bookings WHERE booking_reference = $1`, [candidate]);
    while (check.rows.length > 0) {
      candidateNum++;
      candidate = `FT-${year}-${String(candidateNum).padStart(6, "0")}`;
      check = await query(`SELECT 1 FROM bookings WHERE booking_reference = $1`, [candidate]);
    }
    await query(`SELECT setval('booking_ref_seq', $1, true)`, [candidateNum]).catch(() => {});
    return candidate;
  } catch (err) {
    console.error("Error generating booking reference:", err);
    return `FT-${year}-${String(Date.now()).slice(-6)}`;
  }
}

/** Map a booking category (CAR/BUS/TRAIN/FLIGHT) to a booking type (TAXI/BUS/TRAIN/FLIGHT) */
export function bookingTypeFromCategory(category?: string | null): BookingType {
  const c = String(category || "").toUpperCase();
  if (c === "CAR" || c === "TAXI") return "TAXI";
  if (c === "BUS") return "BUS";
  if (c === "TRAIN") return "TRAIN";
  if (c === "FLIGHT") return "FLIGHT";
  return "TAXI"; // default fallback
}

/** Map a booking type back to a booking category */
export function categoryFromBookingType(bookingType?: string | null): BookingCategory {
  const t = String(bookingType || "").toUpperCase();
  if (t === "TAXI") return "CAR";
  if (t === "BUS") return "BUS";
  if (t === "TRAIN") return "TRAIN";
  if (t === "FLIGHT") return "FLIGHT";
  return "CAR";
}

/* ────────────────────────────────────────────────────────────
   Audit trail
   ──────────────────────────────────────────────────────────── */

export interface ActivityEntry {
  booking_id?: number | null;
  enquiry_id?: string | number | null;
  action: string;
  entity?: string | null;
  entity_ref?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  details?: string | null;
  actor?: string | null;
}

export async function logActivity(entry: ActivityEntry): Promise<void> {
  try {
    await query(
      `INSERT INTO booking_activity_logs
         (booking_id, enquiry_id, action, entity, entity_ref, old_value, new_value, details, actor)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        entry.booking_id ?? null,
        entry.enquiry_id ?? null,
        entry.action,
        entry.entity ?? null,
        entry.entity_ref ?? null,
        entry.old_value != null ? String(entry.old_value) : null,
        entry.new_value != null ? String(entry.new_value) : null,
        entry.details ?? null,
        entry.actor || "Admin",
      ],
    );
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

/* ────────────────────────────────────────────────────────────
   Booking update — shared by PUT /api/bookings and /api/bookings/$id
   ──────────────────────────────────────────────────────────── */

const EDITABLE_FIELDS = [
  "passenger_name",
  "passenger_phone",
  "number_of_members",
  "package_name",
  "tour_type",
  "trip_type",
  "from_location",
  "to_location",
  "boarding_point",
  "departure_datetime",
  "return_date",
  "pickup_time",
  "number_of_days",
  "driver_name",
  "driver_phone",
  "taxi_number",
  "vehicle_type",
  "customer_email",
  "customer_whatsapp",
  "customer_address",
  "company_name",
  "gst_number",
  "distance_km",
  "rate_per_km",
  "min_km",
  "base_amount",
  "driver_allowance",
  "toll_amount",
  "parking_amount",
  "permit_amount",
  "state_tax_amount",
  "service_charge",
  "additional_charges",
  "discount_amount",
  "tax_amount",
  "gst_amount",
  "total_amount",
  "bus_type",
  "bus_number",
  "bus_operator",
  "seating_capacity",
  "train_name",
  "train_number",
  "travel_class",
  "departure_time",
  "arrival_date",
  "arrival_time",
  "ticket_status",
  "ticket_amount",
  "airline",
  "flight_number",
  "cabin_class",
  "baggage",
  "special_instructions",
  "admin_notes",
  "notes",
  "booking_status",
  "category",
  "booking_type",
  "driver_id",
  "coach",
  "berth",
  "departure_airport",
  "arrival_airport",
  "pnr_external",
  "ticket_confirmation",
  "ticket_cost",
  "service_charge_booking",
  "seat_preference",
  "preferred_operator",
  "preferred_class",
  "return_date_flight",
];

const INT_FIELDS = ["number_of_members", "number_of_days", "min_km", "seating_capacity", "driver_id"];
const MONEY_FIELDS = [
  "distance_km",
  "rate_per_km",
  "base_amount",
  "driver_allowance",
  "toll_amount",
  "parking_amount",
  "permit_amount",
  "state_tax_amount",
  "service_charge",
  "additional_charges",
  "discount_amount",
  "tax_amount",
  "gst_amount",
  "total_amount",
  "ticket_amount",
  "ticket_cost",
  "service_charge_booking",
];

/** Returns { ok, booking?, response? } so routes can pass through errors */
export async function updateBookingFromPayload(data: any): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
  booking?: any;
}> {
  const { id } = data;
  if (!id) return { ok: false, status: 400, error: "ID is required for update." };

  const currentRes = await query(`SELECT * FROM bookings WHERE id = $1`, [id]);
  if (currentRes.rows.length === 0) return { ok: false, status: 404, error: "Booking not found." };
  const current = currentRes.rows[0];

  const sets: string[] = [];
  const values: unknown[] = [];
  const changes: Array<{ field: string; oldV: any; newV: any }> = [];

  for (const key of EDITABLE_FIELDS) {
    if (!(key in data) || data[key] === undefined) continue;
    let val = data[key];
    if (INT_FIELDS.includes(key)) {
      val = val === null || val === "" ? null : Number(val);
    } else if (MONEY_FIELDS.includes(key)) {
      if (val === "" || val === null) val = null;
      else {
        const mv = toMoney(val);
        if (mv === null) continue; // invalid money value → ignore field
        val = mv;
      }
    } else if (key === "category") {
      val = normalizeCategory(val);
    } else if (key === "booking_status") {
      val = String(val).toUpperCase();
    }
    values.push(val);
    sets.push(`${key} = $${values.length}`);
    const oldRaw = (current as any)[key];
    if (String(oldRaw ?? "") !== String(val ?? "")) {
      changes.push({ field: key, oldV: oldRaw, newV: val });
    }
  }

  if (sets.length === 0) return { ok: false, status: 400, error: "No fields provided for update." };

  if ("booking_status" in data && String(data.booking_status).toUpperCase() === "CANCELLED") {
    sets.push("cancelled_at = NOW()");
  }

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await query(
    `UPDATE bookings SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values,
  );

  // Recalculate financials from payment transactions after any amount change
  const summary = await recalcBooking(id);

  for (const c of changes) {
    const isStatus = c.field === "booking_status";
    const isTotal = c.field === "total_amount";
    await logActivity({
      booking_id: Number(id),
      action: isTotal
        ? "BOOKING AMOUNT CHANGED"
        : isStatus
          ? "BOOKING STATUS CHANGED"
          : "BOOKING EDITED",
      entity: "booking",
      entity_ref: current.booking_number,
      old_value: isStatus || isTotal ? c.oldV : null,
      new_value: isStatus || isTotal ? c.newV : null,
      details: isStatus || isTotal ? null : `${c.field}: ${c.oldV ?? "—"} → ${c.newV ?? "—"}`,
    });
  }

  return {
    ok: true,
    booking: { ...res.rows[0], paid_total: summary.netPaid, remaining_amount: summary.remaining },
  };
}
