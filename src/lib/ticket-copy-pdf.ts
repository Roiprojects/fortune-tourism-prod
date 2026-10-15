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
  returnDate?: string;
  tripType: string;
  vehicleOrMode: string;
  boardingPoint: string;
  boardingAddress: string;
  serviceType?: string;
  vehicleLabel?: string;
  fareAmount?: number | string;
  baseFare?: number | string;
  driverAllowance?: number | string;
  paymentStatus?: string;
}

export function downloadTicketCopyPDF(data: TicketCopyData) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  const generateAndSave = (imgElement?: HTMLImageElement, qrElement?: HTMLImageElement) => {
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
          { content: data.passengerPhone || "9964600247", styles: { fontStyle: "bold" } },
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
          { content: data.returnDate ? "Departure & Return:" : "Departure On:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
          { content: data.returnDate ? `${data.departureOn} (Dep)\n${data.returnDate} (Ret)` : data.departureOn, styles: { fontStyle: "bold" } },
        ],
        [
          { content: "Boarding Point:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
          { content: (data.boardingPoint || "N/A").toUpperCase(), colSpan: 2, styles: { fontStyle: "bold" } },
          { content: "Boarding Address:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
          { content: (data.boardingAddress || "N/A").toUpperCase(), colSpan: 2, styles: { fontStyle: "bold" } },
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
          { content: data.returnDate ? "Return Date:" : "Fare Amount:", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
          {
            content: data.returnDate
              ? data.returnDate
              : Number(data.fareAmount || 0) > 0
              ? `INR ${Number(data.fareAmount).toLocaleString("en-IN")}`
              : data.fareAmount
              ? `INR ${data.fareAmount}`
              : "INR 0",
            styles: { fontStyle: "bold", textColor: data.returnDate ? [10, 10, 10] : [14, 107, 80] },
          },
        ],
        [
          { content: "Total Fare Amount:", styles: { fontStyle: "bold", fillColor: [230, 245, 235] } },
          {
            content: Number(data.fareAmount || 0) > 0
              ? `INR ${Number(data.fareAmount).toLocaleString("en-IN")}`
              : data.fareAmount
              ? `INR ${data.fareAmount}`
              : "INR 0",
            styles: { fontStyle: "bold", fontSize: 9.5, textColor: [14, 107, 80] },
          },
          { content: "Payment Status:", styles: { fontStyle: "bold", fillColor: [230, 245, 235] } },
          { content: data.paymentStatus || "CONFIRMED / PAID", styles: { fontStyle: "bold", textColor: [14, 107, 80] } },
          { content: "GST & Taxes:", styles: { fontStyle: "bold", fillColor: [230, 245, 235] } },
          { content: "INCLUDED (5% GST)", styles: { fontStyle: "bold" } },
        ],
      ],
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;

    // Terms & Conditions (Left Column)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text("TERMS & INSTRUCTIONS", 16, finalY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text("1. Please carry this ticket copy / SMS during your journey.", 16, finalY + 14);
    doc.text("2. Driver & vehicle assignment details will be shared prior to departure.", 16, finalY + 19);
    doc.text("3. Balance fare (if any) can be settled via PhonePe / UPI upon boarding.", 16, finalY + 24);
    doc.text("4. 24/7 Helpline & Support: +91 9740463404 | Fortune Tourism Bangalore.", 16, finalY + 29);

    // Official PhonePe QR Box (Right Column)
    if (qrElement) {
      try {
        const qrBoxX = pageWidth - 48;
        const qrBoxY = finalY + 4;
        const qrBoxW = 32;
        const qrBoxH = 40;
        doc.setDrawColor(95, 37, 159);
        doc.setFillColor(250, 245, 255);
        doc.setLineWidth(0.4);
        doc.roundedRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(95, 37, 159);
        doc.text("PhonePe Accepted Here", qrBoxX + qrBoxW / 2, qrBoxY + 3.8, { align: "center" });

        // Add QR Image
        doc.addImage(qrElement, "JPEG", qrBoxX + 7, qrBoxY + 5, 18, 18 * (1024 / 582));

        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.5);
        doc.setTextColor(20, 20, 20);
        doc.text("Merchant: ZAMEER S", qrBoxX + qrBoxW / 2, qrBoxY + 37, { align: "center" });
        doc.setFontSize(5);
        doc.setTextColor(110, 110, 110);
        doc.text("Scan & Pay via Any UPI", qrBoxX + qrBoxW / 2, qrBoxY + 39, { align: "center" });
      } catch (err) {
        console.error("Could not render QR to PDF", err);
      }
    }

    // Outer Box Border dynamically encompassing all contents
    const boxHeight = Math.max(120, finalY + 47 - 10);
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.8);
    doc.roundedRect(12, 10, pageWidth - 24, boxHeight, 2, 2, "S");

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Fortune Tourism & Travels · No.256/A Next To Narayana Hospital, Health City, Bommasandra, Bangalore. 560099",
      pageWidth / 2,
      finalY + 50,
      { align: "center" }
    );

    doc.save(`Fortune-Tourism-Ticket-${data.ticketNumber}.pdf`);
  };

  const loadImg = (src: string): Promise<HTMLImageElement | undefined> => {
    return new Promise((resolve) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = () => resolve(undefined);
      el.src = src;
    });
  };

  Promise.all([
    loadImg("/fortune-tourism-full-logo.png"),
    loadImg("/images/phonepe-qr.jpg")
  ]).then(([logoImg, qrImg]) => {
    generateAndSave(logoImg, qrImg);
  });
}
