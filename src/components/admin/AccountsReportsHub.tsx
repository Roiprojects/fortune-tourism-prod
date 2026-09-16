import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FileCheck,
  BookOpen,
  ArrowLeftRight,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Scale,
  Banknote,
  Search,
  Filter,
  Download,
  Printer,
  IndianRupee,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

export type AccountReportKey =
  | "reports"
  | "daily"
  | "final"
  | "daybook"
  | "credit_debit"
  | "payment"
  | "cash_flow"
  | "dues"
  | "profit_loss"
  | "online_cash_inflow";

export interface DailyReportRecord {
  id: string | number;
  sl?: number;
  date: string; // DATE (e.g. 01/09/2026)
  trav_on: string; // TRAV ON (e.g. 01/09/2026)
  trav_by: string; // TRAV BY (e.g. CAR, BUS, FLIGHT, TRAIN, HOTEL)
  pax: string; // PAX (Passenger name)
  ph_no: string; // PH NO (Phone number)
  from: string; // FROM
  to: string; // TO
  pickup: string; // PICK UP
  booking: number; // BOOKING
  off_adv: number; // OFF ADV
  due: number; // DUE
  status?: string;
  notes?: string;
  raw_date?: string;
}

export const INITIAL_DAILY_REPORTS: DailyReportRecord[] = [
  {
    id: "DR-1",
    sl: 1,
    date: "01/09/2026",
    trav_on: "01/09/2026",
    trav_by: "CAR",
    pax: "MOSTAQUE",
    ph_no: "9800312531",
    from: "KIA",
    to: "BOMMASANDRA DROP",
    pickup: "T2 G 10",
    booking: 1500,
    off_adv: 0,
    due: 1500,
    status: "Pending",
    raw_date: "2026-09-01",
  },
  {
    id: "DR-2",
    sl: 2,
    date: "01/09/2026",
    trav_on: "02/09/2026",
    trav_by: "CAR",
    pax: "DEBENDRA KR ROUT",
    ph_no: "9845471540",
    from: "JIGANI + J D MARA",
    to: "KIA DROP",
    pickup: "JIGANI",
    booking: 1500,
    off_adv: 500,
    due: 1000,
    status: "Pending",
    raw_date: "2026-09-01",
  },
  {
    id: "DR-3",
    sl: 3,
    date: "02/09/2026",
    trav_on: "02/09/2026",
    trav_by: "CAR",
    pax: "PRADIP KR MITRA",
    ph_no: "9431087563",
    from: "BOMMASANDRA",
    to: "BSS",
    pickup: "OFFICE",
    booking: 2500,
    off_adv: 0,
    due: 0,
    status: "Paid",
    raw_date: "2026-09-02",
  },
  {
    id: "DR-4",
    sl: 4,
    date: "02/09/2026",
    trav_on: "02/09/2026",
    trav_by: "CAR",
    pax: "DEBENDRA KR ROUT",
    ph_no: "9845471540",
    from: "KIA",
    to: "JIGANI DROP",
    pickup: "T2 G 10",
    booking: 1500,
    off_adv: 0,
    due: 0,
    status: "Paid",
    raw_date: "2026-09-02",
  },
];

export interface TransactionRecord {
  id: string;
  date: string;
  ref_number: string;
  particulars: string;
  category: "FLIGHT" | "BUS" | "TRAIN" | "CAR" | "HOTEL" | "TOUR" | "UTILITY" | "OFFICE";
  payment_method: "CASH" | "UPI" | "CARD" | "NETBANKING" | "RAZORPAY";
  status: "PAID" | "PENDING" | "REFUNDED" | "CANCELLED";
  income: number;
  expense: number;
  balance: number;
  customer_name?: string;
  phone?: string;
  notes?: string;
}

interface AccountsReportsHubProps {
  initialReport?: AccountReportKey;
  onSelectReport?: (reportKey: AccountReportKey) => void;
  onNavigateToDayBook?: () => void;
}

export const REPORT_DEFINITIONS: {
  key: AccountReportKey;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    key: "reports",
    title: "Accounts Reports Hub",
    shortTitle: "Reports",
    subtitle: "Consolidated executive accounting metrics, category distributions, and multi-sector ledger summaries.",
    icon: LayoutDashboard,
    color: "text-amber-500",
  },
  {
    key: "daily",
    title: "Daily Reports",
    shortTitle: "Daily Reports",
    subtitle: "Day-by-day cash intake, day trip revenues, transport tickets sold, and daily operational burn.",
    icon: CalendarDays,
    color: "text-blue-500",
  },
  {
    key: "final",
    title: "Final Reports",
    shortTitle: "Final Reports",
    subtitle: "Audited closed accounts, fully settled vouchers, client sign-offs, and period-end statements.",
    icon: FileCheck,
    color: "text-emerald-500",
  },
  {
    key: "credit_debit",
    title: "Credit & Debit Statement",
    shortTitle: "Credit & Debit Statement",
    subtitle: "Detailed balance ledger comparing customer advances (Credit) against supplier/vendor payouts (Debit).",
    icon: ArrowLeftRight,
    color: "text-purple-500",
  },
  {
    key: "payment",
    title: "Payment Reports",
    shortTitle: "Payment Reports",
    subtitle: "Reconciliation of all customer payment modes (UPI, Razorpay, Debit/Credit Card, IMPS, and Cash).",
    icon: CreditCard,
    color: "text-cyan-500",
  },
  {
    key: "cash_flow",
    title: "Cash Flow Reports",
    shortTitle: "Cash Flow Reports",
    subtitle: "Operating cash inflows vs outflows, net cash generated, liquid cash balance, and working capital.",
    icon: TrendingUp,
    color: "text-teal-500",
  },
  {
    key: "dues",
    title: "Dues Reports",
    shortTitle: "Dues Reports",
    subtitle: "Outstanding customer balances, pending credit recoveries, overdue receivables, and dispatch blockers.",
    icon: AlertCircle,
    color: "text-rose-500",
  },
  {
    key: "profit_loss",
    title: "Profit & Loss Reports",
    shortTitle: "Profit & Loss Reports",
    subtitle: "Gross operating profit, direct airline/fleet expenses, administrative overheads, and net profit margin.",
    icon: Scale,
    color: "text-amber-600",
  },
  {
    key: "online_cash_inflow",
    title: "Online Transaction Reports with Cash Inflow",
    shortTitle: "Online & Cash Inflow",
    subtitle: "Digital payment gateways (UPI, QR, PG) cross-audited against direct counter physical cash collections.",
    icon: Banknote,
    color: "text-emerald-600",
  },
];

// Fallback seed transactions representing live accounting data
export const SEED_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "TXN-8091",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ref_number: "INV-FT-2026-081",
    particulars: "BLR → DEL Indigo Flight Corporate Tickets (4 Pax)",
    category: "FLIGHT",
    payment_method: "RAZORPAY",
    status: "PAID",
    income: 38400,
    expense: 34200,
    balance: 4200,
    customer_name: "Infosys Travel Desk",
    phone: "+91 98450 11223",
    notes: "PNR confirmed, sent via WhatsApp",
  },
  {
    id: "TXN-8092",
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    ref_number: "INV-FT-2026-082",
    particulars: "Bengaluru → Ooty 4D/3N Premium Hill Tour Package",
    category: "TOUR",
    payment_method: "UPI",
    status: "PAID",
    income: 24500,
    expense: 17200,
    balance: 7300,
    customer_name: "Rajesh Sharma",
    phone: "+91 98860 33445",
    notes: "Includes Innova Crysta & Resort stay",
  },
  {
    id: "TXN-8093",
    date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    ref_number: "INV-FT-2026-083",
    particulars: "Bengaluru → Hyderabad Sleeper Multi-Axle Volvo (2 Berths)",
    category: "BUS",
    payment_method: "CASH",
    status: "PAID",
    income: 3200,
    expense: 2600,
    balance: 600,
    customer_name: "Kavitha Reddy",
    phone: "+91 99001 55667",
    notes: "Counter booking - Cash Inflow",
  },
  {
    id: "TXN-8094",
    date: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    ref_number: "INV-FT-2026-084",
    particulars: "Airport Outstation Drop (Kempegowda Int. to Whitefield)",
    category: "CAR",
    payment_method: "UPI",
    status: "PAID",
    income: 2200,
    expense: 1400,
    balance: 800,
    customer_name: "Dr. Arvind Rao",
    phone: "+91 97400 88990",
    notes: "Driver: Ramesh Babu (KA05-MN-2024)",
  },
  {
    id: "TXN-8095",
    date: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    ref_number: "INV-FT-2026-085",
    particulars: "Coorg Heritage Resort 2-Night Luxury Cottage Suite",
    category: "HOTEL",
    payment_method: "CARD",
    status: "PENDING",
    income: 14000,
    expense: 11500,
    balance: 2500,
    customer_name: "Anita Deshmukh",
    phone: "+91 94480 77112",
    notes: "Advance 50% paid, balance ₹7,000 due at check-in",
  },
  {
    id: "TXN-8096",
    date: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    ref_number: "INV-FT-2026-086",
    particulars: "Bengaluru → Chennai Central Vande Bharat Express (3AC)",
    category: "TRAIN",
    payment_method: "NETBANKING",
    status: "PAID",
    income: 2900,
    expense: 2550,
    balance: 350,
    customer_name: "Suresh Kumar",
    phone: "+91 91080 33221",
    notes: "Tatkal quota confirmed ticket",
  },
  {
    id: "TXN-8097",
    date: new Date(Date.now() - 1000 * 60 * 750).toISOString(),
    ref_number: "VOUCHER-EXP-104",
    particulars: "Daily Fleet Diesel & Highway Fastag Toll Recharge",
    category: "CAR",
    payment_method: "CASH",
    status: "PAID",
    income: 0,
    expense: 6500,
    balance: -6500,
    customer_name: "Fleet Maintenance",
    phone: "+91 98450 00001",
    notes: "Daily office cash expense disbursement",
  },
  {
    id: "TXN-8098",
    date: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
    ref_number: "INV-FT-2026-087",
    particulars: "Wayanad 3-Day Sightseeing Tour (12 Seater Tempo Traveller)",
    category: "TOUR",
    payment_method: "UPI",
    status: "PENDING",
    income: 32000,
    expense: 22000,
    balance: 10000,
    customer_name: "Deepak Verma & Family",
    phone: "+91 96110 44556",
    notes: "Advance ₹10,000 received; ₹22,000 due before departure",
  },
  {
    id: "TXN-8099",
    date: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    ref_number: "REFUND-RT-402",
    particulars: "Cancelled Flight Booking Refund - Air India BLR-BOM",
    category: "FLIGHT",
    payment_method: "RAZORPAY",
    status: "REFUNDED",
    income: -5400,
    expense: 400,
    balance: -5800,
    customer_name: "Meera Nair",
    phone: "+91 99800 66778",
    notes: "Processed via gateway with ₹400 airline cancellation fee",
  },
];

function formatDisplayDate(val?: string | null): string {
  if (!val) return "—";
  const str = String(val).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  } catch {}
  return str;
}

function parseToComparableDate(val?: string | null): string {
  if (!val) return "";
  const str = String(val).trim();
  const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch {}
  return "";
}

export function AccountsReportsHub({
  initialReport = "reports",
  onSelectReport,
  onNavigateToDayBook,
}: AccountsReportsHubProps) {
  const [activeReport, setActiveReport] = useState<AccountReportKey>(
    initialReport === "daybook" ? "reports" : initialReport
  );
  const [transactions, setTransactions] = useState<TransactionRecord[]>(SEED_TRANSACTIONS);
  const [dailyRecords, setDailyRecords] = useState<DailyReportRecord[]>(INITIAL_DAILY_REPORTS);
  const [loading, setLoading] = useState(false);

  // Daily Reports Header Filter States (From Date, To Date, All Booking Types, Search Query)
  const [dailyFromDate, setDailyFromDate] = useState("");
  const [dailyToDate, setDailyToDate] = useState("");
  const [dailyBookingType, setDailyBookingType] = useState("ALL");
  const [dailySearchQuery, setDailySearchQuery] = useState("");

  const [appliedDailyFromDate, setAppliedDailyFromDate] = useState("");
  const [appliedDailyToDate, setAppliedDailyToDate] = useState("");
  const [appliedDailyBookingType, setAppliedDailyBookingType] = useState("ALL");
  const [appliedDailySearchQuery, setAppliedDailySearchQuery] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const handleDailySearch = () => {
    if (dailyFromDate && dailyToDate && dailyToDate < dailyFromDate) {
      setDateError("To Date cannot be earlier than From Date");
      return;
    }
    setDateError(null);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 250);

    setAppliedDailyFromDate(dailyFromDate);
    setAppliedDailyToDate(dailyToDate);
    setAppliedDailyBookingType(dailyBookingType);
    setAppliedDailySearchQuery(dailySearchQuery);

    setSearchFeedback("Search applied");
    setTimeout(() => setSearchFeedback(null), 2500);
  };

  const handleResetDailyFilters = () => {
    setDailyFromDate("");
    setDailyToDate("");
    setDailyBookingType("ALL");
    setDailySearchQuery("");
    setAppliedDailyFromDate("");
    setAppliedDailyToDate("");
    setAppliedDailyBookingType("ALL");
    setAppliedDailySearchQuery("");
    setDateError(null);
    setSearchFeedback("Filters reset");
    setTimeout(() => setSearchFeedback(null), 2000);
  };

  const hasActiveDailyFilters = Boolean(
    appliedDailyFromDate ||
    appliedDailyToDate ||
    appliedDailyBookingType !== "ALL" ||
    appliedDailySearchQuery.trim()
  );

  // Export Daily Reports to formatted Excel CSV
  const handleExportExcelCSV = () => {
    const headers = ["SL", "DATE", "TRAV ON", "TRAV BY", "PAX", "PH NO", "FROM", "TO", "PICK UP", "BOOKING", "OFF ADV", "DUE"];
    const rows = filteredDailyRecords.map((r, idx) => [
      idx + 1,
      r.date,
      r.trav_on,
      r.trav_by,
      `"${(r.pax || "").replace(/"/g, '""')}"`,
      `"${r.ph_no || ""}"`,
      `"${(r.from || "").replace(/"/g, '""')}"`,
      `"${(r.to || "").replace(/"/g, '""')}"`,
      `"${(r.pickup || "").replace(/"/g, '""')}"`,
      r.booking,
      r.off_adv,
      r.due,
    ]);
    rows.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Total Cash",
      dailyTotals.booking,
      dailyTotals.offAdv,
      dailyTotals.due,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Daily Report Add / Edit Modal State
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DailyReportRecord | null>(null);
  const [dailyFormData, setDailyFormData] = useState({
    date: "01/09/2026",
    trav_on: "01/09/2026",
    trav_by: "CAR",
    pax: "",
    ph_no: "",
    from: "",
    to: "",
    pickup: "",
    booking: 0,
    off_adv: 0,
    due: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (initialReport === "daybook") {
      if (onNavigateToDayBook) {
        onNavigateToDayBook();
      } else {
        setActiveReport("reports");
      }
      return;
    }
    if (initialReport) {
      setActiveReport(initialReport);
    }
  }, [initialReport, onNavigateToDayBook]);

  const handleReportChange = (key: AccountReportKey) => {
    if (key === "daybook") {
      if (onNavigateToDayBook) {
        onNavigateToDayBook();
      }
      return;
    }
    setActiveReport(key);
    if (onSelectReport) {
      onSelectReport(key);
    }
  };

  // Fetch real database transactions & day book entries from PostgreSQL API
  const fetchLiveTransactions = async () => {
    setLoading(true);
    try {
      // 1. Fetch Day Book Entries for Daily Reports
      const dbRes = await fetch("/api/business/day_book_entries?limit=200", {
        headers: { "x-admin-key": "Admin@fortunetourism2026" },
      });
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        if (dbData.success && Array.isArray(dbData.rows)) {
          const liveDaily: DailyReportRecord[] = dbData.rows.map((r: any) => ({
            id: r.id,
            date: formatDisplayDate(r.booking_date || r.created_at),
            raw_date: r.booking_date || r.created_at,
            trav_on: formatDisplayDate(r.travel_date),
            trav_by: (r.travel_by || "CAR").toUpperCase(),
            pax: r.passenger_name || "",
            ph_no: r.passenger_phone || "",
            from: r.from_location || "",
            to: r.to_location || "",
            pickup: r.pickup_location || "—",
            booking: Number(r.booking_amount || r.total_amount || 0),
            off_adv: Number(r.office_advance || 0),
            due:
              r.due_amount !== null && r.due_amount !== undefined
                ? Number(r.due_amount)
                : Math.max(0, Number(r.booking_amount || 0) - Number(r.office_advance || 0)),
            status: r.status || (Number(r.due_amount || 0) > 0 ? "Pending" : "Paid"),
            notes: r.notes || "",
          }));

          // Merge: ensure INITIAL_DAILY_REPORTS are included if not present in DB
          const existingKeys = new Set(
            liveDaily.map((d) => `${(d.pax || "").toLowerCase()}_${d.ph_no || ""}`)
          );
          const seedsToKeep = INITIAL_DAILY_REPORTS.filter(
            (s) => !existingKeys.has(`${s.pax.toLowerCase()}_${s.ph_no}`)
          );
          setDailyRecords([...seedsToKeep, ...liveDaily]);
        }
      }
    } catch (err) {
      console.warn("Using seeded daily records:", err);
      setDailyRecords(INITIAL_DAILY_REPORTS);
    }

    // 2. Fetch general business transactions for other reports
    try {
      const res = await fetch("/api/business/business_records?limit=200", {
        headers: { "x-admin-key": "Admin@fortunetourism2026" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.rows) && data.rows.length > 0) {
          const mapped: TransactionRecord[] = data.rows.map((r: any, idx: number) => {
            const amount = Number(r.amount || r.total_amount || r.fare || 0);
            const isExpense = (r.record_type || r.type || "").toUpperCase().includes("EXPENSE");
            const income = isExpense ? 0 : amount;
            const expense = isExpense ? amount : Number(r.expense_amount || r.cost || 0);
            return {
              id: `TXN-${r.id || idx + 100}`,
              date: r.created_at || r.travel_date || r.date || new Date().toISOString(),
              ref_number: r.voucher_no || r.booking_reference || `REC-${r.id}`,
              particulars: r.particulars || r.description || r.activity || "Travel Booking Service",
              category: (r.category || "TOUR").toUpperCase() as any,
              payment_method: (r.payment_mode || "UPI").toUpperCase() as any,
              status: (r.status || "PAID").toUpperCase() as any,
              income,
              expense,
              balance: income - expense,
              customer_name: r.client_name || r.passenger_name || "Direct Customer",
              phone: r.phone || r.mobile || "",
              notes: r.notes || "",
            };
          });
          setTransactions([...mapped, ...SEED_TRANSACTIONS]);
        }
      }
    } catch (err) {
      console.warn("Using seeded transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTransactions();
  }, []);

  // Filter Daily Reports (Filtered using Header Controls: DATE range, Booking Type, and Search Query)
  const filteredDailyRecords = useMemo(() => {
    return dailyRecords.filter((r) => {
      // 1. Filter against the report's DATE field (not TRAV ON)
      const recDate = parseToComparableDate(r.date) || parseToComparableDate(r.raw_date);
      if (appliedDailyFromDate) {
        if (!recDate || recDate < appliedDailyFromDate) return false;
      }
      if (appliedDailyToDate) {
        if (!recDate || recDate > appliedDailyToDate) return false;
      }

      // 2. Booking Type Filter
      if (appliedDailyBookingType !== "ALL") {
        const tb = (r.trav_by || "").toUpperCase();
        if (appliedDailyBookingType === "FLIGHT") {
          if (!tb.includes("FLIGHT")) return false;
        } else if (appliedDailyBookingType === "BUS") {
          if (!tb.includes("BUS")) return false;
        } else if (appliedDailyBookingType === "TRAIN") {
          if (!tb.includes("TRAIN")) return false;
        } else if (appliedDailyBookingType === "CAR") {
          const isCar =
            tb.includes("CAR") ||
            tb.includes("TAXI") ||
            tb.includes("CAB") ||
            tb.includes("SEDAN") ||
            tb.includes("INNOVA") ||
            tb.includes("TEMPO") ||
            tb.includes("SUV");
          if (!isCar) return false;
        } else if (appliedDailyBookingType === "HOTEL") {
          if (!tb.includes("HOTEL")) return false;
        } else if (appliedDailyBookingType === "TOUR") {
          if (!tb.includes("TOUR") && !tb.includes("PACKAGE")) return false;
        }
      }

      // 3. Search Query Filter (PAX name, Phone, Route, Pickup, SL, Amount)
      if (appliedDailySearchQuery.trim()) {
        const q = appliedDailySearchQuery.toLowerCase().trim();
        const matches =
          (r.pax && r.pax.toLowerCase().includes(q)) ||
          (r.ph_no && r.ph_no.toLowerCase().includes(q)) ||
          (r.from && r.from.toLowerCase().includes(q)) ||
          (r.to && r.to.toLowerCase().includes(q)) ||
          (r.pickup && r.pickup.toLowerCase().includes(q)) ||
          (r.trav_by && r.trav_by.toLowerCase().includes(q)) ||
          (r.date && r.date.toLowerCase().includes(q)) ||
          (r.trav_on && r.trav_on.toLowerCase().includes(q)) ||
          (String(r.sl || "") === q) ||
          (String(r.booking || "").includes(q)) ||
          (String(r.due || "").includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [dailyRecords, appliedDailyFromDate, appliedDailyToDate, appliedDailyBookingType, appliedDailySearchQuery]);

  // Dynamic Totals for Daily Reports
  const dailyTotals = useMemo(() => {
    let booking = 0;
    let offAdv = 0;
    let due = 0;
    filteredDailyRecords.forEach((r) => {
      booking += Number(r.booking || 0);
      offAdv += Number(r.off_adv || 0);
      due += Number(r.due || 0);
    });
    return { booking, offAdv, due };
  }, [filteredDailyRecords]);

  // Modal Handlers for Daily Reports
  const openAddDailyModal = () => {
    setEditingRecord(null);
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const todayFormatted = `${dd}/${mm}/${yyyy}`;
    setDailyFormData({
      date: todayFormatted,
      trav_on: todayFormatted,
      trav_by: "CAR",
      pax: "",
      ph_no: "",
      from: "",
      to: "",
      pickup: "",
      booking: 0,
      off_adv: 0,
      due: 0,
    });
    setDailyModalOpen(true);
  };

  const openEditDailyModal = (rec: DailyReportRecord) => {
    setEditingRecord(rec);
    setDailyFormData({
      date: rec.date,
      trav_on: rec.trav_on,
      trav_by: rec.trav_by,
      pax: rec.pax,
      ph_no: rec.ph_no,
      from: rec.from,
      to: rec.to,
      pickup: rec.pickup,
      booking: rec.booking,
      off_adv: rec.off_adv,
      due: rec.due,
    });
    setDailyModalOpen(true);
  };

  const handleDeleteDailyRecord = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this Daily Report entry?")) return;
    setDailyRecords((prev) => prev.filter((r) => r.id !== id));
    if (typeof id === "number") {
      try {
        await fetch(`/api/business/day_book_entries?id=${id}`, {
          method: "DELETE",
          headers: { "x-admin-key": "Admin@fortunetourism2026" },
        });
      } catch (err) {
        console.warn("DELETE /api/business/day_book_entries error:", err);
      }
    }
  };

  const handleSaveDailyRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookingVal = Number(dailyFormData.booking || 0);
    const offAdvVal = Number(dailyFormData.off_adv || 0);
    const dueVal = Number(dailyFormData.due !== undefined ? dailyFormData.due : Math.max(0, bookingVal - offAdvVal));

    if (editingRecord) {
      const updated: DailyReportRecord = {
        ...editingRecord,
        date: dailyFormData.date,
        trav_on: dailyFormData.trav_on,
        trav_by: dailyFormData.trav_by.toUpperCase(),
        pax: dailyFormData.pax,
        ph_no: dailyFormData.ph_no,
        from: dailyFormData.from,
        to: dailyFormData.to,
        pickup: dailyFormData.pickup,
        booking: bookingVal,
        off_adv: offAdvVal,
        due: dueVal,
        status: dueVal === 0 ? "Paid" : "Pending",
      };

      setDailyRecords((prev) => prev.map((r) => (r.id === editingRecord.id ? updated : r)));

      if (typeof editingRecord.id === "number") {
        try {
          await fetch("/api/business/day_book_entries", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-admin-key": "Admin@fortunetourism2026",
            },
            body: JSON.stringify({
              id: editingRecord.id,
              booking_date: parseToComparableDate(dailyFormData.date),
              travel_date: parseToComparableDate(dailyFormData.trav_on),
              travel_by: dailyFormData.trav_by,
              passenger_name: dailyFormData.pax,
              passenger_phone: dailyFormData.ph_no,
              from_location: dailyFormData.from,
              to_location: dailyFormData.to,
              pickup_location: dailyFormData.pickup,
              booking_amount: bookingVal,
              office_advance: offAdvVal,
              due_amount: dueVal,
              status: dueVal === 0 ? "Paid" : "Pending",
            }),
          });
        } catch (err) {
          console.warn("PUT /api/business/day_book_entries error:", err);
        }
      }
    } else {
      const tempId = `DR-${Date.now()}`;
      const newRec: DailyReportRecord = {
        id: tempId,
        sl: dailyRecords.length + 1,
        date: dailyFormData.date,
        trav_on: dailyFormData.trav_on,
        trav_by: dailyFormData.trav_by.toUpperCase(),
        pax: dailyFormData.pax,
        ph_no: dailyFormData.ph_no,
        from: dailyFormData.from,
        to: dailyFormData.to,
        pickup: dailyFormData.pickup,
        booking: bookingVal,
        off_adv: offAdvVal,
        due: dueVal,
        status: dueVal === 0 ? "Paid" : "Pending",
      };

      setDailyRecords((prev) => [newRec, ...prev]);

      try {
        const res = await fetch("/api/business/day_book_entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": "Admin@fortunetourism2026",
          },
          body: JSON.stringify({
            booking_date: parseToComparableDate(dailyFormData.date),
            travel_date: parseToComparableDate(dailyFormData.trav_on),
            travel_by: dailyFormData.trav_by,
            passenger_name: dailyFormData.pax,
            passenger_phone: dailyFormData.ph_no,
            from_location: dailyFormData.from,
            to_location: dailyFormData.to,
            pickup_location: dailyFormData.pickup,
            booking_amount: bookingVal,
            office_advance: offAdvVal,
            due_amount: dueVal,
            status: dueVal === 0 ? "Paid" : "Pending",
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.row?.id) {
            setDailyRecords((prev) =>
              prev.map((r) => (r.id === tempId ? { ...r, id: json.row.id } : r))
            );
          }
        }
      } catch (err) {
        console.warn("POST /api/business/day_book_entries error:", err);
      }
    }

    setDailyModalOpen(false);
  };

  // Filter transactions (for other reports)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.ref_number.toLowerCase().includes(q) ||
          t.particulars.toLowerCase().includes(q) ||
          (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
          (t.phone && t.phone.includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) {
        return false;
      }

      // Payment method
      if (paymentMethodFilter !== "ALL" && t.payment_method !== paymentMethodFilter) {
        return false;
      }

      // Status
      if (statusFilter !== "ALL" && t.status !== statusFilter) {
        return false;
      }

      // Report-specific filtering
      if (activeReport === "dues") {
        if (t.status !== "PENDING") return false;
      } else if (activeReport === "final") {
        if (t.status !== "PAID") return false;
      }

      // Date range filter
      if (startDate) {
        const tTime = new Date(t.date).getTime();
        const sTime = new Date(startDate).getTime();
        if (tTime < sTime) return false;
      }
      if (endDate) {
        const tTime = new Date(t.date).getTime();
        const eTime = new Date(endDate).getTime() + 86400000;
        if (tTime > eTime) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, categoryFilter, paymentMethodFilter, statusFilter, activeReport, startDate, endDate]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalPending = 0;
    let totalOnline = 0;
    let totalCash = 0;

    filteredTransactions.forEach((t) => {
      if (t.status === "PAID") {
        totalIncome += t.income;
        totalExpenses += t.expense;
        if (t.payment_method === "CASH") {
          totalCash += t.income;
        } else {
          totalOnline += t.income;
        }
      } else if (t.status === "PENDING") {
        totalPending += t.income;
      }
    });

    const netBalance = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : "0.0";

    return {
      totalIncome,
      totalExpenses,
      totalPending,
      netBalance,
      totalOnline,
      totalCash,
      profitMargin,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Export to CSV
  const handleExportCSV = () => {
    if (activeReport === "daily") {
      const headers = [
        "SL",
        "DATE",
        "TRAV ON",
        "TRAV BY",
        "PAX",
        "PH NO",
        "FROM",
        "TO",
        "PICK UP",
        "BOOKING",
        "OFF ADV",
        "DUE",
      ];
      const rows = filteredDailyRecords.map((r, idx) => [
        idx + 1,
        `"${r.date}"`,
        `"${r.trav_on}"`,
        `"${r.trav_by}"`,
        `"${(r.pax || "").replace(/"/g, '""')}"`,
        `"${r.ph_no || ""}"`,
        `"${(r.from || "").replace(/"/g, '""')}"`,
        `"${(r.to || "").replace(/"/g, '""')}"`,
        `"${(r.pickup || "").replace(/"/g, '""')}"`,
        r.booking,
        r.off_adv,
        r.due,
      ]);
      // Total Cash Row
      rows.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `"Total Cash"`,
        dailyTotals.booking,
        dailyTotals.offAdv,
        dailyTotals.due,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `fortune_tourism_daily_reports_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const headers = ["Transaction ID", "Date", "Voucher/Ref", "Particulars", "Category", "Payment Method", "Status", "Income (₹)", "Expense (₹)", "Balance (₹)", "Customer", "Phone", "Notes"];
    const rows = filteredTransactions.map((t) => [
      t.id,
      new Date(t.date).toLocaleString("en-IN"),
      `"${t.ref_number}"`,
      `"${t.particulars.replace(/"/g, '""')}"`,
      t.category,
      t.payment_method,
      t.status,
      t.income,
      t.expense,
      t.balance,
      `"${(t.customer_name || "").replace(/"/g, '""')}"`,
      `"${t.phone || ""}"`,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fortune_tourism_${activeReport}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / PDF Download
  const handlePrint = () => {
    window.print();
  };

  const activeDef = REPORT_DEFINITIONS.find((r) => r.key === activeReport) || REPORT_DEFINITIONS[0];
  const ActiveIcon = activeDef.icon;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
              <ActiveIcon className="w-3.5 h-3.5" />
              ACCOUNTS &amp; FINANCIAL OPERATIONS · {activeDef.shortTitle.toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              {activeDef.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {activeDef.subtitle}
            </p>
          </div>

          {/* Action buttons (Hidden on Daily Reports) */}
          {activeReport !== "daily" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchLiveTransactions}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
                title="Refresh ledger from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Export filtered records to CSV/Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer"
                title="Print report or save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ribbon Navigation for all 10 Reports */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {REPORT_DEFINITIONS.map((r) => {
            const Icon = r.icon;
            const isSel = activeReport === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handleReportChange(r.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSel
                    ? "bg-[#0b1329] text-amber-400 shadow-sm border border-amber-400/40 font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? "text-amber-400" : r.color}`} />
                <span>{r.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Key Metric Cards (Hidden on Daily Reports) */}
      {activeReport !== "daily" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income / Total Booking */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Income
              </p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                ₹{metrics.totalIncome.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Online: ₹{metrics.totalOnline.toLocaleString("en-IN")} · Cash: ₹{metrics.totalCash.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Expenses
              </p>
              <p className="text-2xl font-black text-blue-600 mt-1">
                ₹{metrics.totalExpenses.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Disbursed supplier &amp; fleet costs
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          {/* Pending Dues */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Dues
              </p>
              <p className="text-2xl font-black text-rose-600 mt-1">
                ₹{metrics.totalPending.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Awaiting customer collection
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Net Balance
              </p>
              <p className={`text-2xl font-black mt-1 ${metrics.netBalance >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                ₹{metrics.netBalance.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Operating margin: <span className="font-bold text-emerald-600">{metrics.profitMargin}%</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Reports Overview Dashboard Hub (if activeReport === "reports") */}
      {activeReport === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-amber-500" />
              <span>All 8 Specialized Accounting Reports</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">Direct Click-Through Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_DEFINITIONS.filter((r) => r.key !== "reports").map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.key}
                  onClick={() => handleReportChange(r.key)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center ${r.color} group-hover:bg-[#0b1329] group-hover:text-amber-400 transition`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 transition flex items-center gap-1">
                        Open Report <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm group-hover:text-indigo-900 transition">
                      {r.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {r.subtitle}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Audit Ready</span>
                    <span className="text-emerald-600">Active Ledger</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Controls Card - Only shown for non-daily reports */}
      {activeReport !== "daily" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Filter &amp; Audit Tools
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Showing <span className="font-bold text-slate-900">{filteredTransactions.length}</span> transactions
              </span>
              {(searchQuery || categoryFilter !== "ALL" || paymentMethodFilter !== "ALL" || statusFilter !== "ALL" || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("ALL");
                    setPaymentMethodFilter("ALL");
                    setStatusFilter("ALL");
                    setStartDate("");
                    setEndDate("");
                    setDatePreset("all");
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Box */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, passenger, phone, voucher..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            {/* Booking Type Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Booking Types</option>
                <option value="FLIGHT">Flight</option>
                <option value="BUS">Bus</option>
                <option value="TRAIN">Train</option>
                <option value="CAR">Car / Taxi</option>
                <option value="HOTEL">Hotel</option>
                <option value="TOUR">Tour Package</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="CASH">Cash Inflow</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="NETBANKING">Net Banking</option>
                <option value="RAZORPAY">Razorpay Gateway</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending Dues</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Date Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-slate-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-slate-700"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setStartDate(today);
                  setEndDate(today);
                  setDatePreset("today");
                }}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
                  setStartDate(firstDay);
                  setEndDate(lastDay);
                  setDatePreset("month");
                }}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                This Month
              </button>
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setDatePreset("all");
                }}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                All Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Records Table / Daily Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {activeReport === "daily" ? (
          <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            {/* Left: Heading with orange icon & record count badge */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-500 shrink-0" />
                <h3 className="font-black text-slate-900 text-sm whitespace-nowrap">
                  Daily Reports
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {filteredDailyRecords.length} {filteredDailyRecords.length === 1 ? "entry" : "entries"}
              </span>
              {searchFeedback && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full animate-in fade-in duration-150">
                  {searchFeedback}
                </span>
              )}
            </div>

            {/* Compact Controls: From Date -> To Date -> All Booking Types -> Search Field -> Search Button -> Reset */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap items-stretch sm:items-center gap-2 w-full xl:w-auto">
              {/* From Date */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition">
                <label htmlFor="daily-from-date" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  From:
                </label>
                <input
                  id="daily-from-date"
                  type="date"
                  value={dailyFromDate}
                  onChange={(e) => {
                    setDailyFromDate(e.target.value);
                    if (dateError) setDateError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDailySearch();
                  }}
                  className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer w-full sm:w-auto"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition">
                <label htmlFor="daily-to-date" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  To:
                </label>
                <input
                  id="daily-to-date"
                  type="date"
                  value={dailyToDate}
                  onChange={(e) => {
                    setDailyToDate(e.target.value);
                    if (dateError) setDateError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDailySearch();
                  }}
                  className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer w-full sm:w-auto"
                />
              </div>

              {/* All Booking Types Dropdown */}
              <div className="relative">
                <select
                  value={dailyBookingType}
                  onChange={(e) => setDailyBookingType(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-bold text-slate-800 hover:bg-slate-100 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none cursor-pointer transition"
                >
                  <option value="ALL">All Booking Types</option>
                  <option value="FLIGHT">Flight</option>
                  <option value="BUS">Bus</option>
                  <option value="TRAIN">Train</option>
                  <option value="CAR">Car / Taxi</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="TOUR">Tour Package</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search Query Field */}
              <div className="relative flex-1 sm:w-44 xl:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={dailySearchQuery}
                  onChange={(e) => setDailySearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDailySearch();
                  }}
                  placeholder="Search name, ph, route..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                />
                {dailySearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setDailySearchQuery("");
                      setAppliedDailySearchQuery("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    title="Clear search text"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Search Button */}
              <button
                type="button"
                onClick={handleDailySearch}
                disabled={isSearching}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0 disabled:opacity-75"
              >
                {isSearching ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Search</span>
              </button>

              {/* Excel Export Button */}
              <button
                type="button"
                onClick={handleExportExcelCSV}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#107c41] hover:bg-[#0d6535] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                title="Download Excel Sheet (.csv)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              {/* Reset Button */}
              {hasActiveDailyFilters && (
                <button
                  type="button"
                  onClick={handleResetDailyFilters}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer shrink-0"
                  title="Reset all filters"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-slate-900 text-sm">
                {activeDef.shortTitle} Statement Transactions ({filteredTransactions.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
              Double-entry verified against PostgreSQL
            </span>
          </div>
        )}

        {/* Date Validation Error Message */}
        {activeReport === "daily" && dateError && (
          <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span>{dateError}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          {activeReport === "daily" ? (
            <div className="min-w-full inline-block align-middle">
              <table className="w-full text-left text-xs border-collapse border border-slate-300 font-sans">
                <thead>
                  <tr className="bg-[#107c41] text-white font-black uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 text-center w-12 border border-[#0d6535] whitespace-nowrap">SL</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">DATE</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">TRAV ON</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">TRAV BY</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap border border-[#0d6535]">PAX</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap border border-[#0d6535]">PH NO</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap border border-[#0d6535]">FROM</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap border border-[#0d6535]">TO</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap border border-[#0d6535]">PICK UP</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">BOOKING</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">OFF ADV</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">DUE</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap w-24 border border-[#0d6535]">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {filteredDailyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-500 border border-slate-300 bg-white">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="font-bold text-sm">No daily report records match the selected criteria.</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting filters or adjusting your date range.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDailyRecords.map((r, idx) => (
                      <tr key={r.id} className="bg-white even:bg-[#f7faf8] hover:bg-[#ebf5ec] transition-colors">
                        {/* 1. SL */}
                        <td className="py-2 px-3 text-center font-bold text-slate-700 whitespace-nowrap border border-slate-300 bg-slate-50/70">
                          {idx + 1}
                        </td>

                        {/* 2. DATE */}
                        <td className="py-2 px-3 text-center whitespace-nowrap font-medium text-slate-900 border border-slate-300">
                          {r.date}
                        </td>

                        {/* 3. TRAV ON */}
                        <td className="py-2 px-3 text-center whitespace-nowrap font-medium text-slate-800 border border-slate-300">
                          {r.trav_on}
                        </td>

                        {/* 4. TRAV BY */}
                        <td className="py-2 px-3 text-center whitespace-nowrap font-bold text-slate-800 border border-slate-300">
                          {r.trav_by}
                        </td>

                        {/* 5. PAX */}
                        <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-900 border border-slate-300">
                          {r.pax}
                        </td>

                        {/* 6. PH NO */}
                        <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-800 border border-slate-300">
                          {r.ph_no}
                        </td>

                        {/* 7. FROM */}
                        <td className="py-2 px-3 whitespace-nowrap text-slate-800 font-medium border border-slate-300">
                          {r.from}
                        </td>

                        {/* 8. TO */}
                        <td className="py-2 px-3 whitespace-nowrap text-slate-800 font-medium border border-slate-300">
                          {r.to}
                        </td>

                        {/* 9. PICK UP */}
                        <td className="py-2 px-3 whitespace-nowrap text-slate-700 border border-slate-300">
                          {r.pickup}
                        </td>

                        {/* 10. BOOKING */}
                        <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-slate-900 border border-slate-300 bg-emerald-50/20">
                          ₹{Number(r.booking).toLocaleString("en-IN")}
                        </td>

                        {/* 11. OFF ADV */}
                        <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-blue-700 border border-slate-300 bg-blue-50/20">
                          ₹{Number(r.off_adv).toLocaleString("en-IN")}
                        </td>

                        {/* 12. DUE */}
                        <td className="py-2 px-3 text-right whitespace-nowrap font-black border border-slate-300 bg-rose-50/20">
                          <span
                            className={
                              Number(r.due) > 0 ? "text-rose-600" : "text-emerald-700"
                            }
                          >
                            ₹{Number(r.due).toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-2 px-3 text-center whitespace-nowrap border border-slate-300 bg-slate-50/40">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditDailyModal(r)}
                              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                              title="Edit Entry"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDailyRecord(r.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredDailyRecords.length > 0 && (
                  <tfoot className="bg-[#eef7ee] text-slate-900 font-black border-t-2 border-slate-400 border-b-4 border-double border-slate-500">
                    <tr>
                      <td colSpan={8} className="py-2.5 px-3 border border-slate-300 bg-slate-100/70"></td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 whitespace-nowrap text-xs uppercase tracking-wider border border-slate-300 bg-[#d9ebd9]">
                        Total Cash
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                        ₹{dailyTotals.booking.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-blue-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                        ₹{dailyTotals.offAdv.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-700 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                        ₹{dailyTotals.due.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 bg-slate-100/70"></td>
                    </tr>
                  </tfoot>
                )}
              </table>

              {/* Excel-style Sheet Tab Bar */}
              <div className="bg-[#f3f4f6] border-t border-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border-t-2 border-t-[#107c41] border-x border-b border-slate-300 font-bold text-slate-800 shadow-2xs rounded-t-sm">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#107c41]" />
                    <span>Daily Reports Sheet</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                  <span>Rows: <strong className="text-slate-800">{filteredDailyRecords.length}</strong></span>
                  <span>Total Booking: <strong className="text-emerald-700">₹{dailyTotals.booking.toLocaleString("en-IN")}</strong></span>
                  <span>Total Due: <strong className="text-rose-700">₹{dailyTotals.due.toLocaleString("en-IN")}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date &amp; ID</th>
                  <th className="py-3 px-4">Particulars &amp; Voucher</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Income (₹)</th>
                  <th className="py-3 px-4 text-right">Expense (₹)</th>
                  <th className="py-3 px-4 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-sm">No transaction records match the selected filters.</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting "All Time".</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        {/* Date & ID */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{t.id}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(t.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        {/* Particulars & Voucher */}
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-bold text-slate-800 line-clamp-1">{t.particulars}</p>
                          <p className="text-[10px] font-mono text-slate-400">{t.ref_number}</p>
                        </td>

                        {/* Sector / Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                            {t.category}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{t.customer_name || "—"}</p>
                          <p className="text-[10px] text-slate-400">{t.phone || ""}</p>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            t.payment_method === "CASH"
                              ? "bg-amber-100 text-amber-800"
                              : t.payment_method === "UPI"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-cyan-100 text-cyan-800"
                          }`}>
                            {t.payment_method}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            t.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                              : t.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 border border-amber-300/60"
                              : t.status === "REFUNDED"
                              ? "bg-purple-100 text-purple-800 border border-purple-300/60"
                              : "bg-red-100 text-red-800 border border-red-300/60"
                          }`}>
                            {t.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                            {t.status === "PENDING" && <Clock className="w-3 h-3" />}
                            {t.status === "REFUNDED" && <ArrowLeftRight className="w-3 h-3" />}
                            {t.status === "CANCELLED" && <XCircle className="w-3 h-3" />}
                            {t.status}
                          </span>
                        </td>

                        {/* Income */}
                        <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-emerald-600">
                          {t.income > 0 ? `+₹${t.income.toLocaleString("en-IN")}` : "—"}
                        </td>

                        {/* Expense */}
                        <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-red-600">
                          {t.expense > 0 ? `-₹${t.expense.toLocaleString("en-IN")}` : "—"}
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-4 text-right whitespace-nowrap font-black text-slate-900">
                          ₹{t.balance.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredTransactions.length > 0 && (
                <tfoot className="bg-slate-100 text-slate-900 font-black border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-right text-xs uppercase tracking-wider">
                      Report Totals:
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 text-sm font-black">
                      ₹{metrics.totalIncome.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right text-red-700 text-sm font-black">
                      ₹{metrics.totalExpenses.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-700 text-sm font-black">
                      ₹{metrics.netBalance.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>

      {/* Daily Report Add/Edit Modal */}
      {dailyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#0b1329] p-5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingRecord ? "Edit Daily Report Entry" : "Add Daily Report Entry"}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Fortune Tourism Daily Ledger Records
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDailyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDailyRecord} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* DATE */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DATE (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    required
                    value={dailyFormData.date}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, date: e.target.value })}
                    placeholder="01/09/2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-800"
                  />
                </div>

                {/* TRAV ON */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TRAV ON (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    required
                    value={dailyFormData.trav_on}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, trav_on: e.target.value })}
                    placeholder="01/09/2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* TRAV BY */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TRAV BY</label>
                  <select
                    value={dailyFormData.trav_by}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, trav_by: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="CAR">CAR</option>
                    <option value="BUS">BUS</option>
                    <option value="FLIGHT">FLIGHT</option>
                    <option value="TRAIN">TRAIN</option>
                    <option value="HOTEL">HOTEL</option>
                    <option value="TOUR">TOUR</option>
                  </select>
                </div>

                {/* PAX */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PAX (Customer Name)</label>
                  <input
                    type="text"
                    required
                    value={dailyFormData.pax}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, pax: e.target.value })}
                    placeholder="Passenger name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* PH NO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PH NO (Phone Number)</label>
                <input
                  type="text"
                  value={dailyFormData.ph_no}
                  onChange={(e) => setDailyFormData({ ...dailyFormData, ph_no: e.target.value })}
                  placeholder="e.g. 9800312531"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* FROM */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">FROM (Origin)</label>
                  <input
                    type="text"
                    value={dailyFormData.from}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, from: e.target.value })}
                    placeholder="e.g. KIA"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-800"
                  />
                </div>

                {/* TO */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TO (Destination)</label>
                  <input
                    type="text"
                    value={dailyFormData.to}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, to: e.target.value })}
                    placeholder="e.g. BOMMASANDRA DROP"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* PICK UP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PICK UP (Pickup Details)</label>
                <input
                  type="text"
                  value={dailyFormData.pickup}
                  onChange={(e) => setDailyFormData({ ...dailyFormData, pickup: e.target.value })}
                  placeholder="e.g. T2 G 10"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-800"
                />
              </div>

              {/* FINANCIALS: BOOKING, OFF ADV, DUE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
                {/* BOOKING */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">BOOKING (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={dailyFormData.booking}
                    onChange={(e) => {
                      const newBk = Number(e.target.value || 0);
                      const off = Number(dailyFormData.off_adv || 0);
                      setDailyFormData({
                        ...dailyFormData,
                        booking: newBk,
                        due: Math.max(0, newBk - off),
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-bold text-slate-900"
                  />
                </div>

                {/* OFF ADV */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">OFF ADV (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={dailyFormData.off_adv}
                    onChange={(e) => {
                      const newOff = Number(e.target.value || 0);
                      const bk = Number(dailyFormData.booking || 0);
                      setDailyFormData({
                        ...dailyFormData,
                        off_adv: newOff,
                        due: Math.max(0, bk - newOff),
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-bold text-blue-700"
                  />
                </div>

                {/* DUE */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DUE (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={dailyFormData.due}
                    onChange={(e) =>
                      setDailyFormData({
                        ...dailyFormData,
                        due: Number(e.target.value || 0),
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-black text-rose-700"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDailyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRecord ? "Update Entry" : "Save Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
