import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
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
  TrendingUp,
  ArrowDownLeft,
  Filter,
  ChevronDown,
  Upload,
  Download,
  FileSpreadsheet,
  FileCheck,
  AlertCircle,
  Eye,
  Check,
} from "lucide-react";
import {
  useExpenseReports,
  ExpenseReportItem,
  ExpenseCategoryType,
  computeExpenseItemTotal,
} from "@/lib/expense-reports";

interface ExpenseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseReportModal({ isOpen, onClose }: ExpenseReportModalProps) {
  const { items, add, remove, reset, save } = useExpenseReports();

  // Selected Category Dropdown Option
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryType>("all");

  // Filters
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"list" | "add_expense" | "add_inflow">("list");

  // Live booking inflows from database
  const [liveBookingInflows, setLiveBookingInflows] = useState<ExpenseReportItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // File Upload Ref for Excel Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [importedRows, setImportedRows] = useState<ExpenseReportItem[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");

  // Form State for Adding New Expense (Outflow)
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

  // Form State for Adding Cash Inflow (Collected Cash)
  const [inflowDateFrom, setInflowDateFrom] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [inflowDateTo, setInflowDateTo] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [inflowAmount, setInflowAmount] = useState<string>("");
  const [inflowCustomerName, setInflowCustomerName] = useState<string>("");
  const [inflowBookingNumber, setInflowBookingNumber] = useState<string>("");
  const [inflowReason, setInflowReason] = useState<string>("");
  const [inflowPaymentMethod, setInflowPaymentMethod] = useState<string>("Cash / Advance");

  // Fetch live bookings from Booking Page (/api/enquiries) on modal open
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function fetchBookingInflows() {
      setLoadingBookings(true);
      try {
        const res = await fetch("/api/enquiries?limit=100");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.enquiries)) {
          const mapped: ExpenseReportItem[] = data.enquiries.map((enq: any) => {
            let fare = 0;
            if (enq.notes) {
              const fareMatch = String(enq.notes).match(/Fare:\s*₹?\s*([\d,]+)/i);
              if (fareMatch && fareMatch[1]) {
                fare = Number(fareMatch[1].replace(/,/g, "")) || 0;
              }
            }
            if (fare <= 0) {
              fare = Number(enq.fare || enq.total_amount || 0);
            }
            if (fare <= 0) {
              fare = enq.service === "Taxi" || enq.service === "Cab" ? 3100 : (enq.service === "Hourly Package" || enq.trip_type === "HOURLY PACKAGE") ? 2400 : enq.service === "Tour" ? 12500 : 850;
            }

            const travelDate = enq.travel_date
              ? String(enq.travel_date).slice(0, 10)
              : enq.created_at
              ? String(enq.created_at).slice(0, 10)
              : new Date().toISOString().slice(0, 10);

            const tktMatch = String(enq.notes || "").match(/Ticket No:\s*([^\s|]+)/i);
            const ticketNo = tktMatch ? tktMatch[1] : enq.enquiry_number || `FT-${enq.id}`;

            return {
              id: `BOOK-${enq.id}`,
              entryType: "inflow" as const,
              dateFrom: travelDate,
              dateTo: travelDate,
              repairs: 0,
              miscellaneous: 0,
              credit: 0,
              supplierName: "",
              supplierAmount: 0,
              agencyName: "",
              agencyAmount: 0,
              driverName: "",
              driverAmount: 0,
              inflowAmount: fare,
              reason: `Collected Booking Cash — ${enq.name || "Guest"} (${enq.service || "Booking"}) ${enq.pickup || "BLR"} → ${enq.destination || "Drop"}`,
              source: "Booking Page",
              bookingNumber: ticketNo,
              customerName: enq.name || "Customer",
              customerPhone: enq.phone || "",
              paymentMethod: "Online / Counter Cash",
              createdAt: enq.created_at,
            };
          });

          if (!isCancelled) {
            setLiveBookingInflows(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load booking inflows:", err);
      } finally {
        if (!isCancelled) setLoadingBookings(false);
      }
    }

    fetchBookingInflows();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Combined records: saved custom expenses + live booking inflows
  const allCombinedRecords = useMemo(() => {
    const existingIds = new Set(items.map((it) => it.id));
    const newBookings = liveBookingInflows.filter((b) => !existingIds.has(b.id));
    return [...items, ...newBookings];
  }, [items, liveBookingInflows]);

  // Filter records by selected category dropdown, dates, and search query
  const filteredRecords = useMemo(() => {
    return allCombinedRecords.filter((item) => {
      // 1. Dropdown Category Filter
      if (selectedCategory === "inflow" && item.entryType !== "inflow") {
        return false;
      }
      if (selectedCategory === "repairs" && (!item.repairs || item.repairs <= 0)) {
        return false;
      }
      if (selectedCategory === "miscellaneous" && (!item.miscellaneous || item.miscellaneous <= 0)) {
        return false;
      }
      if (selectedCategory === "credit" && (!item.credit || item.credit <= 0)) {
        return false;
      }
      if (selectedCategory === "supplier" && !item.supplierName && (!item.supplierAmount || item.supplierAmount <= 0)) {
        return false;
      }
      if (selectedCategory === "agency" && !item.agencyName && (!item.agencyAmount || item.agencyAmount <= 0)) {
        return false;
      }
      if (selectedCategory === "drivers" && !item.driverName && (!item.driverAmount || item.driverAmount <= 0)) {
        return false;
      }

      // 2. Date From filter
      if (filterDateFrom && item.dateFrom < filterDateFrom && item.dateTo < filterDateFrom) {
        return false;
      }
      // 3. Date To filter
      if (filterDateTo && item.dateFrom > filterDateTo) {
        return false;
      }

      // 4. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchReason = (item.reason || "").toLowerCase().includes(q);
        const matchSupplier = (item.supplierName || "").toLowerCase().includes(q);
        const matchAgency = (item.agencyName || "").toLowerCase().includes(q);
        const matchDriver = (item.driverName || "").toLowerCase().includes(q);
        const matchCustomer = (item.customerName || "").toLowerCase().includes(q);
        const matchBooking = (item.bookingNumber || "").toLowerCase().includes(q);
        const matchMethod = (item.paymentMethod || "").toLowerCase().includes(q);
        if (!matchReason && !matchSupplier && !matchAgency && !matchDriver && !matchCustomer && !matchBooking && !matchMethod) {
          return false;
        }
      }
      return true;
    });
  }, [allCombinedRecords, selectedCategory, filterDateFrom, filterDateTo, searchQuery]);

  // Lifetime All-Time Financial Totals across all records
  const lifetimeTotals = useMemo(() => {
    let totalInflow = 0;
    let repairs = 0;
    let miscellaneous = 0;
    let credit = 0;
    let supplier = 0;
    let agency = 0;
    let drivers = 0;
    let totalOutflow = 0;

    allCombinedRecords.forEach((it) => {
      if (it.entryType === "inflow") {
        totalInflow += Number(it.inflowAmount || 0);
      } else {
        repairs += Number(it.repairs || 0);
        miscellaneous += Number(it.miscellaneous || 0);
        credit += Number(it.credit || 0);
        supplier += Number(it.supplierAmount || 0);
        agency += Number(it.agencyAmount || 0);
        drivers += Number(it.driverAmount || 0);
        totalOutflow += computeExpenseItemTotal(it);
      }
    });

    const netBalance = totalInflow - totalOutflow;

    return { totalInflow, repairs, miscellaneous, credit, supplier, agency, drivers, totalOutflow, netBalance };
  }, [allCombinedRecords]);

  // Aggregate Date-Wise / Filtered Financial Metrics (Dynamically calculates for selected date range & filters)
  const financialTotals = useMemo(() => {
    let totalInflow = 0;
    let repairs = 0;
    let miscellaneous = 0;
    let credit = 0;
    let supplier = 0;
    let agency = 0;
    let drivers = 0;
    let totalOutflow = 0;

    filteredRecords.forEach((it) => {
      if (it.entryType === "inflow") {
        totalInflow += Number(it.inflowAmount || 0);
      } else {
        repairs += Number(it.repairs || 0);
        miscellaneous += Number(it.miscellaneous || 0);
        credit += Number(it.credit || 0);
        supplier += Number(it.supplierAmount || 0);
        agency += Number(it.agencyAmount || 0);
        drivers += Number(it.driverAmount || 0);
        totalOutflow += computeExpenseItemTotal(it);
      }
    });

    const netBalance = totalInflow - totalOutflow;

    return { totalInflow, repairs, miscellaneous, credit, supplier, agency, drivers, totalOutflow, netBalance };
  }, [filteredRecords]);

  const isDateFiltered = Boolean(filterDateFrom || filterDateTo || searchQuery.trim() || selectedCategory !== "all");

  // =========================================================================
  // EXCEL IMPORT ENGINE
  // =========================================================================
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary", cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!data || data.length === 0) {
          toast.error("The selected Excel file is empty or contains no rows.");
          return;
        }

        // Parse and map rows flexibly
        const todayStr = new Date().toISOString().slice(0, 10);
        const parsed: ExpenseReportItem[] = [];

        data.forEach((row, index) => {
          // Normalize column keys
          const keys = Object.keys(row);
          const findVal = (matchers: string[]): any => {
            const foundKey = keys.find((k) => {
              const cleaned = k.trim().toLowerCase();
              return matchers.some((m) => cleaned === m || cleaned.includes(m));
            });
            return foundKey ? row[foundKey] : "";
          };

          // Extract values
          const rawDateFrom = findVal(["date from", "date", "trav on", "travel date", "booking date", "from date"]);
          const rawDateTo = findVal(["date to", "return date", "to date", "return"]);
          const rawCategory = String(findVal(["category", "type", "trav by", "travel by", "service"]) || "").toLowerCase();
          const rawPax = String(findVal(["pax", "passenger", "customer", "client", "name"]) || "");
          const rawPh = String(findVal(["ph no", "phone", "mobile", "contact"]) || "");
          const rawFrom = String(findVal(["from", "pickup", "pickup location"]) || "");
          const rawTo = String(findVal(["to", "destination", "drop"]) || "");
          const rawReason = String(findVal(["reason", "particulars", "description", "notes", "remarks", "note"]) || "");

          // Amounts
          const rawBooking = Number(findVal(["booking", "inflow", "booking cash", "income", "credit in", "advance", "off adv"])) || 0;
          const rawRepairs = Number(findVal(["repairs", "repair", "maintenance", "garage", "vehicle repair"])) || 0;
          const rawMisc = Number(findVal(["miscellaneous", "misc", "toll", "parking", "other"])) || 0;
          const rawCredit = Number(findVal(["credit", "credit clearance", "advance payout"])) || 0;
          const rawSupplierName = String(findVal(["supplier name", "supplier", "vendor", "fuel bunk"]) || "");
          const rawSupplierAmt = Number(findVal(["supplier amount", "supplier amt", "fuel amount", "petrol"])) || 0;
          const rawAgencyName = String(findVal(["agency name", "agency", "travels"]) || "");
          const rawAgencyAmt = Number(findVal(["agency amount", "agency amt", "commission"])) || 0;
          const rawDriverName = String(findVal(["driver name", "driver", "assigned driver"]) || "");
          const rawDriverAmt = Number(findVal(["driver amount", "driver amt", "driver bata", "bata"])) || 0;

          // Date formatting
          const formatDateVal = (v: any) => {
            if (!v) return todayStr;
            if (v instanceof Date) return v.toISOString().slice(0, 10);
            const str = String(v).trim();
            // Match DD/MM/YYYY or DD-MM-YYYY
            const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (m) {
              const d = m[1].padStart(2, "0");
              const mo = m[2].padStart(2, "0");
              const y = m[3];
              return `${y}-${mo}-${d}`;
            }
            if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
            return todayStr;
          };

          const dateFromVal = formatDateVal(rawDateFrom);
          const dateToVal = rawDateTo ? formatDateVal(rawDateTo) : dateFromVal;

          // Determine entryType
          const hasInflow = rawBooking > 0 || rawCategory.includes("inflow") || rawCategory.includes("booking");
          const hasOutflow = rawRepairs > 0 || rawMisc > 0 || rawCredit > 0 || rawSupplierAmt > 0 || rawAgencyAmt > 0 || rawDriverAmt > 0;

          let entryType: "inflow" | "outflow" = "outflow";
          if (hasInflow && !hasOutflow) {
            entryType = "inflow";
          } else if (hasInflow && hasOutflow) {
            entryType = "inflow";
          }

          // Build descriptive reason
          let finalReason = rawReason;
          if (!finalReason) {
            if (rawPax || rawFrom || rawTo) {
              finalReason = [
                rawPax && `Pax: ${rawPax}`,
                rawPh && `Ph: ${rawPh}`,
                rawFrom && rawTo ? `${rawFrom} → ${rawTo}` : rawFrom || rawTo,
                rawCategory && `(${rawCategory.toUpperCase()})`,
              ].filter(Boolean).join(" · ");
            } else {
              finalReason = `Excel Import #${index + 1} (${dateFromVal})`;
            }
          }

          parsed.push({
            id: `IMP-${Date.now().toString().slice(-4)}-${index + 1}`,
            entryType,
            dateFrom: dateFromVal,
            dateTo: dateToVal,
            repairs: rawRepairs,
            miscellaneous: rawMisc,
            credit: rawCredit,
            supplierName: rawSupplierName,
            supplierAmount: rawSupplierAmt,
            agencyName: rawAgencyName,
            agencyAmount: rawAgencyAmt,
            driverName: rawDriverName,
            driverAmount: rawDriverAmt,
            inflowAmount: rawBooking,
            reason: finalReason,
            customerName: rawPax,
            customerPhone: rawPh,
            source: "Excel Import",
            paymentMethod: "Imported",
            createdAt: new Date().toISOString(),
          });
        });

        if (parsed.length === 0) {
          toast.error("Could not parse any valid records from Excel file.");
          return;
        }

        setImportedRows(parsed);
        setImportPreviewOpen(true);
        toast.success(`Successfully parsed ${parsed.length} rows from ${file.name}`);
      } catch (err: any) {
        console.error("Excel parse error:", err);
        toast.error(`Error reading Excel file: ${err.message || "Unknown error"}`);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (importedRows.length === 0) return;

    if (importMode === "replace") {
      save(importedRows);
      toast.success(`Replaced current report with ${importedRows.length} imported Excel records!`);
    } else {
      // Append
      const merged = [...importedRows, ...items];
      save(merged);
      toast.success(`Appended ${importedRows.length} Excel records to Expense Report!`);
    }

    setImportPreviewOpen(false);
    setImportedRows([]);
    setActiveTab("list");
  };

  // =========================================================================
  // EXCEL EXPORT ENGINE
  // =========================================================================
  const handleExportToExcel = () => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const rowsForExcel = filteredRecords.map((item, idx) => {
        const isInflow = item.entryType === "inflow";
        const rowTotal = computeExpenseItemTotal(item);

        return {
          "SL": idx + 1,
          "ID": item.id,
          "TYPE": isInflow ? "INFLOW" : "EXPENSE OUTFLOW",
          "DATE FROM": item.dateFrom,
          "DATE TO": item.dateTo || item.dateFrom,
          "REASON / PARTICULARS": item.reason,
          "PASSENGER / CUSTOMER": item.customerName || "—",
          "PHONE NUMBER": item.customerPhone || "—",
          "BOOKING NO / REF": item.bookingNumber || "—",
          "INFLOW COLLECTED (₹)": isInflow ? item.inflowAmount : 0,
          "REPAIRS (₹)": item.repairs || 0,
          "MISCELLANEOUS (₹)": item.miscellaneous || 0,
          "CREDIT (₹)": item.credit || 0,
          "SUPPLIER NAME": item.supplierName || "—",
          "SUPPLIER AMOUNT (₹)": item.supplierAmount || 0,
          "AGENCY NAME": item.agencyName || "—",
          "AGENCY AMOUNT (₹)": item.agencyAmount || 0,
          "DRIVER NAME": item.driverName || "—",
          "DRIVER BATA (₹)": item.driverAmount || 0,
          "TOTAL (₹)": rowTotal,
          "PAYMENT METHOD": item.paymentMethod || "—",
          "SOURCE": item.source || "—",
        };
      });

      const ws = XLSX.utils.json_to_sheet(rowsForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expense & Inflow Report");

      XLSX.writeFile(wb, `fortune_tourism_expense_report_${todayStr}.xlsx`);
      toast.success("Expense Report downloaded as Excel (.xlsx) successfully!");
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(`Failed to export Excel: ${err.message}`);
    }
  };

  // Download Sample Template
  const handleDownloadSampleTemplate = () => {
    try {
      const sample = [
        {
          "DATE FROM": "2026-10-01",
          "DATE TO": "2026-10-01",
          "TYPE": "INFLOW",
          "PAX": "Ramesh Kumar",
          "PHONE": "9845012345",
          "REASON / PARTICULARS": "Advance cash collected for Ooty Tour Package",
          "BOOKING CASH (₹)": 14500,
          "REPAIRS (₹)": 0,
          "MISCELLANEOUS (₹)": 0,
          "CREDIT (₹)": 0,
          "SUPPLIER NAME": "",
          "SUPPLIER AMOUNT (₹)": 0,
          "AGENCY NAME": "",
          "AGENCY AMOUNT (₹)": 0,
          "DRIVER NAME": "",
          "DRIVER BATA (₹)": 0,
          "PAYMENT METHOD": "Cash",
        },
        {
          "DATE FROM": "2026-10-02",
          "DATE TO": "2026-10-02",
          "TYPE": "EXPENSE",
          "PAX": "",
          "PHONE": "",
          "REASON / PARTICULARS": "Innova Crysta KA-05 Brake replacement & Highway Fuel",
          "BOOKING CASH (₹)": 0,
          "REPAIRS (₹)": 4500,
          "MISCELLANEOUS (₹)": 450,
          "CREDIT (₹)": 1500,
          "SUPPLIER NAME": "Indian Oil Bunk",
          "SUPPLIER AMOUNT (₹)": 3500,
          "AGENCY NAME": "Southern Holidays",
          "AGENCY AMOUNT (₹)": 1200,
          "DRIVER NAME": "Manjunath K",
          "DRIVER BATA (₹)": 1800,
          "PAYMENT METHOD": "UPI",
        },
      ];

      const ws = XLSX.utils.json_to_sheet(sample);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sample Template");
      XLSX.writeFile(wb, "fortune_expense_sample_template.xlsx");
      toast.success("Sample Excel template downloaded!");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // Handle Form Submission for Outflow Expense
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
      toast.error("Please enter at least one amount (Repairs, Misc, Credit, Supplier, Agency, or Drivers).");
      return;
    }

    add({
      entryType: "outflow",
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
      inflowAmount: 0,
      reason: formReason.trim(),
      paymentMethod: formPaymentMethod,
    });

    // Also persist to PostgreSQL database via /api/business/expenses
    try {
      const adminKey =
        (typeof window !== "undefined" &&
          (sessionStorage.getItem("fortune_admin_key") ||
            localStorage.getItem("fortune_admin_key"))) ||
        "Admin@fortunetourism2026";
      const primaryCat =
        repairsNum > 0
          ? "Repairs"
          : supplierNum > 0
          ? "Supplier"
          : agencyNum > 0
          ? "Agency"
          : driverNum > 0
          ? "Driver"
          : "Miscellaneous";
      const payee =
        formSupplierName.trim() || formAgencyName.trim() || formDriverName.trim() || "Vendor";

      fetch("/api/business/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          expense_date: formDateFrom,
          category: primaryCat,
          description: formReason.trim() || `${primaryCat} Expense`,
          paid_to: payee,
          amount: totalEntry,
          payment_method: formPaymentMethod,
          reference: `EXP-${Date.now().toString().slice(-6)}`,
          notes: formReason.trim(),
        }),
      }).catch((err) => console.warn("Background DB expense sync error:", err));
    } catch (e) {
      console.warn("Expense DB persist error:", e);
    }

    toast.success("Expense outflow recorded successfully!");

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

  // Handle Form Submission for Cash Inflow
  const handleSaveInflow = (e: React.FormEvent) => {
    e.preventDefault();

    const amt = Math.max(0, Number(inflowAmount) || 0);
    if (amt <= 0) {
      toast.error("Please enter a valid Cash Inflow amount.");
      return;
    }
    if (!inflowReason.trim()) {
      toast.error("Please enter a Reason / Description for this cash collection.");
      return;
    }

    add({
      entryType: "inflow",
      dateFrom: inflowDateFrom,
      dateTo: inflowDateTo || inflowDateFrom,
      repairs: 0,
      miscellaneous: 0,
      credit: 0,
      supplierName: "",
      supplierAmount: 0,
      agencyName: "",
      agencyAmount: 0,
      driverName: "",
      driverAmount: 0,
      inflowAmount: amt,
      reason: inflowReason.trim(),
      customerName: inflowCustomerName.trim() || "Passenger",
      bookingNumber: inflowBookingNumber.trim() || `CASH-${Date.now().toString().slice(-4)}`,
      source: "Cash Inflow",
      paymentMethod: inflowPaymentMethod,
    });

    toast.success("Cash inflow record added successfully!");
    setInflowAmount("");
    setInflowCustomerName("");
    setInflowBookingNumber("");
    setInflowReason("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Hidden File Input for Excel Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleExcelFileUpload}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />

        {/* ================= HEADER BAR ================= */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#063f2d] via-[#07533b] to-[#0a684a] text-white border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Expense &amp; Cash Inflow Report</h3>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Inflows (Booking Page Cash) &bull; Repairs &bull; Misc &bull; Credit &bull; Supplier &bull; Agency &bull; Drivers &bull; Reasons
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Import Excel Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer"
              title="Import Excel or CSV file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportToExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#107c41] hover:bg-[#0d6535] text-white border border-emerald-400/40 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Download Excel Sheet (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15 cursor-pointer"
              title="Print Expense Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
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

        {/* ================= TOP CONTROLS & TABS ================= */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
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
              <span>Report Ledger ({filteredRecords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("add_expense")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "add_expense"
                  ? "bg-[#063f2d] text-white shadow-xs"
                  : "bg-white text-rose-800 border border-rose-300 hover:bg-rose-50"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Expense Outflow</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("add_inflow")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "add_inflow"
                  ? "bg-[#063f2d] text-white shadow-xs"
                  : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Add Cash Inflow</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSampleTemplate}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
              title="Download clean Excel template to fill and re-import"
            >
              <Download className="w-3 h-3" />
              <span>Sample Template</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm("Reset records back to sample defaults?")) {
                  reset();
                  toast.success("Reset to default records.");
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

          {/* ================= TAB 1: ADD NEW EXPENSE (OUTFLOW) ================= */}
          {activeTab === "add_expense" && (
            <form onSubmit={handleSaveExpense} className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
              <div className="bg-gradient-to-br from-rose-50/70 to-orange-50/30 p-5 rounded-2xl border border-rose-200/70 shadow-xs">
                <h4 className="text-sm font-black text-rose-950 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>Record Expense Outflow (Repairs, Misc, Credit, Supplier, Agency, Drivers)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Enter Date From, Date To, Reason, and amounts for the corresponding categories.
                </p>
              </div>

              {/* Date From & Date To */}
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
                </div>
              </div>

              {/* Direct Expense Amounts: Repairs, Miscellaneous, Credit */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Direct Overheads: Repairs, Miscellaneous &amp; Credit
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Repairs */}
                  <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
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
                  </div>

                  {/* Miscellaneous */}
                  <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200">
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
                  </div>

                  {/* Credit */}
                  <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
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
                  </div>
                </div>
              </div>

              {/* Entity Amounts: Supplier, Agency, Drivers */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Partner &amp; Staff Payouts: Supplier, Agency &amp; Drivers
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Supplier */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Supplier</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Supplier Name (e.g. Fuel Bunk / Parts)"
                      value={formSupplierName}
                      onChange={(e) => setFormSupplierName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Supplier Amount (₹)"
                        value={formSupplierAmount}
                        onChange={(e) => setFormSupplierAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-black text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Agency */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Handshake className="w-3.5 h-3.5 text-blue-600" />
                      <span>Agency</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Agency Name (e.g. B2B Partner Desk)"
                      value={formAgencyName}
                      onChange={(e) => setFormAgencyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Agency Amount (₹)"
                        value={formAgencyAmount}
                        onChange={(e) => setFormAgencyAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-black text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Drivers */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Drivers</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Driver Name (e.g. Manjunath K)"
                      value={formDriverName}
                      onChange={(e) => setFormDriverName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Driver Bata / Salary (₹)"
                        value={formDriverAmount}
                        onChange={(e) => setFormDriverAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-black text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason & Payment Mode */}
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
                  placeholder="Specify reason (e.g. Innova KA-05 clutch replacement, driver outstation night bata, fuel supplier bill #8921)"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Actions */}
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
                  <span>Save Expense Outflow</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: ADD CASH INFLOW ================= */}
          {activeTab === "add_inflow" && (
            <form onSubmit={handleSaveInflow} className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/30 p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
                <h4 className="text-sm font-black text-[#063f2d] flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
                  <span>Record Cash Inflow (Booking Cash / Counter Receipts)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Record advance or full cash collected from passengers, counter bookings, or client tour advances.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Date From *
                  </label>
                  <input
                    type="date"
                    required
                    value={inflowDateFrom}
                    onChange={(e) => setInflowDateFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Date To *
                  </label>
                  <input
                    type="date"
                    required
                    value={inflowDateTo}
                    onChange={(e) => setInflowDateTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Collected Inflow Amount */}
                  <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-300">
                    <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Collected Cash Amount (₹) *</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 12500"
                        value={inflowAmount}
                        onChange={(e) => setInflowAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-emerald-400 text-xs sm:text-sm font-black text-emerald-950 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Customer / Passenger */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Customer / Passenger Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={inflowCustomerName}
                      onChange={(e) => setInflowCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Booking / Ticket Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FT-TKT-8901 / FT-CAB-12"
                      value={inflowBookingNumber}
                      onChange={(e) => setInflowBookingNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      value={inflowPaymentMethod}
                      onChange={(e) => setInflowPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    >
                      <option value="Cash">Cash at Counter</option>
                      <option value="UPI / PhonePe / GPay">UPI / PhonePe / GPay</option>
                      <option value="Bank Transfer">Bank Transfer / IMPS</option>
                      <option value="Card">Credit / Debit Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Reason / Booking Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Advance cash received for Mysuru 3-day tour package, seat reservation counter booking"
                    value={inflowReason}
                    onChange={(e) => setInflowReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

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
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-900/20 transition cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-200" />
                  <span>Save Cash Inflow</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 3: REPORT LEDGER WITH DROPDOWN OPTIONS ================= */}
          {activeTab === "list" && (
            <div className="space-y-6">

              {/* Top Filter Bar: CATEGORY DROPDOWN + DATE FROM + DATE TO + SEARCH */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  
                  {/* Category Dropdown Option requested by user */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Select Category:</span>
                    </span>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategoryType)}
                        className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                      >
                        <option value="all">🌐 All Records &amp; Cashflows</option>
                        <option value="inflow">💰 Inflows (Collected Cash from Booking Page)</option>
                        <option value="repairs">🔧 Repairs (Vehicle &amp; Garage)</option>
                        <option value="miscellaneous">📦 Miscellaneous (Tolls, Parking &amp; Misc)</option>
                        <option value="credit">💳 Credit (Advance Clearance)</option>
                        <option value="supplier">🏢 Supplier (Fuel &amp; Spare Parts)</option>
                        <option value="agency">🤝 Agency (B2B Travel Desks)</option>
                        <option value="drivers">🚗 Drivers (Bata &amp; Allowances)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date From & Date To */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-600">From:</span>
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-600">To:</span>
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-slate-300">
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

                  {/* Search Box */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search reason, customer, driver..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                </div>
              </div>

              {/* Filter / Date-Wise Calculation Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Financial Summary Overview
                  </span>
                  {isDateFiltered ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                      📅 Date-Wise Calculation ({filteredRecords.length} records)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                      All-Time History ({allCombinedRecords.length} records)
                    </span>
                  )}
                </div>
                {isDateFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDateFrom("");
                      setFilterDateTo("");
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                  >
                    Reset Date Filters (View All-Time)
                  </button>
                )}
              </div>

              {/* Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {/* 1. Inflows */}
                <div className={`p-3 rounded-2xl border shadow-2xs transition-all ${
                  selectedCategory === "inflow" || selectedCategory === "all"
                    ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20"
                    : "bg-white border-slate-200 opacity-60"
                }`}>
                  <div className="flex items-center gap-1 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inflows</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-emerald-950 mt-1">
                    ₹{financialTotals.totalInflow.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-emerald-700/80 font-bold">
                    Booking Cash
                    {isDateFiltered && (
                      <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">
                        All-Time: ₹{lifetimeTotals.totalInflow.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>

                {/* 2. Repairs */}
                <div className={`p-3 rounded-2xl border shadow-2xs transition-all ${
                  selectedCategory === "repairs" || selectedCategory === "all"
                    ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20"
                    : "bg-white border-slate-200 opacity-60"
                }`}>
                  <div className="flex items-center gap-1 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Repairs</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-amber-950 mt-1">
                    ₹{financialTotals.repairs.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-amber-700/80 font-bold">
                    Garage &amp; Parts
                    {isDateFiltered && (
                      <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">
                        All-Time: ₹{lifetimeTotals.repairs.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>

                {/* 3. Misc */}
                <div className={`p-3 rounded-2xl border shadow-2xs transition-all ${
                  selectedCategory === "miscellaneous" || selectedCategory === "all"
                    ? "bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20"
                    : "bg-white border-slate-200 opacity-60"
                }`}>
                  <div className="flex items-center gap-1 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                    <Package className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Misc</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-indigo-950 mt-1">
                    ₹{financialTotals.miscellaneous.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-indigo-700/80 font-bold">
                    Tolls, Parking
                    {isDateFiltered && (
                      <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">
                        All-Time: ₹{lifetimeTotals.miscellaneous.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>

                {/* 4. Credit */}
                <div className={`p-3 rounded-2xl border shadow-2xs transition-all ${
                  selectedCategory === "credit" || selectedCategory === "all"
                    ? "bg-rose-50/90 border-rose-300 ring-2 ring-rose-500/20"
                    : "bg-white border-slate-200 opacity-60"
                }`}>
                  <div className="flex items-center gap-1 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                    <span>Credit</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-rose-950 mt-1">
                    ₹{financialTotals.credit.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-rose-700/80 font-bold">
                    Clearance
                    {isDateFiltered && (
                      <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">
                        All-Time: ₹{lifetimeTotals.credit.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>

                {/* 5. Supplier */}
                <div className={`p-3 rounded-2xl border shadow-2xs transition-all ${
                  selectedCategory === "supplier" || selectedCategory === "all"
                    ? "bg-teal-50/90 border-teal-300 ring-2 ring-teal-500/20"
                    : "bg-white border-slate-200 opacity-60"
                }`}>
                  <div className="flex items-center gap-1 text-teal-800 text-[10px] font-black uppercase tracking-wider">
                    <Building className="w-3.5 h-3.5 text-teal-600" />
                    <span>Supplier</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-teal-950 mt-1">
                    ₹{financialTotals.supplier.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-teal-700/80 font-bold">
                    Fuel &amp; Vendors
                    {isDateFiltered && (
                      <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">
                        All-Time: ₹{lifetimeTotals.supplier.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>

                {/* 6. Agency */}
                <div className={`p-3 rounded-2xl border shadow-2xs transition-all ${
                  selectedCategory === "agency" || selectedCategory === "all"
                    ? "bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20"
                    : "bg-white border-slate-200 opacity-60"
                }`}>
                  <div className="flex items-center gap-1 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                    <Handshake className="w-3.5 h-3.5 text-blue-600" />
                    <span>Agency</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-blue-950 mt-1">
                    ₹{financialTotals.agency.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-blue-700/80 font-bold">
                    B2B Partners
                    {isDateFiltered && (
                      <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">
                        All-Time: ₹{lifetimeTotals.agency.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>

                {/* 7. Drivers */}
                <div className={`p-3 rounded-2xl border shadow-2xs transition-all ${
                  selectedCategory === "drivers" || selectedCategory === "all"
                    ? "bg-purple-50/90 border-purple-300 ring-2 ring-purple-500/20"
                    : "bg-white border-slate-200 opacity-60"
                }`}>
                  <div className="flex items-center gap-1 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Drivers</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-purple-950 mt-1">
                    ₹{financialTotals.drivers.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-purple-700/80 font-bold">
                    Bata &amp; Payouts
                    {isDateFiltered && (
                      <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">
                        All-Time: ₹{lifetimeTotals.drivers.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>

                {/* 8. Net Balance */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#063f2d] to-[#086a46] text-white shadow-md">
                  <div className="flex items-center gap-1 text-emerald-200 text-[10px] font-black uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                    <span>Net Balance</span>
                  </div>
                  <div className={`text-xs sm:text-sm font-black mt-1 ${
                    financialTotals.netBalance >= 0 ? "text-amber-300" : "text-rose-300"
                  }`}>
                    ₹{financialTotals.netBalance.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-emerald-200 font-bold">
                    Inflow - Outflow
                    {isDateFiltered && (
                      <span className="block text-[8px] text-emerald-300/80 font-semibold mt-0.5">
                        All-Time: ₹{lifetimeTotals.netBalance.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Main Table View */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black uppercase tracking-wider border-b border-slate-200 text-[10px]">
                        <th className="py-3 px-3 whitespace-nowrap">Date From</th>
                        <th className="py-3 px-3 whitespace-nowrap">Date To</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3 min-w-[240px]">Reasons / Particulars</th>
                        <th className="py-3 px-3 text-right">Inflows (₹)</th>
                        <th className="py-3 px-3 text-right">Outflows (₹)</th>
                        <th className="py-3 px-3 text-right font-black">Total (₹)</th>
                        <th className="py-3 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((item) => {
                        const isInflow = item.entryType === "inflow";
                        const rowTotal = computeExpenseItemTotal(item);

                        let catLabel = "General Expense";
                        let catBadge = "bg-slate-100 text-slate-700";

                        if (isInflow) {
                          catLabel = "Booking Cash Inflow";
                          catBadge = "bg-emerald-100 text-emerald-800 border border-emerald-300";
                        } else if (item.repairs > 0) {
                          catLabel = "Repairs";
                          catBadge = "bg-amber-100 text-amber-800 border border-amber-300";
                        } else if (item.miscellaneous > 0) {
                          catLabel = "Miscellaneous";
                          catBadge = "bg-indigo-100 text-indigo-800 border border-indigo-300";
                        } else if (item.credit > 0) {
                          catLabel = "Credit";
                          catBadge = "bg-rose-100 text-rose-800 border border-rose-300";
                        } else if (item.supplierAmount > 0 || item.supplierName) {
                          catLabel = "Supplier";
                          catBadge = "bg-teal-100 text-teal-800 border border-teal-300";
                        } else if (item.agencyAmount > 0 || item.agencyName) {
                          catLabel = "Agency";
                          catBadge = "bg-blue-100 text-blue-800 border border-blue-300";
                        } else if (item.driverAmount > 0 || item.driverName) {
                          catLabel = "Drivers";
                          catBadge = "bg-purple-100 text-purple-800 border border-purple-300";
                        }

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            {/* Date From */}
                            <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900">
                              {item.dateFrom}
                            </td>

                            {/* Date To */}
                            <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-700">
                              {item.dateTo || item.dateFrom}
                            </td>

                            {/* Category */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${catBadge}`}>
                                {isInflow && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                                {item.repairs > 0 && <Wrench className="w-3 h-3 text-amber-600" />}
                                {item.miscellaneous > 0 && <Package className="w-3 h-3 text-indigo-600" />}
                                {item.credit > 0 && <CreditCard className="w-3 h-3 text-rose-600" />}
                                {item.supplierAmount > 0 && <Building className="w-3 h-3 text-teal-600" />}
                                {item.agencyAmount > 0 && <Handshake className="w-3 h-3 text-blue-600" />}
                                {item.driverAmount > 0 && <Users className="w-3 h-3 text-purple-600" />}
                                <span>{catLabel}</span>
                              </span>
                            </td>

                            {/* Reasons / Particulars */}
                            <td className="py-3 px-3">
                              <p className="font-semibold text-slate-900 leading-snug">{item.reason}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-500">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-bold text-slate-600">{item.id}</span>
                                {item.customerName && (
                                  <span className="text-emerald-700 font-bold">Pax: {item.customerName}</span>
                                )}
                                {item.bookingNumber && (
                                  <span className="text-blue-700 font-bold">Ref: {item.bookingNumber}</span>
                                )}
                                {item.supplierName && (
                                  <span className="text-teal-700 font-bold">Supplier: {item.supplierName}</span>
                                )}
                                {item.agencyName && (
                                  <span className="text-blue-700 font-bold">Agency: {item.agencyName}</span>
                                )}
                                {item.driverName && (
                                  <span className="text-purple-700 font-bold">Driver: {item.driverName}</span>
                                )}
                                {item.source && (
                                  <span className="text-slate-400">({item.source})</span>
                                )}
                              </div>
                            </td>

                            {/* Inflows (Collected cash from booking page) */}
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              {isInflow ? (
                                <span className="font-black text-emerald-700 text-xs sm:text-sm bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                  + ₹{item.inflowAmount.toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-bold">—</span>
                              )}
                            </td>

                            {/* Outflows (Expenses) */}
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              {!isInflow ? (
                                <span className="font-bold text-rose-700 text-xs sm:text-sm bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                                  - ₹{rowTotal.toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-bold">—</span>
                              )}
                            </td>

                            {/* Total */}
                            <td className="py-3 px-3 text-right font-black text-xs sm:text-sm whitespace-nowrap">
                              <span className={isInflow ? "text-emerald-800" : "text-rose-950"}>
                                {isInflow ? "+" : "-"}₹{rowTotal.toLocaleString("en-IN")}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove record ${item.id}?`)) {
                                    remove(item.id);
                                    toast.success("Record deleted.");
                                  }
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredRecords.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <Receipt className="w-9 h-9 mx-auto mb-2 opacity-40 text-emerald-800" />
                            <p className="font-bold text-xs text-slate-700">No records found for this category or date filter.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Try selecting "All Records", import an Excel file, or reset your filters.</p>
                            <div className="flex items-center justify-center gap-3 mt-3">
                              <button
                                type="button"
                                onClick={() => setSelectedCategory("all")}
                                className="text-xs font-black text-emerald-700 hover:underline cursor-pointer"
                              >
                                View All Categories
                              </button>
                              <span>&bull;</span>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs font-black text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Import from Excel</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-3">
                    <span>Showing {filteredRecords.length} entries</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-500 font-medium">
                      Category: {selectedCategory.toUpperCase()} {isDateFiltered ? "(Date-Wise Filtered Calculation)" : "(All-Time History)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-700 font-extrabold">
                      Inflow: +₹{financialTotals.totalInflow.toLocaleString("en-IN")}
                    </span>
                    <span className="text-rose-700 font-extrabold">
                      Outflow: -₹{financialTotals.totalOutflow.toLocaleString("en-IN")}
                    </span>
                    <span className="text-slate-900 font-black pl-2 border-l border-slate-300">
                      Net: ₹{financialTotals.netBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ================= EXCEL IMPORT PREVIEW MODAL ================= */}
        {importPreviewOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-4xl max-h-[88vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black">Excel Import Preview</h4>
                    <p className="text-xs text-emerald-200 font-medium">
                      File: {importFileName} &bull; {importedRows.length} rows parsed
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImportPreviewOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-extrabold text-emerald-950 block">Ready to import into Expense Report</span>
                    <span className="text-emerald-700">
                      Detected {importedRows.filter((r) => r.entryType === "inflow").length} Inflow rows &bull;{" "}
                      {importedRows.filter((r) => r.entryType === "outflow").length} Outflow rows
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-bold">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "append"}
                        onChange={() => setImportMode("append")}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Append to existing</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-bold ml-2">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Replace all</span>
                    </label>
                  </div>
                </div>

                {/* Preview Table of first 6 rows */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-black text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Reason / Details</th>
                          <th className="py-2.5 px-3 text-right">Inflow (₹)</th>
                          <th className="py-2.5 px-3 text-right">Outflow (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedRows.slice(0, 10).map((r, i) => {
                          const isIn = r.entryType === "inflow";
                          const total = computeExpenseItemTotal(r);
                          return (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-800">{r.dateFrom}</td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  isIn ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                }`}>
                                  {isIn ? "INFLOW" : "OUTFLOW"}
                                </span>
                              </td>
                              <td className="py-2 px-3 max-w-[280px] truncate text-slate-700">{r.reason}</td>
                              <td className="py-2 px-3 text-right font-black text-emerald-700">
                                {isIn ? `₹${r.inflowAmount.toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="py-2 px-3 text-right font-black text-rose-700">
                                {!isIn ? `₹${total.toLocaleString("en-IN")}` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {importedRows.length > 10 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-bold">
                      + {importedRows.length - 10} more rows will be imported
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setImportPreviewOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Confirm &amp; Import ({importedRows.length} Records)</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= MODAL FOOTER ================= */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>Fortune Tourism &bull; Operating Ledger &amp; Cash Inflow Analysis</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline text-emerald-700 font-bold">Supports .XLSX, .XLS, .CSV Import</span>
          </div>
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
