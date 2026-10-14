import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Printer,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  Download,
  Share2,
  Trash2,
  Edit,
  DollarSign,
  Building,
  User,
  Clock,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { toast } from "sonner";

export interface StatementItem {
  id: string;
  booking_date?: string;
  travel_date: string;
  receipt_no?: string;
  passenger_name: string;
  phone_number?: string;
  activity: string;
  pickup_point?: string;
  pickup_time?: string;
  drop_point?: string;
  drop_time?: string;
  amount: number; // Credit / Trip Amt
  advance_amount: number; // Debit / Advance
  advance_date?: string;
  due_amount?: number;
  notes?: string;
}

export interface ClientStatement {
  id: string;
  client_name: string;
  company_name?: string;
  phone: string;
  address?: string;
  account_start_date?: string;
  statement_date: string;
  title: string;
  opening_balance: number;
  less_adjustment?: number;
  total_due_override?: number;
  status: "Active" | "Due" | "Settled";
  items: StatementItem[];
}

const INITIAL_STATEMENTS: ClientStatement[] = [
  {
    id: "stmt-david-001",
    client_name: "Mr. David Sir",
    company_name: "David Sir Account",
    phone: "+919740463404",
    address: "No:256/A Next to Narayana Hrudayalaya Hospital Bommasandra",
    account_start_date: "18/03/2025",
    statement_date: "16/06/2025",
    title: "NEW STATEMENT",
    opening_balance: 0,
    less_adjustment: -24000,
    total_due_override: 13000,
    status: "Due",
    items: [
      {
        id: "d-1",
        travel_date: "24/03/2025",
        activity: "SMVT RWL STATION DROP",
        amount: 1000,
        passenger_name: "Mr.AKRAM",
        advance_amount: 10000,
        advance_date: "20/03/2025",
      },
      {
        id: "d-2",
        travel_date: "26/03/2025",
        activity: "KIMS UP & DOWN",
        amount: 2000,
        passenger_name: "DAVID SIR",
        advance_amount: 10000,
        advance_date: "11/05/2025",
      },
      {
        id: "d-3",
        travel_date: "04/04/2025",
        activity: "VILLA TO AIRPORT DROP",
        amount: 1800,
        passenger_name: "DAVID SIR",
        advance_amount: 0,
      },
      {
        id: "d-4",
        travel_date: "19/04/2025",
        activity: "SMVT RWL TO VILLA DROP",
        amount: 1000,
        passenger_name: "Mr.AKRAM",
        advance_amount: 20000,
        advance_date: "02/05/2025",
        notes: "ADV 20000 02/05/2025",
      },
      {
        id: "d-5",
        travel_date: "02/05/2025",
        activity: "AIRPORT DROP",
        amount: 1800,
        passenger_name: "MILIND SIR",
        advance_amount: 0,
        notes: "LESS -24000 09/05/2025",
      },
      {
        id: "d-6",
        travel_date: "09/05/2025",
        activity: "AIRPORT TO VILLA DROP",
        amount: 1800,
        passenger_name: "DAVID SIR",
        advance_amount: 0,
      },
      {
        id: "d-7",
        travel_date: "11/05/2025",
        activity: "VILLA TO AIRPORT DROP",
        amount: 1800,
        passenger_name: "DAVID SIR",
        due_amount: 4000,
        advance_date: "15/05/2025",
        notes: "DUE 4000 15/05/2025",
      },
      {
        id: "d-8",
        travel_date: "15/05/2025",
        activity: "AIRPORT TO VILLA DROP",
        amount: 1800,
        passenger_name: "MILIND SIR",
        advance_amount: 0,
        notes: "TOTAL DUE 13000",
      },
      {
        id: "d-9",
        travel_date: "23/05/2025",
        activity: "VILLA TO AIRPORT DROP",
        amount: 1800,
        passenger_name: "DAVID SIR",
        advance_amount: 0,
      },
      {
        id: "d-10",
        travel_date: "27/05/2025",
        activity: "AIRPORT TO VILLA DROP",
        amount: 1800,
        passenger_name: "MILIND SIR",
        advance_amount: 0,
      },
      {
        id: "d-11",
        travel_date: "03/06/2025",
        activity: "VILLA TO AIRPORT DROP",
        amount: 1800,
        passenger_name: "MOHD",
        advance_amount: 0,
      },
      {
        id: "d-12",
        travel_date: "10/06/2025",
        activity: "HOSKOTE-BOMMASANDRA-CHURCH STREET-HOSKOTE DROP",
        amount: 3800,
        passenger_name: "MR.STEPHEN",
        advance_amount: 0,
      },
      {
        id: "d-13",
        travel_date: "16/06/2025",
        activity: "AIRPORT TO VILLA DROP",
        amount: 1800,
        passenger_name: "DAVID SIR",
        advance_amount: 0,
      },
    ],
  },
  {
    id: "stmt-kvbalaji-002",
    client_name: "KV BALAJI",
    company_name: "Company / Pax Name KV BALAJI",
    phone: "9370935720",
    address: "Bangalore",
    account_start_date: "21/Sep/2025",
    statement_date: "21/Sep/2025",
    title: "STATEMENT OF ACCOUNT",
    opening_balance: 0,
    less_adjustment: 0,
    status: "Settled",
    items: [
      {
        id: "kv-1",
        booking_date: "21/09/2025",
        travel_date: "21/09/2025",
        receipt_no: "Ft0035",
        passenger_name: "Mr. KV BALAJI",
        phone_number: "9370935720",
        activity: "Cantonment To Local Drop At Airport",
        pickup_point: "Railway Station",
        pickup_time: "21-09-2025 At:1.45 PM",
        drop_point: "B’lore Airport(KIA)",
        drop_time: "21-09-2025 At:6.30 PM",
        amount: 2300,
        advance_amount: 2300,
        due_amount: 0,
        notes: "Opening: Rs:0.00, Total Credit: Rs:2300, Closing: Rs:00.00",
      },
    ],
  },
];

const LOCAL_STORAGE_KEY = "fortune_travels_admin_statements_v1";

export function ClientStatementsManager() {
  const [statements, setStatements] = useState<ClientStatement[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved client statements", e);
        }
      }
    }
    return INITIAL_STATEMENTS;
  });

  const [selectedStatementId, setSelectedStatementId] = useState<string>(
    INITIAL_STATEMENTS[0].id
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modals state
  const [showNewStmtModal, setShowNewStmtModal] = useState(false);
  const [showAddTripModal, setShowAddTripModal] = useState(false);

  // New Statement Form
  const [newStmt, setNewStmt] = useState({
    client_name: "",
    company_name: "",
    phone: "",
    address: "No:256/A Next to Narayana Hrudayalaya Hospital Bommasandra",
    account_start_date: new Date().toISOString().split("T")[0],
    statement_date: new Date().toISOString().split("T")[0],
    title: "STATEMENT OF ACCOUNT",
  });

  // New Trip Item Form
  const [newTrip, setNewTrip] = useState({
    travel_date: new Date().toISOString().split("T")[0],
    booking_date: "",
    receipt_no: "",
    passenger_name: "",
    phone_number: "",
    activity: "",
    pickup_point: "",
    pickup_time: "",
    drop_point: "",
    drop_time: "",
    amount: 1800,
    advance_amount: 0,
    advance_date: "",
    notes: "",
  });

  // Save to LocalStorage whenever statements update
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(statements));
    }
  }, [statements]);

  const selectedStatement =
    statements.find((s) => s.id === selectedStatementId) || statements[0];

  // Calculations for selected statement
  const totalTripBilled = selectedStatement?.items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const totalAdvances = selectedStatement?.items.reduce(
    (sum, item) => sum + (Number(item.advance_amount) || 0),
    0
  );
  const lessAdj = selectedStatement?.less_adjustment || 0;

  // Net Due calculation
  const calculatedDue =
    selectedStatement?.total_due_override !== undefined
      ? selectedStatement.total_due_override
      : Math.max(0, totalTripBilled - totalAdvances + lessAdj);

  // Formatting INR
  const formatInr = (num: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  // Handle create statement
  const handleCreateStatement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStmt.client_name || !newStmt.phone) {
      toast.error("Client Name and Phone are required");
      return;
    }
    const created: ClientStatement = {
      id: `stmt-${Date.now()}`,
      client_name: newStmt.client_name,
      company_name: newStmt.company_name || newStmt.client_name,
      phone: newStmt.phone,
      address: newStmt.address,
      account_start_date: newStmt.account_start_date,
      statement_date: newStmt.statement_date,
      title: newStmt.title || "STATEMENT OF ACCOUNT",
      opening_balance: 0,
      less_adjustment: 0,
      status: "Due",
      items: [],
    };
    setStatements([created, ...statements]);
    setSelectedStatementId(created.id);
    setShowNewStmtModal(false);
    toast.success(`Statement created for ${created.client_name}!`);
    setNewStmt({
      client_name: "",
      company_name: "",
      phone: "",
      address: "No:256/A Next to Narayana Hrudayalaya Hospital Bommasandra",
      account_start_date: new Date().toISOString().split("T")[0],
      statement_date: new Date().toISOString().split("T")[0],
      title: "STATEMENT OF ACCOUNT",
    });
  };

  // Handle add trip item
  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.activity || !newTrip.passenger_name) {
      toast.error("Trip Activity and Passenger Name are required");
      return;
    }
    const item: StatementItem = {
      id: `trip-${Date.now()}`,
      travel_date: newTrip.travel_date,
      booking_date: newTrip.booking_date || newTrip.travel_date,
      receipt_no: newTrip.receipt_no,
      passenger_name: newTrip.passenger_name,
      phone_number: newTrip.phone_number || selectedStatement.phone,
      activity: newTrip.activity,
      pickup_point: newTrip.pickup_point,
      pickup_time: newTrip.pickup_time,
      drop_point: newTrip.drop_point,
      drop_time: newTrip.drop_time,
      amount: Number(newTrip.amount) || 0,
      advance_amount: Number(newTrip.advance_amount) || 0,
      advance_date: newTrip.advance_date,
      notes: newTrip.notes,
    };

    setStatements((prev) =>
      prev.map((stmt) => {
        if (stmt.id === selectedStatementId) {
          return {
            ...stmt,
            items: [...stmt.items, item],
          };
        }
        return stmt;
      })
    );

    setShowAddTripModal(false);
    toast.success("Trip added to statement!");
    setNewTrip({
      travel_date: new Date().toISOString().split("T")[0],
      booking_date: "",
      receipt_no: "",
      passenger_name: "",
      phone_number: "",
      activity: "",
      pickup_point: "",
      pickup_time: "",
      drop_point: "",
      drop_time: "",
      amount: 1800,
      advance_amount: 0,
      advance_date: "",
      notes: "",
    });
  };

  // Delete trip item
  const handleDeleteTrip = (tripId: string) => {
    if (!confirm("Are you sure you want to remove this trip item from statement?"))
      return;
    setStatements((prev) =>
      prev.map((stmt) => {
        if (stmt.id === selectedStatementId) {
          return {
            ...stmt,
            items: stmt.items.filter((item) => item.id !== tripId),
          };
        }
        return stmt;
      })
    );
    toast.success("Trip removed");
  };

  // Delete entire statement
  const handleDeleteStatement = (stmtId: string) => {
    if (statements.length <= 1) {
      toast.error("Cannot delete the only remaining statement.");
      return;
    }
    if (
      !confirm(
        "Are you sure you want to delete this complete Statement of Account?"
      )
    )
      return;
    const remaining = statements.filter((s) => s.id !== stmtId);
    setStatements(remaining);
    setSelectedStatementId(remaining[0].id);
    toast.success("Statement deleted");
  };

  // Print statement
  const handlePrint = () => {
    window.print();
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    const text = `*FORTUNE TOURISM - STATEMENT OF ACCOUNT*\nClient: ${
      selectedStatement.client_name
    }\nPhone: ${selectedStatement.phone}\nDate: ${
      selectedStatement.statement_date
    }\nTotal Trips: ${
      selectedStatement.items.length
    }\nTotal Amount: ${formatInr(totalTripBilled)}\nAdvances Paid: ${formatInr(
      totalAdvances
    )}\n*NET DUE AMOUNT: ${formatInr(calculatedDue)}*\nThank you for choosing Fortune Travels!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Filtered statements list
  const filteredStatements = statements.filter((s) => {
    const matchesSearch =
      s.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()));
    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && s.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden;
          }
          .statement-printable-sheet, .statement-printable-sheet * {
            visibility: visible;
          }
          .statement-printable-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            transform: scale(0.92);
            transform-origin: top left;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-navy)] text-white shadow-sm">
              <FileSpreadsheet className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Client Account Statements
              </h2>
              <p className="text-xs text-slate-500">
                Manage, generate, and print Statements of Account for individual clients & corporate accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={() => setShowNewStmtModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-navy)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <Plus className="h-4 w-4" />
            New Client Statement
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Printer className="h-4 w-4 text-blue-600" />
            Print Statement
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 transition"
          >
            <Share2 className="h-4 w-4 text-emerald-600" />
            WhatsApp Statement
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Sidebar list + Detail Statement sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Statement Selector */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          {/* Search & Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search statement by client or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Filter Status:</span>
              <div className="flex gap-1">
                {["All", "Due", "Settled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      statusFilter === st
                        ? "bg-[color:var(--color-navy)] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Statement Cards List */}
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredStatements.map((stmt) => {
              const isSelected = stmt.id === selectedStatementId;
              const tripsCount = stmt.items.length;
              const billed = stmt.items.reduce(
                (sum, i) => sum + (Number(i.amount) || 0),
                0
              );
              const adv = stmt.items.reduce(
                (sum, i) => sum + (Number(i.advance_amount) || 0),
                0
              );
              const due =
                stmt.total_due_override !== undefined
                  ? stmt.total_due_override
                  : Math.max(0, billed - adv + (stmt.less_adjustment || 0));

              return (
                <div
                  key={stmt.id}
                  onClick={() => setSelectedStatementId(stmt.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition shadow-sm ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        {stmt.title}
                      </span>
                      <h3 className="mt-1 font-bold text-slate-900 text-sm">
                        {stmt.client_name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        stmt.status === "Settled" || due === 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {due === 0 ? "PAID (₹0)" : `DUE: ${formatInr(due)}`}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" /> {stmt.phone}
                  </p>
                  {stmt.address && (
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" /> {stmt.address}
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {tripsCount} {tripsCount === 1 ? "Trip" : "Trips"}
                    </span>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Total Billed</span>
                      <span className="font-bold text-slate-900">{formatInr(billed)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Statement Display / Printable Sheet */}
        <div className="lg:col-span-8">
          {selectedStatement ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md relative print:shadow-none print:border-none print:p-0">

              {/* Statement Action Ribbon (Screen only) */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Statement #{selectedStatement.id}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600">
                    Created: {selectedStatement.statement_date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddTripModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Trip Line
                  </button>
                  <button
                    onClick={() => handleDeleteStatement(selectedStatement.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Statement
                  </button>
                </div>
              </div>

              {/* -------------------- PRINTABLE STATEMENT SHEET -------------------- */}
              <div className="statement-printable-sheet">
                {/* Official Letterhead Header */}
                <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-[color:var(--color-navy)] tracking-tight uppercase">
                      Fortune Tourism & Travels
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-1 max-w-lg">
                      {selectedStatement.address ||
                        "No:256/A Next to Narayana Hrudayalaya Hospital Bommasandra"}
                    </p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Ph: <span className="font-bold">{selectedStatement.phone || "+919740463404"}</span> | Email: info@fortunetourism.com
                    </p>
                  </div>

                  <div className="sm:text-right bg-slate-900 text-white p-3 rounded-xl min-w-[200px] border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase block">
                      {selectedStatement.title || "STATEMENT OF ACCOUNT"}
                    </span>
                    <p className="text-xs mt-1 text-slate-300">
                      Statement Date: <span className="font-bold text-white">{selectedStatement.statement_date}</span>
                    </p>
                    {selectedStatement.account_start_date && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        A/C Starts From: <span className="text-slate-200">{selectedStatement.account_start_date}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Client Account Info Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Client / Passenger Name
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedStatement.client_name}
                    </h2>
                    {selectedStatement.company_name && (
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        Company: {selectedStatement.company_name}
                      </p>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Customer Phone & Details
                    </span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {selectedStatement.phone}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total Trips Logged: <span className="font-bold text-slate-800">{selectedStatement.items.length}</span>
                    </p>
                  </div>
                </div>

                {/* Balance Summary Header Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Opening Balance
                    </span>
                    <span className="text-sm font-bold text-slate-700 mt-1 block">
                      {formatInr(selectedStatement.opening_balance)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold block">
                      Total Credit (Billed)
                    </span>
                    <span className="text-sm font-bold text-blue-900 mt-1 block">
                      {formatInr(totalTripBilled)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold block">
                      Total Debit / Advances
                    </span>
                    <span className="text-sm font-bold text-emerald-900 mt-1 block">
                      {formatInr(totalAdvances)}
                    </span>
                  </div>
                  <div className={`rounded-xl border p-3 text-center ${
                    calculatedDue > 0 ? "border-red-200 bg-red-50/70" : "border-emerald-200 bg-emerald-50"
                  }`}>
                    <span className={`text-[10px] uppercase tracking-wider font-bold block ${
                      calculatedDue > 0 ? "text-red-600" : "text-emerald-700"
                    }`}>
                      Closing Due Balance
                    </span>
                    <span className={`text-base font-extrabold mt-1 block ${
                      calculatedDue > 0 ? "text-red-700" : "text-emerald-700"
                    }`}>
                      {formatInr(calculatedDue)}
                    </span>
                  </div>
                </div>

                {/* Trips Ledger Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-semibold">
                      <tr>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Trip Activity & Route</th>
                        <th className="py-3 px-3">Pax Name</th>
                        <th className="py-3 px-3 text-right">Trip Amt (₹)</th>
                        <th className="py-3 px-3 text-right">Advance / Paid (₹)</th>
                        <th className="py-3 px-3 text-center">Adv Date / Ref</th>
                        <th className="py-3 px-3 text-center print:hidden">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {selectedStatement.items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                            No trip records added to this statement yet. Click "+ Add Trip Line" to add entries.
                          </td>
                        </tr>
                      ) : (
                        selectedStatement.items.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                              {item.travel_date}
                              {item.booking_date && item.booking_date !== item.travel_date && (
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  Bkd: {item.booking_date}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 max-w-[220px]">
                              <span className="font-bold text-slate-900 block">
                                {item.activity}
                              </span>
                              {(item.pickup_point || item.drop_point) && (
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  {item.pickup_point} → {item.drop_point}
                                </span>
                              )}
                              {item.receipt_no && (
                                <span className="inline-block mt-0.5 rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-mono">
                                  Receipt: {item.receipt_no}
                                </span>
                              )}
                              {item.notes && (
                                <span className="text-[10px] text-amber-700 italic block mt-0.5">
                                  Note: {item.notes}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-800">
                              {item.passenger_name}
                              {item.phone_number && (
                                <span className="block text-[10px] text-slate-400">
                                  {item.phone_number}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                              {formatInr(item.amount)}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                              {item.advance_amount > 0 ? formatInr(item.advance_amount) : "-"}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-500 whitespace-nowrap">
                              {item.advance_date || "-"}
                            </td>
                            <td className="py-3 px-3 text-center print:hidden">
                              <button
                                onClick={() => handleDeleteTrip(item.id)}
                                title="Remove trip line"
                                className="text-slate-400 hover:text-red-600 transition p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Calculation breakdown summary block */}
                <div className="flex flex-col sm:flex-row justify-end items-end gap-4 mb-8">
                  <div className="w-full sm:w-80 rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Trips Billed:</span>
                      <span className="font-bold text-slate-900">{formatInr(totalTripBilled)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Total Advances Paid:</span>
                      <span className="font-bold">{formatInr(totalAdvances)}</span>
                    </div>
                    {selectedStatement.less_adjustment ? (
                      <div className="flex justify-between text-amber-700 font-semibold border-t pt-1">
                        <span>Adjustments / Discounts:</span>
                        <span>{formatInr(selectedStatement.less_adjustment)}</span>
                      </div>
                    ) : null}
                    <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                      <span>NET TOTAL DUE:</span>
                      <span className={calculatedDue > 0 ? "text-red-600" : "text-emerald-600"}>
                        {formatInr(calculatedDue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="border-t border-slate-300 pt-8 mt-12 grid grid-cols-2 text-xs text-slate-600">
                  <div>
                    <p className="font-bold text-slate-900">Customer Authorization & Signature</p>
                    <p className="mt-8 text-slate-400">Date: ________________________</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">For FORTUNE TOURISM & TRAVELS</p>
                    <p className="mt-8 text-slate-400">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* -------------------- MODAL: CREATE NEW STATEMENT -------------------- */}
      {showNewStmtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-amber-500" />
                Create New Client Statement
              </h3>
              <button
                onClick={() => setShowNewStmtModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStatement} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. David Sir"
                    value={newStmt.client_name}
                    onChange={(e) =>
                      setNewStmt({ ...newStmt, client_name: e.target.value })
                    }
                    className="w-full rounded-xl border p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Customer Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9964600247 / 9740463404"
                    value={newStmt.phone}
                    onChange={(e) =>
                      setNewStmt({ ...newStmt, phone: e.target.value })
                    }
                    className="w-full rounded-xl border p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Branch / Hospital Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. No:256/A Next to Narayana Hrudayalaya Hospital Bommasandra"
                  value={newStmt.address}
                  onChange={(e) =>
                    setNewStmt({ ...newStmt, address: e.target.value })
                  }
                  className="w-full rounded-xl border p-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Account Start Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18/03/2025"
                    value={newStmt.account_start_date}
                    onChange={(e) =>
                      setNewStmt({ ...newStmt, account_start_date: e.target.value })
                    }
                    className="w-full rounded-xl border p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Statement Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 21/Sep/2025"
                    value={newStmt.statement_date}
                    onChange={(e) =>
                      setNewStmt({ ...newStmt, statement_date: e.target.value })
                    }
                    className="w-full rounded-xl border p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewStmtModal(false)}
                  className="rounded-xl border px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[color:var(--color-navy)] px-5 py-2 font-bold text-white hover:bg-slate-800"
                >
                  Save & Create Statement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: ADD TRIP TO STATEMENT -------------------- */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                Add Trip Entry to {selectedStatement.client_name}'s Statement
              </h3>
              <button
                onClick={() => setShowAddTripModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTrip} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Travel Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24/03/2025"
                    value={newTrip.travel_date}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, travel_date: e.target.value })
                    }
                    className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Passenger Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DAVID SIR"
                    value={newTrip.passenger_name}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, passenger_name: e.target.value })
                    }
                    className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Trip Route / Activity Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VILLA TO AIRPORT DROP"
                  value={newTrip.activity}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, activity: e.target.value })
                  }
                  className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Trip Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1800"
                    value={newTrip.amount}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, amount: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newTrip.advance_amount}
                    onChange={(e) =>
                      setNewTrip({
                        ...newTrip,
                        advance_amount: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Advance Payment Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20/03/2025"
                    value={newTrip.advance_date}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, advance_date: e.target.value })
                    }
                    className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Receipt / LR No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ft0035"
                    value={newTrip.receipt_no}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, receipt_no: e.target.value })
                    }
                    className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddTripModal(false)}
                  className="rounded-xl border px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Save Trip Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
