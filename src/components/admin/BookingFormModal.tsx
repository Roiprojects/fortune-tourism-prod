import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/booking-utils";

export interface FormBookingRow {
  id?: number;
  booking_number?: string;
  enquiry_id?: number | null;
  enquiry_number?: string;
  category?: string;
  booking_source?: string;
  booking_status?: string;
  passenger_name?: string;
  passenger_phone?: string;
  customer_email?: string;
  number_of_members?: number;
  package_name?: string;
  trip_type?: string;
  from_location?: string;
  to_location?: string;
  departure_datetime?: string;
  return_date?: string;
  pickup_time?: string;
  number_of_days?: number;
  vehicle_type?: string;
  driver_name?: string;
  driver_phone?: string;
  taxi_number?: string;
  distance_km?: number | string;
  rate_per_km?: number | string;
  min_km?: number;
  bus_operator?: string;
  bus_type?: string;
  bus_number?: string;
  seating_capacity?: number;
  train_name?: string;
  train_number?: string;
  travel_class?: string;
  ticket_status?: string;
  ticket_amount?: number | string;
  airline?: string;
  flight_number?: string;
  cabin_class?: string;
  baggage?: string;
  special_instructions?: string;
  notes?: string;
}

const FARE_FIELDS: Array<{ key: keyof FormState; label: string }> = [
  { key: "base_amount", label: "Base Fare" },
  { key: "driver_allowance", label: "Driver Allowance" },
  { key: "toll_amount", label: "Toll" },
  { key: "parking_amount", label: "Parking" },
  { key: "permit_amount", label: "Permit" },
  { key: "state_tax_amount", label: "State Tax" },
  { key: "service_charge", label: "Service Charge" },
  { key: "additional_charges", label: "Additional Charges" },
];

const FARE_KEYS = [
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
] as const;

interface FormState {
  enquiry_id: number | null;
  category: string;
  booking_source: string;
  booking_status: string;
  passenger_name: string;
  passenger_phone: string;
  customer_email: string;
  number_of_members: string;
  package_name: string;
  trip_type: string;
  from_location: string;
  to_location: string;
  departure_datetime: string;
  return_date: string;
  pickup_time: string;
  number_of_days: string;
  vehicle_type: string;
  driver_name: string;
  driver_phone: string;
  taxi_number: string;
  distance_km: string;
  rate_per_km: string;
  min_km: string;
  bus_operator: string;
  bus_type: string;
  bus_number: string;
  seating_capacity: string;
  train_name: string;
  train_number: string;
  travel_class: string;
  ticket_status: string;
  ticket_amount: string;
  airline: string;
  flight_number: string;
  cabin_class: string;
  baggage: string;
  special_instructions: string;
  notes: string;
  base_amount: string;
  driver_allowance: string;
  toll_amount: string;
  parking_amount: string;
  permit_amount: string;
  state_tax_amount: string;
  service_charge: string;
  additional_charges: string;
  discount_amount: string;
  tax_amount: string;
  gst_amount: string;
}

function emptyForm(): FormState {
  return {
    enquiry_id: null,
    category: "CAR",
    booking_source: "ADMIN",
    booking_status: "PENDING CONFIRMATION",
    passenger_name: "",
    passenger_phone: "",
    customer_email: "",
    number_of_members: "1",
    package_name: "",
    trip_type: "",
    from_location: "",
    to_location: "",
    departure_datetime: "",
    return_date: "",
    pickup_time: "",
    number_of_days: "",
    vehicle_type: "",
    driver_name: "",
    driver_phone: "",
    taxi_number: "",
    distance_km: "",
    rate_per_km: "",
    min_km: "",
    bus_operator: "",
    bus_type: "",
    bus_number: "",
    seating_capacity: "",
    train_name: "",
    train_number: "",
    travel_class: "",
    ticket_status: "",
    ticket_amount: "",
    airline: "",
    flight_number: "",
    cabin_class: "",
    baggage: "",
    special_instructions: "",
    notes: "",
    base_amount: "",
    driver_allowance: "",
    toll_amount: "",
    parking_amount: "",
    permit_amount: "",
    state_tax_amount: "",
    service_charge: "",
    additional_charges: "",
    discount_amount: "",
    tax_amount: "",
    gst_amount: "",
  };
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const key =
    typeof window !== "undefined" ? sessionStorage.getItem("fortune_admin_key") || "" : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (key) headers["x-admin-key"] = key;
  return fetch(url, { ...options, headers });
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode: "create" | "edit";
  source?: {
    booking?: FormBookingRow | null;
    enquiry?: any | null;
  };
}

export function BookingFormModal({ open, onClose, onSaved, mode, source }: Props) {
  const [form, setForm] = useState(emptyForm());
  const [passengers, setPassengers] = useState<
    Array<{ name: string; age: string; gender: string; seat_berth: string }>
  >([]);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceMethod, setAdvanceMethod] = useState("CASH");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const f = emptyForm();
    const src = source?.enquiry;
    if (src) {
      f.enquiry_id = Number(src.id);
      f.passenger_name = src.name || "";
      f.passenger_phone = src.phone || "";
      f.customer_email = src.email || "";
      f.package_name = src.service || "";
      f.from_location = src.pickup || "";
      f.to_location = src.destination || "";
      if (src.travel_date) f.departure_datetime = String(src.travel_date).slice(0, 16);
      f.return_date = src.return_date || "";
      f.pickup_time = src.pickup_time || "";
      f.trip_type = src.trip_type || "";
      f.number_of_members =
        String(src.passenger_count ?? src.passengers ?? "").match(/\d+/)?.[0] || "1";
      f.vehicle_type = src.vehicle_name || "";
      f.notes = src.notes || "";
      const cat = String(src.category || "").toUpperCase();
      if (["CAR", "BUS", "TRAIN", "FLIGHT"].includes(cat)) f.category = cat;
      else if (cat === "OTHER") f.category = "CAR";
    }
    const b = source?.booking;
    if (b) {
      f.enquiry_id = b.enquiry_id ?? null;
      f.category = b.category || "CAR";
      f.booking_source = b.booking_source || "ADMIN";
      f.booking_status = b.booking_status || "PENDING CONFIRMATION";
      f.passenger_name = b.passenger_name || "";
      f.passenger_phone = b.passenger_phone || "";
      f.customer_email = b.customer_email || "";
      f.number_of_members = String(b.number_of_members ?? 1);
      f.package_name = b.package_name || "";
      f.trip_type = b.trip_type || "";
      f.from_location = b.from_location || "";
      f.to_location = b.to_location || "";
      f.departure_datetime = b.departure_datetime ? String(b.departure_datetime).slice(0, 16) : "";
      f.return_date = b.return_date ? String(b.return_date).slice(0, 10) : "";
      f.pickup_time = b.pickup_time || "";
      f.number_of_days = b.number_of_days ? String(b.number_of_days) : "";
      f.vehicle_type = b.vehicle_type || "";
      f.driver_name = b.driver_name || "";
      f.driver_phone = b.driver_phone || "";
      f.taxi_number = b.taxi_number || "";
      f.distance_km = b.distance_km != null ? String(b.distance_km) : "";
      f.rate_per_km = b.rate_per_km != null ? String(b.rate_per_km) : "";
      f.min_km = b.min_km != null ? String(b.min_km) : "";
      f.bus_operator = b.bus_operator || "";
      f.bus_type = b.bus_type || "";
      f.bus_number = b.bus_number || "";
      f.seating_capacity = b.seating_capacity != null ? String(b.seating_capacity) : "";
      f.train_name = b.train_name || "";
      f.train_number = b.train_number || "";
      f.travel_class = b.travel_class || "";
      f.ticket_status = b.ticket_status || "";
      f.ticket_amount = b.ticket_amount != null ? String(b.ticket_amount) : "";
      f.airline = b.airline || "";
      f.flight_number = b.flight_number || "";
      f.cabin_class = b.cabin_class || "";
      f.baggage = b.baggage || "";
      f.special_instructions = b.special_instructions || "";
      f.notes = b.notes || "";
      for (const key of FARE_KEYS) {
        const v = (b as any)[key];
        if (v != null && Number(v) !== 0) f[key] = String(v);
        else if (v != null) f[key] = "0";
      }
    }
    setForm(f);
    setPassengers([]);
    setAdvanceAmount("");
    setAdvanceMethod("CASH");
  }, [open, source]);

  const set = (k: keyof FormState, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const fareTotal = useMemo(() => {
    const keys = [
      "base_amount",
      "driver_allowance",
      "toll_amount",
      "parking_amount",
      "permit_amount",
      "state_tax_amount",
      "service_charge",
      "additional_charges",
      "tax_amount",
      "gst_amount",
    ] as const;
    let t = keys.reduce((s, k) => s + (Number(form[k]) || 0), 0);
    t -= Number(form.discount_amount) || 0;
    return Math.round(t * 100) / 100;
  }, [form]);

  if (!open) return null;

  const cat = form.category;

  const submit = async () => {
    if (!form.passenger_name.trim() || !form.passenger_phone.trim()) {
      toast.error("Customer name and phone are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        category: cat,
        booking_type: cat === "CAR" ? "TAXI" : cat,
        booking_source: form.booking_source,
        booking_status: form.booking_status,
        passenger_name: form.passenger_name.trim(),
        passenger_phone: form.passenger_phone.trim(),
        customer_email: form.customer_email.trim() || null,
        number_of_members: Number(form.number_of_members) || 1,
        package_name: form.package_name || null,
        trip_type: form.trip_type || null,
        from_location: form.from_location || null,
        to_location: form.to_location || null,
        departure_datetime: form.departure_datetime || null,
        return_date: form.return_date || null,
        pickup_time: form.pickup_time || null,
        number_of_days: form.number_of_days ? Number(form.number_of_days) : null,
        special_instructions: form.special_instructions || null,
        notes: form.notes || null,
        base_amount: form.base_amount || 0,
        driver_allowance: form.driver_allowance || 0,
        toll_amount: form.toll_amount || 0,
        parking_amount: form.parking_amount || 0,
        permit_amount: form.permit_amount || 0,
        state_tax_amount: form.state_tax_amount || 0,
        service_charge: form.service_charge || 0,
        additional_charges: form.additional_charges || 0,
        discount_amount: form.discount_amount || 0,
        tax_amount: form.tax_amount || 0,
        gst_amount: form.gst_amount || 0,
      };
      if (mode === "edit") payload.id = source?.booking?.id;

      /* Only send total when no components were filled (legacy/simple entry) */
      const hasComponents =
        FARE_FIELDS.some((f) => Number(form[f.key]) > 0) ||
        Number(form.discount_amount) > 0 ||
        Number(form.tax_amount) > 0 ||
        Number(form.gst_amount) > 0;

      if (cat === "CAR") {
        Object.assign(payload, {
          vehicle_type: form.vehicle_type || null,
          driver_name: form.driver_name || null,
          driver_phone: form.driver_phone || null,
          taxi_number: form.taxi_number || null,
          distance_km: form.distance_km || null,
          rate_per_km: form.rate_per_km || null,
          min_km: form.min_km || null,
        });
      } else if (cat === "BUS") {
        Object.assign(payload, {
          bus_operator: form.bus_operator || null,
          bus_type: form.bus_type || null,
          bus_number: form.bus_number || null,
          seating_capacity: form.seating_capacity ? Number(form.seating_capacity) : null,
        });
      } else if (cat === "TRAIN") {
        Object.assign(payload, {
          train_name: form.train_name || null,
          train_number: form.train_number || null,
          travel_class: form.travel_class || null,
          ticket_status: form.ticket_status || null,
          ticket_amount: form.ticket_amount || null,
          pickup_time: form.pickup_time || null,
        });
      } else if (cat === "FLIGHT") {
        Object.assign(payload, {
          airline: form.airline || null,
          flight_number: form.flight_number || null,
          cabin_class: form.cabin_class || null,
          baggage: form.baggage || null,
          pickup_time: form.pickup_time || null,
        });
      }

      if (
        (cat === "TRAIN" || cat === "FLIGHT" || cat === "BUS") &&
        passengers.some((p) => p.name.trim())
      ) {
        payload.passengers = passengers.filter((p) => p.name.trim());
      }

      if (!hasComponents) payload.total_amount = fareTotal;
      if (!hasComponents && fareTotal <= 0) delete payload.total_amount;

      if (advanceAmount && Number(advanceAmount) > 0 && mode === "create") {
        payload.advance_payment = {
          amount: Number(advanceAmount),
          payment_method: advanceMethod,
          received_by: "Admin",
          notes: "Advance at booking creation",
        };
      }

      const res = await apiFetch(mode === "edit" ? "/api/bookings" : "/api/bookings", {
        method: mode === "edit" ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(
          d.warning ||
            (mode === "edit"
              ? `Booking ${d.booking?.booking_number || ""} updated.`
              : `Booking ${d.booking?.booking_number} created.`),
        );
        onSaved();
        onClose();
      } else {
        toast.error(d.error || "Failed to save booking.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving booking.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide";

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl my-6 rounded-2xl border border-border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="font-heading text-lg font-bold">
              {mode === "edit"
                ? `Edit Booking${source?.booking?.booking_number ? ` · ${source.booking.booking_number}` : ""}`
                : source?.enquiry
                  ? `Convert Enquiry ${source.enquiry.enquiry_number || `#${source.enquiry.id}`} to Booking`
                  : "New Offline Booking"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total is calculated automatically from fare components.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
          {/* Category */}
          <div className="grid grid-cols-4 gap-2">
            {[
              ["CAR", "Car"],
              ["BUS", "Bus"],
              ["TRAIN", "Train"],
              ["FLIGHT", "Flight"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                disabled={mode === "edit"}
                onClick={() => set("category", val)}
                className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase transition ${
                  cat === val
                    ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white shadow"
                    : "border-border bg-white hover:bg-slate-50 disabled:opacity-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Customer */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Customer Name *">
              <input
                className={inputCls}
                value={form.passenger_name}
                onChange={(e) => set("passenger_name", e.target.value)}
                placeholder="Full name"
              />
            </Field>
            <Field label="Phone *">
              <input
                className={inputCls}
                value={form.passenger_phone}
                onChange={(e) => set("passenger_phone", e.target.value)}
                placeholder="+91..."
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                value={form.customer_email}
                onChange={(e) => set("customer_email", e.target.value)}
                placeholder="email@example.com"
              />
            </Field>
            <Field label="Members">
              <input
                type="number"
                min={1}
                className={inputCls}
                value={form.number_of_members}
                onChange={(e) => set("number_of_members", e.target.value)}
              />
            </Field>
            <Field label="Package / Service">
              <input
                className={inputCls}
                value={form.package_name}
                onChange={(e) => set("package_name", e.target.value)}
                placeholder="e.g. Coorg Package"
              />
            </Field>
            <Field label="Trip Type">
              <select
                className={inputCls}
                value={form.trip_type}
                onChange={(e) => set("trip_type", e.target.value)}
              >
                <option value="">—</option>
                <option>One Way</option>
                <option>Round Trip</option>
                <option>Local</option>
                <option>Outstation</option>
                <option>Airport Transfer</option>
                <option>Corporate</option>
                <option>Package</option>
              </select>
            </Field>
          </div>

          {/* Route & schedule */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="From">
              <input
                className={inputCls}
                value={form.from_location}
                onChange={(e) => set("from_location", e.target.value)}
              />
            </Field>
            <Field label="To">
              <input
                className={inputCls}
                value={form.to_location}
                onChange={(e) => set("to_location", e.target.value)}
              />
            </Field>
            <Field label="Departure">
              <input
                type="datetime-local"
                className={inputCls}
                value={form.departure_datetime}
                onChange={(e) => set("departure_datetime", e.target.value)}
              />
            </Field>
            <Field label="Return Date">
              <input
                type="date"
                className={inputCls}
                value={form.return_date}
                onChange={(e) => set("return_date", e.target.value)}
              />
            </Field>
            <Field label="Departure Time">
              <input
                type="time"
                className={inputCls}
                value={form.pickup_time}
                onChange={(e) => set("pickup_time", e.target.value)}
              />
            </Field>
            <Field label="No. of Days">
              <input
                type="number"
                min={1}
                className={inputCls}
                value={form.number_of_days}
                onChange={(e) => set("number_of_days", e.target.value)}
              />
            </Field>
          </div>

          {/* Category specifics */}
          {cat === "CAR" && (
            <div className="grid gap-4 sm:grid-cols-3 rounded-xl border border-sky-200 bg-sky-50/50 p-4">
              <p className="sm:col-span-3 text-xs font-bold uppercase text-sky-800">
                Car / Cab Details
              </p>
              <Field label="Vehicle">
                <input
                  className={inputCls}
                  value={form.vehicle_type}
                  onChange={(e) => set("vehicle_type", e.target.value)}
                />
              </Field>
              <Field label="Driver Name">
                <input
                  className={inputCls}
                  value={form.driver_name}
                  onChange={(e) => set("driver_name", e.target.value)}
                />
              </Field>
              <Field label="Driver Phone">
                <input
                  className={inputCls}
                  value={form.driver_phone}
                  onChange={(e) => set("driver_phone", e.target.value)}
                />
              </Field>
              <Field label="Taxi Number">
                <input
                  className={inputCls}
                  value={form.taxi_number}
                  onChange={(e) => set("taxi_number", e.target.value)}
                />
              </Field>
              <Field label="Distance (km)">
                <input
                  type="number"
                  className={inputCls}
                  value={form.distance_km}
                  onChange={(e) => set("distance_km", e.target.value)}
                />
              </Field>
              <Field label="Rate / km">
                <input
                  type="number"
                  className={inputCls}
                  value={form.rate_per_km}
                  onChange={(e) => set("rate_per_km", e.target.value)}
                />
              </Field>
              <Field label="Min. km">
                <input
                  type="number"
                  className={inputCls}
                  value={form.min_km}
                  onChange={(e) => set("min_km", e.target.value)}
                />
              </Field>
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-sky-700 hover:underline"
                  onClick={() => {
                    const km = Number(form.distance_km) || 0;
                    const rate = Number(form.rate_per_km) || 0;
                    if (km > 0 && rate > 0) {
                      const billable = Math.max(km, Number(form.min_km) || 0);
                      set("base_amount", String(Math.round(billable * rate)));
                    }
                  }}
                >
                  Calculate base fare from distance × rate
                </button>
              </div>
            </div>
          )}

          {cat === "BUS" && (
            <div className="grid gap-4 sm:grid-cols-4 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
              <p className="sm:col-span-4 text-xs font-bold uppercase text-violet-800">
                Bus Details
              </p>
              <Field label="Operator">
                <input
                  className={inputCls}
                  value={form.bus_operator}
                  onChange={(e) => set("bus_operator", e.target.value)}
                />
              </Field>
              <Field label="Bus Type">
                <input
                  className={inputCls}
                  value={form.bus_type}
                  onChange={(e) => set("bus_type", e.target.value)}
                  placeholder="AC Sleeper etc."
                />
              </Field>
              <Field label="Bus Number">
                <input
                  className={inputCls}
                  value={form.bus_number}
                  onChange={(e) => set("bus_number", e.target.value)}
                />
              </Field>
              <Field label="Seats">
                <input
                  type="number"
                  className={inputCls}
                  value={form.seating_capacity}
                  onChange={(e) => set("seating_capacity", e.target.value)}
                />
              </Field>
            </div>
          )}

          {cat === "TRAIN" && (
            <div className="grid gap-4 sm:grid-cols-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="sm:col-span-4 text-xs font-bold uppercase text-emerald-800">
                Train Details
              </p>
              <Field label="Train Name">
                <input
                  className={inputCls}
                  value={form.train_name}
                  onChange={(e) => set("train_name", e.target.value)}
                />
              </Field>
              <Field label="Train No.">
                <input
                  className={inputCls}
                  value={form.train_number}
                  onChange={(e) => set("train_number", e.target.value)}
                />
              </Field>
              <Field label="Class">
                <input
                  className={inputCls}
                  value={form.travel_class}
                  onChange={(e) => set("travel_class", e.target.value)}
                  placeholder="3A / SL ..."
                />
              </Field>
              <Field label="Ticket Status">
                <input
                  className={inputCls}
                  value={form.ticket_status}
                  onChange={(e) => set("ticket_status", e.target.value)}
                  placeholder="CNF / WL ..."
                />
              </Field>
              <Field label="Ticket Amount">
                <input
                  type="number"
                  className={inputCls}
                  value={form.ticket_amount}
                  onChange={(e) => set("ticket_amount", e.target.value)}
                />
              </Field>
            </div>
          )}

          {cat === "FLIGHT" && (
            <div className="grid gap-4 sm:grid-cols-4 rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <p className="sm:col-span-4 text-xs font-bold uppercase text-rose-800">
                Flight Details
              </p>
              <Field label="Airline">
                <input
                  className={inputCls}
                  value={form.airline}
                  onChange={(e) => set("airline", e.target.value)}
                />
              </Field>
              <Field label="Flight No.">
                <input
                  className={inputCls}
                  value={form.flight_number}
                  onChange={(e) => set("flight_number", e.target.value)}
                />
              </Field>
              <Field label="Cabin Class">
                <input
                  className={inputCls}
                  value={form.cabin_class}
                  onChange={(e) => set("cabin_class", e.target.value)}
                  placeholder="Economy ..."
                />
              </Field>
              <Field label="Baggage">
                <input
                  className={inputCls}
                  value={form.baggage}
                  onChange={(e) => set("baggage", e.target.value)}
                  placeholder="15 kg check-in"
                />
              </Field>
            </div>
          )}

          {/* Passengers for train/flight/bus */}
          {(cat === "TRAIN" || cat === "FLIGHT" || cat === "BUS") && (
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Passenger List</p>
                <button
                  type="button"
                  onClick={() =>
                    setPassengers([
                      ...passengers,
                      { name: "", age: "", gender: "", seat_berth: "" },
                    ])
                  }
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold hover:bg-slate-200"
                >
                  + Add Passenger
                </button>
              </div>
              {passengers.length === 0 && (
                <p className="text-xs text-muted-foreground">No passengers added yet.</p>
              )}
              <div className="space-y-2">
                {passengers.map((p, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_70px_90px_1fr_32px] gap-2 items-center"
                  >
                    <input
                      className="rounded-lg border px-2 py-1.5 text-sm"
                      placeholder="Name"
                      value={p.name}
                      onChange={(e) =>
                        setPassengers(
                          passengers.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border px-2 py-1.5 text-sm"
                      placeholder="Age"
                      value={p.age}
                      onChange={(e) =>
                        setPassengers(
                          passengers.map((x, j) => (j === i ? { ...x, age: e.target.value } : x)),
                        )
                      }
                    />
                    <select
                      className="rounded-lg border px-2 py-1.5 text-sm"
                      value={p.gender}
                      onChange={(e) =>
                        setPassengers(
                          passengers.map((x, j) =>
                            j === i ? { ...x, gender: e.target.value } : x,
                          ),
                        )
                      }
                    >
                      <option value="">—</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <input
                      className="rounded-lg border px-2 py-1.5 text-sm"
                      placeholder="Seat/Berth"
                      value={p.seat_berth}
                      onChange={(e) =>
                        setPassengers(
                          passengers.map((x, j) =>
                            j === i ? { ...x, seat_berth: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setPassengers(passengers.filter((_, j) => j !== i))}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fare breakdown */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-3">
              Fare Components
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {FARE_FIELDS.map((f) =>
                f.key === "driver_allowance" && cat !== "CAR" ? null : (
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}</label>
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={(form as any)[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  </div>
                ),
              )}
              <div>
                <label className={labelCls}>Discount</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.discount_amount}
                  onChange={(e) => set("discount_amount", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Tax</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.tax_amount}
                  onChange={(e) => set("tax_amount", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>GST</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.gst_amount}
                  onChange={(e) => set("gst_amount", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-[color:var(--color-navy)] px-4 py-2.5 text-white">
              <span className="text-sm font-semibold">TOTAL AMOUNT</span>
              <span className="font-heading text-xl font-bold">{formatCurrency(fareTotal)}</span>
            </div>
          </div>

          {/* Advance payment (create only) */}
          {mode === "create" && (
            <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 max-w-md">
              <p className="sm:col-span-2 text-xs font-bold uppercase text-emerald-800">
                Initial Advance Payment (optional)
              </p>
              <Field label="Amount ₹">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                />
              </Field>
              <Field label="Method">
                <select
                  className={inputCls}
                  value={advanceMethod}
                  onChange={(e) => setAdvanceMethod(e.target.value)}
                >
                  {["CASH", "UPI", "BANK TRANSFER", "CARD", "CHEQUE"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {/* Notes & meta */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Special Instructions">
              <textarea
                rows={2}
                className={inputCls}
                value={form.special_instructions}
                onChange={(e) => set("special_instructions", e.target.value)}
              />
            </Field>
            <Field label="Internal Notes">
              <textarea
                rows={2}
                className={inputCls}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
            {mode === "create" && (
              <>
                <Field label="Source">
                  <select
                    className={inputCls}
                    value={form.booking_source}
                    onChange={(e) => set("booking_source", e.target.value)}
                  >
                    {["ADMIN", "WEBSITE", "WALK-IN", "PHONE", "WHATSAPP", "REFERRAL"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    className={inputCls}
                    value={form.booking_status}
                    onChange={(e) => set("booking_status", e.target.value)}
                  >
                    {["PENDING CONFIRMATION", "CONFIRMED"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-6 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow disabled:opacity-50"
          >
            {saving ? "Saving…" : mode === "edit" ? "Update Booking" : "Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
