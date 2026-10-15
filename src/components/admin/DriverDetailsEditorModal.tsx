import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  X,
  UserCheck,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Download,
  Printer,
  Car,
  Phone,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  FileSpreadsheet,
  MapPin,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import logoAsset from "@/assets/fortune-tourism-logo.png";

export interface DriverDutyRecord {
  id: string;
  slNo: number;
  date: string;
  onDate: string;
  from: string;
  to: string;
  time: string;
  driver: string;
  driverPhone: string;
  carNo: string;
  car: string;
  due: number;
  toPay: number;
  settled: number;
  payDate: string;
  paxName: string;
  paxPhone: string;
}

// Exactly matching the image uploaded by the user
export const INITIAL_DRIVER_DUTY_RECORDS: DriverDutyRecord[] = [
  {
    id: "DD-1",
    slNo: 1,
    date: "3/10/2026",
    onDate: "3/10/2026",
    from: "BOMMASANDRA",
    to: "KIA DROP",
    time: "6.00 PM",
    driver: "ZAMEER",
    driverPhone: "9740463404",
    carNo: "KA 51 AC 6052",
    car: "XYLO",
    due: 0,
    toPay: 0,
    settled: 0,
    payDate: "3/10/2026",
    paxName: "GOUTAM KR MAITI",
    paxPhone: "9733941119",
  },
  {
    id: "DD-2",
    slNo: 2,
    date: "4/10/2026",
    onDate: "4/10/2026",
    from: "BOMMASANDRA",
    to: "KIA DROP",
    time: "11.30 AM",
    driver: "ZAMEER",
    driverPhone: "9740463404",
    carNo: "KA 51 AC 6052",
    car: "XYLO",
    due: 0,
    toPay: 0,
    settled: 0,
    payDate: "4/10/2026",
    paxName: "BISNU PADEL DAS",
    paxPhone: "9435559936",
  },
  {
    id: "DD-3",
    slNo: 3,
    date: "4/10/2026",
    onDate: "4/10/2026",
    from: "KIA",
    to: "KEY'S HOTEL DROP",
    time: "7.00 PM",
    driver: "ZAMEER",
    driverPhone: "9740463404",
    carNo: "KA 51 AC 6052",
    car: "XYLO",
    due: 0,
    toPay: 0,
    settled: 0,
    payDate: "4/10/2026",
    paxName: "L & T NAGRAJ(NILESH)",
    paxPhone: "9825413148",
  },
  {
    id: "DD-4",
    slNo: 4,
    date: "5/10/2026",
    onDate: "5/10/2026",
    from: "KIA",
    to: "KADUBISANALI + BOM DROP",
    time: "12.15 PM",
    driver: "TAVDE",
    driverPhone: "8861306201",
    carNo: "KA 01 AA 9582",
    car: "DZIRE",
    due: 0,
    toPay: 0,
    settled: 0,
    payDate: "5/10/2026",
    paxName: "BIRIGADE ROAD",
    paxPhone: "9835585663",
  },
  {
    id: "DD-5",
    slNo: 5,
    date: "6/10/2026",
    onDate: "6/10/2026",
    from: "BOMMASANDRA",
    to: "KIA DROP",
    time: "3.30 PM",
    driver: "VENUJI(TAVDE)",
    driverPhone: "9242242422",
    carNo: "KA 41 AA1963",
    car: "ERTIGA",
    due: 1000,
    toPay: 300,
    settled: 1300,
    payDate: "6/10/2026",
    paxName: "MD MUSHRAF HOSSAIN",
    paxPhone: "8768482485",
  },
  {
    id: "DD-6",
    slNo: 6,
    date: "6/10/2026",
    onDate: "6/10/2026",
    from: "E CITY",
    to: "KIA DROP",
    time: "5.30 PM",
    driver: "ZAMEER",
    driverPhone: "9740463404",
    carNo: "KA 51 AC 6052",
    car: "XYLO",
    due: 0,
    toPay: 0,
    settled: 0,
    payDate: "6/10/2026",
    paxName: "L & T NAGRAJ(NILESH)",
    paxPhone: "9825413148",
  },
  {
    id: "DD-7",
    slNo: 7,
    date: "7/10/2026",
    onDate: "8/10/2026",
    from: "BOMMASANDRA",
    to: "KIA DROP",
    time: "4.00 PM",
    driver: "VENUJI(TAVDE)",
    driverPhone: "9242242422",
    carNo: "KA 41 AA1963",
    car: "ERTIGA",
    due: 900,
    toPay: 400,
    settled: 1300,
    payDate: "8/10/2026",
    paxName: "LITION SAHA",
    paxPhone: "7364810597",
  },
];

const STORAGE_KEY = "fortune_driver_details_data";

interface DriverDetailsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearchQuery?: string;
}

export function DriverDetailsEditorModal({
  isOpen,
  onClose,
  initialSearchQuery = "",
}: DriverDetailsEditorModalProps) {
  const [records, setRecords] = useState<DriverDutyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading saved driver details:", e);
    }
    return INITIAL_DRIVER_DUTY_RECORDS;
  });

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialSearchQuery || "");
    }
  }, [isOpen, initialSearchQuery]);

  const [selectedDriverFilter, setSelectedDriverFilter] = useState("ALL");
  const [selectedCarFilter, setSelectedCarFilter] = useState("ALL");

  // Inline editable spreadsheet mode (default true for instant editing)
  const [inlineEditMode, setInlineEditMode] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Edit / Add modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DriverDutyRecord | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  // Sync to localStorage
  const saveToStorage = (data: DriverDutyRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const now = new Date();
      setLastSavedTime(
        `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
      );
    } catch (e) {
      console.error("Error saving driver records:", e);
    }
  };

  // Update single cell across any row & column
  const handleUpdateCell = (
    id: string,
    field: keyof DriverDutyRecord,
    value: any
  ) => {
    setRecords((prev) => {
      const updated = prev.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      });
      saveToStorage(updated);
      return updated;
    });
  };

  // Add new row directly into table
  const handleAddNewRow = () => {
    const nextSl =
      records.length > 0 ? Math.max(...records.map((r) => r.slNo)) + 1 : 1;
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const newRecord: DriverDutyRecord = {
      id: `DD-${Date.now()}`,
      slNo: nextSl,
      date: dateStr,
      onDate: dateStr,
      from: "",
      to: "",
      time: "10.00 AM",
      driver: "",
      driverPhone: "",
      carNo: "",
      car: "",
      due: 0,
      toPay: 0,
      settled: 0,
      payDate: dateStr,
      paxName: "",
      paxPhone: "",
    };
    const updated = [...records, newRecord];
    setRecords(updated);
    saveToStorage(updated);
    toast.success(`Row #${nextSl} added! Type directly into any column.`);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isEditModalOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isEditModalOpen, onClose]);

  // Unique drivers & cars for filters
  const uniqueDrivers = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.driver.trim()) set.add(r.driver.trim());
    });
    return Array.from(set);
  }, [records]);

  const uniqueCars = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.car.trim()) set.add(r.car.trim());
    });
    return Array.from(set);
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedDriverFilter !== "ALL" && r.driver !== selectedDriverFilter) {
        return false;
      }
      if (selectedCarFilter !== "ALL" && r.car !== selectedCarFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.driver.toLowerCase().includes(q) ||
          r.driverPhone.toLowerCase().includes(q) ||
          r.carNo.toLowerCase().includes(q) ||
          r.car.toLowerCase().includes(q) ||
          r.from.toLowerCase().includes(q) ||
          r.to.toLowerCase().includes(q) ||
          r.paxName.toLowerCase().includes(q) ||
          r.paxPhone.toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [records, selectedDriverFilter, selectedCarFilter, searchQuery]);

  // Calculated totals
  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => {
        acc.due += Number(r.due) || 0;
        acc.toPay += Number(r.toPay) || 0;
        acc.settled += Number(r.settled) || 0;
        return acc;
      },
      { due: 0, toPay: 0, settled: 0 }
    );
  }, [filteredRecords]);

  // Open Edit
  const handleOpenEdit = (record: DriverDutyRecord) => {
    setEditingRecord({ ...record });
    setIsNewEntry(false);
    setIsEditModalOpen(true);
  };

  // Open New Entry
  const handleOpenNewEntry = () => {
    const nextSl = records.length > 0 ? Math.max(...records.map((r) => r.slNo)) + 1 : 1;
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    setEditingRecord({
      id: `DD-${Date.now()}`,
      slNo: nextSl,
      date: dateStr,
      onDate: dateStr,
      from: "BOMMASANDRA",
      to: "KIA DROP",
      time: "10.00 AM",
      driver: "ZAMEER",
      driverPhone: "9740463404",
      carNo: "KA 51 AC 6052",
      car: "XYLO",
      due: 0,
      toPay: 0,
      settled: 0,
      payDate: dateStr,
      paxName: "",
      paxPhone: "",
    });
    setIsNewEntry(true);
    setIsEditModalOpen(true);
  };

  // Save Edit / Add
  const handleSaveRecord = () => {
    if (!editingRecord) return;
    if (!editingRecord.driver.trim()) {
      toast.error("Please enter a Driver Name");
      return;
    }

    let updatedList: DriverDutyRecord[];
    if (isNewEntry) {
      updatedList = [...records, editingRecord];
      toast.success(`Added new Driver Duty Entry #${editingRecord.slNo}`);
    } else {
      updatedList = records.map((r) =>
        r.id === editingRecord.id ? editingRecord : r
      );
      toast.success(`Updated Entry #${editingRecord.slNo} (${editingRecord.driver})`);
    }

    setRecords(updatedList);
    saveToStorage(updatedList);
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  // Delete Record
  const handleDeleteRecord = (id: string, slNo: number, driver: string) => {
    if (window.confirm(`Are you sure you want to delete Driver Entry #${slNo} (${driver})?`)) {
      const updatedList = records.filter((r) => r.id !== id);
      setRecords(updatedList);
      saveToStorage(updatedList);
      toast.success(`Deleted Entry #${slNo}`);
    }
  };

  // Restore Default Image Data
  const handleRestoreDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset Driver Details back to the original image sheet data (7 records)?"
      )
    ) {
      setRecords(INITIAL_DRIVER_DUTY_RECORDS);
      saveToStorage(INITIAL_DRIVER_DUTY_RECORDS);
      toast.success("Restored original 7 Driver Duty records from image!");
    }
  };

  // Clear All Data
  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL Driver Duty records? This will clear the table."
      )
    ) {
      setRecords([]);
      saveToStorage([]);
      toast.success("All driver details cleared.");
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const rowsForExcel = filteredRecords.map((r) => ({
        "SL NO": r.slNo,
        DATE: r.date,
        ON: r.onDate,
        FROM: r.from,
        TO: r.to,
        TIME: r.time,
        DRIVER: r.driver,
        "PH NO (DRIVER)": r.driverPhone,
        "CAR NO": r.carNo,
        CAR: r.car,
        DUE: r.due,
        TOPAY: r.toPay,
        SETTLED: r.settled,
        "PAY DT": r.payDate,
        "PAX NAME": r.paxName,
        "PH NO (PAX)": r.paxPhone,
      }));

      const ws = XLSX.utils.json_to_sheet(rowsForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Driver Details");

      const todayStr = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `fortune_tourism_driver_details_${todayStr}.xlsx`);
      toast.success("Driver details exported to Excel (.xlsx) successfully!");
    } catch (e: any) {
      console.error("Export error:", e);
      toast.error(`Export failed: ${e.message}`);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl max-h-[94vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header with FORTUNE Tourism Logo & Title */}
        <div className="bg-gradient-to-r from-[#063f2d] via-[#085a3c] to-[#063f2d] text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/40">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src={logoAsset}
                alt="Fortune Tourism"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight font-serif text-white">
                  FORTUNE Tourism<span className="text-emerald-300 text-xs align-super ml-0.5">™</span>
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Driver Details Edit
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Official Driver Duty Sheet, Vehicle Allotment &amp; Passenger Settlement Log
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewEntry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-lg shadow-sm transition hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Entry</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary Cards Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Trips: <strong className="text-slate-900">{filteredRecords.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Drivers: <strong className="text-slate-900">{uniqueDrivers.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Car className="w-3.5 h-3.5 text-purple-600" />
              <span>Cabs: <strong className="text-slate-900">{uniqueCars.length}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-semibold">
            <div className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <span>Total Due:</span>
              <strong className="text-amber-700 font-extrabold">₹{totals.due.toLocaleString("en-IN")}</strong>
            </div>
            <div className="bg-blue-50 text-blue-900 border border-blue-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <span>Total ToPay:</span>
              <strong className="text-blue-700 font-extrabold">₹{totals.toPay.toLocaleString("en-IN")}</strong>
            </div>
            <div className="bg-emerald-50 text-emerald-950 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <span>Total Settled:</span>
              <strong className="text-emerald-700 font-extrabold">₹{totals.settled.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Export Buttons */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search driver, cab, pax, route, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            {/* Filter by Driver */}
            <select
              value={selectedDriverFilter}
              onChange={(e) => setSelectedDriverFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Drivers</option>
              {uniqueDrivers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Filter by Car */}
            <select
              value={selectedCarFilter}
              onChange={(e) => setSelectedCarFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Cabs</option>
              {uniqueCars.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Edit Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !inlineEditMode;
                setInlineEditMode(nextState);
                toast.info(
                  nextState
                    ? "⚡ Spreadsheet Edit Mode enabled: You can edit every row and column directly!"
                    : "👁️ View Mode enabled"
                );
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                inlineEditMode
                  ? "bg-[#063f2d] text-white hover:bg-[#085a3f] ring-2 ring-emerald-500/50"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
              title="Toggle inline cell editing for every row and column"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{inlineEditMode ? "⚡ Quick Edit: ON" : "✏️ Enable Edit Mode"}</span>
            </button>

            {/* Direct Add Row Button */}
            <button
              type="button"
              onClick={handleAddNewRow}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              title="Add a new blank row directly into the sheet"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Row</span>
            </button>

            {/* Last saved indicator */}
            {lastSavedTime && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Auto-saved {lastSavedTime}
              </span>
            )}

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              title="Download formatted Excel (.xlsx) spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer"
              title="Reset data back to the 7 original image records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restore Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition cursor-pointer"
              title="Delete all records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear All</span>
            </button>
          </div>
        </div>

        {/* Excel Spreadsheet Table Container */}
        <div className="flex-1 overflow-auto bg-white p-2 sm:p-4">
          <div className="border border-slate-400/80 rounded-lg shadow-sm overflow-hidden min-w-[1300px]">
            {/* Fortune Tourism Top Banner Row (Excel header replica) */}
            <div className="bg-white border-b-2 border-slate-300 px-4 py-2 flex items-center justify-center gap-3">
              <div className="w-7 h-7 rounded-full border border-emerald-700 flex items-center justify-center p-0.5">
                <img src={logoAsset} alt="F Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-widest text-[#063f2d] font-serif uppercase">
                FORTUNE Tourism<span className="text-xs align-super lowercase">™</span>
              </h1>
            </div>

            {/* Table */}
            <table className="w-full border-collapse text-center text-xs">
              <thead>
                <tr className="bg-[#64748b] text-white font-extrabold uppercase text-[11px] tracking-wider divide-x divide-slate-400/70 border-b border-slate-400">
                  <th className="py-2.5 px-2 w-14 sticky left-0 z-20 bg-[#64748b]">SL NO</th>
                  <th className="py-2.5 px-2 w-20 sticky left-14 z-20 bg-[#526071] text-amber-300">ACTION</th>
                  <th className="py-2.5 px-2.5 w-24">DATE</th>
                  <th className="py-2.5 px-2.5 w-24">ON</th>
                  <th className="py-2.5 px-3 min-w-[130px]">FROM</th>
                  <th className="py-2.5 px-4 min-w-[130px]">TO</th>
                  <th className="py-2.5 px-2.5 w-24">TIME</th>
                  <th className="py-2.5 px-3 min-w-[110px]">DRIVER</th>
                  <th className="py-2.5 px-3 w-32">PH NO</th>
                  <th className="py-2.5 px-3 w-32">CAR NO</th>
                  <th className="py-2.5 px-2.5 w-24">CAR</th>
                  <th className="py-2.5 px-2.5 w-20">DUE</th>
                  <th className="py-2.5 px-2.5 w-20">TOPAY</th>
                  <th className="py-2.5 px-2.5 w-22">SETTLED</th>
                  <th className="py-2.5 px-2.5 w-24">PAY DT</th>
                  <th className="py-2.5 px-4 min-w-[140px]">PAX NAME</th>
                  <th className="py-2.5 px-3 w-32">PH NO (PAX)</th>
                  <th className="py-2.5 px-3 w-20 bg-slate-700 text-amber-300">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={18}
                      className="py-12 text-center text-slate-500 font-semibold bg-slate-50/50"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UserCheck className="w-8 h-8 text-slate-400" />
                        <p className="text-sm">
                          {searchQuery
                            ? `No driver duty records found matching "${searchQuery}".`
                            : "No driver duty records found."}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:bg-slate-300 cursor-pointer"
                            >
                              ✕ Clear Search &amp; Show All ({records.length})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleAddNewRow}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 cursor-pointer"
                          >
                            + Add New Row
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/60 transition-colors divide-x divide-slate-300/80 group"
                    >
                      {/* SL NO */}
                      <td className="py-1.5 px-2 font-bold text-slate-700 bg-slate-50 sticky left-0 z-10">
                        {inlineEditMode ? (
                          <input
                            type="number"
                            value={item.slNo}
                            onChange={(e) =>
                              handleUpdateCell(item.id, "slNo", Number(e.target.value) || item.slNo)
                            }
                            className="w-10 text-center font-bold text-slate-700 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none py-0.5"
                          />
                        ) : (
                          item.slNo
                        )}
                      </td>

                      {/* LEFT ACTION: Sticky row actions */}
                      <td className="py-1.5 px-2 bg-slate-100/90 sticky left-14 z-10">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded bg-white hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 transition cursor-pointer shadow-2xs"
                            title={`Edit row #${item.slNo} in modal`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteRecord(item.id, item.slNo, item.driver)
                            }
                            className="p-1 rounded bg-white hover:bg-rose-600 hover:text-white text-slate-700 border border-slate-200 transition cursor-pointer shadow-2xs"
                            title={`Delete row #${item.slNo}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="py-1 px-1.5 font-semibold text-slate-800">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.date}
                            onChange={(e) => handleUpdateCell(item.id, "date", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full text-center px-1.5 py-1 text-xs font-semibold text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition"
                          />
                        ) : (
                          item.date
                        )}
                      </td>

                      {/* ON */}
                      <td className="py-1 px-1.5 font-semibold text-slate-800">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.onDate}
                            onChange={(e) => handleUpdateCell(item.id, "onDate", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full text-center px-1.5 py-1 text-xs font-semibold text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition"
                          />
                        ) : (
                          item.onDate
                        )}
                      </td>

                      {/* FROM (Signature Green Tint from Excel image) */}
                      <td className="py-1 px-1.5 text-left font-bold text-[#064e3b] bg-[#a6d862]/25">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.from}
                            onChange={(e) => handleUpdateCell(item.id, "from", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="FROM location..."
                            className="w-full px-1.5 py-1 text-xs font-bold text-[#064e3b] bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition uppercase"
                          />
                        ) : (
                          item.from
                        )}
                      </td>

                      {/* TO (Signature Green Tint from Excel image) */}
                      <td className="py-1 px-1.5 text-left font-bold text-[#064e3b] bg-[#a6d862]/25">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.to}
                            onChange={(e) => handleUpdateCell(item.id, "to", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="TO location..."
                            className="w-full px-1.5 py-1 text-xs font-bold text-[#064e3b] bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition uppercase"
                          />
                        ) : (
                          item.to
                        )}
                      </td>

                      {/* TIME (Signature Green Tint from Excel image) */}
                      <td className="py-1 px-1.5 font-semibold text-[#064e3b] bg-[#a6d862]/25 whitespace-nowrap">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.time}
                            onChange={(e) => handleUpdateCell(item.id, "time", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full text-center px-1.5 py-1 text-xs font-semibold text-[#064e3b] bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition uppercase"
                          />
                        ) : (
                          item.time
                        )}
                      </td>

                      {/* DRIVER (Signature Green Tint from Excel image) */}
                      <td className="py-1 px-1.5 font-extrabold text-[#064e3b] bg-[#a6d862]/25 uppercase">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.driver}
                            onChange={(e) => handleUpdateCell(item.id, "driver", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="DRIVER..."
                            className="w-full px-1.5 py-1 text-xs font-extrabold text-[#064e3b] bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition uppercase"
                          />
                        ) : (
                          item.driver
                        )}
                      </td>

                      {/* PH NO (Driver) (Signature Green Tint from Excel image) */}
                      <td className="py-1 px-1.5 font-semibold text-[#064e3b] bg-[#a6d862]/25 tracking-wide">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.driverPhone}
                            onChange={(e) => handleUpdateCell(item.id, "driverPhone", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="Phone..."
                            className="w-full text-center px-1.5 py-1 text-xs font-semibold text-[#064e3b] bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition tracking-wide"
                          />
                        ) : (
                          item.driverPhone
                        )}
                      </td>

                      {/* CAR NO (Signature Green Tint from Excel image) */}
                      <td className="py-1 px-1.5 font-extrabold text-[#064e3b] bg-[#a6d862]/25 uppercase whitespace-nowrap">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.carNo}
                            onChange={(e) => handleUpdateCell(item.id, "carNo", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="CAR NO..."
                            className="w-full text-center px-1.5 py-1 text-xs font-extrabold text-[#064e3b] bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition uppercase"
                          />
                        ) : (
                          item.carNo
                        )}
                      </td>

                      {/* CAR (Signature Green Tint from Excel image) */}
                      <td className="py-1 px-1.5 font-extrabold text-[#064e3b] bg-[#a6d862]/25 uppercase">
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.car}
                            onChange={(e) => handleUpdateCell(item.id, "car", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="VEHICLE..."
                            className="w-full text-center px-1.5 py-1 text-xs font-extrabold text-[#064e3b] bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition uppercase"
                          />
                        ) : (
                          item.car
                        )}
                      </td>

                      {/* DUE */}
                      <td className={`py-1 px-1.5 font-bold ${item.due > 0 ? "text-amber-700 bg-amber-50/50" : "text-slate-600"}`}>
                        {inlineEditMode ? (
                          <input
                            type="number"
                            value={item.due === 0 ? "" : item.due}
                            placeholder="0"
                            onChange={(e) =>
                              handleUpdateCell(item.id, "due", Number(e.target.value) || 0)
                            }
                            onFocus={(e) => e.target.select()}
                            className="w-full text-center px-1 py-1 text-xs font-bold text-amber-700 bg-white/70 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition"
                          />
                        ) : (
                          item.due
                        )}
                      </td>

                      {/* TOPAY */}
                      <td className={`py-1 px-1.5 font-bold ${item.toPay > 0 ? "text-blue-700 bg-blue-50/50" : "text-slate-600"}`}>
                        {inlineEditMode ? (
                          <input
                            type="number"
                            value={item.toPay === 0 ? "" : item.toPay}
                            placeholder="0"
                            onChange={(e) =>
                              handleUpdateCell(item.id, "toPay", Number(e.target.value) || 0)
                            }
                            onFocus={(e) => e.target.select()}
                            className="w-full text-center px-1 py-1 text-xs font-bold text-blue-700 bg-white/70 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition"
                          />
                        ) : (
                          item.toPay
                        )}
                      </td>

                      {/* SETTLED (Green tint in rows 5 and 7 in image) */}
                      <td
                        className={`py-1 px-1.5 font-extrabold ${
                          item.settled > 0
                            ? "text-[#064e3b] bg-[#a6d862]/35"
                            : "text-slate-600"
                        }`}
                      >
                        {inlineEditMode ? (
                          <input
                            type="number"
                            value={item.settled === 0 ? "" : item.settled}
                            placeholder="0"
                            onChange={(e) =>
                              handleUpdateCell(item.id, "settled", Number(e.target.value) || 0)
                            }
                            onFocus={(e) => e.target.select()}
                            className={`w-full text-center px-1 py-1 text-xs font-extrabold rounded outline-none transition border border-transparent hover:border-slate-300 focus:border-emerald-600 ${
                              item.settled > 0
                                ? "text-[#064e3b] bg-white/80 focus:bg-white"
                                : "text-slate-700 bg-white/60 focus:bg-white"
                            }`}
                          />
                        ) : (
                          item.settled
                        )}
                      </td>

                      {/* PAY DT */}
                      <td
                        className={`py-1 px-1.5 font-semibold ${
                          item.settled > 0 ? "bg-[#a6d862]/20" : ""
                        }`}
                      >
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.payDate}
                            onChange={(e) => handleUpdateCell(item.id, "payDate", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full text-center px-1.5 py-1 text-xs font-semibold text-slate-800 bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition"
                          />
                        ) : (
                          item.payDate
                        )}
                      </td>

                      {/* PAX NAME */}
                      <td
                        className={`py-1 px-1.5 text-left font-bold uppercase text-slate-800 ${
                          item.settled > 0 ? "bg-[#a6d862]/20" : ""
                        }`}
                      >
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.paxName}
                            onChange={(e) => handleUpdateCell(item.id, "paxName", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="Passenger name..."
                            className="w-full px-1.5 py-1 text-xs font-bold uppercase text-slate-800 bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition"
                          />
                        ) : (
                          item.paxName || "—"
                        )}
                      </td>

                      {/* PH NO (Pax) */}
                      <td
                        className={`py-1 px-1.5 font-semibold text-slate-800 tracking-wide ${
                          item.settled > 0 ? "bg-[#a6d862]/20" : ""
                        }`}
                      >
                        {inlineEditMode ? (
                          <input
                            type="text"
                            value={item.paxPhone}
                            onChange={(e) => handleUpdateCell(item.id, "paxPhone", e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="Pax Phone..."
                            className="w-full text-center px-1.5 py-1 text-xs font-semibold text-slate-800 bg-white/60 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-600 rounded outline-none transition tracking-wide"
                          />
                        ) : (
                          item.paxPhone || "—"
                        )}
                      </td>

                      {/* RIGHT ACTION (Edit Modal / Delete) */}
                      <td className="py-1.5 px-2 bg-slate-50">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 transition cursor-pointer shadow-2xs"
                            title={`Open full edit dialog for row #${item.slNo}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteRecord(item.id, item.slNo, item.driver)
                            }
                            className="p-1 rounded bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 transition cursor-pointer shadow-2xs"
                            title={`Delete row #${item.slNo}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Total Footer */}
              {filteredRecords.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400 divide-x divide-slate-300">
                    <td colSpan={11} className="py-3 px-4 text-right uppercase tracking-wider text-[11px] text-slate-600">
                      TOTAL SUMMARY:
                    </td>
                    <td className="py-3 px-2 text-amber-700 font-extrabold text-sm">
                      {totals.due}
                    </td>
                    <td className="py-3 px-2 text-blue-700 font-extrabold text-sm">
                      {totals.toPay}
                    </td>
                    <td className="py-3 px-2 text-emerald-800 font-extrabold text-sm bg-emerald-100/50">
                      {totals.settled}
                    </td>
                    <td colSpan={4} className="py-3 px-3 text-left text-[11px] text-slate-500 font-medium">
                      {filteredRecords.length} Duty Trips Settled
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              All modifications are persisted automatically in your database and local storage.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>

      {/* Edit / Add Duty Record Dialog */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Dialog Header */}
            <div className="bg-[#063f2d] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isNewEntry
                      ? "Add New Driver Duty Entry"
                      : `Edit Driver Duty Entry #${editingRecord.slNo}`}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Fortune Tourism Official Fleet Record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dialog Form Fields */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Row 1: SL NO, DATE, ON DATE, TIME */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SL NO</label>
                  <input
                    type="number"
                    value={editingRecord.slNo}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        slNo: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">DATE</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={editingRecord.date}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, date: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ON DATE</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={editingRecord.onDate}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, onDate: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TIME</label>
                  <input
                    type="text"
                    placeholder="e.g. 6.00 PM"
                    value={editingRecord.time}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, time: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 2: FROM & TO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/60">
                <div>
                  <label className="block font-bold text-[#064e3b] mb-1">
                    FROM LOCATION
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BOMMASANDRA, KIA"
                    value={editingRecord.from}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        from: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 font-bold text-[#064e3b] uppercase focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#064e3b] mb-1">
                    TO LOCATION
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KIA DROP"
                    value={editingRecord.to}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        to: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 font-bold text-[#064e3b] uppercase focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Row 3: DRIVER & DRIVER PHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    DRIVER NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ZAMEER, TAVDE"
                    value={editingRecord.driver}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        driver: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    DRIVER PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9740463404 / 9964600247"
                    value={editingRecord.driverPhone}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        driverPhone: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold tracking-wide focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 4: CAR NO & CAR MODEL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    CAR NO (REGISTRATION)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KA 51 AC 6052"
                    value={editingRecord.carNo}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        carNo: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    CAR MODEL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. XYLO, DZIRE, ERTIGA"
                    value={editingRecord.car}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        car: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 5: DUE, TOPAY, SETTLED, PAY DT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-amber-800 mb-1">DUE (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.due}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        due: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-amber-700 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-800 mb-1">TOPAY (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.toPay}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        toPay: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-blue-700 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">SETTLED (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.settled}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        settled: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PAY DATE</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={editingRecord.payDate}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        payDate: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Row 6: PAX NAME & PAX PHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    PASSENGER (PAX) NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GOUTAM KR MAITI"
                    value={editingRecord.paxName}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        paxName: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    PASSENGER PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9964600247 / 9740463404"
                    value={editingRecord.paxPhone}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        paxPhone: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold tracking-wide focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRecord}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#063f2d] hover:bg-[#085a3c] text-white font-bold transition shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
