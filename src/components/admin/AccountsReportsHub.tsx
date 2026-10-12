import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
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
  pnr?: string; // PNR Number (e.g. FT-839201)
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
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    if (typeof window === "undefined") return SEED_TRANSACTIONS;
    if (localStorage.getItem("fortune_reports_cleared") === "true") return [];
    try {
      const deleted = new Set(JSON.parse(localStorage.getItem("fortune_deleted_transaction_ids") || "[]"));
      return SEED_TRANSACTIONS.filter((s) => !deleted.has(String(s.id)));
    } catch {
      return SEED_TRANSACTIONS;
    }
  });
  const [dailyRecords, setDailyRecords] = useState<DailyReportRecord[]>(() => {
    if (typeof window === "undefined") return INITIAL_DAILY_REPORTS;
    if (localStorage.getItem("fortune_reports_cleared") === "true") return [];
    try {
      const deleted = new Set(JSON.parse(localStorage.getItem("fortune_deleted_daily_record_ids") || "[]"));
      return INITIAL_DAILY_REPORTS.filter((s) => !deleted.has(String(s.id)));
    } catch {
      return INITIAL_DAILY_REPORTS;
    }
  });
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

  // Export any active Financial Ledger report to formatted Excel CSV with UTF-8 BOM
  const handleExportExcel = (reportKey: AccountReportKey = activeReport) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const bom = "\uFEFF"; // UTF-8 Byte Order Mark for Excel

    if (reportKey === "daily") {
      const headers = [
        "SL",
        "DATE",
        "TRAV ON",
        "PNR",
        "TRAV BY",
        "PAX",
        "PH NO",
        "FROM",
        "TO",
        "PICK UP",
        "BOOKING (₹)",
        "OFF ADV (₹)",
        "DUE (₹)",
        "STATUS",
      ];
      const rows = filteredDailyRecords.map((r, idx) => [
        idx + 1,
        `"${r.date}"`,
        `"${r.trav_on}"`,
        `"${r.pnr || "—"}"`,
        `"${r.trav_by}"`,
        `"${(r.pax || "").replace(/"/g, '""')}"`,
        `"${r.ph_no || ""}"`,
        `"${(r.from || "").replace(/"/g, '""')}"`,
        `"${(r.to || "").replace(/"/g, '""')}"`,
        `"${(r.pickup || "").replace(/"/g, '""')}"`,
        r.booking,
        r.off_adv,
        r.due,
        `"${r.status || "Pending"}"`,
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
        "",
        `"TOTAL CASH"`,
        dailyTotals.booking,
        dailyTotals.offAdv,
        dailyTotals.due,
        `""`,
      ]);

      const csvContent = bom + [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `fortune_tourism_daily_reports_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Daily Reports Excel sheet downloaded successfully!");
      return;
    }

    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `fortune_tourism_${reportKey}_report_${todayStr}.csv`;

    if (reportKey === "credit_debit") {
      headers = [
        "Transaction ID",
        "Date",
        "Reference No",
        "Particulars",
        "Party / Client",
        "Phone",
        "Credit / Advance (₹)",
        "Debit / Payout (₹)",
        "Net Balance (₹)",
        "Payment Mode",
        "Status",
        "Remarks",
      ];
      rows = filteredTransactions.map((t) => [
        t.id,
        `"${new Date(t.date).toLocaleDateString("en-IN")}"`,
        `"${t.ref_number}"`,
        `"${(t.particulars || "").replace(/"/g, '""')}"`,
        `"${(t.customer_name || "").replace(/"/g, '""')}"`,
        `"${t.phone || ""}"`,
        t.income,
        t.expense,
        t.balance,
        t.payment_method,
        t.status,
        `"${(t.notes || "").replace(/"/g, '""')}"`,
      ]);
      rows.push([
        "",
        "",
        "",
        `"TOTAL POSITION"`,
        "",
        "",
        metrics.totalIncome,
        metrics.totalExpenses,
        metrics.netBalance,
        "",
        "",
        "",
      ]);
    } else if (reportKey === "payment") {
      headers = [
        "Transaction ID",
        "Date",
        "Voucher No",
        "Payment Mode",
        "Amount Received (₹)",
        "Payout Expense (₹)",
        "Customer Name",
        "Phone",
        "Particulars",
        "Status",
        "Notes",
      ];
      rows = filteredTransactions.map((t) => [
        t.id,
        `"${new Date(t.date).toLocaleDateString("en-IN")}"`,
        `"${t.ref_number}"`,
        t.payment_method,
        t.income,
        t.expense,
        `"${(t.customer_name || "").replace(/"/g, '""')}"`,
        `"${t.phone || ""}"`,
        `"${(t.particulars || "").replace(/"/g, '""')}"`,
        t.status,
        `"${(t.notes || "").replace(/"/g, '""')}"`,
      ]);
      rows.push([
        "",
        "",
        `"TOTALS"`,
        "",
        metrics.totalIncome,
        metrics.totalExpenses,
        "",
        "",
        "",
        "",
        "",
      ]);
    } else if (reportKey === "cash_flow") {
      headers = [
        "Transaction ID",
        "Date",
        "Particulars",
        "Voucher Ref",
        "Payment Channel",
        "Physical Cash Inflow (₹)",
        "Online / Bank Inflow (₹)",
        "Operating Outflow (₹)",
        "Net Cash Movement (₹)",
        "Customer",
        "Notes",
      ];
      rows = filteredTransactions.map((t) => {
        const isCash = t.payment_method === "CASH";
        return [
          t.id,
          `"${new Date(t.date).toLocaleDateString("en-IN")}"`,
          `"${(t.particulars || "").replace(/"/g, '""')}"`,
          `"${t.ref_number}"`,
          t.payment_method,
          isCash ? t.income : 0,
          !isCash ? t.income : 0,
          t.expense,
          t.balance,
          `"${(t.customer_name || "").replace(/"/g, '""')}"`,
          `"${(t.notes || "").replace(/"/g, '""')}"`,
        ];
      });
      rows.push([
        "",
        "",
        `"TOTAL CASH FLOW"`,
        "",
        "",
        metrics.totalCash,
        metrics.totalOnline,
        metrics.totalExpenses,
        metrics.netBalance,
        "",
        "",
      ]);
    } else if (reportKey === "dues") {
      headers = [
        "Transaction ID",
        "Date",
        "Booking Ref / Voucher",
        "Customer Name",
        "Phone Number",
        "Service Sector",
        "Particulars",
        "Total Billed (₹)",
        "Outstanding Due (₹)",
        "Recovery Status",
        "Notes",
      ];
      rows = filteredTransactions.map((t) => [
        t.id,
        `"${new Date(t.date).toLocaleDateString("en-IN")}"`,
        `"${t.ref_number}"`,
        `"${(t.customer_name || "").replace(/"/g, '""')}"`,
        `"${t.phone || ""}"`,
        t.category,
        `"${(t.particulars || "").replace(/"/g, '""')}"`,
        t.income,
        t.income,
        "PENDING RECOVERY",
        `"${(t.notes || "").replace(/"/g, '""')}"`,
      ]);
      rows.push([
        "",
        "",
        "",
        `"TOTAL OUTSTANDING DUES"`,
        "",
        "",
        "",
        metrics.totalIncome,
        metrics.totalIncome,
        "",
        "",
      ]);
    } else if (reportKey === "profit_loss") {
      headers = [
        "Transaction ID",
        "Date",
        "Service Description",
        "Sector",
        "Client",
        "Gross Revenue (₹)",
        "Direct Operational Cost (₹)",
        "Net Operating Profit (₹)",
        "Profit Margin (%)",
        "Audit Status",
        "Notes",
      ];
      rows = filteredTransactions.map((t) => {
        const net = t.income - t.expense;
        const margin = t.income > 0 ? ((net / t.income) * 100).toFixed(1) + "%" : "0.0%";
        return [
          t.id,
          `"${new Date(t.date).toLocaleDateString("en-IN")}"`,
          `"${(t.particulars || "").replace(/"/g, '""')}"`,
          t.category,
          `"${(t.customer_name || "").replace(/"/g, '""')}"`,
          t.income,
          t.expense,
          net,
          margin,
          t.status,
          `"${(t.notes || "").replace(/"/g, '""')}"`,
        ];
      });
      rows.push([
        "",
        "",
        `"CONSOLIDATED P&L"`,
        "",
        "",
        metrics.totalIncome,
        metrics.totalExpenses,
        metrics.netBalance,
        metrics.profitMargin + "%",
        "",
        "",
      ]);
    } else if (reportKey === "online_cash_inflow") {
      headers = [
        "Transaction ID",
        "Date",
        "Voucher Ref",
        "Customer Name",
        "Phone",
        "Digital Gateway / UPI (₹)",
        "Counter Physical Cash (₹)",
        "Total Intake (₹)",
        "Mode",
        "Status",
        "Notes",
      ];
      rows = filteredTransactions.map((t) => {
        const isCash = t.payment_method === "CASH";
        return [
          t.id,
          `"${new Date(t.date).toLocaleDateString("en-IN")}"`,
          `"${t.ref_number}"`,
          `"${(t.customer_name || "").replace(/"/g, '""')}"`,
          `"${t.phone || ""}"`,
          !isCash ? t.income : 0,
          isCash ? t.income : 0,
          t.income,
          t.payment_method,
          t.status,
          `"${(t.notes || "").replace(/"/g, '""')}"`,
        ];
      });
      rows.push([
        "",
        "",
        "",
        `"TOTAL INFLOW INTAKE"`,
        "",
        metrics.totalOnline,
        metrics.totalCash,
        metrics.totalIncome,
        "",
        "",
        "",
      ]);
    } else {
      // Default / Reports / Final Reports
      headers = [
        "Transaction ID",
        "Date",
        "Voucher / Ref No",
        "Particulars",
        "Sector",
        "Customer",
        "Phone",
        "Payment Method",
        "Status",
        "Income (₹)",
        "Expense (₹)",
        "Balance (₹)",
        "Notes",
      ];
      rows = filteredTransactions.map((t) => [
        t.id,
        `"${new Date(t.date).toLocaleDateString("en-IN")}"`,
        `"${t.ref_number}"`,
        `"${(t.particulars || "").replace(/"/g, '""')}"`,
        t.category,
        `"${(t.customer_name || "").replace(/"/g, '""')}"`,
        `"${t.phone || ""}"`,
        t.payment_method,
        t.status,
        t.income,
        t.expense,
        t.balance,
        `"${(t.notes || "").replace(/"/g, '""')}"`,
      ]);
      rows.push([
        "",
        "",
        "",
        `"REPORT TOTALS"`,
        "",
        "",
        "",
        "",
        "",
        metrics.totalIncome,
        metrics.totalExpenses,
        metrics.netBalance,
        "",
      ]);
    }

    const csvContent = bom + [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${activeDef.shortTitle} Excel sheet downloaded successfully!`);
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

  // Transaction Edit Modal State
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<TransactionRecord | null>(null);
  const [txnFormData, setTxnFormData] = useState({
    particulars: "",
    category: "CAR" as TransactionRecord["category"],
    payment_method: "UPI" as TransactionRecord["payment_method"],
    status: "PAID" as TransactionRecord["status"],
    income: 0,
    expense: 0,
    customer_name: "",
    phone: "",
    notes: "",
  });

  const openEditTxnModal = (t: TransactionRecord) => {
    setEditingTxn(t);
    setTxnFormData({
      particulars: t.particulars,
      category: t.category,
      payment_method: t.payment_method,
      status: t.status,
      income: t.income,
      expense: t.expense,
      customer_name: t.customer_name || "",
      phone: t.phone || "",
      notes: t.notes || "",
    });
    setTxnModalOpen(true);
  };

  const handleSaveTxnRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTxn) return;

    const incomeVal = Number(txnFormData.income || 0);
    const expenseVal = Number(txnFormData.expense || 0);

    const updated: TransactionRecord = {
      ...editingTxn,
      particulars: txnFormData.particulars,
      category: txnFormData.category,
      payment_method: txnFormData.payment_method,
      status: txnFormData.status,
      income: incomeVal,
      expense: expenseVal,
      balance: incomeVal - expenseVal,
      customer_name: txnFormData.customer_name,
      phone: txnFormData.phone,
      notes: txnFormData.notes,
    };

    setTransactions((prev) => prev.map((t) => (t.id === editingTxn.id ? updated : t)));

    // Also sync to dailyRecords if it corresponds to a booking
    if (editingTxn.id.startsWith("BKG-TXN-")) {
      const bkgId = Number(editingTxn.id.replace("BKG-TXN-", ""));
      setDailyRecords((prev) =>
        prev.map((d) =>
          d.id === `BKG-${bkgId}`
            ? {
                ...d,
                pax: txnFormData.customer_name || d.pax,
                ph_no: txnFormData.phone || d.ph_no,
                booking: incomeVal,
                status: txnFormData.status === "PAID" ? "Paid" : "Pending",
              }
            : d
        )
      );

      if (!isNaN(bkgId) && bkgId > 0) {
        try {
          await fetch(`/api/bookings/${bkgId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-admin-key": "Admin@fortunetourism2026",
            },
            body: JSON.stringify({
              id: bkgId,
              passenger_name: txnFormData.customer_name,
              passenger_phone: txnFormData.phone,
              category: txnFormData.category,
              total_amount: incomeVal,
              booking_status: txnFormData.status === "PAID" ? "CONFIRMED" : txnFormData.status,
              payment_status: txnFormData.status === "PAID" ? "Fully Paid" : "Pending",
              notes: txnFormData.notes,
            }),
          });
        } catch (err) {
          console.warn("PUT /api/bookings error:", err);
        }
      }
    } else {
      const rawId = String(editingTxn.id).replace("TXN-", "");
      const numId = Number(rawId);
      if (!isNaN(numId) && numId > 0) {
        try {
          await fetch("/api/business/business_records", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-admin-key": "Admin@fortunetourism2026",
            },
            body: JSON.stringify({
              id: numId,
              particulars: txnFormData.particulars,
              category: txnFormData.category,
              payment_mode: txnFormData.payment_method,
              status: txnFormData.status,
              amount: incomeVal,
              expense_amount: expenseVal,
              client_name: txnFormData.customer_name,
              phone: txnFormData.phone,
              notes: txnFormData.notes,
            }),
          });
        } catch (err) {
          console.warn("PUT /api/business/business_records error:", err);
        }
      }
    }

    setTxnModalOpen(false);
    toast.success("Transaction updated successfully.");
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState("ALL");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  const handleGeneralSearch = () => {
    if (startDate && endDate && endDate < startDate) {
      setDateError("To Date cannot be earlier than From Date");
      return;
    }
    setDateError(null);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 250);

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedCategoryFilter(categoryFilter);
    setAppliedSearchQuery(searchQuery);

    setSearchFeedback("Search applied");
    setTimeout(() => setSearchFeedback(null), 2500);
  };

  const handleResetGeneralFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategoryFilter("ALL");
    setPaymentMethodFilter("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedCategoryFilter("ALL");
    setAppliedSearchQuery("");
    setDateError(null);
    setSearchFeedback("Filters reset");
    setTimeout(() => setSearchFeedback(null), 2000);
  };

  const hasActiveGeneralFilters = Boolean(
    appliedStartDate ||
    appliedEndDate ||
    appliedCategoryFilter !== "ALL" ||
    appliedSearchQuery.trim()
  );

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
      // 1. Fetch Day Book Entries + Bookings + Business Records concurrently
      const [dbRes, bkgRes, bizRes] = await Promise.all([
        fetch("/api/business/day_book_entries?limit=500", {
          headers: { "x-admin-key": "Admin@fortunetourism2026" },
        }).catch(() => null),
        fetch("/api/bookings?limit=500").catch(() => null),
        fetch("/api/business/business_records?limit=500", {
          headers: { "x-admin-key": "Admin@fortunetourism2026" },
        }).catch(() => null),
      ]);

      const pnrByPhone = new Map<string, string>();
      const pnrByTicket = new Map<string, string>();
      const pnrByName = new Map<string, string>();
      let bList: any[] = [];

      if (bkgRes && bkgRes.ok) {
        try {
          const bData = await bkgRes.json();
          bList = Array.isArray(bData.bookings) ? bData.bookings : Array.isArray(bData.rows) ? bData.rows : [];
          bList.forEach((b: any) => {
            const pnr = b.pnr_number || b.pnr_external || b.pnr || "";
            if (pnr) {
              if (b.passenger_phone) {
                const cp = String(b.passenger_phone).replace(/\D/g, "").slice(-10);
                if (cp) pnrByPhone.set(cp, pnr);
              }
              if (b.ticket_number) {
                pnrByTicket.set(String(b.ticket_number).trim().toUpperCase(), pnr);
              }
              if (b.passenger_name) {
                pnrByName.set(String(b.passenger_name).trim().toLowerCase(), pnr);
              }
            }
          });
        } catch (e) {}
      }

      // Map day book entries
      let liveDaily: DailyReportRecord[] = [];
      const matchedBkgIds = new Set<string>();

      if (dbRes && dbRes.ok) {
        const dbData = await dbRes.json();
        if (dbData.success && Array.isArray(dbData.rows)) {
          liveDaily = dbData.rows.map((r: any) => {
            // Extract PNR
            let pnr = r.pnr || r.pnr_number || "";
            if (!pnr && r.notes) {
              const m = r.notes.match(/PNR:\s*([A-Z0-9-]+)/i);
              if (m && m[1]) pnr = m[1].trim();
            }
            if (!pnr && r.passenger_phone) {
              const cp = String(r.passenger_phone).replace(/\D/g, "").slice(-10);
              if (cp && pnrByPhone.has(cp)) pnr = pnrByPhone.get(cp)!;
            }
            if (!pnr && r.passenger_name) {
              const cn = String(r.passenger_name).trim().toLowerCase();
              if (cn && pnrByName.has(cn)) pnr = pnrByName.get(cn)!;
            }
            if (!pnr && (r.travel_by || "").toUpperCase().match(/FLIGHT|TRAIN|BUS/)) {
              if (r.serial_number) {
                pnr = `PNR-${String(r.serial_number).replace(/\D/g, "").slice(-6) || "FT"}`;
              }
            }

            // Cross-match with bookings table to enrich amounts if day_book was 0
            const matchingBkg = bList.find((b: any) => {
              if (pnr && (b.pnr_number === pnr || b.ticket_number === pnr)) return true;
              if (r.passenger_phone && b.passenger_phone) {
                const p1 = String(r.passenger_phone).replace(/\D/g, "").slice(-10);
                const p2 = String(b.passenger_phone).replace(/\D/g, "").slice(-10);
                if (p1 && p1 === p2) return true;
              }
              return false;
            });

            if (matchingBkg) {
              matchedBkgIds.add(String(matchingBkg.id));
            }

            const rawBookingAmt = Number(r.booking_amount || r.total_amount || 0);
            const bkgTotal = matchingBkg ? Number(matchingBkg.total_amount || matchingBkg.fare || 0) : 0;
            const finalBookingAmt = rawBookingAmt > 0 ? rawBookingAmt : bkgTotal;

            const rawAdvAmt = Number(r.office_advance || 0);
            const bkgPaid = matchingBkg ? Number(matchingBkg.paid_total ?? matchingBkg.advance_amount ?? 0) : 0;
            const finalAdvAmt = rawAdvAmt > 0 ? rawAdvAmt : bkgPaid;

            const rawDue = r.due_amount !== null && r.due_amount !== undefined ? Number(r.due_amount) : null;
            const bkgRem = matchingBkg && matchingBkg.remaining_amount !== undefined ? Number(matchingBkg.remaining_amount) : null;
            const finalDue = rawDue !== null ? rawDue : bkgRem !== null ? bkgRem : Math.max(0, finalBookingAmt - finalAdvAmt);

            return {
              id: r.id,
              date: formatDisplayDate(r.booking_date || r.created_at),
              raw_date: r.booking_date || r.created_at,
              trav_on: formatDisplayDate(r.travel_date || r.booking_date || r.created_at),
              pnr: pnr || "—",
              trav_by: (r.travel_by || (matchingBkg?.booking_type) || (matchingBkg?.category) || "CAR").toUpperCase(),
              pax: r.passenger_name || matchingBkg?.passenger_name || "",
              ph_no: r.passenger_phone || matchingBkg?.passenger_phone || "",
              from: r.from_location || matchingBkg?.from_location || "",
              to: r.to_location || matchingBkg?.to_location || "",
              pickup: r.pickup_location || matchingBkg?.pickup_location || "—",
              booking: finalBookingAmt,
              off_adv: finalAdvAmt,
              due: finalDue,
              status: r.status || (finalDue === 0 && finalBookingAmt > 0 ? "Paid" : "Pending"),
              notes: r.notes || matchingBkg?.notes || "",
            };
          });
        }
      }

      // Add ALL bookings that were not already linked in day_book_entries into liveDaily!
      bList.forEach((b: any) => {
        if (!matchedBkgIds.has(String(b.id))) {
          const rawCat = (b.booking_type || b.category || "CAR").toUpperCase();
          const travBy = rawCat === "TAXI" || rawCat === "CAB" ? "CAR" : rawCat;
          const totalAmt = Number(b.total_amount || b.fare || 0);
          const advAmt = Number(b.paid_total ?? b.advance_amount ?? 0);
          const remAmt = Number(
            b.remaining_amount !== undefined ? b.remaining_amount : Math.max(0, totalAmt - advAmt)
          );
          const isFullyPaid =
            (remAmt === 0 && totalAmt > 0) ||
            (b.payment_status || "").toUpperCase() === "PAID" ||
            (b.payment_status || "").toUpperCase() === "FULLY PAID" ||
            (b.payment_status || "").toUpperCase() === "SUCCESS";

          liveDaily.push({
            id: `BKG-${b.id}`,
            date: formatDisplayDate(b.booking_date || b.created_at),
            raw_date: b.booking_date || b.created_at,
            trav_on: formatDisplayDate(b.departure_datetime || b.travel_date || b.created_at),
            pnr: b.pnr_number || b.ticket_number || "—",
            trav_by: travBy,
            pax: b.passenger_name || "Direct Customer",
            ph_no: b.passenger_phone || "",
            from: b.from_location || "—",
            to: b.to_location || "—",
            pickup: b.pickup_location || "—",
            booking: totalAmt,
            off_adv: advAmt,
            due: remAmt,
            status: isFullyPaid ? "Paid" : "Pending",
            notes: b.notes || "",
          });
        }
      });

      const isCleared = typeof window !== "undefined" && localStorage.getItem("fortune_reports_cleared") === "true";
      const deletedDailyIds = new Set<string>(
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("fortune_deleted_daily_record_ids") || "[]")
          : []
      );
      const filteredLiveDaily = liveDaily.filter((r) => !deletedDailyIds.has(String(r.id)));

      if (isCleared) {
        setDailyRecords(filteredLiveDaily);
      } else {
        const existingKeys = new Set(
          filteredLiveDaily.map((d) => `${(d.pax || "").toLowerCase()}_${d.ph_no || ""}`)
        );
        const seedsToKeep = INITIAL_DAILY_REPORTS.filter(
          (s) => !deletedDailyIds.has(String(s.id)) && !existingKeys.has(`${s.pax.toLowerCase()}_${s.ph_no}`)
        );
        setDailyRecords([...seedsToKeep, ...filteredLiveDaily]);
      }

      // 2. Map Transactions (combines business_records AND all bookings!)
      let mappedBiz: TransactionRecord[] = [];
      if (bizRes && bizRes.ok) {
        const data = await bizRes.json();
        if (data.success && Array.isArray(data.rows)) {
          mappedBiz = data.rows.map((r: any, idx: number) => {
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
        }
      }

      // Map every booking into TransactionRecord so Master Report, P&L, Dues, and Payments display all bookings
      const bookingTxns: TransactionRecord[] = bList.map((b: any) => {
        const total = Number(b.total_amount || b.fare || 0);
        const adv = Number(b.paid_total ?? b.advance_amount ?? 0);
        const rem = Number(
          b.remaining_amount !== undefined ? b.remaining_amount : Math.max(0, total - adv)
        );
        const rawCat = (b.category || b.booking_type || "CAR").toUpperCase();
        let cat: TransactionRecord["category"] = "CAR";
        if (rawCat.includes("FLIGHT")) cat = "FLIGHT";
        else if (rawCat.includes("BUS")) cat = "BUS";
        else if (rawCat.includes("TRAIN")) cat = "TRAIN";
        else if (rawCat.includes("HOTEL")) cat = "HOTEL";
        else if (rawCat.includes("TOUR") || rawCat.includes("PACKAGE")) cat = "TOUR";
        else if (rawCat.includes("CAR") || rawCat.includes("CAB") || rawCat.includes("TAXI")) cat = "CAR";

        const isPaid =
          (rem === 0 && total > 0) ||
          (b.payment_status || "").toUpperCase() === "PAID" ||
          (b.payment_status || "").toUpperCase() === "SUCCESS" ||
          (b.payment_status || "").toUpperCase() === "FULLY PAID";
        const isCancelled = (b.booking_status || "").toUpperCase().includes("CANCEL");
        const isRefunded =
          (b.booking_status || "").toUpperCase().includes("REFUND") ||
          (b.payment_status || "").toUpperCase().includes("REFUND");

        let status: TransactionRecord["status"] = "PENDING";
        if (isRefunded) status = "REFUNDED";
        else if (isCancelled) status = "CANCELLED";
        else if (isPaid) status = "PAID";

        let method: TransactionRecord["payment_method"] = "UPI";
        const pMode = String(b.payment_mode || b.payment_method || "UPI").toUpperCase();
        if (pMode.includes("CASH")) method = "CASH";
        else if (pMode.includes("CARD")) method = "CARD";
        else if (pMode.includes("NET") || pMode.includes("BANK")) method = "NETBANKING";
        else if (pMode.includes("RAZORPAY")) method = "RAZORPAY";

        const fromTo = b.from_location && b.to_location ? ` (${b.from_location} → ${b.to_location})` : "";
        const pnrSnippet = b.pnr_number ? ` [PNR: ${b.pnr_number}]` : "";

        return {
          id: `BKG-TXN-${b.id}`,
          date: b.created_at || b.departure_datetime || b.travel_date || new Date().toISOString(),
          ref_number: b.booking_number || b.ticket_number || b.pnr_number || `BKG-${b.id}`,
          particulars: `${cat} Booking: ${b.passenger_name || "Guest"}${fromTo}${pnrSnippet}`,
          category: cat,
          payment_method: method,
          status,
          income: isPaid ? total : adv > 0 ? adv : total,
          expense: 0,
          balance: isPaid ? total : adv > 0 ? adv : total,
          customer_name: b.passenger_name || "Direct Customer",
          phone: b.passenger_phone || "",
          notes: b.notes || (rem > 0 ? `Remaining Due: ₹${rem}` : "Fully Settled"),
        };
      });

      const allCombinedTxns = [...bookingTxns, ...mappedBiz];
      const deletedTxnIds = new Set<string>(
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("fortune_deleted_transaction_ids") || "[]")
          : []
      );
      const filteredCombined = allCombinedTxns.filter((t) => !deletedTxnIds.has(String(t.id)));

      if (isCleared) {
        setTransactions(filteredCombined);
      } else {
        const existingTxnKeys = new Set(filteredCombined.map((t) => t.ref_number.toLowerCase()));
        const seeds = SEED_TRANSACTIONS.filter(
          (s) => !deletedTxnIds.has(String(s.id)) && !existingTxnKeys.has(s.ref_number.toLowerCase())
        );
        setTransactions([...filteredCombined, ...seeds]);
      }
    } catch (err) {
      console.warn("Error fetching live transactions:", err);
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

      // 3. Search Query Filter (PNR, PAX name, Phone, Route, Pickup, SL, Amount)
      if (appliedDailySearchQuery.trim()) {
        const q = appliedDailySearchQuery.toLowerCase().trim();
        const matches =
          (r.pnr && r.pnr.toLowerCase().includes(q)) ||
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
      pnr: "",
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
      pnr: rec.pnr || "",
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

    // Permanently record deletion in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("fortune_deleted_daily_record_ids") || "[]");
      if (!stored.includes(String(id))) {
        stored.push(String(id));
        localStorage.setItem("fortune_deleted_daily_record_ids", JSON.stringify(stored));
      }
    } catch {}

    setDailyRecords((prev) => prev.filter((r) => String(r.id) !== String(id)));

    if (typeof id === "string" && id.startsWith("BKG-")) {
      const bkgId = Number(id.replace("BKG-", ""));
      if (!isNaN(bkgId) && bkgId > 0) {
        // Also remove matching transaction
        setTransactions((prev) => prev.filter((t) => t.id !== `BKG-TXN-${bkgId}`));
        try {
          await fetch(`/api/bookings/${bkgId}`, {
            method: "DELETE",
            headers: { "x-admin-key": "Admin@fortunetourism2026" },
          });
        } catch (err) {
          console.warn("DELETE /api/bookings error:", err);
        }
      }
    } else {
      const numId = Number(id);
      if (!isNaN(numId) && numId > 0) {
        try {
          await fetch(`/api/business/day_book_entries?id=${numId}`, {
            method: "DELETE",
            headers: { "x-admin-key": "Admin@fortunetourism2026" },
          });
        } catch (err) {
          console.warn("DELETE /api/business/day_book_entries error:", err);
        }
      }
    }
    toast.success("Daily report entry deleted successfully.");
  };

  const handleDeleteTransactionRecord = async (id: string | number, label?: string) => {
    const desc = label ? ` "${label}"` : "";
    if (!window.confirm(`Are you sure you want to delete this report entry${desc}?`)) return;

    try {
      const stored = JSON.parse(localStorage.getItem("fortune_deleted_transaction_ids") || "[]");
      if (!stored.includes(String(id))) {
        stored.push(String(id));
        localStorage.setItem("fortune_deleted_transaction_ids", JSON.stringify(stored));
      }
    } catch {}

    setTransactions((prev) => prev.filter((t) => String(t.id) !== String(id)));

    if (typeof id === "string" && id.startsWith("BKG-TXN-")) {
      const bkgId = Number(id.replace("BKG-TXN-", ""));
      if (!isNaN(bkgId) && bkgId > 0) {
        setDailyRecords((prev) => prev.filter((r) => r.id !== `BKG-${bkgId}`));
        try {
          await fetch(`/api/bookings/${bkgId}`, {
            method: "DELETE",
            headers: { "x-admin-key": "Admin@fortunetourism2026" },
          });
        } catch (err) {
          console.warn("DELETE /api/bookings error:", err);
        }
      }
    } else {
      const rawId = String(id).replace("TXN-", "");
      const numId = Number(rawId);
      if (!isNaN(numId) && numId > 0) {
        try {
          await fetch(`/api/business/business_records?id=${numId}`, {
            method: "DELETE",
            headers: { "x-admin-key": "Admin@fortunetourism2026" },
          });
        } catch (err) {
          console.warn("DELETE /api/business/business_records error:", err);
        }
      }
    }
    toast.success("Report entry deleted successfully.");
  };

  const handleClearAllReportData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete and clear ALL records across all financial reports?\n\nThis will permanently remove all daily reports and transaction data."
      )
    ) {
      return;
    }

    try {
      localStorage.setItem("fortune_reports_cleared", "true");
      localStorage.setItem("fortune_deleted_daily_record_ids", JSON.stringify([]));
      localStorage.setItem("fortune_deleted_transaction_ids", JSON.stringify([]));

      setDailyRecords([]);
      setTransactions([]);

      await Promise.allSettled([
        fetch("/api/business/day_book_entries?all=true", {
          method: "DELETE",
          headers: { "x-admin-key": "Admin@fortunetourism2026" },
        }),
        fetch("/api/business/business_records?all=true", {
          method: "DELETE",
          headers: { "x-admin-key": "Admin@fortunetourism2026" },
        }),
      ]);

      toast.success("All report data deleted and cleared successfully.");
    } catch (err) {
      console.error("Error clearing reports:", err);
      toast.error("Failed to delete some records from server.");
    }
  };

  const handleRestoreDemoData = () => {
    if (!window.confirm("Restore default sample/demo report data?")) return;
    localStorage.removeItem("fortune_reports_cleared");
    localStorage.removeItem("fortune_deleted_daily_record_ids");
    localStorage.removeItem("fortune_deleted_transaction_ids");
    fetchLiveTransactions();
    toast.success("Default sample report data restored.");
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
        pnr: dailyFormData.pnr || "—",
        trav_by: dailyFormData.trav_by.toUpperCase(),
        pax: dailyFormData.pax,
        ph_no: dailyFormData.ph_no,
        from: dailyFormData.from,
        to: dailyFormData.to,
        pickup: dailyFormData.pickup,
        booking: bookingVal,
        off_adv: offAdvVal,
        due: dueVal,
        status: dueVal === 0 && bookingVal > 0 ? "Paid" : "Pending",
      };

      setDailyRecords((prev) => prev.map((r) => (r.id === editingRecord.id ? updated : r)));

      // If it's a booking record (id starting with BKG-), update backend bookings
      if (typeof editingRecord.id === "string" && editingRecord.id.startsWith("BKG-")) {
        const bkgId = Number(editingRecord.id.replace("BKG-", ""));
        // Update matching transaction in transactions state
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === `BKG-TXN-${bkgId}`
              ? {
                  ...t,
                  customer_name: dailyFormData.pax,
                  phone: dailyFormData.ph_no,
                  income: dueVal === 0 ? bookingVal : offAdvVal > 0 ? offAdvVal : bookingVal,
                  balance: dueVal === 0 ? bookingVal : offAdvVal > 0 ? offAdvVal : bookingVal,
                  status: dueVal === 0 ? "PAID" : "PENDING",
                }
              : t
          )
        );

        if (!isNaN(bkgId) && bkgId > 0) {
          try {
            await fetch(`/api/bookings/${bkgId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "x-admin-key": "Admin@fortunetourism2026",
              },
              body: JSON.stringify({
                id: bkgId,
                passenger_name: dailyFormData.pax,
                passenger_phone: dailyFormData.ph_no,
                from_location: dailyFormData.from,
                to_location: dailyFormData.to,
                pickup_location: dailyFormData.pickup,
                pnr_number: dailyFormData.pnr,
                total_amount: bookingVal,
                advance_amount: offAdvVal,
                remaining_amount: dueVal,
                departure_datetime: parseToComparableDate(dailyFormData.trav_on),
                category: dailyFormData.trav_by,
                booking_status: dueVal === 0 ? "CONFIRMED" : "PENDING CONFIRMATION",
                payment_status: dueVal === 0 ? "Fully Paid" : offAdvVal > 0 ? "Advance Received" : "Pending",
              }),
            });
          } catch (err) {
            console.warn("PUT /api/bookings error:", err);
          }
        }
      } else if (typeof editingRecord.id === "number") {
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
              pnr: dailyFormData.pnr,
              passenger_name: dailyFormData.pax,
              passenger_phone: dailyFormData.ph_no,
              from_location: dailyFormData.from,
              to_location: dailyFormData.to,
              pickup_location: dailyFormData.pickup,
              booking_amount: bookingVal,
              office_advance: offAdvVal,
              due_amount: dueVal,
              status: dueVal === 0 && bookingVal > 0 ? "Paid" : "Pending",
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
        pnr: dailyFormData.pnr || "—",
        trav_by: dailyFormData.trav_by.toUpperCase(),
        pax: dailyFormData.pax,
        ph_no: dailyFormData.ph_no,
        from: dailyFormData.from,
        to: dailyFormData.to,
        pickup: dailyFormData.pickup,
        booking: bookingVal,
        off_adv: offAdvVal,
        due: dueVal,
        status: dueVal === 0 && bookingVal > 0 ? "Paid" : "Pending",
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
            pnr: dailyFormData.pnr,
            passenger_name: dailyFormData.pax,
            passenger_phone: dailyFormData.ph_no,
            from_location: dailyFormData.from,
            to_location: dailyFormData.to,
            pickup_location: dailyFormData.pickup,
            booking_amount: bookingVal,
            office_advance: offAdvVal,
            due_amount: dueVal,
            status: dueVal === 0 && bookingVal > 0 ? "Paid" : "Pending",
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
      const q = (appliedSearchQuery || searchQuery).toLowerCase().trim();
      if (q) {
        const matches =
          t.ref_number.toLowerCase().includes(q) ||
          t.particulars.toLowerCase().includes(q) ||
          (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
          (t.phone && t.phone.includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.payment_method && t.payment_method.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category / Sector
      const cat = appliedCategoryFilter !== "ALL" ? appliedCategoryFilter : categoryFilter;
      if (cat !== "ALL") {
        const tCat = (t.category || "").toUpperCase();
        if (cat === "TOUR" && !tCat.includes("TOUR")) return false;
        if (cat === "CAB" && !tCat.includes("CAB") && !tCat.includes("CAR")) return false;
        if (cat === "FLIGHT" && !tCat.includes("FLIGHT")) return false;
        if (cat === "TRAIN" && !tCat.includes("TRAIN")) return false;
        if (cat === "BUS" && !tCat.includes("BUS")) return false;
        if (cat === "HOTEL" && !tCat.includes("HOTEL")) return false;
        if (cat === "GENERAL" && tCat !== "GENERAL") return false;
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
      const fromD = appliedStartDate || startDate;
      const toD = appliedEndDate || endDate;
      if (fromD) {
        const sTime = new Date(fromD).setHours(0, 0, 0, 0);
        const tTime = new Date(t.date).getTime();
        if (tTime < sTime) return false;
      }
      if (toD) {
        const eTime = new Date(toD).setHours(23, 59, 59, 999);
        const tTime = new Date(t.date).getTime();
        if (tTime > eTime) return false;
      }

      return true;
    });
  }, [
    transactions,
    searchQuery,
    appliedSearchQuery,
    categoryFilter,
    appliedCategoryFilter,
    paymentMethodFilter,
    statusFilter,
    activeReport,
    startDate,
    appliedStartDate,
    endDate,
    appliedEndDate,
  ]);

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

  // Export to CSV / Excel
  const handleExportCSV = () => {
    handleExportExcel(activeReport);
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

          {/* Action buttons across all Financial Ledger reports */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleClearAllReportData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Permanently delete and clear all records across all reports"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Data</span>
            </button>
            {dailyRecords.length === 0 && transactions.length === 0 && (
              <button
                onClick={handleRestoreDemoData}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition cursor-pointer"
                title="Restore default sample report data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Sample Data</span>
              </button>
            )}
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
              onClick={() => handleExportExcel(activeReport)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#107c41] hover:bg-[#0d6535] text-white border border-emerald-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Download Excel Sheet (.csv)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
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
                onClick={() => handleExportExcel("daily")}
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
          <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            {/* Left: Heading with orange icon & record count badge */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-500 shrink-0" />
                <h3 className="font-black text-slate-900 text-sm whitespace-nowrap">
                  {activeDef.shortTitle}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? "entry" : "entries"}
              </span>
              {searchFeedback && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full animate-in fade-in duration-150">
                  {searchFeedback}
                </span>
              )}
            </div>

            {/* Compact Controls: From Date -> To Date -> Sector/Booking Type -> Search Field -> Search Button -> Export Excel -> Reset */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap items-stretch sm:items-center gap-2 w-full xl:w-auto">
              {/* From Date */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition">
                <label htmlFor="gen-from-date" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  From:
                </label>
                <input
                  id="gen-from-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (dateError) setDateError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGeneralSearch();
                  }}
                  className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer w-full sm:w-auto"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition">
                <label htmlFor="gen-to-date" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  To:
                </label>
                <input
                  id="gen-to-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (dateError) setDateError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGeneralSearch();
                  }}
                  className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer w-full sm:w-auto"
                />
              </div>

              {/* Sector / Booking Types Dropdown */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-bold text-slate-800 hover:bg-slate-100 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none cursor-pointer transition"
                >
                  <option value="ALL">All Booking Types</option>
                  <option value="TOUR">Tour Packages</option>
                  <option value="CAB">Car / Cab</option>
                  <option value="FLIGHT">Flight</option>
                  <option value="TRAIN">Train</option>
                  <option value="BUS">Bus</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="GENERAL">General</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search Query Field */}
              <div className="relative flex-1 sm:w-44 xl:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGeneralSearch();
                  }}
                  placeholder="Search name, ph, route, ref..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setAppliedSearchQuery("");
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
                onClick={handleGeneralSearch}
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
                onClick={() => handleExportExcel(activeReport)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#107c41] hover:bg-[#0d6535] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                title="Download Excel Sheet (.csv)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              {/* Reset Button */}
              {hasActiveGeneralFilters && (
                <button
                  type="button"
                  onClick={handleResetGeneralFilters}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer shrink-0"
                  title="Reset all filters"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Date Validation Error Message */}
        {dateError && (
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
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">PNR</th>
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
                      <td colSpan={14} className="py-12 text-center text-slate-500 border border-slate-300 bg-white">
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

                        {/* 4. PNR */}
                        <td className="py-2 px-3 text-center whitespace-nowrap border border-slate-300 bg-amber-50/40">
                          <span className={`inline-block font-mono text-[11px] font-black px-2 py-0.5 rounded border ${
                            r.pnr && r.pnr !== "—"
                              ? "bg-amber-100 text-amber-950 border-amber-300 shadow-2xs"
                              : "text-slate-400 border-transparent"
                          }`}>
                            {r.pnr || "—"}
                          </span>
                        </td>

                        {/* 5. TRAV BY */}
                        <td className="py-2 px-3 text-center whitespace-nowrap font-bold text-slate-800 border border-slate-300">
                          {r.trav_by}
                        </td>

                        {/* 6. PAX */}
                        <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-900 border border-slate-300">
                          {r.pax}
                        </td>

                        {/* 7. PH NO */}
                        <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-800 border border-slate-300">
                          {r.ph_no}
                        </td>

                        {/* 8. FROM */}
                        <td className="py-2 px-3 whitespace-nowrap text-slate-800 font-medium border border-slate-300">
                          {r.from}
                        </td>

                        {/* 9. TO */}
                        <td className="py-2 px-3 whitespace-nowrap text-slate-800 font-medium border border-slate-300">
                          {r.to}
                        </td>

                        {/* 10. PICK UP */}
                        <td className="py-2 px-3 whitespace-nowrap text-slate-700 border border-slate-300">
                          {r.pickup}
                        </td>

                        {/* 11. BOOKING */}
                        <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-slate-900 border border-slate-300 bg-emerald-50/20">
                          ₹{Number(r.booking).toLocaleString("en-IN")}
                        </td>

                        {/* 12. OFF ADV */}
                        <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-blue-700 border border-slate-300 bg-blue-50/20">
                          ₹{Number(r.off_adv).toLocaleString("en-IN")}
                        </td>

                        {/* 13. DUE */}
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
                      <td colSpan={9} className="py-2.5 px-3 border border-slate-300 bg-slate-100/70"></td>
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
            <div className="min-w-full inline-block align-middle">
              <table className="w-full text-left text-xs border-collapse border border-slate-300 font-sans">
                <thead>
                  <tr className="bg-[#107c41] text-white font-black uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 text-center w-12 border border-[#0d6535] whitespace-nowrap">SL</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">DATE</th>
                    <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">PARTICULARS</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">VOUCHER / REF</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">SECTOR</th>
                    <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">CUSTOMER</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">METHOD</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">STATUS</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">INCOME</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">EXPENSE</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">BALANCE</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap w-20 border border-[#0d6535]">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400 bg-white">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-sm text-slate-600">No transaction records match the selected filters.</p>
                        <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting another date range.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t, idx) => {
                      return (
                        <tr
                          key={t.id}
                          className="odd:bg-white even:bg-[#f9fafb] hover:bg-[#e8f5e9] transition-colors border-b border-slate-300"
                        >
                          {/* SL */}
                          <td className="py-2 px-3 text-center whitespace-nowrap font-bold text-slate-600 border border-slate-300 bg-slate-50/60">
                            {idx + 1}
                          </td>

                          {/* Date */}
                          <td className="py-2 px-3 text-center whitespace-nowrap font-medium text-slate-700 border border-slate-300">
                            {new Date(t.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>

                          {/* Particulars */}
                          <td className="py-2 px-3 font-semibold text-slate-900 border border-slate-300 max-w-xs truncate">
                            {t.particulars}
                          </td>

                          {/* Voucher / Ref */}
                          <td className="py-2 px-3 text-center whitespace-nowrap font-mono text-slate-700 font-bold border border-slate-300 bg-slate-50/40">
                            {t.ref_number}
                          </td>

                          {/* Sector */}
                          <td className="py-2 px-3 text-center whitespace-nowrap border border-slate-300">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                              {t.category}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-800 border border-slate-300">
                            <div>{t.customer_name || "Direct Customer"}</div>
                            {t.phone && <div className="text-[10px] text-slate-500 font-normal">{t.phone}</div>}
                          </td>

                          {/* Payment Method */}
                          <td className="py-2 px-3 text-center whitespace-nowrap border border-slate-300">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                t.payment_method === "CASH"
                                  ? "bg-amber-100 text-amber-900"
                                  : t.payment_method === "UPI"
                                  ? "bg-indigo-100 text-indigo-900"
                                  : "bg-cyan-100 text-cyan-900"
                              }`}
                            >
                              {t.payment_method}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-2 px-3 text-center whitespace-nowrap border border-slate-300">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                t.status === "PAID"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : t.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                            >
                              {t.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                              {t.status === "PENDING" && <Clock className="w-3 h-3" />}
                              {t.status}
                            </span>
                          </td>

                          {/* Income */}
                          <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-emerald-700 border border-slate-300 bg-emerald-50/20">
                            {t.income > 0 ? `₹${Number(t.income).toLocaleString("en-IN")}` : "—"}
                          </td>

                          {/* Expense */}
                          <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-rose-600 border border-slate-300 bg-rose-50/20">
                            {t.expense > 0 ? `₹${Number(t.expense).toLocaleString("en-IN")}` : "—"}
                          </td>

                          {/* Balance */}
                          <td className="py-2 px-3 text-right whitespace-nowrap font-black text-slate-900 border border-slate-300 bg-slate-50/30">
                            ₹{Number(t.balance).toLocaleString("en-IN")}
                          </td>

                          {/* Action */}
                          <td className="py-2 px-3 text-center whitespace-nowrap border border-slate-300 bg-slate-50/40">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditTxnModal(t)}
                                className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                                title="Edit Entry"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTransactionRecord(t.id, t.ref_number || t.particulars)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {filteredTransactions.length > 0 && (
                  <tfoot className="bg-[#eef7ee] text-slate-900 font-black border-t-2 border-slate-400 border-b-4 border-double border-slate-500">
                    <tr>
                      <td colSpan={8} className="py-2.5 px-3 text-right font-black text-slate-900 whitespace-nowrap text-xs uppercase tracking-wider border border-slate-300 bg-[#d9ebd9]">
                        Total Summary
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                        ₹{metrics.totalIncome.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-700 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                        ₹{metrics.totalExpenses.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-blue-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                        ₹{metrics.netBalance.toLocaleString("en-IN")}
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
                    <span>{activeDef.shortTitle} Sheet</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                  <span>Rows: <strong className="text-slate-800">{filteredTransactions.length}</strong></span>
                  <span>Total Income: <strong className="text-emerald-700">₹{metrics.totalIncome.toLocaleString("en-IN")}</strong></span>
                  <span>Total Expense: <strong className="text-rose-700">₹{metrics.totalExpenses.toLocaleString("en-IN")}</strong></span>
                  <span>Net Balance: <strong className="text-blue-700">₹{metrics.netBalance.toLocaleString("en-IN")}</strong></span>
                </div>
              </div>
            </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PNR NUMBER */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PNR NUMBER</label>
                  <input
                    type="text"
                    value={dailyFormData.pnr}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, pnr: e.target.value })}
                    placeholder="e.g. PNR-839201"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-mono font-bold text-amber-900 bg-amber-50/30"
                  />
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

      {/* Transaction Edit Modal */}
      {txnModalOpen && editingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm text-white">
                  Edit Report Transaction · {editingTxn.ref_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTxnModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTxnRecord} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Particulars / Description</label>
                <input
                  type="text"
                  required
                  value={txnFormData.particulars}
                  onChange={(e) => setTxnFormData({ ...txnFormData, particulars: e.target.value })}
                  placeholder="Booking description"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sector / Category</label>
                  <select
                    value={txnFormData.category}
                    onChange={(e) => setTxnFormData({ ...txnFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="CAR">CAR / CAB</option>
                    <option value="BUS">BUS</option>
                    <option value="TRAIN">TRAIN</option>
                    <option value="FLIGHT">FLIGHT</option>
                    <option value="HOTEL">HOTEL</option>
                    <option value="TOUR">TOUR PACKAGE</option>
                    <option value="UTILITY">UTILITY</option>
                    <option value="OFFICE">OFFICE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={txnFormData.payment_method}
                    onChange={(e) => setTxnFormData({ ...txnFormData, payment_method: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                    <option value="NETBANKING">NET BANKING</option>
                    <option value="RAZORPAY">RAZORPAY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Passenger Name</label>
                  <input
                    type="text"
                    value={txnFormData.customer_name}
                    onChange={(e) => setTxnFormData({ ...txnFormData, customer_name: e.target.value })}
                    placeholder="Customer Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={txnFormData.phone}
                    onChange={(e) => setTxnFormData({ ...txnFormData, phone: e.target.value })}
                    placeholder="Mobile Number"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Income / Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={txnFormData.income}
                    onChange={(e) => setTxnFormData({ ...txnFormData, income: Number(e.target.value || 0) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expense (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={txnFormData.expense}
                    onChange={(e) => setTxnFormData({ ...txnFormData, expense: Number(e.target.value || 0) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={txnFormData.status}
                    onChange={(e) => setTxnFormData({ ...txnFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none font-black text-slate-800 cursor-pointer"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={txnFormData.notes}
                  onChange={(e) => setTxnFormData({ ...txnFormData, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTxnModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Transaction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
