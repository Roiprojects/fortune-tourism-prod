import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { BookingData } from "./booking-utils";
import { formatCurrency, formatDateTime, formatDate } from "./booking-utils";

export function generateBookingPDF(booking: BookingData): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
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
  doc.text("BOOKING CONFIRMATION / TRAVEL VOUCHER", pageWidth / 2, 43, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Booking Date: ${formatDateTime(booking.booking_date || booking.created_at)}`, 15, 50);
  doc.text(`Ticket: ${booking.ticket_number}  |  PNR: ${booking.pnr_number}`, pageWidth - 15, 50, { align: "right" });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, 53, pageWidth - 15, 53);

  let y = 60;

  const sectionHeader = (title: string, yPos: number) => {
    doc.setFillColor(11, 31, 58);
    doc.roundedRect(15, yPos - 4, pageWidth - 30, 8, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 20, yPos + 1);
    return yPos + 14;
  };

  const addRow = (label: string, value: string, yPos: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(value || "—", 70, yPos);
    return yPos + 7;
  };

  // Driver & Vehicle
  y = sectionHeader("DRIVER & VEHICLE DETAILS", y);
  y = addRow("Driver Name:", booking.driver_name || "—", y);
  y = addRow("Phone Number:", booking.driver_phone || "—", y);
  y = addRow("Taxi Number:", booking.taxi_number || "—", y);
  y = addRow("Vehicle Type:", booking.vehicle_type || "—", y);

  y += 4;

  // Trip Details
  y = sectionHeader("TRIP DETAILS", y);
  y = addRow("Package:", booking.package_name || "—", y);
  y = addRow("Tour Type:", booking.tour_type || "—", y);
  y = addRow("Trip Type:", booking.trip_type || "—", y);
  y = addRow("From:", booking.from_location || "—", y);
  y = addRow("To:", booking.to_location || "—", y);
  y = addRow("Boarding Point:", booking.boarding_point || "—", y);
  y = addRow("Departure:", formatDateTime(booking.departure_datetime), y);

  y += 4;

  // Passenger Details
  y = sectionHeader("PASSENGER DETAILS", y);
  y = addRow("Passenger Name:", booking.passenger_name || "—", y);
  y = addRow("Phone:", booking.passenger_phone || "—", y);
  y = addRow("Number of Members:", String(booking.number_of_members || "—"), y);

  y += 4;

  // Payment Details
  y = sectionHeader("PAYMENT DETAILS", y);

  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    head: [["Field", "Amount"]],
    body: [
      ["Total Amount", formatCurrency(Number(booking.total_amount) || 0)],
      ["Advance Amount", formatCurrency(Number(booking.advance_amount) || 0)],
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

  y = (doc as any).lastAutoTable?.finalY || y + 50;

  y += 8;

  // Terms & Conditions
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

  // Footer
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

  return doc;
}

export function downloadBookingPDF(booking: BookingData): void {
  const doc = generateBookingPDF(booking);
  doc.save(`FortuneTourism-${booking.ticket_number}-${booking.pnr_number}.pdf`);
}

export function printBookingPDF(booking: BookingData): void {
  const doc = generateBookingPDF(booking);
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
