import React from "react";
import { Plane, Calendar, AlertCircle, Trash2, Users } from "lucide-react";

interface FlightPassenger { name: string; age: string; gender: string; }

interface FlightBookingFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  onCompleteBooking?: () => void;
  isSubmitting?: boolean;
}

const CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First Class"];
const AIRPORTS = [
  "Kempegowda Int'l Airport (BLR), Bengaluru",
  "Chhatrapati Shivaji Int'l Airport (BOM), Mumbai",
  "Indira Gandhi Int'l Airport (DEL), Delhi",
  "Chennai Int'l Airport (MAA)",
  "Rajiv Gandhi Int'l Airport (HYD), Hyderabad",
  "Cochin Int'l Airport (COK)",
  "Mangaluru Int'l Airport (IXE)",
  "Mysuru Airport (MYQ)",
  "Other (specify in notes)",
];

export function FlightBookingForm({ formData, onChange, errors, onCompleteBooking, isSubmitting }: FlightBookingFormProps) {
  const [flightStep, setFlightStep] = React.useState<"JOURNEY" | "PASSENGERS">("JOURNEY");
  const tripType = formData.flight_trip_type || "One Way";

  const passengers: FlightPassenger[] = formData.passengers && formData.passengers.length > 0
    ? formData.passengers
    : [{ name: "", age: "", gender: "Male" }];

  const setPassengerCount = (count: number) => {
    const current = passengers;
    if (count > current.length) {
      const newPassengers = [...current];
      for (let i = current.length; i < count; i++) {
        newPassengers.push({ name: "", age: "", gender: "Male" });
      }
      onChange("passengers", newPassengers);
    } else if (count < current.length) {
      onChange("passengers", current.slice(0, count));
    }
  };

  const removePassenger = (i: number) => {
    if (passengers.length <= 1) return;
    onChange("passengers", passengers.filter((_, idx) => idx !== i));
  };

  const updatePassenger = (i: number, field: keyof FlightPassenger, val: string) => {
    onChange("passengers", passengers.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));
  };

  const handleContinueToPassengers = () => {
    if (!formData.from_airport) { alert("Please select Departure Airport."); return; }
    if (!formData.to_airport) { alert("Please select Arrival Airport."); return; }
    if (!formData.date) { alert("Please select Departure Date."); return; }
    setFlightStep("PASSENGERS");
  };

  const handleFinalSubmit = () => {
    const firstP = passengers[0];
    if (!firstP || !firstP.name.trim()) { alert("Please enter Passenger 1 Full Name."); return; }
    if (!formData.boarding_point || !formData.boarding_point.trim()) {
      alert("Please enter the Boarding Point."); return;
    }
    if (!formData.boarding_address || !formData.boarding_address.trim()) {
      alert("Please enter the Boarding Address."); return;
    }
    if (onCompleteBooking) onCompleteBooking();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-2xl p-4">
        <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-sm text-sky-900 leading-relaxed">
          <strong className="font-bold">Flight Booking Assistance:</strong> Our team will
          search the best airfares and share flight options with pricing. Final booking
          confirmed upon payment.
        </div>
      </div>

      {flightStep === "JOURNEY" ? (
        <div className="space-y-5">
          {/* Trip Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Trip Type *</label>
              <div className="flex gap-2">
                {["One Way", "Round Trip", "Multi City"].map((t) => (
                  <button key={t} type="button" onClick={() => onChange("flight_trip_type", t)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      tripType === t
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-full hover:bg-slate-100/60 transition">
                <input type="checkbox" checked={Boolean(formData.is_international)}
                  onChange={(e) => onChange("is_international", e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded" />
                <div>
                  <div className="text-sm font-bold text-slate-900">International Flight</div>
                  <div className="text-[11px] text-slate-500">Enable passport & visa fields</div>
                </div>
              </label>
            </div>
          </div>

          {/* Flight Details */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-600" /> Flight Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">From Airport *</label>
              <select value={formData.from_airport || ""} onChange={(e) => onChange("from_airport", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                <option value="">-- Select Departure Airport --</option>
                {AIRPORTS.map((a) => <option key={a}>{a}</option>)}
              </select>
              {errors.from_airport && <p className="text-xs text-red-600 font-medium mt-1">{errors.from_airport}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">To Airport *</label>
              <select value={formData.to_airport || ""} onChange={(e) => onChange("to_airport", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                <option value="">-- Select Arrival Airport --</option>
                {AIRPORTS.map((a) => <option key={a}>{a}</option>)}
              </select>
              {errors.to_airport && <p className="text-xs text-red-600 font-medium mt-1">{errors.to_airport}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-600" /> Departure Date *
              </label>
              <input type="date" min={new Date().toISOString().split("T")[0]}
                value={formData.date || ""} onChange={(e) => onChange("date", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              {errors.date && <p className="text-xs text-red-600 font-medium mt-1">{errors.date}</p>}
            </div>
            {tripType === "Round Trip" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Return Date</label>
                <input type="date" min={formData.date || new Date().toISOString().split("T")[0]}
                  value={formData.return_date || ""} onChange={(e) => onChange("return_date", e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Departure Time</label>
              <select value={formData.preferred_time || ""} onChange={(e) => onChange("preferred_time", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                <option value="">-- Any Time --</option>
                <option>Early Morning (00:00–06:00)</option>
                <option>Morning (06:00–12:00)</option>
                <option>Afternoon (12:00–18:00)</option>
                <option>Evening / Night (18:00–24:00)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cabin Class</label>
              <select value={formData.cabin_class || "Economy"} onChange={(e) => onChange("cabin_class", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                {CABIN_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Airline (Optional)</label>
            <input type="text" placeholder="e.g. IndiGo / Air India / Akasa / Any"
              value={formData.preferred_airline || ""} onChange={(e) => onChange("preferred_airline", e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="button" onClick={handleContinueToPassengers}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-8 py-3.5 rounded-xl uppercase text-sm shadow-md transition-all hover:scale-105">
              Continue to Passenger Details →
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" /> Passenger Details
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Number of Passengers:</label>
              <select value={passengers.length} onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-sm font-black text-amber-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-2xs">
                {[1, 2, 3, 4, 5, 6].map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {passengers.map((p, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-amber-800 shrink-0 w-5">{idx + 1}.</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1">
                    <div className="sm:col-span-6">
                      <input type="text" placeholder="Full Name (as per Aadhaar / ID)" value={p.name}
                        onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                    </div>
                    <div className="sm:col-span-3">
                      <input type="number" min="1" max="120" placeholder="Age" value={p.age}
                        onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                    </div>
                    <div className="sm:col-span-3">
                      <select value={p.gender} onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                        <option>Male</option><option>Female</option><option>Child</option>
                      </select>
                    </div>
                  </div>
                  {passengers.length > 1 && (
                    <button type="button" onClick={() => removePassenger(idx)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Boarding Point & Address */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Boarding Details (for driver / pickup from airport)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Boarding Point *</label>
                <input type="text" placeholder="e.g. Terminal 1, Exit Gate 3"
                  value={formData.boarding_point || ""}
                  onChange={(e) => onChange("boarding_point", e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Boarding Address *</label>
                <input type="text" placeholder="Full address / pickup landmark"
                  value={formData.boarding_address || ""}
                  onChange={(e) => onChange("boarding_address", e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setFlightStep("JOURNEY")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50">
              ← Back to Flight Details
            </button>
            <button type="button" onClick={handleFinalSubmit} disabled={isSubmitting}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-10 py-3.5 rounded-xl uppercase text-sm shadow-md transition-all hover:scale-105 disabled:opacity-60">
              {isSubmitting ? "Generating Ticket..." : "CONTINUE TO BOOKING →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
