import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate, formatDateTime } from "./booking-utils";

/* ── Shared types (loose so API rows can be passed straight in) ── */
export interface InvoiceBooking {
  booking_number?: string;
  enquiry_number?: string;
  ticket_number?: string;
  pnr_number?: string;
  booking_source?: string;
  category?: string;
  passenger_name?: string;
  customer_email?: string | null;
  number_of_members?: number;
  package_name?: string;
  tour_type?: string;
  trip_type?: string;
  from_location?: string;
  to_location?: string;
  departure_datetime?: string;
  return_date?: string;
  driver_name?: string;
  driver_phone?: string;
  taxi_number?: string;
  vehicle_type?: string;
  airline?: string;
  flight_number?: string;
  train_name?: string;
  train_number?: string;
  bus_operator?: string;
  total_amount: number;
  amount_paid?: number;
  balance_amount?: number;
  payment_status?: string;
  created_at?: string;
}

export interface PaymentRow {
  id?: number;
  payment_id?: string;
  transaction_id?: string;
  reference_number?: string;
  amount: number | string;
  payment_method?: string;
  payment_status?: string;
  paid_at?: string;
  payment_date?: string;
  notes?: string;
  received_by?: string;
  is_deleted?: boolean;
  refund_reference?: string;
  refund_method?: string;
  refund_date?: string;
  reason?: string;
  processed_by?: string;
  status?: string;
}

const BRAND = {
  name: "FORTUNE TOURISM",
  tagline: "South India Car Rentals & Tour Packages",
  contact: "Bengaluru, Karnataka | +91 97404 63404 | hello@fortunetourism.in",
};

function drawHeader(doc: jsPDF, title: string, subtitle?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(11, 31, 58);
  doc.text(BRAND.name, pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(BRAND.tagline, pageWidth / 2, 26, { align: "center" });
  doc.text(BRAND.contact, pageWidth / 2, 31, { align: "center" });

  doc.setDrawColor(214, 168, 75);
  doc.setLineWidth(0.5);
  doc.line(15, 35, pageWidth - 15, 35);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(14, 107, 80);
  doc.text(title, pageWidth / 2, 43, { align: "center" });

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth / 2, 49, { align: "center" });
  }
  return subtitle ? 56 : 50;
}

function addInfoRow(doc: jsPDF, label: string, value: string, yPos: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(label, 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text(value || "—", 70, yPos);
  return yPos + 6;
}

function sectionHeader(doc: jsPDF, title: string, yPos: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(11, 31, 58);
  doc.roundedRect(15, yPos - 4, pageWidth - 30, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 20, yPos + 1);
  return yPos + 12;
}

function drawFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(214, 168, 75);
  doc.setLineWidth(0.3);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(BRAND.name, 15, footerY);
  doc.text("Authorized Signatory", pageWidth - 15, footerY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Thank you for choosing Fortune Tourism!", pageWidth / 2, footerY + 6, {
    align: "center",
  });
  doc.text(
    `Generated on ${formatDateTime(new Date().toISOString())}`,
    pageWidth / 2,
    footerY + 10,
    { align: "center" },
  );
}

function categoryLine(b: InvoiceBooking): string {
  switch ((b.category || "").toUpperCase()) {
    case "FLIGHT":
      return [
        b.airline && `Airline: ${b.airline}`,
        b.flight_number && `Flight No: ${b.flight_number}`,
      ]
        .filter(Boolean)
        .join("  ·  ");
    case "TRAIN":
      return [b.train_name, b.train_number && `#${b.train_number}`].filter(Boolean).join("  ·  ");
    case "BUS":
      return [b.bus_operator, b.vehicle_type].filter(Boolean).join("  ·  ");
    default:
      return [b.driver_name && `Driver: ${b.driver_name}`, b.taxi_number, b.vehicle_type]
        .filter(Boolean)
        .join("  ·  ");
  }
}

/* ─────────────────────────────────────────────
   TAX INVOICE — full breakdown + payment history
   ───────────────────────────────────────────── */
export function generateInvoicePDF(
  booking: InvoiceBooking,
  payments: PaymentRow[] = [],
  refunds: PaymentRow[] = [],
): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = drawHeader(doc, "TAX INVOICE", booking.booking_number);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${formatDate(new Date())}`, 15, y);
  doc.text(
    `Ref: ${booking.ticket_number || "—"}${booking.enquiry_number ? `  |  Enquiry: ${booking.enquiry_number}` : ""}`,
    pageWidth - 15,
    y,
    { align: "right" },
  );
  y += 4;

  // Customer & trip info
  y = sectionHeader(doc, "CUSTOMER DETAILS", y);
  y = addInfoRow(doc, "Customer Name:", booking.passenger_name || "—", y);
  y = addInfoRow(doc, "Email:", booking.customer_email || "—", y);
  y = addInfoRow(doc, "Members:", String(booking.number_of_members ?? "—"), y);

  y += 3;
  y = sectionHeader(doc, "TRIP DETAILS", y);
  y = addInfoRow(doc, "Category:", booking.category || "CAR", y);
  y = addInfoRow(doc, "Package:", booking.package_name || booking.tour_type || "—", y);
  y = addInfoRow(
    doc,
    "Route:",
    `${booking.from_location || "—"} → ${booking.to_location || "—"}`,
    y,
  );
  y = addInfoRow(doc, "Departure:", formatDateTime(booking.departure_datetime), y);
  if (categoryLine(booking)) {
    y = addInfoRow(doc, "Travel Info:", categoryLine(booking), y);
  }

  // Fare breakdown
  const fareRows: Array<[string, number]> = [];
  const pushFare = (label: string, v: any) => {
    const n = Number(v) || 0;
    if (n > 0) fareRows.push([label, n]);
  };
  pushFare("Base Fare", (booking as any).base_amount);
  pushFare("Driver Allowance", (booking as any).driver_allowance);
  pushFare("Toll Charges", (booking as any).toll_amount);
  pushFare("Parking Charges", (booking as any).parking_amount);
  pushFare("Permit Charges", (booking as any).permit_amount);
  pushFare("State Tax", (booking as any).state_tax_amount);
  pushFare("Service Charge", (booking as any).service_charge);
  pushFare("Additional Charges", (booking as any).additional_charges);
  const discount = Number((booking as any).discount_amount) || 0;

  fareRows.push(["Total Amount", Number(booking.total_amount) || 0]);

  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    head: [["Description", "Amount"]],
    body: [
      ...fareRows.map(([l, v]) => [l, formatCurrency(v)]),
      ...(discount > 0 ? [["Discount", `- ${formatCurrency(discount)}`]] : []),
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [14, 107, 80], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 245, 239] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 90 },
      1: { halign: "right" },
    },
    theme: "grid",
  });
  y = (doc as any).lastAutoTable?.finalY || y + 40;
  y += 6;

  // Payment history
  const activePayments = payments.filter((p) => !p.is_deleted);
  if (activePayments.length > 0 || refunds.length > 0) {
    doc.addPage();
    let py = 20;
    py = sectionHeader(doc, "PAYMENT HISTORY", py);

    const payBody = activePayments.map((p) => [
      formatDate(p.payment_date || p.paid_at),
      p.payment_id || "—",
      p.payment_method || "—",
      p.transaction_id || p.reference_number || "—",
      formatCurrency(Number(p.amount)),
    ]);

    autoTable(doc, {
      startY: py,
      margin: { left: 20, right: 20 },
      head: [["Date", "Payment ID", "Method", "Txn/Reference", "Amount"]],
      body: payBody.length > 0 ? payBody : [["—", "—", "—", "—", "—"]],
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [11, 31, 58], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 245, 239] },
      theme: "grid",
    });
    py = (doc as any).lastAutoTable?.finalY || py + 30;
    py += 6;

    if (refunds.length > 0) {
      py = sectionHeader(doc, "REFUNDS", py);
      autoTable(doc, {
        startY: py,
        margin: { left: 20, right: 20 },
        head: [["Date", "Reference", "Method", "Reason", "Amount"]],
        body: refunds.map((r) => [
          formatDate(r.refund_date),
          r.refund_reference || "—",
          r.refund_method || "—",
          r.reason || "—",
          `- ${formatCurrency(Number(r.amount))}`,
        ]),
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [166, 60, 60], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [250, 240, 240] },
        theme: "grid",
      });
      py = (doc as any).lastAutoTable?.finalY || py + 30;
      py += 6;
    }

    // Summary box
    const netPaid =
      activePayments.reduce((s, p) => s + (Number(p.amount) || 0), 0) -
      refunds.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const remaining = Math.max((Number(booking.total_amount) || 0) - netPaid, 0);

    autoTable(doc, {
      startY: py,
      margin: { left: 20, right: 20 },
      head: [["Summary", "Amount"]],
      body: [
        ["Total Amount", formatCurrency(Number(booking.total_amount) || 0)],
        ["Net Received", formatCurrency(netPaid)],
        ["Balance Due", formatCurrency(remaining)],
        ["Payment Status", booking.payment_status || "—"],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [14, 107, 80], textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 }, 1: { halign: "right" } },
      theme: "grid",
    });
  }

  drawFooter(doc);
  return doc;
}

/* ─────────────────────────────────────────────
   ADVANCE RECEIPT — compact single-payment slip
   ───────────────────────────────────────────── */
export function generateAdvanceReceiptPDF(booking: InvoiceBooking, payment: PaymentRow): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");

  let y = drawHeader(doc, "ADVANCE PAYMENT RECEIPT", booking.booking_number);

  y = sectionHeader(doc, "PAYMENT DETAILS", y);
  y = addInfoRow(doc, "Receipt No:", payment.payment_id || "—", y);
  y = addInfoRow(doc, "Payment Date:", formatDate(payment.payment_date || payment.paid_at), y);
  y = addInfoRow(doc, "Amount Paid:", formatCurrency(Number(payment.amount)), y);
  y = addInfoRow(doc, "Payment Method:", payment.payment_method || "—", y);
  if (payment.transaction_id) y = addInfoRow(doc, "Transaction ID:", payment.transaction_id, y);
  if (payment.reference_number) y = addInfoRow(doc, "Reference:", payment.reference_number, y);
  if (payment.received_by) y = addInfoRow(doc, "Received By:", payment.received_by, y);

  y += 3;
  y = sectionHeader(doc, "BOOKING REFERENCE", y);
  y = addInfoRow(doc, "Booking No:", booking.booking_number || "—", y);
  y = addInfoRow(doc, "Customer:", booking.passenger_name || "—", y);
  y = addInfoRow(
    doc,
    "Trip:",
    `${booking.from_location || "—"} → ${booking.to_location || "—"}`,
    y,
  );
  y = addInfoRow(doc, "Departure:", formatDateTime(booking.departure_datetime), y);
  y = addInfoRow(doc, "Total Amount:", formatCurrency(Number(booking.total_amount) || 0), y);
  y = addInfoRow(doc, "Balance Due:", formatCurrency(Number(booking.balance_amount) || 0), y);

  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This is a computer-generated receipt for the advance payment received.",
    doc.internal.pageSize.getWidth() / 2,
    y,
    { align: "center" },
  );

  drawFooter(doc);
  return doc;
}

export function downloadInvoicePDF(
  booking: InvoiceBooking,
  payments?: PaymentRow[],
  refunds?: PaymentRow[],
): void {
  const doc = generateInvoicePDF(booking, payments, refunds);
  doc.save(`FortuneTourism-Invoice-${booking.booking_number || booking.ticket_number}.pdf`);
}

export function printInvoicePDF(
  booking: InvoiceBooking,
  payments?: PaymentRow[],
  refunds?: PaymentRow[],
): void {
  const doc = generateInvoicePDF(booking, payments, refunds);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
      URL.revokeObjectURL(url);
    };
  }
}

export function downloadReceiptPDF(booking: InvoiceBooking, payment: PaymentRow): void {
  const doc = generateAdvanceReceiptPDF(booking, payment);
  doc.save(`FortuneTourism-Receipt-${payment.payment_id}.pdf`);
}
