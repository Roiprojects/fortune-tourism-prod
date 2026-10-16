import { createFileRoute } from "@tanstack/react-router";
import { query } from "@/lib/db";
import { generateTicketNumber, generatePNR, generateBookingId } from "@/lib/booking-utils";
import {
  generateBookingNumber,
  normalizeCategory,
  recalcBooking,
  logActivity,
  toMoney,
  updateBookingFromPayload,
} from "@/lib/booking-server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";

/* Computed money columns are ALWAYS derived from payment transactions */
const MONEY_SELECT = `
  SELECT b.*,
    COALESCE(p.paid_total, 0)::numeric AS paid_total,
    COALESCE(r.refunded_total, 0)::numeric AS refunded_total,
    GREATEST(COALESCE(b.total_amount, 0) - (COALESCE(p.paid_total, 0) - COALESCE(r.refunded_total, 0)), 0)::numeric AS remaining_amount
  FROM bookings b
  LEFT JOIN (
    SELECT booking_id, SUM(amount) AS paid_total FROM booking_payments
    WHERE payment_status = 'Success' AND NOT COALESCE(is_deleted, false)
    GROUP BY booking_id
  ) p ON p.booking_id = b.id
  LEFT JOIN (
    SELECT booking_id, SUM(amount) AS refunded_total FROM refunds GROUP BY booking_id
  ) r ON r.booking_id = b.id
`;

export const Route = createFileRoute("/api/bookings/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const limit = Math.min(Number(url.searchParams.get("limit")) || 500, 2000);
          const offset = Number(url.searchParams.get("offset")) || 0;
          const q = url.searchParams.get("q")?.trim();
          const paymentStatus = url.searchParams.get("paymentStatus")?.trim();
          const bookingStatus = url.searchParams.get("bookingStatus")?.trim();
          const tourType = url.searchParams.get("tourType")?.trim();
          const category = url.searchParams.get("category")?.trim();
          const source = url.searchParams.get("source")?.trim();
          const outstanding = url.searchParams.get("outstanding");
          const upcomingFrom = url.searchParams.get("upcomingFrom")?.trim();
          const upcomingTo = url.searchParams.get("upcomingTo")?.trim();
          const startDate = url.searchParams.get("startDate")?.trim();
          const endDate = url.searchParams.get("endDate")?.trim();
          const sortBy = url.searchParams.get("sortBy")?.trim();

          const conditions: string[] = [];
          const params: unknown[] = [];
          const cond = () => `$${params.length}`;

          if (q) {
            params.push(`%${q}%`);
            const p = cond();
            conditions.push(
              `(b.passenger_name ILIKE ${p} OR b.passenger_phone ILIKE ${p} OR b.ticket_number ILIKE ${p} OR b.pnr_number ILIKE ${p} OR b.driver_name ILIKE ${p} OR b.taxi_number ILIKE ${p} OR COALESCE(b.booking_number,'') ILIKE ${p} OR COALESCE(b.enquiry_number,'') ILIKE ${p} OR COALESCE(b.customer_email,'') ILIKE ${p} OR COALESCE(b.airline,'') ILIKE ${p} OR COALESCE(b.flight_number,'') ILIKE ${p} OR COALESCE(b.train_number,'') ILIKE ${p} OR COALESCE(b.train_name,'') ILIKE ${p} OR COALESCE(b.bus_number,'') ILIKE ${p})`,
            );
          }
          if (paymentStatus) {
            params.push(paymentStatus);
            conditions.push(`b.payment_status = ${cond()}`);
          }
          if (bookingStatus) {
            params.push(bookingStatus);
            conditions.push(`(UPPER(b.booking_status) = UPPER(${cond()}))`);
          }
          if (tourType) {
            params.push(tourType);
            conditions.push(`b.tour_type = ${cond()}`);
          }
          if (category) {
            params.push(normalizeCategory(category));
            conditions.push(`b.category = ${cond()}`);
          }
          if (source) {
            params.push(source.toUpperCase());
            conditions.push(`UPPER(b.booking_source) = ${cond()}`);
          }
          if (outstanding === "1") {
            conditions.push(
              `(COALESCE(b.total_amount,0) - (COALESCE(p.paid_total,0) - COALESCE(r.refunded_total,0))) > 0 AND UPPER(b.booking_status) NOT IN ('CANCELLED','REFUNDED')`,
            );
          }
          if (upcomingFrom) {
            params.push(upcomingFrom);
            conditions.push(`b.departure_datetime::date >= ${cond()}::date`);
          }
          if (upcomingTo) {
            params.push(upcomingTo);
            conditions.push(`b.departure_datetime::date <= ${cond()}::date`);
          }
          if (startDate) {
            params.push(startDate);
            conditions.push(`b.departure_datetime::date >= ${cond()}::date`);
          }
          if (endDate) {
            params.push(endDate);
            conditions.push(`b.departure_datetime::date <= ${cond()}::date`);
          }

          const whereClause =
            conditions.length > 0 ? ` WHERE ${conditions.map((c) => `(${c})`).join(" AND ")}` : "";

          const orderMap: Record<string, string> = {
            travel_date_asc: "b.departure_datetime ASC NULLS LAST",
            travel_date_desc: "b.departure_datetime DESC NULLS LAST",
            remaining_desc: "remaining_amount DESC",
            customer: "b.passenger_name ASC",
          };
          const orderBy = orderMap[sortBy || ""] || "b.created_at DESC";

          const countSql = `SELECT COUNT(*)::int AS n FROM (${MONEY_SELECT}${whereClause}) t`;
          const dataSql = `${MONEY_SELECT}${whereClause} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`;

          const [dataRes, countRes] = await Promise.all([
            query(dataSql, params),
            query(countSql, params),
          ]);

          return new Response(
            JSON.stringify({
              success: true,
              bookings: dataRes.rows,
              count: countRes.rows[0]?.n ?? dataRes.rows.length,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("GET /api/bookings error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to fetch bookings" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },

      POST: async ({ request }) => {
        try {
          if (!isAdminAuthorized(request)) return unauthorizedResponse();

          const body = await request.json();
          const {
            enquiry_id,
            category,
            booking_source,
            booking_status,
            passenger_name,
            passenger_phone,
            customer_email,
            customer_whatsapp,
            customer_address,
            company_name,
            gst_number,
            number_of_members,
            package_name,
            tour_type,
            trip_type,
            from_location,
            to_location,
            boarding_point,
            departure_datetime,
            return_date,
            pickup_time,
            number_of_days,
            driver_name,
            driver_phone,
            taxi_number,
            vehicle_type,
            distance_km,
            rate_per_km,
            min_km,
            base_amount,
            driver_allowance,
            toll_amount,
            parking_amount,
            permit_amount,
            state_tax_amount,
            service_charge,
            additional_charges,
            discount_amount,
            tax_amount,
            gst_amount,
            // bus
            bus_type,
            bus_number,
            bus_operator,
            seating_capacity,
            // train
            train_name,
            train_number,
            travel_class,
            departure_time,
            arrival_date,
            arrival_time,
            ticket_status,
            ticket_amount,
            // flight
            airline,
            flight_number,
            cabin_class,
            baggage,
            special_instructions,
            notes,
            passengers,
            advance_payment,
          } = body;

          if (!passenger_name || !passenger_phone) {
            return new Response(
              JSON.stringify({ success: false, error: "Passenger name and phone are required." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          /* ---- Link & load enquiry (if converting) ---- */
          let linkedEnquiry: any = null;
          if (enquiry_id) {
            const e = await query(`SELECT * FROM enquiries WHERE id = $1`, [enquiry_id]);
            if (e.rows.length > 0) linkedEnquiry = e.rows[0];
          }

          const finalCategory = normalizeCategory(category || linkedEnquiry?.category);

          /* ---- Server-side total calculation (#47) ----
             TOTAL = base + driver_allowance + toll + parking + permit + state_tax
                     + service_charge + additional_charges + tax + gst - discount
             If no component fields were supplied at all, fall back to a
             directly supplied total_amount (legacy callers / simple entries). */
          const m = (v: unknown) => toMoney(v) ?? 0;
          const hasComponents = [
            driver_allowance,
            toll_amount,
            parking_amount,
            permit_amount,
            state_tax_amount,
            service_charge,
            additional_charges,
            discount_amount,
            tax_amount,
            gst_amount,
          ].some((v) => Number(v) > 0) || Number(base_amount) > 0;

          const explicitTotal = m(body.total_amount) || m(body.ticket_amount) || m(body.fare) || m(body.amount);
          let total: number;
          if (explicitTotal > 0) {
            total = explicitTotal;
          } else if (hasComponents) {
            total =
              m(base_amount) +
              m(driver_allowance) +
              m(toll_amount) +
              m(parking_amount) +
              m(permit_amount) +
              m(state_tax_amount) +
              m(service_charge) +
              m(additional_charges) +
              m(tax_amount) +
              m(gst_amount) -
              m(discount_amount);
          } else {
            total = m(body.total_amount) || m(body.ticket_amount) || m(body.fare) || m(body.amount) || 0;
          }
          if (total <= 0) {
            total = m(body.ticket_amount) || m(body.total_amount) || m(body.fare) || m(body.amount) || m(base_amount) || 0;
          }
          let effectiveBaseAmount = base_amount;
          if (total > 0 && (!effectiveBaseAmount || Number(effectiveBaseAmount) === 0)) {
            effectiveBaseAmount = total;
          }
          if (!Number.isFinite(total) || total < 0) {
            return new Response(
              JSON.stringify({ success: false, error: "Invalid booking amount." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }
          total = Math.round(total * 100) / 100;

          /* ---- Legacy identifiers kept for compatibility ---- */
          let ticketNumber = body.ticket_number || generateTicketNumber();
          let pnrNumber = body.pnr_number || generatePNR();
          let bookingIdLegacy = body.booking_id || generateBookingId();

          const bookingNumber = await generateBookingNumber();

          const res = await query(
            `INSERT INTO bookings (
               ticket_number, pnr_number, booking_id, booking_number,
               enquiry_id, enquiry_number, category, booking_source, booking_status,
               passenger_name, passenger_phone, number_of_members,
               customer_email, customer_whatsapp, customer_address, company_name, gst_number,
               package_name, tour_type, trip_type, from_location, to_location, boarding_point,
               departure_datetime, return_date, pickup_time, number_of_days,
               driver_name, driver_phone, taxi_number, vehicle_type,
               distance_km, rate_per_km, min_km,
               base_amount, driver_allowance, toll_amount, parking_amount, permit_amount,
               state_tax_amount, service_charge, additional_charges, discount_amount,
               tax_amount, gst_amount, total_amount,
               bus_type, bus_number, bus_operator, seating_capacity,
               train_name, train_number, travel_class, departure_time, arrival_date, arrival_time,
               ticket_status, ticket_amount,
               airline, flight_number, cabin_class, baggage,
               special_instructions, notes
             ) VALUES (
               $1,$2,$3,$4,
               $5,$6,$7,$8,$9,
               $10,$11,$12,
               $13,$14,$15,$16,$17,
               $18,$19,$20,$21,$22,$23,
               $24,$25,$26,$27,
               $28,$29,$30,$31,
               $32,$33,$34,
               $35,$36,$37,$38,$39,
               $40,$41,$42,$43,
               $44,$45,$46,
               $47,$48,$49,$50,
               $51,$52,$53,$54,$55,$56,
               $57,$58,
               $59,$60,$61,$62,
               $63,$64
             )
             RETURNING *`,
            [
              ticketNumber,
              pnrNumber,
              bookingIdLegacy,
              bookingNumber,
              linkedEnquiry?.id ?? null,
              linkedEnquiry?.enquiry_number ?? null,
              finalCategory,
              String(booking_source || (linkedEnquiry ? "WEBSITE" : "ADMIN")).toUpperCase(),
              String(booking_status || "PENDING CONFIRMATION").toUpperCase(),
              passenger_name,
              passenger_phone,
              Math.max(1, Number(number_of_members) || 1),
              customer_email || linkedEnquiry?.email || null,
              customer_whatsapp || linkedEnquiry?.whatsapp || null,
              customer_address || null,
              company_name || linkedEnquiry?.notes?.match(/Company: ([^|]+)/)?.[1]?.trim() || null,
              gst_number || null,
              package_name || linkedEnquiry?.service || null,
              tour_type || null,
              trip_type || linkedEnquiry?.trip_type || null,
              from_location || linkedEnquiry?.pickup || null,
              to_location || linkedEnquiry?.destination || null,
              boarding_point || linkedEnquiry?.pickup || null,
              departure_datetime || (linkedEnquiry?.travel_date ? linkedEnquiry.travel_date : null),
              return_date || linkedEnquiry?.return_date || null,
              pickup_time || linkedEnquiry?.pickup_time || null,
              Number(number_of_days) || null,
              driver_name || null,
              driver_phone || null,
              taxi_number || null,
              vehicle_type || linkedEnquiry?.vehicle_name || null,
              toMoney(distance_km),
              toMoney(rate_per_km),
              min_km ? Number(min_km) : null,
              toMoney(effectiveBaseAmount),
              toMoney(driver_allowance),
              toMoney(toll_amount),
              toMoney(parking_amount),
              toMoney(permit_amount),
              toMoney(state_tax_amount),
              toMoney(service_charge),
              toMoney(additional_charges),
              toMoney(discount_amount),
              toMoney(tax_amount),
              toMoney(gst_amount),
              total,
              bus_type || null,
              bus_number || null,
              bus_operator || null,
              seating_capacity ? Number(seating_capacity) : null,
              train_name || null,
              train_number || null,
              travel_class || null,
              departure_time || pickup_time || null,
              arrival_date || null,
              arrival_time || null,
              ticket_status || null,
              toMoney(ticket_amount || total),
              airline || null,
              flight_number ||
                linkedEnquiry?.notes?.match(/Flight No: ([^|]+)/)?.[1]?.trim() ||
                null,
              cabin_class || null,
              baggage || null,
              special_instructions || null,
              notes || linkedEnquiry?.notes || null,
            ],
          );

          const booking = res.rows[0];

          /* ---- Multi-passenger records (train/flight/bus) ---- */
          if (Array.isArray(passengers) && passengers.length > 0) {
            for (const p of passengers) {
              if (!p?.name) continue;
              await query(
                `INSERT INTO booking_passengers (booking_id, name, age, gender, seat_berth, ticket_number)
                 VALUES ($1,$2,$3,$4,$5,$6)`,
                [
                  booking.id,
                  p.name,
                  p.age ? parseInt(String(p.age), 10) || null : null,
                  p.gender || null,
                  p.seat_berth || p.seat || null,
                  p.ticket_number || null,
                ],
              ).catch(() => {});
            }
          }

          /* ---- Initial advance payment (recorded as a real transaction) ---- */
          let overpayWarning: string | null = null;
          if (advance_payment && Number(advance_payment.amount) > 0) {
            const amt = toMoney(advance_payment.amount)!;
            await query(
              `INSERT INTO booking_payments
                 (booking_id, payment_id, transaction_id, amount, payment_method, payment_status, paid_at, payment_date, reference_number, notes, received_by)
               VALUES ($1,$2,$3,$4,$5,'Success',
                       COALESCE($6::timestamp, NOW()), COALESCE($6::date, CURRENT_DATE), $7, $8, $9)`,
              [
                booking.id,
                `PAY-${Date.now()}`,
                advance_payment.transaction_id || null,
                amt,
                advance_payment.payment_method || "CASH",
                advance_payment.payment_date || null,
                advance_payment.reference_number || null,
                advance_payment.notes || "Advance payment at booking creation",
                advance_payment.received_by || "Admin",
              ],
            );
            const summary = await recalcBooking(booking.id);
            Object.assign(booking, {
              amount_paid: summary.netPaid,
              balance_amount: summary.remaining,
              refunded_amount: summary.refunded,
              payment_status: summary.paymentStatus,
            });
            if (summary.overpaid > 0) {
              overpayWarning = `Payment exceeds booking amount by ₹${summary.overpaid}.`;
              await logActivity({
                booking_id: booking.id,
                action: "OVERPAYMENT WARNING",
                entity: "booking",
                entity_ref: bookingNumber,
                details: `Net paid exceeds total by ${summary.overpaid}`,
              });
            }
            await logActivity({
              booking_id: booking.id,
              action: "ADVANCE PAYMENT RECORDED",
              entity: "payment",
              entity_ref: bookingNumber,
              new_value: String(amt),
              details: `${advance_payment.payment_method || "CASH"} — ${advance_payment.transaction_id || "no txn id"}`,
            });
          } else {
            await recalcBooking(booking.id);
          }

          /* ---- Mark enquiry converted + audit trail ---- */
          if (linkedEnquiry) {
            await query(
              `UPDATE enquiries SET status = 'CONVERTED', converted_booking_id = $2, updated_at = NOW() WHERE id = $1`,
              [linkedEnquiry.id, booking.id],
            );
            await logActivity({
              enquiry_id: linkedEnquiry.id,
              action: "ENQUIRY CONVERTED TO BOOKING",
              entity: "enquiry",
              entity_ref: linkedEnquiry.enquiry_number,
              new_value: bookingNumber,
            });
            await logActivity({
              booking_id: booking.id,
              action: "BOOKING CREATED FROM ENQUIRY",
              entity: "booking",
              entity_ref: bookingNumber,
              details: `Source enquiry ${linkedEnquiry.enquiry_number}`,
              actor: "Admin",
            });
          } else {
            await logActivity({
              booking_id: booking.id,
              action: "BOOKING CREATED",
              entity: "booking",
              entity_ref: bookingNumber,
              details: `Source: ${String(booking_source || "ADMIN").toUpperCase()}`,
            });
          }

          return new Response(
            JSON.stringify({
              success: true,
              booking: {
                ...booking,
                paid_total: booking.amount_paid,
                remaining_amount: booking.balance_amount,
              },
              warning: overpayWarning,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("POST /api/bookings error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to create booking" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },

      PUT: async ({ request }) => {
        try {
          if (!isAdminAuthorized(request)) return unauthorizedResponse();
          const payload = await request.json();
          const result = await updateBookingFromPayload(payload);
          if (!result.ok) {
            return new Response(JSON.stringify({ success: false, error: result.error }), {
              status: result.status || 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ success: true, booking: result.booking }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("PUT /api/bookings error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to update booking" }),
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
          const current = await query(`SELECT booking_number FROM bookings WHERE id = $1`, [id]);
          await query("DELETE FROM bookings WHERE id = $1", [id]);
          if (current.rows[0]) {
            await logActivity({
              action: "BOOKING DELETED",
              entity: "booking",
              entity_ref: current.rows[0].booking_number,
            });
          }
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("DELETE /api/bookings error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to delete booking" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
