import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Car,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Save,
  CheckCircle2,
  Trash2,
  Share2,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { DayBookTrip } from "@/components/admin/DayBookHub";
import { DriverDutyRecord } from "@/components/admin/DriverDetailsEditorModal";

interface DayBookTripDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: DayBookTrip | null;
  onDriverUpdated: (updatedTrip: DayBookTrip) => void;
  onOpenFullDutySheet: (searchQuery?: string) => void;
}

const STORAGE_KEY = "fortune_driver_details_data";

// Fallback fleet drivers if database driver list is loading or offline
const DEFAULT_FLEET_DRIVERS = [
  { id: 1, name: "ZAMEER", phone: "9740463404", vehicle_type: "XYLO", vehicle_number: "KA 51 AC 6052" },
  { id: 2, name: "TAVDE", phone: "8861306201", vehicle_type: "DZIRE", vehicle_number: "KA 01 AA 9582" },
  { id: 3, name: "VENUJI(TAVDE)", phone: "9242242422", vehicle_type: "ERTIGA", vehicle_number: "KA 41 AA 1963" },
  { id: 4, name: "RAJESH", phone: "9740463404", vehicle_type: "INNOVA CRYSTA", vehicle_number: "KA 51 ME 4404" },
  { id: 5, name: "MANJUNATH", phone: "9964600247", vehicle_type: "ETIOS", vehicle_number: "KA 05 AJ 3321" },
];

export function DayBookTripDriverModal({
  isOpen,
  onClose,
  trip,
  onDriverUpdated,
  onOpenFullDutySheet,
}: DayBookTripDriverModalProps) {
  if (!isOpen || !trip) return null;

  const [driverName, setDriverName] = useState(
    trip.driver_name && trip.driver_name !== "-" ? trip.driver_name : ""
  );
  const [driverPhone, setDriverPhone] = useState(
    trip.driver_phone && trip.driver_phone !== "-" ? trip.driver_phone : ""
  );
  const [taxiNumber, setTaxiNumber] = useState(trip.taxi_number || "");
  const [vehicleType, setVehicleType] = useState(
    trip.vehicle && trip.vehicle !== "-" ? trip.vehicle : "Sedan (Dzire / Etios)"
  );
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [toPayAmount, setToPayAmount] = useState<number>(0);
  const [settledAmount, setSettledAmount] = useState<number>(0);

  const [registeredDrivers, setRegisteredDrivers] = useState<any[]>(DEFAULT_FLEET_DRIVERS);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch registered drivers from system API
  useEffect(() => {
    let isMounted = true;
    async function loadDrivers() {
      try {
        const adminKey =
          sessionStorage.getItem("fortune_admin_key") ||
          localStorage.getItem("fortune_admin_key") ||
          "Admin@fortunetourism2026";
        const res = await fetch("/api/business/drivers", {
          headers: { "x-admin-key": adminKey },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.drivers) && data.drivers.length > 0 && isMounted) {
          setRegisteredDrivers(data.drivers);
        }
      } catch (err) {
        // Fallback to default fleet drivers
      }
    }
    loadDrivers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Look up existing entry in local driver duty records (fortune_driver_details_data)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleanTripPhone = (trip.passenger_phone || "").replace(/\D/g, "").slice(-10);
          const found = parsed.find((r: DriverDutyRecord) => {
            const cleanRecPhone = (r.paxPhone || "").replace(/\D/g, "").slice(-10);
            return (
              (cleanTripPhone && cleanRecPhone && cleanTripPhone === cleanRecPhone) ||
              (r.paxName && trip.passenger_name && r.paxName.toLowerCase() === trip.passenger_name.toLowerCase())
            );
          });

          if (found) {
            if (!driverName && found.driver) setDriverName(found.driver);
            if (!driverPhone && found.driverPhone) setDriverPhone(found.driverPhone);
            if (!taxiNumber && found.carNo) setTaxiNumber(found.carNo);
            if (found.car) setVehicleType(found.car);
            if (found.due !== undefined) setDueAmount(Number(found.due) || 0);
            if (found.toPay !== undefined) setToPayAmount(Number(found.toPay) || 0);
            if (found.settled !== undefined) setSettledAmount(Number(found.settled) || 0);
          }
        }
      }
    } catch (e) {
      console.error("Error reading driver details storage:", e);
    }
  }, [trip]);

  // Handle selecting a driver from the dropdown
  const handleSelectDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    if (!driverId) return;
    const found = registeredDrivers.find((d) => String(d.id) === driverId);
    if (found) {
      setDriverName(found.name || "");
      setDriverPhone(found.phone || "");
      if (found.vehicle_number) setTaxiNumber(found.vehicle_number);
      if (found.vehicle_type) setVehicleType(found.vehicle_type);
      toast.info(`Selected driver ${found.name}. Details prefilled.`);
    }
  };

  // Sync to localStorage DriverDutyRecord so it appears in the Excel spreadsheet
  const syncToDriverDutyStorage = (savedDriverName: string, savedDriverPhone: string, savedTaxiNo: string, savedVehicle: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let records: DriverDutyRecord[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(records)) records = [];

      const cleanTripPhone = (trip.passenger_phone || "").replace(/\D/g, "").slice(-10);
      const existingIdx = records.findIndex((r) => {
        const cleanRecPhone = (r.paxPhone || "").replace(/\D/g, "").slice(-10);
        return (
          (cleanTripPhone && cleanRecPhone && cleanTripPhone === cleanRecPhone) ||
          (r.paxName && trip.passenger_name && r.paxName.toLowerCase() === trip.passenger_name.toLowerCase()) ||
          r.id === `DD-TRIP-${trip.id}`
        );
      });

      const today = new Date();
      const dateStr = trip.booking_date || `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      const onDateStr = trip.on_date || dateStr;

      if (existingIdx >= 0) {
        // Update existing record
        records[existingIdx] = {
          ...records[existingIdx],
          driver: savedDriverName,
          driverPhone: savedDriverPhone,
          carNo: savedTaxiNo,
          car: savedVehicle,
          due: dueAmount,
          toPay: toPayAmount,
          settled: settledAmount,
          from: trip.from_location || records[existingIdx].from,
          to: trip.to_location || records[existingIdx].to,
          time: trip.departure_time || records[existingIdx].time,
          paxName: trip.passenger_name || records[existingIdx].paxName,
          paxPhone: trip.passenger_phone || records[existingIdx].paxPhone,
          onDate: onDateStr,
        };
      } else {
        // Add new record
        const nextSl = records.length > 0 ? Math.max(...records.map((r) => r.slNo || 0)) + 1 : 1;
        const newRecord: DriverDutyRecord = {
          id: `DD-TRIP-${trip.id}-${Date.now()}`,
          slNo: nextSl,
          date: dateStr,
          onDate: onDateStr,
          from: trip.from_location,
          to: trip.to_location,
          time: trip.departure_time,
          driver: savedDriverName,
          driverPhone: savedDriverPhone,
          carNo: savedTaxiNo,
          car: savedVehicle,
          due: dueAmount,
          toPay: toPayAmount,
          settled: settledAmount,
          payDate: onDateStr,
          paxName: trip.passenger_name,
          paxPhone: trip.passenger_phone,
        };
        records.unshift(newRecord);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error("Error updating duty sheet storage:", e);
    }
  };

  // Save driver assignment to Database and sync to Duty Sheet
  const handleSaveDriver = async () => {
    if (!driverName.trim()) {
      toast.error("Please enter or select a Driver Name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const adminKey =
        sessionStorage.getItem("fortune_admin_key") ||
        localStorage.getItem("fortune_admin_key") ||
        "Admin@fortunetourism2026";

      const res = await fetch("/api/admin/day-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "assign_driver",
          id: trip.id,
          source: trip.source,
          db_id: trip.db_id,
          booking_id: trip.booking_id,
          phone: trip.passenger_phone,
          ticket_number: trip.ticket_number,
          driver_name: driverName.trim(),
          driver_phone: driverPhone.trim(),
          taxi_number: taxiNumber.trim(),
          vehicle_type: vehicleType.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save driver assignment to database.");
      }

      // Sync into local duty sheet records
      syncToDriverDutyStorage(driverName.trim(), driverPhone.trim(), taxiNumber.trim(), vehicleType.trim());

      const updatedTrip: DayBookTrip = {
        ...trip,
        driver_name: driverName.trim(),
        driver_phone: driverPhone.trim(),
        taxi_number: taxiNumber.trim(),
        vehicle: vehicleType.trim(),
      };

      onDriverUpdated(updatedTrip);
      toast.success(`Driver ${driverName.trim()} assigned to ${trip.passenger_name} successfully!`);
      onClose();
    } catch (err: any) {
      console.error("Save driver error:", err);
      toast.error(err.message || "An error occurred while saving driver details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove / Unassign driver
  const handleRemoveDriver = async () => {
    if (!confirm("Are you sure you want to remove the assigned driver for this trip?")) {
      return;
    }
    setIsSubmitting(true);
    try {
      const adminKey =
        sessionStorage.getItem("fortune_admin_key") ||
        localStorage.getItem("fortune_admin_key") ||
        "Admin@fortunetourism2026";

      const res = await fetch("/api/admin/day-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "assign_driver",
          id: trip.id,
          source: trip.source,
          db_id: trip.db_id,
          booking_id: trip.booking_id,
          phone: trip.passenger_phone,
          ticket_number: trip.ticket_number,
          driver_name: null,
          driver_phone: null,
          taxi_number: null,
          vehicle_type: trip.vehicle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove driver assignment.");
      }

      const updatedTrip: DayBookTrip = {
        ...trip,
        driver_name: "-",
        driver_phone: "-",
        taxi_number: null,
      };

      setDriverName("");
      setDriverPhone("");
      setTaxiNumber("");
      setSelectedDriverId("");

      onDriverUpdated(updatedTrip);
      toast.success("Driver removed from trip.");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove driver.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format WhatsApp message to send driver details to passenger
  const handleWhatsAppPassenger = () => {
    const cleanPhone = (trip.passenger_phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Passenger phone number is invalid for WhatsApp.");
      return;
    }

    const message =
      `*Namaste ${trip.passenger_name || "Guest"}!*\n\n` +
      `Your journey with *Fortune Tourism Bangalore* has been confirmed and vehicle assigned:\n\n` +
      `📍 *Route:* ${trip.from_location} ➔ ${trip.to_location}\n` +
      `📅 *Date & Time:* ${trip.on_date} at ${trip.departure_time}\n` +
      `👤 *Assigned Driver:* ${driverName || "Assigned Driver"}\n` +
      `📞 *Driver Phone:* ${driverPhone || "Will be shared shortly"}\n` +
      `🚗 *Vehicle / Car:* ${vehicleType || "Cab"} ${taxiNumber ? `(${taxiNumber})` : ""}\n` +
      (trip.ticket_number ? `🎫 *Ticket No:* ${trip.ticket_number}\n` : "") +
      `\nFor any assistance, call Fortune Tourism: *+91 9740463404*.\n` +
      `Have a safe and pleasant journey!`;

    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const isAssigned = Boolean(trip.driver_name && trip.driver_name !== "-");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063f2d] via-[#085a3c] to-[#063f2d] text-white px-5 py-4 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/20 shadow-xs">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Driver &amp; Vehicle Allotment
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  {isAssigned ? "Assigned" : "Pending Allotment"}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Trip #{trip.serial_number} &middot; Travel on {trip.on_date} at {trip.departure_time}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Journey & Passenger Card */}
          <div className="bg-emerald-50/60 rounded-xl border border-emerald-200/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 pb-2 border-b border-emerald-200/60">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <strong>{trip.from_location}</strong> &rarr; <strong>{trip.to_location}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800">
                <Clock className="w-3.5 h-3.5" />
                {trip.on_date} &bull; {trip.departure_time}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Passenger</span>
                <strong className="text-slate-900 font-extrabold">{trip.passenger_name || "Guest Customer"}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Passenger Phone</span>
                <a href={`tel:${trip.passenger_phone}`} className="text-emerald-800 font-extrabold hover:underline">
                  {trip.passenger_phone}
                </a>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Vehicle Requested</span>
                <strong className="text-slate-800">{trip.vehicle || "Cab"}</strong>
              </div>
            </div>
          </div>

          {/* Quick Select Driver Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Quick Select Registered Driver</span>
              <span className="text-[11px] text-slate-500 font-normal">Auto-fills driver name, phone &amp; car</span>
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => handleSelectDriver(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#063f2d] shadow-2xs"
            >
              <option value="">-- Choose from Fleet Drivers --</option>
              {registeredDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.phone ? `(${d.phone})` : ""} - {d.vehicle_type || "Cab"} {d.vehicle_number ? `[${d.vehicle_number}]` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Driver Input Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Driver Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Driver Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ZAMEER / TAVDE"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#063f2d] focus:ring-2 focus:ring-[#063f2d]/20 outline-none font-bold text-slate-900"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Driver Phone */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Driver Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 9740463404"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#063f2d] focus:ring-2 focus:ring-[#063f2d]/20 outline-none font-bold text-slate-900"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Vehicle Model / Car */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Vehicle Model / Car
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. XYLO / DZIRE / ERTIGA / INNOVA"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#063f2d] focus:ring-2 focus:ring-[#063f2d]/20 outline-none font-bold text-slate-900"
                />
                <Car className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Taxi / Registration Number */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Taxi / Registration Number (Car No.)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. KA 51 AC 6052"
                  value={taxiNumber}
                  onChange={(e) => setTaxiNumber(e.target.value.toUpperCase())}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#063f2d] focus:ring-2 focus:ring-[#063f2d]/20 outline-none font-mono font-bold text-slate-900 uppercase"
                />
                <Car className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Optional Duty Sheet Financial Settlement */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
              Duty Sheet Settlement (Syncs with Excel Sheet)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Due Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={dueAmount}
                  onChange={(e) => setDueAmount(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-amber-700 outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">To Pay (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={toPayAmount}
                  onChange={(e) => setToPayAmount(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-blue-700 outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Settled (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={settledAmount}
                  onChange={(e) => setSettledAmount(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-emerald-700 outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isAssigned && (
              <button
                type="button"
                onClick={handleRemoveDriver}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                title="Remove assigned driver"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Unassign</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullDutySheet(trip.passenger_phone || trip.passenger_name || "");
              }}
              className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 bg-white border border-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              title="Open full multi-row duty sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Full Duty Sheet</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleWhatsAppPassenger}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Open WhatsApp to share driver details with passenger"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDriver}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#063f2d] hover:bg-[#085a3f] text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Save &amp; Assign Driver</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
