import React from "react";

export type ServiceType = "CAB" | "TICKET" | "TRAIN" | "BUS" | "FLIGHT" | "TOUR";

interface MultiServiceTypeCardsProps {
  selectedService: ServiceType | null;
  onSelect: (service: ServiceType) => void;
}

const SERVICES: {
  id: ServiceType;
  name: string;
  cardBg: string;
  cardBorder: string;
  selectedRing: string;
  titleColor: string;
  btnDefault: string;
  btnSelected: string;
}[] = [
  {
    id: "CAB",
    name: "Cab Booking",
    cardBg: "bg-gradient-to-br from-emerald-50 via-teal-50/80 to-emerald-100/70 hover:from-emerald-100/80 hover:to-teal-100/90",
    cardBorder: "border-emerald-300/90 hover:border-emerald-500",
    selectedRing: "ring-2 ring-emerald-500 border-emerald-500 shadow-emerald-500/20",
    titleColor: "text-emerald-950",
    btnDefault: "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20",
    btnSelected: "bg-emerald-900 text-white shadow-md",
  },
  {
    id: "TICKET",
    name: "Ticket Booking",
    cardBg: "bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/70 hover:from-amber-100/80 hover:to-orange-100/90",
    cardBorder: "border-amber-300/90 hover:border-amber-500",
    selectedRing: "ring-2 ring-amber-500 border-amber-500 shadow-amber-500/20",
    titleColor: "text-amber-950",
    btnDefault: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
    btnSelected: "bg-amber-800 text-white shadow-md",
  },
  {
    id: "TOUR",
    name: "Tour Packages",
    cardBg: "bg-gradient-to-br from-purple-50 via-violet-50/80 to-indigo-100/70 hover:from-purple-100/80 hover:to-indigo-100/90",
    cardBorder: "border-purple-300/90 hover:border-purple-500",
    selectedRing: "ring-2 ring-purple-500 border-purple-500 shadow-purple-500/20",
    titleColor: "text-purple-950",
    btnDefault: "bg-purple-700 hover:bg-purple-800 text-white shadow-purple-700/20",
    btnSelected: "bg-purple-900 text-white shadow-md",
  },
];

export function MultiServiceTypeCards({ selectedService, onSelect }: MultiServiceTypeCardsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-block w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 border border-amber-300/40">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Book your journey here
          </h2>
        </div>
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
              className={`relative text-center p-6 sm:p-7 rounded-2xl border transition-all duration-200 flex flex-col justify-between items-center group overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] ${s.cardBg} ${
                isSelected
                  ? `${s.selectedRing} scale-[1.02]`
                  : `${s.cardBorder}`
              }`}
            >
              <div className="w-full my-auto py-3">
                <div className={`font-black text-lg sm:text-xl md:text-2xl tracking-tight leading-tight ${s.titleColor}`}>
                  {s.name}
                </div>
              </div>

              <div className="mt-4 w-full">
                <div
                  className={`w-full py-3 px-5 rounded-xl text-center font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-200 shadow-xs ${
                    isSelected
                      ? s.btnSelected
                      : s.btnDefault
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
