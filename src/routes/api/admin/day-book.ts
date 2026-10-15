import { createFileRoute } from "@tanstack/react-router";
import { query } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";

/**
 * Parses time string like "04:00", "4:30AM", "17:30", "07:00 PM", "12:30 AM" into { hours, minutes, formatted }
 */
function parseTimeString(timeStr?: string | null): { hours: number; minutes: number; formatted: string } {
  if (!timeStr || !timeStr.trim()) {
    return { hours: 6, minutes: 0, formatted: "06:00 AM" };
  }

  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*([ap]m)?$/i);
  if (!match) {
    return { hours: 6, minutes: 0, formatted: clean };
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  const dispHours = hours % 12 || 12;
  const dispMeridian = hours >= 12 ? "PM" : "AM";
  const dispMinutes = String(minutes).padStart(2, "0");
  const formatted = `${String(dispHours).padStart(2, "0")}:${dispMinutes} ${dispMeridian}`;

  return { hours, minutes, formatted };
}

/**
 * Extracts time from string notes e.g. "Time: 04:00" or "Time: 10:30AM"
 */
function extractTimeFromNotes(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/Time:\s*([0-9]{1,2}:[0-9]{2}(?:\s*[AaPp][Mm])?)/i);
  return match ? match[1].trim() : null;
}

/**
 * Safely extracts { year, month, day } from database date
 */
function extractYearMonthDay(dateVal: any): { year: number; month: number; day: number } | null {
  if (!dateVal) return null;
  if (typeof dateVal === "string") {
    const m = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return {
        year: parseInt(m[1], 10),
        month: parseInt(m[2], 10),
        day: parseInt(m[3], 10),
      };
    }
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;

  // Add 5.5 hours to account for IST timezone shift when stored as UTC 18:30:00
  const istDate = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  let year = istDate.getUTCFullYear();
  if (year > 3000) year = 2026;

  return {
    year,
    month: istDate.getUTCMonth() + 1,
    day: istDate.getUTCDate(),
  };
}

/**
 * Calculates exact departure timestamp in milliseconds (IST UTC+5:30)
 */
function buildDepartureTimestamp(dateVal: any, hours: number, minutes: number): number {
  const ymd = extractYearMonthDay(dateVal);
  if (!ymd) return 0;

  const yStr = String(ymd.year).padStart(4, "0");
  const mStr = String(ymd.month).padStart(2, "0");
  const dStr = String(ymd.day).padStart(2, "0");
  const hStr = String(hours).padStart(2, "0");
  const minStr = String(minutes).padStart(2, "0");

  const isoStr = `${yStr}-${mStr}-${dStr}T${hStr}:${minStr}:00+05:30`;
  const parsed = new Date(isoStr);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

/**
 * Formats date to standard DD-MM-YYYY
 */
function formatDateToStandard(dateVal: any): string {
  const ymd = extractYearMonthDay(dateVal);
  if (!ymd) return "-";
  const day = String(ymd.day).padStart(2, "0");
  const month = String(ymd.month).padStart(2, "0");
  return `${day}-${month}-${ymd.year}`;
}

/**
 * Returns true if status indicates completed / cancelled / closed
 */
function isExcludedStatus(status?: string | null): boolean {
  if (!status) return false;
  const s = status.trim().toUpperCase();
  return (
    s === "COMPLETED" ||
    s === "TRIP DONE" ||
    s === "DONE" ||
    s === "CANCELLED" ||
    s === "CLOSED" ||
    s === "REFUNDED"
  );
}

export const Route = createFileRoute("/api/admin/day-book")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAdminAuthorized(request)) {
          return unauthorizedResponse();
        }

        try {
          const now = Date.now();
          // CURRENT 24-HOUR OPERATIONAL WINDOW:
          // A trip is eligible if its departure datetime is within the past 24 hours (current window)
          // OR in the future (future trips).
          const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
          const windowStartMs = now - TWENTY_FOUR_HOURS_MS;

          // 1. Fetch from day_book_entries (excluding completed / cancelled)
          const dayBookRes = await query(
            `SELECT id, serial_number, booking_date, travel_date, travel_date::text as travel_date_str,
                    travel_by, passenger_name, passenger_phone, from_location, to_location,
                    status, notes, created_at
             FROM day_book_entries
             WHERE (deleted_at IS NULL)
               AND (status IS NULL OR UPPER(status) NOT IN ('COMPLETED', 'TRIP DONE', 'DONE', 'CANCELLED', 'CLOSED', 'REFUNDED'))
             ORDER BY id DESC`,
          );

          // 2. Fetch from bookings
          const bookingsRes = await query(
            `SELECT id, ticket_number, pnr_number, booking_id, booking_number, booking_date,
                    departure_datetime, departure_datetime::text as departure_datetime_str,
                    pickup_time, departure_time, from_location, to_location,
                    passenger_name, passenger_phone, vehicle_type, driver_name, driver_phone, taxi_number,
                    booking_status, notes, created_at
             FROM bookings
             WHERE (booking_status IS NULL OR UPPER(booking_status) NOT IN ('COMPLETED', 'TRIP DONE', 'DONE', 'CANCELLED', 'CLOSED', 'REFUNDED'))
             ORDER BY id DESC`,
          );

          // Build lookup map for bookings
          const bookingByPhone = new Map<string, any>();
          const bookingByTicket = new Map<string, any>();
          for (const b of bookingsRes.rows) {
            if (b.passenger_phone) {
              const cleanP = b.passenger_phone.replace(/\D/g, "").slice(-10);
              if (cleanP) bookingByPhone.set(cleanP, b);
            }
            if (b.ticket_number) {
              bookingByTicket.set(b.ticket_number.trim().toUpperCase(), b);
            }
          }

          const seenKeys = new Set<string>();
          const unifiedTrips: any[] = [];

          // Process day_book_entries
          for (const row of dayBookRes.rows) {
            if (isExcludedStatus(row.status)) continue;

            const cleanPhone = (row.passenger_phone || "").replace(/\D/g, "").slice(-10);
            const ticketMatch = (row.notes || "").match(/Ticket No:\s*([A-Z0-9]+)/i);
            const ticketNo = ticketMatch ? ticketMatch[1].toUpperCase() : null;

            const linkedBooking =
              (ticketNo && bookingByTicket.get(ticketNo)) ||
              (cleanPhone && bookingByPhone.get(cleanPhone)) ||
              null;

            const rawTime =
              extractTimeFromNotes(row.notes) ||
              row.departure_time ||
              linkedBooking?.pickup_time ||
              linkedBooking?.departure_time ||
              "06:00 AM";

            const parsedTime = parseTimeString(rawTime);
            const dateVal = row.travel_date_str || row.travel_date;
            const departureTimestamp = buildDepartureTimestamp(
              dateVal,
              parsedTime.hours,
              parsedTime.minutes,
            );

            // ==============================================================
            // 24-HOUR + FUTURE TRIP RULE:
            // Must be in the current 24-hour window OR in the future!
            // Automatically excludes old historical trips outside the 24h window.
            // ==============================================================
            if (departureTimestamp < windowStartMs) {
              continue;
            }

            const dateStr = formatDateToStandard(dateVal);
            const dedupeKey = `${cleanPhone || row.passenger_name}_${dateStr}_${parsedTime.formatted}`;
            seenKeys.add(dedupeKey);

            unifiedTrips.push({
              id: `db-${row.id}`,
              source: "day_book",
              db_id: row.id,
              booking_id: linkedBooking?.id || null,
              serial_number: row.serial_number || `DB-${row.id}`,
              booking_date: formatDateToStandard(row.booking_date || row.created_at),
              travel_date_raw: dateVal,
              on_date: dateStr,
              from_location: row.from_location || linkedBooking?.from_location || "Bengaluru",
              to_location: row.to_location || linkedBooking?.to_location || "Outstation",
              departure_time: parsedTime.formatted,
              raw_time: rawTime,
              passenger_phone: row.passenger_phone || linkedBooking?.passenger_phone || "-",
              passenger_name: row.passenger_name || linkedBooking?.passenger_name || "Guest Customer",
              status: row.status || "Pending",
              departure_timestamp: departureTimestamp,
              vehicle: row.travel_by || linkedBooking?.vehicle_type || "-",
              driver_name: linkedBooking?.driver_name || "-",
              driver_phone: linkedBooking?.driver_phone || "-",
              taxi_number: linkedBooking?.taxi_number || null,
              ticket_number: ticketNo || linkedBooking?.ticket_number || null,
              pnr_number: linkedBooking?.pnr_number || null,
              notes: row.notes || linkedBooking?.notes || "",
            });
          }

          // Process standalone bookings
          for (const b of bookingsRes.rows) {
            if (isExcludedStatus(b.booking_status)) continue;

            const cleanPhone = (b.passenger_phone || "").replace(/\D/g, "").slice(-10);
            const dateVal = b.departure_datetime_str || b.departure_datetime;
            const rawTime = b.pickup_time || b.departure_time || extractTimeFromNotes(b.notes) || "06:00 AM";
            const parsedTime = parseTimeString(rawTime);
            const departureTimestamp = buildDepartureTimestamp(
              dateVal,
              parsedTime.hours,
              parsedTime.minutes,
            );

            // ==============================================================
            // 24-HOUR + FUTURE TRIP RULE
            // ==============================================================
            if (departureTimestamp < windowStartMs) {
              continue;
            }

            const dateStr = formatDateToStandard(dateVal);
            const dedupeKey = `${cleanPhone || b.passenger_name}_${dateStr}_${parsedTime.formatted}`;

            if (seenKeys.has(dedupeKey)) continue;
            seenKeys.add(dedupeKey);

            unifiedTrips.push({
              id: `bkg-${b.id}`,
              source: "booking",
              booking_id: b.id,
              db_id: null,
              serial_number: b.booking_number || b.ticket_number || `BK-${b.id}`,
              booking_date: formatDateToStandard(b.booking_date || b.created_at),
              travel_date_raw: dateVal,
              on_date: dateStr,
              from_location: b.from_location || "Bengaluru",
              to_location: b.to_location || "Outstation",
              departure_time: parsedTime.formatted,
              raw_time: rawTime,
              passenger_phone: b.passenger_phone || "-",
              passenger_name: b.passenger_name || "Guest Customer",
              status: b.booking_status || "Pending",
              departure_timestamp: departureTimestamp,
              vehicle: b.vehicle_type || "-",
              driver_name: b.driver_name || "-",
              driver_phone: b.driver_phone || "-",
              taxi_number: b.taxi_number || null,
              ticket_number: b.ticket_number || null,
              pnr_number: b.pnr_number || null,
              notes: b.notes || "",
            });
          }

          // Chronological sorting: departureDateTime ASC (nearest current trip first, then later future trips)
          unifiedTrips.sort((a, b) => a.departure_timestamp - b.departure_timestamp);

          return new Response(
            JSON.stringify({
              success: true,
              count: unifiedTrips.length,
              current_time: new Date(now).toISOString(),
              window_start: new Date(windowStartMs).toISOString(),
              trips: unifiedTrips,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("GET /api/admin/day-book error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to load Day Book trips." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },

      POST: async ({ request }) => {
        if (!isAdminAuthorized(request)) {
          return unauthorizedResponse();
        }

        try {
          const body = await request.json();
          const { action, id, source, db_id, booking_id, phone, travel_date, ticket_number } = body;

          if (action === "trip_done") {
            // 1. Mark in day_book_entries as 'Completed'
            if (db_id || (source === "day_book" && id)) {
              const targetDbId = db_id || String(id).replace(/^db-/, "");
              await query(
                `UPDATE day_book_entries 
                 SET status = 'Completed', updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $1`,
                [targetDbId],
              );
            }

            // 2. Mark in bookings table as 'COMPLETED'
            if (booking_id || (source === "booking" && id)) {
              const targetBkgId = booking_id || String(id).replace(/^bkg-/, "");
              await query(
                `UPDATE bookings 
                 SET booking_status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $1`,
                [targetBkgId],
              );
            }

            // 3. Keep both tables synchronized by ticket number or phone + date
            if (ticket_number) {
              await query(
                `UPDATE bookings 
                 SET booking_status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP 
                 WHERE ticket_number = $1`,
                [ticket_number],
              ).catch(() => {});
            }

            if (phone && travel_date) {
              await query(
                `UPDATE day_book_entries 
                 SET status = 'Completed', updated_at = CURRENT_TIMESTAMP 
                 WHERE passenger_phone = $1 AND DATE(travel_date) = DATE($2)`,
                [phone, travel_date],
              ).catch(() => {});

              await query(
                `UPDATE bookings 
                 SET booking_status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP 
                 WHERE passenger_phone = $1 AND DATE(departure_datetime) = DATE($2)`,
                [phone, travel_date],
              ).catch(() => {});
            }

            return new Response(
              JSON.stringify({
                success: true,
                message: "Trip marked as done successfully and status persisted to database.",
              }),
              { headers: { "Content-Type": "application/json" } },
            );
          }

          if (action === "assign_driver" || action === "update_driver") {
            const {
              driver_name,
              driver_phone,
              taxi_number,
              vehicle_type,
            } = body;

            // 1. Update in bookings table
            if (booking_id || (source === "booking" && id)) {
              const targetBkgId = booking_id || String(id).replace(/^bkg-/, "");
              await query(
                `UPDATE bookings 
                 SET driver_name = $1, driver_phone = $2, taxi_number = $3, vehicle_type = COALESCE($4, vehicle_type), updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $5`,
                [driver_name || null, driver_phone || null, taxi_number || null, vehicle_type || null, targetBkgId],
              ).catch((e) => console.error("Error updating booking driver:", e));
            }

            // 2. Update day_book_entries if db_id exists
            if (db_id || (source === "day_book" && id)) {
              const targetDbId = db_id || String(id).replace(/^db-/, "");
              await query(
                `UPDATE day_book_entries 
                 SET travel_by = COALESCE($1, travel_by), updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [vehicle_type || null, targetDbId],
              ).catch((e) => console.error("Error updating day_book_entries travel_by:", e));
            }

            // 3. Keep bookings synchronized by ticket_number or phone
            if (ticket_number) {
              await query(
                `UPDATE bookings 
                 SET driver_name = $1, driver_phone = $2, taxi_number = $3, vehicle_type = COALESCE($4, vehicle_type), updated_at = CURRENT_TIMESTAMP 
                 WHERE ticket_number = $5`,
                [driver_name || null, driver_phone || null, taxi_number || null, vehicle_type || null, ticket_number],
              ).catch(() => {});
            }

            if (phone) {
              const cleanP = phone.replace(/\D/g, "").slice(-10);
              if (cleanP) {
                await query(
                  `UPDATE bookings 
                   SET driver_name = $1, driver_phone = $2, taxi_number = $3, vehicle_type = COALESCE($4, vehicle_type), updated_at = CURRENT_TIMESTAMP 
                   WHERE passenger_phone LIKE $5`,
                  [driver_name || null, driver_phone || null, taxi_number || null, vehicle_type || null, `%${cleanP}%`],
                ).catch(() => {});
              }
            }

            return new Response(
              JSON.stringify({
                success: true,
                message: "Driver details assigned successfully.",
                driver_name: driver_name || "-",
                driver_phone: driver_phone || "-",
                taxi_number: taxi_number || null,
                vehicle_type: vehicle_type || null,
              }),
              { headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(
            JSON.stringify({ success: false, error: "Unsupported action." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("POST /api/admin/day-book error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to update trip status." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
