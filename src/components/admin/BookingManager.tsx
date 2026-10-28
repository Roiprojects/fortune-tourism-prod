import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Search,
  Calendar,
  Download,
  Printer,
  Edit3,
  Trash2,
  Eye,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ArrowUpDown,
  Filter,
  CreditCard,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDateTime, formatDate, type BookingData } from "@/lib/booking-utils";
import { downloadBookingPDF, printBookingPDF } from "@/lib/booking-pdf";
import { downloadSmartPDF, printSmartPDF } from "@/lib/client-pdf";
import {
  TOUR_TYPES,
  TRIP_TYPES,
  VEHICLE_TYPE_OPTIONS,
  PAYMENT_STATUSES,
  BOOKING_STATUSES,
} from "@/lib/booking-utils";

// ────────────────────────────── DAY BOOKINGS ──────────────────────────────

export function DayBookingsManager() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("today");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let startDate = "";
      let endDate = "";
      const today = new Date().toISOString().split("T")[0];

      if (dateFilter === "today") {
        startDate = today;
        endDate = today;
      } else if (dateFilter === "tomorrow") {
        const tm = new Date();
        tm.setDate(tm.getDate() + 1);
        startDate = tm.toISOString().split("T")[0];
        endDate = startDate;
      } else if (dateFilter === "week") {
        const ws = new Date();
        ws.setDate(ws.getDate() - ws.getDay());
        startDate = ws.toISOString().split("T")[0];
        endDate = today;
      } else if (dateFilter === "month") {
        const ms = new Date();
        ms.setDate(1);
        startDate = ms.toISOString().split("T")[0];
        endDate = today;
      }

      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/bookings?${params}`);
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const grouped = bookings.reduce<Record<string, BookingData[]>>((acc, b) => {
    const date = new Date(b.created_at || b.booking_date || "").toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    (acc[date] ||= []).push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="font-heading text-lg font-bold text-slate-900">Day Booking</h3>
        <div className="flex gap-1.5 ml-auto">
          {[
            { key: "today", label: "Today" },
            { key: "tomorrow", label: "Tomorrow" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                dateFilter === f.key
                  ? "bg-[#0B1F3A] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading bookings...
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No bookings found for this period.
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-heading text-sm font-bold text-slate-900">{date}</span>
              <span className="text-xs font-semibold text-slate-500">
                {items.length} booking(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100/70 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Ticket</th>
                    <th className="px-4 py-2.5">Passenger</th>
                    <th className="px-4 py-2.5">Package</th>
                    <th className="px-4 py-2.5">Driver</th>
                    <th className="px-4 py-2.5">Vehicle</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                    <th className="px-4 py-2.5 text-right">Paid</th>
                    <th className="px-4 py-2.5 text-right">Balance</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-[#0B1F3A]">{b.ticket_number}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{b.passenger_name}</span>
                        <br />
                        <span className="text-slate-500">{b.passenger_phone}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[150px] truncate">{b.package_name || "—"}</td>
                      <td className="px-4 py-3">{b.driver_name || "—"}</td>
                      <td className="px-4 py-3">{b.taxi_number || b.vehicle_type || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(Number(b.total_amount) || 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                        {formatCurrency(Number(b.amount_paid) || 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-700 font-semibold">
                        {formatCurrency(Number(b.balance_amount) || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.payment_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ────────────────────────────── BOOKING LIST ──────────────────────────────

export function BookingListManager() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tourTypeFilter, setTourTypeFilter] = useState("");
  const [editingBooking, setEditingBooking] = useState<BookingData | null>(null);
  const [viewingPayments, setViewingPayments] = useState<BookingData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [collectPaymentBooking, setCollectPaymentBooking] = useState<BookingData | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("UPI");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);
      if (statusFilter) params.set("bookingStatus", statusFilter);
      if (tourTypeFilter) params.set("tourType", tourTypeFilter);
      params.set("limit", "500");

      const res = await fetch(`/api/bookings?${params}`);
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [search, paymentFilter, statusFilter, tourTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchBookings, 300);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const adminKey =
        sessionStorage.getItem("fortune_admin_key") ||
        localStorage.getItem("fortune_admin_key") ||
        "Admin@fortunetourism2026";
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Booking deleted");
        setBookings((prev) => prev.filter((b) => b.id !== id));
        try {
          const stored: string[] = JSON.parse(localStorage.getItem("fortune_deleted_transaction_ids") || "[]");
          const next = Array.from(new Set([...stored, String(id), `bkg-${id}`, `bkg-txn-${id}`]));
          localStorage.setItem("fortune_deleted_transaction_ids", JSON.stringify(next));
        } catch {}
      }
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  const handleEdit = async () => {
    if (!editingBooking) return;
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passenger_name: editingBooking.passenger_name,
          passenger_phone: editingBooking.passenger_phone,
          number_of_members: editingBooking.number_of_members,
          package_name: editingBooking.package_name,
          tour_type: editingBooking.tour_type,
          trip_type: editingBooking.trip_type,
          from_location: editingBooking.from_location,
          to_location: editingBooking.to_location,
          boarding_point: editingBooking.boarding_point,
          departure_datetime: editingBooking.departure_datetime,
          driver_name: editingBooking.driver_name,
          driver_phone: editingBooking.driver_phone,
          taxi_number: editingBooking.taxi_number,
          vehicle_type: editingBooking.vehicle_type,
          total_amount: editingBooking.total_amount,
          advance_amount: editingBooking.advance_amount,
          booking_status: editingBooking.booking_status,
          notes: editingBooking.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Booking updated");
        setEditingBooking(null);
        fetchBookings();
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const handleViewPayments = async (booking: BookingData) => {
    setViewingPayments(booking);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/payments`);
      const data = await res.json();
      if (data.success) setPaymentHistory(data.payments);
    } catch {
      toast.error("Failed to load payment history");
    }
  };

  const handleCollectPayment = async () => {
    if (!collectPaymentBooking || !payAmount || Number(payAmount) <= 0) return;
    try {
      const res = await fetch(`/api/bookings/${collectPaymentBooking.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(payAmount), payment_method: payMethod }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payment of ${formatCurrency(Number(payAmount))} recorded`);
        setCollectPaymentBooking(null);
        setPayAmount("");
        fetchBookings();
      } else {
        toast.error(data.error || "Failed to record payment");
      }
    } catch {
      toast.error("Failed to record payment");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="font-heading text-lg font-bold text-slate-900">All Bookings</h3>
        <div className="relative ml-auto flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, ticket, PNR..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#0E6B50]"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
        >
          <option value="">All Payment Status</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
        >
          <option value="">All Booking Status</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No bookings found.</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100/70 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">PNR</th>
                  <th className="px-4 py-3">Passenger</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Departure</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-bold text-[#0B1F3A]">{b.ticket_number}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{b.pnr_number}</td>
                    <td className="px-4 py-3 font-semibold">{b.passenger_name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.passenger_phone}</td>
                    <td className="px-4 py-3 text-center">{b.number_of_members}</td>
                    <td className="px-4 py-3 max-w-[120px] truncate" title={b.package_name || ""}>
                      {b.package_name || "—"}
                    </td>
                    <td className="px-4 py-3">{b.driver_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(b.departure_datetime)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(Number(b.total_amount) || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                      {formatCurrency(Number(b.amount_paid) || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-700 font-semibold">
                      {formatCurrency(Number(b.balance_amount) || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.payment_status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingBooking({ ...b })}
                          className="p-1 rounded hover:bg-blue-50 text-blue-600"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleViewPayments(b)}
                          className="p-1 rounded hover:bg-emerald-50 text-emerald-600"
                          title="Payment History"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => downloadBookingPDF(b)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-600"
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setCollectPaymentBooking(b)}
                          className="p-1 rounded hover:bg-amber-50 text-amber-600"
                          title="Collect Payment"
                        >
                          <IndianRupee className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id!)}
                          className="p-1 rounded hover:bg-red-50 text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingBooking && (
        <Dialog onClose={() => setEditingBooking(null)} title="Edit Booking">
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
            <InputField
              label="Passenger Name"
              value={editingBooking.passenger_name || ""}
              onChange={(v) => setEditingBooking({ ...editingBooking, passenger_name: v })}
            />
            <InputField
              label="Phone"
              value={editingBooking.passenger_phone || ""}
              onChange={(v) => setEditingBooking({ ...editingBooking, passenger_phone: v })}
            />
            <InputField
              label="Members"
              type="number"
              value={String(editingBooking.number_of_members || 1)}
              onChange={(v) =>
                setEditingBooking({ ...editingBooking, number_of_members: Number(v) })
              }
            />
            <InputField
              label="Package"
              value={editingBooking.package_name || ""}
              onChange={(v) => setEditingBooking({ ...editingBooking, package_name: v })}
            />
            <InputField
              label="Boarding Point"
              value={editingBooking.boarding_point || ""}
              onChange={(v) => setEditingBooking({ ...editingBooking, boarding_point: v })}
            />
            <InputField
              label="Departure"
              type="datetime-local"
              value={(editingBooking.departure_datetime || "").slice(0, 16)}
              onChange={(v) => setEditingBooking({ ...editingBooking, departure_datetime: v })}
            />
            <InputField
              label="Driver Name"
              value={editingBooking.driver_name || ""}
              onChange={(v) => setEditingBooking({ ...editingBooking, driver_name: v })}
            />
            <InputField
              label="Driver Phone"
              value={editingBooking.driver_phone || ""}
              onChange={(v) => setEditingBooking({ ...editingBooking, driver_phone: v })}
            />
            <InputField
              label="Taxi Number"
              value={editingBooking.taxi_number || ""}
              onChange={(v) => setEditingBooking({ ...editingBooking, taxi_number: v })}
            />
            <InputField
              label="Vehicle Type"
              value={editingBooking.vehicle_type || ""}
              onChange={(v) => setEditingBooking({ ...editingBooking, vehicle_type: v })}
            />
            <InputField
              label="Total Amount"
              type="number"
              value={String(editingBooking.total_amount || 0)}
              onChange={(v) => setEditingBooking({ ...editingBooking, total_amount: Number(v) })}
            />
            <InputField
              label="Advance"
              type="number"
              value={String(editingBooking.advance_amount || 0)}
              onChange={(v) => setEditingBooking({ ...editingBooking, advance_amount: Number(v) })}
            />
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Booking Status
              </label>
              <select
                value={editingBooking.booking_status || "Confirmed"}
                onChange={(e) =>
                  setEditingBooking({ ...editingBooking, booking_status: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => setEditingBooking(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#0E6B50] text-white hover:bg-emerald-700"
            >
              Save Changes
            </button>
          </div>
        </Dialog>
      )}

      {/* Payment History Dialog */}
      {viewingPayments && (
        <Dialog
          onClose={() => {
            setViewingPayments(null);
            setPaymentHistory([]);
          }}
          title={`Payment History — ${viewingPayments.ticket_number}`}
        >
          <div className="text-xs text-slate-600 mb-3">
            {viewingPayments.passenger_name} ({viewingPayments.passenger_phone}) —{" "}
            {formatCurrency(Number(viewingPayments.total_amount) || 0)}
          </div>
          {paymentHistory.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Payment ID</th>
                    <th className="px-3 py-2 text-left">Method</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentHistory.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2">{formatDateTime(p.paid_at)}</td>
                      <td className="px-3 py-2 font-mono">{p.payment_id}</td>
                      <td className="px-3 py-2">{p.payment_method}</td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                        {formatCurrency(Number(p.amount) || 0)}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={p.payment_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Dialog>
      )}

      {/* Collect Payment Dialog */}
      {collectPaymentBooking && (
        <Dialog
          onClose={() => {
            setCollectPaymentBooking(null);
            setPayAmount("");
          }}
          title={`Collect Payment — ${collectPaymentBooking.ticket_number}`}
        >
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <p>
                Balance:{" "}
                <strong className="text-amber-700">
                  {formatCurrency(Number(collectPaymentBooking.balance_amount) || 0)}
                </strong>
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Amount
              </label>
              <input
                type="number"
                min="1"
                max={Number(collectPaymentBooking.balance_amount) || 0}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Method
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setCollectPaymentBooking(null);
                  setPayAmount("");
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCollectPayment}
                disabled={!payAmount || Number(payAmount) <= 0}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Record Payment
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ────────────────────────────── PENDING PAYMENTS ──────────────────────────────

export function PendingPaymentsManager() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setBookings(
            d.bookings.filter(
              (b: BookingData) => Number(b.balance_amount) > 0 && b.booking_status !== "Cancelled",
            ),
          );
        }
      })
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-slate-900">Pending Payments</h3>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-emerald-600 text-sm font-semibold">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" /> All bookings are fully
          paid!
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100/70 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Passenger</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Departure</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-[#0B1F3A]">{b.ticket_number}</td>
                    <td className="px-4 py-3 font-semibold">{b.passenger_name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.passenger_phone}</td>
                    <td className="px-4 py-3 max-w-[120px] truncate">{b.package_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(b.departure_datetime)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(Number(b.total_amount) || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                      {formatCurrency(Number(b.amount_paid) || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-700 font-bold">
                      {formatCurrency(Number(b.balance_amount) || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.payment_status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => downloadSmartPDF(b)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-600"
                          title="Download Voucher / Ticket PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => printSmartPDF(b)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-600"
                          title="Print Voucher / Ticket PDF"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────── SHARED COMPONENTS ──────────────────────────────

function StatusBadge({ status }: { status: string | undefined }) {
  const s = status || "Pending";
  const colors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800",
    "Partially Paid": "bg-orange-100 text-orange-800",
    "Advance Paid": "bg-blue-100 text-blue-800",
    "Fully Paid": "bg-emerald-100 text-emerald-800",
    "Payment Failed": "bg-red-100 text-red-800",
    "Payment Cancelled": "bg-slate-100 text-slate-700",
    Confirmed: "bg-emerald-100 text-emerald-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-slate-100 text-slate-700",
    Cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[s] || "bg-slate-100 text-slate-700"}`}
    >
      {s}
    </span>
  );
}

function Dialog({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-heading text-base font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-500">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#0E6B50]"
      />
    </div>
  );
}
