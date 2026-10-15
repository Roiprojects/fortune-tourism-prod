import { createFileRoute } from "@tanstack/react-router";
import { query } from "@/lib/db";
import {
  generateEnquiryNumber,
  serviceToCategory,
  normalizeCategory,
  logActivity,
  generateBookingReference,
  generateBookingNumber,
  bookingTypeFromCategory,
  categoryFromBookingType,
} from "@/lib/booking-server";
import {
  generateTicketNumber,
  generatePNR,
  generateBookingId,
} from "@/lib/booking-utils";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/enquiries")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const status = url.searchParams.get("status");
          const category = url.searchParams.get("category");
          const q = url.searchParams.get("q")?.trim();
          const startDate = url.searchParams.get("startDate")?.trim();
          const endDate = url.searchParams.get("endDate")?.trim();
          const limit = Math.min(Number(url.searchParams.get("limit")) || 500, 2000);
          const offset = Number(url.searchParams.get("offset")) || 0;

          const conditions: string[] = [];
          const params: unknown[] = [];

          if (status && status !== "All") {
            // Accept both legacy ("New", "Quoted"…) and new ("NEW", "QUOTATION SENT") values
            params.push(status);
            conditions.push(
              `(status = $${params.length} OR UPPER(status) = UPPER($${params.length}))`,
            );
          }
          if (category) {
            params.push(normalizeCategory(category));
            conditions.push(`category = $${params.length}`);
          }
          if (q) {
            params.push(`%${q}%`);
            const p = `$${params.length}`;
            conditions.push(
              `(name ILIKE ${p} OR phone ILIKE ${p} OR COALESCE(email,'') ILIKE ${p} OR COALESCE(enquiry_number,'') ILIKE ${p} OR COALESCE(pickup,'') ILIKE ${p} OR COALESCE(destination,'') ILIKE ${p} OR COALESCE(service,'') ILIKE ${p})`,
            );
          }
          if (startDate) {
            params.push(startDate);
            conditions.push(`COALESCE(travel_date::text,'') >= $${params.length}`);
          }
          if (endDate) {
            params.push(endDate);
            conditions.push(`COALESCE(travel_date::text,'') <= $${params.length}`);
          }

          const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
          params.push(limit);
          const limitIdx = params.length;
          params.push(offset);
          const offsetIdx = params.length;

          const [dataRes, countRes, statusRes] = await Promise.all([
            query(
              `SELECT * FROM enquiries${where} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
              params,
            ),
            query(`SELECT COUNT(*)::int AS n FROM enquiries${where}`, params.slice(0, -2)),
            query(
              `SELECT UPPER(status) AS status, COUNT(*)::int AS n FROM enquiries GROUP BY UPPER(status)`,
            ),
          ]);

          const statusCounts: Record<string, number> = {};
          for (const r of statusRes.rows) statusCounts[r.status] = r.n;

          return new Response(
            JSON.stringify({
              success: true,
              enquiries: dataRes.rows,
              count: countRes.rows[0]?.n ?? dataRes.rows.length,
              statusCounts,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("GET /api/enquiries error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to fetch enquiries" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            name,
            phone,
            whatsapp,
            email,
            service,
            pickup,
            destination,
            date,
            return_date,
            time,
            passengers,
            trip_type,
            car_type,
            number_of_days,
            company_name,
            gst_number,
            airport_name,
            flight_number,
            hours_package,
            tour_name,
            train_class,
            train_preference,
            bus_operator,
            bus_type,
            passengers_detail,
            notes,
            package_slug,
            vehicle_slug,
            client_token,
            booking_type,
          } = body;

          if (!name || !phone || !service) {
            return new Response(
              JSON.stringify({ success: false, error: "Name, phone, and service are required." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // ---- Idempotency: repeated submissions return the original enquiry ----
          const token =
            typeof client_token === "string" && client_token.trim()
              ? client_token.trim().slice(0, 80)
              : null;
          if (token) {
            const existing = await query(
              `SELECT * FROM enquiries WHERE idempotency_key = $1 LIMIT 1`,
              [token],
            ).catch(() => null);
            if (existing && existing.rows.length > 0) {
              return new Response(
                JSON.stringify({ success: true, enquiry: existing.rows[0], duplicate: true }),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }
          }

          const enquiryNumber = await generateEnquiryNumber();
          const category = normalizeCategory(serviceToCategory(service));

          // Build a structured notes summary containing all extra customer-facing fields
          const detailsList: string[] = [];
          if (email) detailsList.push(`Email: ${email}`);
          if (trip_type) detailsList.push(`Trip Type: ${trip_type}`);
          if (return_date) detailsList.push(`Return Date: ${return_date}`);
          if (time) detailsList.push(`Time: ${time}`);
          if (car_type) detailsList.push(`Vehicle Type: ${car_type}`);
          if (number_of_days) detailsList.push(`Duration: ${number_of_days} Days`);
          if (company_name) detailsList.push(`Company: ${company_name}`);
          if (gst_number) detailsList.push(`GST: ${gst_number}`);
          if (airport_name) detailsList.push(`Airport: ${airport_name}`);
          if (flight_number) detailsList.push(`Flight No: ${flight_number}`);
          if (hours_package) detailsList.push(`Package: ${hours_package}`);
          if (tour_name) detailsList.push(`Tour: ${tour_name}`);
          if (train_class) detailsList.push(`Train Class: ${train_class}`);
          if (train_preference) detailsList.push(`Train Preference: ${train_preference}`);
          if (bus_operator) detailsList.push(`Bus Operator: ${bus_operator}`);
          if (bus_type) detailsList.push(`Bus Type: ${bus_type}`);
          if (Array.isArray(passengers_detail) && passengers_detail.length > 0) {
            const pStr = passengers_detail
              .map(
                (p: any, i: number) =>
                  `P${i + 1}: ${p.name || ""} (${p.age || ""}/${p.gender || ""})`,
              )
              .join("; ");
            detailsList.push(`Passenger Details: ${pStr}`);
          }
          if (notes) detailsList.push(`Notes: ${notes}`);

          const combinedNotes = detailsList.join(" | ");

          const res = await query(
            `INSERT INTO enquiries (
               name, phone, service, pickup, destination, travel_date, passengers, notes, status,
               package_slug, vehicle_slug,
               enquiry_number, category, email, whatsapp, return_date, pickup_time, trip_type,
               vehicle_name, passenger_count, source, idempotency_key
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'NEW', $9, $10,
                     $11, $12, $13, $14, $15, $16, $17,
                     $18, $19, 'WEBSITE', $20)
             RETURNING *`,
            [
              name,
              phone,
              service,
              pickup || null,
              destination || null,
              date || null,
              passengers ? String(passengers) : null,
              combinedNotes || null,
              package_slug || null,
              vehicle_slug || null,
              enquiryNumber,
              category,
              email || null,
              whatsapp || phone || null,
              return_date || body.return_date || null,
              time || null,
              trip_type || null,
              car_type || vehicle_slug || null,
              passengers ? parseInt(String(passengers), 10) || null : null,
              token,
            ],
          );

          const enquiry = res.rows[0];

          await logActivity({
            enquiry_id: enquiry.id,
            action: "ENQUIRY CREATED",
            entity: "enquiry",
            entity_ref: enquiryNumber,
            new_value: "NEW",
            details: `${service} — ${pickup || "?"} → ${destination || "?"}`,
            actor: "Website",
          });

          // ---- Create Auto-Booking ----
          const bType = booking_type || bookingTypeFromCategory(category);
          const bCategory = booking_type ? categoryFromBookingType(booking_type) : category;
          const bookingRef = await generateBookingReference();
          const bookingNum = await generateBookingNumber();
          const ticketNum = body.ticket_number || generateTicketNumber();
          const pnrNum = body.pnr_number || (combinedNotes.match(/PNR:\s*([A-Z0-9-]+)/i)?.[1]) || generatePNR();
          const bId = generateBookingId();
          const bookingStatus = bType === 'TAXI' ? 'PENDING CONFIRMATION' : 'BOOKING REQUESTED';

          // Extract fare amount from body or notes
          let fareVal = Number(body.total_amount || body.fare || body.amount || 0);
          if (!fareVal && combinedNotes) {
            const m = combinedNotes.match(/(?:Total Fare|Fare|Amount|Price):\s*₹?(\d+(?:\.\d+)?)/i);
            if (m && m[1]) fareVal = Number(m[1]);
          }

          // Handle Token Advance or Full Payment (Manual or Automatic)
          let advancePaid = Number(body.advance_amount ?? 0);
          if (advancePaid <= 0 && combinedNotes) {
            if (
              combinedNotes.includes("100% Full Payment") ||
              combinedNotes.includes("Full Payment") ||
              combinedNotes.includes("ZERO DUE")
            ) {
              advancePaid = fareVal;
            } else if (combinedNotes.includes("₹100 Advance")) {
              advancePaid = 100;
            }
          }

          const isFullySettled =
            (fareVal > 0 && advancePaid >= fareVal) ||
            body.payment_status === "Fully Paid" ||
            body.payment_status === "Paid";
          const isAdvanceReceived = !isFullySettled && advancePaid > 0;

          const initialPaymentStatus = isFullySettled
            ? "Fully Paid"
            : isAdvanceReceived
            ? "Advance Paid"
            : "Pending";
          const initialBookingStatus = isFullySettled
            ? "CONFIRMED"
            : isAdvanceReceived
            ? "ADVANCE RECEIVED"
            : bType === "TAXI"
            ? "PENDING CONFIRMATION"
            : "BOOKING REQUESTED";

          const finalReturnDate = return_date || body.return_date || null;
          const isRoundTrip = String(trip_type || "").toUpperCase().includes("ROUND");
          const distKm = Number(body.distance_km) || (bCategory === "CAR" ? (isRoundTrip ? 300 : 150) : null);
          const rateKm = Number(body.rate_per_km) || (bCategory === "CAR" ? 14 : null);
          const minKm = Number(body.min_km) || (bCategory === "CAR" ? (isRoundTrip ? 250 : 145) : null);
          const driverAllowance = Number(body.driver_allowance) || (bCategory === "CAR" ? 350 : 0);
          const gstAmt = Number(body.gst_amount) || (fareVal > 0 ? Math.round(fareVal * 0.05) : 0);
          const baseAmt = Number(body.base_amount) || Math.max(0, fareVal - driverAllowance - gstAmt);

          const bookingRes = await query(
            `INSERT INTO bookings (
              booking_id, booking_reference, booking_number, ticket_number, pnr_number,
              booking_type, category, booking_status, payment_status, booking_source,
              enquiry_id, enquiry_number, total_amount, advance_amount,
              passenger_name, passenger_phone, customer_email, customer_whatsapp,
              departure_datetime, return_date, pickup_time, number_of_members, 
              from_location, to_location, trip_type, vehicle_type, notes,
              distance_km, rate_per_km, min_km, base_amount, driver_allowance, gst_amount
            ) VALUES (
              $1, $2, $3, $4, $5, 
              $6, $7, $8, $9, $10, 
              $11, $12, $13, $14,
              $15, $16, $17, $18,
              $19, $20, $21, $22, 
              $23, $24, $25, $26, $27,
              $28, $29, $30, $31, $32, $33
            ) RETURNING *`,
            [
              bId, bookingRef, bookingNum, ticketNum, pnrNum,
              bType, bCategory, initialBookingStatus, initialPaymentStatus, String(body.booking_source || "WEBSITE").toUpperCase(),
              enquiry.id, enquiryNumber, fareVal, isFullySettled ? fareVal : advancePaid,
              name, phone, email || null, whatsapp || phone || null,
              date || null, finalReturnDate, time || null, passengers ? parseInt(String(passengers), 10) || null : null,
              pickup || null, destination || null, trip_type || null, car_type || vehicle_slug || null, combinedNotes || null,
              distKm, rateKm, minKm, baseAmt, driverAllowance, gstAmt
            ]
          );

          const booking = bookingRes.rows[0];

          if (isFullySettled || isAdvanceReceived) {
            const paidAmt = isFullySettled ? fareVal : advancePaid;
            const payId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            const payMethod = String(body.payment_method || "UPI").toUpperCase();
            const payRef = body.payment_ref || body.transaction_id || `PAY-${Date.now().toString().slice(-6)}`;
            const payNotes = isFullySettled ? "100% Full Payment Settled" : `Token Advance ₹${paidAmt} Payment`;

            await query(
              `INSERT INTO booking_payments (
                booking_id, payment_id, amount, payment_method, payment_status, reference_number, notes, paid_at
              ) VALUES ($1, $2, $3, $4, 'Success', $5, $6, NOW())`,
              [booking.id, payId, paidAmt, payMethod, payRef, payNotes]
            );

            await query(
              `UPDATE bookings SET
                advance_amount = $2,
                amount_paid = $2,
                payment_status = $3,
                booking_status = $4,
                updated_at = NOW()
              WHERE id = $1`,
              [booking.id, paidAmt, isFullySettled ? "Fully Paid" : "Advance Paid", isFullySettled ? "CONFIRMED" : "ADVANCE RECEIVED"]
            );

            await logActivity({
              booking_id: booking.id,
              action: isFullySettled ? "FULL PAYMENT RECORDED" : "ADVANCE PAYMENT RECORDED",
              entity: "booking",
              entity_ref: bookingNum,
              new_value: `₹${paidAmt}`,
              details: `${isFullySettled ? "Full payment" : "Token advance payment"} of ₹${paidAmt} received via ${payMethod} (Ref: ${payRef})`,
              actor: body.booking_source === "ADMIN" ? "Admin Desk" : "Customer (Online)",
            });
          }

          await query(`UPDATE enquiries SET converted_booking_id = $1 WHERE id = $2`, [booking.id, enquiry.id]);

          await logActivity({
            booking_id: booking.id,
            action: `Customer submitted ${bType} enquiry`,
            entity: "booking",
            entity_ref: bookingNum,
            details: `Enquiry ${enquiryNumber} converted to booking${advancePaid > 0 ? ` with ₹${advancePaid} paid` : ''}`,
            actor: "Website",
          });
          // ---- End Create Auto-Booking ----

          // Sync into corresponding Business Record tables (Day Book, Cab Bookings, Package Trips, etc.) asynchronously
          syncToBusinessRecords(body, combinedNotes).catch((err) =>
            console.error("Background sync error:", err),
          );

          return new Response(JSON.stringify({ 
            success: true, 
            enquiry, 
            booking_reference: bookingRef,
            advance_paid: advancePaid,
            booking_id: booking.id
          }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("POST /api/enquiries error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to create enquiry" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
      PATCH: async ({ request }) => {
        try {
          if (!isAdminAuthorized(request)) return unauthorizedResponse();

          const body = await request.json();
          const { id, status, admin_notes } = body;

          if (!id || (!status && admin_notes === undefined)) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "ID and at least one of status/admin_notes are required.",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const currentRes = await query(`SELECT * FROM enquiries WHERE id = $1`, [id]);
          if (currentRes.rows.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "Enquiry not found." }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }
          const current = currentRes.rows[0];

          const sets: string[] = [];
          const params: unknown[] = [];

          if (status) {
            params.push(String(status).toUpperCase());
            sets.push(`status = $${params.length}`);
          }
          if (admin_notes !== undefined) {
            params.push(admin_notes === null ? null : String(admin_notes));
            sets.push(`admin_notes = $${params.length}`);
          }
          sets.push("updated_at = NOW()");
          params.push(id);

          const res = await query(
            `UPDATE enquiries SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
            params,
          );

          if (status && String(status).toUpperCase() !== String(current.status).toUpperCase()) {
            await logActivity({
              enquiry_id: id,
              action: "ENQUIRY STATUS CHANGED",
              entity: "enquiry",
              entity_ref: current.enquiry_number,
              old_value: current.status,
              new_value: String(status).toUpperCase(),
            });
          }
          if (admin_notes !== undefined && admin_notes !== current.admin_notes) {
            await logActivity({
              enquiry_id: id,
              action: "ENQUIRY NOTES UPDATED",
              entity: "enquiry",
              entity_ref: current.enquiry_number,
              details: String(admin_notes ?? ""),
            });
          }

          return new Response(JSON.stringify({ success: true, enquiry: res.rows[0] }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("PATCH /api/enquiries error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to update status" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
      DELETE: async ({ request }) => {
        try {
          if (!isAdminAuthorized(request)) return unauthorizedResponse();

          const url = new URL(request.url);
          const id = url.searchParams.get("id");

          if (!id) {
            return new Response(JSON.stringify({ success: false, error: "ID is required." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const current = await query(`SELECT enquiry_number FROM enquiries WHERE id = $1`, [id]);
          await query(`DELETE FROM enquiries WHERE id = $1`, [id]);
          if (current.rows[0]) {
            await logActivity({
              enquiry_id: Number(id),
              action: "ENQUIRY DELETED",
              entity: "enquiry",
              entity_ref: current.rows[0].enquiry_number,
            });
          }
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("DELETE /api/enquiries error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to delete enquiry" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});

async function syncToBusinessRecords(payload: any, combinedNotes: string) {
  const {
    name,
    phone,
    email,
    service,
    pickup,
    destination,
    date,
    return_date,
    time,
    passengers,
    car_type,
    number_of_days,
    company_name,
    airport_name,
    flight_number,
    hours_package,
    tour_name,
    train_class,
    train_preference,
    bus_operator,
    bus_type,
  } = payload;

  const todayStr = new Date().toISOString().split("T")[0];
  const travelDate = date || todayStr;
  const sUpper = String(service || "").toUpperCase();

  // 1. Ensure customer exists in customers table
  try {
    const existing = await query("SELECT id FROM customers WHERE phone = $1 LIMIT 1", [
      phone,
    ]).catch(() => null);
    if (!existing || existing.rows.length === 0) {
      const custCode = `CUST-${phone.replace(/\D/g, "").slice(-4) || "001"}`;
      await query(
        `INSERT INTO customers (customer_code, name, phone, email, notes)
         VALUES ($1, $2, $3, $4, 'Registered from website enquiry')`,
        [custCode, name, phone, email || null],
      ).catch(() => {});
    }
  } catch (e) {}

  // 2. Always create a Day Book Entry
  try {
    const serialNo = `DB-${Date.now().toString().slice(-6)}`;
    const pnrVal = payload.pnr_number || (combinedNotes.match(/PNR:\s*([A-Z0-9-]+)/i)?.[1]) || null;
    let fareVal = Number(payload.total_amount || payload.fare || payload.amount || 0);
    if (!fareVal && combinedNotes) {
      const m = combinedNotes.match(/(?:Total Fare|Fare|Amount|Price):\s*₹?(\d+(?:\.\d+)?)/i);
      if (m && m[1]) fareVal = Number(m[1]);
    }
    let advanceVal = Number(payload.advance_amount ?? 0);
    if (advanceVal <= 0 && combinedNotes) {
      if (
        combinedNotes.includes("100% Full Payment") ||
        combinedNotes.includes("Full Payment") ||
        combinedNotes.includes("ZERO DUE")
      ) {
        advanceVal = fareVal;
      } else if (combinedNotes.includes("₹100 Advance")) {
        advanceVal = 100;
      }
    }
    const isFullSettled =
      (fareVal > 0 && advanceVal >= fareVal) ||
      payload.payment_status === "Fully Paid" ||
      payload.payment_status === "Paid";
    const dueVal = isFullSettled ? 0 : Math.max(0, fareVal - advanceVal);
    const dayBookStatus = isFullSettled ? "Paid" : advanceVal > 0 ? "Advance Paid" : "Pending";
    const officeAdvanceVal = isFullSettled ? fareVal : advanceVal;

    // Detect hourly package for Trav By
    const isHourlyBooking =
      sUpper.includes("HOURLY") ||
      sUpper.includes("LOCAL") ||
      String(payload.trip_type || "").toUpperCase().includes("HOURLY") ||
      Boolean(payload.hours_package);
    const hrsVal = payload.hours_package
      ? String(payload.hours_package)
      : combinedNotes.match(/(\d+)\s*(?:hrs?|hr's)/i)?.[1] || "8";
    const travelByDisplay = isHourlyBooking
      ? `HOURLY (${hrsVal} HRS)`
      : car_type || service || "Cab";

    await query(
      `INSERT INTO day_book_entries (
        serial_number, booking_date, travel_date, travel_by, 
        passenger_name, passenger_phone, from_location, to_location, 
        booking_amount, office_advance, due_amount, total_amount,
        status, notes, pnr
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        serialNo,
        todayStr,
        travelDate,
        travelByDisplay,
        name,
        phone,
        pickup || "Bengaluru",
        destination || "Outstation",
        fareVal,
        officeAdvanceVal,
        dueVal,
        fareVal,
        dayBookStatus,
        combinedNotes,
        pnrVal,
      ],
    ).catch(async () => {
      await query(
        `INSERT INTO day_book_entries (
          serial_number, booking_date, travel_date, travel_by, 
          passenger_name, passenger_phone, from_location, to_location, 
          booking_amount, office_advance, due_amount,
          status, notes, pnr
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          serialNo,
          todayStr,
          travelDate,
          travelByDisplay,
          name,
          phone,
          pickup || "Bengaluru",
          destination || "Outstation",
          fareVal,
          officeAdvanceVal,
          dueVal,
          dayBookStatus,
          combinedNotes,
          pnrVal,
        ],
      ).catch(async () => {
        await query(
          `INSERT INTO day_book_entries (serial_number, booking_date, travel_date, travel_by, passenger_name, passenger_phone, from_location, to_location, status, notes, pnr)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            serialNo,
            todayStr,
            travelDate,
            travelByDisplay,
            name,
            phone,
            pickup || "Bengaluru",
            destination || "Outstation",
            dayBookStatus,
            combinedNotes,
            pnrVal,
          ],
        ).catch(() => {});
      });
    });
  } catch (e) {}

  // 3. Create record in specific service section table
  try {
    const isFullSettled =
      (fareVal > 0 && advanceVal >= fareVal) ||
      payload.payment_status === "Fully Paid" ||
      payload.payment_status === "Paid";
    const dueVal = isFullSettled ? 0 : Math.max(0, fareVal - advanceVal);

    if (sUpper.includes("PACKAGE") || sUpper.includes("TOUR")) {
      const tripNo = `PKG-${Date.now().toString().slice(-6)}`;
      await query(
        `INSERT INTO package_trips (trip_number, tour_name, journey_date, return_date, passenger_name, passenger_phone, pickup_location, drop_location, car_type, due_amount, paid_amount, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          tripNo,
          tour_name || service,
          travelDate,
          return_date || null,
          name,
          phone,
          pickup || "Bengaluru",
          destination || "Tour Destination",
          car_type || "SUV",
          dueVal,
          isFullSettled ? fareVal : advanceVal,
          combinedNotes,
        ],
      ).catch(() => {});
    } else if (
      sUpper.includes("HOURLY") ||
      sUpper.includes("LOCAL") ||
      String(payload.trip_type || "").toUpperCase().includes("HOURLY") ||
      Boolean(payload.hours_package)
    ) {
      const bkNo = `HR-${Date.now().toString().slice(-6)}`;
      const hrs = payload.hours_package
        ? parseInt(String(payload.hours_package)) || 8
        : (combinedNotes.match(/(\d+)\s*(?:hrs?|hr's)/i)?.[1] ? parseInt(RegExp.$1) : 8);
      await query(
        `INSERT INTO hourly_bookings (booking_number, booking_date, travel_date, passenger_name, phone, from_location, to_location, hours, amount, payment_status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          bkNo,
          todayStr,
          travelDate,
          name,
          phone,
          pickup || "Bengaluru",
          destination || (payload.trip_type || "Local Hourly Package"),
          hrs,
          fareVal,
          isFullSettled ? "Paid" : advanceVal > 0 ? "Advance Paid" : "Pending",
          combinedNotes,
        ],
      ).catch(() => {});
    } else if (sUpper.includes("BUS")) {
      const bkNo = `BUS-${Date.now().toString().slice(-6)}`;
      await query(
        `INSERT INTO bus_bookings (booking_number, booking_date, travel_date, from_location, to_location, travels, passenger_name, passenger_phone, payment_status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          bkNo,
          todayStr,
          travelDate,
          pickup || "Bengaluru",
          destination || "Destination City",
          bus_operator || "KSRTC / Private Operator",
          name,
          phone,
          isFullSettled ? "Paid" : advanceVal > 0 ? "Advance Paid" : "Pending",
          combinedNotes,
        ],
      ).catch(() => {});
    } else if (sUpper.includes("TRAIN")) {
      const bkNo = `TRN-${Date.now().toString().slice(-6)}`;
      await query(
        `INSERT INTO train_bookings (booking_number, booking_date, travel_date, from_location, to_location, class, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          bkNo,
          todayStr,
          travelDate,
          pickup || "Bengaluru",
          destination || "Destination Station",
          train_class || "3AC",
          `Passenger: ${name} (${phone}) | Preference: ${train_preference || "None"} | ${combinedNotes}`,
        ],
      ).catch(() => {});
    } else if (sUpper.includes("FLIGHT")) {
      const bkNo = `FLT-${Date.now().toString().slice(-6)}`;
      const paxCount = passengers ? parseInt(String(passengers)) || 1 : 1;
      const pnrVal = payload.pnr_number || (combinedNotes.match(/PNR:\s*([A-Z0-9-]+)/i)?.[1]) || null;
      await query(
        `INSERT INTO flight_bookings (booking_number, booking_date, travel_date, from_location, to_location, phone, pax, notes, pnr)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          bkNo,
          todayStr,
          travelDate,
          pickup || "Bengaluru",
          destination || "Destination City",
          phone,
          paxCount,
          `Passenger: ${name} | ${combinedNotes}`,
          pnrVal,
        ],
      ).catch(async () => {
        await query(
          `INSERT INTO flight_bookings (booking_number, booking_date, travel_date, from_location, to_location, phone, pax, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            bkNo,
            todayStr,
            travelDate,
            pickup || "Bengaluru",
            destination || "Destination City",
            phone,
            paxCount,
            `Passenger: ${name} | ${combinedNotes}`,
          ],
        ).catch(() => {});
      });
    } else {
      // Default: Outstation / Cab / Corporate / Airport -> Insert into cab_bookings
      const bkNo = `CAB-${Date.now().toString().slice(-6)}`;
      await query(
        `INSERT INTO cab_bookings (booking_number, booking_date, travel_date, from_location, to_location, pickup_time, passenger_name, passenger_phone, vehicle_type, due_amount, payment_status, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          bkNo,
          todayStr,
          travelDate,
          pickup || "Bengaluru",
          destination || "Outstation",
          time || null,
          company_name ? `${name} (${company_name})` : name,
          phone,
          car_type || "Sedan",
          dueVal,
          isFullSettled ? "Paid" : advanceVal > 0 ? "Advance Paid" : "Pending",
          isFullSettled ? "Confirmed" : "Pending",
          combinedNotes,
        ],
      ).catch(() => {});
    }
  } catch (e) {
    console.error("Error syncing to business records:", e);
  }
}
