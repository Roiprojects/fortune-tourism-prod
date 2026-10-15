import React, { useState, useEffect } from "react";
import {
  Plane,
  Calendar,
  AlertCircle,
  Trash2,
  Users,
  Phone,
  ArrowRight,
  ArrowLeftRight,
  Plus,
  Clock,
  Sparkles,
} from "lucide-react";

export interface FlightPassenger {
  name: string;
  age: string;
  gender: string;
}

export interface MultiCityLeg {
  id: string;
  from: string;
  to: string;
  date: string;
  preferred_time: string;
}

interface FlightBookingFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  onCompleteBooking?: () => void;
  isSubmitting?: boolean;
}

const CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First Class"];

const PREFERRED_TIMES = [
  "-- Any Time --",
  "Early Morning (00:00–06:00)",
  "Morning (06:00–12:00)",
  "Afternoon (12:00–18:00)",
  "Evening / Night (18:00–24:00)",
];

const POPULAR_AIRPORTS = [
  "Kempegowda Int'l Airport (BLR), Bengaluru",
  "Indira Gandhi Int'l Airport (DEL), Delhi",
  "Chhatrapati Shivaji Int'l Airport (BOM), Mumbai",
  "Chennai Int'l Airport (MAA), Chennai",
  "Rajiv Gandhi Int'l Airport (HYD), Hyderabad",
  "Netaji Subhash Chandra Bose Int'l Airport (CCU), Kolkata",
  "Cochin Int'l Airport (COK), Kochi",
  "Goa Dabolim Airport (GOI) / Mopa (GOX), Goa",
  "Pune Airport (PNQ), Pune",
  "Sardar Vallabhbhai Patel Int'l Airport (AMD), Ahmedabad",
  "Jaipur Int'l Airport (JAI), Jaipur",
  "Chaudhary Charan Singh Int'l Airport (LKO), Lucknow",
  "Lal Bahadur Shastri Airport (VNS), Varanasi",
  "Sheikh ul-Alam Int'l Airport (SXR), Srinagar",
  "Lokpriya Gopinath Bordoloi Airport (GAU), Guwahati",
  "Jay Prakash Narayan Airport (PAT), Patna",
  "Mangaluru Int'l Airport (IXE), Mangaluru",
  "Mysuru Airport (MYQ), Mysuru",
  "Dubai Int'l Airport (DXB), UAE",
  "Singapore Changi Airport (SIN), Singapore",
  "Suvarnabhumi Airport (BKK), Bangkok",
  "Heathrow Airport (LHR), London",
];

const QUICK_DESTINATIONS = [
  { label: "Delhi (DEL)", value: "Indira Gandhi Int'l Airport (DEL), Delhi" },
  { label: "Mumbai (BOM)", value: "Chhatrapati Shivaji Int'l Airport (BOM), Mumbai" },
  { label: "Goa (GOI)", value: "Goa Dabolim Airport (GOI) / Mopa (GOX), Goa" },
  { label: "Hyderabad (HYD)", value: "Rajiv Gandhi Int'l Airport (HYD), Hyderabad" },
  { label: "Chennai (MAA)", value: "Chennai Int'l Airport (MAA), Chennai" },
  { label: "Kolkata (CCU)", value: "Netaji Subhash Chandra Bose Int'l Airport (CCU), Kolkata" },
  { label: "Dubai (DXB)", value: "Dubai Int'l Airport (DXB), UAE" },
];

export function FlightBookingForm({
  formData,
  onChange,
  errors,
  onCompleteBooking,
  isSubmitting,
}: FlightBookingFormProps) {
  const [flightStep, setFlightStep] = useState<"JOURNEY" | "PASSENGERS">("JOURNEY");
  const tripType: "One Way" | "Round Trip" | "Multi City" = formData.flight_trip_type || "One Way";

  const today = new Date().toISOString().split("T")[0];

  // Helper to extract short city name or IATA code
  const getShortName = (val: string) => {
    if (!val) return "";
    const code = val.match(/\(([A-Z]{3})\)/);
    if (code) return code[1];
    return val.split(",")[0].trim();
  };

  // Sync helpers for Outbound From & To
  const handleFromChange = (val: string) => {
    onChange("from_airport", val);
    onChange("from_location", val);
    onChange("pickup", val);

    // If Round Trip and return destination isn't manually set, keep it synced
    if (tripType === "Round Trip" && !formData.return_to_airport_customized) {
      onChange("return_to_airport", val);
    }
  };

  const handleToChange = (val: string) => {
    onChange("to_airport", val);
    onChange("destination", val);
    onChange("to_destination", val);
    onChange("to_location", val);

    // If Round Trip and return origin isn't manually set, keep it synced
    if (tripType === "Round Trip" && !formData.return_from_airport_customized) {
      onChange("return_from_airport", val);
    }
  };

  const swapOutbound = () => {
    const curFrom = formData.from_airport || "";
    const curTo = formData.to_airport || "";
    handleFromChange(curTo);
    handleToChange(curFrom);
  };

  // Return trip leg helpers
  const returnFrom = formData.return_from_airport ?? (formData.to_airport || "");
  const returnTo = formData.return_to_airport ?? (formData.from_airport || "");

  const handleReturnFromChange = (val: string) => {
    onChange("return_from_airport", val);
    onChange("return_from_airport_customized", true);
  };

  const handleReturnToChange = (val: string) => {
    onChange("return_to_airport", val);
    onChange("return_to_airport_customized", true);
  };

  const swapReturn = () => {
    const curFrom = returnFrom;
    const curTo = returnTo;
    handleReturnFromChange(curTo);
    handleReturnToChange(curFrom);
  };

  // Multi City Legs management
  const multiCityFlights: MultiCityLeg[] = React.useMemo(() => {
    if (Array.isArray(formData.multi_city_flights) && formData.multi_city_flights.length >= 2) {
      return formData.multi_city_flights;
    }
    return [
      {
        id: "leg-1",
        from: formData.from_airport || "Kempegowda Int'l Airport (BLR), Bengaluru",
        to: formData.to_airport || "Indira Gandhi Int'l Airport (DEL), Delhi",
        date: formData.date || today,
        preferred_time: formData.preferred_time || "",
      },
      {
        id: "leg-2",
        from: formData.to_airport || "Indira Gandhi Int'l Airport (DEL), Delhi",
        to: "",
        date: formData.return_date || "",
        preferred_time: "",
      },
    ];
  }, [formData.multi_city_flights, formData.from_airport, formData.to_airport, formData.date, formData.return_date, formData.preferred_time, today]);

  // Sync multiCityFlights into formData if not set yet
  useEffect(() => {
    if (tripType === "Multi City" && (!formData.multi_city_flights || formData.multi_city_flights.length < 2)) {
      onChange("multi_city_flights", multiCityFlights);
    }
  }, [tripType]);

  const updateMultiCityLeg = (index: number, field: keyof MultiCityLeg, val: string) => {
    const updated = multiCityFlights.map((leg, idx) => {
      if (idx !== index) return leg;
      return { ...leg, [field]: val };
    });

    // If user changes 'to' on leg N, automatically suggest leg N+1 'from' if it's currently matching or empty
    if (field === "to" && index < updated.length - 1) {
      const nextLeg = updated[index + 1];
      if (!nextLeg.from || nextLeg.from === multiCityFlights[index].to) {
        updated[index + 1] = { ...nextLeg, from: val };
      }
    }

    onChange("multi_city_flights", updated);

    // Sync primary fields for first leg
    if (index === 0) {
      if (field === "from") {
        onChange("from_airport", val);
        onChange("from_location", val);
        onChange("pickup", val);
      }
      if (field === "date") onChange("date", val);
    }
    // Sync destination summary
    const destSummary = updated
      .map((l) => getShortName(l.to))
      .filter(Boolean)
      .join(" → ");
    if (destSummary) {
      onChange("destination", destSummary);
      onChange("to_destination", destSummary);
    }
    if (updated[updated.length - 1]?.to) {
      onChange("to_airport", updated[updated.length - 1].to);
    }
  };

  const addMultiCityLeg = () => {
    if (multiCityFlights.length >= 6) return;
    const lastLeg = multiCityFlights[multiCityFlights.length - 1];
    const newLeg: MultiCityLeg = {
      id: `leg-${Date.now()}`,
      from: lastLeg ? lastLeg.to : "",
      to: "",
      date: lastLeg?.date || today,
      preferred_time: "",
    };
    const updated = [...multiCityFlights, newLeg];
    onChange("multi_city_flights", updated);
  };

  const removeMultiCityLeg = (index: number) => {
    if (multiCityFlights.length <= 2) return;
    const updated = multiCityFlights.filter((_, idx) => idx !== index);
    onChange("multi_city_flights", updated);
  };

  // Passengers
  const passengers: FlightPassenger[] =
    formData.passengers && formData.passengers.length > 0
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

  // Continue to Passengers validation
  const handleContinueToPassengers = () => {
    if (tripType === "One Way") {
      const fromVal = (formData.from_airport || formData.from_location || formData.pickup || "").trim();
      const toVal = (formData.to_airport || formData.destination || formData.to_destination || "").trim();
      if (!fromVal) {
        alert("Please select or enter Departure Airport / City.");
        return;
      }
      if (!toVal) {
        alert("Please select or enter Arrival Destination / Airport.");
        return;
      }
      if (!formData.date) {
        alert("Please select Departure Date.");
        return;
      }
    } else if (tripType === "Round Trip") {
      const fromVal = (formData.from_airport || "").trim();
      const toVal = (formData.to_airport || "").trim();
      if (!fromVal) {
        alert("Please select or enter Departure Airport / City for Outbound Flight.");
        return;
      }
      if (!toVal) {
        alert("Please select or enter Arrival Airport / City for Outbound Flight.");
        return;
      }
      if (!formData.date) {
        alert("Please select Outbound Departure Date.");
        return;
      }
      if (!formData.return_date) {
        alert("Please select Return Date for Round Trip.");
        return;
      }
      if (formData.date && formData.return_date && formData.return_date < formData.date) {
        alert("Return Date cannot be before Outbound Departure Date.");
        return;
      }
      // Ensure return legs are synced
      onChange("return_from_airport", returnFrom || toVal);
      onChange("return_to_airport", returnTo || fromVal);
    } else if (tripType === "Multi City") {
      for (let i = 0; i < multiCityFlights.length; i++) {
        const leg = multiCityFlights[i];
        if (!leg.from.trim()) {
          alert(`Please enter Departure Airport for Flight #${i + 1}.`);
          return;
        }
        if (!leg.to.trim()) {
          alert(`Please enter Arrival Airport for Flight #${i + 1}.`);
          return;
        }
        if (!leg.date) {
          alert(`Please select Departure Date for Flight #${i + 1}.`);
          return;
        }
      }
      // Sync legs to formData
      onChange("multi_city_flights", multiCityFlights);
      onChange("from_airport", multiCityFlights[0].from);
      onChange("date", multiCityFlights[0].date);
      onChange("to_airport", multiCityFlights[multiCityFlights.length - 1].to);
      const summary = multiCityFlights.map((l) => getShortName(l.to)).join(" → ");
      onChange("destination", summary);
    }

    setFlightStep("PASSENGERS");
  };

  const handleFinalSubmit = () => {
    const firstP = passengers[0];
    if (!firstP || !firstP.name.trim()) {
      alert("Please enter Passenger 1 Full Name.");
      return;
    }
    if (!formData.phone || !formData.phone.trim()) {
      alert("Please enter Passenger Phone Number.");
      return;
    }
    if (!formData.boarding_point || !formData.boarding_point.trim()) {
      alert("Please enter the Boarding Point.");
      return;
    }
    if (!formData.boarding_address || !formData.boarding_address.trim()) {
      alert("Please enter the Boarding Address.");
      return;
    }
    if (onCompleteBooking) onCompleteBooking();
  };

  const currentFrom = formData.from_airport || formData.from_location || formData.pickup || "";
  const currentTo = formData.to_airport || formData.destination || formData.to_destination || "";

  return (
    <div className="space-y-6">
      {/* Flight Assistance Banner */}
      <div className="flex items-start gap-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-emerald-200">
        <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
          <strong className="font-bold text-emerald-300">Flight Booking Assistance:</strong> Our team will search
          the best airfares across all airlines and share flight options with pricing.
        </div>
      </div>

      {flightStep === "JOURNEY" ? (
        <div className="space-y-6">
          {/* Trip Type Selector & International Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-2">
                Trip Type *
              </label>
              <div className="flex gap-2">
                {(["One Way", "Round Trip", "Multi City"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onChange("flight_trip_type", t);
                      if (t === "Round Trip" && !formData.return_date && formData.date) {
                        onChange("return_date", formData.date);
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                      tripType === t
                        ? "bg-[#00c58e] text-white border-[#00c58e] shadow-lg shadow-[#00c58e]/30 font-extrabold"
                        : "bg-[#111c3a] border-white/15 text-slate-300 hover:text-white hover:bg-[#16244a]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer bg-[#111c3a]/90 border border-white/15 rounded-xl px-4 py-2.5 w-full hover:bg-[#16244a] transition">
                <input
                  type="checkbox"
                  checked={Boolean(formData.is_international)}
                  onChange={(e) => onChange("is_international", e.target.checked)}
                  className="w-4 h-4 accent-[#00c58e] rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">International Flight</div>
                  <div className="text-[10px] text-slate-400">Enable passport &amp; visa assistance</div>
                </div>
              </label>
            </div>
          </div>

          {/* Datalists for instant autocomplete */}
          <datalist id="flight-airports-list">
            {POPULAR_AIRPORTS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>

          {/* ======================================================== */}
          {/* TRIP TYPE 1: ONE WAY */}
          {/* ======================================================== */}
          {tripType === "One Way" && (
            <div className="space-y-4 bg-[#0e1730]/70 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-emerald-400" /> One Way Flight Details
                </h3>
                <span className="text-[11px] font-bold text-slate-400">1 Flight Segment</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                {/* FROM */}
                <div className="lg:col-span-5">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                    From (Departure Airport / City) *
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      list="flight-airports-list"
                      placeholder="Select airport or type city (e.g. Bangalore, Delhi)"
                      value={currentFrom}
                      onChange={(e) => handleFromChange(e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                    />
                    <select
                      value={currentFrom}
                      onChange={(e) => handleFromChange(e.target.value)}
                      className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                    >
                      <option value="">-- Quick Select Departure Airport --</option>
                      {POPULAR_AIRPORTS.map((a) => (
                        <option key={a} value={a} className="bg-[#0b1329] text-white">
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.from_airport && (
                    <p className="text-xs text-rose-400 font-medium mt-1">{errors.from_airport}</p>
                  )}
                </div>

                {/* SWAP BUTTON */}
                <div className="lg:col-span-2 flex justify-center pb-2">
                  <button
                    type="button"
                    onClick={swapOutbound}
                    className="p-2.5 bg-[#111c3a] hover:bg-[#1a2c5a] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
                    title="Swap From and To airports"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span className="lg:hidden text-[11px]">Swap Route</span>
                  </button>
                </div>

                {/* TO */}
                <div className="lg:col-span-5">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                    To (Destination / Arrival Airport / City) *
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      list="flight-airports-list"
                      placeholder="Select airport or type ANY destination (e.g. Delhi, Goa, Dubai)"
                      value={currentTo}
                      onChange={(e) => handleToChange(e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                    />
                    <select
                      value={currentTo}
                      onChange={(e) => handleToChange(e.target.value)}
                      className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                    >
                      <option value="">-- Quick Select Arrival Airport --</option>
                      {POPULAR_AIRPORTS.map((a) => (
                        <option key={a} value={a} className="bg-[#0b1329] text-white">
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.to_airport && (
                    <p className="text-xs text-rose-400 font-medium mt-1">{errors.to_airport}</p>
                  )}
                </div>
              </div>

              {/* Quick Destination Pills */}
              <div className="bg-[#111c3a]/60 border border-white/10 rounded-xl p-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Popular Flight Destinations (1-Click Selection):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_DESTINATIONS.map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => handleToChange(d.value)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        currentTo === d.value
                          ? "bg-[#00c58e] text-white border-[#00c58e] shadow-xs"
                          : "bg-[#0b1329] text-slate-300 border-white/15 hover:border-emerald-500 hover:text-white"
                      }`}
                    >
                      ✈️ {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Departure Date *
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={formData.date || ""}
                    onChange={(e) => onChange("date", e.target.value)}
                    className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                  />
                  {errors.date && <p className="text-xs text-rose-400 font-medium mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Preferred Departure Time
                  </label>
                  <select
                    value={formData.preferred_time || ""}
                    onChange={(e) => onChange("preferred_time", e.target.value)}
                    className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                  >
                    {PREFERRED_TIMES.map((time) => (
                      <option key={time} value={time.startsWith("--") ? "" : time} className="bg-[#0b1329]">
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TRIP TYPE 2: ROUND TRIP */}
          {/* ======================================================== */}
          {tripType === "Round Trip" && (
            <div className="space-y-5">
              {/* Route Summary Pill */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-black text-emerald-300">
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    ROUND TRIP
                  </span>
                  <span>
                    {getShortName(currentFrom) || "ORIGIN"} ⇄ {getShortName(currentTo) || "DESTINATION"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-3">
                  <span>
                    🛫 <strong>Outbound:</strong> {formData.date || "Not set"}
                  </span>
                  <span>
                    🛬 <strong>Return:</strong> {formData.return_date || "Not set"}
                  </span>
                </div>
              </div>

              {/* CARD 1: OUTBOUND FLIGHT */}
              <div className="bg-[#0e1730]/80 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    🛫 Outbound Flight (Onward Journey)
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Leg 1
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                  <div className="lg:col-span-5">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                      From (Departure Airport / City) *
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        list="flight-airports-list"
                        placeholder="Select airport or city"
                        value={currentFrom}
                        onChange={(e) => handleFromChange(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                      <select
                        value={currentFrom}
                        onChange={(e) => handleFromChange(e.target.value)}
                        className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                      >
                        <option value="">-- Quick Select Departure Airport --</option>
                        {POPULAR_AIRPORTS.map((a) => (
                          <option key={a} value={a} className="bg-[#0b1329] text-white">
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-center pb-2">
                    <button
                      type="button"
                      onClick={swapOutbound}
                      className="p-2.5 bg-[#111c3a] hover:bg-[#1a2c5a] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
                      title="Swap Outbound route"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      <span className="lg:hidden text-[11px]">Swap</span>
                    </button>
                  </div>

                  <div className="lg:col-span-5">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                      To (Destination / Arrival Airport / City) *
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        list="flight-airports-list"
                        placeholder="Select airport or city"
                        value={currentTo}
                        onChange={(e) => handleToChange(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                      <select
                        value={currentTo}
                        onChange={(e) => handleToChange(e.target.value)}
                        className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                      >
                        <option value="">-- Quick Select Arrival Airport --</option>
                        {POPULAR_AIRPORTS.map((a) => (
                          <option key={a} value={a} className="bg-[#0b1329] text-white">
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Popular Destination Quick Select */}
                <div className="bg-[#111c3a]/60 border border-white/10 rounded-xl p-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                    Popular Destinations (Automatically Configures Round Trip):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_DESTINATIONS.map((d) => (
                      <button
                        key={d.label}
                        type="button"
                        onClick={() => handleToChange(d.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          currentTo === d.value
                            ? "bg-[#00c58e] text-white border-[#00c58e] shadow-xs"
                            : "bg-[#0b1329] text-slate-300 border-white/15 hover:border-emerald-500 hover:text-white"
                        }`}
                      >
                        ✈️ {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Outbound Departure Date *
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={formData.date || ""}
                      onChange={(e) => {
                        onChange("date", e.target.value);
                        // If return date is earlier, bump return date to match
                        if (formData.return_date && formData.return_date < e.target.value) {
                          onChange("return_date", e.target.value);
                        }
                      }}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Outbound Preferred Time
                    </label>
                    <select
                      value={formData.preferred_time || ""}
                      onChange={(e) => onChange("preferred_time", e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                    >
                      {PREFERRED_TIMES.map((time) => (
                        <option key={time} value={time.startsWith("--") ? "" : time} className="bg-[#0b1329]">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CARD 2: RETURN FLIGHT */}
              <div className="bg-[#0e1730]/80 border-2 border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    🛬 Return Flight (Return Journey)
                  </h3>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    Leg 2 (Return)
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                  <div className="lg:col-span-5">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                      From (Return Departure Airport) *
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        list="flight-airports-list"
                        placeholder="Return Departure Airport"
                        value={returnFrom}
                        onChange={(e) => handleReturnFromChange(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                      <select
                        value={returnFrom}
                        onChange={(e) => handleReturnFromChange(e.target.value)}
                        className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                      >
                        <option value="">-- Quick Select Return Departure --</option>
                        {POPULAR_AIRPORTS.map((a) => (
                          <option key={a} value={a} className="bg-[#0b1329] text-white">
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-center pb-2">
                    <button
                      type="button"
                      onClick={swapReturn}
                      className="p-2.5 bg-[#111c3a] hover:bg-[#1a2c5a] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
                      title="Swap Return route"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      <span className="lg:hidden text-[11px]">Swap</span>
                    </button>
                  </div>

                  <div className="lg:col-span-5">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                      To (Return Arrival Airport) *
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        list="flight-airports-list"
                        placeholder="Return Arrival Airport"
                        value={returnTo}
                        onChange={(e) => handleReturnToChange(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                      <select
                        value={returnTo}
                        onChange={(e) => handleReturnToChange(e.target.value)}
                        className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                      >
                        <option value="">-- Quick Select Return Arrival --</option>
                        {POPULAR_AIRPORTS.map((a) => (
                          <option key={a} value={a} className="bg-[#0b1329] text-white">
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-cyan-400" /> Return Date *
                    </label>
                    <input
                      type="date"
                      min={formData.date || today}
                      value={formData.return_date || ""}
                      onChange={(e) => onChange("return_date", e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                    />
                    {errors.return_date && (
                      <p className="text-xs text-rose-400 font-medium mt-1">{errors.return_date}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-cyan-400" /> Return Preferred Time
                    </label>
                    <select
                      value={formData.return_preferred_time || ""}
                      onChange={(e) => onChange("return_preferred_time", e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                    >
                      {PREFERRED_TIMES.map((time) => (
                        <option key={time} value={time.startsWith("--") ? "" : time} className="bg-[#0b1329]">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TRIP TYPE 3: MULTI CITY */}
          {/* ======================================================== */}
          {tripType === "Multi City" && (
            <div className="space-y-5">
              {/* Route Summary Chain Header */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-md border border-emerald-500/40 uppercase">
                      Multi City Route
                    </span>
                    <span className="text-xs text-slate-300 font-bold">
                      {multiCityFlights.length} Flights Connected
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addMultiCityLeg}
                    disabled={multiCityFlights.length >= 6}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Flight Leg
                  </button>
                </div>

                {/* Chain Visualization */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs font-black">
                  {multiCityFlights.map((leg, idx) => (
                    <React.Fragment key={leg.id || idx}>
                      <span className="bg-[#111c3a] text-white px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                        <span className="text-emerald-400 font-extrabold text-[10px]">F{idx + 1}:</span>
                        <span>{getShortName(leg.from) || "From"}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-400" />
                        <span>{getShortName(leg.to) || "To"}</span>
                      </span>
                      {idx < multiCityFlights.length - 1 && (
                        <span className="text-emerald-400 font-bold">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Multi City Legs Cards */}
              <div className="space-y-4">
                {multiCityFlights.map((leg, idx) => (
                  <div
                    key={leg.id || idx}
                    className="bg-[#0e1730]/80 border-2 border-white/15 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 transition"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#00c58e] text-slate-950 font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          Flight {idx + 1}
                          <span className="text-slate-400 font-normal text-xs lowercase">
                            ({getShortName(leg.from) || "origin"} to {getShortName(leg.to) || "destination"})
                          </span>
                        </h4>
                      </div>

                      {multiCityFlights.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeMultiCityLeg(idx)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* FROM */}
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                          From (Departure Airport / City) *
                        </label>
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            list="flight-airports-list"
                            placeholder="Departure Airport or City"
                            value={leg.from}
                            onChange={(e) => updateMultiCityLeg(idx, "from", e.target.value)}
                            className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                          />
                          <select
                            value={leg.from}
                            onChange={(e) => updateMultiCityLeg(idx, "from", e.target.value)}
                            className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                          >
                            <option value="">-- Quick Select Departure Airport --</option>
                            {POPULAR_AIRPORTS.map((a) => (
                              <option key={a} value={a} className="bg-[#0b1329] text-white">
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* TO */}
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                          To (Arrival Airport / City) *
                        </label>
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            list="flight-airports-list"
                            placeholder="Arrival Destination Airport"
                            value={leg.to}
                            onChange={(e) => updateMultiCityLeg(idx, "to", e.target.value)}
                            className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                          />
                          <select
                            value={leg.to}
                            onChange={(e) => updateMultiCityLeg(idx, "to", e.target.value)}
                            className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                          >
                            <option value="">-- Quick Select Arrival Airport --</option>
                            {POPULAR_AIRPORTS.map((a) => (
                              <option key={a} value={a} className="bg-[#0b1329] text-white">
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                          <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Departure Date *
                        </label>
                        <input
                          type="date"
                          min={idx > 0 && multiCityFlights[idx - 1]?.date ? multiCityFlights[idx - 1].date : today}
                          value={leg.date || ""}
                          onChange={(e) => updateMultiCityLeg(idx, "date", e.target.value)}
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                          <Clock className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Preferred Departure Time
                        </label>
                        <select
                          value={leg.preferred_time || ""}
                          onChange={(e) => updateMultiCityLeg(idx, "preferred_time", e.target.value)}
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                        >
                          {PREFERRED_TIMES.map((time) => (
                            <option key={time} value={time.startsWith("--") ? "" : time} className="bg-[#0b1329]">
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Flight Leg Button */}
              {multiCityFlights.length < 6 && (
                <button
                  type="button"
                  onClick={addMultiCityLeg}
                  className="w-full py-3 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500/70 hover:bg-emerald-950/20 rounded-2xl text-emerald-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Another Flight / City Leg ({multiCityFlights.length}/6)
                </button>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* COMMON PREFERENCES: Cabin Class, Airline, Fare */}
          {/* ======================================================== */}
          <div className="bg-[#111c3a]/70 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
              Cabin &amp; Airline Preferences
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                  Cabin Class
                </label>
                <select
                  value={formData.cabin_class || "Economy"}
                  onChange={(e) => onChange("cabin_class", e.target.value)}
                  className="w-full bg-[#0b1329] hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                >
                  {CABIN_CLASSES.map((c) => (
                    <option key={c} value={c} className="bg-[#0b1329]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                  Preferred Airline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. IndiGo / Air India / Akasa / Any"
                  value={formData.preferred_airline || ""}
                  onChange={(e) => onChange("preferred_airline", e.target.value)}
                  className="w-full bg-[#0b1329] hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                  Fare Amount (₹) (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 4850"
                  value={formData.fare_amount || ""}
                  onChange={(e) => onChange("fare_amount", e.target.value)}
                  className="w-full bg-[#0b1329] hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleContinueToPassengers}
              className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 sm:px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-2"
            >
              Continue to Passenger Details →
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* STEP 2: PASSENGERS & BOARDING DETAILS */
        /* ======================================================== */
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Passenger Details
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Number of Passengers:
              </label>
              <select
                value={passengers.length}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="bg-[#111c3a] border border-emerald-500/40 rounded-xl px-3 py-1.5 text-sm font-black text-emerald-300 focus:ring-2 focus:ring-[#00c58e]/20 outline-none shadow-inner [color-scheme:dark]"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} className="bg-[#0b1329] text-white">
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div className="bg-[#111c3a]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-inner">
            <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Passenger Phone Number (Mobile / WhatsApp No.) *
            </label>
            <input
              type="tel"
              maxLength={15}
              placeholder="Enter passenger mobile number (e.g. 9964600247 / 9740463404)"
              value={formData.phone || ""}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full bg-[#0b1329]/90 border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none placeholder:text-slate-500 [color-scheme:dark]"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This phone number will be recorded on the official ticket voucher (e.g. 9964600247 / 9740463404) and used for flight status SMS / WhatsApp dispatch.
            </p>
          </div>

          {/* Passengers List */}
          <div className="space-y-2.5">
            {passengers.map((p, idx) => (
              <div
                key={idx}
                className="bg-[#111c3a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-emerald-400 shrink-0 w-5">
                    {idx + 1}.
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Full Name (as per Aadhaar / Passport)"
                        value={p.name}
                        onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                        className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-[#00c58e] outline-none placeholder:text-slate-500 [color-scheme:dark]"
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
                        className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-[#00c58e] outline-none placeholder:text-slate-500 [color-scheme:dark]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={p.gender}
                        onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                        className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-[#00c58e] outline-none [color-scheme:dark]"
                      >
                        <option className="bg-[#0b1329]">Male</option>
                        <option className="bg-[#0b1329]">Female</option>
                        <option className="bg-[#0b1329]">Child</option>
                      </select>
                    </div>
                  </div>
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
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
          <div className="bg-[#111c3a]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block">
              Boarding Details (for airport assistance / driver pickup)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                  Boarding Point *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Terminal 1, Gate 3 / Residence / Office"
                  value={formData.boarding_point || ""}
                  onChange={(e) => onChange("boarding_point", e.target.value)}
                  className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#00c58e] [color-scheme:dark] placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                  Full Boarding Address *
                </label>
                <input
                  type="text"
                  placeholder="Full address / landmark for pickup"
                  value={formData.boarding_address || ""}
                  onChange={(e) => onChange("boarding_address", e.target.value)}
                  className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#00c58e] [color-scheme:dark] placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Ticket Fare Amount Card */}
          <div className="bg-[#111c3a]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block">
                Ticket Fare Amount
              </span>
              <p className="text-xs text-slate-400">
                Fare amount to be printed on the official flight ticket copy.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300 whitespace-nowrap">
                Fare Amount (₹):
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 4850"
                value={formData.fare_amount || ""}
                onChange={(e) => onChange("fare_amount", e.target.value)}
                className="w-36 bg-[#0b1329] border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-black text-emerald-300 focus:ring-2 focus:ring-[#00c58e]/30 outline-none shadow-inner [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setFlightStep("JOURNEY")}
              className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
            >
              ← Back to Flight Details
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-8 sm:px-10 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-102 active:scale-98 disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? "Processing..." : "CONTINUE TO PAYMENT CHOICE →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
