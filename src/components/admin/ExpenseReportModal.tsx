import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  X,
  Receipt,
  IndianRupee,
  Calendar,
  Wrench,
  Package,
  CreditCard,
  Building,
  Handshake,
  Users,
  FileText,
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  Search,
  CheckCircle,
  TrendingDown,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  useExpenseReports,
  ExpenseReportItem,
  computeExpenseItemTotal,
} from "@/lib/expense-reports";

interface ExpenseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseReportModal({ isOpen, onClose }: ExpenseReportModalProps) {
  const { items, add, remove, reset } = useExpenseReports();

  // Filters
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");

  // Form State for Adding New Expense
  const [formDateFrom, setFormDateFrom] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [formDateTo, setFormDateTo] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [formRepairs, setFormRepairs] = useState<string>("");
  const [formMiscellaneous, setFormMiscellaneous] = useState<string>("");
  const [formCredit, setFormCredit] = useState<string>("");
  const [formSupplierName, setFormSupplierName] = useState<string>("");
  const [formSupplierAmount, setFormSupplierAmount] = useState<string>("");
  const [formAgencyName, setFormAgencyName] = useState<string>("");
  const [formAgencyAmount, setFormAgencyAmount] = useState<string>("");
  const [formDriverName, setFormDriverName] = useState<string>("");
  const [formDriverAmount, setFormDriverAmount] = useState<string>("");
  const [formReason, setFormReason] = useState<string>("");
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>("Cash");

  if (!isOpen) return null;

  // Filtered expense entries
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Date from filter
      if (filterDateFrom && item.dateFrom < filterDateFrom && item.dateTo < filterDateFrom) {
        return false;
      }
      // Date to filter
      if (filterDateTo && item.dateFrom > filterDateTo) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchReason = (item.reason || "").toLowerCase().includes(q);
        const matchSupplier = (item.supplierName || "").toLowerCase().includes(q);
        const matchAgency = (item.agencyName || "").toLowerCase().includes(q);
        const matchDriver = (item.driverName || "").toLowerCase().includes(q);
        const matchMethod = (item.paymentMethod || "").toLowerCase().includes(q);
        if (!matchReason && !matchSupplier && !matchAgency && !matchDriver && !matchMethod) {
          return false;
        }
      }
      return true;
    });
  }, [items, filterDateFrom, filterDateTo, searchQuery]);

  // Aggregate totals
  const totals = useMemo(() => {
    let repairs = 0;
    let miscellaneous = 0;
    let credit = 0;
    let supplier = 0;
    let agency = 0;
    let drivers = 0;
    let grandTotal = 0;

    filteredItems.forEach((it) => {
      repairs += Number(it.repairs || 0);
      miscellaneous += Number(it.miscellaneous || 0);
      credit += Number(it.credit || 0);
      supplier += Number(it.supplierAmount || 0);
      agency += Number(it.agencyAmount || 0);
      drivers += Number(it.driverAmount || 0);
      grandTotal += computeExpenseItemTotal(it);
    });

    return { repairs, miscellaneous, credit, supplier, agency, drivers, grandTotal };
  }, [filteredItems]);

  // Handle Form Submission
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formDateFrom) {
      toast.error("Please select Date From.");
      return;
    }
    if (!formReason.trim()) {
      toast.error("Please enter a Reason / Description for this expense.");
      return;
    }

    const repairsNum = Math.max(0, Number(formRepairs) || 0);
    const miscNum = Math.max(0, Number(formMiscellaneous) || 0);
    const creditNum = Math.max(0, Number(formCredit) || 0);
    const supplierNum = Math.max(0, Number(formSupplierAmount) || 0);
    const agencyNum = Math.max(0, Number(formAgencyAmount) || 0);
    const driverNum = Math.max(0, Number(formDriverAmount) || 0);

    const totalEntry = repairsNum + miscNum + creditNum + supplierNum + agencyNum + driverNum;
    if (totalEntry <= 0) {
      toast.error("Please enter at least one expense amount (Repairs, Misc, Credit, Supplier, Agency, or Drivers).");
      return;
    }

    add({
      dateFrom: formDateFrom,
      dateTo: formDateTo || formDateFrom,
      repairs: repairsNum,
      miscellaneous: miscNum,
      credit: creditNum,
      supplierName: formSupplierName.trim(),
      supplierAmount: supplierNum,
      agencyName: formAgencyName.trim(),
      agencyAmount: agencyNum,
      driverName: formDriverName.trim(),
      driverAmount: driverNum,
      reason: formReason.trim(),
      paymentMethod: formPaymentMethod,
    });

    toast.success("Expense report entry recorded successfully!");

    // Reset Form
    setFormRepairs("");
    setFormMiscellaneous("");
    setFormCredit("");
    setFormSupplierName("");
    setFormSupplierAmount("");
    setFormAgencyName("");
    setFormAgencyAmount("");
    setFormDriverName("");
    setFormDriverAmount("");
    setFormReason("");
    setActiveTab("list");
  };

  const handlePrint = () => {
    window.print();
  };

  const quickFilter = (type: "today" | "week" | "month" | "all") => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (type === "today") {
      setFilterDateFrom(todayStr);
      setFilterDateTo(todayStr);
    } else if (type === "week") {
      const past = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      setFilterDateFrom(past);
      setFilterDateTo(todayStr);
    } else if (type === "month") {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      setFilterDateFrom(firstDay);
      setFilterDateTo(todayStr);
    } else {
      setFilterDateFrom("");
      setFilterDateTo("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ================= HEADER BAR ================= */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-[#063f2d] to-[#0a583e] text-white border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Expense Report &amp; Ledger</h3>
                <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  Accounts &amp; Payouts
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Track Date From, Date To, Repairs, Miscellaneous, Credit, Supplier, Agency, Drivers &amp; Reason
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15 cursor-pointer"
              title="Print Expense Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= TABS & QUICK CONTROLS ================= */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "list"
                  ? "bg-[#063f2d] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Expense Ledger ({filteredItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("add")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "add"
                  ? "bg-[#063f2d] text-white shadow-xs"
                  : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Expense Entry</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset expense entries back to sample records?")) {
                  reset();
                  toast.success("Reset to default expense entries.");
                }
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
              title="Reset Sample Records"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ================= TAB 1: ADD NEW EXPENSE ENTRY ================= */}
          {activeTab === "add" && (
            <form onSubmit={handleSaveExpense} className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/30 p-5 rounded-2xl border border-emerald-200/70 shadow-xs">
                <h4 className="text-sm font-black text-[#063f2d] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  <span>Record New Operating Expense</span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Enter Date From, Date To, and fill amounts across Repairs, Miscellaneous, Credit, Supplier, Agency, and Drivers.
                </p>
              </div>

              {/* 1. Date Range: Date From & Date To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Date From *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDateFrom}
                    onChange={(e) => setFormDateFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Starting date of expense / period</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Date To *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDateTo}
                    onChange={(e) => setFormDateTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Ending date of expense / period</p>
                </div>
              </div>

              {/* 2. Direct Expense Amounts: Repairs, Miscellaneous, Credit */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Direct Operating Overheads
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Repairs */}
                  <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80">
                    <label className="block text-xs font-black text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      <span>Repairs (₹)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formRepairs}
                        onChange={(e) => setFormRepairs(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-amber-300 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                    <p className="text-[10px] text-amber-700/80 mt-1">Vehicle service, garage, parts</p>
                  </div>

                  {/* Miscellaneous */}
                  <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-200/80">
                    <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Miscellaneous (₹)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formMiscellaneous}
                        onChange={(e) => setFormMiscellaneous(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-indigo-300 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <p className="text-[10px] text-indigo-700/80 mt-1">Tolls, parking, office snacks, recharges</p>
                  </div>

                  {/* Credit */}
                  <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200/80">
                    <label className="block text-xs font-black text-rose-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                      <span>Credit (₹)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formCredit}
                        onChange={(e) => setFormCredit(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-rose-300 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                      />
                    </div>
                    <p className="text-[10px] text-rose-700/80 mt-1">Credit clearance, advance payout</p>
                  </div>
                </div>
              </div>

              {/* 3. Entity Payouts: Supplier, Agency, Drivers */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Supplier, Agency &amp; Driver Details
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Supplier */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Supplier</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Supplier Name (e.g. Fuel Bunk / Parts)"
                      value={formSupplierName}
                      onChange={(e) => setFormSupplierName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Supplier Amount (₹)"
                        value={formSupplierAmount}
                        onChange={(e) => setFormSupplierAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Agency */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Handshake className="w-3.5 h-3.5 text-blue-600" />
                      <span>Agency</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Agency Name (e.g. B2B Partner Desk)"
                      value={formAgencyName}
                      onChange={(e) => setFormAgencyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Agency Amount (₹)"
                        value={formAgencyAmount}
                        onChange={(e) => setFormAgencyAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Drivers */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Drivers</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Driver Name (e.g. Manjunath K)"
                      value={formDriverName}
                      onChange={(e) => setFormDriverName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Driver Bata / Amount (₹)"
                        value={formDriverAmount}
                        onChange={(e) => setFormDriverAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Reason & Payment Method */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Reason / Particulars *</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Paid Via:</span>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Bank Transfer">Bank Transfer / IMPS</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Specify clear purpose (e.g. Innova KA-05 clutch overhaul, driver outstation night bata, supplier fuel bill ref #8921)"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#063f2d] to-[#086a46] hover:from-[#053224] hover:to-[#065337] text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-900/20 transition cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>Save Expense Record</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: EXPENSE LEDGER & REPORT ================= */}
          {activeTab === "list" && (
            <div className="space-y-6">

              {/* Filter Bar: Date From, Date To, Search & Quick Presets */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Date From */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700 whitespace-nowrap">From:</span>
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Date To */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700 whitespace-nowrap">To:</span>
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Quick Range Presets */}
                    <div className="hidden md:flex items-center gap-1 pl-2 border-l border-slate-300">
                      <button
                        type="button"
                        onClick={() => quickFilter("today")}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => quickFilter("week")}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                      >
                        Last 7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => quickFilter("month")}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                      >
                        This Month
                      </button>
                      <button
                        type="button"
                        onClick={() => quickFilter("all")}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                      >
                        All
                      </button>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search reason, supplier, driver..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {/* 1. Repairs */}
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Repairs</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-amber-950 mt-1">
                    ₹{totals.repairs.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* 2. Miscellaneous */}
                <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-indigo-800 text-[11px] font-black uppercase tracking-wider">
                    <Package className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Misc</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-indigo-950 mt-1">
                    ₹{totals.miscellaneous.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* 3. Credit */}
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-black uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                    <span>Credit</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-rose-950 mt-1">
                    ₹{totals.credit.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* 4. Supplier */}
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supplier</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-emerald-950 mt-1">
                    ₹{totals.supplier.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* 5. Agency */}
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-blue-800 text-[11px] font-black uppercase tracking-wider">
                    <Handshake className="w-3.5 h-3.5 text-blue-600" />
                    <span>Agency</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-blue-950 mt-1">
                    ₹{totals.agency.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* 6. Drivers */}
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-purple-800 text-[11px] font-black uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Drivers</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-purple-950 mt-1">
                    ₹{totals.drivers.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* 7. Grand Total */}
                <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#063f2d] to-[#086a46] p-3 rounded-2xl text-white shadow-md">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[11px] font-black uppercase tracking-wider">
                    <TrendingDown className="w-3.5 h-3.5 text-amber-300" />
                    <span>Total Expense</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-amber-300 mt-1">
                    ₹{totals.grandTotal.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Main Expense Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-700 font-black uppercase tracking-wider border-b border-slate-200 text-[10px]">
                        <th className="py-3 px-3">Date (From - To)</th>
                        <th className="py-3 px-3 min-w-[200px]">Reason / Particulars</th>
                        <th className="py-3 px-3 text-right">Repairs</th>
                        <th className="py-3 px-3 text-right">Misc</th>
                        <th className="py-3 px-3 text-right">Credit</th>
                        <th className="py-3 px-3">Supplier</th>
                        <th className="py-3 px-3">Agency</th>
                        <th className="py-3 px-3">Drivers</th>
                        <th className="py-3 px-3 text-right font-black">Total</th>
                        <th className="py-3 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((item) => {
                        const rowTotal = computeExpenseItemTotal(item);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Date From - To */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{item.dateFrom}</div>
                              {item.dateTo && item.dateTo !== item.dateFrom && (
                                <div className="text-[10px] text-slate-500">to {item.dateTo}</div>
                              )}
                              {item.paymentMethod && (
                                <span className="inline-block text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold mt-0.5">
                                  {item.paymentMethod}
                                </span>
                              )}
                            </td>

                            {/* Reason */}
                            <td className="py-3 px-3">
                              <p className="font-semibold text-slate-800 leading-snug">{item.reason}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                            </td>

                            {/* Repairs */}
                            <td className="py-3 px-3 text-right font-bold text-amber-800">
                              {item.repairs > 0 ? `₹${item.repairs.toLocaleString("en-IN")}` : "—"}
                            </td>

                            {/* Misc */}
                            <td className="py-3 px-3 text-right font-bold text-indigo-800">
                              {item.miscellaneous > 0 ? `₹${item.miscellaneous.toLocaleString("en-IN")}` : "—"}
                            </td>

                            {/* Credit */}
                            <td className="py-3 px-3 text-right font-bold text-rose-800">
                              {item.credit > 0 ? `₹${item.credit.toLocaleString("en-IN")}` : "—"}
                            </td>

                            {/* Supplier */}
                            <td className="py-3 px-3">
                              {item.supplierName || item.supplierAmount > 0 ? (
                                <div>
                                  <div className="font-bold text-slate-900 text-[11px] truncate max-w-[130px]">
                                    {item.supplierName || "Supplier"}
                                  </div>
                                  <div className="font-black text-emerald-700 text-[11px]">
                                    ₹{(item.supplierAmount || 0).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* Agency */}
                            <td className="py-3 px-3">
                              {item.agencyName || item.agencyAmount > 0 ? (
                                <div>
                                  <div className="font-bold text-slate-900 text-[11px] truncate max-w-[130px]">
                                    {item.agencyName || "Agency"}
                                  </div>
                                  <div className="font-black text-blue-700 text-[11px]">
                                    ₹{(item.agencyAmount || 0).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* Drivers */}
                            <td className="py-3 px-3">
                              {item.driverName || item.driverAmount > 0 ? (
                                <div>
                                  <div className="font-bold text-slate-900 text-[11px] truncate max-w-[130px]">
                                    {item.driverName || "Driver"}
                                  </div>
                                  <div className="font-black text-purple-700 text-[11px]">
                                    ₹{(item.driverAmount || 0).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* Total */}
                            <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                              ₹{rowTotal.toLocaleString("en-IN")}
                            </td>

                            {/* Action */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete expense record ${item.id}?`)) {
                                    remove(item.id);
                                    toast.success("Expense record removed.");
                                  }
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={10} className="py-10 text-center text-slate-400">
                            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="font-bold text-xs text-slate-600">No expense records found for this period.</p>
                            <button
                              type="button"
                              onClick={() => setActiveTab("add")}
                              className="mt-2 text-xs font-black text-emerald-700 hover:underline cursor-pointer"
                            >
                              + Click here to add an expense entry
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer Bar with Overall Count and Sum */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
                  <span>Showing {filteredItems.length} records</span>
                  <div className="flex items-center gap-2">
                    <span>Total Outflow:</span>
                    <span className="text-sm font-black text-[#063f2d]">
                      ₹{totals.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Fortune Tourism &bull; Accounts &amp; Operational Expenses Report
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
