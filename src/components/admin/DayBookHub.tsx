import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Phone,
  AlertCircle,
  Car,
  User,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface DayBookTrip {
  id: string;
  source: "day_book" | "booking";
  db_id?: number | null;
  booking_id?: number | null;
  serial_number: string;
  booking_date_raw?: string;
  booking_date: string;
  travel_date_raw?: string;
  on_date: string;
  from_location: string;
  to_location: string;
  departure_time: string;
  raw_time?: string;
  passenger_phone: string;
  passenger_name: string;
  status: string;
  departure_timestamp: number;
  vehicle?: string;
  driver_name?: string;
  driver_phone?: string;
  ticket_number?: string | null;
  pnr_number?: string | null;
  notes?: string;
}

export function DayBookHub() {
  const [trips, setTrips] = useState<DayBookTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tripToComplete, setTripToComplete] = useState<DayBookTrip | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch real database records from the Day Book API
  const fetchDayBookTrips = useCallback(async (showToast = false) => {
    setLoading((prev) => (trips.length === 0 ? true : prev));
    setRefreshing(true);
    try {
      const adminKey =
        sessionStorage.getItem("fortune_admin_key") ||
        localStorage.getItem("fortune_admin_key") ||
        "Admin@fortunetourism2026";

      const res = await fetch("/api/admin/day-book", {
        headers: { "x-admin-key": adminKey },
      });

      if (!res.ok) {
        throw new Error("Failed to load records from server");
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.trips)) {
        setTrips(data.trips);
        if (showToast) {
          toast.success(`Day Book refreshed: ${data.trips.length} active trips loaded.`);
        }
      } else {
        toast.error(data.error || "Failed to parse Day Book entries.");
      }
    } catch (err: any) {
      console.error("Day Book fetch error:", err);
      toast.error(err.message || "Failed to load Day Book from database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trips.length]);

  useEffect(() => {
    fetchDayBookTrips();
  }, [fetchDayBookTrips]);

  // Dynamic filter by passenger phone, from, to, date, on date, and time
  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips;
    const q = searchQuery.toLowerCase().trim();
    return trips.filter((t) => {
      const phoneMatch = (t.passenger_phone || "").toLowerCase().includes(q);
      const fromMatch = (t.from_location || "").toLowerCase().includes(q);
      const toMatch = (t.to_location || "").toLowerCase().includes(q);
      const dateMatch = (t.booking_date || "").toLowerCase().includes(q);
      const onMatch = (t.on_date || "").toLowerCase().includes(q);
      const timeMatch = (t.departure_time || "").toLowerCase().includes(q);
      const nameMatch = (t.passenger_name || "").toLowerCase().includes(q);
      const serialMatch = (t.serial_number || "").toLowerCase().includes(q);
      const ticketMatch = (t.ticket_number || "").toLowerCase().includes(q);

      return (
        phoneMatch ||
        fromMatch ||
        toMatch ||
        dateMatch ||
        onMatch ||
        timeMatch ||
        nameMatch ||
        serialMatch ||
        ticketMatch
      );
    });
  }, [trips, searchQuery]);

  // Trigger confirmation modal for Trip Done
  const handleInitiateTripDone = (trip: DayBookTrip) => {
    setTripToComplete(trip);
    setConfirmOpen(true);
  };

  // Submit Trip Done to backend & persist
  const handleConfirmTripDone = async () => {
    if (!tripToComplete) return;

    setActionLoading(true);
    const targetTrip = tripToComplete;
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
          action: "trip_done",
          id: targetTrip.id,
          source: targetTrip.source,
          db_id: targetTrip.db_id,
          booking_id: targetTrip.booking_id,
          phone: targetTrip.passenger_phone,
          travel_date: targetTrip.travel_date_raw,
          ticket_number: targetTrip.ticket_number,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Immediately remove from active table
        setTrips((prev) => prev.filter((t) => t.id !== targetTrip.id));
        toast.success(
          `Trip for ${targetTrip.passenger_name || targetTrip.passenger_phone} marked as completed!`,
        );
      } else {
        toast.error(data.error || "Failed to update trip status.");
      }
    } catch (err: any) {
      console.error("Trip Done error:", err);
      toast.error(err.message || "Failed to persist completed trip status.");
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
      setTripToComplete(null);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Heading */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-heading">
          Day Book
        </h1>
        <p className="text-xs sm:text-sm text-emerald-300 font-semibold mt-1.5 drop-shadow-sm">
          Active, Present & Upcoming Operational Travel Manifest
        </p>
      </div>

      {/* Controls Bar: Search & Refresh */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 p-3 sm:p-4 mb-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone, from, to, date..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#063f2d] focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-bold px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchDayBookTrips(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#063f2d] hover:bg-[#085a3f] active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Day Book Table Container */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {/* Grouped Header Structure */}
            <thead>
              {/* Row 1 */}
              <tr className="bg-black text-white text-xs sm:text-sm uppercase font-bold tracking-wider">
                <th
                  rowSpan={2}
                  className="px-3.5 py-3 border border-slate-700 text-center whitespace-nowrap w-16"
                >
                  SL NO
                </th>
                <th
                  rowSpan={2}
                  className="px-3.5 py-3 border border-slate-700 text-center whitespace-nowrap w-28"
                >
                  DATE
                </th>
                <th
                  rowSpan={2}
                  className="px-3.5 py-3 border border-slate-700 text-center whitespace-nowrap w-28"
                >
                  ON
                </th>
                <th
                  colSpan={3}
                  className="px-3.5 py-2.5 border border-slate-700 text-center font-extrabold bg-slate-950 tracking-wider text-amber-300"
                >
                  REMAINDER DISPLAY UP DEPARTURE TIME
                </th>
                <th
                  rowSpan={2}
                  className="px-3.5 py-3 border border-slate-700 text-center whitespace-nowrap w-36"
                >
                  Pax ph no
                </th>
                <th
                  rowSpan={2}
                  className="px-3.5 py-3 border border-slate-700 text-center whitespace-nowrap w-32"
                >
                  ACTION
                </th>
              </tr>
              {/* Row 2 (Sub-columns under REMAINDER DISPLAY UP DEPARTURE TIME) */}
              <tr className="bg-black text-white text-xs uppercase font-bold tracking-wider">
                <th className="px-3.5 py-2 border border-slate-700 text-center min-w-[160px]">
                  FROM
                </th>
                <th className="px-3.5 py-2 border border-slate-700 text-center min-w-[160px]">
                  TO
                </th>
                <th className="px-3.5 py-2 border border-slate-700 text-center w-28 whitespace-nowrap">
                  TIME
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {loading && trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-[#063f2d]" />
                      <p className="text-sm font-semibold text-slate-700">Loading Day Book records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                      <p className="text-base font-bold text-slate-800">No active trips found</p>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? "No records matched your search query."
                          : "All scheduled trips are currently completed."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip, idx) => (
                  <tr
                    key={trip.id}
                    className="bg-[#eaf5ed] hover:bg-[#d8edd9] text-slate-900 border-b border-slate-300 font-medium transition-colors group"
                  >
                    {/* SL NO */}
                    <td className="px-3 py-3 border border-slate-300 text-center font-bold text-slate-800 text-xs sm:text-sm">
                      {idx + 1}
                    </td>

                    {/* DATE (Booking / Creation Date) */}
                    <td className="px-3 py-3 border border-slate-300 text-center font-semibold text-slate-700 text-xs whitespace-nowrap">
                      {trip.booking_date}
                    </td>

                    {/* ON (Departure / Travel Date) */}
                    <td className="px-3 py-3 border border-slate-300 text-center font-bold text-[#063f2d] text-xs sm:text-sm whitespace-nowrap">
                      {trip.on_date}
                    </td>

                    {/* FROM */}
                    <td
                      className="px-3 py-3 border border-slate-300 text-left font-semibold text-slate-900 text-xs sm:text-sm max-w-[220px] truncate"
                      title={trip.from_location}
                    >
                      {trip.from_location}
                    </td>

                    {/* TO */}
                    <td
                      className="px-3 py-3 border border-slate-300 text-left font-semibold text-slate-900 text-xs sm:text-sm max-w-[220px] truncate"
                      title={trip.to_location}
                    >
                      {trip.to_location}
                    </td>

                    {/* TIME */}
                    <td className="px-3 py-3 border border-slate-300 text-center font-extrabold text-[#063f2d] text-xs sm:text-sm whitespace-nowrap bg-emerald-100/60">
                      {trip.departure_time}
                    </td>

                    {/* Pax ph no */}
                    <td className="px-3 py-3 border border-slate-300 text-center font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                      <a
                        href={`tel:${trip.passenger_phone}`}
                        className="hover:text-emerald-800 hover:underline tracking-wide"
                      >
                        {trip.passenger_phone}
                      </a>
                      {trip.passenger_name && trip.passenger_name !== "Guest Customer" && (
                        <span className="block text-[10px] text-slate-500 font-normal truncate max-w-[120px] mx-auto">
                          {trip.passenger_name}
                        </span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-3 py-3 border border-slate-300 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleInitiateTripDone(trip)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#063f2d] hover:bg-[#085a3f] active:scale-95 text-white text-xs font-extrabold rounded-lg shadow-xs transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Trip Done</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Status */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong className="text-slate-800">{filteredTrips.length}</strong> active upcoming trips
            {searchQuery && ` (filtered from ${trips.length})`}
          </span>
          <span className="flex items-center gap-1.5 text-[#063f2d] font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Sorted chronologically by Departure Date &amp; Time
          </span>
        </div>
      </div>

      {/* Trip Done Confirmation Modal */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-white rounded-2xl max-w-md p-6">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-[#063f2d]" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-center text-slate-900">
              Are you sure you want to mark this trip as done?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs sm:text-sm text-slate-600 mt-1">
              {tripToComplete && (
                <span className="block mt-2 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left">
                  <span className="block text-slate-800">
                    <strong>Route:</strong> {tripToComplete.from_location} &rarr; {tripToComplete.to_location}
                  </span>
                  <span className="block text-slate-800 mt-0.5">
                    <strong>On:</strong> {tripToComplete.on_date} at {tripToComplete.departure_time}
                  </span>
                  <span className="block text-slate-800 mt-0.5">
                    <strong>Passenger:</strong> {tripToComplete.passenger_name} ({tripToComplete.passenger_phone})
                  </span>
                </span>
              )}
              <span className="block mt-2 text-[11px] text-slate-500">
                This will mark the trip completed in the database and remove it from the active Day Book.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-center gap-2 mt-4 sm:justify-center">
            <AlertDialogCancel
              disabled={actionLoading}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold px-4 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmTripDone}
              disabled={actionLoading}
              className="rounded-xl bg-[#063f2d] hover:bg-[#085a3f] text-white font-bold px-4 cursor-pointer"
            >
              {actionLoading ? "Processing..." : "Yes, Trip Done"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
