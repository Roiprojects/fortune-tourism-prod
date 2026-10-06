import React from "react";
import { Car, CarTaxiFront, CarFront, TrainFront, Bus, Plane, Palmtree, CheckCircle2 } from "lucide-react";

export type ServiceType = "CAB" | "TICKET" | "TRAIN" | "BUS" | "FLIGHT" | "TOUR";

interface MultiServiceTypeCardsProps {
  selectedService: ServiceType | null;
  onSelect: (service: ServiceType) => void;
}

const SERVICES: {
  id: ServiceType;
  name: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  description?: string;
  highlight: string;
  bgImage?: string;
}[] = [
  {
    id: "CAB",
    name: "Cab Booking",
    icon: CarTaxiFront,
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-700",
    description: "",
    highlight: "Transparent km/hr fare with live breakdown",
  },
  {
    id: "TICKET",
    name: "Ticket Booking",
    icon: TrainFront,
    iconBg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-700",
    description: "",
    highlight: "Fast booking assistance & instant ticket copy",
  },
  {
    id: "TOUR",
    name: "Tour Packages",
    icon: Palmtree,
    iconBg: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-700",
    description: "",
    highlight: "Custom multi-destination route builder",
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
          const Icon = s.icon;
          const isSelected = selectedService === s.id || (s.id === "TICKET" && (selectedService === "TRAIN" || selectedService === "FLIGHT" || selectedService === "BUS"));

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id === "TICKET" ? "TRAIN" : s.id)}
              className={`relative text-left p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between group overflow-hidden ${
                isSelected
                  ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-[1.02]"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs"
              }`}
            >
              {/* Background Image Layer */}
              {s.bgImage && (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-110" 
                    style={{ backgroundImage: `url(${s.bgImage})` }} 
                  />
                  <div className={`absolute inset-0 z-0 transition-colors ${isSelected ? "bg-amber-50/90" : "bg-white/85 group-hover:bg-white/75"}`} />
                </>
              )}

              {/* Active checkmark badge */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 fill-amber-100" />
                </div>
              )}

              <div className="space-y-4 relative z-10 w-full">
                <div className="flex items-center justify-between">
                  <div
                    className={`h-12 ${s.id === "CAB" || s.id === "TICKET" ? "px-3" : "w-12"} rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-white shadow-xs " + s.iconColor + " border-amber-200"
                        : s.iconBg + " " + s.iconColor
                    }`}
                  >
                    {s.id === "CAB" ? (
                      <div className="flex items-center gap-1.5">
                        <CarTaxiFront className="w-5 h-5" />
                        <CarFront className="w-5 h-5 opacity-90" />
                        <Car className="w-5 h-5 opacity-80" />
                      </div>
                    ) : s.id === "TICKET" ? (
                      <div className="flex items-center gap-1.5">
                        <TrainFront className="w-5 h-5" />
                        <Plane className="w-5 h-5 opacity-90" />
                        <Bus className="w-5 h-5 opacity-80" />
                      </div>
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-900 text-lg sm:text-xl md:text-2xl tracking-tight leading-tight">
                    {s.name}
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-bold">
                      {s.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-2 relative z-10 w-full">
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
