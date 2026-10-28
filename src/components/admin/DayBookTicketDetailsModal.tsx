import React from "react";
import {
  X,
  Plane,
  TrainFront,
  Bus,
  Package,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Ticket,
  CheckCircle2,
  Download,
  Info,
} from "lucide-react";
import { DayBookTrip } from "@/components/admin/DayBookHub";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";
import { toast } from "sonner";

interface DayBookTicketDetailsModalProps {
  isOpen: boolean;
  trip: DayBookTrip | null;
  onClose: () => void;
  onMarkDone: (trip: DayBookTrip) => void;
}

export function DayBookTicketDetailsModal({
  isOpen,
  trip,
  onClose,
  onMarkDone,
}: DayBookTicketDetailsModalProps) {
  if (!isOpen || !trip) return null;

  const isFlight = trip.service_type === "FLIGHT";
  const isTrain = trip.service_type === "TRAIN";
  const isBus = trip.service_type === "BUS";
  const isTour = trip.service_type === "TOUR";

  const handleDownloadTicket = () => {
    try {
      downloadTicketCopyPDF({
        ticketNumber: trip.ticket_number || trip.serial_number || "FT-TKT",
        pnrNumber: trip.pnr_number || "PNR-AUTO",
        bookingDate: trip.booking_date,
        passengerName: trip.passenger_name,
        passengerPhone: trip.passenger_phone,
        tourType: isFlight ? "FLIGHT TICKET" : isTrain ? "TRAIN TICKET" : isBus ? "BUS TICKET" : "TOUR PACKAGE",
        fromLocation: trip.from_location,
        toLocation: trip.to_location,
        departureOn: `${trip.on_date} (${trip.departure_time})`,
        tripType: "ONE WAY",
        vehicleOrMode: trip.vehicle || (isFlight ? "FLIGHT" : isTrain ? "TRAIN" : isBus ? "BUS" : "TOUR"),
        boardingPoint: trip.boarding_point || trip.from_location,
        boardingAddress: trip.boarding_point || trip.from_location,
        fareAmount: trip.total_amount || 0,
      });
      toast.success("Ticket PDF downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download ticket PDF");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div
          className={`px-6 py-4.5 flex items-center justify-between text-white ${
            isFlight
              ? "bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900"
              : isTrain
              ? "bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900"
              : isBus
              ? "bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900"
              : "bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              {isFlight && <Plane className="w-5 h-5 text-sky-200" />}
              {isTrain && <TrainFront className="w-5 h-5 text-amber-200" />}
              {isBus && <Bus className="w-5 h-5 text-indigo-200" />}
              {isTour && <Package className="w-5 h-5 text-purple-200" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-wide">
                  {isFlight
                    ? "Flight Booking Details"
                    : isTrain
                    ? "Train Booking Details"
                    : isBus
                    ? "Bus Booking Details"
                    : "Tour Package Details"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  {trip.service_type}
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">
                Ref: {trip.serial_number} {trip.ticket_number ? `· TKT: ${trip.ticket_number}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 font-sans text-slate-800">
          {/* Key Reference Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ticket No</span>
              <span className="font-mono font-black text-amber-800 text-xs sm:text-sm">
                {trip.ticket_number || trip.serial_number}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PNR Number</span>
              <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                {trip.pnr_number || "CNF-AUTO"}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Travel Date</span>
              <span className="font-bold text-emerald-800 text-xs sm:text-sm">
                {trip.on_date}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Departure</span>
              <span className="font-black text-slate-900 text-xs sm:text-sm">
                {trip.departure_time}
              </span>
            </div>
          </div>

          {/* Route Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Journey Route
            </span>
            <div className="flex items-center gap-3 text-sm sm:text-base font-extrabold text-slate-900">
              <span className="text-emerald-700">{trip.from_location}</span>
              <span className="text-slate-400">➔</span>
              <span className="text-blue-700">{trip.to_location}</span>
            </div>
            {trip.boarding_point && trip.boarding_point !== trip.from_location && (
              <div className="text-xs text-slate-600 font-medium">
                <strong>Boarding Point:</strong> {trip.boarding_point}
              </div>
            )}
          </div>

          {/* Service Specific Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Reservation Specifications
            </span>

            {isFlight && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold">Airline:</span>
                  <span className="font-bold text-slate-900">{trip.airline || "Domestic Carrier"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Flight Number:</span>
                  <span className="font-bold text-slate-900">{trip.flight_number || "Scheduled Flight"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Cabin Class:</span>
                  <span className="font-bold text-slate-900">{trip.cabin_class || "Economy"}</span>
                </div>
              </div>
            )}

            {isTrain && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold">Train:</span>
                  <span className="font-bold text-slate-900">{trip.train_name || "IRCTC Express"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Train No:</span>
                  <span className="font-bold text-slate-900">{trip.train_number || "Regular"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Class:</span>
                  <span className="font-bold text-slate-900">{trip.travel_class || "3A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Quota:</span>
                  <span className="font-bold text-slate-900">{trip.quota || "General"}</span>
                </div>
              </div>
            )}

            {isBus && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold">Bus Type:</span>
                  <span className="font-bold text-slate-900">{trip.bus_type || trip.vehicle || "AC Sleeper"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Operator:</span>
                  <span className="font-bold text-slate-900">{trip.bus_operator || "Partner Travels"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Boarding:</span>
                  <span className="font-bold text-slate-900">{trip.boarding_point || trip.from_location}</span>
                </div>
              </div>
            )}

            {isTour && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold">Package:</span>
                  <span className="font-bold text-slate-900">{trip.package_name || trip.vehicle || "Custom Tour"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Destinations:</span>
                  <span className="font-bold text-slate-900">{trip.to_location}</span>
                </div>
              </div>
            )}
          </div>

          {/* Passenger Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Passenger Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-900">{trip.passenger_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <a
                  href={`tel:${trip.passenger_phone}`}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  {trip.passenger_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Notes / Special Instructions if any */}
          {trip.notes && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                <span>Booking Notes &amp; Spec:</span>
              </div>
              <p className="font-mono text-[11px] leading-relaxed break-words">{trip.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTicket}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <span>Download Voucher</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onMarkDone(trip);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isFlight
                  ? "bg-sky-800 hover:bg-sky-900"
                  : isTrain
                  ? "bg-amber-800 hover:bg-amber-900"
                  : isBus
                  ? "bg-indigo-800 hover:bg-indigo-900"
                  : "bg-purple-800 hover:bg-purple-900"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isFlight
                  ? "Mark Flight Done"
                  : isTrain
                  ? "Mark Train Done"
                  : isBus
                  ? "Mark Bus Done"
                  : "Mark Tour Done"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
