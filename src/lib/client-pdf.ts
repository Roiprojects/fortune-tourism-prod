import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { BookingData } from "./booking-utils";
import { formatCurrency, formatDateTime, formatDate } from "./booking-utils";

/* ── Helpers ── */

function sectionHeader(doc: jsPDF, title: string, y: number, pageWidth: number): number {
  doc.setFillColor(11, 31, 58);
  doc.roundedRect(15, y - 4, pageWidth - 30, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 20, y + 1);
  return y + 14;
}

function addRow(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(label, 20, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  // Wrap long values
  const maxWidth = 110;
  const lines = doc.splitTextToSize(value || "—", maxWidth);
  doc.text(lines, 70, y);
  return y + Math.max(7, lines.length * 5);
}

function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = doc.internal.pageSize.getHeight() - 15;

  doc.setDrawColor(214, 168, 75);
  doc.setLineWidth(0.3);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("FORTUNE TOURISM", 15, footerY);
  doc.text("Authorized Signatory", pageWidth - 15, footerY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Thank you for choosing Fortune Tourism!", pageWidth / 2, footerY + 6, { align: "center" });
  doc.text(`Generated on ${formatDateTime(new Date().toISOString())}`, pageWidth / 2, footerY + 10, { align: "center" });
}

function addHeader(doc: jsPDF, subtitle: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(11, 31, 58);
  doc.text("FORTUNE TOURISM", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("South India Car Rentals & Tour Packages", pageWidth / 2, 26, { align: "center" });
  doc.text("Bengaluru, Karnataka | +91 97404 63404 | hello@fortunetourism.in", pageWidth / 2, 31, { align: "center" });

  doc.setDrawColor(214, 168, 75);
  doc.setLineWidth(0.5);
  doc.line(15, 35, pageWidth - 15, 35);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(14, 107, 80);
  doc.text(subtitle, pageWidth / 2, 43, { align: "center" });

  return 50;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number = 40): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    return 20;
  }
  return y;
}

/* ── Taxi Booking PDF (enhanced) ── */

export function generateTaxiBookingPDF(booking: BookingData): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = addHeader(doc, "BOOKING CONFIRMATION / TRAVEL VOUCHER");

  // Reference info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Booking Ref: ${booking.booking_reference || booking.booking_number || "—"}`, 15, y);
  doc.text(`Date: ${formatDateTime(booking.booking_date || booking.created_at)}`, pageWidth - 15, y, { align: "right" });
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, y, pageWidth - 15, y);
  y += 7;

  // Booking Details
  y = sectionHeader(doc, "BOOKING DETAILS", y, pageWidth);
  y = addRow(doc, "Booking Ref:", booking.booking_reference || booking.booking_number || "—", y);
  y = addRow(doc, "Booking Type:", "Taxi", y);
  y = addRow(doc, "Travel Date:", formatDate(booking.departure_datetime), y);
  y = addRow(doc, "Pickup Time:", booking.pickup_time || booking.departure_time || "—", y);
  y += 4;

  // Customer Details
  y = checkPageBreak(doc, y);
  y = sectionHeader(doc, "CUSTOMER DETAILS", y, pageWidth);
  y = addRow(doc, "Name:", booking.passenger_name || "—", y);
  y = addRow(doc, "Phone:", booking.passenger_phone || "—", y);
  y = addRow(doc, "Email:", booking.customer_email || "—", y);
  y = addRow(doc, "Passengers:", String(booking.number_of_members || 1), y);
  y += 4;

  // Journey Details
  y = checkPageBreak(doc, y);
  y = sectionHeader(doc, "JOURNEY DETAILS", y, pageWidth);
  y = addRow(doc, "Pickup:", booking.from_location || booking.boarding_point || "—", y);
  y = addRow(doc, "Drop:", booking.to_location || "—", y);
  y = addRow(doc, "Trip Type:", booking.trip_type || booking.tour_type || "—", y);
  y += 4;

  // Vehicle & Driver
  y = checkPageBreak(doc, y);
  y = sectionHeader(doc, "VEHICLE & DRIVER DETAILS", y, pageWidth);
  y = addRow(doc, "Vehicle Type:", booking.vehicle_type || "—", y);
  y = addRow(doc, "Vehicle No:", booking.taxi_number || "—", y);
  y = addRow(doc, "Driver Name:", booking.driver_name || "—", y);
  y = addRow(doc, "Driver Phone:", booking.driver_phone || "—", y);
  y += 4;

  // Payment Details
  y = checkPageBreak(doc, y, 60);
  y = sectionHeader(doc, "PAYMENT DETAILS", y, pageWidth);
  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    head: [["Field", "Amount"]],
    body: [
      ["Total Amount", formatCurrency(Number(booking.total_amount) || 0)],
      ["Amount Paid", formatCurrency(Number(booking.amount_paid) || 0)],
      ["Balance Amount", formatCurrency(Number(booking.balance_amount) || 0)],
      ["Payment Status", booking.payment_status || "Pending"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [14, 107, 80], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 245, 239] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { halign: "right", cellWidth: "auto" },
    },
    theme: "grid",
  });
  y = (doc as any).lastAutoTable?.finalY || y + 40;
  y += 8;

  // Terms & Conditions
  y = checkPageBreak(doc, y, 40);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("TERMS & CONDITIONS", 15, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const terms = [
    "1. This booking voucher must be presented to the driver at the time of pickup.",
    "2. Cancellation within 24 hours of departure may incur charges.",
    "3. Payment balance must be settled before or at the time of travel.",
    "4. Fortune Tourism is not liable for delays due to traffic, weather, or unforeseen circumstances.",
    "5. Changes to booking details must be communicated at least 12 hours in advance.",
  ];
  for (const term of terms) {
    doc.text(term, 15, y);
    y += 4;
  }

  addFooter(doc);
  return doc;
}

/* ── Client Travel Confirmation PDF (Bus/Train/Flight) ── */

export function generateClientTravelPDF(booking: BookingData): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const bType = (booking.booking_type || "").toUpperCase();

  let y = addHeader(doc, "CUSTOMER TRAVEL CONFIRMATION");

  // Reference info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Booking Ref: ${booking.booking_reference || booking.booking_number || "—"}`, 15, y);
  doc.text(`Date: ${formatDateTime(booking.booking_date || booking.created_at)}`, pageWidth - 15, y, { align: "right" });
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, y, pageWidth - 15, y);
  y += 7;

  // Customer Information
  y = sectionHeader(doc, "CUSTOMER INFORMATION", y, pageWidth);
  y = addRow(doc, "Name:", booking.passenger_name || "—", y);
  y = addRow(doc, "Phone:", booking.passenger_phone || "—", y);
  y = addRow(doc, "Email:", booking.customer_email || "—", y);
  y = addRow(doc, "Passengers:", String(booking.number_of_members || 1), y);
  y += 4;

  // Journey Information
  y = checkPageBreak(doc, y);
  y = sectionHeader(doc, "JOURNEY INFORMATION", y, pageWidth);
  y = addRow(doc, "Booking Type:", bType === "TRAIN" ? "Train" : bType === "FLIGHT" ? "Flight" : "Bus", y);
  y = addRow(doc, "From:", booking.from_location || booking.departure_airport || "—", y);
  y = addRow(doc, "To:", booking.to_location || booking.arrival_airport || "—", y);
  y = addRow(doc, "Travel Date:", formatDate(booking.departure_datetime), y);
  if (booking.departure_time) {
    y = addRow(doc, "Departure:", booking.departure_time, y);
  }
  if (booking.arrival_time) {
    y = addRow(doc, "Arrival:", booking.arrival_time, y);
  }
  if (booking.return_date_flight || booking.return_date) {
    y = addRow(doc, "Return Date:", formatDate(booking.return_date_flight || booking.return_date), y);
  }
  y += 4;

  // Transport Details (type-specific)
  y = checkPageBreak(doc, y);
  if (bType === "FLIGHT") {
    y = sectionHeader(doc, "FLIGHT DETAILS", y, pageWidth);
    y = addRow(doc, "Airline:", booking.airline || booking.preferred_operator || "—", y);
    y = addRow(doc, "Flight No:", booking.flight_number || "—", y);
    y = addRow(doc, "PNR:", booking.pnr_external || booking.pnr_number || "—", y);
    y = addRow(doc, "Cabin Class:", booking.cabin_class || booking.preferred_class || "—", y);
    if (booking.seat_preference) {
      y = addRow(doc, "Seat:", booking.seat_preference, y);
    }
    if (booking.baggage) {
      y = addRow(doc, "Baggage:", booking.baggage, y);
    }
  } else if (bType === "TRAIN") {
    y = sectionHeader(doc, "TRAIN DETAILS", y, pageWidth);
    y = addRow(doc, "Train:", booking.train_name || booking.preferred_operator || "—", y);
    y = addRow(doc, "Train No:", booking.train_number || "—", y);
    y = addRow(doc, "PNR:", booking.pnr_external || booking.pnr_number || "—", y);
    y = addRow(doc, "Class:", booking.travel_class || booking.preferred_class || "—", y);
    if (booking.coach) {
      y = addRow(doc, "Coach:", booking.coach, y);
    }
    if (booking.berth) {
      y = addRow(doc, "Berth/Seat:", booking.berth, y);
    }
  } else {
    y = sectionHeader(doc, "BUS DETAILS", y, pageWidth);
    y = addRow(doc, "Operator:", booking.bus_operator || booking.preferred_operator || "—", y);
    y = addRow(doc, "Bus No:", booking.bus_number || "—", y);
    y = addRow(doc, "PNR:", booking.pnr_external || booking.pnr_number || "—", y);
    if (booking.bus_type) {
      y = addRow(doc, "Bus Type:", booking.bus_type, y);
    }
    if (booking.seat_preference) {
      y = addRow(doc, "Seat:", booking.seat_preference, y);
    }
  }

  if (booking.ticket_confirmation) {
    y = addRow(doc, "Confirmation:", booking.ticket_confirmation, y);
  }
  y += 4;

  // Payment Details
  y = checkPageBreak(doc, y, 60);
  y = sectionHeader(doc, "PAYMENT DETAILS", y, pageWidth);

  const paymentRows: string[][] = [
    ["Total Amount", formatCurrency(Number(booking.total_amount) || 0)],
  ];
  if (booking.ticket_cost != null && Number(booking.ticket_cost) > 0) {
    paymentRows.push(["Ticket Cost", formatCurrency(Number(booking.ticket_cost))]);
  }
  if (booking.service_charge_booking != null && Number(booking.service_charge_booking) > 0) {
    paymentRows.push(["Service Charge", formatCurrency(Number(booking.service_charge_booking))]);
  }
  paymentRows.push(
    ["Amount Paid", formatCurrency(Number(booking.amount_paid) || 0)],
    ["Balance Amount", formatCurrency(Number(booking.balance_amount) || 0)],
    ["Payment Status", booking.payment_status || "Pending"],
  );

  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    head: [["Field", "Amount"]],
    body: paymentRows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [14, 107, 80], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 245, 239] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { halign: "right", cellWidth: "auto" },
    },
    theme: "grid",
  });
  y = (doc as any).lastAutoTable?.finalY || y + 40;
  y += 8;

  // Special Instructions
  if (booking.special_instructions || booking.notes) {
    y = checkPageBreak(doc, y, 30);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageWidth - 15, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("SPECIAL INSTRUCTIONS / NOTES", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const noteText = booking.special_instructions || booking.notes || "";
    const noteLines = doc.splitTextToSize(noteText, pageWidth - 30);
    doc.text(noteLines, 15, y);
    y += noteLines.length * 4 + 4;
  }

  // Terms & Conditions
  y = checkPageBreak(doc, y, 35);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("TERMS & CONDITIONS", 15, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const terms = [
    "1. This is a booking confirmation from Fortune Tourism. Please carry this document during travel.",
    "2. Cancellation and refund policies apply as per the operator/airline/railway terms.",
    "3. Any balance payment must be settled before the travel date.",
    "4. Fortune Tourism is not liable for schedule changes or cancellations by the transport operator.",
    "5. For any queries, contact Fortune Tourism at +91 97404 63404.",
  ];
  for (const term of terms) {
    doc.text(term, 15, y);
    y += 4;
  }

  addFooter(doc);
  return doc;
}

/* ── Download / Print helpers ── */

export function downloadTaxiPDF(booking: BookingData): void {
  const doc = generateTaxiBookingPDF(booking);
  const ref = booking.booking_reference || booking.ticket_number || "Taxi";
  doc.save(`FortuneTourism-Taxi-${ref}.pdf`);
}

export function printTaxiPDF(booking: BookingData): void {
  const doc = generateTaxiBookingPDF(booking);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const w = window.open(url);
  if (w) {
    w.onload = () => { w.print(); URL.revokeObjectURL(url); };
  }
}

export function downloadClientPDF(booking: BookingData): void {
  const doc = generateClientTravelPDF(booking);
  const ref = booking.booking_reference || booking.ticket_number || "Travel";
  const type = (booking.booking_type || "").toLowerCase() || "booking";
  doc.save(`FortuneTourism-${type}-${ref}.pdf`);
}

export function printClientPDF(booking: BookingData): void {
  const doc = generateClientTravelPDF(booking);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const w = window.open(url);
  if (w) {
    w.onload = () => { w.print(); URL.revokeObjectURL(url); };
  }
}

/** Smart PDF generator - picks the right PDF based on booking type */
export function generateSmartPDF(booking: BookingData): jsPDF {
  const bType = (booking.booking_type || "").toUpperCase();
  if (bType === "TAXI" || bType === "CAR" || !bType) {
    return generateTaxiBookingPDF(booking);
  }
  return generateClientTravelPDF(booking);
}

export function downloadSmartPDF(booking: BookingData): void {
  const bType = (booking.booking_type || "").toUpperCase();
  if (bType === "TAXI" || bType === "CAR" || !bType) {
    downloadTaxiPDF(booking);
  } else {
    downloadClientPDF(booking);
  }
}

export function printSmartPDF(booking: BookingData): void {
  const bType = (booking.booking_type || "").toUpperCase();
  if (bType === "TAXI" || bType === "CAR" || !bType) {
    printTaxiPDF(booking);
  } else {
    printClientPDF(booking);
  }
}
