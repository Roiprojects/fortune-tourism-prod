import { useState } from "react";
import {
  Smartphone,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  Zap,
  Printer,
  X,
  Phone,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

interface RechargeTxn {
  id: string;
  txnRef: string;
  mobileNumber: string;
  operator: "Jio" | "Airtel" | "Vi" | "BSNL" | "Tata Play" | "Sun Direct" | "Airtel Digital TV";
  category: "Prepaid Mobile" | "Postpaid" | "DTH" | "FASTag";
  circle: string;
  planDetails: string;
  amount: number;
  commission: number;
  status: "Success" | "Processing" | "Failed";
  dateTime: string;
  operatorRef: string;
}

const INITIAL_RECHARGES: RechargeTxn[] = [
  {
    id: "RCG-901",
    txnRef: "TXN-FT-RCG-8821",
    mobileNumber: "98450 11223",
    operator: "Jio",
    category: "Prepaid Mobile",
    circle: "Karnataka",
    planDetails: "₹349 · 2GB/Day · 28 Days + Unlimited 5G",
    amount: 349,
    commission: 10.5,
    status: "Success",
    dateTime: "2026-09-02 11:24 AM",
    operatorRef: "JIO-77889912",
  },
  {
    id: "RCG-902",
    txnRef: "TXN-FT-RCG-8822",
    mobileNumber: "97412 55667",
    operator: "Airtel",
    category: "Prepaid Mobile",
    circle: "Karnataka",
    planDetails: "₹799 · 1.5GB/Day · 84 Days Calling",
    amount: 799,
    commission: 24.0,
    status: "Success",
    dateTime: "2026-09-02 10:45 AM",
    operatorRef: "AIR-11229983",
  },
  {
    id: "RCG-903",
    txnRef: "TXN-FT-RCG-8823",
    mobileNumber: "1098234120",
    operator: "Tata Play",
    category: "DTH",
    circle: "South Special",
    planDetails: "Super South HD Mega 1 Month",
    amount: 450,
    commission: 15.75,
    status: "Success",
    dateTime: "2026-09-02 09:30 AM",
    operatorRef: "TP-99881123",
  },
  {
    id: "RCG-904",
    txnRef: "TXN-FT-RCG-8824",
    mobileNumber: "94480 33441",
    operator: "BSNL",
    category: "Prepaid Mobile",
    circle: "Karnataka",
    planDetails: "₹199 · 30 Days Voice + 2GB/Day",
    amount: 199,
    commission: 6.0,
    status: "Processing",
    dateTime: "2026-09-02 09:15 AM",
    operatorRef: "PENDING_GATEWAY",
  },
  {
    id: "RCG-905",
    txnRef: "TXN-FT-RCG-8825",
    mobileNumber: "98800 77889",
    operator: "Vi",
    category: "Prepaid Mobile",
    circle: "Tamil Nadu",
    planDetails: "₹299 · 1.5GB/Day · 28 Days Binge All Night",
    amount: 299,
    commission: 9.0,
    status: "Success",
    dateTime: "2026-09-01 06:12 PM",
    operatorRef: "VI-88992233",
  },
  {
    id: "RCG-906",
    txnRef: "TXN-FT-RCG-8826",
    mobileNumber: "4001928371",
    operator: "Sun Direct",
    category: "DTH",
    circle: "Tamil DTH",
    planDetails: "Cinema Plus 3 Months Pack",
    amount: 680,
    commission: 27.2,
    status: "Success",
    dateTime: "2026-09-01 04:30 PM",
    operatorRef: "SUN-33221199",
  },
];

export function RechargeAdminManager() {
  const [recharges, setRecharges] = useState<RechargeTxn[]>(INITIAL_RECHARGES);
  const [search, setSearch] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [newRecharge, setNewRecharge] = useState({
    mobileNumber: "",
    operator: "Jio" as RechargeTxn["operator"],
    category: "Prepaid Mobile" as RechargeTxn["category"],
    circle: "Karnataka",
    planDetails: "Standard Monthly Plan",
    amount: 299,
  });

  const filtered = recharges.filter((r) => {
    const matchesOperator = operatorFilter === "All" || r.operator === operatorFilter;
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.mobileNumber.toLowerCase().includes(q) ||
      r.txnRef.toLowerCase().includes(q) ||
      r.operator.toLowerCase().includes(q) ||
      r.operatorRef.toLowerCase().includes(q);
    return matchesOperator && matchesStatus && matchesSearch;
  });

  const totalVol = recharges.reduce((s, r) => s + r.amount, 0);
  const totalCommission = recharges.reduce((s, r) => s + r.commission, 0);
  const successCount = recharges.filter((r) => r.status === "Success").length;
  const processingCount = recharges.filter((r) => r.status === "Processing").length;

  const handleRetry = (id: string) => {
    toast.loading("Re-querying operator telecom switch...");
    setTimeout(() => {
      setRecharges((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "Success", operatorRef: `OP-${Math.floor(10000000 + Math.random() * 90000000)}` }
            : r
        )
      );
      toast.dismiss();
      toast.success("Transaction verified & confirmed successful by operator!");
    }, 1200);
  };

  const handleCreateRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecharge.mobileNumber || !newRecharge.amount) {
      toast.error("Please enter mobile number and plan amount");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const entry: RechargeTxn = {
        id: `RCG-${900 + recharges.length + 1}`,
        txnRef: `TXN-FT-RCG-${8820 + recharges.length + 1}`,
        mobileNumber: newRecharge.mobileNumber,
        operator: newRecharge.operator,
        category: newRecharge.category,
        circle: newRecharge.circle,
        planDetails: newRecharge.planDetails,
        amount: Number(newRecharge.amount),
        commission: Number((newRecharge.amount * 0.03).toFixed(2)),
        status: "Success",
        dateTime: "Just Now",
        operatorRef: `OP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      };
      setRecharges([entry, ...recharges]);
      setIsProcessing(false);
      setShowModal(false);
      toast.success(`Recharge of ₹${entry.amount} for ${entry.mobileNumber} processed successfully!`);
      setNewRecharge({
        mobileNumber: "",
        operator: "Jio",
        category: "Prepaid Mobile",
        circle: "Karnataka",
        planDetails: "Standard Monthly Plan",
        amount: 299,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1329] via-[#101e46] to-[#0b1329] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5" />
              INSTANT TELECOM &amp; DTH GATEWAY
            </div>
            <h2 className="text-2xl font-black text-white">Recharge Management Section</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Track prepaid mobile, postpaid, DTH satellite television, and FASTag recharges across all telecom circles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Process Instant Recharge
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Total Recharge Volume</p>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">₹{totalVol.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{recharges.length} total transactions</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Successful Recharges</p>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{successCount}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">99.2% Gateway Success</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Processing Queue</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{processingCount}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Operator switch pending</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Margin / Commission</p>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">₹{totalCommission.toFixed(2)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Net earned dealer margin</p>
        </div>
      </div>

      {/* Operator Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["All", "Jio", "Airtel", "Vi", "BSNL", "Tata Play", "Sun Direct"].map((op) => (
          <button
            key={op}
            onClick={() => setOperatorFilter(op)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              operatorFilter === op
                ? "bg-[#0b1329] text-amber-400 shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Search and Status Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Mobile, Txn Ref, Operator Ref..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {["All", "Success", "Processing", "Failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? "bg-[#0b1329] text-amber-400"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Recharges Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3">Txn Ref / Date</th>
                <th className="px-4 py-3">Number / ID</th>
                <th className="px-4 py-3">Operator &amp; Circle</th>
                <th className="px-4 py-3">Plan Details</th>
                <th className="px-4 py-3">Amount &amp; Margin</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                    No recharge transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-slate-900">
                      {r.txnRef}
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">{r.dateTime}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        {r.mobileNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">OP Ref: {r.operatorRef}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">{r.operator}</div>
                      <div className="text-[11px] text-slate-500">{r.circle} · {r.category}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 max-w-xs truncate">
                      {r.planDetails}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-black text-slate-900 text-sm">₹{r.amount}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Comm: +₹{r.commission.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.status === "Success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "Processing"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {r.status === "Success" && <CheckCircle2 className="w-3 h-3" />}
                        {r.status === "Processing" && <Clock className="w-3 h-3" />}
                        {r.status === "Failed" && <AlertCircle className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => toast.info(`Printing transaction receipt for ${r.txnRef}`)}
                        title="Print Receipt"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {r.status === "Processing" && (
                        <button
                          onClick={() => handleRetry(r.id)}
                          title="Verify with Gateway"
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-bold"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instant Recharge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-600" /> Process Instant Recharge
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecharge} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile / DTH Customer ID *</label>
                <input
                  type="text"
                  required
                  value={newRecharge.mobileNumber}
                  onChange={(e) => setNewRecharge({ ...newRecharge, mobileNumber: e.target.value })}
                  placeholder="e.g. 9964600247 or 9740463404"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operator *</label>
                  <select
                    value={newRecharge.operator}
                    onChange={(e) =>
                      setNewRecharge({ ...newRecharge, operator: e.target.value as RechargeTxn["operator"] })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                  >
                    <option>Jio</option>
                    <option>Airtel</option>
                    <option>Vi</option>
                    <option>BSNL</option>
                    <option>Tata Play</option>
                    <option>Sun Direct</option>
                    <option>Airtel Digital TV</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newRecharge.category}
                    onChange={(e) =>
                      setNewRecharge({ ...newRecharge, category: e.target.value as RechargeTxn["category"] })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option>Prepaid Mobile</option>
                    <option>Postpaid</option>
                    <option>DTH</option>
                    <option>FASTag</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telecom Circle</label>
                  <input
                    type="text"
                    value={newRecharge.circle}
                    onChange={(e) => setNewRecharge({ ...newRecharge, circle: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newRecharge.amount}
                    onChange={(e) => setNewRecharge({ ...newRecharge, amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none font-black text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Description</label>
                <input
                  type="text"
                  value={newRecharge.planDetails}
                  onChange={(e) => setNewRecharge({ ...newRecharge, planDetails: e.target.value })}
                  placeholder="e.g. 1.5GB/Day Unlimited Voice 28 Days"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Process Now →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
