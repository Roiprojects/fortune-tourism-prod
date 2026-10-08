import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  RefreshCw,
  IndianRupee,
  Car,
  Bus,
  TrainFront,
  Plane,
  Users,
  Eye,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/booking-utils";
import { BookingFormModal } from "./BookingFormModal";
import { BookingDetailDrawer } from "./BookingDetailDrawer";

async function adminApiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const key =
    typeof window !== "undefined" ? sessionStorage.getItem("fortune_admin_key") || "" : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (key) headers["x-admin-key"] = key;
  return fetch(url, { ...options, headers });
}

interface BookingRow {
  id: number;
  booking_number?: string;
  booking_reference?: string;
  enquiry_number?: string;
  enquiry_id?: number | null;
  category?: string;
  booking_source?: string;
  passenger_name: string;
  passenger_phone: string;
  customer_email?: string;
  package_name?: string;
  from_location?: string;
  to_location?: string;
  departure_datetime?: string;
  total_amount: number | string;
  amount_paid?: number | string;
  balance_amount?: number | string;
  paid_total?: number | string;
  refunded_total?: number | string;
  remaining_amount?: number | string;
  payment_status?: string;
  booking_status?: string;
}

interface EnquiryRow {
  id: number | string;
  enquiry_number?: string;
  created_at: string;
  name: string;
  phone: string;
  service?: string;
  pickup?: string;
  destination?: string;
  travel_date?: string;
  passengers?: string;
  notes?: string;
  status: string;
  category?: string;
}

type TabKey =
  | "all"
  | "enquiries"
  | "CAR"
  | "BUS"
  | "TRAIN"
  | "FLIGHT"
  | "outstanding"
  | "upcoming"
  | "fully_paid"
  | "partially_paid"
  | "pending_payment"
  | "completed"
  | "cancelled";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "All Bookings" },
  { key: "enquiries", label: "New Enquiries" },
  { key: "CAR", label: "Car / Cab" },
  { key: "BUS", label: "Bus" },
  { key: "TRAIN", label: "Train" },
  { key: "FLIGHT", label: "Flight" },
  { key: "outstanding", label: "Outstanding Payments" },
  { key: "upcoming", label: "Upcoming" },
  { key: "fully_paid", label: "Fully Paid" },
  { key: "partially_paid", label: "Partially Paid" },
  { key: "pending_payment", label: "Pending Payment" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function tabParams(tab: TabKey): Record<string, string> {
  switch (tab) {
    case "all":
      return {};
    case "CAR":
    case "BUS":
    case "TRAIN":
    case "FLIGHT":
      return { category: tab };
    case "outstanding":
      return { outstanding: "1" };
    case "upcoming":
      return { upcomingFrom: todayStr(), sortBy: "travel_date_asc" };
    case "fully_paid":
      return { paymentStatus: "Fully Paid" };
    case "partially_paid":
      return { paymentStatus: "Partially Paid" };
    case "pending_payment":
      return { paymentStatus: "Pending" };
    case "completed":
      return { bookingStatus: "COMPLETED" };
    case "cancelled":
      return { bookingStatus: "CANCELLED" };
    default:
      return {};
  }
}

function payBadge(status?: string): { label: string; cls: string } {
  switch (String(status || "").toUpperCase()) {
    case "FULLY PAID":
      return { label: "Fully Paid", cls: "bg-emerald-100 text-emerald-800" };
    case "PARTIALLY PAID":
      return { label: "Partial", cls: "bg-amber-100 text-amber-800" };
    default:
      return { label: "Unpaid", cls: "bg-rose-100 text-rose-800" };
  }
}

function bookBadge(status?: string): { label: string; cls: string } {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED") return { label: "Completed", cls: "bg-emerald-100 text-emerald-800" };
  if (s === "CONFIRMED") return { label: "Confirmed", cls: "bg-emerald-100 text-emerald-800" };
  if (s === "IN PROGRESS") return { label: "In Progress", cls: "bg-sky-100 text-sky-800" };
  if (s === "ADVANCE RECEIVED")
    return { label: "Advance Received", cls: "bg-blue-100 text-blue-800" };
  if (s === "CANCELLED") return { label: "Cancelled", cls: "bg-rose-100 text-rose-800" };
  if (s === "REFUND PENDING")
    return { label: "Refund Pending", cls: "bg-orange-100 text-orange-800" };
  if (s === "REFUNDED") return { label: "Refunded", cls: "bg-slate-200 text-slate-700" };
  return {
    label: s ? s.charAt(0) + s.slice(1).toLowerCase() : "—",
    cls: "bg-amber-50 text-amber-700",
  };
}

export function BookingsManager({ initialTab = "all" }: { initialTab?: TabKey } = {}) {
  const [tab, setTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>({
    totalBookings: 0,
    pendingPayments: 0,
    fullyPaid: 0,
    partiallyPaid: 0,
    upcomingBookings: 0,
    newEnquiries: 0,
    todaysCollections: 0,
    byCategory: [],
  });

  const [drawerId, setDrawerId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formSource, setFormSource] = useState<{ booking?: any; enquiry?: any }>({});
  const [convertingId, setConvertingId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings/stats");
      const d = await res.json();
      if (d.success) setStats(d.stats);
    } catch {}
  }, []);

  const loadBookings = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const params = new URLSearchParams(tabParams(tab));
        if (debouncedSearch) params.set("q", debouncedSearch);
        const res = await adminApiFetch(`/api/bookings?${params.toString()}`);
        const d = await res.json();
        if (d.success) setBookings(d.bookings || []);
      } catch {
        if (!silent) toast.error("Failed to load bookings.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tab, debouncedSearch],
  );

  const loadEnquiries = useCallback(async () => {
    try {
      const params = new URLSearchParams({ status: "NEW", limit: "200" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      const res = await adminApiFetch(`/api/enquiries?${params.toString()}`);
      const d = await res.json();
      if (d.success) {
        setEnquiries(d.enquiries || []);
        setStats((s: any) => ({ ...s, newEnquiries: d.statusCounts?.NEW ?? s.newEnquiries }));
      }
    } catch {}
  }, [debouncedSearch]);

  const refreshAll = useCallback(
    async (silent = false) => {
      setRefreshing(true);
      await Promise.all([loadBookings(silent), loadStats(), loadEnquiries()]);
      setRefreshing(false);
    },
    [loadBookings, loadStats, loadEnquiries],
  );

  useEffect(() => {
    if (tab === "enquiries") loadEnquiries();
    else loadBookings();
  }, [tab, debouncedSearch, loadBookings, loadEnquiries]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => {
      if (tab !== "enquiries") loadBookings(true);
      else loadEnquiries();
    }, 15000);
    return () => clearInterval(interval);
  }, [tab, loadBookings, loadEnquiries, loadStats]);

  const openCreate = () => {
    setFormMode("create");
    setFormSource({});
    setFormOpen(true);
  };

  const openConvert = async (enquiry: EnquiryRow) => {
    setConvertingId(Number(enquiry.id));
    setFormMode("create");
    setFormSource({ enquiry });
    setFormOpen(true);
  };

  const openEdit = async (bookingId: number) => {
    try {
      const res = await adminApiFetch(`/api/bookings/${bookingId}`);
      const d = await res.json();
      if (d.success) {
        setFormMode("edit");
        setFormSource({ booking: d.booking });
        setDrawerOpen(false);
        setFormOpen(true);
      } else toast.error(d.error || "Failed to load booking for edit.");
    } catch {
      toast.error("Failed to load booking for edit.");
    }
  };

  const onFormSaved = useCallback(() => {
    refreshAll();
    if (drawerOpen && drawerId != null) {
      adminApiFetch(`/api/bookings/${drawerId}`)
        .then((r) => r.json())
        .catch(() => {});
    }
  }, [refreshAll, drawerOpen, drawerId]);

  const counts: Partial<Record<TabKey, number>> = useMemo(
    () => ({
      all: stats.totalBookings,
      enquiries: stats.newEnquiries ?? 0,
      outstanding: stats.pendingPayments,
      fully_paid: stats.fullyPaid,
      partially_paid: stats.partiallyPaid,
      pending_payment: stats.unpaidCount,
      completed: undefined,
      ...(Array.isArray(stats.byCategory)
        ? Object.fromEntries(
            stats.byCategory.map((c: any) => [String(c.category).toUpperCase(), c.n]),
          )
        : {}),
    }),
    [stats],
  );

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-heading text-lg font-bold">Bookings & Payments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enquiries → bookings → payments lifecycle with live totals.
            {stats.todaysCollections > 0 && (
              <>
                {" "}
                Collected today:{" "}
                <span className="font-bold text-emerald-700">
                  {formatCurrency(stats.todaysCollections)}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / phone / BK / ENQ / PNR…"
              className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <button
            onClick={() => refreshAll()}
            disabled={refreshing}
            className="rounded-lg border border-border bg-white p-2 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-navy)] px-4 py-2 text-xs font-bold text-white shadow hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> New Offline Booking
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 overflow-x-auto px-3 pt-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-3 pb-2 pt-1 text-xs font-bold transition border-b-2 ${
              tab === t.key
                ? "border-[color:var(--color-navy)] text-[color:var(--color-navy)]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {counts[t.key] != null && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                  tab === t.key
                    ? "bg-[color:var(--color-navy)] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "enquiries" ? (
        loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading enquiries…</div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No new enquiries.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Enquiry</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Service & Route</th>
                  <th className="px-5 py-3">Travel Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold">
                        {e.enquiry_number || `#${e.id}`}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {e.name}
                      <p className="text-xs font-normal text-muted-foreground">{e.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                        {e.service}
                      </span>
                      {(e.pickup || e.destination) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {e.pickup || "Any"} → {e.destination || "Any"}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {e.travel_date || "Not specified"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openConvert(e)}
                        disabled={convertingId === Number(e.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Convert to Booking <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-muted-foreground">No bookings found in this view.</p>
          <button
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Create First Booking
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Trip</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((bk) => {
                const remaining = Number(bk.remaining_amount ?? bk.balance_amount ?? 0);
                const catIcon =
                  bk.category === "BUS"
                    ? Bus
                    : bk.category === "TRAIN"
                      ? TrainFront
                      : bk.category === "FLIGHT"
                        ? Plane
                        : Car;
                const CatIcon = catIcon;
                return (
                  <tr
                    key={bk.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => {
                      setDrawerId(bk.id);
                      setDrawerOpen(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CatIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-mono text-xs font-bold text-[#0B1F3A]">
                            {bk.booking_reference || bk.booking_number || `#${bk.id}`}
                          </span>
                          {bk.enquiry_number && (
                            <p className="font-mono text-[10px] text-muted-foreground">
                              from {bk.enquiry_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{bk.passenger_name}</span>
                      <p className="text-xs text-muted-foreground">{bk.passenger_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[220px] truncate text-xs font-medium">
                        {bk.from_location || "—"} → {bk.to_location || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bk.departure_datetime ? formatDate(bk.departure_datetime) : "Date TBD"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatCurrency(Number(bk.total_amount) || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                      {formatCurrency(Number(bk.paid_total ?? bk.amount_paid ?? 0))}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {formatCurrency(remaining)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${payBadge(bk.payment_status).cls}`}
                        >
                          {payBadge(bk.payment_status).label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${bookBadge(bk.booking_status).cls}`}
                        >
                          {bookBadge(bk.booking_status).label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          title="View details"
                          onClick={() => {
                            setDrawerId(bk.id);
                            setDrawerOpen(true);
                          }}
                          className="rounded p-1.5 hover:bg-slate-200"
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </button>
                        {Number(bk.remaining_amount ?? bk.balance_amount ?? 0) > 0 &&
                          String(bk.booking_status).toUpperCase() !== "CANCELLED" && (
                            <button
                              title="Record payment"
                              onClick={() => {
                                setDrawerId(bk.id);
                                setDrawerOpen(true);
                              }}
                              className="rounded p-1.5 hover:bg-emerald-50"
                            >
                              <IndianRupee className="h-4 w-4 text-emerald-600" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      <BookingDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bookingId={drawerId}
        onEdit={openEdit}
        onChanged={() => {
          loadBookings(true);
          loadStats();
        }}
      />

      {/* Create / convert / edit modal */}
      <BookingFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={onFormSaved}
        mode={formMode}
        source={formSource}
      />
    </div>
  );
}
