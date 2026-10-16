import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  X,
  Building2,
  Calendar,
  IndianRupee,
  Search,
  Plus,
  Trash2,
  Pencil,
  Printer,
  Download,
  FileDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoAsset from "@/assets/fortune-tourism-logo.png";

export interface CompanyBookingEntry {
  id: string;
  date: string;
  trip: string;
  company_name?: string;
  opening_balance: number;
  advance_received: number;
  trip_dues: number;
  closing_amt: number;
  name: string;
  phone_number?: string;
  notes?: string;
  is_summary_row?: boolean;
  summary_type?: "POSITIVE" | "NEGATIVE";
}

export const DEFAULT_DAVID_SIR_ENTRIES: CompanyBookingEntry[] = [
  {
    id: "entry-1",
    date: "19/11/2025",
    trip: "POSITIVE BALANCE (23 & 17/11/2025)",
    company_name: "David Sir Account",
    opening_balance: 8000,
    advance_received: 0,
    trip_dues: 0,
    closing_amt: 8000,
    name: "—",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-2",
    date: "12/12/2025",
    trip: "AIRPORT TO VILLA DROP AT:9.45 AM",
    company_name: "David Sir Account",
    opening_balance: 8000,
    advance_received: 0,
    trip_dues: 1800,
    closing_amt: 6200,
    name: "Mr.DAVID SIR",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-3",
    date: "23/12/2025",
    trip: "VILLA TO AIRPORT DROP AT:3.00 PM",
    company_name: "David Sir Account",
    opening_balance: 6200,
    advance_received: 0,
    trip_dues: 1800,
    closing_amt: 4400,
    name: "Mr.DAVID SIR",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-4",
    date: "8/1/2026",
    trip: "VILLA TO AIRPORT DROP AT:4.15 AM",
    company_name: "David Sir Account",
    opening_balance: 4400,
    advance_received: 0,
    trip_dues: 1800,
    closing_amt: 2600,
    name: "Mr.Mohd",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-5",
    date: "14/01/2026",
    trip: "MEJESTIC TO VILLA DROP AT:11.15 AM",
    company_name: "David Sir Account",
    opening_balance: 2600,
    advance_received: 0,
    trip_dues: 1000,
    closing_amt: 1600,
    name: "Mr.DAVID SIR & Mohd",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-sub-1",
    date: "14/01/2026",
    trip: "POSTIVE BALANCE AS ON 14/01/2026",
    company_name: "David Sir Account",
    opening_balance: 1600,
    advance_received: 0,
    trip_dues: 0,
    closing_amt: 1600,
    name: "BALANCE AS ON 14/01/2026",
    phone_number: "+91 9740463404",
    is_summary_row: true,
    summary_type: "POSITIVE",
  },
  {
    id: "entry-6",
    date: "20/01/2026",
    trip: "Advance Payment On:20/01/2026",
    company_name: "David Sir Account",
    opening_balance: 1600,
    advance_received: 10000,
    trip_dues: 0,
    closing_amt: 11600,
    name: "Advance Payment",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-7",
    date: "22/01/2026",
    trip: "VILLA TO AIRPORT DROP AT:9.45 AM",
    company_name: "David Sir Account",
    opening_balance: 11600,
    advance_received: 0,
    trip_dues: 1800,
    closing_amt: 9800,
    name: "Mr.DAVID SIR",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-8",
    date: "6/2/2026",
    trip: "VILLA TO EXEBITION UP & DOWN AT:10.00 AM",
    company_name: "David Sir Account",
    opening_balance: 9800,
    advance_received: 0,
    trip_dues: 4000,
    closing_amt: 5800,
    name: "Mr.Mohd",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-9",
    date: "6/2/2026",
    trip: "Toll Charges of Nice Road Up & Down",
    company_name: "David Sir Account",
    opening_balance: 5800,
    advance_received: 0,
    trip_dues: 610,
    closing_amt: 5190,
    name: "NICE ROAD",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-10",
    date: "15/02/2026",
    trip: "PAID TO DRIVER",
    company_name: "David Sir Account",
    opening_balance: 5190,
    advance_received: 5000,
    trip_dues: 0,
    closing_amt: 10190,
    name: "PAID TO DRIVER",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-11",
    date: "15/02/2026",
    trip: "CHENNAI TO VILLA DROP AT:10.00 AM",
    company_name: "David Sir Account",
    opening_balance: 10190,
    advance_received: 0,
    trip_dues: 10900,
    closing_amt: -710,
    name: "Mr.DAVID SIR",
    phone_number: "+91 9740463404",
  },
  {
    id: "entry-sub-2",
    date: "16/02/2026",
    trip: "NEGATIVE BALANCE AS ON 16/02/2026",
    company_name: "David Sir Account",
    opening_balance: -710,
    advance_received: 0,
    trip_dues: 0,
    closing_amt: -710,
    name: "DUE TO FORTUNE",
    phone_number: "+91 9740463404",
    is_summary_row: true,
    summary_type: "NEGATIVE",
  },
];

const LOCAL_STORAGE_KEY = "fortune_company_entered_bookings_david_v2";

interface CompanyEnteredBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyEnteredBookingModal({
  isOpen,
  onClose,
}: CompanyEnteredBookingModalProps) {
  const [entries, setEntries] = useState<CompanyBookingEntry[]>(() => {
    if (typeof window !== "undefined") {
      const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedV2) {
        try {
          return JSON.parse(savedV2);
        } catch (e) {
          console.error("Failed to parse saved company entered bookings v2", e);
        }
      }
      const savedV1 = localStorage.getItem("fortune_company_entered_bookings_david_v1");
      if (savedV1) {
        try {
          const parsed: CompanyBookingEntry[] = JSON.parse(savedV1);
          return parsed.map((e) => ({
            ...e,
            company_name: e.company_name || "David Sir Account",
            phone_number: e.phone_number || "+91 9740463404",
          }));
        } catch (e) {
          console.error("Failed to migrate v1 company entered bookings", e);
        }
      }
    }
    return DEFAULT_DAVID_SIR_ENTRIES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [editingEntry, setEditingEntry] = useState<CompanyBookingEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString("en-GB"),
    trip: "",
    company_name: "David Sir Account",
    advance_received: 0,
    trip_dues: 0,
    name: "Mr.DAVID SIR",
    phone_number: "+91 9740463404",
    notes: "",
  });

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save entries to localStorage", e);
    }
  }, [entries]);

  // Recalculate full ledger cascade whenever rows change
  const recalculateLedger = (rawEntries: CompanyBookingEntry[]) => {
    let currentBalance = 0;
    return rawEntries.map((row, idx) => {
      if (idx === 0) {
        currentBalance = row.closing_amt || (row.opening_balance + row.advance_received - row.trip_dues);
        return {
          ...row,
          opening_balance: row.opening_balance,
          closing_amt: currentBalance,
        };
      }
      if (row.is_summary_row) {
        return {
          ...row,
          opening_balance: currentBalance,
          closing_amt: currentBalance,
        };
      }
      const openBal = currentBalance;
      const closeBal = openBal + Number(row.advance_received || 0) - Number(row.trip_dues || 0);
      currentBalance = closeBal;
      return {
        ...row,
        opening_balance: openBal,
        closing_amt: closeBal,
      };
    });
  };

  // Metrics
  const metrics = useMemo(() => {
    const regularEntries = entries.filter((e) => !e.is_summary_row);
    const totalAdvance = regularEntries.reduce((sum, e) => sum + Number(e.advance_received || 0), 0);
    const totalDues = regularEntries.reduce((sum, e) => sum + Number(e.trip_dues || 0), 0);
    const initialOpening = regularEntries[0]?.opening_balance || 8000;
    const lastEntry = regularEntries[regularEntries.length - 1];
    const closingBalance = lastEntry ? lastEntry.closing_amt : -710;
    const tripCount = regularEntries.filter((e) => Number(e.trip_dues || 0) > 0).length;

    return {
      totalAdvance,
      totalDues,
      initialOpening,
      closingBalance,
      tripCount,
      isNegative: closingBalance < 0,
    };
  }, [entries]);

  // Filtered view
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.date.toLowerCase().includes(q) ||
        e.trip.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        (e.company_name && e.company_name.toLowerCase().includes(q)) ||
        (e.phone_number && e.phone_number.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  // Reset to default
  const handleResetDefault = () => {
    if (confirm("Reset ledger to original 'Mr. David Sir Account' data from 12/12/2025?")) {
      setEntries(DEFAULT_DAVID_SIR_ENTRIES);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast.success("Ledger reset to default David Sir account records.");
    }
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    if (confirm("Are you sure you want to delete this trip record?")) {
      const remaining = entries.filter((e) => e.id !== id);
      setEntries(recalculateLedger(remaining));
      toast.success("Record deleted and balance recalculated.");
    }
  };

  // Open edit modal
  const handleOpenEdit = (entry: CompanyBookingEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      trip: entry.trip,
      company_name: entry.company_name || "David Sir Account",
      advance_received: entry.advance_received,
      trip_dues: entry.trip_dues,
      name: entry.name,
      phone_number: entry.phone_number || "+91 9740463404",
      notes: entry.notes || "",
    });
    setShowAddModal(true);
  };

  // Open add modal
  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormData({
      date: new Date().toLocaleDateString("en-GB"),
      trip: "",
      company_name: "David Sir Account",
      advance_received: 0,
      trip_dues: 0,
      name: "Mr.DAVID SIR",
      phone_number: "+91 9740463404",
      notes: "",
    });
    setShowAddModal(true);
  };

  // Submit Add / Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trip.trim()) {
      toast.error("Please enter Trip / Activity description.");
      return;
    }

    if (editingEntry) {
      const updated = entries.map((item) => {
        if (item.id === editingEntry.id) {
          return {
            ...item,
            date: formData.date,
            trip: formData.trip,
            company_name: formData.company_name,
            advance_received: Number(formData.advance_received || 0),
            trip_dues: Number(formData.trip_dues || 0),
            name: formData.name,
            phone_number: formData.phone_number,
            notes: formData.notes,
          };
        }
        return item;
      });
      setEntries(recalculateLedger(updated));
      toast.success("Trip updated and closing amounts refreshed.");
    } else {
      const newEntry: CompanyBookingEntry = {
        id: `entry-${Date.now()}`,
        date: formData.date,
        trip: formData.trip,
        company_name: formData.company_name,
        opening_balance: 0,
        advance_received: Number(formData.advance_received || 0),
        trip_dues: Number(formData.trip_dues || 0),
        closing_amt: 0,
        name: formData.name,
        phone_number: formData.phone_number,
        notes: formData.notes,
      };
      setEntries(recalculateLedger([...entries, newEntry]));
      toast.success("New trip record appended to David Sir Account.");
    }

    setShowAddModal(false);
    setEditingEntry(null);
  };

  // Download PDF Corporate Statement
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF("l", "mm", "a4"); // Landscape A4: 297mm x 210mm
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Dark Green Header Bar
      doc.setFillColor(6, 63, 45); // #063f2d
      doc.rect(0, 0, pageWidth, 28, "F");

      // Company Title & Branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text("FORTUNE TOURISM & TRAVELS", 15, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(209, 250, 229);
      doc.text("No.256/A Next To Narayana Hospital, Health City, Bommasandra Bangalore.560099", 15, 18);
      doc.text("Phone: +91 9740463404  |  Email: info@fortunetourism.in", 15, 23);

      // Top Right Statement Badge
      doc.setFillColor(11, 19, 41);
      doc.roundedRect(pageWidth - 95, 5, 80, 18, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(245, 158, 11); // Amber
      doc.text("CORPORATE STATEMENT OF ACCOUNT", pageWidth - 55, 11, { align: "center" });
      doc.setFontSize(9.5);
      doc.setTextColor(255, 255, 255);
      doc.text("Mr. David Sir Account", pageWidth - 55, 17, { align: "center" });

      // Info Card Section
      let currentY = 34;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, currentY, pageWidth - 30, 20, 2, 2, "FD");

      // Info Columns
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("COMPANY / ACCOUNT:", 20, currentY + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("David Sir Account", 20, currentY + 11.5);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("Account Starts: 12/12/2025", 20, currentY + 16.5);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("PASSENGER / CONTACT PERSON:", 85, currentY + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("Mr. DAVID SIR", 85, currentY + 11.5);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Phone: +91 9740463404", 85, currentY + 16.5);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("TRIP SUMMARY:", 165, currentY + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${metrics.tripCount} Trips Logged`, 165, currentY + 11.5);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 165, currentY + 16.5);

      // Balance Pill
      const isNeg = metrics.closingBalance < 0;
      if (isNeg) {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(252, 165, 165);
      } else {
        doc.setFillColor(236, 253, 245);
        doc.setDrawColor(110, 231, 183);
      }
      doc.roundedRect(pageWidth - 85, currentY + 3, 65, 14, 2, 2, "FD");

      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("CURRENT ACCOUNT BALANCE", pageWidth - 52.5, currentY + 7.5, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      if (isNeg) {
        doc.setTextColor(185, 28, 28);
        doc.text(`Rs. ${Math.abs(metrics.closingBalance).toLocaleString("en-IN")} DUE (NEG)`, pageWidth - 52.5, currentY + 13.5, { align: "center" });
      } else {
        doc.setTextColor(4, 120, 87);
        doc.text(`Rs. ${metrics.closingBalance.toLocaleString("en-IN")} CREDIT`, pageWidth - 52.5, currentY + 13.5, { align: "center" });
      }

      currentY += 25;

      // AutoTable Columns
      const tableHeaders = [
        ["DATE", "TRIP / ACTIVITY", "COMPANY", "OPENING BAL (Rs.)", "ADVANCE REC. (Rs.)", "TRIP DUES (Rs.)", "CLOSING BAL (Rs.)", "PASSENGER & CONTACT"]
      ];

      const tableData = entries.map((row) => {
        if (row.is_summary_row) {
          return [
            row.date,
            row.trip,
            row.company_name || "David Sir Account",
            "—",
            "—",
            "—",
            `Rs. ${row.closing_amt.toLocaleString("en-IN")}`,
            row.name,
          ];
        }
        return [
          row.date,
          row.trip + (row.notes ? `\n(${row.notes})` : ""),
          row.company_name || "David Sir Account",
          `Rs. ${row.opening_balance.toLocaleString("en-IN")}`,
          row.advance_received > 0 ? `+Rs. ${row.advance_received.toLocaleString("en-IN")}` : "0",
          row.trip_dues > 0 ? `Rs. ${row.trip_dues.toLocaleString("en-IN")}` : "0",
          `Rs. ${row.closing_amt.toLocaleString("en-IN")}`,
          row.name + (row.phone_number ? `\nPh: ${row.phone_number}` : ""),
        ];
      });

      autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: currentY,
        margin: { left: 15, right: 15 },
        theme: "grid",
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          valign: "middle",
          textColor: [30, 41, 59],
        },
        headStyles: {
          fillColor: [11, 19, 41],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7.5,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 20, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 62 },
          2: { cellWidth: 32 },
          3: { cellWidth: 26, halign: "right" },
          4: { cellWidth: 28, halign: "right", textColor: [4, 120, 87], fontStyle: "bold" },
          5: { cellWidth: 24, halign: "right", textColor: [180, 83, 9], fontStyle: "bold" },
          6: { cellWidth: 28, halign: "right", fontStyle: "bold" },
          7: { cellWidth: 47 },
        },
        didParseCell: (data) => {
          const rowIndex = data.row.index;
          const entry = entries[rowIndex];
          if (entry?.is_summary_row) {
            if (entry.summary_type === "POSITIVE") {
              data.cell.styles.fillColor = [209, 250, 229]; // light green
              data.cell.styles.textColor = [6, 78, 59];
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.fillColor = [254, 226, 226]; // light red
              data.cell.styles.textColor = [153, 27, 27];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      // Bottom Metrics Footer Box
      let finalY = (doc as any).lastAutoTable?.finalY || currentY + 90;
      if (finalY > pageHeight - 35) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 4;
      }

      doc.setFillColor(11, 19, 41);
      doc.roundedRect(15, finalY, pageWidth - 30, 16, 2, 2, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text(`Initial Opening Credit: Rs. ${metrics.initialOpening.toLocaleString("en-IN")}`, 22, finalY + 6.5);
      doc.text(`Total Advance Received: Rs. ${metrics.totalAdvance.toLocaleString("en-IN")}`, 22, finalY + 11.5);

      doc.text(`Total Trip Dues: Rs. ${metrics.totalDues.toLocaleString("en-IN")}`, 105, finalY + 6.5);
      doc.text(`Total Logged Records: ${entries.length}`, 105, finalY + 11.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      if (metrics.isNegative) {
        doc.setTextColor(252, 165, 165);
        doc.text(`FINAL CLOSING BALANCE: -Rs. ${Math.abs(metrics.closingBalance).toLocaleString("en-IN")} (DUE TO FORTUNE)`, pageWidth - 20, finalY + 9.5, { align: "right" });
      } else {
        doc.setTextColor(110, 231, 183);
        doc.text(`FINAL CLOSING BALANCE: Rs. ${metrics.closingBalance.toLocaleString("en-IN")} (POSITIVE CREDIT)`, pageWidth - 20, finalY + 9.5, { align: "right" });
      }

      // Legal & Signatory
      const signY = finalY + 19;
      if (signY < pageHeight - 8) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text("Terms: Positive balances represent prepaid credits. Negative balances represent pending trip dues payable upon receipt.", 15, signY + 3);
        doc.text("Authorized by: Accounts & Corporate Booking Desk, Fortune Tourism & Travels, Narayana Health City, Bangalore.", 15, signY + 6.5);
        doc.text(`Official System Generated Document · Downloaded on ${new Date().toLocaleString("en-GB")}`, pageWidth - 15, signY + 6.5, { align: "right" });
      }

      doc.save("Mr_David_Sir_Account_Ledger_Statement.pdf");
      toast.success("PDF statement downloaded: Mr_David_Sir_Account_Ledger_Statement.pdf");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF statement.");
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const headers = [
        ["FORTUNE TOURISM & TRAVELS - COMPANY ENTERED BOOKING LEDGER"],
        ["Account: Mr. David Sir Account", "Account Starts: 12/12/2025", `Export Date: ${new Date().toLocaleDateString("en-GB")}`],
        ["Client Name: Mr. David Sir", "Contact: +91 9740463404", `Current Balance: Rs. ${metrics.closingBalance.toLocaleString("en-IN")}`],
        [],
        ["DATE", "TRIP / ACTIVITY", "COMPANY NAME", "OPENING BALANCE", "ADVANCE PAYMENT RECEIVED", "TRIP DUES", "CLOSING AMT", "PASSENGER NAME", "PHONE NUMBER"],
      ];

      const rows = entries.map((e) => [
        e.date,
        e.trip,
        e.company_name || "David Sir Account",
        e.opening_balance,
        e.advance_received || 0,
        e.trip_dues || 0,
        e.closing_amt,
        e.name,
        e.phone_number || "+91 9740463404",
      ]);

      const summaryFooter = [
        [],
        ["SUMMARY METRICS"],
        ["Initial Opening Credit:", metrics.initialOpening],
        ["Total Advance Received:", metrics.totalAdvance],
        ["Total Trip Dues:", metrics.totalDues],
        ["Closing Net Balance:", metrics.closingBalance, metrics.isNegative ? "NEGATIVE DUE TO FORTUNE" : "POSITIVE CREDIT"],
      ];

      const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows, ...summaryFooter]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "David Sir Account");
      XLSX.writeFile(wb, "Mr_David_Sir_Account_Ledger.xlsx");
      toast.success("Excel statement downloaded: Mr_David_Sir_Account_Ledger.xlsx");
    } catch (err: any) {
      console.error("Excel export error", err);
      toast.error("Failed to export Excel spreadsheet.");
    }
  };

  // Print statement
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Printable Sheet Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #company-booking-statement, #company-booking-statement * {
            visibility: visible;
          }
          #company-booking-statement {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 12mm;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[95vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="bg-[#063f2d] text-white px-5 sm:px-8 py-4 flex items-center justify-between border-b border-[#086a46] shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Company Entered Booking
                </h2>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Mr. David Sir Account
                </span>
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Account Starts: 12/12/2025
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Official Corporate Ledger · Trip Dues, Advance Payments, Passenger Contacts &amp; Balances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow transition cursor-pointer"
              title="Download official PDF corporate statement"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c58e] hover:bg-[#00a87a] text-white font-extrabold text-xs shadow transition cursor-pointer"
              title="Export statement as Microsoft Excel .xlsx"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition cursor-pointer"
              title="Print official letterhead statement"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 bg-slate-50/60" id="company-booking-statement">
          {/* Official Letterhead Header for Print / Screen */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={logoAsset}
                  alt="Fortune Tourism"
                  className="h-12 w-auto object-contain rounded-xl bg-[#063f2d] p-1.5 shadow-sm"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                    Fortune Tourism &amp; Travels
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    No.256/A Next To Narayana Hospital, Health City, Bommasandra Bangalore.560099
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Phone: <strong className="text-slate-800">+91 9740463404</strong> | Email: <strong className="text-slate-800">info@fortunetourism.in</strong>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-900 text-white px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
                  CORPORATE STATEMENT OF ACCOUNT
                </span>
                <div className="text-sm font-black text-white mt-0.5">
                  Mr. David Sir Account
                </div>
                <div className="text-xs text-slate-300 mt-0.5 flex items-center sm:justify-end gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Account Starts: <strong>12/12/2025</strong></span>
                </div>
              </div>
            </div>

            {/* Account Details & Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Company / Account
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700" /> David Sir Account
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Passenger / Contact
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" /> Mr. DAVID SIR
                </span>
                <span className="text-xs font-semibold text-blue-700 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-blue-600" /> +91 9740463404
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Trips Logged
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">
                  {metrics.tripCount} Trips Completed
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {entries.length} Ledger Line Items
                </span>
              </div>

              <div
                className={`rounded-xl p-3 border ${
                  metrics.isNegative
                    ? "bg-rose-50/80 border-rose-300 text-rose-950"
                    : "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                  Current Account Balance
                </span>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className={`text-base font-black ${metrics.isNegative ? "text-rose-700" : "text-emerald-700"}`}>
                    ₹{Math.abs(metrics.closingBalance).toLocaleString("en-IN")}{" "}
                    <span className="text-xs font-bold uppercase">
                      {metrics.isNegative ? "DUE (NEG)" : "CREDIT"}
                    </span>
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                      metrics.isNegative
                        ? "bg-rose-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {metrics.isNegative ? "Negative Balance" : "Positive Balance"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar on Screen */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs no-print">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trip, date, passenger name, company or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#063f2d] focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#063f2d] hover:bg-[#086a46] text-white font-black text-xs shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add Trip Line</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-xs border border-rose-200 shadow-xs transition cursor-pointer"
                title="Download PDF corporate statement"
              >
                <FileDown className="w-4 h-4 text-rose-600" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200 shadow-xs transition cursor-pointer"
                title="Export Microsoft Excel spreadsheet"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
                title="Restore default David Sir Account transactions from 12/12/2025"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>

          {/* EXACT SPREADSHEET TABLE WITH PASSENGER PHONE & COMPANY */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-sans">
                {/* Table Header */}
                <thead className="bg-[#0b1329] text-white uppercase text-[11px] tracking-wider font-black">
                  <tr className="divide-x divide-slate-800 border-b-2 border-slate-900">
                    <th className="p-3 w-28 text-center whitespace-nowrap">DATE</th>
                    <th className="p-3">TRIP</th>
                    <th className="p-3 w-36 whitespace-nowrap">COMPANY</th>
                    <th className="p-3 w-32 text-right whitespace-nowrap">Opening balance</th>
                    <th className="p-3 w-36 text-right whitespace-nowrap text-emerald-300">
                      Advance payment received
                    </th>
                    <th className="p-3 w-28 text-right whitespace-nowrap text-amber-300">Trip Dues</th>
                    <th className="p-3 w-32 text-right whitespace-nowrap text-teal-300">Closing amt</th>
                    <th className="p-3 w-48">PASSENGER &amp; CONTACT</th>
                    <th className="p-3 w-20 text-center no-print">ACTION</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-300 text-slate-900">
                  {filteredEntries.map((row, idx) => {
                    const isSummary = row.is_summary_row;
                    const isNeg = row.closing_amt < 0;

                    if (isSummary) {
                      return (
                        <tr
                          key={row.id || idx}
                          className={`font-black divide-x divide-slate-900 border-y-2 border-slate-900 ${
                            row.summary_type === "POSITIVE"
                              ? "bg-emerald-100/90 text-emerald-950"
                              : "bg-rose-100/90 text-rose-950"
                          }`}
                        >
                          <td className="p-3 text-center whitespace-nowrap">{row.date}</td>
                          <td colSpan={2} className="p-3 uppercase tracking-wider text-xs">
                            <span className="flex items-center gap-1.5">
                              {row.summary_type === "POSITIVE" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                              <strong>{row.trip}</strong>
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-600">—</td>
                          <td className="p-3 text-right text-slate-600">—</td>
                          <td className="p-3 text-right text-slate-600">—</td>
                          <td
                            className={`p-3 text-right text-sm font-extrabold ${
                              row.summary_type === "POSITIVE" ? "text-emerald-800" : "text-rose-800"
                            }`}
                          >
                            ₹{row.closing_amt.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 uppercase font-black">
                            <div>{row.name}</div>
                            {row.phone_number && (
                              <div className="text-[10px] text-slate-600 font-mono font-normal">
                                {row.phone_number}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center no-print">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete summary marker"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={row.id || idx}
                        className={`divide-x divide-slate-300 hover:bg-slate-50/80 transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        }`}
                      >
                        {/* 1. DATE */}
                        <td className="p-2.5 text-center font-bold font-mono text-slate-800 whitespace-nowrap">
                          {row.date}
                        </td>

                        {/* 2. TRIP */}
                        <td className="p-2.5 font-extrabold text-slate-950 uppercase">
                          {row.trip}
                          {row.notes && (
                            <span className="block text-[10px] text-slate-500 font-normal mt-0.5 normal-case">
                              {row.notes}
                            </span>
                          )}
                        </td>

                        {/* 3. COMPANY */}
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <Building2 className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>{row.company_name || "David Sir Account"}</span>
                          </span>
                        </td>

                        {/* 4. Opening balance */}
                        <td className="p-2.5 text-right font-bold text-slate-800 font-mono whitespace-nowrap">
                          ₹{row.opening_balance.toLocaleString("en-IN")}
                        </td>

                        {/* 5. Advance payment received */}
                        <td className="p-2.5 text-right font-extrabold text-emerald-700 font-mono whitespace-nowrap">
                          {row.advance_received > 0 ? (
                            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                              +₹{row.advance_received.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0</span>
                          )}
                        </td>

                        {/* 6. Trip Dues */}
                        <td className="p-2.5 text-right font-extrabold text-amber-800 font-mono whitespace-nowrap">
                          {row.trip_dues > 0 ? (
                            <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                              ₹{row.trip_dues.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0</span>
                          )}
                        </td>

                        {/* 7. Closing amt */}
                        <td className="p-2.5 text-right font-black font-mono whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg border inline-block ${
                              isNeg
                                ? "bg-rose-100 text-rose-800 border-rose-300 font-black"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300 font-black"
                            }`}
                          >
                            ₹{row.closing_amt.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* 8. NAME & PHONE */}
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="font-black uppercase text-slate-900 leading-tight">
                            {row.name}
                          </div>
                          {row.phone_number && (
                            <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 mt-0.5 font-mono">
                              <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>{row.phone_number}</span>
                            </div>
                          )}
                        </td>

                        {/* 9. ACTIONS */}
                        <td className="p-2.5 text-center whitespace-nowrap no-print">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(row)}
                              className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                              title="Edit line"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Total / Closing Summary Bar */}
            <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-slate-900">
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">
                    Account Opening:
                  </span>
                  <strong className="text-white text-sm">
                    ₹{metrics.initialOpening.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">
                    Total Advance Received:
                  </span>
                  <strong className="text-emerald-400 text-sm">
                    ₹{metrics.totalAdvance.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">
                    Total Trip Dues:
                  </span>
                  <strong className="text-amber-400 text-sm">
                    ₹{metrics.totalDues.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-300">
                  CLOSING BALANCE AS ON 16/02/2026:
                </span>
                <span
                  className={`text-base font-black px-3 py-1 rounded-xl border ${
                    metrics.isNegative
                      ? "bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-inner"
                      : "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-inner"
                  }`}
                >
                  ₹{metrics.closingBalance.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-bold uppercase">
                    ({metrics.isNegative ? "Negative Due" : "Positive Credit"})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Instructions and Authorized Stamp Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch pt-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1">
              <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-700" /> Account Terms &amp; Settlement Notes
              </h4>
              <p className="text-[11px] text-slate-600">
                1. Positive balances reflect prepaid credits available for future trips.
              </p>
              <p className="text-[11px] text-slate-600">
                2. Negative balances reflect pending trip settlement due to Fortune Tourism.
              </p>
              <p className="text-[11px] text-slate-600">
                3. For corporate invoicing, GST credit statements or payment queries, contact Accounts Desk at +91 9740463404.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between text-right">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Authorized For Fortune Tourism
                </span>
                <div className="text-sm font-black text-slate-900 mt-1">
                  Accounts &amp; Corporate Booking Desk
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold pt-4">
                Statement Verified &amp; Signed · Narayana Health City, Bangalore
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer on Screen */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 no-print">
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredEntries.length}</strong> ledger records for <strong className="text-slate-800">Mr. David Sir Account</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add / Edit Trip Line Modal (Form with Passenger Phone & Company Name) */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#063f2d] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-black tracking-wide uppercase flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-300" />
                {editingEntry ? "Edit Ledger Entry" : "Add Trip / Payment Line"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5 text-xs text-slate-800">
              {/* Row 1: Date & Passenger Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">DATE (DD/MM/YYYY) *</label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. 15/02/2026"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#063f2d] rounded-xl px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">PASSENGER / NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mr.DAVID SIR"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#063f2d] rounded-xl px-3 py-2 text-xs font-bold outline-none uppercase"
                  />
                </div>
              </div>

              {/* Row 2: Company Name & Passenger Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">COMPANY NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. David Sir Account"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#063f2d] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">PASSENGER PHONE NUMBER</label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="e.g. +91 9740463404"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#063f2d] rounded-xl px-3 py-2 text-xs font-bold outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Trip / Activity Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">TRIP / ACTIVITY DESCRIPTION *</label>
                <input
                  type="text"
                  required
                  value={formData.trip}
                  onChange={(e) => setFormData({ ...formData, trip: e.target.value })}
                  placeholder="e.g. CHENNAI TO VILLA DROP AT:10.00 AM"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#063f2d] rounded-xl px-3 py-2 text-xs font-bold outline-none uppercase"
                />
              </div>

              {/* Row 4: Advance Payment Received & Trip Dues / Fare */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5">
                  <label className="font-bold text-emerald-900 block mb-1">
                    Advance Payment Received (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.advance_received}
                    onChange={(e) =>
                      setFormData({ ...formData, advance_received: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full bg-white border border-emerald-300 focus:border-emerald-600 rounded-lg px-2.5 py-1.5 text-xs font-black text-emerald-800 outline-none"
                  />
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">
                    Credits / Advance added to balance
                  </span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5">
                  <label className="font-bold text-amber-950 block mb-1">Trip Dues / Fare (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.trip_dues}
                    onChange={(e) => setFormData({ ...formData, trip_dues: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-white border border-amber-300 focus:border-amber-600 rounded-lg px-2.5 py-1.5 text-xs font-black text-amber-900 outline-none"
                  />
                  <span className="text-[10px] text-amber-700 mt-0.5 block">
                    Fare deducted from balance
                  </span>
                </div>
              </div>

              {/* Row 5: Additional Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional Notes (Optional)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Paid via PhonePe, nice road toll included"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#063f2d] rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#063f2d] hover:bg-[#086a46] text-white font-black text-xs shadow transition cursor-pointer"
                >
                  {editingEntry ? "Update Entry" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
