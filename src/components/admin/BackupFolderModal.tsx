import React from "react";
import {
  X,
  FolderArchive,
  Car,
  Ticket,
  Package,
  Plane,
  Bus,
  Hotel,
  Pencil,
  IndianRupee,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface BackupFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (
    category: "cars" | "train" | "packages" | "flight" | "bus" | "hotel"
  ) => void;
  onOpenFareEditor: () => void;
  vehiclesCount?: number;
  packagesCount?: number;
  flightBookingsCount?: number;
  busBookingsCount?: number;
}

export function BackupFolderModal({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenFareEditor,
  vehiclesCount = 8,
  packagesCount = 17,
  flightBookingsCount = 6,
  busBookingsCount = 7,
}: BackupFolderModalProps) {
  if (!isOpen) return null;

  const categories = [
    {
      key: "cars" as const,
      title: "Cab Booking",
      description:
        "Airport transfers, local city rentals & outstation cab fleet tracking",
      icon: Car,
      badge: `${vehiclesCount} Vehicles`,
      iconBg: "bg-emerald-50 text-[#063f2d]",
      actionLabel: "Open Service Panel",
    },
    {
      key: "train" as const,
      title: "Ticket Booking",
      description:
        "Issue tickets, track PNRs, generate official PDF vouchers & ticket copies",
      icon: Ticket,
      badge: "Ticketing Hub",
      iconBg: "bg-blue-50 text-blue-700",
      actionLabel: "Service Panel",
      allowFareEdit: true,
    },
    {
      key: "packages" as const,
      title: "Tour Packages",
      description:
        "Curate South India holiday itineraries, seasonal tariffs & packages",
      icon: Package,
      badge: `${packagesCount} Packages`,
      iconBg: "bg-amber-50 text-[#d79a17]",
      actionLabel: "Open Service Panel",
    },
    {
      key: "flight" as const,
      title: "Flight Booking",
      description:
        "Domestic & international airline reservations, flight manifests & airfares",
      icon: Plane,
      badge: `${flightBookingsCount} Bookings`,
      iconBg: "bg-sky-50 text-sky-700",
      actionLabel: "Open Service Panel",
    },
    {
      key: "bus" as const,
      title: "Bus Booking",
      description:
        "Intercity sleeper, Volvo multi-axle & private bus seat allocations",
      icon: Bus,
      badge: `${busBookingsCount} Bookings`,
      iconBg: "bg-orange-50 text-orange-700",
      actionLabel: "Open Service Panel",
    },
    {
      key: "hotel" as const,
      title: "Hotel Booking",
      description:
        "Resort suites, business hotel reservations, check-in schedules & tariffs",
      icon: Hotel,
      badge: "Stays & Resorts",
      iconBg: "bg-indigo-50 text-indigo-700",
      actionLabel: "Open Service Panel",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl max-w-5xl w-full my-auto flex flex-col overflow-hidden text-white ring-1 ring-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063f2d] via-[#0B132B] to-[#101e42] p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-inner">
              <FolderArchive className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Backup Folder
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  6 Service Categories
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Archived &amp; quick-access category cards for all Fortune Tourism booking operations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 6 Category Cards */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto scrollbar-thin bg-slate-950/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectCategory(service.key);
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectCategory(service.key);
                      onClose();
                    }
                  }}
                  className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-5 shadow-lg hover:shadow-2xl hover:border-amber-400 hover:bg-white hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs ${service.iconBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {service.allowFareEdit && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenFareEditor();
                              onClose();
                            }}
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Quick edit ticket fare amounts & tariffs"
                          >
                            <Pencil className="w-2.5 h-2.5 text-amber-700" />
                            <span>Edit Fare</span>
                          </button>
                        )}
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-900 transition shadow-2xs">
                          {service.badge}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#063f2d] transition">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#063f2d] group-hover:text-[#d79a17] transition">
                    {service.allowFareEdit ? (
                      <div className="flex items-center justify-between w-full gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFareEditor();
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-md hover:shadow-lg transition-all hover:scale-[1.03] cursor-pointer"
                        >
                          <IndianRupee className="w-3.5 h-3.5 text-white" />
                          <span>Edit Fare Amount</span>
                        </button>
                        <div className="flex items-center gap-1 text-slate-700 group-hover:text-[#063f2d] font-bold text-xs shrink-0">
                          <span>{service.actionLabel}</span>
                          <span className="text-sm leading-none transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span>{service.actionLabel}</span>
                        <span className="text-sm leading-none transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 font-medium">
            💡 <strong className="text-slate-200">Tip:</strong> You can also access this Backup Folder anytime directly from the <span className="text-amber-300 font-bold">Account</span> menu in the top right.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            Close Folder
          </button>
        </div>
      </div>
    </div>
  );
}
