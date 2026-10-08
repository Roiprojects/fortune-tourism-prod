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
    <div className="space-y-6">
      {/* ================= STEP INDICATOR TABS ================= */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setTourStep("PACKAGE")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tourStep === "PACKAGE"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                tourStep === "PACKAGE" ? "bg-white text-purple-700" : "bg-purple-600 text-white"
              }`}
            >
              {tourStep === "JOURNEY" ? "✓" : "1"}
            </span>
            <span>1. Select Package</span>
          </button>

          <span className="text-slate-300 font-bold">→</span>

          <button
            type="button"
            onClick={() => setTourStep("JOURNEY")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tourStep === "JOURNEY"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                tourStep === "JOURNEY" ? "bg-white text-purple-700" : "bg-slate-300 text-slate-700"
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
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Packages
          </button>
        )}
      </div>

      {/* ================= PAGE 1: SELECT YOUR TOUR PACKAGE ================= */}
      {tourStep === "PACKAGE" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-purple-600" /> SELECT YOUR TOUR PACKAGE
            </h3>
            <p className="text-xs text-slate-500">
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
                  className={`text-left rounded-2xl border overflow-hidden transition-all bg-white shadow-2xs group cursor-pointer ${
                    isSelected
                      ? "border-purple-500 ring-2 ring-purple-500/40 shadow-md scale-[1.01]"
                      : "border-slate-200 hover:border-purple-300 hover:shadow-xs"
                  }`}
                >
                  <div className="relative h-28 bg-slate-100 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      <div className="text-sm font-extrabold text-white leading-tight drop-shadow-sm">
                        {pkg.title}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1 shadow-xs flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-white text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600">
                        {pkg.duration}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        {pkg.destinations.slice(0, 2).join(" · ")}
                        {pkg.destinations.length > 2 && ` +${pkg.destinations.length - 2}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">from</span>
                      <div className="text-sm font-black text-purple-700">
                        ₹{(pkg.startingPrice || 4999).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.package_slug && (
            <p className="text-xs text-red-600 font-medium mt-1">{errors.package_slug}</p>
          )}

          {/* Bottom Action Bar on Step 1 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {selectedPkg && (
                <>
                  <img
                    src={selectedPkg.image}
                    alt={selectedPkg.title}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Selected Package
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                      {selectedPkg.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black px-8 py-3.5 rounded-xl uppercase text-xs tracking-wider shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
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
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-slate-50 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPkg.image}
                  alt={selectedPkg.title}
                  className="w-14 h-14 rounded-xl object-cover border border-purple-200 shadow-2xs shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded border border-purple-200">
                      Selected Itinerary
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {selectedPkg.duration}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    {selectedPkg.title}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {selectedPkg.destinations.join(" · ")} · Starting from ₹
                    {(selectedPkg.startingPrice || 4999).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTourStep("PACKAGE");
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className="self-start sm:self-center text-xs font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 border border-purple-300 px-3.5 py-1.5 rounded-xl transition shadow-2xs cursor-pointer shrink-0"
              >
                Change Package
              </button>
            </div>
          )}

          {/* Section 1: Journey Type (One Way | Round Trip) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Journey Type</label>
            <div className="flex gap-2">
              {["One Way", "Round Trip"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange("tour_trip_type", t)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    tripType === t
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Itinerary Builder ("Your Tour Route") */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-600" /> Your Tour Route
              </span>
              <button
                type="button"
                onClick={addDestination}
                className="text-xs font-bold text-purple-800 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Place
              </button>
            </div>

            <div className="space-y-2">
              {destinations.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-extrabold text-purple-700 shrink-0">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={d}
                    onChange={(e) => updateDestination(idx, e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  {destinations.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeDestination(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Remove place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-700">Route:</span>
              {destinations.map((d, i) => (
                <React.Fragment key={i}>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-purple-800 font-semibold shadow-2xs">
                    {d}
                  </span>
                  {i < destinations.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Section 3: Travel Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-600" /> Travel Date *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.date || ""}
                onChange={(e) => onChange("date", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              {errors.date && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Number of Days
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.number_of_days || 2}
                onChange={(e) => onChange("number_of_days", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Number of Nights
              </label>
              <input
                type="number"
                readOnly
                value={Math.max(0, Number(formData.number_of_days || 2) - 1)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Section 4: Group Members */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> GROUP MEMBERS
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "adults", label: "Adults", sub: "(12+ yrs)" },
                { key: "children", label: "Children", sub: "(2–11 yrs)" },
                { key: "infants", label: "Infants", sub: "(0–2 yrs)" },
              ].map(({ key, label, sub }) => (
                <div key={key} className="text-center">
                  <div className="text-xs font-bold text-slate-800 mb-0.5">{label}</div>
                  <div className="text-[11px] text-slate-500 mb-2">{sub}</div>
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
                      className="w-8 h-8 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-lg flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-black text-lg text-slate-900">
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
                      className="w-8 h-8 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-lg flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
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
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-600" /> Vehicle Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_OPTIONS.map((v) => (
                  <button
                    key={v.slug}
                    type="button"
                    onClick={() => onChange("vehicle_slug", v.slug)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      (formData.vehicle_slug || "sedan") === v.slug
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Hotel className="w-3.5 h-3.5 text-purple-600" /> Hotel / Stay Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HOTEL_TIERS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => onChange("hotel_tier", h.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-left px-3 cursor-pointer ${
                      (formData.hotel_tier || "Standard") === h.id
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div>{h.id}</div>
                    <div
                      className={`text-[10px] font-normal ${
                        (formData.hotel_tier || "Standard") === h.id
                          ? "text-purple-100"
                          : "text-slate-500"
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setTourStep("PACKAGE");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" /> Back to Packages
            </button>

            {onCompleteBooking && (
              <button
                type="button"
                onClick={onCompleteBooking}
                disabled={isSubmitting}
                className="w-full sm:w-auto relative overflow-hidden text-white font-black px-8 py-3.5 rounded-xl uppercase text-sm shadow-md transition-all hover:scale-105 disabled:opacity-60 group flex items-center justify-center min-w-[280px] cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: "url('/images/booking-btn-bg.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-0" />
                <span className="relative z-10 drop-shadow-md tracking-wider">
                  {isSubmitting ? "Generating Ticket..." : "CONTINUE TO BOOKING →"}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
