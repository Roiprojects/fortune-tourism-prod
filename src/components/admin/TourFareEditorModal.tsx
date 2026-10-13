import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  X,
  Palmtree,
  IndianRupee,
  Save,
  RotateCcw,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle,
  Tag,
  Filter,
} from "lucide-react";
import { packages as defaultPackages } from "@/data/packages";
import {
  getSavedTourTariffs,
  saveTourTariffs,
  resetTourTariffsToDefaults,
} from "@/lib/tour-tariffs";

interface TourFareEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function TourFareEditorModal({
  isOpen,
  onClose,
  onSaved,
}: TourFareEditorModalProps) {
  const [tariffs, setTariffs] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedTourTariffs();
      const initial: Record<string, number> = {};
      defaultPackages.forEach((pkg) => {
        initial[pkg.slug] = saved[pkg.slug] ?? (pkg.startingPrice || 4999);
      });
      setTariffs(initial);
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

  const updatePrice = (slug: string, val: string) => {
    const num = Number(val);
    setTariffs((prev) => ({
      ...prev,
      [slug]: isNaN(num) ? 0 : num,
    }));
  };

  const filteredPackages = defaultPackages.filter((pkg) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = pkg.title.toLowerCase().includes(q);
      const matchFrom = (pkg.from || "").toLowerCase().includes(q);
      const matchDest = (pkg.destinations || []).some((d) =>
        d.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchFrom && !matchDest) return false;
    }

    // Duration filter
    if (durationFilter === "1") {
      const d = (pkg.duration || "").toLowerCase();
      return d.includes("1 day") || d.startsWith("1");
    }
    if (durationFilter === "2") {
      const d = (pkg.duration || "").toLowerCase();
      return d.includes("2 day") || d.startsWith("2");
    }
    if (durationFilter === "3") {
      const d = (pkg.duration || "").toLowerCase();
      return d.includes("3 day") || d.startsWith("3");
    }
    if (durationFilter === "4") {
      const d = (pkg.duration || "").toLowerCase();
      return d.includes("4 day") || d.startsWith("4");
    }
    if (durationFilter === "5+") {
      const num = parseInt((pkg.duration || "").split(" ")[0], 10);
      return !isNaN(num) && num >= 5;
    }

    return true;
  });

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveTourTariffs(tariffs);
      toast.success(
        "Tour package fares updated successfully! New rates are now active across the booking page."
      );
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save tour tariffs");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all tour package starting fares to system defaults?"
      )
    ) {
      resetTourTariffsToDefaults();
      const initial: Record<string, number> = {};
      defaultPackages.forEach((pkg) => {
        initial[pkg.slug] = pkg.startingPrice || 4999;
      });
      setTariffs(initial);
      toast.info("All tour package starting fares reset to defaults.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0B132B] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0e1a38] via-[#1a1236] to-[#0e1a38]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
              <Palmtree className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Tour Fare Edit
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-full">
                  26 Packages Available
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Edit starting prices for all South India holiday packages. Changes update live in the booking flow.
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

        {/* Search & Filter Bar */}
        <div className="p-4 sm:px-6 bg-[#091024] border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search package or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111c3a] border border-white/15 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-purple-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Trip Duration Dropdown */}
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="bg-[#111c3a] text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 focus:border-purple-400 outline-none cursor-pointer [color-scheme:dark] shrink-0"
            >
              <option value="ALL">✨ All Durations (26)</option>
              <option value="1">⚡ 1 Day (Same Day)</option>
              <option value="2">🌿 2 Days (1 Night)</option>
              <option value="3">🌄 3 Days (2 Nights)</option>
              <option value="4">🏖️ 4 Days (3 Nights)</option>
              <option value="5+">🌟 5+ Days (Extended)</option>
            </select>

            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: "ALL", label: "All" },
                { id: "1", label: "1D" },
                { id: "2", label: "2D" },
                { id: "3", label: "3D" },
                { id: "4", label: "4D" },
                { id: "5+", label: "5+D" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDurationFilter(tab.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    durationFilter === tab.id
                      ? "bg-purple-600 text-white shadow-sm font-black"
                      : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPackages.map((pkg) => {
              const currentPrice =
                tariffs[pkg.slug] !== undefined
                  ? tariffs[pkg.slug]
                  : pkg.startingPrice || 4999;
              const isModified =
                currentPrice !== (pkg.startingPrice || 4999);

              return (
                <div
                  key={pkg.slug}
                  className={`bg-[#111c3a]/90 border rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow-inner transition-all ${
                    isModified
                      ? "border-amber-400/60 ring-1 ring-amber-400/40 bg-[#162244]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="relative h-24 rounded-xl overflow-hidden bg-[#0b1329]">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329]/90 via-[#0b1329]/20 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-[#0B132B]/85 px-2 py-0.5 rounded border border-amber-500/30">
                          {pkg.duration}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-xs font-black text-white leading-tight drop-shadow-sm truncate">
                          {pkg.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400 truncate">
                        <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                        From {pkg.from}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {pkg.destinations.slice(0, 2).join(" · ")}
                      </span>
                    </div>
                  </div>

                  {/* Starting Price Edit Field */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Starting Price (from)
                      </span>
                      {isModified && (
                        <span className="text-[9px] text-amber-300 font-bold">
                          Default: ₹{(pkg.startingPrice || 4999).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={currentPrice}
                        onChange={(e) => updatePrice(pkg.slug, e.target.value)}
                        className={`w-28 bg-[#0b1329] border rounded-xl px-2.5 py-1.5 text-xs font-black text-right font-mono outline-none [color-scheme:dark] transition ${
                          isModified
                            ? "border-amber-400 text-amber-300 focus:ring-1 focus:ring-amber-400"
                            : "border-white/20 text-emerald-300 focus:border-purple-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-bold">No packages match your search filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDurationFilter("ALL");
                }}
                className="mt-2 text-xs text-purple-400 underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
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
              className="w-1/2 sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving Rates..." : "Save Tour Fares"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
