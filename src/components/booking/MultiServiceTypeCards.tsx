import React from "react";

export type ServiceType = "CAB" | "TICKET" | "TRAIN" | "BUS" | "FLIGHT" | "TOUR";

interface MultiServiceTypeCardsProps {
  selectedService: ServiceType | null;
  onSelect: (service: ServiceType) => void;
}

const SERVICES: {
  id: ServiceType;
  name: string;
  accentBorder: string;
  selectedRing: string;
}[] = [
  {
    id: "CAB",
    name: "Cab Booking",
    accentBorder: "border-t-4 border-t-emerald-400 hover:border-emerald-400/80 shadow-emerald-500/10",
    selectedRing: "ring-2 ring-emerald-400 border-emerald-400 shadow-emerald-400/30",
  },
  {
    id: "TICKET",
    name: "Ticket Booking",
    accentBorder: "border-t-4 border-t-amber-400 hover:border-amber-400/80 shadow-amber-500/10",
    selectedRing: "ring-2 ring-amber-400 border-amber-400 shadow-amber-400/30",
  },
  {
    id: "TOUR",
    name: "Tour Packages",
    accentBorder: "border-t-4 border-t-purple-400 hover:border-purple-400/80 shadow-purple-500/10",
    selectedRing: "ring-2 ring-purple-400 border-purple-400 shadow-purple-400/30",
  },
];

export function MultiServiceTypeCards({ selectedService, onSelect }: MultiServiceTypeCardsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Hero Headline */}
      <div className="text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]">
          Book your journey here
        </h1>
      </div>

      {/* 3 Separate Standalone Cards (no shared bounding container) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
        {SERVICES.map((s) => {
          const isSelected =
            selectedService === s.id ||
            (s.id === "TICKET" &&
              (selectedService === "TRAIN" || selectedService === "FLIGHT" || selectedService === "BUS"));

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id === "TICKET" ? "TRAIN" : s.id)}
              className={`relative text-center p-7 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between items-center group overflow-hidden shadow-2xl backdrop-blur-xl ${
                s.accentBorder
              } ${
                isSelected
                  ? `${s.selectedRing} bg-[#0e1a38]/95 scale-[1.03] shadow-emerald-400/20`
                  : "bg-[#0B132B]/90 hover:bg-[#101e42]/95 border-white/15 hover:scale-[1.03]"
              }`}
            >
              <div className="w-full my-auto py-5">
                <div className="font-black text-2xl sm:text-3xl tracking-tight leading-tight text-white group-hover:text-emerald-300 transition-colors">
                  {s.name}
                </div>
              </div>

              <div className="mt-6 w-full">
                <div
                  className={`w-full py-3.5 px-6 rounded-2xl text-center font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-200 shadow-lg ${
                    isSelected
                      ? "bg-emerald-300 text-slate-950 shadow-emerald-300/40 scale-[1.02] ring-2 ring-white"
                      : "bg-[#00c58e] hover:bg-[#00a87a] text-white shadow-[#00c58e]/25 hover:shadow-[#00c58e]/40 hover:scale-[1.02]"
                  }`}
                >
                  {isSelected ? "Selected ✓" : "Select"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
