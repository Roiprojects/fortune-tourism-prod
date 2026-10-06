import React from "react";

export type ServiceType = "CAB" | "TICKET" | "TRAIN" | "BUS" | "FLIGHT" | "TOUR";

interface MultiServiceTypeCardsProps {
  selectedService: ServiceType | null;
  onSelect: (service: ServiceType) => void;
}

const SERVICES: {
  id: ServiceType;
  name: string;
}[] = [
  {
    id: "CAB",
    name: "Cab Booking",
  },
  {
    id: "TICKET",
    name: "Ticket Booking",
  },
  {
    id: "TOUR",
    name: "Tour Packages",
  },
];

export function MultiServiceTypeCards({ selectedService, onSelect }: MultiServiceTypeCardsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
          Book your journey here
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
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
              className={`relative text-center p-6 sm:p-7 rounded-2xl border transition-all duration-200 flex flex-col justify-between items-center group overflow-hidden ${
                isSelected
                  ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-[1.02]"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs"
              }`}
            >
              <div className="w-full my-auto py-3">
                <div className="font-black text-slate-900 text-lg sm:text-xl md:text-2xl tracking-tight leading-tight">
                  {s.name}
                </div>
              </div>

              <div className="mt-4 w-full">
                <div
                  className={`w-full py-3 px-5 rounded-xl text-center font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-900 text-white group-hover:bg-amber-600 shadow-xs"
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
