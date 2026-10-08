import React, { useEffect, useState } from "react";
import {
  Palmtree,
  Calendar,
  Users,
  Plus,
  Trash2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Star,
  Hotel,
  Car,
  CheckCircle2,
} from "lucide-react";
import { calculateTourFare, FareCalculationResult } from "@/lib/fare-engine";
import { packages } from "@/data/packages";

interface TourBookingFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  onFareCalculated?: (result: FareCalculationResult) => void;
  errors?: Record<string, string>;
  onCompleteBooking?: () => void;
  isSubmitting?: boolean;
  onBackToServices?: () => void;
  initialStep?: "PACKAGE" | "JOURNEY";
}

const HOTEL_TIERS = [
  { id: "Budget", desc: "Budget / Dormitory — Included in base" },
  { id: "Standard", desc: "3-Star / Standard Hotel" },
  { id: "Deluxe", desc: "4-Star / Deluxe Hotel" },
  { id: "Premium", desc: "5-Star / Premium Resort" },
];

const VEHICLE_OPTIONS = [
  { slug: "sedan", name: "Sedan / Dzire" },
  { slug: "suv", name: "Ertiga / SUV" },
  { slug: "innova", name: "Innova Crysta" },
  { slug: "tempo", name: "Tempo Traveller" },
];

export function TourBookingForm({
  formData,
  onChange,
  onFareCalculated,
  errors = {},
  onCompleteBooking,
  isSubmitting = false,
  onBackToServices,
  initialStep,
}: TourBookingFormProps) {
  // Step 1: "PACKAGE" (Select curated package) | Step 2: "JOURNEY" (Journey Type, route, vehicle & hotel preferences)
  const [tourStep, setTourStep] = useState<"PACKAGE" | "JOURNEY">(
    initialStep || "PACKAGE"
  );

  const tripType = formData.tour_trip_type || "Round Trip";
  const destinations: string[] =
    formData.itinerary_places || ["Bangalore", "Destination 1", "Return to Bangalore"];
  const adults = Number(formData.adults || 2);
  const children = Number(formData.children || 0);
  const infants = Number(formData.infants || 0);

  const selectedPkg = packages.find((p) => p.slug === formData.package_slug) || packages[0];

  // Recalculate fare whenever tour params change
  useEffect(() => {
    if (selectedPkg && onFareCalculated) {
      const result = calculateTourFare({
        packageTitle: selectedPkg.title,
        basePackagePrice: selectedPkg.startingPrice || 4999,
        adults,
        children,
        infants,
        vehicleSlug: formData.vehicle_slug || "sedan",
        hotelTier: formData.hotel_tier as any,
        days: Number(formData.number_of_days || 2),
        discount: Number(formData.discount || 0),
        advanceAmount: formData.advance_option === 0 ? 0 : 100,
      });
      onFareCalculated(result);
    }
  }, [
    formData.package_slug,
    adults,
    children,
    infants,
    formData.vehicle_slug,
    formData.hotel_tier,
    formData.number_of_days,
    formData.discount,
    formData.advance_option,
  ]);

  const addDestination = () =>
    onChange("itinerary_places", [...destinations, "New Destination"]);
  const updateDestination = (i: number, val: string) => {
    const updated = [...destinations];
    updated[i] = val;
    onChange("itinerary_places", updated);
  };
  const removeDestination = (i: number) => {
    if (destinations.length <= 2) return;
    onChange("itinerary_places", destinations.filter((_, idx) => idx !== i));
  };

  const indianPackages = packages.slice(0, 16);

  return (
    <div className="space-y-6 text-white">
      {/* ================= STEP INDICATOR TABS ================= */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="inline-flex rounded-full border border-white/15 bg-[#111c3a]/90 p-1.5 gap-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => setTourStep("PACKAGE")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              tourStep === "PACKAGE"
                ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30 font-black"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                tourStep === "PACKAGE" ? "bg-white text-[#0B132B]" : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {tourStep === "JOURNEY" ? "✓" : "1"}
            </span>
            <span>1. Select Package</span>
          </button>

          <button
            type="button"
            onClick={() => setTourStep("JOURNEY")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              tourStep === "JOURNEY"
                ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30 font-black"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                tourStep === "JOURNEY" ? "bg-white text-[#0B132B]" : "bg-white/10 text-slate-300"
              }`}
            >
              2
            </span>
            <span>2. Journey Type &amp; Route</span>
          </button>
        </div>

        {tourStep === "JOURNEY" && (
          <button
            type="button"
            onClick={() => {
              setTourStep("PACKAGE");
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Packages
          </button>
        )}
      </div>

      {/* ================= PAGE 1: SELECT YOUR TOUR PACKAGE ================= */}
      {tourStep === "PACKAGE" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-emerald-400" /> SELECT YOUR TOUR PACKAGE
            </h3>
            <p className="text-xs text-slate-400">
              Choose a curated South India holiday package or customize your trip.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[440px] overflow-y-auto pr-1">
            {indianPackages.map((pkg) => {
              const isSelected = (formData.package_slug || selectedPkg?.slug) === pkg.slug;
              return (
                <button
                  key={pkg.slug}
                  type="button"
                  onClick={() => {
                    onChange("package_slug", pkg.slug);
                    onChange("package_title", pkg.title);
                    onChange("number_of_days", pkg.duration.split(" ")[0]);
                    onChange("destination", pkg.destinations.join(" → "));
                  }}
                  className={`text-left rounded-2xl border overflow-hidden transition-all bg-[#111c3a]/80 shadow-inner group cursor-pointer ${
                    isSelected
                      ? "border-[#00c58e] ring-2 ring-[#00c58e]/30 bg-[#162544]/95 shadow-xl shadow-black/40 scale-[1.01]"
                      : "border-white/10 hover:border-white/25 hover:bg-[#111c3a]"
                  }`}
                >
                  <div className="relative h-28 bg-[#0b1329] overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-[#0b1329]/40 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      <div className="text-sm font-extrabold text-white leading-tight drop-shadow-sm">
                        {pkg.title}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#00c58e] text-white rounded-full p-1 shadow-xs flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-white text-[#00c58e]" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-slate-300">
                        {pkg.duration}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {pkg.destinations.slice(0, 2).join(" · ")}
                        {pkg.destinations.length > 2 && ` +${pkg.destinations.length - 2}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">from</span>
                      <div className="text-sm font-black text-emerald-400">
                        ₹{(pkg.startingPrice || 4999).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.package_slug && (
            <p className="text-xs text-rose-400 font-medium mt-1">{errors.package_slug}</p>
          )}

          {/* Bottom Action Bar on Step 1 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 bg-[#111c3a]/80 p-4 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {selectedPkg && (
                <>
                  <img
                    src={selectedPkg.image}
                    alt={selectedPkg.title}
                    className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow-inner shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                      Selected Package
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-white mt-0.5">
                      {selectedPkg.title}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {selectedPkg.duration} · From ₹
                      {(selectedPkg.startingPrice || 4999).toLocaleString("en-IN")}
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (!formData.package_slug && selectedPkg) {
                  onChange("package_slug", selectedPkg.slug);
                  onChange("package_title", selectedPkg.title);
                  onChange("number_of_days", selectedPkg.duration.split(" ")[0]);
                  onChange("destination", selectedPkg.destinations.join(" → "));
                }
                setTourStep("JOURNEY");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 sm:px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <span>CONTINUE TO JOURNEY TYPE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= PAGE 2: JOURNEY TYPE & TRIP DETAILS ================= */}
      {tourStep === "JOURNEY" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Selected Package Banner with Quick Switch */}
          {selectedPkg && (
            <div className="bg-[#111c3a]/90 border border-white/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPkg.image}
                  alt={selectedPkg.title}
                  className="w-14 h-14 rounded-xl object-cover border border-white/15 shadow-inner shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                      Selected Itinerary
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {selectedPkg.duration}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                    {selectedPkg.title}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {selectedPkg.destinations.join(" · ")} · Starting from{" "}
                    <span className="text-emerald-400 font-bold">
                      ₹{(selectedPkg.startingPrice || 4999).toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTourStep("PACKAGE");
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className="self-start sm:self-center text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-xl transition shadow-sm cursor-pointer shrink-0"
              >
                Change Package
              </button>
            </div>
          )}

          {/* Section 1: Journey Type (One Way | Round Trip) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block">
              Journey Type
            </label>
            <div className="inline-flex rounded-xl border border-white/15 bg-[#111c3a]/90 p-1 gap-1 shadow-inner w-full sm:w-auto">
              {["One Way", "Round Trip"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange("tour_trip_type", t)}
                  className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    tripType === t
                      ? "bg-[#00c58e] text-white font-extrabold shadow-md shadow-[#00c58e]/30"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Itinerary Builder ("Your Tour Route") */}
          <div className="bg-[#111c3a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Your Tour Route
              </span>
              <button
                type="button"
                onClick={addDestination}
                className="text-xs font-bold text-emerald-300 flex items-center gap-1 bg-emerald-950/60 hover:bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Place
              </button>
            </div>

            <div className="space-y-2">
              {destinations.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0b1329] border border-emerald-500/40 flex items-center justify-center text-[10px] font-extrabold text-emerald-300 shrink-0">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={d}
                    onChange={(e) => updateDestination(idx, e.target.value)}
                    className="flex-1 bg-[#0b1329]/90 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-[#00c58e] outline-none [color-scheme:dark]"
                  />
                  {destinations.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeDestination(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      title="Remove place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-300">Route:</span>
              {destinations.map((d, i) => (
                <React.Fragment key={i}>
                  <span className="bg-[#0b1329] border border-white/15 px-2.5 py-0.5 rounded text-emerald-300 font-semibold shadow-inner">
                    {d}
                  </span>
                  {i < destinations.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Section 3: Travel Date & Trip Duration */}
          <div className="space-y-4 bg-[#111c3a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> SCHEDULE &amp; TRIP DURATION
              </span>
              <span className="text-[11px] font-extrabold text-emerald-300 bg-[#0b1329] px-3.5 py-1 rounded-full border border-emerald-500/30 shadow-inner">
                {Number(formData.number_of_days || 2)} Days · {Math.max(0, Number(formData.number_of_days || 2) - 1)} Nights
              </span>
            </div>

            {/* Quick Trip Days Selection Buttons */}
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-2">
                Select Days of Trip (Quick Buttons)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { days: 1, label: "1 Day (Same Day)" },
                  { days: 2, label: "2 Days (1N)" },
                  { days: 3, label: "3 Days (2N)" },
                  { days: 4, label: "4 Days (3N)" },
                  { days: 5, label: "5 Days (4N)" },
                  { days: 6, label: "6 Days (5N)" },
                  { days: 7, label: "7 Days (6N)" },
                  { days: 10, label: "10 Days (9N)" },
                ].map((item) => {
                  const isSelected = Number(formData.number_of_days || 2) === item.days;
                  return (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => onChange("number_of_days", item.days)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#00c58e] text-white font-black shadow-lg shadow-[#00c58e]/30 scale-105 border border-[#00c58e]"
                          : "bg-[#0b1329] border border-white/15 text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Travel Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.date || ""}
                  onChange={(e) => onChange("date", e.target.value)}
                  className="w-full bg-[#0b1329]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                />
                {errors.date && (
                  <p className="text-xs text-rose-400 font-medium mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                  Select Days of Trip (Dropdown)
                </label>
                <select
                  value={String(formData.number_of_days || 2)}
                  onChange={(e) => onChange("number_of_days", Number(e.target.value))}
                  className="w-full bg-[#0b1329]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                >
                  <option value="1" className="bg-[#0b1329] text-white">1 Day (Same Day Return)</option>
                  <option value="2" className="bg-[#0b1329] text-white">2 Days · 1 Night</option>
                  <option value="3" className="bg-[#0b1329] text-white">3 Days · 2 Nights</option>
                  <option value="4" className="bg-[#0b1329] text-white">4 Days · 3 Nights</option>
                  <option value="5" className="bg-[#0b1329] text-white">5 Days · 4 Nights</option>
                  <option value="6" className="bg-[#0b1329] text-white">6 Days · 5 Nights</option>
                  <option value="7" className="bg-[#0b1329] text-white">7 Days · 6 Nights</option>
                  <option value="8" className="bg-[#0b1329] text-white">8 Days · 7 Nights</option>
                  <option value="9" className="bg-[#0b1329] text-white">9 Days · 8 Nights</option>
                  <option value="10" className="bg-[#0b1329] text-white">10 Days · 9 Nights</option>
                  <option value="12" className="bg-[#0b1329] text-white">12 Days · 11 Nights</option>
                  <option value="14" className="bg-[#0b1329] text-white">14 Days · 13 Nights</option>
                  <option value="15" className="bg-[#0b1329] text-white">15 Days · 14 Nights</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                  Calculated Duration
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${Number(formData.number_of_days || 2)} Days (${Math.max(0, Number(formData.number_of_days || 2) - 1)} Nights)`}
                  className="w-full bg-[#0b1329]/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-emerald-300 cursor-not-allowed shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Group Members */}
          <div className="bg-[#111c3a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> GROUP MEMBERS
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "adults", label: "Adults", sub: "(12+ yrs)" },
                { key: "children", label: "Children", sub: "(2–11 yrs)" },
                { key: "infants", label: "Infants", sub: "(0–2 yrs)" },
              ].map(({ key, label, sub }) => (
                <div key={key} className="text-center">
                  <div className="text-xs font-bold text-white mb-0.5">{label}</div>
                  <div className="text-[11px] text-slate-400 mb-2">{sub}</div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          key,
                          Math.max(
                            key === "adults" ? 1 : 0,
                            Number(formData[key] || (key === "adults" ? 2 : 0)) - 1
                          )
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-[#0b1329] border border-white/15 text-white font-bold text-lg flex items-center justify-center hover:bg-[#16244a] shadow-inner cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-black text-lg text-white">
                      {formData[key] || (key === "adults" ? 2 : 0)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          key,
                          Number(formData[key] || (key === "adults" ? 2 : 0)) + 1
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-[#0b1329] border border-white/15 text-white font-bold text-lg flex items-center justify-center hover:bg-[#16244a] shadow-inner cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Vehicle Preference & Hotel Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-400" /> Vehicle Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_OPTIONS.map((v) => (
                  <button
                    key={v.slug}
                    type="button"
                    onClick={() => onChange("vehicle_slug", v.slug)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      (formData.vehicle_slug || "sedan") === v.slug
                        ? "bg-[#00c58e] text-white border-[#00c58e] shadow-md shadow-[#00c58e]/30 font-extrabold"
                        : "bg-[#0b1329] border-white/15 text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <Hotel className="w-3.5 h-3.5 text-emerald-400" /> Hotel / Stay Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HOTEL_TIERS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => onChange("hotel_tier", h.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-left px-3 cursor-pointer ${
                      (formData.hotel_tier || "Standard") === h.id
                        ? "bg-[#00c58e] text-white border-[#00c58e] shadow-md shadow-[#00c58e]/30 font-extrabold"
                        : "bg-[#0b1329] border-white/15 text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div>{h.id}</div>
                    <div
                      className={`text-[10px] font-normal ${
                        (formData.hotel_tier || "Standard") === h.id
                          ? "text-emerald-100"
                          : "text-slate-400"
                      }`}
                    >
                      {h.desc.split(" — ")[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Bottom Action Bar on Step 2 (Journey Type) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setTourStep("PACKAGE");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-4 py-3 rounded-xl transition shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Packages
            </button>

            {onCompleteBooking && (
              <button
                type="button"
                onClick={onCompleteBooking}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 sm:px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-102 active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Generating Ticket..." : "CONTINUE TO BOOKING →"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
