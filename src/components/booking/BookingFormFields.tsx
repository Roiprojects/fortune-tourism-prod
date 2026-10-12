import { useEffect, useState } from "react";
import { LocationSearchInput } from "@/components/booking/LocationSearchInput";
import { User, Phone, Mail, Users, Calendar, Clock } from "lucide-react";

interface BookingFormFieldsProps {
  bookingType: string;
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function BookingFormFields({ bookingType, formData, onChange, errors }: BookingFormFieldsProps) {
  const [vehicles, setVehicles] = useState<string[]>([
    "Hatchback", "Sedan", "SUV", "Innova", "Ertiga", "Tempo Traveller", "Other"
  ]);

  useEffect(() => {
    if (bookingType === "TAXI") {
      fetch("/api/vehicles")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.vehicles) {
            setVehicles(d.vehicles.map((v: any) => v.name));
          }
        })
        .catch(() => {});
    }
  }, [bookingType]);

  const inputClass = (field: string) =>
    `w-full py-3 px-4 rounded-xl border text-sm font-medium bg-white transition-all duration-200 ${
      errors[field]
        ? "border-red-400 ring-2 ring-red-100 text-red-900 bg-red-50/50"
        : "border-slate-200 focus:border-[#0E6B50] focus:ring-2 focus:ring-emerald-100 text-slate-900 hover:border-slate-300"
    } focus:outline-none`;

  const labelClass = "block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5";

  const renderError = (field: string) =>
    errors[field] ? <span className="text-[11px] text-red-500 mt-1 block">{errors[field]}</span> : null;

  return (
    <div className="space-y-6">
      {/* Personal Details */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-5">
        <h3 className="font-heading text-lg font-bold text-slate-900 mb-4 border-b pb-2">Passenger Details</h3>
        
        <div>
          <label htmlFor="name" className={labelClass}>
            <User className="h-3 w-3 inline mr-1" /> Full Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className={inputClass("name")}
          />
          {renderError("name")}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className={labelClass}>
              <Phone className="h-3 w-3 inline mr-1" /> Mobile Number *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  onChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="97404 63404"
                className={`${inputClass("phone")} pl-12`}
                maxLength={10}
              />
            </div>
            {renderError("phone")}
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              <Mail className="h-3 w-3 inline mr-1" /> Email (Optional)
            </label>
            <input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="you@example.com"
              className={inputClass("email")}
            />
            {renderError("email")}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Users className="h-3 w-3 inline mr-1" /> Number of Passengers *
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 15].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange("passengers", String(n))}
                className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                  formData.passengers === String(n)
                    ? "border-[#0E6B50] bg-[#0E6B50] text-white shadow-md shadow-emerald-200"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {renderError("passengers")}
        </div>
      </div>

      {/* Travel Details */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-5">
        <h3 className="font-heading text-lg font-bold text-slate-900 mb-4 border-b pb-2">Travel Details</h3>
        
        {/* Type Specific Fields */}
        {bookingType === "TAXI" && (
          <>
            <div>
              <label className={labelClass}>Trip Type</label>
              <div className="flex flex-wrap gap-2">
                {["One Way", "Round Trip", "Local", "Airport Transfer", "Outstation", "Sightseeing"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange("trip_type", t)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                      formData.trip_type === t
                        ? "border-[#0E6B50] bg-emerald-50 text-[#0E6B50]"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="car_type" className={labelClass}>Vehicle Preference</label>
              <select
                id="car_type"
                value={formData.car_type || ""}
                onChange={(e) => onChange("car_type", e.target.value)}
                className={inputClass("car_type")}
              >
                <option value="">Select vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {bookingType === "FLIGHT" && (
          <div>
            <label className={labelClass}>Trip Type</label>
            <div className="flex gap-2">
              {["One Way", "Round Trip"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange("trip_type", t)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    formData.trip_type === t
                      ? "border-[#0E6B50] bg-emerald-50 text-[#0E6B50]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bookingType === "TRAIN" ? (
            <>
              <div>
                <label htmlFor="pickup" className={labelClass}>From Station *</label>
                <input
                  id="pickup"
                  type="text"
                  value={formData.pickup || ""}
                  onChange={(e) => onChange("pickup", e.target.value)}
                  placeholder="e.g. NDLS"
                  className={inputClass("pickup")}
                />
                {renderError("pickup")}
              </div>
              <div>
                <label htmlFor="destination" className={labelClass}>To Station *</label>
                <input
                  id="destination"
                  type="text"
                  value={formData.destination || ""}
                  onChange={(e) => onChange("destination", e.target.value)}
                  placeholder="e.g. MAS"
                  className={inputClass("destination")}
                />
                {renderError("destination")}
              </div>
            </>
          ) : bookingType === "FLIGHT" ? (
            <>
              <div>
                <label htmlFor="pickup" className={labelClass}>From Airport *</label>
                <input
                  id="pickup"
                  type="text"
                  value={formData.pickup || ""}
                  onChange={(e) => onChange("pickup", e.target.value)}
                  placeholder="e.g. DEL"
                  className={inputClass("pickup")}
                />
                {renderError("pickup")}
              </div>
              <div>
                <label htmlFor="destination" className={labelClass}>To Airport *</label>
                <input
                  id="destination"
                  type="text"
                  value={formData.destination || ""}
                  onChange={(e) => onChange("destination", e.target.value)}
                  placeholder="e.g. BOM"
                  className={inputClass("destination")}
                />
                {renderError("destination")}
              </div>
            </>
          ) : (
            <>
              <div>
                <LocationSearchInput
                  label={bookingType === "BUS" ? "BOARDING LOCATION *" : "PICKUP LOCATION *"}
                  placeholder="Start typing..."
                  value={formData.pickup || ""}
                  onChange={(val) => onChange("pickup", val)}
                />
                {renderError("pickup")}
              </div>
              <div>
                <LocationSearchInput
                  label="DROP LOCATION *"
                  placeholder="Start typing..."
                  value={formData.destination || ""}
                  onChange={(val) => onChange("destination", val)}
                />
                {renderError("destination")}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className={labelClass}>
              <Calendar className="h-3 w-3 inline mr-1" /> Travel Date *
            </label>
            <input
              id="date"
              type="date"
              value={formData.date || ""}
              onChange={(e) => onChange("date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={inputClass("date")}
            />
            {renderError("date")}
          </div>

          {((bookingType === "FLIGHT" || bookingType === "TAXI" || bookingType === "CAR") && (formData.trip_type === "Round Trip" || formData.trip_type === "ROUND TRIP")) && (
            <div>
              <label htmlFor="return_date" className={labelClass}>
                <Calendar className="h-3 w-3 inline mr-1" /> Return Date *
              </label>
              <input
                id="return_date"
                type="date"
                value={formData.return_date || ""}
                onChange={(e) => onChange("return_date", e.target.value)}
                min={formData.date || new Date().toISOString().split("T")[0]}
                className={inputClass("return_date")}
              />
              {renderError("return_date")}
            </div>
          )}

          <div>
            <label htmlFor="time" className={labelClass}>
              <Clock className="h-3 w-3 inline mr-1" /> Preferred Travel Time
            </label>
            <input
              id="time"
              type="time"
              value={formData.time || ""}
              onChange={(e) => onChange("time", e.target.value)}
              className={inputClass("time")}
            />
          </div>
        </div>

        {/* Round Trip Cab Details & Fare Components for TAXI */}
        {(bookingType === "TAXI" || bookingType === "CAR") && (formData.trip_type === "Round Trip" || formData.trip_type === "ROUND TRIP") && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-sky-900 tracking-wider flex items-center gap-1.5">
                🚖 Round Trip Cab Details &amp; Fare
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                2-Way Journey
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Distance (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 300"
                  value={formData.distance_km || ""}
                  onChange={(e) => onChange("distance_km", e.target.value)}
                  className={inputClass("distance_km")}
                />
              </div>
              <div>
                <label className={labelClass}>Rate / km (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 14"
                  value={formData.rate_per_km || ""}
                  onChange={(e) => onChange("rate_per_km", e.target.value)}
                  className={inputClass("rate_per_km")}
                />
              </div>
              <div>
                <label className={labelClass}>Driver Allowance (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={formData.driver_allowance || "350"}
                  onChange={(e) => onChange("driver_allowance", e.target.value)}
                  className={inputClass("driver_allowance")}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-sky-200 text-xs">
              <span className="text-slate-600 font-semibold">
                Round Trip Estimate (2 × Distance × Rate + Driver Allowance):
              </span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                ₹{((Number(formData.distance_km || 0) * Number(formData.rate_per_km || 0)) + Number(formData.driver_allowance || 350)).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {bookingType === "BUS" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bus_operator" className={labelClass}>Preferred Bus Operator</label>
              <input
                id="bus_operator"
                type="text"
                value={formData.bus_operator || ""}
                onChange={(e) => onChange("bus_operator", e.target.value)}
                placeholder="e.g. VRL Travels, KSRTC"
                className={inputClass("bus_operator")}
              />
            </div>
            <div>
              <label htmlFor="bus_type" className={labelClass}>Seat Preference</label>
              <select
                id="bus_type"
                value={formData.bus_type || ""}
                onChange={(e) => onChange("bus_type", e.target.value)}
                className={inputClass("bus_type")}
              >
                <option value="">No preference</option>
                <option value="Seater">Seater</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Semi-Sleeper">Semi-Sleeper</option>
              </select>
            </div>
          </div>
        )}

        {bookingType === "TRAIN" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="train_preference" className={labelClass}>Preferred Train</label>
              <input
                id="train_preference"
                type="text"
                value={formData.train_preference || ""}
                onChange={(e) => onChange("train_preference", e.target.value)}
                placeholder="Train name or number"
                className={inputClass("train_preference")}
              />
            </div>
            <div>
              <label htmlFor="train_class" className={labelClass}>Preferred Class</label>
              <select
                id="train_class"
                value={formData.train_class || ""}
                onChange={(e) => onChange("train_class", e.target.value)}
                className={inputClass("train_class")}
              >
                <option value="">Select class...</option>
                {["1AC", "2AC", "3AC", "Sleeper", "Chair Car", "Executive Chair Car"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {bookingType === "FLIGHT" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="airline" className={labelClass}>Preferred Airline</label>
              <input
                id="airline"
                type="text"
                value={formData.airline || ""}
                onChange={(e) => onChange("airline", e.target.value)}
                placeholder="e.g. Indigo, Air India"
                className={inputClass("airline")}
              />
            </div>
            <div>
              <label htmlFor="cabin_class" className={labelClass}>Cabin Class</label>
              <select
                id="cabin_class"
                value={formData.cabin_class || ""}
                onChange={(e) => onChange("cabin_class", e.target.value)}
                className={inputClass("cabin_class")}
              >
                <option value="">Select class...</option>
                {["Economy", "Premium Economy", "Business", "First Class"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="notes" className={labelClass}>Special Requirements/Notes</label>
          <textarea
            id="notes"
            value={formData.notes || ""}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Any dietary needs, accessibility requirements, preferences..."
            rows={3}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:border-[#0E6B50] focus:ring-2 focus:ring-emerald-100 text-slate-900 resize-none placeholder:text-slate-400 hover:border-slate-300 transition-all"
          />
        </div>

      </div>
    </div>
  );
}
