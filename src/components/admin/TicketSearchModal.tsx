import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  X,
  Search,
  RefreshCw,
  Ticket,
  TrainFront,
  Bus,
  Plane,
  Car,
  Compass,
  Pencil,
  Trash2,
  Printer,
  Download,
  Copy,
  Check,
  Phone,
  Calendar,
  MapPin,
  Clock,
  User,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Eye,
  CheckCircle2,
  FileText,
  DollarSign,
  Sparkles,
} from "lucide-react";
import logoAsset from "@/assets/fortune-tourism-logo.png";
import fullLogoAsset from "@/assets/fortune-tourism-full-logo.png";
import { downloadTicketCopyPDF, type TicketCopyData } from "@/lib/ticket-copy-pdf";

interface TicketRecord {
  id: number;
  ticket_number?: string;
  pnr_number?: string;
  booking_number?: string;
  booking_id?: string;
  booking_reference?: string;
  enquiry_number?: string;
  category?: string;
  booking_source?: string;
  booking_status?: string;
  passenger_name: string;
  passenger_phone: string;
  customer_email?: string;
  customer_address?: string;
  number_of_members?: number;
  package_name?: string;
  tour_type?: string;
  trip_type?: string;
  from_location?: string;
  to_location?: string;
  boarding_point?: string;
  departure_datetime?: string;
  return_date?: string;
  pickup_time?: string;
  number_of_days?: number;
  driver_name?: string;
  driver_phone?: string;
  taxi_number?: string;
  vehicle_type?: string;
  // Bus
  bus_type?: string;
  bus_number?: string;
  bus_operator?: string;
  seating_capacity?: number;
  // Train
  train_name?: string;
  train_number?: string;
  travel_class?: string;
  departure_time?: string;
  arrival_date?: string;
  arrival_time?: string;
  ticket_status?: string;
  ticket_amount?: number | string;
  // Flight
  airline?: string;
  flight_number?: string;
  cabin_class?: string;
  // Financials
  base_amount?: number | string;
  total_amount?: number | string;
  fare?: number | string;
  amount_paid?: number | string;
  paid_total?: number | string;
  balance_amount?: number | string;
  remaining_amount?: number | string;
  payment_status?: string;
  special_instructions?: string;
  notes?: string;
  created_at?: string;
  passengers?: Array<{
    name: string;
    age?: number | string;
    gender?: string;
    seat_berth?: string;
  }>;
}

interface TicketSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated?: () => void;
  initialQuery?: string;
}

async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const key =
    typeof window !== "undefined"
      ? sessionStorage.getItem("fortune_admin_key") ||
        localStorage.getItem("fortune_admin_key") ||
        ""
      : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (key) headers["x-admin-key"] = key;
  return fetch(url, { ...options, headers });
}

export function TicketSearchModal({
  isOpen,
  onClose,
  onTicketUpdated,
  initialQuery = "",
}: TicketSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TicketRecord>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Copy Feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load tickets from bookings API
  const fetchTickets = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await adminFetch("/api/bookings?limit=500&sortBy=travel_date_desc");
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          // Normalize records with tickets or PNRs
          const rows: TicketRecord[] = data.bookings.map((b: any) => ({
            ...b,
            ticket_number: b.ticket_number || b.booking_number || `TK-${b.id}`,
            pnr_number: b.pnr_number || `PNR-${b.id}`,
            total_amount: Number(b.total_amount || b.ticket_amount || b.base_amount || b.fare || 0),
          }));
          setTickets(rows);

          // Update currently selected ticket if present
          if (selectedTicket) {
            const found = rows.find((r) => r.id === selectedTicket.id);
            if (found) setSelectedTicket(found);
          } else if (rows.length > 0) {
            setSelectedTicket(rows[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
        if (!silent) toast.error("Could not fetch tickets list.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedTicket]
  );

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) setSearchQuery(initialQuery);
      fetchTickets();
    } else {
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialQuery, fetchTickets]);

  // When a ticket is selected, fetch full details (including passenger manifest)
  const handleSelectTicket = async (ticket: TicketRecord) => {
    setSelectedTicket(ticket);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    try {
      const res = await adminFetch(`/api/bookings/${ticket.id}`);
      const data = await res.json();
      if (data.success && data.booking) {
        setSelectedTicket({
          ...ticket,
          ...data.booking,
          passengers: data.passengers || [],
        });
      }
    } catch {
      // Fallback to list object
    }
  };

  // Filter tickets by query & category
  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (categoryFilter !== "ALL") {
      list = list.filter((t) => {
        const cat = (t.category || "").toUpperCase();
        if (categoryFilter === "CAR") return cat === "CAR" || cat === "TAXI";
        return cat === categoryFilter;
      });
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();

    return list.filter((t) => {
      const ticketNum = (t.ticket_number || "").toLowerCase();
      const pnrNum = (t.pnr_number || "").toLowerCase();
      const bookingNum = (t.booking_number || "").toLowerCase();
      const name = (t.passenger_name || "").toLowerCase();
      const phone = (t.passenger_phone || "").toLowerCase();
      const fromLoc = (t.from_location || "").toLowerCase();
      const toLoc = (t.to_location || "").toLowerCase();
      const driver = (t.driver_name || "").toLowerCase();
      const vehicle = (t.vehicle_type || t.bus_operator || t.airline || t.train_name || "").toLowerCase();

      return (
        ticketNum.includes(q) ||
        pnrNum.includes(q) ||
        bookingNum.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        fromLoc.includes(q) ||
        toLoc.includes(q) ||
        driver.includes(q) ||
        vehicle.includes(q)
      );
    });
  }, [tickets, categoryFilter, searchQuery]);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Open Edit Mode
  const startEditing = () => {
    if (!selectedTicket) return;
    setEditForm({
      passenger_name: selectedTicket.passenger_name || "",
      passenger_phone: selectedTicket.passenger_phone || "",
      customer_email: selectedTicket.customer_email || "",
      from_location: selectedTicket.from_location || "",
      to_location: selectedTicket.to_location || "",
      boarding_point: selectedTicket.boarding_point || "",
      departure_datetime: selectedTicket.departure_datetime || "",
      return_date: selectedTicket.return_date || "",
      ticket_number: selectedTicket.ticket_number || "",
      pnr_number: selectedTicket.pnr_number || "",
      total_amount: selectedTicket.total_amount || 0,
      payment_status: selectedTicket.payment_status || "PENDING",
      booking_status: selectedTicket.booking_status || "CONFIRMED",
      vehicle_type: selectedTicket.vehicle_type || selectedTicket.train_name || selectedTicket.bus_operator || selectedTicket.airline || "",
      notes: selectedTicket.notes || "",
    });
    setIsEditing(true);
  };

  // Save Updates
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSavingEdit(true);
    try {
      const payload: any = {
        id: selectedTicket.id,
        passenger_name: editForm.passenger_name,
        passenger_phone: editForm.passenger_phone,
        customer_email: editForm.customer_email,
        from_location: editForm.from_location,
        to_location: editForm.to_location,
        boarding_point: editForm.boarding_point,
        departure_datetime: editForm.departure_datetime,
        return_date: editForm.return_date,
        ticket_number: editForm.ticket_number,
        pnr_number: editForm.pnr_number,
        total_amount: Number(editForm.total_amount) || 0,
        fare: Number(editForm.total_amount) || 0,
        base_amount: Number(editForm.total_amount) || 0,
        ticket_amount: Number(editForm.total_amount) || 0,
        payment_status: editForm.payment_status,
        booking_status: editForm.booking_status,
        notes: editForm.notes,
      };

      if (selectedTicket.category === "TRAIN") {
        payload.train_name = editForm.vehicle_type;
      } else if (selectedTicket.category === "BUS") {
        payload.bus_operator = editForm.vehicle_type;
      } else if (selectedTicket.category === "FLIGHT") {
        payload.airline = editForm.vehicle_type;
      } else {
        payload.vehicle_type = editForm.vehicle_type;
      }

      const res = await adminFetch(`/api/bookings/${selectedTicket.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update ticket.");
      }

      toast.success(`Ticket ${selectedTicket.ticket_number} updated successfully!`);
      setIsEditing(false);

      // Refresh list and update selected
      await fetchTickets(true);
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/bookings/${selectedTicket.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete ticket.");
      }

      toast.success(
        `Ticket ${selectedTicket.ticket_number} (PNR: ${selectedTicket.pnr_number}) deleted.`
      );
      setShowDeleteConfirm(false);

      const deletedId = selectedTicket.id;
      // Remove from state immediately
      const remaining = tickets.filter((t) => t.id !== deletedId);
      setTickets(remaining);

      // Select next ticket if available
      const nextTicket = remaining[0] || null;
      setSelectedTicket(nextTicket);

      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ticket.");
    } finally {
      setDeleting(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = () => {
    if (!selectedTicket) return;
    const data: TicketCopyData = {
      ticketNumber: selectedTicket.ticket_number || `TK-${selectedTicket.id}`,
      pnrNumber: selectedTicket.pnr_number || `PNR-${selectedTicket.id}`,
      bookingDate: selectedTicket.created_at
        ? new Date(selectedTicket.created_at).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN"),
      passengerName: selectedTicket.passenger_name || "Valued Passenger",
      passengerPhone: selectedTicket.passenger_phone || "—",
      tourType: selectedTicket.tour_type || selectedTicket.package_name || selectedTicket.category || "Journey Ticket",
      fromLocation: selectedTicket.from_location || "Bengaluru",
      toLocation: selectedTicket.to_location || "Destination",
      departureOn: selectedTicket.departure_datetime
        ? new Date(selectedTicket.departure_datetime).toLocaleDateString("en-IN")
        : "As Scheduled",
      returnDate: selectedTicket.return_date || undefined,
      tripType: selectedTicket.trip_type || "ONE WAY",
      vehicleOrMode:
        selectedTicket.vehicle_type ||
        selectedTicket.train_name ||
        selectedTicket.bus_operator ||
        selectedTicket.airline ||
        "Executive Transport",
      boardingPoint: selectedTicket.boarding_point || selectedTicket.from_location || "Fortune Travels Hub",
      boardingAddress: selectedTicket.customer_address || "Bengaluru, Karnataka",
      serviceType: selectedTicket.category || "TRAVEL",
      fareAmount: selectedTicket.total_amount || 0,
      paymentStatus: selectedTicket.payment_status || "CONFIRMED",
    };

    downloadTicketCopyPDF(data);
    toast.success(`Downloading PDF for Ticket ${data.ticketNumber}`);
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    if (!selectedTicket) return;
    const ticketNo = selectedTicket.ticket_number || `TK-${selectedTicket.id}`;
    const pnrNo = selectedTicket.pnr_number || `PNR-${selectedTicket.id}`;
    const passenger = selectedTicket.passenger_name || "Valued Passenger";
    const phone = selectedTicket.passenger_phone || "";
    const from = selectedTicket.from_location || "Bengaluru";
    const to = selectedTicket.to_location || "Destination";
    const date = selectedTicket.departure_datetime
      ? new Date(selectedTicket.departure_datetime).toLocaleDateString("en-IN")
      : "As Scheduled";
    const fare = Number(selectedTicket.total_amount || 0).toLocaleString("en-IN");

    const message = `*FORTUNE TOURISM - CONFIRMED TICKET*\n\n🎫 *Ticket Number:* ${ticketNo}\n🔢 *PNR Number:* ${pnrNo}\n👤 *Passenger Name:* ${passenger}\n📞 *Contact:* ${phone}\n📍 *Route:* ${from} ➔ ${to}\n📅 *Travel Date:* ${date}\n💰 *Total Fare:* ₹${fare}\n✅ *Status:* ${selectedTicket.payment_status || "CONFIRMED"}\n\n*Support Hotline:* +91 9740463404\n*Office:* No.256/A next to Narayana Hospital, Bommasandra, Bangalore.`;

    const cleanPhone = phone.replace(/\D/g, "");
    const url = cleanPhone.length >= 10
      ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl max-h-[94vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
        
        {/* ================= MODAL TOP HEADER ================= */}
        <div className="bg-gradient-to-r from-[#063f2d] via-[#085a3c] to-[#063f2d] text-white px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/50 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src={logoAsset}
                alt="Fortune Tourism"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 text-white">
                  <Ticket className="w-5 h-5 text-amber-400" />
                  Ticket &amp; PNR Search Center
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Tickets Database
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                Lookup generated journey tickets by Ticket No, PNR, Passenger or Phone. View, Update, or Delete.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchTickets(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
              title="Refresh tickets from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-300" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close Ticket Search Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= SEARCH & CATEGORY BAR ================= */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-7 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Ticket No (e.g. TK-2026...), PNR No (e.g. PNR-...), Passenger Name, or Phone..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 bg-white text-xs sm:text-sm font-semibold text-slate-900 outline-none shadow-2xs transition"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Total Count Chip */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs font-bold text-slate-600 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <Ticket className="w-4 h-4 text-emerald-600" />
              <span>Showing: <strong className="text-slate-900 font-extrabold">{filteredTickets.length}</strong> of {tickets.length} tickets</span>
            </div>
          </div>

          {/* Quick Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none scrollbar-none">
            {[
              { id: "ALL", label: "All Tickets", icon: Ticket },
              { id: "TRAIN", label: "Train (IRCTC)", icon: TrainFront },
              { id: "BUS", label: "Bus", icon: Bus },
              { id: "FLIGHT", label: "Flight", icon: Plane },
              { id: "CAR", label: "Car / Taxi", icon: Car },
              { id: "TOUR", label: "Tour Packages", icon: Compass },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#063f2d] text-white shadow-xs font-extrabold"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= MAIN CONTENT: SPLIT VIEW ================= */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* ================= LEFT LIST: GENERATED TICKETS EXPLORER (4 COLS) ================= */}
          <div className="lg:col-span-4 flex flex-col h-[320px] lg:h-auto overflow-hidden bg-slate-50/50">
            <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-between">
              <span>MATCHING TICKETS ({filteredTickets.length})</span>
              <span className="text-[10px] text-slate-400">Click ticket to preview</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 p-2 space-y-1">
              {loading && tickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                  <p className="text-xs font-semibold">Loading generated tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Search className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">No tickets found</p>
                  <p className="text-[11px] text-slate-400">
                    Try searching by another ticket number or PNR.
                  </p>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  const cat = (t.category || "CAR").toUpperCase();
                  const fare = Number(t.total_amount || 0);

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTicket(t)}
                      className={`p-3 rounded-2xl transition cursor-pointer border ${
                        isSelected
                          ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono font-black text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Ticket className="w-3 h-3 text-amber-600" />
                          {t.ticket_number || `TK-${t.id}`}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            t.payment_status === "PAID"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {t.payment_status || "PENDING"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="font-extrabold text-sm text-slate-900 truncate">
                          {t.passenger_name || "Valued Passenger"}
                        </div>
                        <div className="font-black text-emerald-600 text-sm whitespace-nowrap">
                          ₹{fare.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{t.passenger_phone || "No phone"}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">{cat}</span>
                      </div>

                      <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5 mt-1 pt-1 border-t border-slate-100">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{t.from_location || "Bengaluru"}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                        <span className="truncate">{t.to_location || "Destination"}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mt-1">
                        <span>PNR: <strong className="text-slate-700 font-mono">{t.pnr_number || "—"}</strong></span>
                        <span>{t.departure_datetime ? new Date(t.departure_datetime).toLocaleDateString("en-IN") : "—"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT MAIN: OFFICIAL GENERATED TICKET VIEW (8 COLS) ================= */}
          <div className="lg:col-span-8 flex flex-col h-[520px] lg:h-auto overflow-y-auto bg-slate-100/60 p-3 sm:p-6 space-y-4">
            {selectedTicket ? (
              <>
                {/* Action Bar Above Ticket */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-emerald-600" />
                      Ticket Controls:
                    </span>
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {selectedTicket.ticket_number}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Update / Edit Button */}
                    <button
                      type="button"
                      onClick={() => (isEditing ? setIsEditing(false) : startEditing())}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                        isEditing
                          ? "bg-slate-800 text-white hover:bg-slate-900"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                      title="Update ticket details, passenger info, fare amount, and status"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{isEditing ? "Cancel Edit" : "Update Ticket"}</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer shadow-xs"
                      title="Delete this generated ticket from bookings database"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>

                    {/* PDF Download */}
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer shadow-2xs"
                      title="Download PDF Ticket Copy"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Print */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer shadow-2xs"
                      title="Print Ticket Copy"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Print</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer shadow-2xs"
                      title="Share ticket details to customer on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* ================= INLINE UPDATE / EDIT PANEL ================= */}
                {isEditing && (
                  <form
                    onSubmit={handleSaveUpdate}
                    className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Update Ticket: {selectedTicket.ticket_number}
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Editing Mode
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-amber-900 block mb-1">Ticket Number *</label>
                        <input
                          type="text"
                          required
                          value={editForm.ticket_number || ""}
                          onChange={(e) => setEditForm({ ...editForm, ticket_number: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-amber-300 rounded-xl focus:border-amber-600 outline-none font-mono font-bold text-slate-900 bg-amber-50/40"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">PNR Number</label>
                        <input
                          type="text"
                          value={editForm.pnr_number || ""}
                          onChange={(e) => setEditForm({ ...editForm, pnr_number: e.target.value })}
                          placeholder="e.g. 4234567890 / PNR-..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Passenger Name *</label>
                        <input
                          type="text"
                          required
                          value={editForm.passenger_name || ""}
                          onChange={(e) => setEditForm({ ...editForm, passenger_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Passenger Phone *</label>
                        <input
                          type="text"
                          required
                          value={editForm.passenger_phone || ""}
                          onChange={(e) => setEditForm({ ...editForm, passenger_phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Customer Email</label>
                        <input
                          type="email"
                          value={editForm.customer_email || ""}
                          onChange={(e) => setEditForm({ ...editForm, customer_email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">FROM (Origin)</label>
                        <input
                          type="text"
                          value={editForm.from_location || ""}
                          onChange={(e) => setEditForm({ ...editForm, from_location: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">TO (Destination)</label>
                        <input
                          type="text"
                          value={editForm.to_location || ""}
                          onChange={(e) => setEditForm({ ...editForm, to_location: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Boarding Point</label>
                        <input
                          type="text"
                          value={editForm.boarding_point || ""}
                          onChange={(e) => setEditForm({ ...editForm, boarding_point: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Departure Date</label>
                        <input
                          type="text"
                          value={editForm.departure_datetime || ""}
                          onChange={(e) => setEditForm({ ...editForm, departure_datetime: e.target.value })}
                          placeholder="YYYY-MM-DD or date string"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Vehicle / Train / Flight</label>
                        <input
                          type="text"
                          value={editForm.vehicle_type || ""}
                          onChange={(e) => setEditForm({ ...editForm, vehicle_type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-emerald-800 block mb-1">Total Fare Amount (₹) *</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={editForm.total_amount ?? ""}
                          onChange={(e) => setEditForm({ ...editForm, total_amount: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-emerald-500 rounded-xl focus:border-emerald-700 outline-none font-black text-emerald-700 bg-emerald-50/30"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Payment Status</label>
                        <select
                          value={editForm.payment_status || "PENDING"}
                          onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                        >
                          <option value="PAID">PAID</option>
                          <option value="PARTIAL">PARTIAL</option>
                          <option value="PENDING">PENDING</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Booking Status</label>
                        <select
                          value={editForm.booking_status || "CONFIRMED"}
                          onChange={(e) => setEditForm({ ...editForm, booking_status: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PENDING CONFIRMATION">PENDING CONFIRMATION</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="font-bold text-slate-700 block mb-1">Notes / Instructions</label>
                        <input
                          type="text"
                          value={editForm.notes || ""}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                          placeholder="Optional trip notes..."
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="px-6 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {savingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>Save Updates</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* ================= DELETE CONFIRMATION DIALOG ================= */}
                {showDeleteConfirm && (
                  <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-800">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <h4 className="text-sm font-black">
                        Confirm Delete Ticket: {selectedTicket.ticket_number}?
                      </h4>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      Are you sure you want to permanently delete Ticket <strong>{selectedTicket.ticket_number}</strong> (PNR: <strong>{selectedTicket.pnr_number}</strong>) booked for <strong>{selectedTicket.passenger_name}</strong>?
                      <br />
                      <span className="text-[11px] text-rose-900 font-bold">
                        ⚠️ This will permanently remove the record from bookings, day book, and accounting reports.
                      </span>
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white border border-slate-300 transition cursor-pointer"
                      >
                        No, Keep Ticket
                      </button>
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={handleDeleteTicket}
                        className="px-5 py-1.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>Yes, Delete Ticket</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= OFFICIAL TICKET COPY CARD ================= */}
                <div
                  id="ticket-search-voucher-card"
                  className="bg-white border-2 border-slate-900 rounded-2xl p-5 sm:p-7 shadow-md space-y-4"
                >
                  {/* Brand Header */}
                  <div className="border-b-2 border-slate-900 pb-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="space-y-1 text-center sm:text-left">
                        <img
                          src={fullLogoAsset}
                          alt="FORTUNE Tourism"
                          className="h-8 sm:h-10 w-auto object-contain mx-auto sm:mx-0"
                        />
                        <div className="text-[11px] sm:text-xs font-bold text-slate-800">
                          Address: No.256/A next To Narayana Hospital, Health City, Bommasandra Bangalore.560099
                        </div>
                      </div>

                      <div className="text-center sm:text-right">
                        <div className="text-xs font-extrabold text-slate-950">
                          Hotline: +91 9740463404
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                          BOOKING DATE:{" "}
                          <span className="font-extrabold text-slate-950 font-mono">
                            {selectedTicket.created_at
                              ? new Date(selectedTicket.created_at).toLocaleString("en-IN")
                              : "Confirmed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Banner Ribbon */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
                    <div className="text-slate-950 font-black tracking-wide text-base sm:text-lg flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-emerald-700" />
                      Official Journey Ticket Copy
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                        TOTAL FARE :
                        <strong className="font-mono font-black text-emerald-700 text-sm sm:text-base">
                          ₹{Number(selectedTicket.total_amount || 0).toLocaleString("en-IN")}
                        </strong>
                      </span>
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                        TICKET NO :
                        <strong className="font-mono font-black text-amber-800 text-sm tracking-wider">
                          {selectedTicket.ticket_number}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedTicket.ticket_number || "", "Ticket Number")}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                          title="Copy Ticket Number"
                        >
                          {copiedField === "Ticket Number" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </span>
                    </div>
                  </div>

                  {/* Spreadsheet Grid Table */}
                  <div className="overflow-x-auto border-2 border-slate-900 rounded-sm">
                    <table className="w-full text-xs text-left border-collapse font-sans">
                      <tbody>
                        {/* Row 1: Passenger Name, Phone, Sector */}
                        <tr className="border-b border-slate-900 divide-x divide-slate-900">
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-36 whitespace-nowrap">
                            Passenger Name:
                          </td>
                          <td className="p-2.5 font-black text-slate-900 uppercase">
                            {selectedTicket.passenger_name}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-36 whitespace-nowrap">
                            Phone Number:
                          </td>
                          <td className="p-2.5 font-black text-slate-900 font-mono">
                            {selectedTicket.passenger_phone || "—"}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-28 whitespace-nowrap">
                            Service Sector:
                          </td>
                          <td className="p-2.5 font-extrabold text-slate-900 uppercase">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300 text-[10px]">
                              {selectedTicket.category || "TOUR"}
                            </span>
                          </td>
                        </tr>

                        {/* Row 2: FROM | TO */}
                        <tr className="border-b border-slate-900 divide-x divide-slate-900">
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            FROM (Origin):
                          </td>
                          <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                            {selectedTicket.from_location || "Bengaluru"}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            TO (Destination):
                          </td>
                          <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                            {selectedTicket.to_location || "—"}
                          </td>
                        </tr>

                        {/* Row 3: Ticket Number | PNR Number | Departure On */}
                        <tr className="border-b border-slate-900 divide-x divide-slate-900">
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            Ticket Number:
                          </td>
                          <td className="p-2.5 font-black font-mono text-amber-700 text-sm tracking-wider">
                            {selectedTicket.ticket_number}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            PNR Number:
                          </td>
                          <td className="p-2.5 font-black font-mono text-slate-950 text-sm tracking-wider flex items-center justify-between">
                            <span>{selectedTicket.pnr_number}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(selectedTicket.pnr_number || "", "PNR Number")}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer ml-1"
                              title="Copy PNR"
                            >
                              {copiedField === "PNR Number" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            Departure On:
                          </td>
                          <td className="p-2.5 font-black text-slate-900">
                            {selectedTicket.departure_datetime
                              ? new Date(selectedTicket.departure_datetime).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "As Scheduled"}
                          </td>
                        </tr>

                        {/* Row 4: Mode / Vehicle | Boarding Point */}
                        <tr className="border-b border-slate-900 divide-x divide-slate-900">
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            Vehicle / Operator:
                          </td>
                          <td colSpan={2} className="p-2.5 font-black text-slate-900">
                            {selectedTicket.vehicle_type ||
                              selectedTicket.train_name ||
                              selectedTicket.bus_operator ||
                              selectedTicket.airline ||
                              "Executive Transport"}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            Boarding Point:
                          </td>
                          <td colSpan={2} className="p-2.5 font-bold text-slate-900">
                            {selectedTicket.boarding_point || selectedTicket.from_location || "Fortune Travels Hub"}
                          </td>
                        </tr>

                        {/* Row 5: Financial Breakdown & Status */}
                        <tr className="divide-x divide-slate-900">
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            Total Fare:
                          </td>
                          <td className="p-2.5 font-black text-emerald-700 text-sm">
                            ₹{Number(selectedTicket.total_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            Payment Status:
                          </td>
                          <td className="p-2.5 font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                selectedTicket.payment_status === "PAID"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border border-rose-300"
                              }`}
                            >
                              {selectedTicket.payment_status || "PENDING"}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                            Booking Status:
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">
                            <span className="font-extrabold text-slate-900">
                              {selectedTicket.booking_status || "CONFIRMED"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Co-Passengers List if available */}
                  {selectedTicket.passengers && selectedTicket.passengers.length > 0 && (
                    <div className="border border-slate-300 rounded-xl overflow-hidden mt-2">
                      <div className="bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Passenger Manifest ({selectedTicket.passengers.length} Co-passengers)</span>
                      </div>
                      <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-600 uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-2">#</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Age</th>
                            <th className="p-2">Gender</th>
                            <th className="p-2">Seat / Berth</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedTicket.passengers.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-2 font-bold text-slate-900">{p.name}</td>
                              <td className="p-2 text-slate-600">{p.age || "—"}</td>
                              <td className="p-2 text-slate-600">{p.gender || "—"}</td>
                              <td className="p-2 font-mono font-bold text-slate-800">{p.seat_berth || "Confirmed"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Notes / Special Instructions */}
                  {selectedTicket.notes && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 font-medium">
                      <strong>Notes:</strong> {selectedTicket.notes}
                    </div>
                  )}

                  {/* Footer Terms */}
                  <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                    <div>
                      Official Fortune Tourism Ticket Voucher. Present this copy during boarding.
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Secure Ticket Record
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <Ticket className="w-12 h-12 text-slate-300" />
                <h3 className="font-extrabold text-slate-700 text-sm">
                  Select a Ticket to View Details
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Search by Ticket Number, PNR, or Passenger Name from the left list to inspect, edit, or delete the generated ticket copy.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time ticket search connected to PostgreSQL bookings</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
