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
    clientPhone: "9964600247",
    clientEmail: "fortunetourism1@gmail.com",
    clientAddress: "Electronic City, Hosur Road, Bengaluru, Karnataka 560100",
    clientGst: "",

    subject: "Quotation for 3-Day Mysore & Coorg Outstation Tour Package",
    serviceCategory: "Outstation Cab Rental",
    fromLocation: "Bangalore",
    toLocation: "Mysore -> Coorg -> Bangalore",
    travelStartDate: getTodayString(),
    travelEndDate: getPlusDaysString(2),
    reportingTime: "06:30 AM",
    vehicleName: "Toyota Innova Crysta (7-Seater AC Luxury)",
    passengerCount: 5,

    items: [
      {
        id: "item-1",
        description: "Outstation 3 Days Package (900 Kms Included, Extra @ Rs. 18/km)",
        vehicleType: "Innova Crysta",
        durationOrKm: "3 Days / 900 Kms",
        qty: 3,
        rate: 6500,
        amount: 19500,
      },
      {
        id: "item-2",
        description: "Driver Daily Bata / Night Allowance",
        vehicleType: "Driver Bata",
        durationOrKm: "3 Days @ Rs. 400",
        qty: 3,
        rate: 400,
        amount: 1200,
      },
    ],

    subtotal: 20700,
    driverAllowance: 1200,
    tollPermitStatus: "at_actuals",
    gstRate: 0, // In this tour & cab sector, GST is removed / 0%
    gstAmount: 0,
    discount: 0,
    grandTotal: 20700,

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

function loadImgWithTimeout(src: string, timeoutMs: number = 2500): Promise<HTMLImageElement | undefined> {
  return new Promise((resolve) => {
    const el = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(undefined);
      }
    }, timeoutMs);

    el.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(el);
      }
    };
    el.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(undefined);
      }
    };
    try {
      el.crossOrigin = "anonymous";
    } catch {}
    el.src = src;
  });
}

function sanitizePdfText(text?: string): string {
  if (!text) return "";
  return text
    .replace(/[₹]/g, "Rs. ")
    .replace(/[➔→➜]/g, "->")
    .replace(/[–—]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
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
    t.gstRate = 0; // GST removed for this sector
    if (type === "outstation") {
      t.subject = "Quotation for 3-Day Mysore & Coorg Outstation Tour Package";
      t.serviceCategory = "Outstation Cab Rental";
      t.fromLocation = "Bangalore";
      t.toLocation = "Mysore -> Coorg -> Bangalore";
      t.vehicleName = "Toyota Innova Crysta (7-Seater AC Luxury)";
      t.items = [
        {
          id: `item-${Date.now()}-1`,
          description: "Outstation 3 Days Package (900 Kms Included, Extra @ Rs. 18/km)",
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
          durationOrKm: "3 Days @ Rs. 400",
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
          durationOrKm: "2 Hours @ Rs. 150",
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
      t.toLocation = "Mysore -> Ooty -> Bangalore";
      t.vehicleName = "Force Tempo Traveller (12-Seater Luxury Recliner AC)";
      t.items = [
        {
          id: `item-${Date.now()}-1`,
          description: "Tempo Traveller 12-Seater Package (300 Kms/day Included, Extra @ Rs. 26/km)",
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
          durationOrKm: "2 Days @ Rs. 500",
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

  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);

      const [logoImg, qrImg] = await Promise.all([
        loadImgWithTimeout("/fortune-tourism-full-logo.png").then(
          (img) => img || loadImgWithTimeout("/images/packages/fortune-tourism-full-logo.png")
        ),
        loadImgWithTimeout("/images/phonepe-qr.jpg").then(
          (img) => img || loadImgWithTimeout("/phonepe-qr.jpg")
        ),
      ]);

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

      // Outer Decorative Border (Matches Portal Letterhead Outer Green Line)
      doc.setDrawColor(6, 63, 45); // Fortune deep green
      doc.setLineWidth(0.8);
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 2.5, 2.5, "S");

      // Company Brand Logo / Header
      if (logoImg) {
        try {
          doc.addImage(logoImg, "PNG", 13, 11, 52, 11);
        } catch {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(15);
          doc.setTextColor(6, 63, 45);
          doc.text("FORTUNE Tourism", 13, 17);
        }
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(6, 63, 45);
        doc.text("FORTUNE Tourism", 13, 17);
      }

      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Meets all your Travel Need", 13, 24);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(60, 60, 60);
      doc.text("Email: travel@fortunetourism.co.in | Web: www.fortunetourism.com | Helpline: +91 9740463404", 13, 28);

      // Official Quotation Badge (Right Aligned - Exact Match for Portal)
      doc.setFillColor(6, 63, 45);
      doc.roundedRect(pageWidth - 68, 11, 55, 7.5, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(250, 204, 21); // Amber / Gold
      doc.text("OFFICIAL QUOTATION", pageWidth - 40.5, 16.2, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(20, 20, 20);
      doc.text("REF NO: ", pageWidth - 48, 22.5);
      doc.setTextColor(180, 83, 9);
      doc.text(quotation.quotationNumber, pageWidth - 13, 22.5, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);
      doc.text("DATE: ", pageWidth - 65, 27);
      doc.setTextColor(15, 15, 15);
      doc.text(`${formatDateDisplay(quotation.quotationDate)} | VALID TILL: ${formatDateDisplay(quotation.validUntil)}`, pageWidth - 13, 27, { align: "right" });

      // Horizontal Divider
      doc.setDrawColor(6, 63, 45);
      doc.setLineWidth(0.6);
      doc.line(13, 31, pageWidth - 13, 31);

      // ── Client & Tour Specifications Cards (Side-by-Side Matching Portal) ──
      const cardY = 34;
      const cardH = 37;
      const cardW = 90;

      // Card 1: Quoted To (Client / Organization)
      doc.setFillColor(248, 250, 248);
      doc.setDrawColor(180, 205, 195);
      doc.setLineWidth(0.4);
      doc.roundedRect(13, cardY, cardW, cardH, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(6, 63, 45);
      doc.text("QUOTED TO (CLIENT / ORGANIZATION):", 16, cardY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(10, 10, 10);
      doc.text(sanitizePdfText(quotation.clientName).toUpperCase(), 16, cardY + 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Attn: ", 16, cardY + 16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(sanitizePdfText(quotation.clientContactPerson || "N/A"), 24, cardY + 16);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("Phone: ", 16, cardY + 20.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(quotation.clientPhone || "—", 27, cardY + 20.5);

      if (quotation.clientEmail) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text("Email: ", 16, cardY + 25);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 20, 20);
        doc.text(quotation.clientEmail, 26, cardY + 25);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(70, 70, 70);
      const addrLines = doc.splitTextToSize(sanitizePdfText(quotation.clientAddress || "Bengaluru, Karnataka"), cardW - 6);
      doc.text(addrLines, 16, cardY + (quotation.clientEmail ? 29.5 : 25.5));

      // Card 2: Tour & Service Specifications
      const card2X = pageWidth - 13 - cardW;
      doc.setFillColor(248, 250, 248);
      doc.setDrawColor(180, 205, 195);
      doc.setLineWidth(0.4);
      doc.roundedRect(card2X, cardY, cardW, cardH, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(6, 63, 45);
      doc.text("TOUR & SERVICE SPECIFICATIONS:", card2X + 3, cardY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(10, 10, 10);
      const subjLines = doc.splitTextToSize(sanitizePdfText(quotation.subject), cardW - 6);
      doc.text(subjLines[0], card2X + 3, cardY + 10.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Route: ", card2X + 3, cardY + 15.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      const cleanRoute = sanitizePdfText(`${quotation.fromLocation} -> ${quotation.toLocation}`);
      const routeLines = doc.splitTextToSize(cleanRoute, cardW - 16);
      doc.text(routeLines[0], card2X + 14, cardY + 15.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("Travel Dates: ", card2X + 3, cardY + 20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(`${formatDateDisplay(quotation.travelStartDate)} to ${formatDateDisplay(quotation.travelEndDate)}`, card2X + 22, cardY + 20);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("Vehicle / Fleet: ", card2X + 3, cardY + 24.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 63, 45);
      const vehLines = doc.splitTextToSize(sanitizePdfText(quotation.vehicleName), cardW - 24);
      doc.text(vehLines[0], card2X + 24, cardY + 24.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(70, 70, 70);
      doc.text(`Reporting Time: ${quotation.reportingTime} | Category: ${quotation.serviceCategory}`, card2X + 3, cardY + 29.5);

      // ── Line Items Table ──
      const tableRows = quotation.items.map((item, idx) => [
        idx + 1,
        sanitizePdfText(item.description),
        sanitizePdfText(item.vehicleType),
        sanitizePdfText(item.durationOrKm),
        item.qty ?? 1,
        `INR ${Number(item.rate).toLocaleString("en-IN")}`,
        `INR ${Number(item.amount).toLocaleString("en-IN")}`,
      ]);

      autoTable(doc, {
        startY: cardY + cardH + 3.5,
        margin: { left: 13, right: 13 },
        theme: "grid",
        styles: {
          fontSize: 7.8,
          cellPadding: 2.8,
          textColor: [20, 20, 20],
          lineColor: [200, 210, 205],
          lineWidth: 0.3,
          font: "helvetica",
        },
        headStyles: {
          fillColor: [6, 63, 45],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
          1: { fontStyle: "bold" },
          2: { cellWidth: 26, fontStyle: "bold" },
          3: { cellWidth: 28 },
          4: { cellWidth: 16, halign: "center", fontStyle: "bold" },
          5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
          6: { cellWidth: 26, halign: "right", fontStyle: "bold" },
        },
        head: [["#", "Description of Travel Service", "Vehicle / Mode", "Duration / Kms", "Qty / Days", "Rate", "Amount"]],
        body: tableRows,
      });

      const itemsY = (doc as any).lastAutoTable?.finalY || 125;

      // ── Amount in Words (Left) & Commercial Summary (Right) ──
      const summaryW = 84;
      const amountW = pageWidth - 26 - summaryW - 4; // ~84mm

      // Amount in Words Box
      doc.setFillColor(236, 253, 245); // Emerald-50
      doc.setDrawColor(110, 231, 183); // Emerald-300
      doc.setLineWidth(0.4);
      doc.roundedRect(13, itemsY + 3, amountW, 14, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(6, 63, 45);
      doc.text("AMOUNT IN WORDS:", 16, itemsY + 7.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.8);
      doc.setTextColor(15, 23, 42);
      const amtLines = doc.splitTextToSize(numberToIndianWords(quotation.grandTotal), amountW - 6);
      doc.text(amtLines, 16, itemsY + 12.5);

      // Tolls & Inclusions note under Amount Box
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(60, 60, 60);
      doc.text("• Tolls, Permits & Parking: ", 13, itemsY + 21);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(quotation.tollPermitStatus === "included" ? "INCLUDED IN QUOTATION" : "EXTRA AT ACTUALS", 45, itemsY + 21);

      // Commercial Summary Table (Right)
      const summaryBody: any[] = [
        ["Subtotal Amount:", `INR ${quotation.subtotal.toLocaleString("en-IN")}`],
      ];
      // Only include GST if rate is greater than 0; removed for 0% sector
      if (quotation.gstRate > 0) {
        summaryBody.push([`GST (${quotation.gstRate}%):`, `INR ${quotation.gstAmount.toLocaleString("en-IN")}`]);
      }
      summaryBody.push(["Toll / Permits:", quotation.tollPermitStatus === "included" ? "INCLUDED" : "AT ACTUALS"]);
      if (quotation.discount > 0) {
        summaryBody.push(["Special Discount:", `- INR ${quotation.discount.toLocaleString("en-IN")}`]);
      }
      summaryBody.push([
        { content: "NET GRAND TOTAL:", styles: { fontStyle: "bold", fontSize: 9, textColor: [255, 255, 255], fillColor: [6, 63, 45] } },
        { content: `INR ${quotation.grandTotal.toLocaleString("en-IN")}`, styles: { fontStyle: "bold", fontSize: 9, textColor: [255, 255, 255], fillColor: [6, 63, 45] } },
      ]);

      autoTable(doc, {
        startY: itemsY + 3,
        margin: { left: pageWidth - 13 - summaryW, right: 13 },
        theme: "plain",
        styles: { fontSize: 7.5, cellPadding: 1.8, textColor: [25, 25, 25], fontStyle: "bold" },
        columnStyles: {
          0: { fontStyle: "bold" },
          1: { halign: "right", fontStyle: "bold" },
        },
        body: summaryBody,
      });

      const summaryEndY = Math.max(
        (doc as any).lastAutoTable?.finalY || itemsY + 25,
        itemsY + 25
      );

      // ── Terms & Conditions (Left) & PhonePe Payment Box (Right) ──
      const bottomY = summaryEndY + 4;
      const termsW = 104;
      const payBoxW = pageWidth - 26 - termsW - 4; // ~76mm
      const payBoxX = pageWidth - 13 - payBoxW;

      // Terms on Left
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(6, 63, 45);
      doc.text("STANDARD TERMS & INSTRUCTIONS:", 13, bottomY + 4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.2);
      doc.setTextColor(40, 40, 40);
      quotation.terms.slice(0, 5).forEach((term, idx) => {
        const cleanTerm = sanitizePdfText(term);
        const termLines = doc.splitTextToSize(cleanTerm, termsW);
        doc.text(termLines, 13, bottomY + 8 + idx * 4.2);
      });

      // PhonePe Box on Right
      doc.setFillColor(250, 245, 255);
      doc.setDrawColor(216, 180, 254);
      doc.setLineWidth(0.4);
      doc.roundedRect(payBoxX, bottomY, payBoxW, 25, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(95, 37, 159);
      doc.text("PHONEPE / UPI PAYMENT SETTLEMENT", payBoxX + 3, bottomY + 4.5);

      if (qrImg) {
        try {
          doc.addImage(qrImg, "JPEG", payBoxX + 3, bottomY + 6.5, 16, 16);
        } catch {}
      }

      const qrTextX = qrImg ? payBoxX + 21 : payBoxX + 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text("Merchant: ZAMEER S", qrTextX, bottomY + 10);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(95, 37, 159);
      doc.text(`UPI: ${quotation.upiId}`, qrTextX, bottomY + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.setTextColor(70, 70, 70);
      doc.text("Scan via PhonePe, GPay, Paytm", qrTextX, bottomY + 18);
      doc.text(`Bank: ${quotation.bankName}`, qrTextX, bottomY + 21.5);

      // ── Signatory & Official Footer ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(6, 63, 45);
      doc.text("For FORTUNE Tourism", pageWidth - 14, pageHeight - 20, { align: "right" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("Authorized Signatory", pageWidth - 14, pageHeight - 14, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(30, 30, 30);
      doc.text(
        "# 5, DG Complex, Hennaragara Gate, Bommasandra, Bangalore - 560 099",
        pageWidth / 2,
        pageHeight - 11,
        { align: "center" }
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.2);
      doc.setTextColor(90, 90, 90);
      doc.text(
        "travel@fortunetourism.co.in | www.fortunetourism.com | Helpline: +91 9740463404",
        pageWidth / 2,
        pageHeight - 7.5,
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
            margin: 5mm 6mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background: #ffffff !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
            max-width: 100% !important;
            margin: 0 !important;
            padding: 5mm 6mm !important;
            box-sizing: border-box !important;
            border: 2px solid #063f2d !important;
            border-radius: 8px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            min-height: 0 !important;
            max-height: 284mm !important;
            height: auto !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
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
                        placeholder="e.g. 9964600247 / 9740463404"
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
                      <span className="text-slate-700 font-bold">GST Rate:</span>
                      <select
                        value={quotation.gstRate}
                        onChange={(e) => {
                          const r = Number(e.target.value);
                          const comm = recalculateCommercials(quotation.items, r, quotation.discount);
                          setQuotation({ ...quotation, gstRate: r, ...comm });
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold"
                      >
                        <option value={0}>0% (No GST / Tour Sector Exempt)</option>
                        <option value={5}>5% (Transport GST)</option>
                        <option value={12}>12% GST</option>
                        <option value={18}>18% GST</option>
                      </select>
                      {quotation.gstRate > 0 ? (
                        <span className="font-bold">₹{quotation.gstAmount.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">NIL (Removed)</span>
                      )}
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
                className="bg-white border-2 border-[#063f2d] rounded-2xl p-5 sm:p-7 shadow-xl max-w-4xl mx-auto space-y-3.5 print:space-y-2 relative overflow-hidden font-sans text-slate-900 print:p-2.5 print:border-2 print:border-[#063f2d] print:shadow-none print:w-full print:max-w-none"
              >
                {/* Center Stylized Watermark */}
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
                <div className="border-b-2 border-[#063f2d] pb-3 print:pb-1.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
                  <div className="flex flex-col items-start gap-0.5">
                    <img
                      src="/images/packages/fortune-tourism-full-logo.png"
                      alt="FORTUNE Tourism"
                      className="h-11 sm:h-13 print:h-10 w-auto object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/fortune-tourism-full-logo.png";
                      }}
                    />
                    <p className="font-serif italic text-xs text-slate-700 font-bold tracking-wide pl-1">
                      Meets all your Travel Need
                    </p>
                    <p className="text-[10px] text-slate-600 font-bold pl-1 hidden print:block">
                      Email: travel@fortunetourism.co.in | Web: www.fortunetourism.com | Helpline: +91 9740463404
                    </p>
                  </div>

                  <div className="text-right text-xs space-y-1 sm:self-center">
                    <div className="inline-block bg-[#063f2d] text-amber-300 font-black text-xs px-3 py-1 rounded-md tracking-wider uppercase shadow-xs">
                      OFFICIAL QUOTATION
                    </div>
                    <div className="text-xs font-black text-slate-950">
                      REF NO: <span className="font-mono text-amber-800 font-black">{quotation.quotationNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-bold">
                      DATE: <strong className="text-slate-950 font-black">{formatDateDisplay(quotation.quotationDate)}</strong> | VALID TILL: <strong className="text-slate-950 font-black">{formatDateDisplay(quotation.validUntil)}</strong>
                    </div>
                  </div>
                </div>

                {/* Client & Itinerary Brief Table (Two High-Contrast Rounded Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2 relative z-10 text-xs">
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/70 space-y-1 print:p-2">
                    <div className="font-black text-xs text-[#063f2d] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Quoted To (Client / Organization):
                    </div>
                    <div className="font-black text-sm text-slate-950 uppercase tracking-tight">{quotation.clientName}</div>
                    {quotation.clientContactPerson && (
                      <div className="text-slate-800 font-semibold">Attn: <strong className="font-black text-slate-950">{quotation.clientContactPerson}</strong></div>
                    )}
                    <div className="text-slate-800 font-semibold">Phone: <strong className="font-black text-slate-950">{quotation.clientPhone}</strong></div>
                    {quotation.clientEmail && <div className="text-slate-800 font-semibold">Email: <strong className="font-bold text-slate-950">{quotation.clientEmail}</strong></div>}
                    {quotation.clientAddress && <div className="text-slate-700 font-medium text-[11px] print:text-[10px]">{quotation.clientAddress}</div>}
                    {quotation.clientGst && <div className="text-slate-900 font-mono font-black">GSTIN: {quotation.clientGst}</div>}
                  </div>

                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/70 space-y-1 print:p-2">
                    <div className="font-black text-xs text-[#063f2d] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Tour &amp; Service Specifications:
                    </div>
                    <div className="font-black text-xs text-slate-950">{quotation.subject}</div>
                    <div className="text-slate-800 font-semibold">
                      Route: <strong className="font-black text-slate-950">{quotation.fromLocation} ➔ {quotation.toLocation}</strong>
                    </div>
                    <div className="text-slate-800 font-semibold">
                      Travel Dates: <strong className="font-black text-slate-950">{formatDateDisplay(quotation.travelStartDate)}</strong> to <strong className="font-black text-slate-950">{formatDateDisplay(quotation.travelEndDate)}</strong>
                    </div>
                    <div className="text-slate-800 font-semibold">
                      Vehicle / Fleet: <strong className="font-black text-[#063f2d]">{quotation.vehicleName}</strong>
                    </div>
                    <div className="text-slate-700 font-medium text-[11px] print:text-[10px]">
                      Reporting Time: <strong className="font-bold text-slate-900">{quotation.reportingTime}</strong> | Category: {quotation.serviceCategory}
                    </div>
                  </div>
                </div>

                {/* Line Items Table with Deep Green Bold Header */}
                <div className="border-2 border-slate-900 rounded-xl overflow-hidden relative z-10 text-xs print:my-0.5">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#063f2d] text-white font-black text-xs uppercase tracking-wider">
                        <th className="p-2.5 print:py-1.5 print:px-2 w-10 text-center">#</th>
                        <th className="p-2.5 print:py-1.5 print:px-2">Description of Travel Service</th>
                        <th className="p-2.5 print:py-1.5 print:px-2 w-32">Vehicle / Mode</th>
                        <th className="p-2.5 print:py-1.5 print:px-2 w-28">Duration / Kms</th>
                        <th className="p-2.5 print:py-1.5 print:px-2 w-20 text-center">Qty / Days</th>
                        <th className="p-2.5 print:py-1.5 print:px-2 w-24 text-right">Rate (₹)</th>
                        <th className="p-2.5 print:py-1.5 print:px-2 w-28 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 font-sans">
                      {quotation.items.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                          <td className="p-2.5 print:py-1.5 print:px-2 text-center font-black text-slate-700">{idx + 1}</td>
                          <td className="p-2.5 print:py-1.5 print:px-2 font-black text-slate-950">{item.description}</td>
                          <td className="p-2.5 print:py-1.5 print:px-2 text-slate-900 font-bold">{item.vehicleType}</td>
                          <td className="p-2.5 print:py-1.5 print:px-2 text-slate-800 font-semibold">{item.durationOrKm}</td>
                          <td className="p-2.5 print:py-1.5 print:px-2 text-center font-black text-slate-900">{item.qty ?? 1}</td>
                          <td className="p-2.5 print:py-1.5 print:px-2 text-right font-bold text-slate-950">
                            ₹{Number(item.rate).toLocaleString("en-IN")}
                          </td>
                          <td className="p-2.5 print:py-1.5 print:px-2 text-right font-black text-slate-950">
                            ₹{Number(item.amount).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Commercial Summary + Amount In Words */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start relative z-10 text-xs print:my-0.5">
                  <div className="md:col-span-7 space-y-1.5">
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-0.5 print:p-2">
                      <div className="text-[10px] font-black text-[#063f2d] uppercase tracking-wider">
                        Amount in Words:
                      </div>
                      <div className="font-serif italic font-black text-slate-950 text-xs sm:text-sm print:text-xs">
                        {numberToIndianWords(quotation.grandTotal)}
                      </div>
                    </div>

                    {/* Tolls & Inclusions Footnote */}
                    <div className="text-[11px] print:text-[9.5px] text-slate-700 font-medium space-y-0.5">
                      <div>
                        • Toll, State Entry Permit &amp; Parking:{" "}
                        <strong className="font-black text-slate-900">{quotation.tollPermitStatus === "included" ? "INCLUDED IN QUOTATION" : "EXTRA AT ACTUALS AGAINST TOLL RECEIPTS"}</strong>
                      </div>
                      {quotation.notes && <div>• Special Note: <span className="font-bold text-slate-900">{quotation.notes}</span></div>}
                    </div>
                  </div>

                  <div className="md:col-span-5 border border-slate-300 rounded-xl overflow-hidden bg-slate-50/80 text-xs print:text-[11px]">
                    <div className="divide-y divide-slate-200">
                      <div className="p-2 print:py-1 print:px-2 flex justify-between">
                        <span className="text-slate-700 font-bold">Subtotal Amount:</span>
                        <span className="font-black text-slate-950">₹{quotation.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      {/* GST removed / only displayed if rate is greater than 0 */}
                      {quotation.gstRate > 0 && (
                        <div className="p-2 print:py-1 print:px-2 flex justify-between">
                          <span className="text-slate-700 font-bold">GST ({quotation.gstRate}%):</span>
                          <span className="font-black text-slate-950">₹{quotation.gstAmount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {quotation.discount > 0 && (
                        <div className="p-2 print:py-1 print:px-2 flex justify-between text-red-600">
                          <span className="font-bold">Special Discount:</span>
                          <span className="font-black">- ₹{quotation.discount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="p-2.5 print:py-1.5 print:px-2 bg-emerald-100/80 flex justify-between items-center text-sm print:text-xs font-black text-[#063f2d]">
                        <span>NET GRAND TOTAL:</span>
                        <span className="text-base sm:text-lg print:text-sm font-black">₹{quotation.grandTotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Official Payment Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch relative z-10 text-xs print:my-0.5">
                  {/* Terms & Instructions */}
                  <div className="md:col-span-8 border border-slate-300 rounded-xl p-2.5 bg-slate-50/50 space-y-1 flex flex-col justify-between print:p-2">
                    <div>
                      <div className="font-black text-[11px] text-[#063f2d] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Standard Terms &amp; Instructions
                      </div>
                      <div className="space-y-0.5 text-[10px] print:text-[8.5px] text-slate-800 font-semibold leading-snug">
                        {quotation.terms.slice(0, 5).map((term, i) => (
                          <div key={i}>{term}</div>
                        ))}
                      </div>
                    </div>
                    <div className="text-[9.5px] text-slate-600 font-bold pt-1 border-t border-slate-200">
                      Subject to Bangalore jurisdiction. Quotation valid for 7 days from issue date.
                    </div>
                  </div>

                  {/* Official PhonePe / UPI Box with ZAMEER S QR */}
                  <div className="md:col-span-4 border-2 border-purple-300 bg-purple-50/70 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs print:p-1.5">
                    <div className="text-[10px] font-black uppercase text-purple-950 tracking-wider flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[8px] font-bold">पे</span>
                      PhonePe Accepted Here
                    </div>
                    <div className="w-20 print:w-16 my-1 bg-white p-0.5 rounded-lg border border-purple-200 shadow-xs">
                      <img
                        src="/images/phonepe-qr.jpg"
                        alt="PhonePe Payment QR - ZAMEER S"
                        className="w-full h-auto object-contain rounded"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/phonepe-qr.jpg";
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-black text-slate-950">
                      Merchant: ZAMEER S
                    </div>
                    <div className="text-[9px] text-purple-800 font-mono font-black mt-0.5">
                      UPI: {quotation.upiId}
                    </div>
                    <div className="text-[8px] text-slate-600 font-semibold mt-0.5">
                      Scan via PhonePe, GPay, Paytm or Any UPI
                    </div>
                  </div>
                </div>

                {/* Authorized Signatory Line */}
                <div className="pt-3 print:pt-1 flex justify-between items-end relative z-10 text-xs">
                  <div className="text-slate-700 text-[10px] space-y-0.5">
                    <div>Prepared by: <strong className="font-black text-slate-900">{quotation.preparedBy}</strong></div>
                    <div>Helpline / 24x7 Support: <strong className="font-black text-slate-900">+91 9740463404</strong></div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="text-xs font-black text-[#063f2d]">
                      For FORTUNE Tourism
                    </div>
                    <div className="h-8 flex items-center justify-end">
                      <div className="text-slate-600 font-bold italic text-[11px] border-b border-slate-400 w-36 text-center pb-0.5">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Letterhead Footer */}
                <div className="border-t-2 border-[#063f2d] pt-2 text-center text-slate-800 relative z-10 space-y-0.5">
                  <div className="font-black text-xs tracking-wide text-slate-950">
                    # 5, DG Complex, Hennaragara Gate, Bommasandra, Bangalore - 560 099
                  </div>
                  <div className="text-[11px] font-bold text-slate-700">
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
