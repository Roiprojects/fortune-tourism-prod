import React from "react";
import { Car, TrainFront, Bus, Plane, Palmtree, CheckCircle2 } from "lucide-react";

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
  description: string;
  highlight: string;
  bgImage?: string;
}[] = [
  {
    id: "CAB",
    name: "Cab Booking",
    badge: "Instant Confirm",
    icon: Car,
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-700",
    description: "Local hourly rentals, airport transfers, outstation one-way & round trips.",
    highlight: "Transparent km/hr fare with live breakdown",
  },
  {
    id: "TICKET",
    name: "Ticket Booking",
    badge: "Train · Flight · Bus",
    icon: TrainFront,
    iconBg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-700",
    description: "IRCTC Train tickets, Domestic & International Flights, and Bus ticket bookings.",
    highlight: "Fast booking assistance & instant ticket copy",
  },
  {
    id: "TOUR",
    name: "Tour Packages",
    badge: "All-Inclusive",
    icon: Palmtree,
    iconBg: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-700",
    description: "Curated holiday itineraries across South India with hotel & cab.",
    highlight: "Custom multi-destination route builder",
  },
];

export function MultiServiceTypeCards({ selectedService, onSelect }: MultiServiceTypeCardsProps) {
  return (
    <div className="space-y-4">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
          Book your journey here
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const isSelected = selectedService === s.id || (s.id === "TICKET" && (selectedService === "TRAIN" || selectedService === "FLIGHT" || selectedService === "BUS"));

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id === "TICKET" ? "TRAIN" : s.id)}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between group overflow-hidden ${
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

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-white shadow-xs " + s.iconColor + " border-amber-200"
                        : s.iconBg + " " + s.iconColor
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-900 text-base leading-tight">
                    {s.name}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-bold">
                    {s.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between relative z-10">
                <span className="text-[11px] font-extrabold text-slate-700">
                  {s.badge}
                </span>
                <span
                  className={`text-xs font-extrabold uppercase tracking-wider ${
                    isSelected ? "text-amber-700" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {isSelected ? "Selected" : "Choose →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
