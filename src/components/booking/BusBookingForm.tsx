import React from "react";
import { Bus, Calendar, AlertCircle, Trash2, Users } from "lucide-react";

interface BusPassenger { name: string; age: string; gender: string; }

interface BusBookingFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  onCompleteBooking?: () => void;
  isSubmitting?: boolean;
}

const BUS_TYPES = ["AC Sleeper", "Non-AC Sleeper", "AC Seater", "Non-AC Seater", "Volvo AC", "Other"];

export function BusBookingForm({ formData, onChange, errors, onCompleteBooking, isSubmitting }: BusBookingFormProps) {
  const [busStep, setBusStep] = React.useState<"JOURNEY" | "PASSENGERS">("JOURNEY");

  const passengers: BusPassenger[] = formData.passengers && formData.passengers.length > 0
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

  const updatePassenger = (i: number, field: keyof BusPassenger, val: string) => {
    onChange("passengers", passengers.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));
  };

  const handleContinueToPassengers = () => {
    if (!formData.from_location || !formData.from_location.trim()) {
      alert("Please enter Boarding City."); return;
    }
    if (!formData.destination || !formData.destination.trim()) {
      alert("Please enter Destination."); return;
    }
    if (!formData.date) {
      alert("Please select Journey Date."); return;
    }
    setBusStep("PASSENGERS");
  };

  const handleFinalSubmit = () => {
    const firstP = passengers[0];
    if (!firstP || !firstP.name.trim()) {
      alert("Please enter Passenger 1 Full Name."); return;
    }
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
      <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
        <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-sm text-orange-900 leading-relaxed">
          <strong className="font-bold">Booking Assistance:</strong> Bus ticket fare &
          availability will be confirmed by our team. Final ticket & boarding pass will be
          shared after booking.
        </div>
      </div>

      {busStep === "JOURNEY" ? (
        <div className="space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Bus className="w-4 h-4 text-orange-600" /> Bus Journey Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">From (Boarding City) *</label>
              <input type="text" placeholder="e.g. Bengaluru — Majestic"
                value={formData.from_location || ""}
                onChange={(e) => onChange("from_location", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              {errors.from_location && <p className="text-xs text-red-600 font-medium mt-1">{errors.from_location}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">To (Destination) *</label>
              <input type="text" placeholder="e.g. Hyderabad — Jubilee Bus Stand"
                value={formData.destination || ""}
                onChange={(e) => onChange("destination", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              {errors.destination && <p className="text-xs text-red-600 font-medium mt-1">{errors.destination}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-600" /> Journey Date *
              </label>
              <input type="date" min={new Date().toISOString().split("T")[0]}
                value={formData.date || ""}
                onChange={(e) => onChange("date", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              {errors.date && <p className="text-xs text-red-600 font-medium mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Departure Time</label>
              <input type="time" value={formData.time || "07:00"}
                onChange={(e) => onChange("time", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Bus Operator</label>
              <input type="text" placeholder="e.g. VRL / KSRTC / SRS / Any"
                value={formData.preferred_operator || ""}
                onChange={(e) => onChange("preferred_operator", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Bus Type / Seat Preference</label>
            <div className="flex flex-wrap gap-2">
              {BUS_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => onChange("bus_type", t)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs border transition-all ${
                    formData.bus_type === t
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Boarding Point Preference</label>
              <input type="text" placeholder="e.g. Majestic / Shivajinagar"
                value={formData.boarding_point || ""}
                onChange={(e) => onChange("boarding_point", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Dropping Point Preference</label>
              <input type="text" placeholder="e.g. Jubilee Bus Stand / Hi-Tech City"
                value={formData.dropping_point || ""}
                onChange={(e) => onChange("dropping_point", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
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
              Boarding Details (for driver / pickup)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Boarding Point *</label>
                <input type="text" placeholder="e.g. Majestic Bus Stand, Bay 3"
                  value={formData.boarding_point || ""}
                  onChange={(e) => onChange("boarding_point", e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Boarding Address *</label>
                <input type="text" placeholder="Full address / landmark for pickup"
                  value={formData.boarding_address || ""}
                  onChange={(e) => onChange("boarding_address", e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setBusStep("JOURNEY")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50">
              ← Back to Journey Details
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
