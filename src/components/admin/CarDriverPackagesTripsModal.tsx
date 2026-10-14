import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  X,
  Compass,
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
  IndianRupee,
  ShieldCheck,
  MapPin,
  User,
  Route,
  Fuel,
  FileSpreadsheet,
} from "lucide-react";
import logoAsset from "@/assets/fortune-tourism-logo.png";

export interface CarPackageTripRecord {
  id: string;
  slNo: number;
  booking: string; // e.g. "FC-PKG-101"
  journeyDt: string; // e.g. "04/10/2026"
  totalRunKm: number; // e.g. 480
  perKm: number; // e.g. 16
  state: string; // e.g. "KARNATAKA"
  tp: number; // Permit / Toll / Tp, e.g. 300
  bata: number; // Driver Bata, e.g. 600
  tollExp: number; // Toll Expense, e.g. 450
  carType: string; // e.g. "SUV", "SEDAN", "TEMPO"
  car: string; // e.g. "INNOVA", "DZIRE", "ERTIGA"
  carNo: string; // e.g. "KA 51 AC 6052"
  driver: string; // e.g. "ZAMEER"
  drPhNo: string; // e.g. "9740463404"
  due: number; // e.g. 2000
  settledDt: string; // e.g. "06/10/2026"
  totalCost: number; // e.g. 9030
  remaining: number; // e.g. 0
  phGpayNo: string; // e.g. "9740463404"
  paxName: string; // e.g. "ROHIT SHARMA"
  phNo: string; // e.g. "9876543210"
}

// Initial records matching the columns from user's uploaded image
export const INITIAL_PACKAGE_TRIPS_RECORDS: CarPackageTripRecord[] = [
  {
    id: "CPT-1",
    slNo: 1,
    booking: "FC-PKG-801",
    journeyDt: "03/10/2026",
    totalRunKm: 480,
    perKm: 16,
    state: "KARNATAKA",
    tp: 300,
    bata: 600,
    tollExp: 450,
    carType: "SUV",
    car: "INNOVA",
    carNo: "KA 51 AC 6052",
    driver: "ZAMEER",
    drPhNo: "9740463404",
    due: 1500,
    settledDt: "05/10/2026",
    totalCost: 9030,
    remaining: 0,
    phGpayNo: "9740463404",
    paxName: "GOUTAM KR MAITI",
    phNo: "9733941119",
  },
  {
    id: "CPT-2",
    slNo: 2,
    booking: "FC-PKG-802",
    journeyDt: "04/10/2026",
    totalRunKm: 620,
    perKm: 15,
    state: "TAMIL NADU",
    tp: 500,
    bata: 1000,
    tollExp: 680,
    carType: "SUV",
    car: "ERTIGA",
    carNo: "KA 41 AA 1963",
    driver: "VENUJI(TAVDE)",
    drPhNo: "9242242422",
    due: 2500,
    settledDt: "07/10/2026",
    totalCost: 11480,
    remaining: 0,
    phGpayNo: "9242242422",
    paxName: "MD MUSHRAF HOSSAIN",
    phNo: "8768482485",
  },
  {
    id: "CPT-3",
    slNo: 3,
    booking: "FC-PKG-803",
    journeyDt: "05/10/2026",
    totalRunKm: 350,
    perKm: 13,
    state: "KARNATAKA",
    tp: 200,
    bata: 500,
    tollExp: 320,
    carType: "SEDAN",
    car: "DZIRE",
    carNo: "KA 01 AA 9582",
    driver: "TAVDE",
    drPhNo: "8861306201",
    due: 0,
    settledDt: "06/10/2026",
    totalCost: 5570,
    remaining: 0,
    phGpayNo: "8861306201",
    paxName: "BIRIGADE ROAD",
    phNo: "9835585663",
  },
  {
    id: "CPT-4",
    slNo: 4,
    booking: "FC-PKG-804",
    journeyDt: "06/10/2026",
    totalRunKm: 560,
    perKm: 16,
    state: "KERALA",
    tp: 600,
    bata: 1200,
    tollExp: 550,
    carType: "MUV",
    car: "XYLO",
    carNo: "KA 51 AC 6052",
    driver: "ZAMEER",
    drPhNo: "9740463404",
    due: 1800,
    settledDt: "08/10/2026",
    totalCost: 11310,
    remaining: 0,
    phGpayNo: "9740463404",
    paxName: "L & T NAGRAJ(NILESH)",
    phNo: "9825413148",
  },
  {
    id: "CPT-5",
    slNo: 5,
    booking: "FC-PKG-805",
    journeyDt: "07/10/2026",
    totalRunKm: 420,
    perKm: 15,
    state: "ANDHRA PRADESH",
    tp: 400,
    bata: 800,
    tollExp: 410,
    carType: "SUV",
    car: "ERTIGA",
    carNo: "KA 41 AA 1963",
    driver: "VENUJI(TAVDE)",
    drPhNo: "9242242422",
    due: 900,
    settledDt: "09/10/2026",
    totalCost: 7910,
    remaining: 400,
    phGpayNo: "9242242422",
    paxName: "LITION SAHA",
    phNo: "7364810597",
  },
];

const STORAGE_KEY = "fortune_car_packages_trips_data";

interface CarDriverPackagesTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CarDriverPackagesTripsModal({
  isOpen,
  onClose,
}: CarDriverPackagesTripsModalProps) {
  const [records, setRecords] = useState<CarPackageTripRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading saved package trips:", e);
    }
    return INITIAL_PACKAGE_TRIPS_RECORDS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStateFilter, setSelectedStateFilter] = useState("ALL");
  const [selectedDriverFilter, setSelectedDriverFilter] = useState("ALL");
  const [selectedCarTypeFilter, setSelectedCarTypeFilter] = useState("ALL");

  // Edit / Add modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CarPackageTripRecord | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  // Sync to localStorage
  const saveToStorage = (data: CarPackageTripRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving package trip records:", e);
    }
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

  // Unique filter values
  const uniqueStates = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.state.trim()) set.add(r.state.trim());
    });
    return Array.from(set);
  }, [records]);

  const uniqueDrivers = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.driver.trim()) set.add(r.driver.trim());
    });
    return Array.from(set);
  }, [records]);

  const uniqueCarTypes = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.carType.trim()) set.add(r.carType.trim());
    });
    return Array.from(set);
  }, [records]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedStateFilter !== "ALL" && r.state !== selectedStateFilter) {
        return false;
      }
      if (selectedDriverFilter !== "ALL" && r.driver !== selectedDriverFilter) {
        return false;
      }
      if (selectedCarTypeFilter !== "ALL" && r.carType !== selectedCarTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.booking.toLowerCase().includes(q) ||
          r.driver.toLowerCase().includes(q) ||
          r.drPhNo.toLowerCase().includes(q) ||
          r.carNo.toLowerCase().includes(q) ||
          r.car.toLowerCase().includes(q) ||
          r.carType.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          r.paxName.toLowerCase().includes(q) ||
          r.phNo.toLowerCase().includes(q) ||
          r.journeyDt.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [records, selectedStateFilter, selectedDriverFilter, selectedCarTypeFilter, searchQuery]);

  // Totals calculations
  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => {
        acc.km += Number(r.totalRunKm) || 0;
        acc.bata += Number(r.bata) || 0;
        acc.toll += Number(r.tollExp) || 0;
        acc.due += Number(r.due) || 0;
        acc.cost += Number(r.totalCost) || 0;
        acc.remaining += Number(r.remaining) || 0;
        return acc;
      },
      { km: 0, bata: 0, toll: 0, due: 0, cost: 0, remaining: 0 }
    );
  }, [filteredRecords]);

  // Open Edit
  const handleOpenEdit = (record: CarPackageTripRecord) => {
    setEditingRecord({ ...record });
    setIsNewEntry(false);
    setIsEditModalOpen(true);
  };

  // Open Add New
  const handleOpenNewEntry = () => {
    const nextSl = records.length > 0 ? Math.max(...records.map((r) => r.slNo)) + 1 : 1;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}/${today.getFullYear()}`;

    setEditingRecord({
      id: `CPT-${Date.now()}`,
      slNo: nextSl,
      booking: `FC-PKG-${800 + nextSl}`,
      journeyDt: dateStr,
      totalRunKm: 400,
      perKm: 15,
      state: "KARNATAKA",
      tp: 300,
      bata: 600,
      tollExp: 400,
      carType: "SUV",
      car: "INNOVA",
      carNo: "KA 51 AC 6052",
      driver: "ZAMEER",
      drPhNo: "9740463404",
      due: 0,
      settledDt: dateStr,
      totalCost: 7300,
      remaining: 0,
      phGpayNo: "9740463404",
      paxName: "",
      phNo: "",
    });
    setIsNewEntry(true);
    setIsEditModalOpen(true);
  };

  // Auto calculate total cost when km/perKm/bata/toll changes
  const updateEditingField = (field: keyof CarPackageTripRecord, val: any) => {
    if (!editingRecord) return;
    const next = { ...editingRecord, [field]: val };

    if (
      field === "totalRunKm" ||
      field === "perKm" ||
      field === "bata" ||
      field === "tollExp" ||
      field === "tp"
    ) {
      const km = Number(field === "totalRunKm" ? val : next.totalRunKm) || 0;
      const rate = Number(field === "perKm" ? val : next.perKm) || 0;
      const bataVal = Number(field === "bata" ? val : next.bata) || 0;
      const tollVal = Number(field === "tollExp" ? val : next.tollExp) || 0;
      const tpVal = Number(field === "tp" ? val : next.tp) || 0;
      next.totalCost = km * rate + bataVal + tollVal + tpVal;
    }

    setEditingRecord(next);
  };

  // Save Record
  const handleSaveRecord = () => {
    if (!editingRecord) return;
    if (!editingRecord.driver.trim()) {
      toast.error("Please enter a Driver Name");
      return;
    }

    let updatedList: CarPackageTripRecord[];
    if (isNewEntry) {
      updatedList = [...records, editingRecord];
      toast.success(`Added Package Trip #${editingRecord.slNo} (${editingRecord.booking})`);
    } else {
      updatedList = records.map((r) =>
        r.id === editingRecord.id ? editingRecord : r
      );
      toast.success(`Updated Package Trip #${editingRecord.slNo}`);
    }

    setRecords(updatedList);
    saveToStorage(updatedList);
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  // Delete Record
  const handleDeleteRecord = (id: string, slNo: number, booking: string) => {
    if (window.confirm(`Are you sure you want to delete Trip #${slNo} (${booking})?`)) {
      const updatedList = records.filter((r) => r.id !== id);
      setRecords(updatedList);
      saveToStorage(updatedList);
      toast.success(`Deleted Package Trip #${slNo}`);
    }
  };

  // Restore Defaults
  const handleRestoreDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset back to the default package trips records?"
      )
    ) {
      setRecords(INITIAL_PACKAGE_TRIPS_RECORDS);
      saveToStorage(INITIAL_PACKAGE_TRIPS_RECORDS);
      toast.success("Restored default Package Trips data!");
    }
  };

  // Clear All
  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL Car Package Trip records? This will clear the table."
      )
    ) {
      setRecords([]);
      saveToStorage([]);
      toast.success("All package trip details cleared.");
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const rowsForExcel = filteredRecords.map((r) => ({
        "SL NO": r.slNo,
        BOOKING: r.booking,
        "JOURNEY DT": r.journeyDt,
        "Total Run Km": r.totalRunKm,
        "Per/Km": r.perKm,
        State: r.state,
        Tp: r.tp,
        BATA: r.bata,
        "Toll Exp": r.tollExp,
        "Car Type": r.carType,
        CAR: r.car,
        "Car No": r.carNo,
        Driver: r.driver,
        "Dr Ph No": r.drPhNo,
        DUE: r.due,
        "SETTLLED Dt": r.settledDt,
        "TOTAL COST": r.totalCost,
        REMAINING: r.remaining,
        "PH /G PAY NO": r.phGpayNo,
        "PAX NAME": r.paxName,
        "PH NO": r.phNo,
      }));

      const ws = XLSX.utils.json_to_sheet(rowsForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Packages Trips");

      const todayStr = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `fortune_tourism_packages_trips_${todayStr}.xlsx`);
      toast.success("Package trips exported to Excel (.xlsx) successfully!");
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
      <div className="relative w-full max-w-[96vw] max-h-[94vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
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
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  Car Packages Trips Details Edit
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Tour Packages &amp; Outstation Cab Trips, Km Run, State Permits, Driver Bata &amp; Settlement Log
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewEntry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-lg shadow-sm transition hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Package Trip</span>
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

        {/* Stats Summary Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Total Trips: <strong className="text-slate-900">{filteredRecords.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Route className="w-3.5 h-3.5 text-blue-600" />
              <span>Total Km: <strong className="text-slate-900">{totals.km.toLocaleString()} km</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Fuel className="w-3.5 h-3.5 text-purple-600" />
              <span>Driver Bata: <strong className="text-slate-900">₹{totals.bata.toLocaleString("en-IN")}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-semibold">
            <div className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <span>Total Due:</span>
              <strong className="text-amber-700 font-extrabold">₹{totals.due.toLocaleString("en-IN")}</strong>
            </div>
            <div className="bg-emerald-50 text-emerald-950 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <span>Total Package Cost:</span>
              <strong className="text-emerald-700 font-extrabold">₹{totals.cost.toLocaleString("en-IN")}</strong>
            </div>
            <div className="bg-rose-50 text-rose-900 border border-rose-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <span>Remaining:</span>
              <strong className="text-rose-700 font-extrabold">₹{totals.remaining.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Action Buttons */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search booking, driver, car no, state, pax..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
              />
            </div>

            {/* Filter by State */}
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All States</option>
              {uniqueStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Filter by Driver */}
            <select
              value={selectedDriverFilter}
              onChange={(e) => setSelectedDriverFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Drivers</option>
              {uniqueDrivers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Filter by Car Type */}
            <select
              value={selectedCarTypeFilter}
              onChange={(e) => setSelectedCarTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Car Types</option>
              {uniqueCarTypes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              title="Download formatted Excel (.xlsx) file"
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
              title="Reset data back to default records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restore Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition cursor-pointer"
              title="Clear all records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear All</span>
            </button>
          </div>
        </div>

        {/* Excel Spreadsheet Table matching exact columns & peach header */}
        <div className="flex-1 overflow-auto bg-white p-2 sm:p-4">
          <div className="border border-amber-300 rounded-lg shadow-sm overflow-hidden min-w-[1550px]">
            <table className="w-full border-collapse text-center text-xs">
              <thead>
                {/* Peach / Orange Header matching the user's uploaded image */}
                <tr className="bg-[#fed7aa] text-amber-950 font-black uppercase text-[11px] tracking-wider divide-x divide-amber-300/80 border-b-2 border-amber-400">
                  <th className="py-2.5 px-2 w-14">SL NO</th>
                  <th className="py-2.5 px-3 w-28">BOOKING</th>
                  <th className="py-2.5 px-3 w-28">JOURNEY DT</th>
                  <th className="py-2.5 px-2.5 w-24">Total Run Km</th>
                  <th className="py-2.5 px-2 w-20">Per/Km</th>
                  <th className="py-2.5 px-3 w-28">State</th>
                  <th className="py-2.5 px-2 w-16">Tp</th>
                  <th className="py-2.5 px-2 w-20">BATA</th>
                  <th className="py-2.5 px-2 w-20">Toll Exp</th>
                  <th className="py-2.5 px-2.5 w-24">Car Type</th>
                  <th className="py-2.5 px-2.5 w-24">CAR</th>
                  <th className="py-2.5 px-3 w-32">Car No</th>
                  <th className="py-2.5 px-3 w-28">Driver</th>
                  <th className="py-2.5 px-3 w-28">Dr Ph No</th>
                  <th className="py-2.5 px-2.5 w-20">DUE</th>
                  <th className="py-2.5 px-3 w-28">SETTLLED Dt</th>
                  <th className="py-2.5 px-3 w-28">TOTAL COST</th>
                  <th className="py-2.5 px-2.5 w-24">REMAINING</th>
                  <th className="py-2.5 px-3 w-32">PH /G PAY NO</th>
                  <th className="py-2.5 px-4">PAX NAME</th>
                  <th className="py-2.5 px-3 w-28">PH NO</th>
                  <th className="py-2.5 px-3 w-24 bg-amber-400/80 text-amber-950">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={22}
                      className="py-12 text-center text-slate-500 font-semibold bg-slate-50/50"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Compass className="w-8 h-8 text-amber-500" />
                        <p className="text-sm">No car package trip records found.</p>
                        <button
                          type="button"
                          onClick={handleRestoreDefaults}
                          className="mt-1 text-xs font-bold text-amber-700 underline hover:text-amber-800 cursor-pointer"
                        >
                          Restore default package trips records
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/70 transition-colors divide-x divide-slate-200 group"
                    >
                      {/* SL NO */}
                      <td className="py-2 px-2 font-bold text-slate-700 bg-slate-50">
                        {item.slNo}
                      </td>

                      {/* BOOKING */}
                      <td className="py-2 px-3 font-extrabold text-[#063f2d] uppercase">
                        {item.booking}
                      </td>

                      {/* JOURNEY DT */}
                      <td className="py-2 px-3 font-semibold text-slate-700">
                        {item.journeyDt}
                      </td>

                      {/* Total Run Km */}
                      <td className="py-2 px-2.5 font-bold text-blue-700 bg-blue-50/40">
                        {item.totalRunKm} km
                      </td>

                      {/* Per/Km */}
                      <td className="py-2 px-2 font-bold text-slate-700">
                        ₹{item.perKm}
                      </td>

                      {/* State */}
                      <td className="py-2 px-3 font-bold text-slate-800 uppercase">
                        {item.state}
                      </td>

                      {/* Tp */}
                      <td className="py-2 px-2 font-semibold text-slate-600">
                        {item.tp}
                      </td>

                      {/* BATA */}
                      <td className="py-2 px-2 font-bold text-purple-700 bg-purple-50/40">
                        ₹{item.bata}
                      </td>

                      {/* Toll Exp */}
                      <td className="py-2 px-2 font-semibold text-slate-600">
                        {item.tollExp}
                      </td>

                      {/* Car Type */}
                      <td className="py-2 px-2.5 font-bold uppercase text-slate-700">
                        {item.carType}
                      </td>

                      {/* CAR */}
                      <td className="py-2 px-2.5 font-extrabold uppercase text-[#064e3b]">
                        {item.car}
                      </td>

                      {/* Car No */}
                      <td className="py-2 px-3 font-extrabold uppercase tracking-wide text-slate-800 whitespace-nowrap">
                        {item.carNo}
                      </td>

                      {/* Driver */}
                      <td className="py-2 px-3 font-extrabold uppercase text-[#064e3b] bg-emerald-50/50">
                        {item.driver}
                      </td>

                      {/* Dr Ph No */}
                      <td className="py-2 px-3 font-semibold text-slate-700 tracking-wide">
                        {item.drPhNo}
                      </td>

                      {/* DUE */}
                      <td className={`py-2 px-2.5 font-bold ${item.due > 0 ? "text-amber-700 bg-amber-50/50" : "text-slate-600"}`}>
                        {item.due}
                      </td>

                      {/* SETTLLED Dt */}
                      <td className="py-2 px-3 font-semibold text-slate-700">
                        {item.settledDt}
                      </td>

                      {/* TOTAL COST */}
                      <td className="py-2 px-3 font-black text-emerald-800 bg-emerald-100/50">
                        ₹{item.totalCost.toLocaleString("en-IN")}
                      </td>

                      {/* REMAINING */}
                      <td className={`py-2 px-2.5 font-bold ${item.remaining > 0 ? "text-rose-700 bg-rose-50" : "text-slate-600"}`}>
                        {item.remaining}
                      </td>

                      {/* PH /G PAY NO */}
                      <td className="py-2 px-3 font-semibold text-slate-700 tracking-wide">
                        {item.phGpayNo}
                      </td>

                      {/* PAX NAME */}
                      <td className="py-2 px-4 text-left font-bold uppercase text-slate-800">
                        {item.paxName || "—"}
                      </td>

                      {/* PH NO */}
                      <td className="py-2 px-3 font-semibold text-slate-700 tracking-wide">
                        {item.phNo || "—"}
                      </td>

                      {/* ACTION */}
                      <td className="py-2 px-2.5 bg-slate-50">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded bg-slate-200 hover:bg-amber-600 hover:text-white text-slate-700 transition cursor-pointer"
                            title={`Edit row #${item.slNo}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteRecord(item.id, item.slNo, item.booking)
                            }
                            className="p-1 rounded bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 transition cursor-pointer"
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

              {/* Total Summary Footer */}
              {filteredRecords.length > 0 && (
                <tfoot>
                  <tr className="bg-amber-50 font-black text-slate-900 border-t-2 border-amber-300 divide-x divide-amber-200">
                    <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-[11px] text-slate-600">
                      TOTAL SUMMARY:
                    </td>
                    <td className="py-3 px-2.5 text-blue-800 font-extrabold text-xs">
                      {totals.km.toLocaleString()} km
                    </td>
                    <td className="py-3 px-2 text-slate-500">—</td>
                    <td className="py-3 px-3 text-slate-500">—</td>
                    <td className="py-3 px-2 text-slate-500">—</td>
                    <td className="py-3 px-2 text-purple-800 font-extrabold text-xs">
                      ₹{totals.bata.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-2 text-slate-700 font-bold text-xs">
                      ₹{totals.toll.toLocaleString("en-IN")}
                    </td>
                    <td colSpan={5} className="py-3 px-3 text-slate-500">—</td>
                    <td className="py-3 px-2.5 text-amber-700 font-extrabold text-xs">
                      ₹{totals.due.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-slate-500">—</td>
                    <td className="py-3 px-3 text-emerald-900 font-black text-sm bg-emerald-100/70">
                      ₹{totals.cost.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-2.5 text-rose-700 font-extrabold text-xs">
                      ₹{totals.remaining.toLocaleString("en-IN")}
                    </td>
                    <td colSpan={4} className="py-3 px-3 text-left text-[11px] text-slate-600 font-medium">
                      {filteredRecords.length} Packages Trips Logged
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

      {/* Edit / Add Modal Form */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isNewEntry
                      ? "Add New Car Package Trip Entry"
                      : `Edit Package Trip #${editingRecord.slNo} (${editingRecord.booking})`}
                  </h3>
                  <p className="text-[11px] text-amber-100">
                    Fortune Tourism Packages &amp; Outstation Trip Record
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

            {/* Form Fields */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Row 1: SL NO, BOOKING, JOURNEY DT, STATE */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SL NO</label>
                  <input
                    type="number"
                    value={editingRecord.slNo}
                    onChange={(e) =>
                      updateEditingField("slNo", Number(e.target.value) || 1)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-slate-50 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">BOOKING ID</label>
                  <input
                    type="text"
                    value={editingRecord.booking}
                    onChange={(e) =>
                      updateEditingField("booking", e.target.value.toUpperCase())
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">JOURNEY DT</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={editingRecord.journeyDt}
                    onChange={(e) =>
                      updateEditingField("journeyDt", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">STATE</label>
                  <input
                    type="text"
                    placeholder="e.g. KARNATAKA"
                    value={editingRecord.state}
                    onChange={(e) =>
                      updateEditingField("state", e.target.value.toUpperCase())
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 2: RUN KM, PER KM, BATA, TOLL, TP */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                <div>
                  <label className="block font-bold text-amber-900 mb-1">TOTAL RUN KM</label>
                  <input
                    type="number"
                    value={editingRecord.totalRunKm}
                    onChange={(e) =>
                      updateEditingField("totalRunKm", Number(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 font-bold text-blue-700 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1">PER/KM (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.perKm}
                    onChange={(e) =>
                      updateEditingField("perKm", Number(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 font-bold bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1">BATA (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.bata}
                    onChange={(e) =>
                      updateEditingField("bata", Number(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 font-bold text-purple-700 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1">TOLL EXP (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.tollExp}
                    onChange={(e) =>
                      updateEditingField("tollExp", Number(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 font-semibold bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1">TP / PERMIT (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.tp}
                    onChange={(e) =>
                      updateEditingField("tp", Number(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 font-semibold bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 3: CAR TYPE, CAR MODEL, CAR NO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CAR TYPE</label>
                  <input
                    type="text"
                    placeholder="e.g. SUV, SEDAN, MUV, TEMPO"
                    value={editingRecord.carType}
                    onChange={(e) =>
                      updateEditingField("carType", e.target.value.toUpperCase())
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CAR MODEL</label>
                  <input
                    type="text"
                    placeholder="e.g. INNOVA, DZIRE, ERTIGA"
                    value={editingRecord.car}
                    onChange={(e) =>
                      updateEditingField("car", e.target.value.toUpperCase())
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CAR NO (REGISTRATION)</label>
                  <input
                    type="text"
                    placeholder="e.g. KA 51 AC 6052"
                    value={editingRecord.carNo}
                    onChange={(e) =>
                      updateEditingField("carNo", e.target.value.toUpperCase())
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 4: DRIVER, DRIVER PH NO, PH/GPAY NO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">DRIVER NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. ZAMEER, TAVDE"
                    value={editingRecord.driver}
                    onChange={(e) =>
                      updateEditingField("driver", e.target.value.toUpperCase())
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">DRIVER PHONE NO</label>
                  <input
                    type="text"
                    placeholder="e.g. 9740463404 / 9964600247"
                    value={editingRecord.drPhNo}
                    onChange={(e) =>
                      updateEditingField("drPhNo", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold tracking-wide focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PH / GPAY NO</label>
                  <input
                    type="text"
                    placeholder="e.g. 9740463404 / 9964600247"
                    value={editingRecord.phGpayNo}
                    onChange={(e) =>
                      updateEditingField("phGpayNo", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold tracking-wide focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 5: DUE, SETTLED DT, TOTAL COST, REMAINING */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-amber-800 mb-1">DUE (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.due}
                    onChange={(e) =>
                      updateEditingField("due", Number(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SETTLED DT</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={editingRecord.settledDt}
                    onChange={(e) =>
                      updateEditingField("settledDt", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">TOTAL COST (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.totalCost}
                    onChange={(e) =>
                      updateEditingField("totalCost", Number(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-black text-emerald-800 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-800 mb-1">REMAINING (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.remaining}
                    onChange={(e) =>
                      updateEditingField("remaining", Number(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-rose-700 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Row 6: PAX NAME & PAX PH NO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PAX (PASSENGER) NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. ROHIT SHARMA"
                    value={editingRecord.paxName}
                    onChange={(e) =>
                      updateEditingField("paxName", e.target.value.toUpperCase())
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PAX PHONE NUMBER</label>
                  <input
                    type="text"
                    placeholder="e.g. 9964600247 / 9740463404"
                    value={editingRecord.phNo}
                    onChange={(e) =>
                      updateEditingField("phNo", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold tracking-wide focus:ring-2 focus:ring-amber-500 outline-none"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Trip Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
