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
    cardBg: "bg-gradient-to-br from-emerald-100/70 via-teal-50/80 to-emerald-100/50 hover:from-emerald-100/90 hover:to-teal-100/80",
    cardBorder: "border-emerald-300 hover:border-emerald-400",
    selectedRing: "ring-2 ring-emerald-500 border-emerald-500 shadow-emerald-500/20",
    titleColor: "text-emerald-800",
    btnDefault: "bg-white/95 hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-300 shadow-xs",
    btnSelected: "bg-emerald-600 text-white shadow-md font-black",
  },
  {
    id: "TICKET",
    name: "Ticket Booking",
    cardBg: "bg-gradient-to-br from-amber-100/70 via-orange-50/80 to-amber-100/50 hover:from-amber-100/90 hover:to-orange-100/80",
    cardBorder: "border-amber-300 hover:border-amber-400",
    selectedRing: "ring-2 ring-amber-500 border-amber-500 shadow-amber-500/20",
    titleColor: "text-amber-800",
    btnDefault: "bg-white/95 hover:bg-amber-50 text-amber-800 border-2 border-amber-300 shadow-xs",
    btnSelected: "bg-amber-600 text-white shadow-md font-black",
  },
  {
    id: "TOUR",
    name: "Tour Packages",
    cardBg: "bg-gradient-to-br from-purple-100/70 via-violet-50/80 to-indigo-100/50 hover:from-purple-100/90 hover:to-indigo-100/80",
    cardBorder: "border-purple-300 hover:border-purple-400",
    selectedRing: "ring-2 ring-purple-500 border-purple-500 shadow-purple-500/20",
    titleColor: "text-purple-800",
    btnDefault: "bg-white/95 hover:bg-purple-50 text-purple-800 border-2 border-purple-300 shadow-xs",
    btnSelected: "bg-purple-600 text-white shadow-md font-black",
  },
];

export function MultiServiceTypeCards({ selectedService, onSelect }: MultiServiceTypeCardsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-block w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-amber-100/90 via-orange-100/80 to-amber-100/90 text-amber-900 shadow-md shadow-amber-500/10 border-2 border-amber-300/80">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-amber-900">
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
                  className={`w-full py-3 px-5 rounded-xl text-center font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-200 ${
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
