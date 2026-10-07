import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface TicketCopyData {
  ticketNumber: string;
  pnrNumber: string;
  bookingDate: string;
  passengerName: string;
  passengerPhone: string;
  tourType: string;
  fromLocation: string;
  toLocation: string;
  departureOn: string;
  tripType: string;
  vehicleOrMode: string;
  boardingPoint: string;
  boardingAddress: string;
  serviceType?: string;
  vehicleLabel?: string;
}

export function downloadTicketCopyPDF(data: TicketCopyData) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  const generateAndSave = (imgElement?: HTMLImageElement) => {
    // Top Box Border
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.8);
    doc.roundedRect(12, 10, pageWidth - 24, 120, 2, 2, "S");

    // Company Brand Logo
    if (imgElement) {
      try {
        doc.addImage(imgElement, "PNG", 16, 12, 46, 9);
      } catch {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(14, 107, 80);
        doc.text("FORTUNE Tourism", 16, 17);
      }
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(14, 107, 80);
      doc.text("FORTUNE Tourism", 16, 17);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text(
      "Address: No.256/A next To Narayana Hospital, Health City, Bommasandra Bangalore. 560099 | Phone: +91 9740463404",
      16,
      23,
    );

    // Main Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 10, 10);
    doc.text("Ticket Copy For Your Journey", 16, 29);

    doc.setFontSize(8.5);
    doc.text(`BOOKING DATE & TIME : ${data.bookingDate}`, pageWidth - 16, 29, { align: "right" });

    // Main Grid Table
    autoTable(doc, {
      startY: 33,
    margin: { left: 16, right: 16 },
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: [20, 20, 20],
      lineColor: [20, 20, 20],
      lineWidth: 0.4,
    },
    head: [],
    body: [
      [
        { content: "Passenger Name:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: (data.passengerName || "FORTUNE GROUP").toUpperCase(), styles: { fontStyle: "bold" } },
        { content: "Passenger Phone No.:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: data.passengerPhone || "9845003000", styles: { fontStyle: "bold" } },
        { content: "Tour Type", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: (data.tourType || "LOCAL TRIP").toUpperCase(), styles: { fontStyle: "bold" } },
      ],
      [
        { content: "FROM", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: (data.fromLocation || "BANGALORE").toUpperCase(), colSpan: 2, styles: { fontStyle: "bold" } },
        { content: "TO:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: (data.toLocation || "BANGALORE").toUpperCase(), colSpan: 2, styles: { fontStyle: "bold" } },
      ],
      [
        { content: "Ticket Number:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        {
          content: (data.ticketNumber || "FT3423CZ").toUpperCase(),
          styles: { fontStyle: "bold", fontSize: 9.5, textColor: [180, 83, 9] },
        },
        { content: "PNR Number:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        {
          content: (data.pnrNumber || "FC17G3423").toUpperCase(),
          styles: { fontStyle: "bold", fontSize: 9.5, textColor: [10, 10, 10] },
        },
        { content: "Departure On:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: data.departureOn, styles: { fontStyle: "bold" } },
      ],
      [
        { content: "Trip Type:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: (data.tripType || "PACKAGE").toUpperCase(), styles: { fontStyle: "bold" } },
        {
          content:
            data.vehicleLabel ||
            (data.serviceType === "FLIGHT"
              ? "Type Of Flight:"
              : data.serviceType === "BUS"
              ? "Type Of Bus:"
              : data.serviceType === "TRAIN"
              ? "Type Of Train:"
              : data.serviceType === "TOUR"
              ? "Tour Package:"
              : "Type Of Cab:"),
          styles: { fontStyle: "bold", fillColor: [245, 245, 245] },
        },
        { content: (data.vehicleOrMode || "MARUTI SUZUKI CIAZ").toUpperCase(), styles: { fontStyle: "bold" } },
        { content: "Boarding Point:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: (data.boardingPoint || "N/A").toUpperCase(), styles: { fontStyle: "bold" } },
      ],
      [
        { content: "Boarding Address:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: (data.boardingAddress || "N/A").toUpperCase(), colSpan: 5, styles: { fontStyle: "bold" } },
      ],
      [
        { content: "Boarding Point:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        {
          content: (data.boardingPoint || "N/A").toUpperCase(),
          styles: { fontStyle: "bold" },
        },
        { content: "", styles: { cellWidth: 0 } },
        { content: "Boarding Address:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
        { content: (data.boardingAddress || "N/A").toUpperCase(), colSpan: 2, styles: { fontStyle: "bold" } },
      ],
    ],
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 100;

  // Terms & Conditions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text("TERMS & INSTRUCTIONS", 16, finalY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("1. Please carry this ticket copy / SMS during your journey.", 16, finalY + 13);
  doc.text("2. Driver & vehicle assignment details will be shared prior to departure.", 16, finalY + 18);
  doc.text("3. 24/7 Helpline & Support: +91 9740463404 | Fortune Tourism Bangalore.", 16, finalY + 23);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Fortune Tourism & Travels · No.256/A Next To Narayana Hospital, Health City, Bommasandra, Bangalore. 560099",
    pageWidth / 2,
    finalY + 32,
    { align: "center" }
  );

    doc.save(`Fortune-Tourism-Ticket-${data.ticketNumber}.pdf`);
  };

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    generateAndSave(img);
  };
  img.onerror = () => {
    generateAndSave();
  };
  img.src = "/fortune-tourism-full-logo.png";
}
