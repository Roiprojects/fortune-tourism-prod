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
    <div className="space-y-6 text-white">
      <div className="flex items-start gap-3 bg-[#111c3a]/90 border border-white/15 rounded-2xl p-4">
        <AlertCircle className="w-5 h-5 text-[#00c58e] shrink-0 mt-0.5" />
        <div className="text-sm text-slate-300 leading-relaxed">
          <strong className="font-bold text-white">Flight Booking Assistance:</strong> Our team will
          search the best airfares and share flight options with pricing. Final booking
          confirmed upon payment.
        </div>
      </div>

      {flightStep === "JOURNEY" ? (
        <div className="space-y-5">
          {/* Trip Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Trip Type *</label>
              <div className="flex gap-2">
                {["One Way", "Round Trip", "Multi City"].map((t) => (
                  <button key={t} type="button" onClick={() => onChange("flight_trip_type", t)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      tripType === t
                        ? "bg-[#00c58e] text-white border-[#00c58e] shadow-md shadow-[#00c58e]/30 scale-[1.02]"
                        : "bg-[#111c3a]/80 border-white/15 text-slate-300 hover:bg-[#111c3a] hover:text-white"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer bg-[#111c3a]/80 border border-white/15 rounded-xl px-4 py-3 w-full hover:bg-[#111c3a] transition">
                <input type="checkbox" checked={Boolean(formData.is_international)}
                  onChange={(e) => onChange("is_international", e.target.checked)}
                  className="w-4 h-4 accent-[#00c58e] rounded" />
                <div>
                  <div className="text-sm font-bold text-white">International Flight</div>
                  <div className="text-[11px] text-slate-400">Enable passport & visa fields</div>
                </div>
              </label>
            </div>
          </div>

          {/* Flight Details */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Plane className="w-4 h-4 text-[#00c58e]" /> Flight Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">From Airport *</label>
              <select value={formData.from_airport || ""} onChange={(e) => onChange("from_airport", e.target.value)}
                className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all shadow-inner [color-scheme:dark]">
                <option value="" className="bg-[#0B132B] text-white">-- Select Departure Airport --</option>
                {AIRPORTS.map((a) => <option key={a} className="bg-[#0B132B] text-white">{a}</option>)}
              </select>
              {errors.from_airport && <p className="text-xs text-rose-400 font-medium mt-1">{errors.from_airport}</p>}
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">To Airport *</label>
              <select value={formData.to_airport || ""} onChange={(e) => onChange("to_airport", e.target.value)}
                className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all shadow-inner [color-scheme:dark]">
                <option value="" className="bg-[#0B132B] text-white">-- Select Arrival Airport --</option>
                {AIRPORTS.map((a) => <option key={a} className="bg-[#0B132B] text-white">{a}</option>)}
              </select>
              {errors.to_airport && <p className="text-xs text-rose-400 font-medium mt-1">{errors.to_airport}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#00c58e]" /> Departure Date *
              </label>
              <input type="date" min={new Date().toISOString().split("T")[0]}
                value={formData.date || ""} onChange={(e) => onChange("date", e.target.value)}
                className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all shadow-inner [color-scheme:dark]" />
              {errors.date && <p className="text-xs text-rose-400 font-medium mt-1">{errors.date}</p>}
            </div>
            {tripType === "Round Trip" && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Return Date</label>
                <input type="date" min={formData.date || new Date().toISOString().split("T")[0]}
                  value={formData.return_date || ""} onChange={(e) => onChange("return_date", e.target.value)}
                  className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all shadow-inner [color-scheme:dark]" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Preferred Departure Time</label>
              <select value={formData.preferred_time || ""} onChange={(e) => onChange("preferred_time", e.target.value)}
                className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all shadow-inner [color-scheme:dark]">
                <option value="" className="bg-[#0B132B] text-white">-- Any Time --</option>
                <option className="bg-[#0B132B] text-white">Early Morning (00:00–06:00)</option>
                <option className="bg-[#0B132B] text-white">Morning (06:00–12:00)</option>
                <option className="bg-[#0B132B] text-white">Afternoon (12:00–18:00)</option>
                <option className="bg-[#0B132B] text-white">Evening / Night (18:00–24:00)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Cabin Class</label>
              <select value={formData.cabin_class || "Economy"} onChange={(e) => onChange("cabin_class", e.target.value)}
                className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all shadow-inner [color-scheme:dark]">
                {CABIN_CLASSES.map((c) => (
                  <option key={c} value={c} className="bg-[#0B132B] text-white">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Preferred Airline (Optional)</label>
            <input type="text" placeholder="e.g. IndiGo / Air India / Akasa / Any"
              value={formData.preferred_airline || ""} onChange={(e) => onChange("preferred_airline", e.target.value)}
              className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none transition-all shadow-inner" />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button type="button" onClick={handleContinueToPassengers}
              className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105">
              Continue to Passenger Details →
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00c58e]" /> Passenger Details
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300">Number of Passengers:</label>
              <select value={passengers.length} onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="bg-[#111c3a]/90 border border-white/15 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:ring-2 focus:ring-[#00c58e]/20 focus:border-[#00c58e] outline-none shadow-inner [color-scheme:dark]">
                {[1, 2, 3, 4, 5, 6].map((n) => (<option key={n} value={n} className="bg-[#0B132B] text-white">{n}</option>))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {passengers.map((p, idx) => (
              <div key={idx} className="bg-[#111c3a]/80 border border-white/15 rounded-xl px-4 py-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-[#00c58e] shrink-0 w-5">{idx + 1}.</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1">
                    <div className="sm:col-span-6">
                      <input type="text" placeholder="Full Name (as per Aadhaar / ID)" value={p.name}
                        onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                        className="w-full bg-[#0B132B] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#00c58e]/20 focus:border-[#00c58e] outline-none" />
                    </div>
                    <div className="sm:col-span-3">
                      <input type="number" min="1" max="120" placeholder="Age" value={p.age}
                        onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                        className="w-full bg-[#0B132B] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#00c58e]/20 focus:border-[#00c58e] outline-none" />
                    </div>
                    <div className="sm:col-span-3">
                      <select value={p.gender} onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                        className="w-full bg-[#0B132B] border border-white/15 rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:ring-2 focus:ring-[#00c58e]/20 focus:border-[#00c58e] outline-none [color-scheme:dark]">
                        <option className="bg-[#0B132B] text-white">Male</option><option className="bg-[#0B132B] text-white">Female</option><option className="bg-[#0B132B] text-white">Child</option>
                      </select>
                    </div>
                  </div>
                  {passengers.length > 1 && (
                    <button type="button" onClick={() => removePassenger(idx)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-colors shrink-0" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Boarding Point & Address */}
          <div className="bg-[#111c3a]/90 border border-white/15 rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
              Boarding Details (for driver / pickup from airport)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Boarding Point *</label>
                <input type="text" placeholder="e.g. Terminal 1, Exit Gate 3"
                  value={formData.boarding_point || ""}
                  onChange={(e) => onChange("boarding_point", e.target.value)}
                  className="w-full bg-[#0B132B] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#00c58e]/20 focus:border-[#00c58e] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Full Boarding Address *</label>
                <input type="text" placeholder="Full address / pickup landmark"
                  value={formData.boarding_address || ""}
                  onChange={(e) => onChange("boarding_address", e.target.value)}
                  className="w-full bg-[#0B132B] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#00c58e]/20 focus:border-[#00c58e] outline-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button type="button" onClick={() => setFlightStep("JOURNEY")}
              className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm">
              ← Back to Flight Details
            </button>
            <button type="button" onClick={handleFinalSubmit} disabled={isSubmitting}
              className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 disabled:opacity-60">
              {isSubmitting ? "Generating Ticket..." : "CONTINUE TO BOOKING →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
