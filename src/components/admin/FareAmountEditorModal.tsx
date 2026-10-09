import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  X,
  IndianRupee,
  Search,
  Save,
  TrainFront,
  Bus,
  Plane,
  Ticket,
  CheckCircle,
  RefreshCw,
  Edit3,
  Sliders,
  Calendar,
  User,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/booking-utils";

export interface DefaultTicketTariffs {
  train: {
    "1A": number;
    "2A": number;
    "3A": number;
    "3E": number;
    CC: number;
    SL: number;
  };
  bus: {
    volvo: number;
    sleeper: number;
    seater: number;
  };
  flight: {
    economy: number;
    business: number;
  };
}

export const DEFAULT_TICKET_TARIFFS: DefaultTicketTariffs = {
  train: {
    "1A": 2450,
    "2A": 1650,
    "3A": 1150,
    "3E": 1150,
    CC: 750,
    SL: 450,
  },
  bus: {
    volvo: 1450,
    sleeper: 1100,
    seater: 850,
  },
  flight: {
    economy: 4850,
    business: 14500,
  },
};

export function getSavedTicketTariffs(): DefaultTicketTariffs {
  if (typeof window === "undefined") return DEFAULT_TICKET_TARIFFS;
  try {
    const raw = localStorage.getItem("FT_TICKET_FARE_TARIFFS");
    if (!raw) return DEFAULT_TICKET_TARIFFS;
    const parsed = JSON.parse(raw);
    return {
      train: { ...DEFAULT_TICKET_TARIFFS.train, ...(parsed.train || {}) },
      bus: { ...DEFAULT_TICKET_TARIFFS.bus, ...(parsed.bus || {}) },
      flight: { ...DEFAULT_TICKET_TARIFFS.flight, ...(parsed.flight || {}) },
    };
  } catch {
    return DEFAULT_TICKET_TARIFFS;
  }
}

interface FareAmountEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated?: () => void;
  initialBookingId?: number | null;
}

export function FareAmountEditorModal({
  isOpen,
  onClose,
  onBookingUpdated,
  initialBookingId,
}: FareAmountEditorModalProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "tariffs">("bookings");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "TRAIN" | "BUS" | "FLIGHT">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Edit fields for selected booking
  const [fareAmount, setFareAmount] = useState<string>("");
  const [baseFare, setBaseFare] = useState<string>("");
  const [taxAmount, setTaxAmount] = useState<string>("");
  const [advancePaid, setAdvancePaid] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Default tariffs state
  const [tariffs, setTariffs] = useState<DefaultTicketTariffs>(getSavedTicketTariffs);

  const DEFAULT_ADMIN_KEY = "Admin@fortunetourism2026";

  const getAdminAuthHeaders = (): Record<string, string> => {
    let key = "";
    if (typeof window !== "undefined") {
      key =
        sessionStorage.getItem("fortune_admin_key") ||
        localStorage.getItem("fortune_admin_key") ||
        "";
      if (!key) {
        key = DEFAULT_ADMIN_KEY;
        try {
          sessionStorage.setItem("fortune_admin_key", DEFAULT_ADMIN_KEY);
          localStorage.setItem("fortune_admin_key", DEFAULT_ADMIN_KEY);
        } catch {}
      }
    } else {
      key = DEFAULT_ADMIN_KEY;
    }

    if (typeof document !== "undefined") {
      try {
        document.cookie = `fortune_admin_key=${encodeURIComponent(key)}; Path=/; Max-Age=86400; SameSite=Lax`;
      } catch {}
    }

    return {
      "Content-Type": "application/json",
      "x-admin-key": key,
      authorization: `Bearer ${key}`,
    };
  };

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const headers = getAdminAuthHeaders();
      const res = await fetch("/api/bookings?limit=100", {
        credentials: "include",
        headers,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        // Filter to ticket categories or all
        const ticketBookings = data.bookings.filter((b: any) => {
          const cat = String(b.category || b.booking_type || "").toUpperCase();
          return ["TRAIN", "BUS", "FLIGHT"].includes(cat) || !b.category;
        });
        setBookings(ticketBookings);

        if (initialBookingId) {
          const found = ticketBookings.find((b: any) => b.id === initialBookingId);
          if (found) selectBooking(found);
        } else if (ticketBookings.length > 0 && !selectedBooking) {
          selectBooking(ticketBookings[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch bookings for fare editor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
      setTariffs(getSavedTicketTariffs());
    }
  }, [isOpen]);

  const selectBooking = (b: any) => {
    setSelectedBooking(b);
    const total = Number(b.total_amount ?? b.ticket_amount ?? 0);
    const base = Number(b.base_amount ?? total);
    const tax = Number(b.tax_amount ?? b.gst_amount ?? 0);
    const paid = Number(b.amount_paid ?? b.paid_total ?? 0);
    setFareAmount(total > 0 ? String(total) : "");
    setBaseFare(base > 0 ? String(base) : "");
    setTaxAmount(tax > 0 ? String(tax) : "");
    setAdvancePaid(paid > 0 ? String(paid) : "");
    setAdminNotes(b.admin_notes || b.notes || "");
  };

  // Filtered bookings list
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const cat = String(b.category || b.booking_type || "").toUpperCase();
      if (categoryFilter !== "ALL" && cat !== categoryFilter) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const name = String(b.passenger_name || "").toLowerCase();
      const phone = String(b.passenger_phone || "").toLowerCase();
      const bNum = String(b.booking_number || "").toLowerCase();
      const pnr = String(b.pnr_number || b.ticket_number || "").toLowerCase();
      const from = String(b.from_location || "").toLowerCase();
      const to = String(b.to_location || "").toLowerCase();
      return (
        name.includes(q) ||
        phone.includes(q) ||
        bNum.includes(q) ||
        pnr.includes(q) ||
        from.includes(q) ||
        to.includes(q)
      );
    });
  }, [bookings, categoryFilter, searchTerm]);

  // Live balance calculation
  const computedTotal = Number(fareAmount) || 0;
  const computedPaid = Number(advancePaid) || 0;
  const computedBalance = Math.max(0, computedTotal - computedPaid);

  // Save Booking Fare
  const handleSaveBookingFare = async () => {
    if (!selectedBooking) return;
    if (!fareAmount || Number(fareAmount) < 0) {
      toast.error("Please enter a valid fare amount (₹)");
      return;
    }

    setSaving(true);
    try {
      const headers = getAdminAuthHeaders();
      const payload: any = {
        id: selectedBooking.id,
        total_amount: computedTotal,
        ticket_amount: computedTotal,
        base_amount: Number(baseFare) || computedTotal,
        tax_amount: Number(taxAmount) || 0,
        admin_notes: adminNotes,
      };

      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        // If advance amount paid was adjusted upward, also record the payment
        const currentPaid = Number(selectedBooking.amount_paid ?? selectedBooking.paid_total ?? 0);
        if (computedPaid > currentPaid) {
          await fetch(`/api/bookings/${selectedBooking.id}/payments`, {
            method: "POST",
            credentials: "include",
            headers,
            body: JSON.stringify({
              amount: computedPaid - currentPaid,
              payment_method: "Cash",
              notes: "Advance payment updated via Fare Amount Editor",
            }),
          }).catch(() => {});
        }

        toast.success(`Fare amount updated to ₹${computedTotal.toLocaleString("en-IN")} for ${selectedBooking.booking_number || "Booking"}`);
        // Update local state
        setBookings((prev) =>
          prev.map((item) =>
            item.id === selectedBooking.id
              ? {
                  ...item,
                  ...payload,
                  paid_total: computedPaid,
                  remaining_amount: computedBalance,
                }
              : item
          )
        );
        setSelectedBooking((prev: any) => ({
          ...prev,
          ...payload,
          amount_paid: computedPaid,
          balance_amount: computedBalance,
        }));
        if (onBookingUpdated) onBookingUpdated();
      } else {
        toast.error(data.error || "Failed to update fare amount");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update fare amount");
    } finally {
      setSaving(false);
    }
  };

  // Save Default Tariffs
  const handleSaveTariffs = () => {
    try {
      localStorage.setItem("FT_TICKET_FARE_TARIFFS", JSON.stringify(tariffs));
      toast.success("Default ticket fare tariffs saved successfully!");
    } catch {
      toast.error("Failed to save default tariffs to local storage");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063f2d] via-[#086a46] to-[#0b1329] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-inner">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Ticket Fare Amount Editor
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase">
                  Ticketing Hub
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Edit individual ticket booking fares, base tariffs, and passenger pricing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "bookings"
                ? "bg-white text-[#063f2d] shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>Edit Booking Fares</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-md bg-emerald-100 text-[#063f2d] text-[10px]">
              {bookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tariffs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "tariffs"
                ? "bg-white text-[#063f2d] shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Default Class Tariffs</span>
          </button>
        </div>

        {/* Tab 1: Edit Booking Fares */}
        {activeTab === "bookings" && (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Left Column: Bookings Search & List */}
            <div className="w-full md:w-5/12 border-r border-slate-200 flex flex-col overflow-hidden bg-slate-50/50">
              {/* Category Filter Chips & Search Bar */}
              <div className="p-3.5 space-y-2 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-1.5">
                  {(["ALL", "TRAIN", "BUS", "FLIGHT"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`flex-1 py-1 text-[11px] font-extrabold rounded-lg transition text-center cursor-pointer ${
                        categoryFilter === cat
                          ? "bg-[#063f2d] text-white shadow-2xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, phone, PNR..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Bookings List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
                {loading ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                    <span>Loading tickets...</span>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No matching bookings found
                  </div>
                ) : (
                  filteredBookings.map((b) => {
                    const isSelected = selectedBooking?.id === b.id;
                    const cat = String(b.category || b.booking_type || "TRAIN").toUpperCase();
                    const total = Number(b.total_amount ?? b.ticket_amount ?? 0);
                    const paid = Number(b.amount_paid ?? b.paid_total ?? 0);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => selectBooking(b)}
                        className={`w-full text-left p-3 rounded-2xl transition border cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/90 border-[#063f2d] shadow-xs"
                            : "bg-white hover:bg-slate-100/80 border-slate-200/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`p-1.5 rounded-lg text-xs ${
                                cat === "TRAIN"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : cat === "BUS"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-sky-100 text-sky-700"
                              }`}
                            >
                              {cat === "TRAIN" && <TrainFront className="w-3.5 h-3.5" />}
                              {cat === "BUS" && <Bus className="w-3.5 h-3.5" />}
                              {cat === "FLIGHT" && <Plane className="w-3.5 h-3.5" />}
                            </span>
                            <div>
                              <p className="font-extrabold text-slate-900 text-xs line-clamp-1">
                                {b.passenger_name || "Unnamed Passenger"}
                              </p>
                              <p className="text-[10px] text-slate-500 font-semibold">
                                {b.booking_number || `BK-${b.id}`} · {b.pnr_number ? `PNR: ${b.pnr_number}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-xs text-[#063f2d]">
                              ₹{total.toLocaleString("en-IN")}
                            </span>
                            <p className="text-[9px] font-bold text-slate-400">
                              {paid >= total && total > 0 ? (
                                <span className="text-emerald-700 font-extrabold">Paid</span>
                              ) : (
                                <span>Bal: ₹{(total - paid).toLocaleString("en-IN")}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {(b.from_location || b.to_location) && (
                          <div className="mt-2 text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {b.from_location || "—"} → {b.to_location || "—"}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Fare Editor Form */}
            <div className="w-full md:w-7/12 flex flex-col overflow-y-auto p-5 sm:p-6 bg-white space-y-5">
              {selectedBooking ? (
                <>
                  {/* Selected Booking Info Card */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#063f2d] text-white text-[10px] font-extrabold uppercase">
                          {selectedBooking.category || selectedBooking.booking_type || "TICKET"}
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {selectedBooking.booking_number || `ID #${selectedBooking.id}`}
                        </span>
                      </div>
                      {selectedBooking.departure_datetime && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(selectedBooking.departure_datetime)}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Passenger
                        </span>
                        <span className="font-extrabold text-slate-800">
                          {selectedBooking.passenger_name || "—"}
                        </span>
                        {selectedBooking.passenger_phone && (
                          <span className="text-[11px] text-slate-500 block">
                            {selectedBooking.passenger_phone}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Route & Class
                        </span>
                        <span className="font-extrabold text-slate-800 line-clamp-1">
                          {selectedBooking.from_location || "Origin"} → {selectedBooking.to_location || "Dest"}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {selectedBooking.travel_class || selectedBooking.bus_type || selectedBooking.cabin_class || "Standard"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fare Editing Inputs */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                      Fare Amount Breakdown
                    </h4>

                    {/* Prominent Ticket Fare Amount */}
                    <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200">
                      <label className="block text-xs font-black text-amber-950 mb-1">
                        Total Ticket Fare Amount (₹) *
                      </label>
                      <p className="text-[11px] text-amber-800 mb-2 font-medium">
                        This is the official ticket fare displayed on passenger vouchers & PDF tickets.
                      </p>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-amber-700 font-black text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={fareAmount}
                          onChange={(e) => setFareAmount(e.target.value)}
                          placeholder="e.g. 1850"
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-amber-300 bg-white text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Secondary Components: Base Fare & Tax */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Base Fare (₹) (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={baseFare}
                            onChange={(e) => setBaseFare(e.target.value)}
                            placeholder="Base amount"
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Taxes & GST (₹) (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={taxAmount}
                            onChange={(e) => setTaxAmount(e.target.value)}
                            placeholder="Taxes"
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advance Paid & Live Balance */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Advance / Amount Paid (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={advancePaid}
                            onChange={(e) => setAdvancePaid(e.target.value)}
                            placeholder="Paid amount"
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-100/80 rounded-xl p-2.5 border border-slate-200 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          Remaining Balance
                        </span>
                        <span
                          className={`text-base font-black ${
                            computedBalance > 0 ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          ₹{computedBalance.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Admin notes */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Fare Adjustment Notes / Remarks
                      </label>
                      <input
                        type="text"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="e.g. Revised Tatkal quota tariff, special senior discount"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveBookingFare}
                      className="flex-1 py-3 px-5 rounded-2xl bg-[#063f2d] hover:bg-[#086a46] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Updating Fare...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-amber-400" />
                          <span>Save &amp; Update Fare Amount</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="m-auto text-center py-12 text-slate-400 space-y-2">
                  <Ticket className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs font-bold">Select a booking from the left to edit its fare amount</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Default Class Tariffs */}
        {activeTab === "tariffs" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed font-medium">
              <p className="font-bold text-blue-950 flex items-center gap-1.5 mb-1">
                <Sliders className="w-4 h-4 text-blue-700" />
                Default Fare Rates Configuration
              </p>
              These per-seat baseline rates are used when booking offline Train, Bus, and Flight tickets before custom manual overrides.
            </div>

            {/* Train Tariffs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
                <TrainFront className="w-4 h-4" />
                <span>IRCTC Train Class Tariffs (per passenger)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(
                  [
                    { key: "1A", label: "1A - AC First Class" },
                    { key: "2A", label: "2A - AC 2-Tier" },
                    { key: "3A", label: "3A - AC 3-Tier" },
                    { key: "3E", label: "3E - AC 3-Economy" },
                    { key: "CC", label: "CC - AC Chair Car" },
                    { key: "SL", label: "SL - Sleeper Class" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{label}</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={tariffs.train[key]}
                        onChange={(e) =>
                          setTariffs((prev) => ({
                            ...prev,
                            train: { ...prev.train, [key]: Number(e.target.value) || 0 },
                          }))
                        }
                        className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bus Tariffs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-orange-700 font-black text-sm">
                <Bus className="w-4 h-4" />
                <span>Bus Fleet Tariffs (per seat)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    { key: "volvo", label: "Volvo / Multi-Axle AC" },
                    { key: "sleeper", label: "AC Sleeper / Berth" },
                    { key: "seater", label: "Standard / Express Seater" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{label}</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={tariffs.bus[key]}
                        onChange={(e) =>
                          setTariffs((prev) => ({
                            ...prev,
                            bus: { ...prev.bus, [key]: Number(e.target.value) || 0 },
                          }))
                        }
                        className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Tariffs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-sky-700 font-black text-sm">
                <Plane className="w-4 h-4" />
                <span>Flight Cabin Tariffs (per passenger)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    { key: "economy", label: "Economy Cabin" },
                    { key: "business", label: "Business Cabin" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{label}</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={tariffs.flight[key]}
                        onChange={(e) =>
                          setTariffs((prev) => ({
                            ...prev,
                            flight: { ...prev.flight, [key]: Number(e.target.value) || 0 },
                          }))
                        }
                        className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveTariffs}
                className="py-2.5 px-6 rounded-2xl bg-[#063f2d] hover:bg-[#086a46] text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save Tariff Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Changes reflect immediately in PostgreSQL database &amp; client vouchers</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
