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
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Check,
  ChevronDown,
  FolderKanban,
  FolderArchive,
  FolderOpen,
} from "lucide-react";
import { ReportFolderModal } from "./ReportFolderModal";

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
  date: string; // DATE (e.g. 01/09/2026 or 14/10/2026)
  trav_on: string; // TRAV ON
  pnr?: string; // PNR Number
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

export function generateInitialDailyReports(): DailyReportRecord[] {
  const now = new Date();
  const formatDDMMYYYY = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const formatYYYYMMDD = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = formatDDMMYYYY(now);
  const todayRaw = formatYYYYMMDD(now);
  const yestDate = new Date(now);
  yestDate.setDate(yestDate.getDate() - 1);
  const yestStr = formatDDMMYYYY(yestDate);
  const yestRaw = formatYYYYMMDD(yestDate);

  return [
    {
      id: "DR-TD-1",
      sl: 1,
      date: todayStr,
      trav_on: todayStr,
      pnr: "FT-AIR-901",
      trav_by: "CAR",
      pax: "MOSTAQUE AHMED",
      ph_no: "9800312531",
      from: "KIA AIRPORT",
      to: "BOMMASANDRA INDUSTRIAL",
      pickup: "TERMINAL 2 PILLAR 10",
      booking: 2200,
      off_adv: 500,
      due: 1700,
      status: "Pending",
      raw_date: todayRaw,
    },
    {
      id: "DR-TD-2",
      sl: 2,
      date: todayStr,
      trav_on: todayStr,
      pnr: "6E-5481",
      trav_by: "FLIGHT",
      pax: "DEBENDRA KR ROUT",
      ph_no: "9845471540",
      from: "BENGALURU (BLR)",
      to: "MUMBAI (BOM)",
      pickup: "KIADB T1",
      booking: 5800,
      off_adv: 5800,
      due: 0,
      status: "Paid",
      raw_date: todayRaw,
    },
    {
      id: "DR-TD-3",
      sl: 3,
      date: todayStr,
      trav_on: todayStr,
      pnr: "KA-51-E-9020",
      trav_by: "CAR",
      pax: "PRADIP KR MITRA",
      ph_no: "9431087563",
      from: "BOMMASANDRA",
      to: "ELECTRONIC CITY GATE 4",
      pickup: "HEAD OFFICE",
      booking: 1400,
      off_adv: 0,
      due: 1400,
      status: "Pending",
      raw_date: todayRaw,
    },
    {
      id: "DR-YD-1",
      sl: 4,
      date: yestStr,
      trav_on: yestStr,
      pnr: "KSRTC-9281",
      trav_by: "BUS",
      pax: "KAVITHA REDDY",
      ph_no: "9900155667",
      from: "MAJESTIC",
      to: "HYDERABAD MGBS",
      pickup: "COUNTER 4",
      booking: 1850,
      off_adv: 1850,
      due: 0,
      status: "Paid",
      raw_date: yestRaw,
    },
    {
      id: "DR-YD-2",
      sl: 5,
      date: yestStr,
      trav_on: yestStr,
      pnr: "FT-TRIP-702",
      trav_by: "TOUR",
      pax: "RAJESH SHARMA",
      ph_no: "9886033445",
      from: "BENGALURU",
      to: "MYSORE PALACE & COORG",
      pickup: "INDIRANAGAR",
      booking: 16500,
      off_adv: 5000,
      due: 11500,
      status: "Pending",
      raw_date: yestRaw,
    },
    {
      id: "DR-1",
      sl: 6,
      date: "01/09/2026",
      trav_on: "01/09/2026",
      pnr: "FT-839201",
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
      sl: 7,
      date: "01/09/2026",
      trav_on: "02/09/2026",
      pnr: "FT-839202",
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
      sl: 8,
      date: "02/09/2026",
      trav_on: "02/09/2026",
      pnr: "FT-839203",
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
      sl: 9,
      date: "02/09/2026",
      trav_on: "02/09/2026",
      pnr: "FT-839204",
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
}

export const INITIAL_DAILY_REPORTS: DailyReportRecord[] = generateInitialDailyReports();

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
  supplier?: string;
}

export function extractSupplier(particulars?: string, category?: string, notes?: string, supplier?: string): string {
  if (supplier && supplier.trim()) return supplier.trim();
  const text = `${particulars || ""} ${notes || ""}`;

  // Airlines
  if (/indigo/i.test(text)) return "IndiGo Airlines";
  if (/air india express/i.test(text)) return "Air India Express";
  if (/air india/i.test(text)) return "Air India";
  if (/spicejet/i.test(text)) return "SpiceJet";
  if (/vistara/i.test(text)) return "Vistara Airlines";
  if (/akasa/i.test(text)) return "Akasa Air";

  // Bus Operators
  if (/ksrtc/i.test(text)) return "KSRTC (Karnataka RTC)";
  if (/srs/i.test(text)) return "SRS Travels";
  if (/vrl/i.test(text)) return "VRL Travels";
  if (/orange/i.test(text)) return "Orange Tours & Travels";
  if (/sharma/i.test(text)) return "Sharma Transports";
  if (/national/i.test(text)) return "National Travels";
  if (/jabbar/i.test(text)) return "Jabbar Travels";
  if (/kallada/i.test(text)) return "Kallada Travels";

  // Trains
  if (/irctc|train|railway|rajdhani|shatabdi|vande/i.test(text) || category === "TRAIN") return "IRCTC / Indian Railways";

  // Hotels
  if (/taj|marriott|hilton|hyatt|radisson|lemon tree|oyo/i.test(text)) {
    const m = text.match(/(taj|marriott|hilton|hyatt|radisson|lemon tree|oyo\w*)\s*[\w\s]*/i);
    if (m) return m[0].trim();
  }

  // Cabs & Tour
  if (category === "CAR") return "Fortune Fleet Logistics Partner";
  if (category === "TOUR") return "Fortune Tourism Destination Partner";
  if (category === "FLIGHT") return "Airlines Direct Booking Partner";
  if (category === "BUS") return "Private Bus Operator Partner";
  if (category === "HOTEL") return "Hospitality Partner";

  return "Fortune Operations Vendor";
}

interface AccountsReportsHubProps {
  initialReport?: AccountReportKey;
  onSelectReport?: (reportKey: AccountReportKey) => void;
  onNavigateToDayBook?: () => void;
  onOpenReportFolderModal?: () => void;
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

export function getLocalDateString(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function shiftDateByDays(dateStr: string, offsetDays: number): string {
  if (!dateStr) return getLocalDateString();
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return getLocalDateString();
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateString(d);
}

export function formatComparableToDisplay(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

interface DayFilterToolbarProps {
  dayFilterMode: "today" | "yesterday" | "single_day" | "range" | "all";
  selectedDay: string;
  onSelectMode: (mode: "today" | "yesterday" | "single_day" | "range" | "all") => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onChangeSelectedDay: (day: string) => void;
  activeRecordCount: number;
  latestDateWithRecords?: string;
  onJumpToLatestDate: (date: string) => void;
  onShowAllDays: () => void;
}

function DayFilterToolbar({
  dayFilterMode,
  selectedDay,
  onSelectMode,
  onPrevDay,
  onNextDay,
  onChangeSelectedDay,
  activeRecordCount,
  latestDateWithRecords,
  onJumpToLatestDate,
  onShowAllDays,
}: DayFilterToolbarProps) {
  const todayIso = getLocalDateString();
  const yesterdayIso = shiftDateByDays(todayIso, -1);

  return (
    <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 p-3 sm:p-4 space-y-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Quick Day Selector Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            Day Filter:
          </span>

          {/* Today Button */}
          <button
            type="button"
            onClick={() => onSelectMode("today")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              dayFilterMode === "today"
                ? "bg-emerald-600 text-white shadow-xs border border-emerald-700 ring-2 ring-emerald-500/20"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
            title="Show today's entries only (whole day details)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today (Whole Day)</span>
          </button>

          {/* Yesterday Button */}
          <button
            type="button"
            onClick={() => onSelectMode("yesterday")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dayFilterMode === "yesterday"
                ? "bg-indigo-600 text-white shadow-xs border border-indigo-700 ring-2 ring-indigo-500/20"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
            title="Show yesterday's entries"
          >
            <span>Yesterday</span>
          </button>

          {/* Step Day Stepper: Prev Day | Date Picker | Next Day */}
          <div className="inline-flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={onPrevDay}
              className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-black transition border-r border-slate-200 flex items-center gap-0.5 cursor-pointer"
              title="Filter by Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev Day</span>
            </button>

            <div className="relative flex items-center px-2 py-1 bg-amber-50/40">
              <input
                type="date"
                value={selectedDay}
                onChange={(e) => {
                  if (e.target.value) {
                    onChangeSelectedDay(e.target.value);
                  }
                }}
                className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
                title="Pick a Specific Day"
              />
            </div>

            <button
              type="button"
              onClick={onNextDay}
              className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-black transition border-l border-slate-200 flex items-center gap-0.5 cursor-pointer"
              title="Filter by Next Day"
            >
              <span className="hidden sm:inline">Next Day</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Date Range Button */}
          <button
            type="button"
            onClick={() => onSelectMode("range")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dayFilterMode === "range"
                ? "bg-amber-500 text-slate-950 font-black shadow-xs border border-amber-600 ring-2 ring-amber-400/20"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
            title="Filter by Custom Date Range"
          >
            <span>Date Range</span>
          </button>

          {/* All Days Button */}
          <button
            type="button"
            onClick={() => onSelectMode("all")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dayFilterMode === "all"
                ? "bg-slate-900 text-white shadow-xs border border-slate-950 ring-2 ring-slate-800/20"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
            title="Show All Dates / Historical Entries"
          >
            <span>All Days</span>
          </button>
        </div>

        {/* Right: Active Filter Indicator Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {dayFilterMode === "today" && `Today (${formatComparableToDisplay(todayIso)}) · Whole Day Details`}
              {dayFilterMode === "yesterday" && `Yesterday (${formatComparableToDisplay(yesterdayIso)})`}
              {dayFilterMode === "single_day" && `Day: ${formatComparableToDisplay(selectedDay)}`}
              {dayFilterMode === "range" && "Custom Date Range"}
              {dayFilterMode === "all" && "All Days (Unrestricted)"}
            </span>
            <span className="text-slate-400">|</span>
            <span className="font-black text-slate-900">
              {activeRecordCount} {activeRecordCount === 1 ? "entry" : "entries"}
            </span>
          </div>
        </div>
      </div>

      {/* Helpful banner if 0 entries found for the selected day */}
      {activeRecordCount === 0 && (dayFilterMode === "today" || dayFilterMode === "single_day" || dayFilterMode === "yesterday") && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              No entries recorded for{" "}
              <strong>
                {dayFilterMode === "today"
                  ? `Today (${formatComparableToDisplay(todayIso)})`
                  : dayFilterMode === "yesterday"
                  ? `Yesterday (${formatComparableToDisplay(yesterdayIso)})`
                  : formatComparableToDisplay(selectedDay)}
              </strong>{" "}
              yet.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {latestDateWithRecords && latestDateWithRecords !== (dayFilterMode === "today" ? todayIso : selectedDay) && (
              <button
                type="button"
                onClick={() => onJumpToLatestDate(latestDateWithRecords)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-lg transition shadow-2xs cursor-pointer"
              >
                Jump to Latest Day with Entries ({formatComparableToDisplay(latestDateWithRecords)})
              </button>
            )}
            <button
              type="button"
              onClick={onShowAllDays}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-lg transition cursor-pointer"
            >
              View All Days
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSize: number | "ALL";
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number | "ALL") => void;
}

function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const pageNumbers: (number | "...")[] = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [totalPages, currentPage]);

  return (
    <div className="bg-slate-50 border-t border-slate-300 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      {/* Left: Showing X to Y of Z entries + Rows per page */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-slate-600 font-medium">
          Showing <strong className="text-slate-900 font-black">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
          <strong className="text-slate-900 font-black">{endIndex}</strong> of{" "}
          <strong className="text-slate-900 font-black">{totalItems}</strong> entries
        </span>

        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
          <label htmlFor="report-page-size" className="text-slate-500 font-semibold text-[11px] whitespace-nowrap">
            Rows per page:
          </label>
          <select
            id="report-page-size"
            value={pageSize}
            onChange={(e) => {
              const val = e.target.value === "ALL" ? "ALL" : Number(e.target.value);
              onPageSizeChange(val);
            }}
            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-2xs"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="ALL">All</option>
          </select>
        </div>
      </div>

      {/* Right: Page navigation buttons */}
      {pageSize !== "ALL" && totalPages > 1 && (
        <div className="flex items-center gap-1 self-center md:self-auto">
          {/* First page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs transition cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 px-1">
            {pageNumbers.map((p, i) => {
              if (p === "...") {
                return (
                  <span key={`ellipsis-${i}`} className="px-1.5 text-slate-400 font-bold select-none">
                    …
                  </span>
                );
              }
              const isCurrent = p === currentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(p as number)}
                  className={`min-w-7 h-7 px-2 rounded-lg text-xs font-black transition cursor-pointer ${
                    isCurrent
                      ? "bg-[#107c41] text-white shadow-xs border border-[#0d6535]"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs transition cursor-pointer"
            title="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function AccountsReportsHub({
  initialReport = "reports",
  onSelectReport,
  onNavigateToDayBook,
  onOpenReportFolderModal,
}: AccountsReportsHubProps) {
  const [isReportFolderExpanded, setIsReportFolderExpanded] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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

  // Isolated per-report deletion map: { [reportKey]: [deletedId1, deletedId2, ...] }
  // Ensures deleting in Daily Reports ONLY removes from Daily Reports and never reflects in other reports!
  const [deletedByReport, setDeletedByReport] = useState<Record<string, string[]>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("fortune_deleted_by_report");
      const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {};
      const prevDaily = JSON.parse(localStorage.getItem("fortune_deleted_daily_record_ids") || "[]");
      if (Array.isArray(prevDaily) && prevDaily.length > 0) {
        parsed.daily = Array.from(new Set([...(parsed.daily || []), ...prevDaily.map(String)]));
      }
      return parsed;
    } catch {
      return {};
    }
  });

  const markDeletedInReport = (reportKey: string, recordId: string | number) => {
    const idStr = String(recordId);
    setDeletedByReport((prev) => {
      const currentList = prev[reportKey] || [];
      if (currentList.includes(idStr)) return prev;
      const updated = {
        ...prev,
        [reportKey]: [...currentList, idStr],
      };
      try {
        localStorage.setItem("fortune_deleted_by_report", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const restoreDeletedForReport = (reportKey: string) => {
    const reportTitle = REPORT_DEFINITIONS.find((r) => r.key === reportKey)?.shortTitle || reportKey;
    if (!window.confirm(`Restore all deleted entries in ${reportTitle}?`)) return;

    setDeletedByReport((prev) => {
      const updated = { ...prev, [reportKey]: [] };
      try {
        localStorage.setItem("fortune_deleted_by_report", JSON.stringify(updated));
        if (reportKey === "daily") {
          localStorage.removeItem("fortune_deleted_daily_record_ids");
        }
      } catch {}
      return updated;
    });

    fetchLiveTransactions();
    toast.success(`All deleted entries restored for ${reportTitle}.`);
  };

  const [loading, setLoading] = useState(false);

  // Day Filter Mode: "today" | "yesterday" | "single_day" | "range" | "all"
  // Default is "today" so 1st page immediately displays whole day details of today!
  const [dayFilterMode, setDayFilterMode] = useState<"today" | "yesterday" | "single_day" | "range" | "all">("today");
  const [selectedDay, setSelectedDay] = useState<string>(() => getLocalDateString());

  // Pagination states
  const [pageSize, setPageSize] = useState<number | "ALL">(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const resetPage = () => setCurrentPage(1);

  const handleSelectDayFilter = (mode: "today" | "yesterday" | "single_day" | "range" | "all", customDay?: string) => {
    setDayFilterMode(mode);
    if (customDay) {
      setSelectedDay(customDay);
    } else if (mode === "today") {
      setSelectedDay(getLocalDateString());
    } else if (mode === "yesterday") {
      setSelectedDay(shiftDateByDays(getLocalDateString(), -1));
    }
    resetPage();
  };

  const handlePrevDay = () => {
    const base = selectedDay || getLocalDateString();
    const prev = shiftDateByDays(base, -1);
    setSelectedDay(prev);
    setDayFilterMode("single_day");
    resetPage();
  };

  const handleNextDay = () => {
    const base = selectedDay || getLocalDateString();
    const next = shiftDateByDays(base, 1);
    setSelectedDay(next);
    setDayFilterMode("single_day");
    resetPage();
  };

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
    resetPage();

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
    resetPage();
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
        "Supplier / Vendor",
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
        `"${(t.supplier || extractSupplier(t.particulars, t.category, t.notes)).replace(/"/g, '""')}"`,
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
        "Pending Payment (₹)",
        "Status",
        "Customer Name",
        "Phone",
        "Particulars",
        "Notes",
      ];
      rows = filteredTransactions.map((t) => {
        const isPaid = t.status === "PAID";
        const advMatch = t.notes?.match(/Advance Paid:\s*₹?(\d+)/i);
        const remMatch = t.notes?.match(/Remaining Due:\s*₹?(\d+)/i);
        const adv = advMatch ? Number(advMatch[1]) : 0;
        const received = isPaid ? t.income : (adv > 0 ? adv : 0);
        const pending = remMatch ? Number(remMatch[1]) : (!isPaid ? t.income : 0);

        return [
          t.id,
          `"${new Date(t.date).toLocaleDateString("en-IN")}"`,
          `"${t.ref_number}"`,
          t.payment_method,
          received,
          pending,
          t.status,
          `"${(t.customer_name || "").replace(/"/g, '""')}"`,
          `"${t.phone || ""}"`,
          `"${(t.particulars || "").replace(/"/g, '""')}"`,
          `"${(t.notes || "").replace(/"/g, '""')}"`,
        ];
      });
      rows.push([
        "",
        "",
        `"TOTALS"`,
        "",
        metrics.totalIncome,
        metrics.totalPending,
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
        "Status",
        "Physical Cash Inflow (₹)",
        "Online / Bank Inflow (₹)",
        "Total Inflow (₹)",
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
          t.status,
          isCash ? t.income : 0,
          !isCash ? t.income : 0,
          t.income,
          `"${(t.customer_name || "").replace(/"/g, '""')}"`,
          `"${(t.notes || "").replace(/"/g, '""')}"`,
        ];
      });
      rows.push([
        "",
        "",
        `"TOTAL INFLOW"`,
        "",
        "",
        "",
        metrics.totalCash,
        metrics.totalOnline,
        metrics.totalIncome,
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
        metrics.totalPending || metrics.totalIncome,
        "PENDING RECOVERY",
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
    resetPage();

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
    resetPage();
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
    resetPage();
    if (onSelectReport) {
      onSelectReport(key);
    }
  };

  // Fetch real database transactions & day book entries from PostgreSQL API
  const fetchLiveTransactions = async () => {
    setLoading(true);
    try {
      // 1. Fetch Day Book Entries + Bookings + Hourly Bookings concurrently
      const adminKey =
        (typeof window !== "undefined" &&
          (sessionStorage.getItem("fortune_admin_key") ||
            localStorage.getItem("fortune_admin_key"))) ||
        "Admin@fortunetourism2026";
      const headers: Record<string, string> = { "x-admin-key": adminKey };

      const [dbRes, bkgRes, hourlyRes] = await Promise.all([
        fetch("/api/business/day_book_entries?limit=500", { headers }).catch(() => null),
        fetch("/api/bookings?limit=500").catch(() => null),
        fetch("/api/business/hourly_bookings?limit=500", { headers }).catch(() => null),
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
            const bkgTotal = matchingBkg
              ? Number(matchingBkg.total_amount || matchingBkg.fare || matchingBkg.ticket_amount || matchingBkg.base_amount || 0)
              : 0;
            const finalBookingAmt = rawBookingAmt > 0 ? rawBookingAmt : bkgTotal;

            const rawAdvAmt = Number(r.office_advance || 0);
            const bkgPaid = matchingBkg ? Number(matchingBkg.paid_total ?? matchingBkg.advance_amount ?? 0) : 0;
            const finalAdvAmt = rawAdvAmt > 0 ? rawAdvAmt : bkgPaid;

            const rawDue = r.due_amount !== null && r.due_amount !== undefined ? Number(r.due_amount) : null;
            const bkgRem = matchingBkg && matchingBkg.remaining_amount !== undefined ? Number(matchingBkg.remaining_amount) : null;
            const calculatedDue = rawDue !== null ? rawDue : bkgRem !== null ? bkgRem : Math.max(0, finalBookingAmt - finalAdvAmt);

            const isFullyPaid =
              (calculatedDue === 0 && finalBookingAmt > 0) ||
              (matchingBkg && ((matchingBkg.payment_status || "").toUpperCase() === "FULLY PAID" || (matchingBkg.payment_status || "").toUpperCase() === "PAID")) ||
              (r.status || "").toUpperCase() === "PAID";
            const isAdvPaid = !isFullyPaid && (finalAdvAmt > 0 || (r.status || "").toUpperCase().includes("ADVANCE"));

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
              off_adv: isFullyPaid ? finalBookingAmt : finalAdvAmt,
              due: isFullyPaid ? 0 : calculatedDue,
              status: isFullyPaid ? "Paid" : isAdvPaid ? "Advance Paid" : "Pending",
              notes: r.notes || matchingBkg?.notes || "",
            };
          });
        }
      }

      // Add ALL bookings that were not already linked in day_book_entries into liveDaily!
      bList.forEach((b: any) => {
        if (!matchedBkgIds.has(String(b.id))) {
          const rawCat = (b.booking_type || b.category || "CAR").toUpperCase();
          let travBy = rawCat === "TAXI" || rawCat === "CAB" ? "CAR" : rawCat;

          // Detect hourly package details (4 hrs, 8 hrs, 12 hrs)
          const isHourly =
            (b.service && b.service.toUpperCase().includes("HOURLY")) ||
            (b.trip_type && b.trip_type.toUpperCase().includes("HOURLY")) ||
            (b.notes && (b.notes.includes("4 Hr") || b.notes.includes("8 Hr") || b.notes.includes("12 Hr") || b.notes.includes("4 hrs") || b.notes.includes("8 hrs") || b.notes.includes("12 hrs")));
          if (isHourly) {
            const hrsMatch = (b.notes || b.trip_type || "").match(/(\d+)\s*(?:hrs?|hr's)/i);
            const hrsNum = hrsMatch ? hrsMatch[1] : (b.hours_package || "8");
            travBy = `HOURLY (${hrsNum} HRS)`;
          }

          let rawBkgTotal = Number(b.total_amount || b.fare || b.ticket_amount || b.base_amount || 0);
          if (rawBkgTotal <= 0 && b.notes) {
            const m = b.notes.match(/(?:Total Fare|Fare|Amount|Due|Price):\s*₹?(\d+(?:\.\d+)?)/i);
            if (m && m[1]) rawBkgTotal = Number(m[1]);
          }
          const totalAmt = rawBkgTotal;
          const advAmt = Number(b.paid_total ?? b.advance_amount ?? 0);
          const remAmt = Number(
            b.remaining_amount !== undefined ? b.remaining_amount : Math.max(0, totalAmt - advAmt)
          );
          const rawPayStatus = (b.payment_status || "").toUpperCase();
          const pMode = String(b.payment_mode || b.payment_method || "").toUpperCase();
          const isManualMode = pMode.includes("MANUAL") || pMode.includes("CASH") || (b.notes && (b.notes.includes("100% Full Payment") || b.notes.includes("Full Payment") || b.notes.includes("Manual Channel") || b.notes.includes("ZERO DUE")));
          const isFullyPaid =
            (remAmt === 0 && totalAmt > 0) ||
            rawPayStatus === "PAID" ||
            rawPayStatus === "FULLY PAID" ||
            rawPayStatus === "SUCCESS" ||
            isManualMode;
          const isAdvPaid = !isFullyPaid && (advAmt > 0 || rawPayStatus.includes("ADVANCE"));

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
            off_adv: isFullyPaid ? totalAmt : advAmt,
            due: isFullyPaid ? 0 : remAmt,
            status: isFullyPaid ? "Paid" : isAdvPaid ? "Advance Paid" : "Pending",
            notes: b.notes || "",
          });
        }
      });

      // Also merge any offline hourly bookings stored in localStorage
      if (typeof window !== "undefined") {
        try {
          const localHourly = JSON.parse(localStorage.getItem("fortune_hourly_packages_trips_data") || "[]");
          if (Array.isArray(localHourly)) {
            localHourly.forEach((h: any) => {
              if (h.id && h.id.startsWith("HPT-") && !matchedBkgIds.has(String(h.id))) {
                const amt = Number(h.amount || 0);
                const isPaid = h.paymentStatus === "Paid";
                const isAdv = h.paymentStatus === "Advance Paid";
                liveDaily.push({
                  id: h.id,
                  date: h.date || formatDisplayDate(new Date().toISOString()),
                  raw_date: new Date().toISOString().split("T")[0],
                  trav_on: h.date || formatDisplayDate(new Date().toISOString()),
                  pnr: h.pnr || `HPT-${h.slNo}`,
                  trav_by: `HOURLY (${(h.hours || "8 Hr's").toUpperCase()})`,
                  pax: h.paxName || "Direct Customer",
                  ph_no: h.phNumber || "",
                  from: h.from || "Bengaluru",
                  to: h.to || "Local",
                  pickup: h.boarding || "—",
                  booking: amt,
                  off_adv: isPaid ? amt : isAdv ? 100 : 0,
                  due: isPaid ? 0 : isAdv ? Math.max(0, amt - 100) : amt,
                  status: isPaid ? "Paid" : isAdv ? "Advance Paid" : "Pending",
                  notes: `Car: ${h.car || "Cab"} | Driver: ${h.driver || "Assigned"}`,
                });
              }
            });
          }
        } catch (e) {}
      }

      const isCleared = typeof window !== "undefined" && localStorage.getItem("fortune_reports_cleared") === "true";
      const deletedDailyIds = new Set<string>([
        ...(deletedByReport["daily"] || []),
        ...(typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("fortune_deleted_daily_record_ids") || "[]")
          : []),
      ]);
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
        setDailyRecords([...filteredLiveDaily, ...seedsToKeep]);
      }

      // 2. Map Transactions (combines all real bookings & hourly tours!)
      let mappedHourly: TransactionRecord[] = [];
      if (hourlyRes && hourlyRes.ok) {
        try {
          const hData = await hourlyRes.json();
          if (hData.success && Array.isArray(hData.rows)) {
            mappedHourly = hData.rows.map((hr: any) => {
              const amt = Number(hr.amount || 0);
              const isPaid = (hr.payment_status || "").toUpperCase() === "PAID";
              return {
                id: `HR-${hr.id || hr.booking_number}`,
                date: hr.created_at || hr.booking_date || new Date().toISOString(),
                ref_number: hr.booking_number || `HR-${hr.id}`,
                particulars: `Hourly Package (${hr.hours || 8} Hrs): ${hr.passenger_name || "Customer"} (${hr.from_location || "Local"} → ${hr.to_location || "Local"})`,
                category: "CAR" as const,
                payment_method: "UPI" as const,
                status: isPaid ? "PAID" as const : "PENDING" as const,
                income: amt,
                expense: 0,
                balance: amt,
                customer_name: hr.passenger_name || "Customer",
                phone: hr.phone || "",
                notes: isPaid ? "100% Fully Settled" : `Pending Settlement: ₹${amt}`,
              };
            });
          }
        } catch (e) {}
      }

      // Also merge any local hourly package bookings into mappedHourly
      if (typeof window !== "undefined") {
        try {
          const localHourly = JSON.parse(localStorage.getItem("fortune_hourly_packages_trips_data") || "[]");
          if (Array.isArray(localHourly)) {
            const existingHrKeys = new Set(mappedHourly.map((m) => m.ref_number.toLowerCase()));
            localHourly.forEach((h: any) => {
              const refNo = h.pnr || (h.slNo ? `HPT-${h.slNo}` : `HPT-${h.id}`);
              const amt = Number(h.amount || 0);
              if (!existingHrKeys.has(refNo.toLowerCase()) && (amt > 0 || h.paymentStatus)) {
                const isPaid = (h.paymentStatus || "").toLowerCase() === "paid";
                const isAdv = (h.paymentStatus || "").toLowerCase().includes("advance");
                mappedHourly.push({
                  id: `HR-${h.id}`,
                  date: h.date || new Date().toISOString(),
                  ref_number: refNo,
                  particulars: `Hourly Package (${h.hours || "8 Hr's"}): ${h.paxName || "Customer"} (${h.from || "Bengaluru"} → ${h.to || "Local"})`,
                  category: "CAR" as const,
                  payment_method: "UPI" as const,
                  status: isPaid ? ("PAID" as const) : ("PENDING" as const),
                  income: isPaid ? amt : isAdv ? 100 : amt,
                  expense: 0,
                  balance: isPaid ? amt : isAdv ? 100 : amt,
                  customer_name: h.paxName || "Customer",
                  phone: h.phNumber || "",
                  notes: isPaid ? "100% Fully Settled" : isAdv ? `Advance Paid: ₹100 | Remaining Due: ₹${Math.max(0, amt - 100)}` : `Pending Settlement: ₹${amt}`,
                });
              }
            });
          }
        } catch (e) {}
      }

      // Map every booking into TransactionRecord so Master Report, P&L, Dues, and Payments display all bookings
      const bookingTxns: TransactionRecord[] = bList.map((b: any) => {
        let rawTotal = Number(b.total_amount || b.fare || b.ticket_amount || b.base_amount || b.amount || 0);
        if (rawTotal <= 0 && b.notes) {
          const m = b.notes.match(/(?:Total Fare|Fare|Amount|Due|Price):\s*₹?(\d+(?:\.\d+)?)/i);
          if (m && m[1]) rawTotal = Number(m[1]);
        }
        const total = rawTotal;
        const adv = Number(b.paid_total ?? b.advance_amount ?? 0);
        const rem = Number(
          b.remaining_amount !== undefined ? b.remaining_amount : Math.max(0, total - adv)
        );
        const rawPayStatus = (b.payment_status || "").toUpperCase();
        const pMode = String(b.payment_mode || b.payment_method || "UPI").toUpperCase();
        const isManualMode = pMode.includes("MANUAL") || pMode.includes("CASH") || (b.notes && (b.notes.includes("100% Full Payment") || b.notes.includes("Full Payment") || b.notes.includes("Manual Channel") || b.notes.includes("ZERO DUE")));
        const isPaid =
          (rem === 0 && total > 0) ||
          rawPayStatus === "PAID" ||
          rawPayStatus === "FULLY PAID" ||
          rawPayStatus === "SUCCESS" ||
          isManualMode;
        const isAdvPaid = !isPaid && (adv > 0 || rawPayStatus.includes("ADVANCE"));
        const isCancelled = (b.booking_status || "").toUpperCase().includes("CANCEL");
        const isRefunded =
          (b.booking_status || "").toUpperCase().includes("REFUND") ||
          rawPayStatus.includes("REFUND");

        let status: TransactionRecord["status"] = "PENDING";
        if (isRefunded) status = "REFUNDED";
        else if (isCancelled) status = "CANCELLED";
        else if (isPaid) status = "PAID";
        else if (isAdvPaid) status = "PAID"; // The collected advance is recorded as cash inflow/income

        let method: TransactionRecord["payment_method"] = "UPI";
        if (pMode.includes("CASH")) method = "CASH";
        else if (pMode.includes("CARD")) method = "CARD";
        else if (pMode.includes("NET") || pMode.includes("BANK")) method = "NETBANKING";
        else if (pMode.includes("RAZORPAY")) method = "RAZORPAY";

        const rawCat = (b.category || b.booking_type || "CAR").toUpperCase();
        let cat: TransactionRecord["category"] = "CAR";
        if (rawCat.includes("FLIGHT")) cat = "FLIGHT";
        else if (rawCat.includes("BUS")) cat = "BUS";
        else if (rawCat.includes("TRAIN")) cat = "TRAIN";
        else if (rawCat.includes("HOTEL")) cat = "HOTEL";
        else if (rawCat.includes("TOUR") || rawCat.includes("PACKAGE")) cat = "TOUR";

        const isHourly =
          (b.service && b.service.toUpperCase().includes("HOURLY")) ||
          (b.trip_type && b.trip_type.toUpperCase().includes("HOURLY")) ||
          (b.notes && (b.notes.includes("4 Hr") || b.notes.includes("8 Hr") || b.notes.includes("12 Hr") || b.notes.includes("4 hrs") || b.notes.includes("8 hrs") || b.notes.includes("12 hrs")));
        const hrsLabel = isHourly ? (b.notes?.match(/(\d+)\s*(?:hrs?|hr's)/i)?.[0] || `${b.hours_package || 8} Hrs`) : null;
        const particularHeader = hrsLabel ? `Hourly Package (${hrsLabel})` : `${cat} Booking`;

        const fromTo = b.from_location && b.to_location ? ` (${b.from_location} → ${b.to_location})` : "";
        const pnrSnippet = b.pnr_number ? ` [PNR: ${b.pnr_number}]` : "";
        const supplierName = b.bus_operator || b.airline || b.driver_name || extractSupplier(particularHeader, cat, b.notes);

        return {
          id: `BKG-TXN-${b.id}`,
          date: b.created_at || b.departure_datetime || b.travel_date || new Date().toISOString(),
          ref_number: b.booking_number || b.ticket_number || b.pnr_number || `BKG-${b.id}`,
          particulars: `${particularHeader}: ${b.passenger_name || "Guest"}${fromTo}${pnrSnippet}`,
          category: cat,
          payment_method: method,
          status: isPaid ? "PAID" : isAdvPaid ? (rem > 0 ? "PENDING" : "PAID") : "PENDING",
          income: isPaid ? total : adv > 0 ? adv : total,
          expense: 0,
          balance: isPaid ? total : adv > 0 ? adv : total,
          customer_name: b.passenger_name || "Direct Customer",
          phone: b.passenger_phone || "",
          notes: isPaid ? "100% Fully Settled" : isAdvPaid ? `Advance Paid: ₹${adv} | Remaining Due: ₹${rem}` : `Pay on Boarding: Due ₹${total}`,
          supplier: supplierName,
        };
      });

      const allCombinedTxns = [...bookingTxns, ...mappedHourly];

      if (isCleared) {
        setTransactions(allCombinedTxns);
      } else {
        const existingTxnKeys = new Set(allCombinedTxns.map((t) => t.ref_number.toLowerCase()));
        const seeds = SEED_TRANSACTIONS.filter((s) => !existingTxnKeys.has(s.ref_number.toLowerCase()));
        setTransactions([...allCombinedTxns, ...seeds]);
      }
    } catch (err) {
      console.warn("Error fetching live transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTransactions();
    const handleUpdate = () => {
      fetchLiveTransactions();
    };
    window.addEventListener("fortune_booking_created", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("fortune_booking_created", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter Daily Reports (Filtered using Day Filter, DATE range, Booking Type, and Search Query)
  const filteredDailyRecords = useMemo(() => {
    const deletedInDaily = new Set([
      ...(deletedByReport["daily"] || []),
      ...(typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("fortune_deleted_daily_record_ids") || "[]")
        : []),
    ]);

    const todayComparable = getLocalDateString();
    const yesterdayComparable = shiftDateByDays(todayComparable, -1);

    return dailyRecords.filter((r) => {
      // Exclude if deleted specifically in Daily Reports
      if (deletedInDaily.has(String(r.id))) return false;

      // 1. Day / Date Filter against the report's DATE field (not TRAV ON)
      const recDate = parseToComparableDate(r.date) || parseToComparableDate(r.raw_date);

      if (dayFilterMode === "today") {
        if (recDate !== todayComparable) return false;
      } else if (dayFilterMode === "yesterday") {
        if (recDate !== yesterdayComparable) return false;
      } else if (dayFilterMode === "single_day") {
        if (selectedDay && recDate !== selectedDay) return false;
      } else if (dayFilterMode === "range") {
        if (appliedDailyFromDate && (!recDate || recDate < appliedDailyFromDate)) return false;
        if (appliedDailyToDate && (!recDate || recDate > appliedDailyToDate)) return false;
      } else if (dayFilterMode === "all") {
        if (appliedDailyFromDate && (!recDate || recDate < appliedDailyFromDate)) return false;
        if (appliedDailyToDate && (!recDate || recDate > appliedDailyToDate)) return false;
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
            tb.includes("SUV") ||
            tb.includes("HOURLY");
          if (!isCar) return false;
        } else if (appliedDailyBookingType === "HOURLY") {
          if (!tb.includes("HOURLY") && !tb.includes("HR")) return false;
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
  }, [
    dailyRecords,
    dayFilterMode,
    selectedDay,
    appliedDailyFromDate,
    appliedDailyToDate,
    appliedDailyBookingType,
    appliedDailySearchQuery,
    deletedByReport,
  ]);

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
    if (
      !window.confirm(
        "Are you sure you want to delete this Daily Report entry?\n\nThis will ONLY delete it from Daily Reports. It will NOT affect any other reports (Reports, Final Reports, etc.) or customer bookings."
      )
    ) {
      return;
    }

    const idStr = String(id);

    // 1. Permanently record deletion ONLY for Daily Reports
    markDeletedInReport("daily", idStr);
    try {
      const stored = JSON.parse(localStorage.getItem("fortune_deleted_daily_record_ids") || "[]");
      if (!stored.includes(idStr)) {
        stored.push(idStr);
        localStorage.setItem("fortune_deleted_daily_record_ids", JSON.stringify(stored));
      }
    } catch {}

    // 2. Remove immediately from dailyRecords in local state
    setDailyRecords((prev) => prev.filter((r) => String(r.id) !== idStr));

    // 3. IMPORTANT: DO NOT touch transactions state and DO NOT call DELETE /api/bookings!
    // Other reports (Reports, Final Reports, Credit/Debit, Payments, etc.) and bookings remain 100% intact!

    // 4. If it's a manual entry created directly in day_book_entries table, delete that specific row from day_book_entries
    if (typeof id === "number" || (!idStr.startsWith("BKG-") && !isNaN(Number(id)))) {
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

    toast.success("Entry removed from Daily Reports only. Other reports remain unchanged.");
  };

  const handleDeleteTransactionRecord = async (id: string | number, label?: string) => {
    const activeDef = REPORT_DEFINITIONS.find((r) => r.key === activeReport) || REPORT_DEFINITIONS[0];
    const desc = label ? ` "${label}"` : "";
    if (
      !window.confirm(
        `Are you sure you want to delete this report entry${desc} from ${activeDef.shortTitle}?\n\nThis will ONLY remove it from ${activeDef.shortTitle}. It will remain intact in Daily Reports and all other reports.`
      )
    ) {
      return;
    }

    const idStr = String(id);

    // 1. Permanently record deletion ONLY for the currently active report
    markDeletedInReport(activeReport, idStr);

    // 2. IMPORTANT: DO NOT remove from dailyRecords!
    // 3. DO NOT delete from /api/bookings!
    // Other reports and customer bookings remain 100% intact!

    toast.success(`Entry removed from ${activeDef.shortTitle} only. Other reports remain unchanged.`);
  };

  const handleClearCurrentReportData = async () => {
    const activeDef = REPORT_DEFINITIONS.find((r) => r.key === activeReport) || REPORT_DEFINITIONS[0];
    if (
      !window.confirm(
        `Are you sure you want to clear entries in ${activeDef.shortTitle}?\n\nThis will ONLY affect ${activeDef.shortTitle}. Other reports and bookings will remain intact.`
      )
    ) {
      return;
    }

    if (activeReport === "daily") {
      const allDailyIds = dailyRecords.map((r) => String(r.id));
      setDeletedByReport((prev) => {
        const updated = {
          ...prev,
          daily: Array.from(new Set([...(prev.daily || []), ...allDailyIds])),
        };
        try {
          localStorage.setItem("fortune_deleted_by_report", JSON.stringify(updated));
          localStorage.setItem("fortune_deleted_daily_record_ids", JSON.stringify(updated.daily));
        } catch {}
        return updated;
      });
      setDailyRecords([]);
      toast.success("Daily Reports sheet cleared.");
    } else {
      const currentReportTxnIds = filteredTransactions.map((t) => String(t.id));
      setDeletedByReport((prev) => {
        const updated = {
          ...prev,
          [activeReport]: Array.from(new Set([...(prev[activeReport] || []), ...currentReportTxnIds])),
        };
        try {
          localStorage.setItem("fortune_deleted_by_report", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      toast.success(`${activeDef.shortTitle} entries cleared.`);
    }
  };

  const handleClearAllReportData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear ALL records across all financial reports?\n\nThis will reset all daily reports and ledger sheets."
      )
    ) {
      return;
    }

    try {
      localStorage.setItem("fortune_reports_cleared", "true");
      localStorage.setItem("fortune_deleted_daily_record_ids", JSON.stringify([]));
      localStorage.setItem("fortune_deleted_transaction_ids", JSON.stringify([]));
      localStorage.setItem("fortune_deleted_by_report", JSON.stringify({}));

      setDailyRecords([]);
      setTransactions([]);
      setDeletedByReport({});

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

      toast.success("All report data cleared successfully.");
    } catch (err) {
      console.error("Error clearing reports:", err);
      toast.error("Failed to clear some records from server.");
    }
  };

  const handleRestoreDemoData = () => {
    if (!window.confirm("Restore default sample/demo report data across all reports?")) return;
    localStorage.removeItem("fortune_reports_cleared");
    localStorage.removeItem("fortune_deleted_daily_record_ids");
    localStorage.removeItem("fortune_deleted_transaction_ids");
    localStorage.removeItem("fortune_deleted_by_report");
    setDeletedByReport({});
    fetchLiveTransactions();
    toast.success("Default sample report data restored across all reports.");
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
    const deletedInActiveReport = new Set(deletedByReport[activeReport] || []);
    const todayComparable = getLocalDateString();
    const yesterdayComparable = shiftDateByDays(todayComparable, -1);

    return transactions.filter((t) => {
      // 0. Exclude records deleted specifically in THIS report
      if (deletedInActiveReport.has(String(t.id))) return false;

      // 1. Day / Date Filter against the transaction's date
      const txnDate = parseToComparableDate(t.date);

      if (dayFilterMode === "today") {
        if (txnDate !== todayComparable) return false;
      } else if (dayFilterMode === "yesterday") {
        if (txnDate !== yesterdayComparable) return false;
      } else if (dayFilterMode === "single_day") {
        if (selectedDay && txnDate !== selectedDay) return false;
      } else if (dayFilterMode === "range") {
        const fromD = appliedStartDate || startDate;
        const toD = appliedEndDate || endDate;
        if (fromD && (!txnDate || txnDate < fromD)) return false;
        if (toD && (!txnDate || txnDate > toD)) return false;
      } else if (dayFilterMode === "all") {
        const fromD = appliedStartDate || startDate;
        const toD = appliedEndDate || endDate;
        if (fromD && (!txnDate || txnDate < fromD)) return false;
        if (toD && (!txnDate || txnDate > toD)) return false;
      }

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
      } else if (activeReport === "profit_loss") {
        if (t.status !== "PAID") return false;
      }

      return true;
    });
  }, [
    transactions,
    dayFilterMode,
    selectedDay,
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
    deletedByReport,
  ]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalPending = 0;
    let totalOnline = 0;
    let totalCash = 0;

    filteredTransactions.forEach((t) => {
      const inc = Number(t.income || 0);
      const exp = Number(t.expense || 0);
      if (t.status === "PAID") {
        totalIncome += inc;
        totalExpenses += exp;
        if (t.payment_method === "CASH") {
          totalCash += inc;
        } else {
          totalOnline += inc;
        }
      } else if (t.status === "PENDING") {
        totalPending += inc;
      } else {
        const advMatch = t.notes?.match(/Advance Paid:\s*₹?(\d+)/i);
        const remMatch = t.notes?.match(/Remaining Due:\s*₹?(\d+)/i);
        if (advMatch) totalIncome += Number(advMatch[1]);
        if (remMatch) totalPending += Number(remMatch[1]);
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

  // Find latest date with entries in daily records
  const latestDailyDate = useMemo(() => {
    let latest = "";
    dailyRecords.forEach((r) => {
      const d = parseToComparableDate(r.date) || parseToComparableDate(r.raw_date);
      if (d && (!latest || d > latest)) latest = d;
    });
    return latest;
  }, [dailyRecords]);

  // Find latest date with entries in transactions
  const latestTxnDate = useMemo(() => {
    let latest = "";
    transactions.forEach((t) => {
      const d = parseToComparableDate(t.date);
      if (d && (!latest || d > latest)) latest = d;
    });
    return latest;
  }, [transactions]);

  const latestActiveDate = activeReport === "daily" ? latestDailyDate : latestTxnDate;

  // Pagination calculations for Daily Reports
  const totalDailyPages = pageSize === "ALL" ? 1 : Math.max(1, Math.ceil(filteredDailyRecords.length / pageSize));
  const safeDailyPage = Math.min(Math.max(1, currentPage), totalDailyPages);
  const dailyStartIndex = pageSize === "ALL" ? 0 : (safeDailyPage - 1) * pageSize;
  const dailyEndIndex = pageSize === "ALL" ? filteredDailyRecords.length : Math.min(dailyStartIndex + pageSize, filteredDailyRecords.length);
  const displayedDailyRecords = useMemo(() => {
    return filteredDailyRecords.slice(dailyStartIndex, dailyEndIndex);
  }, [filteredDailyRecords, dailyStartIndex, dailyEndIndex]);

  // Page subtotals for Daily Reports
  const pageDailyTotals = useMemo(() => {
    let booking = 0;
    let offAdv = 0;
    let due = 0;
    displayedDailyRecords.forEach((r) => {
      booking += Number(r.booking || 0);
      offAdv += Number(r.off_adv || 0);
      due += Number(r.due || 0);
    });
    return { booking, offAdv, due };
  }, [displayedDailyRecords]);

  // Pagination calculations for Transactions
  const totalTxnPages = pageSize === "ALL" ? 1 : Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const safeTxnPage = Math.min(Math.max(1, currentPage), totalTxnPages);
  const txnStartIndex = pageSize === "ALL" ? 0 : (safeTxnPage - 1) * pageSize;
  const txnEndIndex = pageSize === "ALL" ? filteredTransactions.length : Math.min(txnStartIndex + pageSize, filteredTransactions.length);
  const displayedTransactions = useMemo(() => {
    return filteredTransactions.slice(txnStartIndex, txnEndIndex);
  }, [filteredTransactions, txnStartIndex, txnEndIndex]);

  // Page subtotals for Transactions
  const pageTxnTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let balance = 0;
    let cashInflow = 0;
    let onlineInflow = 0;
    let received = 0;
    let pending = 0;

    displayedTransactions.forEach((t) => {
      const inc = Number(t.income || 0);
      const exp = Number(t.expense || 0);
      const bal = Number(t.balance || 0);
      income += inc;
      expense += exp;
      balance += bal;

      if (t.payment_method === "CASH") {
        cashInflow += inc;
      } else {
        onlineInflow += inc;
      }

      if (t.status === "PAID") {
        received += inc;
      } else if (t.status === "PENDING") {
        pending += inc;
      } else {
        const advMatch = t.notes?.match(/Advance Paid:\s*₹?(\d+)/i);
        const remMatch = t.notes?.match(/Remaining Due:\s*₹?(\d+)/i);
        const adv = advMatch ? Number(advMatch[1]) : 0;
        const rem = remMatch ? Number(remMatch[1]) : 0;
        received += adv;
        pending += rem > 0 ? rem : inc;
      }
    });
    return {
      income,
      expense,
      balance,
      cashInflow,
      onlineInflow,
      totalInflow: cashInflow + onlineInflow,
      received,
      pending,
    };
  }, [displayedTransactions]);

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
            {((activeReport === "daily" ? deletedByReport["daily"]?.length : deletedByReport[activeReport]?.length) || 0) > 0 && (
              <button
                type="button"
                onClick={() => restoreDeletedForReport(activeReport)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition shadow-xs cursor-pointer"
                title={`Restore deleted entries in ${activeDef.shortTitle}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Deleted ({(activeReport === "daily" ? deletedByReport["daily"]?.length : deletedByReport[activeReport]?.length) || 0})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearCurrentReportData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white border border-rose-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
              title={`Clear entries in ${activeDef.shortTitle} only`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear {activeDef.shortTitle}</span>
            </button>

            <button
              type="button"
              onClick={handleClearAllReportData}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Permanently clear records across all reports"
            >
              <span>Clear All</span>
            </button>
            {(dailyRecords.length === 0 || transactions.length === 0) && (
              <button
                type="button"
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

      {/* Horizontal Report Navigation Tab Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {REPORT_DEFINITIONS.map((r) => {
            const Icon = r.icon;
            const isActive = activeReport === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handleReportChange(r.key)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0b1329] text-amber-400 font-extrabold shadow-sm border border-amber-400/40"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : r.color}`} />
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

      {/* Report Folder: All 8 Specialized Accounting Report Cards in One Folder */}
      {activeReport === "reports" && (
        <div className="mb-6 bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
                <FolderArchive className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Report Folder
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    8 Specialized Reports
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
                  Consolidated card folder for Daily Reports, Final Reports, Credit &amp; Debit Statement, Payment Reports, Cash Flow Reports, Dues Reports, Profit &amp; Loss Reports, and Online Transaction Reports. Also accessible anytime from the Account menu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsReportFolderExpanded((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-2xs cursor-pointer transition-all"
              >
                {isReportFolderExpanded ? (
                  <>
                    <ChevronDown className="h-4 w-4 rotate-180" /> Collapse Cards
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" /> Expand 8 Cards
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onOpenReportFolderModal) {
                    onOpenReportFolderModal();
                  } else {
                    setIsReportModalOpen(true);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:brightness-110 cursor-pointer transition-transform hover:scale-105"
              >
                <FolderOpen className="h-4 w-4" /> Open Folder View
              </button>
            </div>
          </div>

          {/* When expanded on dashboard, show the 8 specialized report cards */}
          {isReportFolderExpanded && (
            <div className="mt-5 pt-5 border-t border-slate-200/80 animate-in fade-in duration-200">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Reports in Accounting Folder
                </h4>
                <span className="text-xs text-slate-500 font-medium">Click any card to open its audited ledger</span>
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
        </div>
      )}

      {/* Standalone Report Folder Modal if invoked without parent handler */}
      {!onOpenReportFolderModal && (
        <ReportFolderModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSelectReport={(reportKey) => {
            handleReportChange(reportKey);
            setIsReportModalOpen(false);
          }}
        />
      )}



      {/* Transaction Records Table / Daily Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tier 1: Day Filter Toolbar (Today, Yesterday, Step with Prev/Next, Date Range, All Days) */}
        <DayFilterToolbar
          dayFilterMode={dayFilterMode}
          selectedDay={selectedDay}
          onSelectMode={handleSelectDayFilter}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onChangeSelectedDay={(day) => {
            setSelectedDay(day);
            setDayFilterMode("single_day");
            resetPage();
          }}
          activeRecordCount={activeReport === "daily" ? filteredDailyRecords.length : filteredTransactions.length}
          latestDateWithRecords={latestActiveDate}
          onJumpToLatestDate={(date) => {
            setSelectedDay(date);
            setDayFilterMode("single_day");
            resetPage();
          }}
          onShowAllDays={() => {
            setDayFilterMode("all");
            resetPage();
          }}
        />

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
                  <option value="HOURLY">Hourly Package (4h / 8h / 12h)</option>
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
                    displayedDailyRecords.map((r, idx) => (
                      <tr key={r.id} className="bg-white even:bg-[#f7faf8] hover:bg-[#ebf5ec] transition-colors">
                        {/* 1. SL (Continuous across pages) */}
                        <td className="py-2 px-3 text-center font-bold text-slate-700 whitespace-nowrap border border-slate-300 bg-slate-50/70">
                          {dailyStartIndex + idx + 1}
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

                        {/* 12. OFF ADV (Received amount in green and bold) */}
                        <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-600 border border-slate-300 bg-emerald-50/20">
                          ₹{Number(r.off_adv).toLocaleString("en-IN")}
                        </td>

                        {/* 13. DUE (Due amount in red colour) */}
                        <td className="py-2 px-3 text-right whitespace-nowrap font-bold border border-slate-300 bg-rose-50/20">
                          <div className="flex flex-col items-end">
                            <span
                              className={
                                Number(r.due) > 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-black"
                              }
                            >
                              ₹{Number(r.due).toLocaleString("en-IN")}
                            </span>
                            {r.status && (
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded mt-0.5 border ${
                                  r.status === "Paid"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : r.status === "Advance Paid"
                                    ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                                    : "bg-rose-100 text-rose-800 border-rose-300 font-bold"
                                }`}
                              >
                                {r.status}
                              </span>
                            )}
                          </div>
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
                              title="Delete from Daily Reports only"
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
                    {/* Page Subtotal Row if paginated */}
                    {totalDailyPages > 1 && pageSize !== "ALL" && (
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-700">
                        <td colSpan={9} className="py-2 px-3 border border-slate-300 text-right font-extrabold text-xs uppercase tracking-wider text-slate-600 bg-slate-100/70">
                          Page {safeDailyPage} Subtotal ({displayedDailyRecords.length} items)
                        </td>
                        <td className="py-2 px-3 border border-slate-300 bg-slate-100/70"></td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700 whitespace-nowrap text-xs border border-slate-300 bg-emerald-50/40">
                          ₹{pageDailyTotals.booking.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-blue-700 whitespace-nowrap text-xs border border-slate-300 bg-blue-50/40">
                          ₹{pageDailyTotals.offAdv.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-rose-600 whitespace-nowrap text-xs border border-slate-300 bg-rose-50/40">
                          ₹{pageDailyTotals.due.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 bg-slate-100/70"></td>
                      </tr>
                    )}
                    {/* Grand Total Row */}
                    <tr>
                      <td colSpan={9} className="py-2.5 px-3 border border-slate-300 bg-slate-100/70"></td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 whitespace-nowrap text-xs uppercase tracking-wider border border-slate-300 bg-[#d9ebd9]">
                        Total Cash ({filteredDailyRecords.length})
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

              {/* Interactive Pagination Controls */}
              <PaginationControls
                currentPage={safeDailyPage}
                totalPages={totalDailyPages}
                totalItems={filteredDailyRecords.length}
                startIndex={dailyStartIndex}
                endIndex={dailyEndIndex}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setCurrentPage(1);
                }}
              />

              {/* Excel-style Sheet Tab Bar */}
              <div className="bg-[#f3f4f6] border-t border-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border-t-2 border-t-[#107c41] border-x border-b border-slate-300 font-bold text-slate-800 shadow-2xs rounded-t-sm">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#107c41]" />
                    <span>Daily Reports Sheet</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                  <span>Page: <strong className="text-slate-800">{safeDailyPage} of {totalDailyPages}</strong></span>
                  <span>Viewing: <strong className="text-slate-800">{displayedDailyRecords.length}</strong> of <strong className="text-slate-800">{filteredDailyRecords.length}</strong></span>
                  <span>Total Booking: <strong className="text-emerald-700">₹{dailyTotals.booking.toLocaleString("en-IN")}</strong></span>
                  <span>Total Due: <strong className="text-rose-700">₹{dailyTotals.due.toLocaleString("en-IN")}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-w-full inline-block align-middle">
              <table className="w-full text-left text-xs border-collapse border border-slate-300 font-sans">
                <thead>
                  {activeReport === "dues" ? (
                    <tr className="bg-[#107c41] text-white font-black uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 text-center w-12 border border-[#0d6535] whitespace-nowrap">SL</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">DATE</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">PARTICULARS</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">VOUCHER / REF</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">SECTOR</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">CUSTOMER</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">METHOD</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">STATUS</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535] bg-rose-700/70">DUE AMOUNT (₹)</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap w-20 border border-[#0d6535]">ACTION</th>
                    </tr>
                  ) : activeReport === "cash_flow" ? (
                    <tr className="bg-[#107c41] text-white font-black uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 text-center w-12 border border-[#0d6535] whitespace-nowrap">SL</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">DATE</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">PARTICULARS</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">VOUCHER / REF</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">SECTOR</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">CUSTOMER</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">CHANNEL</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">STATUS</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">CASH INFLOW (₹)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">ONLINE INFLOW (₹)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">TOTAL INFLOW (₹)</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap w-20 border border-[#0d6535]">ACTION</th>
                    </tr>
                  ) : activeReport === "payment" ? (
                    <tr className="bg-[#107c41] text-white font-black uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 text-center w-12 border border-[#0d6535] whitespace-nowrap">SL</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">DATE</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">PARTICULARS</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">VOUCHER / REF</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">SECTOR</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">CUSTOMER</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">METHOD</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">STATUS</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">AMOUNT RECEIVED (₹)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535] bg-rose-700/70">PENDING PAYMENT (₹)</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap w-20 border border-[#0d6535]">ACTION</th>
                    </tr>
                  ) : activeReport === "credit_debit" ? (
                    <tr className="bg-[#107c41] text-white font-black uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 text-center w-12 border border-[#0d6535] whitespace-nowrap">SL</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">DATE</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535] bg-[#0c592f]">SUPPLIER / VENDOR</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">VOUCHER / REF</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">SECTOR</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">PARTY / CLIENT</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">METHOD</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">STATUS</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">CREDIT / ADVANCE (₹)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">DEBIT / PAYOUT (₹)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">NET BALANCE (₹)</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap w-20 border border-[#0d6535]">ACTION</th>
                    </tr>
                  ) : activeReport === "profit_loss" ? (
                    <tr className="bg-[#107c41] text-white font-black uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 text-center w-12 border border-[#0d6535] whitespace-nowrap">SL</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">DATE</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">SERVICE PARTICULARS</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">VOUCHER / REF</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">SECTOR</th>
                      <th className="py-2.5 px-3 whitespace-nowrap border border-[#0d6535]">CLIENT</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">METHOD</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap border border-[#0d6535]">AUDIT STATUS</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">REVENUE (₹)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">DIRECT EXPENSE (₹)</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap border border-[#0d6535]">NET PROFIT (₹)</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap w-20 border border-[#0d6535]">ACTION</th>
                    </tr>
                  ) : (
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
                  )}
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={activeReport === "dues" ? 10 : activeReport === "payment" ? 11 : 12} className="py-12 text-center text-slate-400 bg-white">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-sm text-slate-600">No transaction records match the selected filters.</p>
                        <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting another date range.</p>
                      </td>
                    </tr>
                  ) : (
                    displayedTransactions.map((t, idx) => {
                      const isCash = t.payment_method === "CASH";
                      const isPaid = t.status === "PAID";
                      const isPending = t.status === "PENDING";
                      const advMatch = t.notes?.match(/Advance Paid:\s*₹?(\d+)/i);
                      const remMatch = t.notes?.match(/Remaining Due:\s*₹?(\d+)/i);
                      const adv = advMatch ? Number(advMatch[1]) : 0;
                      const rem = remMatch ? Number(remMatch[1]) : (isPending ? t.income : 0);
                      const receivedAmount = isPaid ? t.income : (adv > 0 ? adv : 0);
                      const pendingAmount = isPaid ? 0 : (rem > 0 ? rem : t.income);
                      const supplierVendor = t.supplier || extractSupplier(t.particulars, t.category, t.notes);

                      return (
                        <tr
                          key={t.id}
                          className="odd:bg-white even:bg-[#f9fafb] hover:bg-[#e8f5e9] transition-colors border-b border-slate-300"
                        >
                          {/* SL (Continuous across pages) */}
                          <td className="py-2 px-3 text-center whitespace-nowrap font-bold text-slate-600 border border-slate-300 bg-slate-50/60">
                            {txnStartIndex + idx + 1}
                          </td>

                          {/* Date */}
                          <td className="py-2 px-3 text-center whitespace-nowrap font-medium text-slate-700 border border-slate-300">
                            {new Date(t.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>

                          {/* Particulars OR Supplier/Vendor (for credit_debit) */}
                          {activeReport === "credit_debit" ? (
                            <td className="py-2 px-3 font-bold text-purple-950 border border-slate-300 max-w-xs truncate bg-purple-50/10">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                                <span className="font-bold text-slate-900">{supplierVendor}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-normal truncate">{t.particulars}</div>
                            </td>
                          ) : (
                            <td className="py-2 px-3 font-semibold text-slate-900 border border-slate-300 max-w-xs truncate">
                              {t.particulars}
                            </td>
                          )}

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

                          {/* Status (Paid in bold green, Pending in red) */}
                          <td className="py-2 px-3 text-center whitespace-nowrap border border-slate-300">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-black"
                                  : isPending
                                  ? "bg-rose-100 text-rose-800 border border-rose-300 font-bold"
                                  : "bg-red-100 text-red-800 border border-red-300 font-bold"
                              }`}
                            >
                              {isPaid && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {isPending && <Clock className="w-3 h-3 text-rose-600" />}
                              {t.status}
                            </span>
                          </td>

                          {/* Dynamic Financial Columns based on Report */}
                          {activeReport === "dues" ? (
                            /* Dues Report: Only Outstanding Due in red font (NO income column) */
                            <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-rose-600 border border-slate-300 bg-rose-50/20">
                              ₹{Number(t.income).toLocaleString("en-IN")}
                            </td>
                          ) : activeReport === "cash_flow" ? (
                            /* Cash Flow Report: Only Inflow columns (NO expense, NO balance) */
                            <>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-600 border border-slate-300 bg-emerald-50/20">
                                {isCash ? `₹${Number(t.income).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-600 border border-slate-300 bg-emerald-50/20">
                                {!isCash ? `₹${Number(t.income).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-700 border border-slate-300 bg-emerald-50/30">
                                ₹{Number(t.income).toLocaleString("en-IN")}
                              </td>
                            </>
                          ) : activeReport === "payment" ? (
                            /* Payment Report: Amount Received (bold green) + Dedicated Pending Payment (red) */
                            <>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-600 border border-slate-300 bg-emerald-50/20">
                                {receivedAmount > 0 ? `₹${Number(receivedAmount).toLocaleString("en-IN")}` : "₹0"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-rose-600 border border-slate-300 bg-rose-50/20">
                                {pendingAmount > 0 ? `₹${Number(pendingAmount).toLocaleString("en-IN")}` : "—"}
                              </td>
                            </>
                          ) : activeReport === "credit_debit" ? (
                            /* Credit & Debit Report: Credit (bold green), Debit (red), Net Balance */
                            <>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-600 border border-slate-300 bg-emerald-50/20">
                                {t.income > 0 ? `₹${Number(t.income).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-rose-600 border border-slate-300 bg-rose-50/20">
                                {t.expense > 0 ? `₹${Number(t.expense).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-slate-900 border border-slate-300 bg-slate-50/30">
                                ₹{Number(t.balance).toLocaleString("en-IN")}
                              </td>
                            </>
                          ) : activeReport === "profit_loss" ? (
                            /* Profit & Loss: Revenue (bold green), Expense (red), Net Profit */
                            <>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-600 border border-slate-300 bg-emerald-50/20">
                                {t.income > 0 ? `₹${Number(t.income).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-rose-600 border border-slate-300 bg-rose-50/20">
                                {t.expense > 0 ? `₹${Number(t.expense).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-700 border border-slate-300 bg-emerald-50/30">
                                ₹{Number(t.income - t.expense).toLocaleString("en-IN")}
                              </td>
                            </>
                          ) : (
                            /* Default / Other Reports: Income (bold green), Expense (red), Balance */
                            <>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-emerald-600 border border-slate-300 bg-emerald-50/20">
                                {t.income > 0 ? `₹${Number(t.income).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-rose-600 border border-slate-300 bg-rose-50/20">
                                {t.expense > 0 ? `₹${Number(t.expense).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap font-black text-slate-900 border border-slate-300 bg-slate-50/30">
                                ₹{Number(t.balance).toLocaleString("en-IN")}
                              </td>
                            </>
                          )}

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
                                title={`Delete from ${activeDef.shortTitle} only`}
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
                    {/* Page Subtotal Row if paginated */}
                    {totalTxnPages > 1 && pageSize !== "ALL" && (
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-700">
                        <td colSpan={8} className="py-2 px-3 border border-slate-300 text-right font-extrabold text-xs uppercase tracking-wider text-slate-600 bg-slate-100/70">
                          Page {safeTxnPage} Subtotal ({displayedTransactions.length} items)
                        </td>
                        {activeReport === "dues" ? (
                          <td className="py-2 px-3 text-right font-bold text-rose-600 whitespace-nowrap text-xs border border-slate-300 bg-rose-50/40">
                            ₹{pageTxnTotals.pending.toLocaleString("en-IN")}
                          </td>
                        ) : activeReport === "cash_flow" ? (
                          <>
                            <td className="py-2 px-3 text-right font-black text-emerald-700 whitespace-nowrap text-xs border border-slate-300 bg-emerald-50/40">
                              ₹{pageTxnTotals.cashInflow.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-black text-emerald-700 whitespace-nowrap text-xs border border-slate-300 bg-emerald-50/40">
                              ₹{pageTxnTotals.onlineInflow.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-xs border border-slate-300 bg-emerald-50/50">
                              ₹{pageTxnTotals.totalInflow.toLocaleString("en-IN")}
                            </td>
                          </>
                        ) : activeReport === "payment" ? (
                          <>
                            <td className="py-2 px-3 text-right font-black text-emerald-700 whitespace-nowrap text-xs border border-slate-300 bg-emerald-50/40">
                              ₹{pageTxnTotals.received.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-rose-600 whitespace-nowrap text-xs border border-slate-300 bg-rose-50/40">
                              ₹{pageTxnTotals.pending.toLocaleString("en-IN")}
                            </td>
                          </>
                        ) : activeReport === "profit_loss" ? (
                          <>
                            <td className="py-2 px-3 text-right font-black text-emerald-700 whitespace-nowrap text-xs border border-slate-300 bg-emerald-50/40">
                              ₹{pageTxnTotals.income.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-rose-600 whitespace-nowrap text-xs border border-slate-300 bg-rose-50/40">
                              ₹{pageTxnTotals.expense.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-xs border border-slate-300 bg-emerald-50/50">
                              ₹{(pageTxnTotals.income - pageTxnTotals.expense).toLocaleString("en-IN")}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-3 text-right font-black text-emerald-700 whitespace-nowrap text-xs border border-slate-300 bg-emerald-50/40">
                              ₹{pageTxnTotals.income.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-rose-600 whitespace-nowrap text-xs border border-slate-300 bg-rose-50/40">
                              ₹{pageTxnTotals.expense.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-black text-slate-900 whitespace-nowrap text-xs border border-slate-300 bg-slate-50/50">
                              ₹{pageTxnTotals.balance.toLocaleString("en-IN")}
                            </td>
                          </>
                        )}
                        <td className="py-2 px-3 border border-slate-300 bg-slate-100/70"></td>
                      </tr>
                    )}
                    {/* Grand Total Row */}
                    <tr>
                      <td colSpan={8} className="py-2.5 px-3 text-right font-black text-slate-900 whitespace-nowrap text-xs uppercase tracking-wider border border-slate-300 bg-[#d9ebd9]">
                        Total Summary ({filteredTransactions.length})
                      </td>
                      {activeReport === "dues" ? (
                        <td className="py-2.5 px-3 text-right font-black text-rose-700 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                          ₹{(metrics.totalPending || metrics.totalIncome).toLocaleString("en-IN")}
                        </td>
                      ) : activeReport === "cash_flow" ? (
                        <>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalCash.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalOnline.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-900 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalIncome.toLocaleString("en-IN")}
                          </td>
                        </>
                      ) : activeReport === "payment" ? (
                        <>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalIncome.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-rose-700 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalPending.toLocaleString("en-IN")}
                          </td>
                        </>
                      ) : activeReport === "profit_loss" ? (
                        <>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalIncome.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-rose-700 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalExpenses.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-900 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.netBalance.toLocaleString("en-IN")}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalIncome.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-rose-700 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.totalExpenses.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-blue-800 whitespace-nowrap text-sm border border-slate-300 bg-[#d9ebd9]/70">
                            ₹{metrics.netBalance.toLocaleString("en-IN")}
                          </td>
                        </>
                      )}
                      <td className="py-2.5 px-3 border border-slate-300 bg-slate-100/70"></td>
                    </tr>
                  </tfoot>
                )}
              </table>

              {/* Interactive Pagination Controls */}
              <PaginationControls
                currentPage={safeTxnPage}
                totalPages={totalTxnPages}
                totalItems={filteredTransactions.length}
                startIndex={txnStartIndex}
                endIndex={txnEndIndex}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setCurrentPage(1);
                }}
              />

              {/* Excel-style Sheet Tab Bar */}
              <div className="bg-[#f3f4f6] border-t border-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border-t-2 border-t-[#107c41] border-x border-b border-slate-300 font-bold text-slate-800 shadow-2xs rounded-t-sm">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#107c41]" />
                    <span>{activeDef.shortTitle} Sheet</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                  <span>Page: <strong className="text-slate-800">{safeTxnPage} of {totalTxnPages}</strong></span>
                  <span>Viewing: <strong className="text-slate-800">{displayedTransactions.length}</strong> of <strong className="text-slate-800">{filteredTransactions.length}</strong></span>
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
                    placeholder="e.g. 9964600247 / 9740463404"
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
                    placeholder="e.g. 9964600247 / 9740463404"
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
