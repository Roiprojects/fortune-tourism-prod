import React from "react";
import {
  TrainFront,
  Calendar,
  Users,
  Plus,
  Trash2,
} from "lucide-react";

interface Passenger {
  name: string;
  age: string;
  gender: string;
  berth_preference: string;
}

interface TrainBookingFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  onCompleteBooking: () => void;
  isSubmitting?: boolean;
}

const CLASS_OPTIONS = [
  { value: "3A", label: "3A - AC 3 Tier" },
  { value: "2A", label: "2A - AC 2 Tier" },
  { value: "1A", label: "1A - AC First Class" },
  { value: "3E", label: "3E - 3 AC Economy" },
  { value: "SL", label: "SL - Sleeper Class" },
  { value: "CC", label: "CC - AC Chair Car" },
  { value: "2S", label: "2S - Second Sitting" },
  { value: "Other", label: "Other / Any" },
];

const QUOTA_OPTIONS = [
  { value: "General", label: "General Quota" },
  { value: "Tatkal", label: "Tatkal Quota" },
  { value: "Ladies", label: "Ladies Quota" },
  { value: "Senior Citizen", label: "Senior Citizen Quota" },
  { value: "Other", label: "Other" },
];

const BERTH_OPTIONS = ["Lower", "Middle", "Upper", "Side Lower", "Side Upper", "No Preference"];

export function TrainBookingForm({ formData, onChange, errors, onCompleteBooking, isSubmitting }: TrainBookingFormProps) {
  const [trainStep, setTrainStep] = React.useState<"JOURNEY" | "PASSENGERS">("JOURNEY");

  const passengers: Passenger[] = formData.passengers && formData.passengers.length > 0
    ? formData.passengers
    : [{ name: "", age: "", gender: "Male", berth_preference: "No Preference" }];

  const setPassengerCount = (count: number) => {
    const current = passengers;
    if (count > current.length) {
      // Add more passengers
      const newPassengers = [...current];
      for (let i = current.length; i < count; i++) {
        newPassengers.push({ name: "", age: "", gender: "Male", berth_preference: "No Preference" });
      }
      onChange("passengers", newPassengers);
    } else if (count < current.length) {
      // Trim passengers
      onChange("passengers", current.slice(0, count));
    }
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    onChange(
      "passengers",
      passengers.filter((_, i) => i !== index)
    );
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updated = passengers.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange("passengers", updated);
  };

  const handleContinueToPassengers = () => {
    if (!formData.from_station || !formData.from_station.trim()) {
      alert("Please enter From Station.");
      return;
    }
    if (!formData.to_station || !formData.to_station.trim()) {
      alert("Please enter To Station.");
      return;
    }
    if (!formData.date) {
      alert("Please select Journey Date.");
      return;
    }
    setTrainStep("PASSENGERS");
  };

  const handleFinalSubmit = () => {
    const firstP = passengers[0];
    if (!firstP || !firstP.name.trim()) {
      alert("Please enter Passenger 1 Full Name."); return;
    }
    if (!firstP.age || !firstP.age.trim()) {
      alert("Please enter Passenger 1 Age."); return;
    }
    if (!formData.boarding_point || !formData.boarding_point.trim()) {
      alert("Please enter the Boarding Point."); return;
    }
    if (!formData.boarding_address || !formData.boarding_address.trim()) {
      alert("Please enter the Boarding Address."); return;
    }
    onCompleteBooking();
  };

  return (
    <div className="space-y-6">

      {trainStep === "JOURNEY" ? (
        /* STEP 1: TRAIN JOURNEY DETAILS */
        <div className="space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <TrainFront className="w-4 h-4 text-amber-600" /> Train Journey Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">From Station *</label>
              <input
                type="text"
                placeholder="e.g. Bangalore City (SBC)"
                value={formData.from_station || ""}
                onChange={(e) => onChange("from_station", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              {errors.from_station && <p className="text-xs text-red-600 font-medium mt-1">{errors.from_station}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">To Station *</label>
              <input
                type="text"
                placeholder="e.g. Chennai Central (MAS)"
                value={formData.to_station || ""}
                onChange={(e) => onChange("to_station", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              {errors.to_station && <p className="text-xs text-red-600 font-medium mt-1">{errors.to_station}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-600" /> Journey Date *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.date || ""}
                onChange={(e) => onChange("date", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              {errors.date && <p className="text-xs text-red-600 font-medium mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Train</label>
              <input
                type="text"
                placeholder="e.g. Shatabdi / Rajdhani / Any"
                value={formData.preferred_train || ""}
                onChange={(e) => onChange("preferred_train", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Class *</label>
              <select
                value={formData.travel_class || "3A"}
                onChange={(e) => onChange("travel_class", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quota *</label>
              <select
                value={formData.quota || "General"}
                onChange={(e) => onChange("quota", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                {QUOTA_OPTIONS.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Time</label>
              <input
                type="time"
                value={formData.time || "07:00"}
                onChange={(e) => onChange("time", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Train Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 12608 / 12028 / Any"
                value={formData.train_number || ""}
                onChange={(e) => onChange("train_number", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleContinueToPassengers}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-8 py-3.5 rounded-xl uppercase text-sm shadow-md transition-all hover:scale-105"
            >
              Continue to Passenger Details →
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: PASSENGER DETAILS (Max 6 Members) */
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" /> Passenger Details
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Number of Passengers:</label>
              <select
                value={passengers.length}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-sm font-black text-amber-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-2xs"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {passengers.map((p, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-amber-800 shrink-0 w-5">{idx + 1}.</span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Full Name (as per Aadhaar / ID)"
                        value={p.name}
                        onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="Age"
                        value={p.age}
                        onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={p.gender}
                        onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Child</option>
                      </select>
                    </div>
                  </div>

                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(idx)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remove"
                    >
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
                <input type="text" placeholder="e.g. City Railway Station, Platform 1"
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
            <button
              type="button"
              onClick={() => setTrainStep("JOURNEY")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              ← Back to Journey Details
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-10 py-3.5 rounded-xl uppercase text-sm shadow-md transition-all hover:scale-105 disabled:opacity-60"
            >
              {isSubmitting ? "Confirming Ticket Copy..." : "CONTINUE TO BOOKING →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
