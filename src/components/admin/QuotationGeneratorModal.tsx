import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  X,
  Printer,
  Download,
  Share2,
  Save,
  Plus,
  Trash2,
  FileText,
  Copy,
  Check,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  FolderOpen,
  Edit,
  RotateCcw,
  ShieldCheck,
  Eye,
  Send,
  IndianRupee,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface QuotationLineItem {
  id: string;
  description: string;
  vehicleType: string;
  durationOrKm: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface QuotationData {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  preparedBy: string;

  // Customer Details
  clientName: string;
  clientContactPerson: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientGst: string;

  // Journey & Itinerary Details
  subject: string;
  serviceCategory: string;
  fromLocation: string;
  toLocation: string;
  travelStartDate: string;
  travelEndDate: string;
  reportingTime: string;
  vehicleName: string;
  passengerCount: number;

  // Line items
  items: QuotationLineItem[];

  // Financials
  subtotal: number;
  driverAllowance: number;
  tollPermitStatus: "included" | "at_actuals";
  gstRate: number; // 0, 5, 12, 18
  gstAmount: number;
  discount: number;
  grandTotal: number;

  // Terms & Conditions
  terms: string[];
  notes: string;

  // Bank & UPI Details
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  merchantName: string;

  status: "Draft" | "Sent" | "Approved" | "Converted";
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "fortune_saved_quotations_v1";

function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FT/QUOT/${year}/${rand}`;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPlusDaysString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(rawDate?: string): string {
  if (!rawDate) return "—";
  try {
    const [y, m, d] = rawDate.split("-");
    if (y && m && d) return `${d}/${m}/${y}`;
  } catch {
    // fallback
  }
  return rawDate;
}

function numberToIndianWords(num: number): string {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const n = Math.floor(num);
  if (n === 0) return "Zero Rupees Only";

  const numStr = n.toString();
  if (numStr.length > 9) return `Rupees ${num.toLocaleString("en-IN")} Only`;

  const pad = ("000000000" + numStr).substr(-9);
  const crore = parseInt(pad.substr(0, 2), 10);
  const lakh = parseInt(pad.substr(2, 2), 10);
  const thousand = parseInt(pad.substr(4, 2), 10);
  const hundred = parseInt(pad.substr(6, 1), 10);
  const rest = parseInt(pad.substr(7, 2), 10);

  let str = "";
  if (crore > 0) {
    str += (a[crore] || `${b[Math.floor(crore / 10)]} ${a[crore % 10]}`) + "Crore ";
  }
  if (lakh > 0) {
    str += (a[lakh] || `${b[Math.floor(lakh / 10)]} ${a[lakh % 10]}`) + "Lakh ";
  }
  if (thousand > 0) {
    str += (a[thousand] || `${b[Math.floor(thousand / 10)]} ${a[thousand % 10]}`) + "Thousand ";
  }
  if (hundred > 0) {
    str += a[hundred] + "Hundred ";
  }
  if (rest > 0) {
    if (str !== "") str += "and ";
    str += a[rest] || `${b[Math.floor(rest / 10)]} ${a[rest % 10]}`;
  }

  return `Rupees ${str.trim()} Only`;
}

const DEFAULT_TERMS: string[] = [
  "1. Vehicle fuel, maintenance, and experienced driver allowance are covered as per quotation.",
  "2. Toll charges, parking fees, and interstate border entry permits are billed extra at actual receipts unless explicitly indicated as included.",
  "3. Standard driver duty timings: 06:00 AM to 10:00 PM. Night driving / detention charges apply between 10:00 PM and 06:00 AM.",
  "4. Air conditioning operates smoothly across regular highways and city roads; AC may be turned off during steep mountain / ghat sections as per engine safety standards.",
  "5. Payment terms: 25% to 50% token advance upon confirmation; balance settlement directly with driver or via PhonePe/UPI prior to trip completion.",
  "6. Rates quoted are subject to vehicle availability at the time of final confirmation and booking lock.",
];

function createDefaultQuotation(): QuotationData {
  return {
    id: `quot-${Date.now()}`,
    quotationNumber: generateQuotationNumber(),
    quotationDate: getTodayString(),
    validUntil: getPlusDaysString(7),
    preparedBy: "ZAMEER S (Super Admin)",

    clientName: "Valued Customer / Corporate Client",
    clientContactPerson: "General Manager / Travel Coordinator",
    clientPhone: "9845003000",
    clientEmail: "client@example.com",
    clientAddress: "Electronic City, Hosur Road, Bengaluru, Karnataka 560100",
    clientGst: "",

    subject: "Quotation for Luxury Cab Rental & Outstation Travel Services",
    serviceCategory: "Outstation Tour Package",
    fromLocation: "Bangalore (Bengaluru)",
    toLocation: "Mysore ➔ Ooty ➔ Coonoor",
    travelStartDate: getTodayString(),
    travelEndDate: getPlusDaysString(2),
    reportingTime: "06:30 AM",
    vehicleName: "Toyota Innova Crysta (AC 7-Seater Luxury)",
    passengerCount: 5,

    items: [
      {
        id: "item-1",
        description: "Outstation Round Trip 2-Way Travel (Bengaluru ➔ Mysore ➔ Ooty ➔ Bengaluru)",
        vehicleType: "Toyota Innova Crysta",
        durationOrKm: "3 Days / 900 Kms Included",
        qty: 3,
        rate: 6800,
        amount: 20400,
      },
      {
        id: "item-2",
        description: "Driver Daily Allowance & Bata (Night Halt / Outstation Duty)",
        vehicleType: "Chauffeur Service",
        durationOrKm: "3 Days @ ₹400 / day",
        qty: 3,
        rate: 400,
        amount: 1200,
      },
    ],

    subtotal: 21600,
    driverAllowance: 1200,
    tollPermitStatus: "at_actuals",
    gstRate: 5,
    gstAmount: 1080,
    discount: 680,
    grandTotal: 22000,

    terms: DEFAULT_TERMS,
    notes:
      "Special Corporate / Group Rate applied. Clean sanitized vehicle with professional verified driver will be assigned.",

    bankName: "Axis Bank / Canara Bank",
    accountNumber: "921020045612348",
    ifscCode: "UTIB0001423",
    upiId: "fortunetourism@okaxis",
    merchantName: "FORTUNE Tourism / ZAMEER S",

    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function loadSavedQuotations(): QuotationData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load saved quotations", err);
    return [];
  }
}

function persistQuotations(list: QuotationData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to persist quotations", err);
  }
}

interface QuotationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuotationGeneratorModal({ isOpen, onClose }: QuotationGeneratorModalProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "saved">("edit");
  const [quotation, setQuotation] = useState<QuotationData>(() => createDefaultQuotation());
  const [savedList, setSavedList] = useState<QuotationData[]>(() => loadSavedQuotations());
  const [savedSearch, setSavedSearch] = useState<string>("");
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Sync saved list when opening
  useEffect(() => {
    if (isOpen) {
      setSavedList(loadSavedQuotations());
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Recalculate Subtotal, GST, Grand Total whenever items, gstRate, or discount change
  const recalculateCommercials = (
    items: QuotationLineItem[],
    gstRate: number,
    discount: number
  ) => {
    const sub = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const gst = Math.round((sub * gstRate) / 100);
    const grand = Math.max(0, sub + gst - (Number(discount) || 0));
    return { subtotal: sub, gstAmount: gst, grandTotal: grand };
  };

  const handleItemChange = (id: string, field: keyof QuotationLineItem, value: any) => {
    setQuotation((prev) => {
      const updated = prev.items.map((item) => {
        if (item.id !== id) return item;
        const newItem = { ...item, [field]: value };
        if (field === "rate" || field === "qty") {
          const r = Number(field === "rate" ? value : newItem.rate) || 0;
          const q = Number(field === "qty" ? value : (newItem.qty ?? 1)) || 1;
          newItem.amount = r * q;
        }
        return newItem;
      });
      const comm = recalculateCommercials(updated, prev.gstRate, prev.discount);
      return { ...prev, items: updated, ...comm, updatedAt: new Date().toISOString() };
    });
  };

  const handleAddItem = () => {
    const newItem: QuotationLineItem = {
      id: `item-${Date.now()}`,
      description: "Additional Travel Service / Local Detention",
      vehicleType: quotation.vehicleName || "Cab",
      durationOrKm: "1 Day",
      qty: 1,
      rate: 1500,
      amount: 1500,
    };
    setQuotation((prev) => {
      const updated = [...prev.items, newItem];
      const comm = recalculateCommercials(updated, prev.gstRate, prev.discount);
      return { ...prev, items: updated, ...comm, updatedAt: new Date().toISOString() };
    });
    toast.success("New line item added");
  };

  const handleRemoveItem = (id: string) => {
    if (quotation.items.length <= 1) {
      toast.error("Quotation must have at least one line item");
      return;
    }
    setQuotation((prev) => {
      const updated = prev.items.filter((i) => i.id !== id);
      const comm = recalculateCommercials(updated, prev.gstRate, prev.discount);
      return { ...prev, items: updated, ...comm, updatedAt: new Date().toISOString() };
    });
  };

  const handleApplyTemplate = (type: "outstation" | "local" | "airport" | "tempo") => {
    let t: QuotationData = { ...quotation };
    if (type === "outstation") {
      t.subject = "Quotation for 3-Day Mysore & Coorg Outstation Tour Package";
      t.serviceCategory = "Outstation Cab Rental";
      t.fromLocation = "Bangalore";
      t.toLocation = "Mysore ➔ Coorg ➔ Bangalore";
      t.vehicleName = "Toyota Innova Crysta (7-Seater AC Luxury)";
      t.items = [
        {
          id: `item-${Date.now()}-1`,
          description: "Outstation 3 Days Package (900 Kms Included, Extra @ ₹18/km)",
          vehicleType: "Innova Crysta",
          durationOrKm: "3 Days / 900 Kms",
          qty: 3,
          rate: 6500,
          amount: 19500,
        },
        {
          id: `item-${Date.now()}-2`,
          description: "Driver Daily Bata / Night Allowance",
          vehicleType: "Driver Bata",
          durationOrKm: "3 Days @ ₹400",
          qty: 3,
          rate: 400,
          amount: 1200,
        },
      ];
    } else if (type === "local") {
      t.subject = "Quotation for Bangalore City Full Day Sightseeing & Local Usage";
      t.serviceCategory = "Local Hourly Rental";
      t.fromLocation = "Bangalore";
      t.toLocation = "Bangalore Local Sightseeing";
      t.vehicleName = "Maruti Suzuki Dzire / Ciaz (AC Sedan)";
      t.items = [
        {
          id: `item-${Date.now()}-1`,
          description: "Full Day Local Sightseeing Package (8 Hours / 80 Kilometers Included)",
          vehicleType: "Sedan (Dzire/Etios)",
          durationOrKm: "8hr / 80km",
          qty: 1,
          rate: 2200,
          amount: 2200,
        },
        {
          id: `item-${Date.now()}-2`,
          description: "Estimated Extra Hours / Fuel Buffer (Optional)",
          vehicleType: "Extra Time",
          durationOrKm: "2 Hours @ ₹150",
          qty: 2,
          rate: 150,
          amount: 300,
        },
      ];
    } else if (type === "airport") {
      t.subject = "Quotation for Kempegowda International Airport (BLR) Transfers";
      t.serviceCategory = "Airport Transfer";
      t.fromLocation = "Electronic City / Bommasandra";
      t.toLocation = "Kempegowda International Airport (BLR) Terminal 1/2";
      t.vehicleName = "Maruti Suzuki Dzire / Toyota Etios (Sedan)";
      t.items = [
        {
          id: `item-${Date.now()}-1`,
          description: "Airport Drop / Pickup Dedicated Transfer (Toll Included)",
          vehicleType: "AC Sedan",
          durationOrKm: "One Way Transfer (65 Kms)",
          qty: 1,
          rate: 1800,
          amount: 1800,
        },
      ];
    } else if (type === "tempo") {
      t.subject = "Quotation for 12/17-Seater Luxury Tempo Traveller Group Travel";
      t.serviceCategory = "Tempo Traveller Group Tour";
      t.fromLocation = "Bangalore";
      t.toLocation = "Mysore ➔ Ooty ➔ Bangalore";
      t.vehicleName = "Force Tempo Traveller (12-Seater Luxury Recliner AC)";
      t.items = [
        {
          id: `item-${Date.now()}-1`,
          description: "Tempo Traveller 12-Seater Package (300 Kms/day Included, Extra @ ₹26/km)",
          vehicleType: "12-Seater TT",
          durationOrKm: "2 Days / 600 Kms",
          qty: 2,
          rate: 8500,
          amount: 17000,
        },
        {
          id: `item-${Date.now()}-2`,
          description: "Driver Daily Bata / Night Allowance",
          vehicleType: "Driver Allowance",
          durationOrKm: "2 Days @ ₹500",
          qty: 2,
          rate: 500,
          amount: 1000,
        },
      ];
    }
    const comm = recalculateCommercials(t.items, t.gstRate, t.discount);
    setQuotation({ ...t, ...comm, updatedAt: new Date().toISOString() });
    toast.success(`Loaded "${t.subject}" template`);
  };

  // Save Quotation to LocalStorage
  const handleSaveQuotation = () => {
    const list = loadSavedQuotations();
    const existingIdx = list.findIndex((q) => q.id === quotation.id);
    let updated: QuotationData[];
    const payload: QuotationData = {
      ...quotation,
      updatedAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      updated = [...list];
      updated[existingIdx] = payload;
    } else {
      updated = [payload, ...list];
    }
    persistQuotations(updated);
    setSavedList(updated);
    toast.success(`Quotation ${quotation.quotationNumber} saved successfully!`);
  };

  const handleLoadSaved = (saved: QuotationData) => {
    setQuotation({ ...saved });
    setActiveTab("preview");
    toast.success(`Loaded quotation: ${saved.quotationNumber}`);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedList.filter((q) => q.id !== id);
    persistQuotations(filtered);
    setSavedList(filtered);
    toast.success("Quotation deleted from saved records");
  };

  const handleNewQuotation = () => {
    setQuotation(createDefaultQuotation());
    setActiveTab("edit");
    toast.info("Started new quotation with fresh reference number");
  };

  const handlePrint = () => {
    if (activeTab !== "preview") {
      setActiveTab("preview");
      setTimeout(() => {
        window.print();
      }, 250);
    } else {
      window.print();
    }
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(quotation.upiId);
    setCopiedUPI(true);
    toast.success(`Copied UPI ID: ${quotation.upiId}`);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      setIsDownloadingPDF(true);
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Outer Decorative Border
      doc.setDrawColor(6, 63, 45); // Fortune deep green
      doc.setLineWidth(0.6);
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 2, 2, "S");

      // Company Brand Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(6, 63, 45);
      doc.text("FORTUNE Tourism", 14, 18);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Meets all your Travel Need", 14, 23);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Email: travel@fortunetourism.co.in | Web: www.fortunetourism.com | Helpline: +91 9740463404", 14, 28);

      // Title & Quotation Meta Box (Right aligned)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(180, 83, 9); // Amber
      doc.text("OFFICIAL TRAVEL QUOTATION", pageWidth - 14, 18, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(`QUOTATION NO: ${quotation.quotationNumber}`, pageWidth - 14, 23, { align: "right" });
      doc.text(`DATE: ${formatDateDisplay(quotation.quotationDate)} | VALID: ${formatDateDisplay(quotation.validUntil)}`, pageWidth - 14, 28, { align: "right" });

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(14, 31, pageWidth - 14, 31);

      // Client & Trip Summary Box
      autoTable(doc, {
        startY: 34,
        margin: { left: 14, right: 14 },
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 2, textColor: [30, 30, 30] },
        body: [
          [
            { content: "QUOTATION FOR:", styles: { fontStyle: "bold", textColor: [6, 63, 45] } },
            { content: quotation.clientName.toUpperCase(), styles: { fontStyle: "bold" } },
            { content: "SUBJECT:", styles: { fontStyle: "bold", textColor: [6, 63, 45] } },
            { content: quotation.subject, styles: { fontStyle: "bold" } },
          ],
          [
            { content: "Contact Person:", styles: { fontStyle: "bold" } },
            { content: quotation.clientContactPerson || "N/A" },
            { content: "Service Type:", styles: { fontStyle: "bold" } },
            { content: quotation.serviceCategory },
          ],
          [
            { content: "Phone / Mobile:", styles: { fontStyle: "bold" } },
            { content: quotation.clientPhone },
            { content: "Route / Locations:", styles: { fontStyle: "bold" } },
            { content: `${quotation.fromLocation} ➔ ${quotation.toLocation}` },
          ],
          [
            { content: "Billing Address:", styles: { fontStyle: "bold" } },
            { content: quotation.clientAddress || "Bengaluru, Karnataka" },
            { content: "Travel Dates:", styles: { fontStyle: "bold" } },
            { content: `${formatDateDisplay(quotation.travelStartDate)} to ${formatDateDisplay(quotation.travelEndDate)} (${quotation.reportingTime})` },
          ],
        ],
      });

      const clientY = (doc as any).lastAutoTable?.finalY || 60;

      // Line items table
      const tableRows = quotation.items.map((item, idx) => [
        idx + 1,
        item.description,
        item.vehicleType,
        item.durationOrKm,
        item.qty ?? 1,
        `INR ${Number(item.rate).toLocaleString("en-IN")}`,
        `INR ${Number(item.amount).toLocaleString("en-IN")}`,
      ]);

      autoTable(doc, {
        startY: clientY + 4,
        margin: { left: 14, right: 14 },
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [20, 20, 20],
          lineColor: [200, 200, 200],
          lineWidth: 0.3,
        },
        headStyles: {
          fillColor: [6, 63, 45],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        head: [["#", "Description of Travel Service", "Vehicle / Mode", "Duration / Kms", "Qty / Days", "Rate", "Amount"]],
        body: tableRows,
      });

      const itemsY = (doc as any).lastAutoTable?.finalY || 120;

      // Commercial Summary on Right
      autoTable(doc, {
        startY: itemsY + 3,
        margin: { left: pageWidth - 90, right: 14 },
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 2, textColor: [30, 30, 30] },
        body: [
          ["Subtotal:", `INR ${quotation.subtotal.toLocaleString("en-IN")}`],
          [`GST (${quotation.gstRate}%):`, `INR ${quotation.gstAmount.toLocaleString("en-IN")}`],
          ["Toll / Permits:", quotation.tollPermitStatus === "included" ? "INCLUDED" : "AT ACTUALS"],
          ["Discount / Adjustment:", quotation.discount > 0 ? `- INR ${quotation.discount.toLocaleString("en-IN")}` : "INR 0"],
          [
            { content: "GRAND TOTAL:", styles: { fontStyle: "bold", fontSize: 9.5, textColor: [6, 63, 45] } },
            { content: `INR ${quotation.grandTotal.toLocaleString("en-IN")}`, styles: { fontStyle: "bold", fontSize: 9.5, textColor: [6, 63, 45] } },
          ],
        ],
      });

      // Amount in Words below table
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`Amount in Words: ${numberToIndianWords(quotation.grandTotal)}`, 14, itemsY + 6);

      // Terms & Conditions (Left Column)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(6, 63, 45);
      doc.text("TERMS & CONDITIONS", 14, itemsY + 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(70, 70, 70);
      quotation.terms.slice(0, 5).forEach((term, idx) => {
        doc.text(term, 14, itemsY + 21 + idx * 4);
      });

      // Payment Box with PhonePe QR
      const payBoxY = itemsY + 44;
      doc.setDrawColor(95, 37, 159);
      doc.setFillColor(250, 245, 255);
      doc.roundedRect(14, payBoxY, pageWidth - 28, 22, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(95, 37, 159);
      doc.text("Official Payment Settlement / UPI Details (PhonePe Accepted Here)", 18, payBoxY + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(40, 40, 40);
      doc.text(`Merchant Name: ${quotation.merchantName} | Bank: ${quotation.bankName} | A/C: ${quotation.accountNumber} | IFSC: ${quotation.ifscCode}`, 18, payBoxY + 10);
      doc.text(`Official UPI ID: ${quotation.upiId} (Scan via PhonePe, Google Pay, Paytm, or Any UPI App)`, 18, payBoxY + 15);

      // Signatory
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      doc.text("For FORTUNE Tourism", pageWidth - 20, pageHeight - 24, { align: "right" });
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("Authorized Signatory", pageWidth - 20, pageHeight - 17, { align: "right" });

      // Official Footer (Exact from Letterhead)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(
        "# 5, DG Complex, Hennaragara Gate, Bommasandra, Bangalore - 560 099",
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "travel@fortunetourism.co.in | www.fortunetourism.com | Helpline: +91 9740463404",
        pageWidth / 2,
        pageHeight - 8.5,
        { align: "center" }
      );

      doc.save(`Fortune-Tourism-Quotation-${quotation.quotationNumber.replace(/\//g, "-")}.pdf`);
      toast.success("PDF Quotation downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed", err);
      toast.error("Failed to generate PDF quotation");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*FORTUNE Tourism*
*OFFICIAL TRAVEL QUOTATION*
------------------------------------
*Quotation No:* ${quotation.quotationNumber}
*Date:* ${formatDateDisplay(quotation.quotationDate)}
*Client:* ${quotation.clientName}
*Subject:* ${quotation.subject}
*Route:* ${quotation.fromLocation} ➔ ${quotation.toLocation}
*Dates:* ${formatDateDisplay(quotation.travelStartDate)} to ${formatDateDisplay(quotation.travelEndDate)}
*Vehicle:* ${quotation.vehicleName}

*Estimated Fare:* ₹${quotation.grandTotal.toLocaleString("en-IN")}
(${numberToIndianWords(quotation.grandTotal)})

*Payment UPI:* ${quotation.upiId} (ZAMEER S)
------------------------------------
# 5, DG Complex, Hennaragara Gate, Bommasandra, Bangalore - 560 099
Helpline: +91 9740463404 | travel@fortunetourism.co.in`;

    const cleanPhone = quotation.clientPhone.replace(/\D/g, "");
    const url = cleanPhone
      ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp with quotation details");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Printable CSS block for Official Letterhead Quotation */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden !important;
          }
          #official-quotation-letterhead-print,
          #official-quotation-letterhead-print * {
            visibility: visible !important;
          }
          #official-quotation-letterhead-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: 1px solid #063f2d !important;
            padding: 10mm !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Top Modal Header */}
        <div className="bg-[#063f2d] text-white px-5 py-4 flex items-center justify-between gap-3 shadow-md no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg tracking-wide">
                  Official Letterhead Quotation Generator
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Write, calculate, print on official Fortune Tourism letterhead, and save quotations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewQuotation}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" /> New Quote
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex items-center justify-between gap-3 flex-wrap no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "edit"
                  ? "bg-[#063f2d] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Edit className="w-3.5 h-3.5" /> 1. Write / Edit Data
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "preview"
                  ? "bg-[#063f2d] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> 2. Letterhead Preview &amp; Print
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "saved"
                  ? "bg-[#063f2d] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" /> 3. Saved Records ({savedList.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveQuotation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Quotation
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" /> Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-black shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" /> {isDownloadingPDF ? "Downloading..." : "PDF"}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
          {/* TAB 1: WRITE / EDIT DATA */}
          {activeTab === "edit" && (
            <div className="space-y-6">
              {/* Quick Template Presets */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Load Quick Quotation Templates
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Instantly populates itinerary, vehicle, and tariff table
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { key: "outstation", label: "3-Day Mysore & Coorg Innova", icon: "🚗" },
                    { key: "local", label: "Bangalore Local 8hr/80km Sedan", icon: "🏙️" },
                    { key: "airport", label: "BLR Airport Pickup/Drop Transfer", icon: "✈️" },
                    { key: "tempo", label: "12-Seater Tempo Traveller Tour", icon: "🚐" },
                  ].map((tpl) => (
                    <button
                      key={tpl.key}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl.key as any)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-[#063f2d] hover:border-emerald-300 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{tpl.icon}</span>
                      <span>{tpl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid: Meta & Client Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Quotation Metadata Card */}
                <div className="md:col-span-5 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <FileText className="w-4 h-4 text-[#063f2d]" /> Quotation Information
                  </h3>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Quotation Number
                    </label>
                    <input
                      type="text"
                      value={quotation.quotationNumber}
                      onChange={(e) => setQuotation({ ...quotation, quotationNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-amber-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Date</label>
                      <input
                        type="date"
                        value={quotation.quotationDate}
                        onChange={(e) => setQuotation({ ...quotation, quotationDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Valid Until</label>
                      <input
                        type="date"
                        value={quotation.validUntil}
                        onChange={(e) => setQuotation({ ...quotation, validUntil: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Prepared By</label>
                    <input
                      type="text"
                      value={quotation.preparedBy}
                      onChange={(e) => setQuotation({ ...quotation, preparedBy: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Quote Status</label>
                    <select
                      value={quotation.status}
                      onChange={(e) => setQuotation({ ...quotation, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent to Client</option>
                      <option value="Approved">Approved by Client</option>
                      <option value="Converted">Converted to Active Booking</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details Card */}
                <div className="md:col-span-7 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <User className="w-4 h-4 text-[#063f2d]" /> Client / Corporate Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Client / Corporate Name *
                      </label>
                      <input
                        type="text"
                        value={quotation.clientName}
                        onChange={(e) => setQuotation({ ...quotation, clientName: e.target.value })}
                        placeholder="e.g. Infosys Ltd / Mr. Rajesh"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={quotation.clientContactPerson}
                        onChange={(e) => setQuotation({ ...quotation, clientContactPerson: e.target.value })}
                        placeholder="e.g. Admin Manager"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Phone / WhatsApp No *
                      </label>
                      <input
                        type="tel"
                        value={quotation.clientPhone}
                        onChange={(e) => setQuotation({ ...quotation, clientPhone: e.target.value })}
                        placeholder="e.g. 9845003000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={quotation.clientEmail}
                        onChange={(e) => setQuotation({ ...quotation, clientEmail: e.target.value })}
                        placeholder="e.g. client@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Billing Address
                      </label>
                      <input
                        type="text"
                        value={quotation.clientAddress}
                        onChange={(e) => setQuotation({ ...quotation, clientAddress: e.target.value })}
                        placeholder="e.g. Electronic City, Bengaluru"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        GSTIN (Optional)
                      </label>
                      <input
                        type="text"
                        value={quotation.clientGst}
                        onChange={(e) => setQuotation({ ...quotation, clientGst: e.target.value })}
                        placeholder="e.g. 29AAAAA0000A1Z5"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Journey & Itinerary Details Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <MapPin className="w-4 h-4 text-[#063f2d]" /> Journey &amp; Service Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Quotation Subject / Headline
                    </label>
                    <input
                      type="text"
                      value={quotation.subject}
                      onChange={(e) => setQuotation({ ...quotation, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Service Category
                    </label>
                    <select
                      value={quotation.serviceCategory}
                      onChange={(e) => setQuotation({ ...quotation, serviceCategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="Outstation Tour Package">Outstation Tour Package</option>
                      <option value="Local Hourly Cab Rental">Local Hourly Cab Rental</option>
                      <option value="Airport Transfer Service">Airport Transfer Service</option>
                      <option value="Sightseeing Day Tour">Sightseeing Day Tour</option>
                      <option value="Corporate Fleet Monthly">Corporate Fleet Monthly</option>
                      <option value="Tempo Traveller Group Trip">Tempo Traveller Group Trip</option>
                      <option value="Hotel & Travel Logistics">Hotel &amp; Travel Logistics</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Vehicle Type
                    </label>
                    <input
                      type="text"
                      value={quotation.vehicleName}
                      onChange={(e) => setQuotation({ ...quotation, vehicleName: e.target.value })}
                      placeholder="e.g. Innova Crysta / Dzire Sedan"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      From Location
                    </label>
                    <input
                      type="text"
                      value={quotation.fromLocation}
                      onChange={(e) => setQuotation({ ...quotation, fromLocation: e.target.value })}
                      placeholder="e.g. Bangalore"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Destination (To)
                    </label>
                    <input
                      type="text"
                      value={quotation.toLocation}
                      onChange={(e) => setQuotation({ ...quotation, toLocation: e.target.value })}
                      placeholder="e.g. Mysore ➔ Ooty"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={quotation.travelStartDate}
                      onChange={(e) => setQuotation({ ...quotation, travelStartDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={quotation.travelEndDate}
                      onChange={(e) => setQuotation({ ...quotation, travelEndDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Reporting Time
                    </label>
                    <input
                      type="text"
                      value={quotation.reportingTime}
                      onChange={(e) => setQuotation({ ...quotation, reportingTime: e.target.value })}
                      placeholder="e.g. 06:30 AM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Table Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap border-b pb-2">
                  <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-[#063f2d]" /> Line Items &amp; Tariff Breakdown
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#063f2d] font-bold text-xs rounded-xl border border-emerald-300 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2.5 w-10 text-center">#</th>
                        <th className="p-2.5 min-w-[220px]">Service / Vehicle Description</th>
                        <th className="p-2.5 min-w-[120px]">Vehicle / Category</th>
                        <th className="p-2.5 min-w-[110px]">Duration / Kms</th>
                        <th className="p-2.5 w-20 text-center">Qty / Days</th>
                        <th className="p-2.5 w-28">Rate (₹)</th>
                        <th className="p-2.5 w-32">Amount (₹)</th>
                        <th className="p-2.5 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quotation.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.vehicleType}
                              onChange={(e) => handleItemChange(item.id, "vehicleType", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.durationOrKm}
                              onChange={(e) => handleItemChange(item.id, "durationOrKm", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.qty ?? 1}
                              onChange={(e) => handleItemChange(item.id, "qty", parseFloat(e.target.value) || 1)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(item.id, "rate", Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => handleItemChange(item.id, "amount", Number(e.target.value))}
                              className="w-full bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-black text-emerald-900"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Commercials Summary Panel */}
                <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-2 text-xs text-slate-600 max-w-sm">
                    <div className="font-bold text-slate-900 uppercase text-[11px]">
                      Tolls, Parking &amp; Permits Note:
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tollStatus"
                          checked={quotation.tollPermitStatus === "at_actuals"}
                          onChange={() => setQuotation({ ...quotation, tollPermitStatus: "at_actuals" })}
                        />
                        <span>Extra At Actuals</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tollStatus"
                          checked={quotation.tollPermitStatus === "included"}
                          onChange={() => setQuotation({ ...quotation, tollPermitStatus: "included" })}
                        />
                        <span>Included in Quote</span>
                      </label>
                    </div>
                    <div className="text-[11px] text-slate-500 italic">
                      Amount in Words: <strong>{numberToIndianWords(quotation.grandTotal)}</strong>
                    </div>
                  </div>

                  <div className="w-full sm:w-72 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-bold">₹{quotation.subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-600">GST Rate:</span>
                      <select
                        value={quotation.gstRate}
                        onChange={(e) => {
                          const r = Number(e.target.value);
                          const comm = recalculateCommercials(quotation.items, r, quotation.discount);
                          setQuotation({ ...quotation, gstRate: r, ...comm });
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold"
                      >
                        <option value={0}>0% (Exempt)</option>
                        <option value={5}>5% (Transport GST)</option>
                        <option value={12}>12% GST</option>
                        <option value={18}>18% GST</option>
                      </select>
                      <span className="font-bold">₹{quotation.gstAmount.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-600">Discount (₹):</span>
                      <input
                        type="number"
                        value={quotation.discount}
                        onChange={(e) => {
                          const disc = Number(e.target.value) || 0;
                          const comm = recalculateCommercials(quotation.items, quotation.gstRate, disc);
                          setQuotation({ ...quotation, discount: disc, ...comm });
                        }}
                        className="w-24 text-right bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-red-600"
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-[#063f2d]">
                      <span>Grand Total:</span>
                      <span>₹{quotation.grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex justify-between items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleNewQuotation}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Clear &amp; Reset Form
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className="px-5 py-2.5 bg-[#063f2d] hover:bg-[#086a46] text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    View Official Letterhead Preview <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL LETTERHEAD PREVIEW & PRINT */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex-wrap no-print">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-900">
                    Official Letterhead Mode (Fortune Tourism)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Quotation Data
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp Quote
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-1.5 bg-[#063f2d] hover:bg-[#086a46] text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" /> Print Letterhead
                  </button>
                </div>
              </div>

              {/* THE OFFICIAL LETTERHEAD CANVAS CONTAINER (Exact Match for Uploaded Image) */}
              <div
                id="official-quotation-letterhead-print"
                className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl max-w-4xl mx-auto space-y-6 relative overflow-hidden font-sans text-slate-900"
                style={{ minHeight: "1050px" }}
              >
                {/* Center Stylized Watermark (from uploaded letterhead) */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center select-none"
                  style={{
                    backgroundImage: `url('/images/fortune-letterhead.jpg')`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                  }}
                />

                {/* Top Letterhead Header: Logo & Company Name */}
                <div className="border-b-2 border-[#063f2d] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3.5">
                    {/* Crest Circular Logo */}
                    <div className="w-14 h-14 rounded-full border-2 border-[#063f2d] bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <span className="font-serif font-black text-2xl text-[#063f2d] tracking-tighter">
                        FT
                      </span>
                    </div>
                    <div>
                      <h1 className="font-serif font-black text-xl sm:text-2xl text-[#063f2d] tracking-wide leading-tight">
                        FORTUNE Tourism
                      </h1>
                      <p className="font-serif italic text-xs sm:text-sm text-slate-600 font-semibold tracking-wide mt-0.5">
                        Meets all your Travel Need
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-1 sm:self-center">
                    <div className="inline-block bg-[#063f2d] text-amber-300 font-black text-[11px] px-3 py-1 rounded-md tracking-wider uppercase">
                      OFFICIAL QUOTATION
                    </div>
                    <div className="text-[11px] font-bold text-slate-900">
                      REF NO: <span className="font-mono text-amber-800 font-black">{quotation.quotationNumber}</span>
                    </div>
                    <div className="text-[10.5px] text-slate-600 font-semibold">
                      DATE: <strong className="text-slate-900">{formatDateDisplay(quotation.quotationDate)}</strong> | VALID TILL: <strong className="text-slate-900">{formatDateDisplay(quotation.validUntil)}</strong>
                    </div>
                  </div>
                </div>

                {/* Client & Itinerary Brief Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 text-xs">
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/70 space-y-1">
                    <div className="font-black text-[11px] text-[#063f2d] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Quoted To (Client / Organization):
                    </div>
                    <div className="font-black text-sm text-slate-950 uppercase">{quotation.clientName}</div>
                    {quotation.clientContactPerson && (
                      <div className="text-slate-700">Attn: <strong>{quotation.clientContactPerson}</strong></div>
                    )}
                    <div className="text-slate-700">Phone: <strong>{quotation.clientPhone}</strong></div>
                    {quotation.clientEmail && <div className="text-slate-700">Email: {quotation.clientEmail}</div>}
                    {quotation.clientAddress && <div className="text-slate-600 text-[11px]">{quotation.clientAddress}</div>}
                    {quotation.clientGst && <div className="text-slate-700 font-mono font-bold">GSTIN: {quotation.clientGst}</div>}
                  </div>

                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/70 space-y-1">
                    <div className="font-black text-[11px] text-[#063f2d] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Tour &amp; Service Specifications:
                    </div>
                    <div className="font-bold text-slate-900">{quotation.subject}</div>
                    <div className="text-slate-700">
                      Route: <strong>{quotation.fromLocation} ➔ {quotation.toLocation}</strong>
                    </div>
                    <div className="text-slate-700">
                      Travel Dates: <strong>{formatDateDisplay(quotation.travelStartDate)}</strong> to <strong>{formatDateDisplay(quotation.travelEndDate)}</strong>
                    </div>
                    <div className="text-slate-700">
                      Vehicle / Fleet: <strong className="text-emerald-900">{quotation.vehicleName}</strong>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Reporting Time: <strong>{quotation.reportingTime}</strong> | Category: {quotation.serviceCategory}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border-2 border-slate-900 rounded-xl overflow-hidden relative z-10 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#063f2d] text-white font-black text-xs uppercase tracking-wide">
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Description of Travel Service</th>
                        <th className="p-3 w-32">Vehicle / Mode</th>
                        <th className="p-3 w-28">Duration / Kms</th>
                        <th className="p-3 w-20 text-center">Qty / Days</th>
                        <th className="p-3 w-24 text-right">Rate (₹)</th>
                        <th className="p-3 w-28 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 font-sans">
                      {quotation.items.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-950">{item.description}</td>
                          <td className="p-3 text-slate-800 font-semibold">{item.vehicleType}</td>
                          <td className="p-3 text-slate-700">{item.durationOrKm}</td>
                          <td className="p-3 text-center font-bold text-slate-800">{item.qty ?? 1}</td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            ₹{Number(item.rate).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-right font-black text-slate-950">
                            ₹{Number(item.amount).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Commercial Summary + Amount In Words */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative z-10 text-xs">
                  <div className="md:col-span-7 space-y-2">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-1">
                      <div className="text-[10.5px] font-bold text-[#063f2d] uppercase tracking-wide">
                        Amount in Words:
                      </div>
                      <div className="font-serif italic font-bold text-slate-900 text-xs sm:text-sm">
                        {numberToIndianWords(quotation.grandTotal)}
                      </div>
                    </div>

                    {/* Tolls & Inclusions Footnote */}
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>
                        • Toll, State Entry Permit &amp; Parking Charges:{" "}
                        <strong>{quotation.tollPermitStatus === "included" ? "INCLUDED IN QUOTATION" : "EXTRA AT ACTUALS AGAINST TOLL RECEIPTS"}</strong>
                      </div>
                      {quotation.notes && <div>• Special Note: {quotation.notes}</div>}
                    </div>
                  </div>

                  <div className="md:col-span-5 border border-slate-300 rounded-xl overflow-hidden bg-slate-50/80 text-xs">
                    <div className="divide-y divide-slate-200">
                      <div className="p-2.5 flex justify-between">
                        <span className="text-slate-600 font-medium">Subtotal Amount:</span>
                        <span className="font-bold">₹{quotation.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="p-2.5 flex justify-between">
                        <span className="text-slate-600 font-medium">GST ({quotation.gstRate}%):</span>
                        <span className="font-bold">₹{quotation.gstAmount.toLocaleString("en-IN")}</span>
                      </div>
                      {quotation.discount > 0 && (
                        <div className="p-2.5 flex justify-between text-red-600">
                          <span className="font-medium">Special Discount:</span>
                          <span className="font-bold">- ₹{quotation.discount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="p-3 bg-emerald-100/70 flex justify-between items-center text-sm font-black text-[#063f2d]">
                        <span>NET GRAND TOTAL:</span>
                        <span className="text-base sm:text-lg">₹{quotation.grandTotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Official Payment Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch relative z-10 text-xs">
                  {/* Terms & Instructions */}
                  <div className="md:col-span-8 border border-slate-300 rounded-xl p-3 bg-slate-50/50 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="font-black text-[10.5px] text-[#063f2d] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Standard Terms &amp; Instructions
                      </div>
                      <div className="space-y-1 text-[10px] text-slate-700 leading-relaxed">
                        {quotation.terms.slice(0, 5).map((term, i) => (
                          <div key={i}>{term}</div>
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200">
                      Subject to Bangalore jurisdiction. Quotation valid for 7 days from issue date.
                    </div>
                  </div>

                  {/* Official PhonePe / UPI Box with ZAMEER S QR */}
                  <div className="md:col-span-4 border-2 border-purple-300 bg-purple-50/70 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="text-[10px] font-black uppercase text-purple-950 tracking-wider flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[8px] font-bold">पे</span>
                      PhonePe Accepted Here
                    </div>
                    <div className="w-24 my-1.5 bg-white p-1 rounded-lg border border-purple-200 shadow-xs">
                      <img
                        src="/images/phonepe-qr.jpg"
                        alt="PhonePe Payment QR - ZAMEER S"
                        className="w-full h-auto object-contain rounded"
                      />
                    </div>
                    <div className="text-[10.5px] font-extrabold text-slate-900">
                      Merchant: ZAMEER S
                    </div>
                    <div className="text-[9px] text-purple-700 font-mono font-bold mt-0.5">
                      UPI: {quotation.upiId}
                    </div>
                    <div className="text-[8.5px] text-slate-500 mt-1">
                      Scan via PhonePe, GPay, Paytm or Any UPI
                    </div>
                  </div>
                </div>

                {/* Authorized Signatory Line */}
                <div className="pt-6 flex justify-between items-end relative z-10 text-xs">
                  <div className="text-slate-600 text-[10.5px] space-y-0.5">
                    <div>Prepared by: <strong>{quotation.preparedBy}</strong></div>
                    <div>Helpline / 24x7 Support: <strong>+91 9740463404</strong></div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-[11px] font-black text-[#063f2d]">
                      For FORTUNE Tourism
                    </div>
                    <div className="h-10 flex items-center justify-end">
                      <div className="text-slate-400 italic text-[11px] border-b border-slate-400 w-40 text-center pb-0.5">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Letterhead Footer (Exact from Uploaded Image) */}
                <div className="border-t-2 border-[#063f2d] pt-3 text-center text-slate-700 relative z-10 space-y-0.5">
                  <div className="font-bold text-xs tracking-wide text-slate-900">
                    # 5, DG Complex, Hennaragara Gate, Bommasandra, Bangalore - 560 099
                  </div>
                  <div className="text-[11px] font-medium text-slate-600">
                    travel@fortunetourism.co.in | www.fortunetourism.com | Contact: +91 9740463404
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAVED QUOTATIONS HISTORY */}
          {activeTab === "saved" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={savedSearch}
                    onChange={(e) => setSavedSearch(e.target.value)}
                    placeholder="Search by Client Name, Quotation No, Route..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#063f2d]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleNewQuotation}
                  className="px-4 py-2 bg-[#063f2d] hover:bg-[#086a46] text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4 text-amber-300" /> Create Fresh Quotation
                </button>
              </div>

              {savedList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#063f2d] flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">No Saved Quotations Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Create a quotation in the Write tab and click &quot;Save Quotation&quot; to keep historical records of all client quotes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className="px-4 py-2 bg-[#063f2d] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Start First Quotation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedList
                    .filter((q) => {
                      if (!savedSearch) return true;
                      const s = savedSearch.toLowerCase();
                      return (
                        q.quotationNumber.toLowerCase().includes(s) ||
                        q.clientName.toLowerCase().includes(s) ||
                        q.subject.toLowerCase().includes(s) ||
                        q.fromLocation.toLowerCase().includes(s) ||
                        q.toLocation.toLowerCase().includes(s)
                      );
                    })
                    .map((saved) => (
                      <div
                        key={saved.id}
                        onClick={() => handleLoadSaved(saved)}
                        className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-[#063f2d] hover:shadow-md transition-all cursor-pointer space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                              {saved.quotationNumber}
                            </span>
                            <h4 className="font-black text-sm text-slate-900 mt-1.5 group-hover:text-[#063f2d] transition-colors">
                              {saved.clientName}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-1">{saved.subject}</p>
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              saved.status === "Approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : saved.status === "Sent"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {saved.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px]">ROUTE:</span>
                            <span className="font-bold text-slate-800 truncate block">
                              {saved.fromLocation} ➔ {saved.toLocation}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[10px]">TOTAL FARE:</span>
                            <span className="font-black text-emerald-800 text-xs block">
                              ₹{saved.grandTotal.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">DATE:</span>
                            <span>{formatDateDisplay(saved.quotationDate)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[10px]">PHONE:</span>
                            <span className="font-mono">{saved.clientPhone}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="text-[10px] text-slate-400">
                            Vehicle: <strong>{saved.vehicleName}</strong>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadSaved(saved);
                              }}
                              className="text-xs font-bold text-[#063f2d] hover:underline"
                            >
                              Load Quote ➔
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSaved(saved.id, e)}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                              title="Delete saved quote"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
