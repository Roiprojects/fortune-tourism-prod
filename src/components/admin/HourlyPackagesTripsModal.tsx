import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  X,
  Clock,
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
  ShieldCheck,
  MapPin,
  User,
  FileSpreadsheet,
  Building,
  Ticket,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import logoAsset from "@/assets/fortune-tourism-logo.png";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";
import { buildWhatsAppUrl } from "@/lib/contact";

export interface HourlyPackageTripRecord {
  id: string;
  monthGroup: string; // e.g. "1/1/2026", "1/2/2026", "1/3/2026"
  slNo: number;
  date: string; // e.g. "26/01/2026"
  paxName: string; // e.g. "Dr.ARUN DEBNATH"
  phNumber: string; // e.g. "8638983526"
  from: string; // e.g. "BOMMASANDRA"
  to: string; // e.g. "BALAGERE UP & DOWN"
  hours: string; // e.g. "4 Hr's", "8 Hr's"
  car: string; // e.g. "XYLO", "DZIRE"
  driver: string; // e.g. "ZAMEER", "TAVDE"
  drPhNo: string; // e.g. "9740463404"
  taxiNo: string; // e.g. "KA 51 AC 6052"
  toll: string; // e.g. "NO", "EXTRA", "100"
  boarding: string; // e.g. "N YATRI", "GOVT SCHOOL", "DWLL INN"
  amount?: number;
  paymentStatus?: "Paid" | "Advance Paid" | "Pending" | "Due" | string;
}

// Exactly matching the data from the user's uploaded Excel sheet "HOURLY PACKAGES TOURS"
export const INITIAL_HOURLY_PACKAGES_RECORDS: HourlyPackageTripRecord[] = [
  // January 2026 (1/1/2026)
  {
    id: "HPT-1",
    monthGroup: "1/1/2026",
    slNo: 1,
    date: "26/01/2026",
    paxName: "Dr.ARUN DEBNATH",
    phNumber: "8638983526",
    from: "BOMMASANDRA",
    to: "BALAGERE UP & DOWN",
    hours: "4 Hr's",
    car: "XYLO",
    driver: "ZAMEER",
    drPhNo: "9740463404",
    taxiNo: "KA 51 AC 6052",
    toll: "NO",
    boarding: "N YATRI",
    amount: 1800,
    paymentStatus: "Paid",
  },
  {
    id: "HPT-2",
    monthGroup: "1/1/2026",
    slNo: 2,
    date: "31/01/2026",
    paxName: "BHATRU OBBAT",
    phNumber: "8784007082",
    from: "BOMMASANDRA",
    to: "MEJESTIC UP & DOWN",
    hours: "8 Hr's",
    car: "DZIRE",
    driver: "TAVDE",
    drPhNo: "8861306201",
    taxiNo: "KA 01 AN 9582",
    toll: "EXTRA",
    boarding: "GOVT SCHOOL",
    amount: 2400,
    paymentStatus: "Paid",
  },

  // March 2026 (1/3/2026)
  {
    id: "HPT-3",
    monthGroup: "1/3/2026",
    slNo: 1,
    date: "4/3/2026",
    paxName: "BIKASH MONDAL",
    phNumber: "9434412350",
    from: "BOMMASANDRA",
    to: "SEEGE HALLI UP & DOWN",
    hours: "8 Hr's",
    car: "XYLO",
    driver: "ZAMEER",
    drPhNo: "9740463404",
    taxiNo: "KA 51 AC 6052",
    toll: "NO",
    boarding: "N YATHRI",
    amount: 2800,
    paymentStatus: "Paid",
  },
  {
    id: "HPT-4",
    monthGroup: "1/3/2026",
    slNo: 2,
    date: "15/03/2026",
    paxName: "BISHWANATH DEY SARKR",
    phNumber: "9123370734",
    from: "BOMMASANDRA",
    to: "BSS",
    hours: "8 Hr's",
    car: "XYLO",
    driver: "ZAMEER",
    drPhNo: "9740463404",
    taxiNo: "KA 51 AC 6052",
    toll: "NO",
    boarding: "DWLL INN",
    amount: 2800,
    paymentStatus: "Paid",
  },
  {
    id: "HPT-5",
    monthGroup: "1/3/2026",
    slNo: 3,
    date: "16/03/2026",
    paxName: "RANA KAKOTI",
    phNumber: "7002163539",
    from: "BOMMASANDRA",
    to: "HBR UP & DOWN",
    hours: "5 Hr's",
    car: "DZIRE",
    driver: "TAVDE",
    drPhNo: "8861306201",
    taxiNo: "KA 51 AC 6052",
    toll: "100",
    boarding: "N YATHRI",
    amount: 2000,
    paymentStatus: "Paid",
  },
  {
    id: "HPT-6",
    monthGroup: "1/3/2026",
    slNo: 4,
    date: "24/03/2026",
    paxName: "GUEST",
    phNumber: "9546047703",
    from: "BOMMASANDRA",
    to: "DODDATOGUR U & D",
    hours: "4 Hr's",
    car: "XYLO",
    driver: "ZAMEER",
    drPhNo: "9740463404",
    taxiNo: "KA 51 AC 6052",
    toll: "NO",
    boarding: "N YATHRI",
    amount: 1800,
    paymentStatus: "Paid",
  },
  {
    id: "HPT-7",
    monthGroup: "1/3/2026",
    slNo: 5,
    date: "26/03/2026",
    paxName: "SISIR PATNAIK",
    phNumber: "7008804676",
    from: "BOMMASANDRA",
    to: "BSS",
    hours: "10 Hr's",
    car: "XYLO",
    driver: "ZAMEER",
    drPhNo: "9740463404",
    taxiNo: "KA 51 AC 6052",
    toll: "NO",
    boarding: "N YATHRI",
    amount: 3200,
    paymentStatus: "Paid",
  },
];

const STORAGE_KEY = "fortune_hourly_packages_trips_data";

interface HourlyPackagesTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HourlyPackagesTripsModal({
  isOpen,
  onClose,
}: HourlyPackagesTripsModalProps) {
  const [records, setRecords] = useState<HourlyPackageTripRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading saved hourly trips:", e);
    }
    return INITIAL_HOURLY_PACKAGES_RECORDS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState("ALL");
  const [selectedDriverFilter, setSelectedDriverFilter] = useState("ALL");
  const [selectedCarFilter, setSelectedCarFilter] = useState("ALL");
  const [selectedDurationFilter, setSelectedDurationFilter] = useState("ALL");

  // Edit / Add modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HourlyPackageTripRecord | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  // Ticket Copy Modal state
  const [ticketRecord, setTicketRecord] = useState<HourlyPackageTripRecord | null>(null);

  // Sync to localStorage
  const saveToStorage = (data: HourlyPackageTripRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving hourly package trips:", e);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (ticketRecord) {
          setTicketRecord(null);
        } else if (isEditModalOpen) {
          setIsEditModalOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isEditModalOpen, ticketRecord, onClose]);

  // Download PDF handler for ticket copy
  const handleDownloadTicketPDF = (rec: HourlyPackageTripRecord) => {
    try {
      const fare = rec.amount || 2400;
      const ticketNo = `HPT-FT${rec.slNo.toString().padStart(4, "0")}`;
      const pnrNo = `HPT-FC${rec.slNo.toString().padStart(4, "0")}`;
      downloadTicketCopyPDF({
        ticketNumber: ticketNo,
        pnrNumber: pnrNo,
        bookingDate: rec.date,
        passengerName: rec.paxName || "GUEST",
        passengerPhone: rec.phNumber || "9964600247",
        tourType: "HOURLY PACKAGE TOUR",
        fromLocation: rec.from || "BOMMASANDRA",
        toLocation: rec.to || "BANGALORE LOCAL",
        departureOn: rec.date,
        tripType: `HOURLY PACKAGE (${(rec.hours || "8 Hr's").toUpperCase()})`,
        vehicleOrMode: `${rec.car || "CAB"} (Cab No: ${rec.taxiNo || "KA 51 AC 6052"})`,
        boardingPoint: rec.boarding || "BOMMASANDRA",
        boardingAddress: rec.from || "BOMMASANDRA",
        fareAmount: fare,
        paymentStatus: rec.paymentStatus || "Paid",
      });
      toast.success(`Official Ticket Copy PDF generated & downloaded for ${rec.paxName || "Tour #" + rec.slNo}`);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error(`Ticket generation failed: ${err.message}`);
    }
  };

  // Unique filter values
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.monthGroup?.trim()) set.add(r.monthGroup.trim());
    });
    return Array.from(set);
  }, [records]);

  const uniqueDrivers = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.driver?.trim()) set.add(r.driver.trim());
    });
    return Array.from(set);
  }, [records]);

  const uniqueCars = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.car?.trim()) set.add(r.car.trim());
    });
    return Array.from(set);
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedMonthFilter !== "ALL" && r.monthGroup !== selectedMonthFilter) {
        return false;
      }
      if (selectedDriverFilter !== "ALL" && r.driver !== selectedDriverFilter) {
        return false;
      }
      if (selectedCarFilter !== "ALL" && r.car !== selectedCarFilter) {
        return false;
      }
      if (selectedDurationFilter !== "ALL") {
        const durDigits = selectedDurationFilter.replace(/\D/g, "");
        if (durDigits && !r.hours.includes(durDigits)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.paxName.toLowerCase().includes(q) ||
          r.phNumber.toLowerCase().includes(q) ||
          r.from.toLowerCase().includes(q) ||
          r.to.toLowerCase().includes(q) ||
          r.hours.toLowerCase().includes(q) ||
          r.car.toLowerCase().includes(q) ||
          r.driver.toLowerCase().includes(q) ||
          r.drPhNo.toLowerCase().includes(q) ||
          r.taxiNo.toLowerCase().includes(q) ||
          r.boarding.toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [records, selectedMonthFilter, selectedDriverFilter, selectedCarFilter, selectedDurationFilter, searchQuery]);

  // Group records by Month Group for display matching the sheet structure
  const groupedByMonth = useMemo(() => {
    const map = new Map<string, HourlyPackageTripRecord[]>();
    filteredRecords.forEach((r) => {
      const g = r.monthGroup || "Other";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(r);
    });
    return Array.from(map.entries());
  }, [filteredRecords]);

  // Open Edit
  const handleOpenEdit = (record: HourlyPackageTripRecord) => {
    setEditingRecord({ ...record });
    setIsNewEntry(false);
    setIsEditModalOpen(true);
  };

  // Open Add New
  const handleOpenNewEntry = () => {
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}/${today.getFullYear()}`;
    const curMonthGroup = `1/${today.getMonth() + 1}/${today.getFullYear()}`;
    const nextSl =
      records.filter((r) => r.monthGroup === curMonthGroup).length + 1 || 1;

    setEditingRecord({
      id: `HPT-${Date.now()}`,
      monthGroup: curMonthGroup,
      slNo: nextSl,
      date: dateStr,
      paxName: "",
      phNumber: "",
      from: "BOMMASANDRA",
      to: "BALAGERE UP & DOWN",
      hours: "8 Hr's",
      car: "XYLO",
      driver: "ZAMEER",
      drPhNo: "9740463404",
      taxiNo: "KA 51 AC 6052",
      toll: "NO",
      boarding: "N YATRI",
      amount: 2800,
      paymentStatus: "Paid",
    });
    setIsNewEntry(true);
    setIsEditModalOpen(true);
  };

  // Save Record
  const handleSaveRecord = () => {
    if (!editingRecord) return;
    if (!editingRecord.paxName.trim()) {
      toast.error("Please enter a Passenger (Pax) Name");
      return;
    }

    let updatedList: HourlyPackageTripRecord[];
    if (isNewEntry) {
      updatedList = [...records, editingRecord];
      toast.success(`Added Hourly Tour #${editingRecord.slNo} (${editingRecord.paxName})`);
    } else {
      updatedList = records.map((r) =>
        r.id === editingRecord.id ? editingRecord : r
      );
      toast.success(`Updated Hourly Tour #${editingRecord.slNo}`);
    }

    setRecords(updatedList);
    saveToStorage(updatedList);
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  // Delete Record
  const handleDeleteRecord = (id: string, slNo: number, paxName: string) => {
    if (window.confirm(`Are you sure you want to delete Hourly Tour #${slNo} (${paxName})?`)) {
      const updatedList = records.filter((r) => r.id !== id);
      setRecords(updatedList);
      saveToStorage(updatedList);
      toast.success(`Deleted Tour Entry #${slNo}`);
    }
  };

  // Restore Defaults
  const handleRestoreDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to restore original Hourly Packages Tours records from the image?"
      )
    ) {
      setRecords(INITIAL_HOURLY_PACKAGES_RECORDS);
      saveToStorage(INITIAL_HOURLY_PACKAGES_RECORDS);
      toast.success("Restored original Hourly Packages data!");
    }
  };

  // Clear All
  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL Hourly Package Tour records? This will clear the table."
      )
    ) {
      setRecords([]);
      saveToStorage([]);
      toast.success("All hourly packages tours records cleared.");
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const rowsForExcel = filteredRecords.map((r) => ({
        "MONTH GROUP": r.monthGroup,
        "SL NO": r.slNo,
        DATE: r.date,
        "PAX NAME": r.paxName,
        "PH NUMBER": r.phNumber,
        FROM: r.from,
        TO: r.to,
        "HOUR'S": r.hours,
        CAR: r.car,
        DRIVER: r.driver,
        "DR PH NO": r.drPhNo,
        "TAXI NO": r.taxiNo,
        TOLL: r.toll,
        BOARDING: r.boarding,
        "AMOUNT (₹)": r.amount || 0,
        "PAYMENT STATUS": r.paymentStatus || "Paid",
      }));

      const ws = XLSX.utils.json_to_sheet(rowsForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Hourly Packages Tours");

      const todayStr = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `fortune_tourism_hourly_packages_${todayStr}.xlsx`);
      toast.success("Hourly Packages exported to Excel (.xlsx) successfully!");
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
        {/* Top Header Banner */}
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
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Hourly Packages Tours
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                City Rentals, 4 Hr / 8 Hr / 10 Hr Tour Packages &amp; Driver Boarding Log
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
              <span>Add Hourly Tour</span>
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
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Tours: <strong className="text-slate-900">{filteredRecords.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Months: <strong className="text-slate-900">{groupedByMonth.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Car className="w-3.5 h-3.5 text-purple-600" />
              <span>Cabs In Duty: <strong className="text-slate-900">{uniqueCars.length}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 font-semibold">
            <span className="bg-emerald-100/80 text-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-300">
              ⚡ Signature Packages: 4 Hr&apos;s, 5 Hr&apos;s, 8 Hr&apos;s, 10 Hr&apos;s
            </span>
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
                placeholder="Search pax, phone, route, driver, boarding..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            {/* Filter by Month */}
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Month Periods</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

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

            {/* Filter by Duration (4 Hr's, 8 Hr's, 12 Hr's) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {["ALL", "4 Hr's", "8 Hr's", "12 Hr's"].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSelectedDurationFilter(dur)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-black transition cursor-pointer ${
                    selectedDurationFilter === dur
                      ? "bg-[#063f2d] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  {dur === "ALL" ? "All Hours" : dur}
                </button>
              ))}
            </div>
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
              title="Reset data back to original image sheet"
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

        {/* Excel Spreadsheet Table View */}
        <div className="flex-1 overflow-auto bg-white p-2 sm:p-4">
          <div className="border border-slate-400 rounded-lg shadow-sm overflow-hidden min-w-[1300px]">
            {/* Header Title matching the exact Excel title: HOURLY PACKAGES TOURS */}
            <div className="bg-white border-b-2 border-slate-300 py-3 text-center">
              <h1 className="text-xl sm:text-2xl font-black tracking-widest text-slate-900 font-serif uppercase">
                HOURLY PACKAGES TOURS
              </h1>
            </div>

            <table className="w-full border-collapse text-center text-xs">
              <thead>
                <tr className="bg-white text-slate-900 font-extrabold uppercase text-[11px] tracking-wider divide-x divide-slate-300 border-b-2 border-slate-400">
                  <th className="py-2.5 px-2 w-14">SL NO</th>
                  <th className="py-2.5 px-3 w-28">DATE</th>
                  <th className="py-2.5 px-4 text-left">PAX NAME</th>
                  <th className="py-2.5 px-3 w-32">PH NUMBER</th>
                  <th className="py-2.5 px-3 text-left">FROM</th>
                  <th className="py-2.5 px-4 text-left">TO</th>
                  <th className="py-2.5 px-3 w-24">HOUR&apos;S</th>
                  <th className="py-2.5 px-2.5 w-20">CAR</th>
                  <th className="py-2.5 px-3 w-28">DRIVER</th>
                  <th className="py-2.5 px-3 w-28">DR PH NO</th>
                  <th className="py-2.5 px-3 w-32">TAXI NO</th>
                  <th className="py-2.5 px-2 w-16">TOLL</th>
                  <th className="py-2.5 px-3 text-left">BOARDING</th>
                  <th className="py-2.5 px-3 w-28 text-right bg-slate-50 text-slate-800">AMOUNT / STATUS</th>
                  <th className="py-2.5 px-3 w-36 bg-slate-100 text-slate-700">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
                {groupedByMonth.length === 0 ? (
                  <tr>
                    <td
                      colSpan={15}
                      className="py-12 text-center text-slate-500 font-semibold bg-slate-50/50"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Clock className="w-8 h-8 text-slate-400" />
                        <p className="text-sm">No hourly packages tours found.</p>
                        <button
                          type="button"
                          onClick={handleRestoreDefaults}
                          className="mt-1 text-xs font-bold text-emerald-700 underline hover:text-emerald-800 cursor-pointer"
                        >
                          Restore default 7 tours from image
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  groupedByMonth.map(([month, monthItems]) => (
                    <React.Fragment key={month}>
                      {/* Yellow Section Divider Bar matching Excel Image */}
                      <tr className="bg-[#ffff00] border-y-2 border-slate-400 font-black text-slate-950">
                        <td colSpan={15} className="py-1.5 px-4 text-left text-xs uppercase tracking-wide">
                          <span className="font-extrabold mr-3">{month}</span>
                          <span className="text-[11px] font-semibold text-slate-800">
                            ({monthItems.length} Bookings)
                          </span>
                        </td>
                      </tr>

                      {/* Month's Tour Rows */}
                      {monthItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-amber-50/60 transition-colors divide-x divide-slate-300 group"
                        >
                          {/* SL NO */}
                          <td className="py-2 px-2 font-bold text-slate-700 bg-slate-50">
                            {item.slNo}
                          </td>

                          {/* DATE */}
                          <td className="py-2 px-3 font-semibold text-slate-800 whitespace-nowrap">
                            {item.date}
                          </td>

                          {/* PAX NAME */}
                          <td className="py-2 px-4 text-left font-bold uppercase text-slate-900">
                            {item.paxName}
                          </td>

                          {/* PH NUMBER */}
                          <td className="py-2 px-3 font-semibold text-slate-700 tracking-wide">
                            {item.phNumber}
                          </td>

                          {/* FROM */}
                          <td className="py-2 px-3 text-left font-bold uppercase text-slate-800">
                            {item.from}
                          </td>

                          {/* TO */}
                          <td className="py-2 px-4 text-left font-bold uppercase text-slate-800">
                            {item.to}
                          </td>

                          {/* HOUR'S (Signature Light Green Cell in Image) */}
                          <td className="py-2 px-3 font-extrabold text-[#064e3b] bg-[#a6d862]/40 whitespace-nowrap">
                            {item.hours}
                          </td>

                          {/* CAR */}
                          <td className="py-2 px-2.5 font-bold uppercase text-slate-800">
                            {item.car}
                          </td>

                          {/* DRIVER */}
                          <td className="py-2 px-3 font-extrabold uppercase text-[#063f2d]">
                            {item.driver}
                          </td>

                          {/* DR PH NO */}
                          <td className="py-2 px-3 font-semibold text-slate-700 tracking-wide">
                            {item.drPhNo}
                          </td>

                          {/* TAXI NO */}
                          <td className="py-2 px-3 font-extrabold uppercase text-slate-800 tracking-wide whitespace-nowrap">
                            {item.taxiNo}
                          </td>

                          {/* TOLL */}
                          <td className="py-2 px-2 font-bold text-slate-700 uppercase">
                            {item.toll}
                          </td>

                          {/* BOARDING */}
                          <td className="py-2 px-3 text-left font-semibold uppercase text-slate-800">
                            {item.boarding}
                          </td>

                          {/* AMOUNT / STATUS */}
                          <td className="py-2 px-3 text-right bg-slate-50/50 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-xs">
                              {item.amount ? `₹${Number(item.amount).toLocaleString("en-IN")}` : "—"}
                            </div>
                            <span className={`inline-block text-[10px] font-black px-1.5 py-0.5 rounded uppercase mt-0.5 ${
                              (item.paymentStatus || "").toLowerCase() === "paid"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : (item.paymentStatus || "").toLowerCase().includes("advance")
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-slate-100 text-slate-700 border border-slate-300"
                            }`}>
                              {item.paymentStatus || "Paid"}
                            </span>
                          </td>

                          {/* ACTION */}
                          <td className="py-2 px-2.5 bg-slate-50">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setTicketRecord(item)}
                                className="p-1 rounded bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 transition shadow-2xs cursor-pointer"
                                title={`Generate & View Ticket Copy for Tour #${item.slNo} (${item.paxName})`}
                              >
                                <Ticket className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadTicketPDF(item)}
                                className="p-1 rounded bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-800 transition shadow-2xs cursor-pointer"
                                title={`Download Official PDF Ticket for Tour #${item.slNo}`}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1 rounded bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 transition cursor-pointer"
                                title={`Edit tour #${item.slNo}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteRecord(item.id, item.slNo, item.paxName)
                                }
                                className="p-1 rounded bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 transition cursor-pointer"
                                title={`Delete tour #${item.slNo}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}

                {/* Additional Yellow Separator for February / April No Bookings replica */}
                <tr className="bg-[#ffff00] border-y-2 border-slate-400 font-black text-slate-950">
                  <td colSpan={15} className="py-1.5 px-4 text-left text-xs uppercase tracking-wide">
                    <span className="font-extrabold mr-3">1/2/2026</span>
                    <span className="font-bold text-slate-900 mr-4">NO BOOKINGS</span>
                    <span className="text-slate-700">28/02/2026</span>
                  </td>
                </tr>
                <tr className="bg-[#ffff00] border-y-2 border-slate-400 font-black text-slate-950">
                  <td colSpan={15} className="py-1.5 px-4 text-left text-xs uppercase tracking-wide">
                    <span className="font-extrabold mr-3">1/4/2026</span>
                    <span className="font-bold text-slate-900">NO BOOKINGS</span>
                  </td>
                </tr>
              </tbody>
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
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Dialog Header */}
            <div className="bg-[#063f2d] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isNewEntry
                      ? "Add New Hourly Tour Entry"
                      : `Edit Hourly Tour #${editingRecord.slNo} (${editingRecord.paxName})`}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Fortune Tourism Hourly Packages Tours Record
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
              {/* Row 1: Month Group, SL NO, DATE, HOURS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MONTH PERIOD</label>
                  <input
                    type="text"
                    placeholder="e.g. 1/1/2026"
                    value={editingRecord.monthGroup}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, monthGroup: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
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
                  <label className="block font-bold text-[#064e3b] mb-1">HOUR&apos;S</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Hr's, 8 Hr's, 12 Hr's"
                    value={editingRecord.hours}
                    onChange={(e) => {
                      const val = e.target.value;
                      let autoAmt = editingRecord.amount;
                      const h = val.toLowerCase();
                      if (h.includes("4")) autoAmt = 1800;
                      else if (h.includes("8")) autoAmt = 2400;
                      else if (h.includes("12")) autoAmt = 3200;
                      else if (h.includes("5")) autoAmt = 2000;
                      else if (h.includes("10")) autoAmt = 2800;
                      setEditingRecord({ ...editingRecord, hours: val, amount: autoAmt });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 font-extrabold text-[#064e3b] bg-emerald-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Quick Package Selector: 4 Hr's, 8 Hr's, 12 Hr's (Auto-updates Full Fare) */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-extrabold text-[#064e3b] uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> SELECT HOURLY TOUR PACKAGE (AUTO FULL FARE UPDATE)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                    4h / 8h / 12h Packages
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "4 Hr's (40 Km)", hours: "4 Hr's", fare: 1800, desc: "City Quick Trip" },
                    { label: "8 Hr's (80 Km)", hours: "8 Hr's", fare: 2400, desc: "Full Day City Tour" },
                    { label: "12 Hr's (120 Km)", hours: "12 Hr's", fare: 3200, desc: "Extended Day Tour" },
                    { label: "5 Hr's (50 Km)", hours: "5 Hr's", fare: 2000, desc: "Midday Package" },
                  ].map((pkg) => {
                    const isSelected = editingRecord.hours.toLowerCase().includes(pkg.hours.toLowerCase().slice(0, 2));
                    return (
                      <button
                        key={pkg.hours}
                        type="button"
                        onClick={() => {
                          setEditingRecord({
                            ...editingRecord,
                            hours: pkg.hours,
                            amount: pkg.fare,
                          });
                        }}
                        className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-[#063f2d] text-white border-[#063f2d] shadow-sm font-bold"
                            : "bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                        }`}
                      >
                        <div className="font-extrabold text-xs">{pkg.label}</div>
                        <div className={`text-[11px] font-black ${isSelected ? "text-emerald-300" : "text-emerald-700"}`}>
                          ₹{pkg.fare.toLocaleString()} Full Fare
                        </div>
                        <div className={`text-[9.5px] ${isSelected ? "text-emerald-200" : "text-slate-500"}`}>
                          {pkg.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: PAX NAME & PH NUMBER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    PAX (PASSENGER) NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr.ARUN DEBNATH"
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
                    PASSENGER PH NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9964600247 / 9740463404"
                    value={editingRecord.phNumber}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, phNumber: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold tracking-wide focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 3: FROM & TO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">FROM LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. BOMMASANDRA"
                    value={editingRecord.from}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        from: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TO LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. BALAGERE UP & DOWN, MEJESTIC UP & DOWN"
                    value={editingRecord.to}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        to: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Row 4: CAR, DRIVER, DR PH NO, TAXI NO */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CAR</label>
                  <input
                    type="text"
                    placeholder="e.g. XYLO, DZIRE"
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
                <div>
                  <label className="block font-bold text-slate-700 mb-1">DRIVER</label>
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
                  <label className="block font-bold text-slate-700 mb-1">DR PH NO</label>
                  <input
                    type="text"
                    placeholder="e.g. 9740463404 / 9964600247"
                    value={editingRecord.drPhNo}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, drPhNo: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold tracking-wide focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TAXI NO</label>
                  <input
                    type="text"
                    placeholder="e.g. KA 51 AC 6052"
                    value={editingRecord.taxiNo}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        taxiNo: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 5: TOLL & BOARDING POINT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TOLL</label>
                  <input
                    type="text"
                    placeholder="e.g. NO, EXTRA, 100"
                    value={editingRecord.toll}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        toll: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">BOARDING POINT</label>
                  <input
                    type="text"
                    placeholder="e.g. N YATRI, GOVT SCHOOL, DWLL INN"
                    value={editingRecord.boarding}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        boarding: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 6: AMOUNT (FARE) & PAYMENT STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-emerald-900">AMOUNT / FULL FARE (₹)</label>
                    <span className="text-[10px] font-extrabold text-emerald-700">Auto-updated from Package</span>
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 1800, 2400, 3200"
                    value={editingRecord.amount !== undefined ? editingRecord.amount : ""}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 font-black text-emerald-950 text-base focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-bold text-slate-600">Quick Full Fares:</span>
                    {[
                      { l: "4h", v: 1800 },
                      { l: "5h", v: 2000 },
                      { l: "8h", v: 2400 },
                      { l: "10h", v: 2800 },
                      { l: "12h", v: 3200 },
                    ].map((item) => (
                      <button
                        key={item.v}
                        type="button"
                        onClick={() => setEditingRecord({ ...editingRecord, amount: item.v })}
                        className={`px-2 py-0.5 rounded text-[10.5px] font-extrabold border cursor-pointer ${
                          editingRecord.amount === item.v
                            ? "bg-[#063f2d] text-white border-[#063f2d]"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        ₹{item.v.toLocaleString()} ({item.l})
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-emerald-900 mb-1">PAYMENT STATUS</label>
                  <select
                    value={editingRecord.paymentStatus || "Paid"}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        paymentStatus: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white cursor-pointer"
                  >
                    <option value="Paid">Paid (100% Fully Settled)</option>
                    <option value="Advance Paid">Advance Paid (₹100 Locked)</option>
                    <option value="Pending">Pending (Pay on Boarding)</option>
                    <option value="Due">Due</option>
                  </select>
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
                <span>Save Tour Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Ticket Copy Voucher Modal */}
      {ticketRecord && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .hourly-ticket-copy-print-area, .hourly-ticket-copy-print-area * {
                visibility: visible !important;
              }
              .hourly-ticket-copy-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                box-shadow: none !important;
                border: 2px solid #000 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border-2 border-slate-900 overflow-hidden flex flex-col my-auto max-h-[95vh]">
            {/* Top Modal Controls (No Print) */}
            <div className="no-print bg-[#0B132B] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    Official Ticket Copy
                    <span className="font-mono text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-black">
                      HPT-FT{ticketRecord.slNo.toString().padStart(4, "0")}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Hourly Package Tour #{ticketRecord.slNo} · {ticketRecord.paxName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTicketPDF(ticketRecord)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00c58e] hover:bg-[#00a87a] text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 shadow transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" /> Print
                </button>
                <a
                  href={buildWhatsAppUrl(
                    `Hello Fortune Tourism! New Hourly Package Tour reservation confirmed.\n\n*Ticket No:* HPT-FT${ticketRecord.slNo.toString().padStart(4, "0")}\n*PNR:* HPT-FC${ticketRecord.slNo.toString().padStart(4, "0")}\n*Passenger:* ${ticketRecord.paxName}\n*Phone:* ${ticketRecord.phNumber}\n*Package:* ${ticketRecord.hours}\n*Route:* ${ticketRecord.from} to ${ticketRecord.to}\n*Car:* ${ticketRecord.car} (${ticketRecord.taxiNo})\n*Driver:* ${ticketRecord.driver} (${ticketRecord.drPhNo})\n*Fare:* ₹${(ticketRecord.amount || 2400).toLocaleString("en-IN")}\n*Status:* ${ticketRecord.paymentStatus || "Paid"}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setTicketRecord(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Printable Ticket Voucher Area */}
            <div className="hourly-ticket-copy-print-area p-5 sm:p-6 overflow-y-auto space-y-4 bg-white text-slate-900">
              {/* Brand Header */}
              <div className="border-b-2 border-slate-900 pb-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-1">
                    <img
                      src="/images/packages/fortune-tourism-full-logo.png"
                      alt="FORTUNE Tourism"
                      className="h-8 sm:h-10 w-auto object-contain"
                    />
                    <div className="text-[11px] sm:text-xs font-bold text-slate-800">
                      Address: No.256/A next To Narayana Hospital, Health City, Bommasandra Bangalore.560099
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <div className="text-[11px] font-bold text-slate-900">
                      Phone No: +91 9740463404
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      BOOKING DATE &amp; TIME : <span className="font-extrabold text-slate-950">{ticketRecord.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Key Numbers */}
              <div className="space-y-1.5 text-slate-900 font-sans text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-slate-950 font-black tracking-wide text-base sm:text-lg">
                    Ticket Copy For Your Journey
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      TICKET NUMBER :
                      <strong className="font-mono font-black text-amber-700 text-sm sm:text-base tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                        HPT-FT{ticketRecord.slNo.toString().padStart(4, "0")}
                      </strong>
                    </span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      TOTAL FARE :
                      <strong className="font-mono font-black text-emerald-800 text-sm sm:text-base tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-400 shadow-2xs">
                        ₹{(ticketRecord.amount || 2400).toLocaleString("en-IN")}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Official 6-Row Spreadsheet Structure */}
              <div className="overflow-x-auto border-2 border-slate-900">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <tbody>
                    {/* Row 1: Passenger Name | Passenger Phone No | Tour Type */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-36 whitespace-nowrap">
                        Passenger Name:
                      </td>
                      <td className="p-2.5 font-black text-slate-900 uppercase">
                        {ticketRecord.paxName || "GUEST"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-40 whitespace-nowrap">
                        Passenger Phone No.:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {ticketRecord.phNumber || "9964600247"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-28 whitespace-nowrap">
                        Tour Type:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        HOURLY PACKAGE TOUR
                      </td>
                    </tr>

                    {/* Row 2: FROM | TO */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        FROM:
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                        {ticketRecord.from || "BOMMASANDRA"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        TO:
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                        {ticketRecord.to || "BANGALORE LOCAL"}
                      </td>
                    </tr>

                    {/* Row 3: Ticket Number | PNR Number | Departure On */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Ticket Number:
                      </td>
                      <td className="p-2.5 font-black font-mono text-amber-700 text-sm tracking-wider">
                        HPT-FT{ticketRecord.slNo.toString().padStart(4, "0")}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        PNR Number:
                      </td>
                      <td className="p-2.5 font-black font-mono text-slate-950 text-sm tracking-wider">
                        HPT-FC{ticketRecord.slNo.toString().padStart(4, "0")}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Departure Date:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {ticketRecord.date}
                      </td>
                    </tr>

                    {/* Row 4: Boarding Point | Boarding Address */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Boarding Point:
                      </td>
                      <td colSpan={2} className="p-2.5 font-bold text-slate-900 uppercase">
                        {ticketRecord.boarding || "BOMMASANDRA"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Boarding Address:
                      </td>
                      <td colSpan={2} className="p-2.5 font-bold text-slate-900">
                        {ticketRecord.from || "BOMMASANDRA"}
                      </td>
                    </tr>

                    {/* Row 5: Trip Type | Type Of Cab | Fare Amount */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Trip Type:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        HOURLY PACKAGE ({ticketRecord.hours.toUpperCase()})
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Type Of Cab:
                      </td>
                      <td className="p-2.5 font-black text-slate-900 uppercase">
                        {ticketRecord.car} ({ticketRecord.taxiNo})
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Package Full Fare:
                      </td>
                      <td className="p-2.5 font-black text-emerald-800 text-sm">
                        ₹{(ticketRecord.amount || 2400).toLocaleString("en-IN")}
                      </td>
                    </tr>

                    {/* Row 6: Driver Info | Total Fare Amount | Payment Status */}
                    <tr className="divide-x divide-slate-900 bg-emerald-50/50">
                      <td className="p-2.5 font-bold text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Driver &amp; Contact:
                      </td>
                      <td colSpan={2} className="p-2.5 font-bold text-slate-900">
                        {ticketRecord.driver} (Ph: {ticketRecord.drPhNo}) · Toll: {ticketRecord.toll}
                      </td>
                      <td className="p-2.5 font-black text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Total Fare Amount:
                      </td>
                      <td className="p-2.5 font-black text-emerald-800 text-sm sm:text-base">
                        ₹{(ticketRecord.amount || 2400).toLocaleString("en-IN")}
                        <span className="text-[10px] font-bold text-emerald-700 ml-1.5 block">
                          ({ticketRecord.hours} Full Package Fare)
                        </span>
                      </td>
                      <td className="p-2.5 font-black text-emerald-700 uppercase">
                        {ticketRecord.paymentStatus || "Paid"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms & Verification Bar */}
              <div className="border border-slate-300 rounded-xl p-3.5 text-[11px] text-slate-700 space-y-1.5 bg-slate-50/50">
                <div className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Terms &amp; Journey Instructions
                </div>
                <div className="space-y-0.5 text-slate-600 text-[10.5px]">
                  <div>1. Please carry this official Ticket Copy / SMS during your journey.</div>
                  <div>2. Hourly packages include standard fuel &amp; driver allowance for specified hours/kms. Extra km/hour charged at standard tariffs.</div>
                  <div>3. Helpline &amp; 24x7 Support: +91 9740463404 / 9964600247.</div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="no-print bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">
                Official Fortune Tourism Verified Passenger Voucher
              </span>
              <button
                type="button"
                onClick={() => setTicketRecord(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Ticket View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
