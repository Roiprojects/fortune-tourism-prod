import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  X,
  Car,
  IndianRupee,
  Save,
  RotateCcw,
  CheckCircle,
  Search,
  Sparkles,
  Sliders,
  ShieldCheck,
  Star,
  Users,
  Luggage,
  Info,
} from "lucide-react";
import {
  DEFAULT_FLEET_OPTIONS,
  FleetTariff,
  FleetPricingConfig,
  getSavedFleetPricing,
  saveFleetPricing,
  resetFleetPricingToDefaults,
} from "@/lib/fleet-tariffs";

interface CarFareEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function CarFareEditorModal({
  isOpen,
  onClose,
  onSaved,
}: CarFareEditorModalProps) {
  const [config, setConfig] = useState<FleetPricingConfig>(() =>
    getSavedFleetPricing()
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("hatchback");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfig(getSavedFleetPricing());
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtered vehicles list
  const vehicleList = DEFAULT_FLEET_OPTIONS.map((def) => {
    return config.vehicles[def.id] || def;
  }).filter((v) => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCat = v.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }
    if (activeCategory === "SEDAN") {
      return v.id.includes("sedan") || v.id === "hatchback";
    }
    if (activeCategory === "SUV") {
      return v.id.includes("suv") || v.id.includes("innova");
    }
    if (activeCategory === "BUS") {
      return v.id.includes("tempo") || v.id.includes("bus");
    }
    return true;
  });

  const selectedVehicle =
    config.vehicles[selectedVehicleId] ||
    DEFAULT_FLEET_OPTIONS.find((v) => v.id === selectedVehicleId) ||
    DEFAULT_FLEET_OPTIONS[0];

  const updateVehicleFare = (
    id: string,
    field: keyof FleetTariff,
    val: number | string
  ) => {
    const num = Number(val);
    setConfig((prev) => {
      const current = prev.vehicles[id] || {
        ...DEFAULT_FLEET_OPTIONS.find((v) => v.id === id)!,
      };
      return {
        ...prev,
        vehicles: {
          ...prev.vehicles,
          [id]: {
            ...current,
            [field]: isNaN(num) ? 0 : num,
          },
        },
      };
    });
  };

  const updateLuggageRate = (val: string) => {
    const num = Number(val);
    setConfig((prev) => ({
      ...prev,
      roofLuggageRate: isNaN(num) ? 0 : num,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveFleetPricing(config);
      toast.success(
        "Car fares updated successfully! New rates are now active across the booking page."
      );
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save car fares");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all vehicle fares to system defaults?"
      )
    ) {
      resetFleetPricingToDefaults();
      setConfig(getSavedFleetPricing());
      toast.info("All vehicle fares reset to default rates.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0B132B] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0e1a38] via-[#12224d] to-[#0e1a38]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Car Fare Edit
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Live Cab Tariffs
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Edit vehicle fleet base fares &amp; tariffs. Updates reflect instantly on the customer booking page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toolbar & Filter */}
        <div className="p-4 sm:px-6 bg-[#091024] border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {[
              { id: "ALL", label: "All Vehicles (8)" },
              { id: "SEDAN", label: "Hatchback & Sedans" },
              { id: "SUV", label: "SUVs & Innova" },
              { id: "BUS", label: "Tempo & Buses" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-[#00c58e] text-white shadow-sm font-black"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Roof Luggage Carrier Extra input */}
          <div className="flex items-center gap-2 bg-[#111c3a] border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs w-full sm:w-auto justify-between sm:justify-start">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold whitespace-nowrap">
              <Luggage className="w-3.5 h-3.5 text-emerald-400" />
              Roof Carrier Add-on:
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-emerald-300">
              <span>+₹</span>
              <input
                type="number"
                min="0"
                value={config.roofLuggageRate}
                onChange={(e) => updateLuggageRate(e.target.value)}
                className="w-16 bg-[#0b1329] border border-white/20 rounded px-1.5 py-0.5 text-xs font-black text-emerald-300 text-center outline-none focus:border-[#00c58e]"
              />
            </div>
          </div>
        </div>

        {/* Modal Main Content: Left Vehicle List & Right Detail Editor */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Quick Vehicles Cards Grid */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-1">
              Select Vehicle to Edit Fare ({vehicleList.length})
            </span>
            {vehicleList.map((v) => {
              const isSelected = selectedVehicleId === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[#162544] border-[#00c58e] ring-2 ring-[#00c58e]/30 shadow-lg"
                      : "bg-[#111c3a]/75 border-white/10 hover:border-white/25 hover:bg-[#111c3a]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-11 bg-white/95 rounded-xl p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                      <img
                        src={v.image}
                        alt={v.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                          {v.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                          <Users className="w-2.5 h-2.5" /> {v.seats}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {v.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                      One Way Fare
                    </span>
                    <span className="font-mono font-black text-sm sm:text-base text-[#00c58e]">
                      ₹{v.basePriceOneWay.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full Pricing Editor Card for Selected Vehicle */}
          <div className="lg:col-span-7 bg-[#111c3a]/90 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-5 shadow-inner">
            {/* Vehicle Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 bg-white/95 rounded-xl p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                  <img
                    src={selectedVehicle.image}
                    alt={selectedVehicle.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {selectedVehicle.name}
                    </h3>
                    <span className="bg-[#0B132B] text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      {selectedVehicle.rating} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    </span>
                    <span className="bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" /> {selectedVehicle.seats} Seater
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedVehicle.category}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Category ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {selectedVehicle.id}
                </span>
              </div>
            </div>

            {/* Primary Highlighted: One Way Fare (from the screenshot) */}
            <div className="bg-[#162544] border-2 border-emerald-500/50 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Primary One Way Fare Amount (₹)
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  This is the prominent price shown on the frontend vehicle cards in cab bookings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-300">₹</span>
                <input
                  type="number"
                  min="0"
                  value={selectedVehicle.basePriceOneWay}
                  onChange={(e) =>
                    updateVehicleFare(
                      selectedVehicle.id,
                      "basePriceOneWay",
                      e.target.value
                    )
                  }
                  className="w-32 sm:w-36 bg-[#0b1329] border border-emerald-400 rounded-xl px-3 py-2 text-base sm:text-lg font-black text-emerald-300 focus:ring-2 focus:ring-[#00c58e]/40 outline-none text-right font-mono [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Additional Trip Type Tariffs Grid */}
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Additional Trip Types &amp; Hourly Packages
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Round Trip Base Fare */}
                <div className="bg-[#0b1329]/80 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-white block">
                      Round Trip Base (₹)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Outstation 2-way trip
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={selectedVehicle.basePriceRoundTrip}
                    onChange={(e) =>
                      updateVehicleFare(
                        selectedVehicle.id,
                        "basePriceRoundTrip",
                        e.target.value
                      )
                    }
                    className="w-24 bg-[#111c3a] border border-white/20 rounded-lg px-2.5 py-1 text-xs font-black text-white text-right font-mono outline-none focus:border-[#00c58e]"
                  />
                </div>

                {/* Airport Transfer Flat Fare */}
                <div className="bg-[#0b1329]/80 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-white block">
                      Airport Transfer (₹)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Pickup / Drop flat rate
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={selectedVehicle.basePriceAirport}
                    onChange={(e) =>
                      updateVehicleFare(
                        selectedVehicle.id,
                        "basePriceAirport",
                        e.target.value
                      )
                    }
                    className="w-24 bg-[#111c3a] border border-white/20 rounded-lg px-2.5 py-1 text-xs font-black text-white text-right font-mono outline-none focus:border-[#00c58e]"
                  />
                </div>

                {/* Local 4hr / 40km */}
                <div className="bg-[#0b1329]/80 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-white block">
                      Local 4 Hr / 40 Km (₹)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Half day city rental
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={selectedVehicle.basePriceLocal4hr}
                    onChange={(e) =>
                      updateVehicleFare(
                        selectedVehicle.id,
                        "basePriceLocal4hr",
                        e.target.value
                      )
                    }
                    className="w-24 bg-[#111c3a] border border-white/20 rounded-lg px-2.5 py-1 text-xs font-black text-white text-right font-mono outline-none focus:border-[#00c58e]"
                  />
                </div>

                {/* Local 8hr / 80km */}
                <div className="bg-[#0b1329]/80 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-white block">
                      Local 8 Hr / 80 Km (₹)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Full day city package
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={selectedVehicle.basePriceLocal8hr}
                    onChange={(e) =>
                      updateVehicleFare(
                        selectedVehicle.id,
                        "basePriceLocal8hr",
                        e.target.value
                      )
                    }
                    className="w-24 bg-[#111c3a] border border-white/20 rounded-lg px-2.5 py-1 text-xs font-black text-white text-right font-mono outline-none focus:border-[#00c58e]"
                  />
                </div>

                {/* Local 12hr / 120km */}
                <div className="bg-[#0b1329]/80 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-white block">
                      Local 12 Hr / 120 Km (₹)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Extended day package
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={selectedVehicle.basePriceLocal12hr}
                    onChange={(e) =>
                      updateVehicleFare(
                        selectedVehicle.id,
                        "basePriceLocal12hr",
                        e.target.value
                      )
                    }
                    className="w-24 bg-[#111c3a] border border-white/20 rounded-lg px-2.5 py-1 text-xs font-black text-white text-right font-mono outline-none focus:border-[#00c58e]"
                  />
                </div>

                {/* Extra KM Rate */}
                <div className="bg-[#0b1329]/80 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-white block">
                      Extra Km Rate (₹/km)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Post-limit distance charge
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={selectedVehicle.postLimitRate}
                    onChange={(e) =>
                      updateVehicleFare(
                        selectedVehicle.id,
                        "postLimitRate",
                        e.target.value
                      )
                    }
                    className="w-24 bg-[#111c3a] border border-white/20 rounded-lg px-2.5 py-1 text-xs font-black text-white text-right font-mono outline-none focus:border-[#00c58e]"
                  />
                </div>
              </div>
            </div>

            {/* Included Features Info Banner */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Standard base fares include <strong>145 Kms</strong> allowance and driver allowance.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#091024] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset to Defaults
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto text-xs font-bold text-slate-300 hover:text-white px-5 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-1/2 sm:w-auto bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#00c58e]/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving Rates..." : "Save Car Fares"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
