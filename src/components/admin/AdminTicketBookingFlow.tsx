import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  TrainFront,
  Plane,
  Bus,
  Calendar,
  Users,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Download,
  Printer,
  MessageCircle,
  CheckCircle2,
  Clock,
  Phone,
  CreditCard,
  Zap,
  Banknote,
  Copy,
  Check,
  Maximize2,
} from "lucide-react";
import { generateTicketNumber, generatePNR } from "@/lib/booking-utils";
import { buildWhatsAppUrl } from "@/lib/contact";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";
import { BusBookingForm } from "@/components/booking/BusBookingForm";
import { FlightBookingForm } from "@/components/booking/FlightBookingForm";
import { getSavedTicketTariffs } from "./FareAmountEditorModal";

interface Passenger {
  name: string;
  age: string;
  gender: string;
  berth_preference: string;
}

const CLASS_OPTIONS = [
  { value: "3A", label: "3A - AC 3 Tier" },
  { value: "2A", label: "2A - AC 2 Tier" },
  { value: "1A", label: "1A - AC First Class" },
  { value: "3E", label: "3E - 3 AC Economy" },
  { value: "SL", label: "SL - Sleeper Class" },
  { value: "CC", label: "CC - AC Chair Car" },
  { value: "2S", label: "2S - Second Sitting" },
  { value: "Other", label: "Other / Any" },
];

const QUOTA_OPTIONS = [
  { value: "General", label: "General Quota" },
  { value: "Tatkal", label: "Tatkal Quota" },
  { value: "Ladies", label: "Ladies Quota" },
  { value: "Senior Citizen", label: "Senior Citizen Quota" },
  { value: "Other", label: "Other" },
];

interface AdminTicketBookingFlowProps {
  onBack: () => void;
  onBookingCompleted?: () => void;
}

export function AdminTicketBookingFlow({ onBack, onBookingCompleted }: AdminTicketBookingFlowProps) {
  // Service switcher: TRAIN | FLIGHT | BUS
  const [serviceType, setServiceType] = useState<"TRAIN" | "FLIGHT" | "BUS">("TRAIN");

  // Step: "JOURNEY" | "PASSENGERS" | "PAYMENT" | "CONFIRMED"
  const [step, setStep] = useState<"JOURNEY" | "PASSENGERS" | "PAYMENT" | "CONFIRMED">("JOURNEY");

  // Payment Choice State
  const [paymentChoice, setPaymentChoice] = useState<"token_100" | "full" | "zero">("token_100");
  const [fullPaymentType, setFullPaymentType] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [manualMethod, setManualMethod] = useState<"CASH" | "BANK_TRANSFER" | "POS_CARD" | "CHEQUE">("CASH");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [collectedBy, setCollectedBy] = useState("Admin Counter");
  const [utrRef, setUtrRef] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const copyUPI = () => {
    navigator.clipboard.writeText("fortunetourism@okaxis");
    setUpiCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setUpiCopied(false), 2000);
  };

  // Train Journey Form Data
  const [trainData, setTrainData] = useState({
    from_station: "",
    to_station: "",
    date: new Date().toISOString().split("T")[0],
    preferred_train: "",
    travel_class: "3A",
    quota: "General",
    time: "07:00",
    train_number: "",
    boarding_point: "",
    boarding_address: "",
    phone: "",
    fare_amount: "",
  });

  // Passengers list (1 to 6)
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", age: "", gender: "Male", berth_preference: "No Preference" },
  ]);

  // Form State for other services (Bus, Flight)
  const [otherFormData, setOtherFormData] = useState<any>({
    date: new Date().toISOString().split("T")[0],
    time: "07:00",
    from_location: "",
    destination: "",
    bus_type: "AC Sleeper",
    flight_trip_type: "One Way",
    cabin_class: "Economy",
    from_airport: "",
    to_airport: "",
    boarding_point: "",
    boarding_address: "",
    phone: "",
    fare_amount: "",
    passengers: [{ name: "", age: "", gender: "Male", seat_preference: "" }],
  });

  const onOtherChange = (field: string, value: any) => {
    setOtherFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Ticket identifiers
  const [ticketNumber, setTicketNumber] = useState(() => generateTicketNumber());
  const [pnrNumber, setPnrNumber] = useState(() => generatePNR());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Format departure date e.g. 07-10-2026.07.00
  const departureDateFormatted = useMemo(() => {
    const rawDate = (serviceType === "TRAIN" ? trainData.date : otherFormData.date) || today;
    const [y, m, d] = String(rawDate).split("-");
    const rawTime = ((serviceType === "TRAIN" ? trainData.time : otherFormData.time) || "07:00").replace(":", ".");
    return `${d}-${m}-${y}.${rawTime}`;
  }, [trainData.date, trainData.time, otherFormData.date, otherFormData.time, serviceType, today]);

  // Current booking date & time
  const bookingDateTime = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }, []);

  const activePassengersList = useMemo(() => {
    if (serviceType === "TRAIN") {
      return passengers.filter((p) => p.name && p.name.trim());
    }
    if (Array.isArray(otherFormData.passengers) && otherFormData.passengers.length > 0) {
      return otherFormData.passengers.filter((p: any) => p?.name && p.name.trim());
    }
    return [];
  }, [serviceType, passengers, otherFormData.passengers]);

  const primaryPassengerName = useMemo(() => {
    if (serviceType === "TRAIN") {
      const valid = passengers.filter((p) => p.name && p.name.trim());
      const firstName = valid[0]?.name?.trim() || "GUEST";
      return valid.length > 1
        ? `${firstName.toUpperCase()} (+${valid.length - 1} OTHERS)`
        : firstName.toUpperCase();
    }
    const valid = otherFormData.passengers?.filter((p: any) => p?.name && p.name.trim()) || [];
    const firstName = valid[0]?.name?.trim() || otherFormData.name || "GUEST";
    return valid.length > 1
      ? `${firstName.toUpperCase()} (+${valid.length - 1} OTHERS)`
      : firstName.toUpperCase();
  }, [serviceType, passengers, otherFormData.passengers, otherFormData.name]);

  const primaryPhone = useMemo(() => {
    if (serviceType === "TRAIN") {
      return trainData.phone || "";
    }
    return otherFormData.phone || "";
  }, [serviceType, trainData.phone, otherFormData.phone]);

  const tourTypeDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return `TRAIN (${trainData.travel_class})`;
    if (serviceType === "BUS") return `BUS (${otherFormData.bus_type || "AC Sleeper"})`;
    return `FLIGHT (${otherFormData.cabin_class || "Economy"})`;
  }, [serviceType, trainData.travel_class, otherFormData.bus_type, otherFormData.cabin_class]);

  const fromLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return trainData.from_station || "BANGALORE";
    if (serviceType === "BUS") return otherFormData.from_location || "BANGALORE";
    if (serviceType === "FLIGHT" && otherFormData.flight_trip_type === "Multi City" && Array.isArray(otherFormData.multi_city_flights) && otherFormData.multi_city_flights[0]?.from) {
      return (otherFormData.multi_city_flights[0].from.split(",")[0] || otherFormData.multi_city_flights[0].from).toUpperCase();
    }
    return otherFormData.from_airport || otherFormData.from_location || otherFormData.pickup || "BANGALORE";
  }, [serviceType, trainData.from_station, otherFormData.from_location, otherFormData.from_airport, otherFormData.pickup, otherFormData.flight_trip_type, otherFormData.multi_city_flights]);

  const toLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return trainData.to_station || "CHENNAI";
    if (serviceType === "BUS") return otherFormData.destination || "CHENNAI";
    if (serviceType === "FLIGHT") {
      if (otherFormData.flight_trip_type === "Multi City" && Array.isArray(otherFormData.multi_city_flights) && otherFormData.multi_city_flights.length > 0) {
        const route = otherFormData.multi_city_flights
          .map((f: any) => {
            const code = f.to?.match(/\(([A-Z]{3})\)/);
            return code ? code[1] : f.to?.split(",")[0]?.trim() || "";
          })
          .filter(Boolean)
          .join(" → ");
        if (route) return (route + " (MULTI CITY)").toUpperCase();
      }
      if (otherFormData.flight_trip_type === "Round Trip") {
        const to = (otherFormData.destination || otherFormData.to_airport || "DELHI").toUpperCase();
        return `${to} (ROUND TRIP)`;
      }
    }
    return otherFormData.destination || otherFormData.to_airport || otherFormData.to_destination || otherFormData.to_location || "DELHI";
  }, [serviceType, trainData.to_station, otherFormData.destination, otherFormData.to_airport, otherFormData.to_destination, otherFormData.to_location, otherFormData.flight_trip_type, otherFormData.multi_city_flights]);

  const vehicleDisplay = useMemo(() => {
    if (serviceType === "TRAIN") {
      const trainDesc = trainData.preferred_train ? trainData.preferred_train.toUpperCase() : "EXPRESS";
      return `TRAIN: ${trainDesc}, (${trainData.travel_class})`;
    }
    if (serviceType === "BUS") {
      return `BUS: ${otherFormData.bus_type || "AC SLEEPER"}`;
    }
    return `FLIGHT: ${otherFormData.cabin_class || "ECONOMY"}`;
  }, [serviceType, trainData.preferred_train, trainData.travel_class, otherFormData.bus_type, otherFormData.cabin_class]);

  const boardingPointDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return trainData.boarding_point || "—";
    return otherFormData.boarding_point || "—";
  }, [serviceType, trainData.boarding_point, otherFormData.boarding_point]);

  const boardingAddressDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return trainData.boarding_address || "—";
    return otherFormData.boarding_address || "—";
  }, [serviceType, trainData.boarding_address, otherFormData.boarding_address]);

  // Dynamic ticket fare calculation based on service type, class/category, and passenger count
  const ticketFareAmount = useMemo(() => {
    const tariffs = getSavedTicketTariffs();
    if (serviceType === "TRAIN") {
      if (trainData.fare_amount && Number(trainData.fare_amount) > 0) {
        return Number(trainData.fare_amount);
      }
      const count = Math.max(1, passengers.length);
      const cls = String(trainData.travel_class || "3A").toUpperCase();
      let per = tariffs.train[cls as keyof typeof tariffs.train] ?? 850;
      return count * per;
    }
    if (serviceType === "BUS") {
      if (otherFormData.fare_amount && Number(otherFormData.fare_amount) > 0) {
        return Number(otherFormData.fare_amount);
      }
      const count = Math.max(1, otherFormData.passengers?.length || 1);
      const bType = String(otherFormData.bus_type || "").toUpperCase();
      let per = tariffs.bus.seater ?? 850;
      if (bType.includes("VOLVO") || bType.includes("MULTI")) per = tariffs.bus.volvo ?? 1450;
      else if (bType.includes("SLEEPER")) per = tariffs.bus.sleeper ?? 1100;
      return count * per;
    }
    if (serviceType === "FLIGHT") {
      if (otherFormData.fare_amount && Number(otherFormData.fare_amount) > 0) {
        return Number(otherFormData.fare_amount);
      }
      const count = Math.max(1, otherFormData.passengers?.length || 1);
      let per = otherFormData.cabin_class === "Business" ? tariffs.flight.business ?? 14500 : tariffs.flight.economy ?? 4850;
      if (otherFormData.flight_trip_type === "Round Trip") per *= 2;
      if (otherFormData.flight_trip_type === "Multi City") {
        const legsCount = Array.isArray(otherFormData.multi_city_flights) ? otherFormData.multi_city_flights.length : 2;
        per *= legsCount;
      }
      return count * per;
    }
    return 1200;
  }, [
    serviceType,
    passengers,
    trainData.travel_class,
    trainData.fare_amount,
    otherFormData.fare_amount,
    otherFormData.bus_type,
    otherFormData.cabin_class,
    otherFormData.flight_trip_type,
    otherFormData.passengers,
  ]);

  const paymentStatusText = useMemo(() => {
    if (paymentChoice === "full") {
      return fullPaymentType === "AUTOMATIC"
        ? "CONFIRMED / 100% PAID (ONLINE UPI)"
        : `CONFIRMED / 100% PAID (${manualMethod === "CASH" ? "CASH" : manualMethod === "BANK_TRANSFER" ? "BANK TRANSFER" : manualMethod === "POS_CARD" ? "CARD POS" : "CHEQUE"})`;
    }
    if (paymentChoice === "token_100") {
      return `₹100 ADVANCE PAID (BAL: ₹${Math.max(0, ticketFareAmount - 100).toLocaleString("en-IN")})`;
    }
    return `PAY ON BOARDING (DUE: ₹${ticketFareAmount.toLocaleString("en-IN")})`;
  }, [paymentChoice, fullPaymentType, manualMethod, ticketFareAmount]);

  // Passenger count selector (1 to 6)
  const setPassengerCount = (count: number) => {
    const current = passengers;
    if (count > current.length) {
      const updated = [...current];
      for (let i = current.length; i < count; i++) {
        updated.push({ name: "", age: "", gender: "Male", berth_preference: "No Preference" });
      }
      setPassengers(updated);
    } else if (count < current.length) {
      setPassengers(current.slice(0, count));
    }
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 1 Validation -> Go to Passengers
  const handleContinueToPassengers = () => {
    if (!trainData.from_station || !trainData.from_station.trim()) {
      toast.error("Please enter From Station.");
      return;
    }
    if (!trainData.to_station || !trainData.to_station.trim()) {
      toast.error("Please enter To Station.");
      return;
    }
    if (!trainData.date) {
      toast.error("Please select Journey Date.");
      return;
    }
    setStep("PASSENGERS");
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  // Validation from PASSENGERS to PAYMENT
  const handleGoToPayment = () => {
    if (serviceType === "TRAIN") {
      const firstP = passengers[0];
      if (!firstP || !firstP.name || !firstP.name.trim()) {
        toast.error("Please enter Passenger 1 Full Name.");
        return;
      }
      if (!firstP.age || !firstP.age.trim()) {
        toast.error("Please enter Passenger 1 Age.");
        return;
      }
      if (!trainData.phone || !trainData.phone.trim()) {
        toast.error("Please enter Passenger Phone Number.");
        return;
      }
      if (!trainData.boarding_point || !trainData.boarding_point.trim()) {
        toast.error("Please enter the Boarding Point.");
        return;
      }
      if (!trainData.boarding_address || !trainData.boarding_address.trim()) {
        toast.error("Please enter the Boarding Address.");
        return;
      }
    } else if (serviceType === "BUS") {
      const firstP = otherFormData.passengers?.[0];
      if (!firstP || !firstP.name || !firstP.name.trim()) {
        toast.error("Please enter Passenger 1 Full Name.");
        return;
      }
      if (!otherFormData.phone || !otherFormData.phone.trim()) {
        toast.error("Please enter Passenger Phone Number.");
        return;
      }
      if (!otherFormData.boarding_point || !otherFormData.boarding_point.trim()) {
        toast.error("Please enter the Boarding Point.");
        return;
      }
      if (!otherFormData.boarding_address || !otherFormData.boarding_address.trim()) {
        toast.error("Please enter the Boarding Address.");
        return;
      }
    } else if (serviceType === "FLIGHT") {
      const firstP = otherFormData.passengers?.[0];
      if (!firstP || !firstP.name || !firstP.name.trim()) {
        toast.error("Please enter Passenger 1 Full Name.");
        return;
      }
      if (!otherFormData.phone || !otherFormData.phone.trim()) {
        toast.error("Please enter Passenger Phone Number.");
        return;
      }
      if (!otherFormData.boarding_point || !otherFormData.boarding_point.trim()) {
        toast.error("Please enter the Boarding Point / Terminal.");
        return;
      }
      if (!otherFormData.boarding_address || !otherFormData.boarding_address.trim()) {
        toast.error("Please enter the Boarding Address.");
        return;
      }
    }
    setStep("PAYMENT");
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  // Submit Train Booking (from PAYMENT step)
  const handleCompleteTrainBooking = async () => {
    const firstP = passengers[0];
    if (!firstP || !firstP.name.trim()) {
      toast.error("Please enter Passenger 1 Full Name.");
      return;
    }
    setIsSubmitting(true);
    try {
      const effectiveAdvance = paymentChoice === "full" ? Number(ticketFareAmount || 0) : paymentChoice === "token_100" ? 100 : 0;
      const effectiveMethod = paymentChoice === "full"
        ? (fullPaymentType === "AUTOMATIC" ? "UPI" : `MANUAL_${manualMethod}`)
        : paymentChoice === "token_100"
        ? "UPI"
        : "PAY_ON_ARRIVAL";

      const paymentNotes = [
        `Payment Choice: ${paymentChoice === "token_100" ? "₹100 Token Advance (Priority Lock)" : paymentChoice === "full" ? `Full Payment (${fullPaymentType})` : "Zero Advance (Pay on Boarding)"}`,
        paymentChoice === "token_100" && utrRef && `UTR Ref: ${utrRef}`,
        paymentChoice === "full" && fullPaymentType === "AUTOMATIC" && utrRef && `UPI UTR: ${utrRef}`,
        paymentChoice === "full" && fullPaymentType === "MANUAL" && `Manual Channel: ${manualMethod}${manualReceiptNo ? ` | Receipt: ${manualReceiptNo}` : ""}${collectedBy ? ` | Handled By: ${collectedBy}` : ""}`,
      ].filter(Boolean).join(" | ");

      const payload = {
        name: firstP.name.trim(),
        phone: trainData.phone.trim(),
        email: "booking@fortunetourism.in",
        service: "Train Booking",
        category: "TRAIN",
        booking_type: "TRAIN",
        pickup: trainData.from_station.trim(),
        destination: trainData.to_station.trim(),
        date: trainData.date || today,
        time: trainData.time || "07:00",
        passengers: String(passengers.length),
        passengers_list: passengers,
        boarding_point: trainData.boarding_point.trim(),
        boarding_address: trainData.boarding_address.trim(),
        notes: [
          `Offline Admin Train Booking`,
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          `Train: ${trainData.preferred_train || "Any"} | No: ${trainData.train_number || "N/A"} | Class: ${trainData.travel_class} | Quota: ${trainData.quota}`,
          `Total Fare: ₹${ticketFareAmount}`,
          paymentNotes,
          `Passengers: ${passengers.map((p, i) => `P${i + 1}: ${p.name} (${p.age}y/${p.gender})`).join(", ")}`,
        ]
          .filter(Boolean)
          .join(" | "),
        total_amount: Number(ticketFareAmount || 0),
        fare: Number(ticketFareAmount || 0),
        base_amount: Number(ticketFareAmount || 0),
        ticket_amount: Number(ticketFareAmount || 0),
        advance_amount: effectiveAdvance,
        payment_choice: paymentChoice,
        payment_method: effectiveMethod,
        payment_status: paymentChoice === "full" ? "Fully Paid" : paymentChoice === "token_100" ? "Advance Paid" : "Pending",
        payment_ref: manualReceiptNo || utrRef || null,
        transaction_id: manualReceiptNo || utrRef || null,
        collected_by: collectedBy || "Admin Counter",
        ticket_number: ticketNumber,
        pnr_number: pnrNumber,
        client_token: `FT-ADMIN-TRAIN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to submit booking.");
      }

      setStep("CONFIRMED");
      toast.success("Train ticket booking confirmed! Official ticket copy generated.");
      try {
        window.dispatchEvent(new Event("fortune_booking_created"));
      } catch {}
      if (onBookingCompleted) {
        onBookingCompleted();
      }
      window.scrollTo({ top: 80, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message || "An error occurred while confirming booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit other services (Bus, Flight) from PAYMENT step
  const handleCompleteOtherServiceBooking = async () => {
    setIsSubmitting(true);
    try {
      const isBus = serviceType === "BUS";
      const pCount = otherFormData.passengers?.length || 1;
      const firstP = otherFormData.passengers?.[0]?.name || "GUEST";

      const flightFrom = otherFormData.from_airport || otherFormData.from_location || otherFormData.pickup || "BANGALORE";
      const flightTo = otherFormData.destination || otherFormData.to_airport || otherFormData.to_destination || otherFormData.to_location || "DELHI";

      const effectiveAdvance = paymentChoice === "full" ? Number(ticketFareAmount || 0) : paymentChoice === "token_100" ? 100 : 0;
      const effectiveMethod = paymentChoice === "full"
        ? (fullPaymentType === "AUTOMATIC" ? "UPI" : `MANUAL_${manualMethod}`)
        : paymentChoice === "token_100"
        ? "UPI"
        : "PAY_ON_ARRIVAL";

      const paymentNotes = [
        `Payment Choice: ${paymentChoice === "token_100" ? "₹100 Token Advance (Priority Lock)" : paymentChoice === "full" ? `Full Payment (${fullPaymentType})` : "Zero Advance (Pay on Boarding)"}`,
        paymentChoice === "token_100" && utrRef && `UTR Ref: ${utrRef}`,
        paymentChoice === "full" && fullPaymentType === "AUTOMATIC" && utrRef && `UPI UTR: ${utrRef}`,
        paymentChoice === "full" && fullPaymentType === "MANUAL" && `Manual Channel: ${manualMethod}${manualReceiptNo ? ` | Receipt: ${manualReceiptNo}` : ""}${collectedBy ? ` | Handled By: ${collectedBy}` : ""}`,
      ].filter(Boolean).join(" | ");

      const payload = {
        name: firstP,
        phone: otherFormData.phone?.trim() || "",
        email: "booking@fortunetourism.in",
        service: isBus ? "Bus Booking" : "Flight Booking",
        category: isBus ? "BUS" : "FLIGHT",
        booking_type: serviceType,
        pickup: isBus ? otherFormData.from_location : flightFrom,
        destination: isBus ? otherFormData.destination : flightTo,
        date: otherFormData.date || today,
        time: otherFormData.time || "07:00",
        passengers: String(pCount),
        passengers_list: otherFormData.passengers || [],
        boarding_point: otherFormData.boarding_point || "",
        boarding_address: otherFormData.boarding_address || "",
        notes: [
          `Offline Admin Ticket Booking`,
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          isBus && `Bus Type: ${otherFormData.bus_type}`,
          !isBus && (
            otherFormData.flight_trip_type === "Multi City" && Array.isArray(otherFormData.multi_city_flights)
              ? `Flight: ${otherFormData.cabin_class || "Economy"} | Multi City (${otherFormData.multi_city_flights.length} Flights): ${otherFormData.multi_city_flights.map((f: any, i: number) => `F${i + 1}: ${f.from?.split(",")[0] || f.from} → ${f.to?.split(",")[0] || f.to} (${f.date || "?"} ${f.preferred_time || ""})`).join(" | ")}`
              : otherFormData.flight_trip_type === "Round Trip"
              ? `Flight: ${otherFormData.cabin_class || "Economy"} | Round Trip: ${flightFrom} ⇄ ${flightTo} | Dep: ${otherFormData.date || today} | Return: ${otherFormData.return_date || "N/A"}`
              : `Flight: ${otherFormData.cabin_class || "Economy"} | Trip: ${otherFormData.flight_trip_type} | Route: ${flightFrom} → ${flightTo}`
          ),
          `Total Fare: ₹${ticketFareAmount}`,
          paymentNotes,
        ]
          .filter(Boolean)
          .join(" | "),
        total_amount: Number(ticketFareAmount || 0),
        fare: Number(ticketFareAmount || 0),
        base_amount: Number(ticketFareAmount || 0),
        ticket_amount: Number(ticketFareAmount || 0),
        advance_amount: effectiveAdvance,
        payment_choice: paymentChoice,
        payment_method: effectiveMethod,
        payment_status: paymentChoice === "full" ? "Fully Paid" : paymentChoice === "token_100" ? "Advance Paid" : "Pending",
        payment_ref: manualReceiptNo || utrRef || null,
        transaction_id: manualReceiptNo || utrRef || null,
        collected_by: collectedBy || "Admin Counter",
        ticket_number: ticketNumber,
        pnr_number: pnrNumber,
        client_token: `FT-ADMIN-TKT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to submit booking.");
      }

      setStep("CONFIRMED");
      toast.success("Booking submitted! Official Ticket Copy generated.");
      try {
        window.dispatchEvent(new Event("fortune_booking_created"));
      } catch {}
      if (onBookingCompleted) {
        onBookingCompleted();
      }
      window.scrollTo({ top: 80, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message || "An error occurred while confirming booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    downloadTicketCopyPDF({
      ticketNumber,
      pnrNumber,
      bookingDate: bookingDateTime,
      passengerName: primaryPassengerName,
      passengerPhone: primaryPhone,
      tourType: tourTypeDisplay,
      fromLocation: fromLocationDisplay,
      toLocation: toLocationDisplay,
      departureOn: departureDateFormatted,
      tripType: "ONE WAY",
      vehicleOrMode: vehicleDisplay,
      boardingPoint: boardingPointDisplay,
      boardingAddress: boardingAddressDisplay,
      fareAmount: ticketFareAmount,
      serviceType,
      paymentStatus: paymentStatusText,
      passengers: activePassengersList,
    });
    toast.success("Ticket PDF downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetForAnother = () => {
    setStep("JOURNEY");
    setTicketNumber(generateTicketNumber());
    setPnrNumber(generatePNR());
    setPassengers([{ name: "", age: "", gender: "Male", berth_preference: "No Preference" }]);
    setTrainData({
      from_station: "",
      to_station: "",
      date: new Date().toISOString().split("T")[0],
      preferred_train: "",
      travel_class: "3A",
      quota: "General",
      time: "07:00",
      train_number: "",
      boarding_point: "",
      boarding_address: "",
      phone: "",
      fare_amount: "",
    });
    setOtherFormData((prev: any) => ({
      ...prev,
      fare_amount: "",
    }));
  };

  return (
    <div className="relative py-4 w-full">
      {/* Printable CSS block for Ticket Copy */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden !important;
          }
          .ticket-copy-print-area, .ticket-copy-print-area * {
            visibility: visible !important;
          }
          .ticket-copy-print-area {
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

      <div className="w-full max-w-5xl mx-auto space-y-6">
        {step === "JOURNEY" || step === "PASSENGERS" ? (
          /* ================= STEP 1 & 2: JOURNEY & PASSENGER FORMS ================= */
          <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
            {/* Top Header with Back to Services */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full px-3.5 py-1 shadow-sm">
                  {serviceType === "TRAIN" && "🚅 TRAIN BOOKING"}
                  {serviceType === "FLIGHT" && "✈️ FLIGHT BOOKING"}
                  {serviceType === "BUS" && "🚌 BUS BOOKING"}
                </span>
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">
                  Select Journey &amp; Schedule
                </span>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer ml-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Services
              </button>
            </div>

            {/* 3 Ticket Switcher Tabs (Train Booking, Flight Booking, Bus Booking) */}
            <div className="flex justify-center pb-2">
              <div className="inline-flex rounded-full border border-white/15 bg-[#111c3a]/90 p-1.5 gap-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setServiceType("TRAIN");
                    setStep("JOURNEY");
                  }}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    serviceType === "TRAIN"
                      ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30 font-extrabold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TrainFront className="w-4 h-4" /> Train Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceType("FLIGHT");
                    setStep("JOURNEY");
                  }}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    serviceType === "FLIGHT"
                      ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30 font-extrabold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Plane className="w-4 h-4" /> Flight Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceType("BUS");
                    setStep("JOURNEY");
                  }}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    serviceType === "BUS"
                      ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30 font-extrabold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Bus className="w-4 h-4" /> Bus Booking
                </button>
              </div>
            </div>

            {/* TRAIN BOOKING FORM */}
            {serviceType === "TRAIN" && (
              <>
                {step === "JOURNEY" && (
                  /* IMAGE 1: TRAIN JOURNEY DETAILS */
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <TrainFront className="w-4 h-4 text-emerald-400" /> TRAIN JOURNEY DETAILS
                    </h3>

                    {/* From Station & To Station */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          From Station *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bangalore City (SBC)"
                          value={trainData.from_station}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, from_station: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          To Station *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Chennai Central (MAS)"
                          value={trainData.to_station}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, to_station: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Journey Date, Preferred Train, Class, Quota */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Journey Date *
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={trainData.date}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, date: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          Preferred Train
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Shatabdi / Rajdhani / Any"
                          value={trainData.preferred_train}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, preferred_train: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          Class *
                        </label>
                        <select
                          value={trainData.travel_class}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, travel_class: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                        >
                          {CLASS_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value} className="bg-[#0b1329] text-white">
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          Quota *
                        </label>
                        <select
                          value={trainData.quota}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, quota: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                        >
                          {QUOTA_OPTIONS.map((q) => (
                            <option key={q.value} value={q.value} className="bg-[#0b1329] text-white">
                              {q.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Preferred Time, Train Number & Fare Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          Preferred Time
                        </label>
                        <input
                          type="time"
                          value={trainData.time}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, time: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          Train Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 12608 / 12028 / Any"
                          value={trainData.train_number}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, train_number: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                          Fare Amount (₹) (Optional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder={`Est: ₹${ticketFareAmount.toLocaleString("en-IN")}`}
                          value={trainData.fare_amount}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, fare_amount: e.target.value }))
                          }
                          className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark] placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Continue Button */}
                    <div className="flex justify-end pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handleContinueToPassengers}
                        className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 sm:px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-2"
                      >
                        CONTINUE TO PASSENGER DETAILS →
                      </button>
                    </div>
                  </div>
                )}

                {step === "PASSENGERS" && (
                  /* IMAGE 2: PASSENGER DETAILS */
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" /> PASSENGER DETAILS
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Number of Passengers:
                        </label>
                        <select
                          value={passengers.length}
                          onChange={(e) => setPassengerCount(Number(e.target.value))}
                          className="bg-[#111c3a] border border-emerald-500/40 rounded-xl px-3 py-1.5 text-sm font-black text-emerald-300 focus:ring-2 focus:ring-[#00c58e]/20 outline-none shadow-inner [color-scheme:dark]"
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n} className="bg-[#0b1329] text-white">
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Passenger Phone Number Input */}
                    <div className="bg-[#111c3a]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-inner">
                      <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        Passenger Phone Number (Mobile / WhatsApp No.) *
                      </label>
                      <input
                        type="tel"
                        maxLength={15}
                        placeholder="Enter passenger mobile number (e.g. 9964600247 / 9740463404)"
                        value={trainData.phone}
                        onChange={(e) =>
                          setTrainData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="w-full bg-[#0b1329]/90 border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none placeholder:text-slate-500 [color-scheme:dark]"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        This phone number will be recorded on the official ticket voucher (e.g. 9964600247 / 9740463404) and used for SMS / WhatsApp dispatch.
                      </p>
                    </div>

                    {/* Passenger Input Rows */}
                    <div className="space-y-2.5">
                      {passengers.map((p, idx) => (
                        <div
                          key={idx}
                          className="bg-[#111c3a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner text-white"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-emerald-400 shrink-0 w-5">
                              {idx + 1}.
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1">
                              <div className="sm:col-span-6">
                                <input
                                  type="text"
                                  placeholder="Full Name (as per Aadhaar / ID)"
                                  value={p.name}
                                  onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                                  className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-[#00c58e] outline-none placeholder:text-slate-500 [color-scheme:dark]"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <input
                                  type="number"
                                  min="1"
                                  max="120"
                                  placeholder="Age"
                                  value={p.age}
                                  onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                                  className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-[#00c58e] outline-none placeholder:text-slate-500 [color-scheme:dark]"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <select
                                  value={p.gender}
                                  onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                                  className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-[#00c58e] outline-none [color-scheme:dark]"
                                >
                                  <option className="bg-[#0b1329]">Male</option>
                                  <option className="bg-[#0b1329]">Female</option>
                                  <option className="bg-[#0b1329]">Child</option>
                                </select>
                              </div>
                            </div>

                            {passengers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePassenger(idx)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                                title="Remove Passenger"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Boarding Details Box */}
                    <div className="bg-[#111c3a]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block">
                        BOARDING DETAILS (FOR DRIVER / PICKUP)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                            Boarding Point *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. City Railway Station, Platform 1"
                            value={trainData.boarding_point}
                            onChange={(e) =>
                              setTrainData((prev) => ({ ...prev, boarding_point: e.target.value }))
                            }
                            className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#00c58e] [color-scheme:dark] placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                            Full Boarding Address *
                          </label>
                          <input
                            type="text"
                            placeholder="Full address / landmark for pickup"
                            value={trainData.boarding_address}
                            onChange={(e) =>
                              setTrainData((prev) => ({ ...prev, boarding_address: e.target.value }))
                            }
                            className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#00c58e] [color-scheme:dark] placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ticket Fare Summary & Custom Fare Adjustment */}
                    <div className="bg-[#111c3a]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block">
                          Ticket Fare Amount
                        </span>
                        <p className="text-xs text-slate-400">
                          Total fare calculated for {passengers.length} passenger{passengers.length > 1 ? "s" : ""}. You can adjust the exact ticket fare amount if required.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-300 whitespace-nowrap">
                          Total Fare (₹):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={trainData.fare_amount || ""}
                          placeholder={`₹${ticketFareAmount.toLocaleString("en-IN")}`}
                          onChange={(e) => setTrainData((prev) => ({ ...prev, fare_amount: e.target.value }))}
                          className="w-36 bg-[#0b1329] border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-black text-emerald-300 focus:ring-2 focus:ring-[#00c58e]/30 outline-none shadow-inner [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setStep("JOURNEY")}
                        className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
                      >
                        ← Back to Journey Details
                      </button>

                      <button
                        type="button"
                        onClick={handleGoToPayment}
                        className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 sm:px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-2"
                      >
                        CONTINUE TO PAYMENT CHOICE →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* FLIGHT BOOKING FORM */}
            {serviceType === "FLIGHT" && (
              <FlightBookingForm
                formData={otherFormData}
                onChange={onOtherChange}
                errors={{}}
                onCompleteBooking={handleGoToPayment}
                isSubmitting={isSubmitting}
              />
            )}

            {/* BUS BOOKING FORM */}
            {serviceType === "BUS" && (
              <BusBookingForm
                formData={otherFormData}
                onChange={onOtherChange}
                errors={{}}
                onCompleteBooking={handleGoToPayment}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        ) : step === "PAYMENT" ? (
          /* ================= STEP 3: PAYMENT CHOICE (MATCHING USER DESIGN) ================= */
          <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-extrabold text-white text-lg sm:text-xl font-heading">
                  Payment Choice
                </h2>
                <p className="text-xs text-slate-400">
                  Select payment option to confirm your reservation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep("PASSENGERS")}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Passenger Details
              </button>
            </div>

            {/* Trip & Fare Components Breakdown */}
            <div className="bg-[#111c3a]/90 border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    TRIP SUMMARY &amp; FARE COMPONENTS
                  </span>
                  <div className="font-extrabold text-white text-sm sm:text-base">
                    {vehicleDisplay}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">TOTAL FARE</span>
                  <span className="font-black text-[#00c58e] text-lg sm:text-xl">₹{ticketFareAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-slate-400 font-semibold">Route &amp; Journey:</div>
                  <div className="text-white font-bold">
                    {fromLocationDisplay} → {toLocationDisplay}
                  </div>
                  <div className="text-slate-300 text-[11px] space-y-0.5 pt-0.5">
                    <div>Departure: {departureDateFormatted}</div>
                    {serviceType === "TRAIN" && (
                      <div>Train: <strong>{trainData.preferred_train || "IRCTC Express"}</strong> | Class: <strong>{trainData.travel_class}</strong> | Quota: <strong>{trainData.quota}</strong> | Passengers: <strong>{passengers.length}</strong></div>
                    )}
                    {serviceType === "BUS" && (
                      <div>Bus: <strong>{otherFormData.bus_type || "AC Sleeper"}</strong> | Pickup: <strong>{otherFormData.boarding_point || fromLocationDisplay}</strong> | Seats: <strong>{otherFormData.passengers?.length || 1}</strong></div>
                    )}
                    {serviceType === "FLIGHT" && (
                      <div>Trip: <strong>{otherFormData.flight_trip_type || "One Way"}</strong> | Cabin: <strong>{otherFormData.cabin_class || "Economy"}</strong> | Passengers: <strong>{otherFormData.passengers?.length || 1}</strong></div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 sm:text-right">
                  <div className="text-slate-400 font-semibold">Fare Components Breakdown:</div>
                  <div className="text-slate-300 text-[11px] space-y-0.5">
                    {serviceType === "TRAIN" ? (
                      <>
                        <div>Base Ticket Fare: <strong className="text-white">₹{Math.max(0, Math.round(ticketFareAmount * 0.95)).toLocaleString("en-IN")}</strong></div>
                        <div>IRCTC &amp; Reservation Charges: <strong className="text-emerald-400">Included</strong></div>
                        <div>Taxes &amp; GST: <strong className="text-emerald-400">Included (5% GST)</strong></div>
                        <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{ticketFareAmount.toLocaleString("en-IN")}</strong></div>
                      </>
                    ) : serviceType === "BUS" ? (
                      <>
                        <div>Base Seat Fare: <strong className="text-white">₹{Math.max(0, Math.round(ticketFareAmount * 0.95)).toLocaleString("en-IN")}</strong></div>
                        <div>Toll &amp; Driver Allowance: <strong className="text-emerald-400">Included</strong></div>
                        <div>Taxes &amp; GST: <strong className="text-emerald-400">Included (5% GST)</strong></div>
                        <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{ticketFareAmount.toLocaleString("en-IN")}</strong></div>
                      </>
                    ) : (
                      <>
                        <div>Base Airfare: <strong className="text-white">₹{Math.max(0, Math.round(ticketFareAmount * 0.88)).toLocaleString("en-IN")}</strong></div>
                        <div>Fuel &amp; Airline Charges: <strong className="text-emerald-400">Included</strong></div>
                        <div>Airport Taxes &amp; GST: <strong className="text-emerald-400">Included (12% Taxes)</strong></div>
                        <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{ticketFareAmount.toLocaleString("en-IN")}</strong></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Ticket Fare Amount Override */}
            <div className="bg-[#111c3a]/90 border border-amber-400/40 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-400" /> Ticket Fare / Manual Mode Amount (₹)
                  </span>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Editable Manual Amount
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Enter or adjust the custom ticket amount. This exact amount reflects immediately on journey tickets, payment vouchers, and accounting reports.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white font-black text-base">₹</span>
                <input
                  type="number"
                  min={0}
                  value={serviceType === "TRAIN" ? (trainData.fare_amount || "") : (otherFormData.fare_amount || "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (serviceType === "TRAIN") {
                      setTrainData((prev) => ({ ...prev, fare_amount: val }));
                    } else {
                      setOtherFormData((prev: any) => ({ ...prev, fare_amount: val }));
                    }
                  }}
                  placeholder={String(ticketFareAmount)}
                  className="w-36 bg-[#0B132B] border border-amber-400/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-white font-black text-base px-3 py-1.5 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                PAYMENT CHOICE
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Pay ₹100 Advance */}
                <button
                  type="button"
                  onClick={() => setPaymentChoice("token_100")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentChoice === "token_100"
                      ? "bg-[#162544]/95 border-[#00c58e] ring-2 ring-[#00c58e]/30 shadow-xl shadow-black/40"
                      : "bg-[#111c3a]/80 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-white text-sm sm:text-base">⚡ Pay ₹100 Advance</span>
                    <span className="bg-[#00c58e] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      PRIORITY LOCK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {serviceType === "TRAIN" && "Instant seat reservation lock with priority booking confirmation."}
                    {serviceType === "BUS" && "Instant seat reservation lock with priority bus operator confirmation."}
                    {serviceType === "FLIGHT" && "Instant flight seat block with priority PNR confirmation."}
                  </p>
                </button>

                {/* 2. Full Payment Method (Manual & Automatically) */}
                <button
                  type="button"
                  onClick={() => setPaymentChoice("full")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    paymentChoice === "full"
                      ? "bg-[#162544]/95 border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-black/40"
                      : "bg-[#111c3a]/80 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-white text-sm sm:text-base flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" /> Full Payment Method
                    </span>
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      MANUAL &amp; AUTO
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    100% full amount (₹{ticketFareAmount.toLocaleString("en-IN")}) by manual cash/bank or automatically via UPI.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentChoice("full");
                        setFullPaymentType("AUTOMATIC");
                      }}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-all ${
                        paymentChoice === "full" && fullPaymentType === "AUTOMATIC"
                          ? "bg-[#00c58e] text-white shadow"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      ⚡ Automatically (UPI/QR)
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentChoice("full");
                        setFullPaymentType("MANUAL");
                      }}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-all ${
                        paymentChoice === "full" && fullPaymentType === "MANUAL"
                          ? "bg-amber-400 text-slate-950 shadow"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      ✍️ Manually (Cash/Bank)
                    </span>
                  </div>
                </button>

                {/* 3. Zero Advance */}
                <button
                  type="button"
                  onClick={() => setPaymentChoice("zero")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentChoice === "zero"
                      ? "bg-[#162544]/95 border-[#00c58e] ring-2 ring-[#00c58e]/30 shadow-xl shadow-black/40"
                      : "bg-[#111c3a]/80 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-white text-sm sm:text-base">Zero Advance</span>
                    <span className="bg-white/10 text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Pay ₹0 Today
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {serviceType === "FLIGHT" ? "Pay full amount upon ticket issuance / travel date." : "Pay full amount directly upon boarding / journey date."}
                  </p>
                </button>
              </div>

              {/* OPTION 1: UPI QR if ₹100 Advance is selected */}
              {paymentChoice === "token_100" && (
                <div className="bg-[#111c3a]/95 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl shadow-purple-950/20">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-bold text-sm shadow">
                        पे
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-sm">
                          Scan &amp; Pay via PhonePe / Any UPI App
                        </h3>
                        <p className="text-[11px] text-purple-200">
                          Pay ₹100 Token Advance to confirm and instantly generate journey ticket copy (Balance ₹{(Math.max(0, ticketFareAmount - 100)).toLocaleString("en-IN")} on boarding)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      Token Advance QR (₹100)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="bg-white p-3 rounded-2xl shadow-2xl border-2 border-purple-300 shrink-0 text-center group relative">
                      <div
                        className="w-44 sm:w-48 overflow-hidden rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
                        onClick={() => setShowQrModal(true)}
                        title="Click to enlarge QR code"
                      >
                        <img
                          src="/images/phonepe-qr.jpg"
                          alt="PhonePe Payment QR Code - ZAMEER S"
                          className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#5f259f] hover:text-purple-900 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" /> Tap to Enlarge QR
                      </button>
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <div className="bg-[#0B132B] border border-white/15 rounded-xl p-3 flex items-center justify-between shadow-xs">
                        <div>
                          <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Beneficiary / Merchant</div>
                          <div className="font-black text-white text-base flex items-center gap-2">
                            ZAMEER S
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">Verified</span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">fortunetourism@okaxis</div>
                        </div>
                        <button
                          type="button"
                          onClick={copyUPI}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/70 px-3 py-1.5 rounded-lg border border-emerald-500/40 hover:bg-emerald-900 transition-colors cursor-pointer"
                        >
                          {upiCopied ? <Check className="w-3.5 h-3.5 text-[#00c58e]" /> : <Copy className="w-3.5 h-3.5" />}
                          {upiCopied ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fast Pay ₹100 Advance With UPI App</div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: "PhonePe", link: "phonepe://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=100&cu=INR", color: "bg-[#5f259f] text-white hover:bg-purple-800 border-purple-400/30" },
                            { name: "Google Pay", link: "tez://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=100&cu=INR", color: "bg-blue-600 text-white hover:bg-blue-700 border-blue-400/30" },
                            { name: "Paytm", link: "paytmmp://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=100&cu=INR", color: "bg-sky-600 text-white hover:bg-sky-700 border-sky-400/30" },
                            { name: "Any UPI App", link: "upi://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=100&cu=INR&tn=Token%20Advance%20Fortune%20Tourism", color: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-400/30" },
                          ].map((app) => (
                            <a
                              key={app.name}
                              href={app.link}
                              className={`text-xs font-black px-3.5 py-1.5 rounded-lg border transition-all shadow-xs ${app.color}`}
                            >
                              {app.name}
                            </a>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          UTR / Transaction ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter 12-digit UTR No. e.g. 423589124012"
                          value={utrRef}
                          onChange={(e) => setUtrRef(e.target.value)}
                          className="w-full bg-[#0B132B] border border-white/15 focus:border-[#00c58e] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OPTION 2: FULL PAYMENT METHOD */}
              {paymentChoice === "full" && (
                <div className="bg-[#111c3a]/95 border-2 border-amber-400/50 rounded-2xl p-5 space-y-5 shadow-2xl shadow-amber-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base flex items-center gap-1.5">
                          <CreditCard className="w-5 h-5 text-amber-400" /> Full Payment Method:
                        </span>
                        <span className="text-xs font-mono font-black text-amber-300 bg-amber-400/15 px-3 py-1 rounded-lg border border-amber-400/30">
                          100% Fare: ₹{ticketFareAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Choose between <strong>Automatically</strong> (instant online UPI QR) or <strong>Manually</strong> (Cash / Bank / Card).
                      </p>
                    </div>

                    <div className="inline-flex p-1 bg-[#091024] rounded-xl border border-white/15 shrink-0">
                      <button
                        type="button"
                        onClick={() => setFullPaymentType("AUTOMATIC")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          fullPaymentType === "AUTOMATIC"
                            ? "bg-[#00c58e] text-white shadow font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-white" /> Automatically (UPI / QR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFullPaymentType("MANUAL")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          fullPaymentType === "MANUAL"
                            ? "bg-amber-400 text-slate-950 shadow font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" /> Manually (Cash / Bank)
                      </button>
                    </div>
                  </div>

                  {/* 2A: AUTOMATIC FULL PAYMENT VIEW */}
                  {fullPaymentType === "AUTOMATIC" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-bold text-sm shadow">
                            पे
                          </div>
                          <div>
                            <h4 className="font-extrabold text-white text-sm">
                              Automatic Full Fare Payment via PhonePe / UPI
                            </h4>
                            <p className="text-[11px] text-purple-200">
                              Pay full fare of ₹{ticketFareAmount.toLocaleString("en-IN")} via QR scan to confirm booking 100% settled
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          Full Amount ₹{ticketFareAmount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="bg-white p-3 rounded-2xl shadow-2xl border-2 border-purple-300 shrink-0 text-center group relative">
                          <div
                            className="w-44 sm:w-48 overflow-hidden rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
                            onClick={() => setShowQrModal(true)}
                            title="Click to enlarge QR code"
                          >
                            <img
                              src="/images/phonepe-qr.jpg"
                              alt="PhonePe Payment QR Code - ZAMEER S"
                              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowQrModal(true)}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#5f259f] hover:text-purple-900 transition-colors cursor-pointer"
                          >
                            <Maximize2 className="w-3 h-3" /> Tap to Enlarge QR
                          </button>
                        </div>

                        <div className="flex-1 space-y-3 w-full">
                          <div className="bg-[#0B132B] border border-white/15 rounded-xl p-3 flex items-center justify-between shadow-xs">
                            <div>
                              <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Beneficiary / Merchant</div>
                              <div className="font-black text-white text-base flex items-center gap-2">
                                ZAMEER S
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">Verified</span>
                              </div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">fortunetourism@okaxis</div>
                            </div>
                            <button
                              type="button"
                              onClick={copyUPI}
                              className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/70 px-3 py-1.5 rounded-lg border border-emerald-500/40 hover:bg-emerald-900 transition-colors cursor-pointer"
                            >
                              {upiCopied ? <Check className="w-3.5 h-3.5 text-[#00c58e]" /> : <Copy className="w-3.5 h-3.5" />}
                              {upiCopied ? "Copied!" : "Copy"}
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Fast Pay Full Amount (₹{ticketFareAmount.toLocaleString("en-IN")}) With UPI App
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { name: "PhonePe", link: `phonepe://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${ticketFareAmount}&cu=INR`, color: "bg-[#5f259f] text-white hover:bg-purple-800 border-purple-400/30" },
                                { name: "Google Pay", link: `tez://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${ticketFareAmount}&cu=INR`, color: "bg-blue-600 text-white hover:bg-blue-700 border-blue-400/30" },
                                { name: "Paytm", link: `paytmmp://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${ticketFareAmount}&cu=INR`, color: "bg-sky-600 text-white hover:bg-sky-700 border-sky-400/30" },
                                { name: "Any UPI App", link: `upi://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${ticketFareAmount}&cu=INR&tn=Full%20Payment%20Fortune%20Tourism`, color: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-400/30" },
                              ].map((app) => (
                                <a
                                  key={app.name}
                                  href={app.link}
                                  className={`text-xs font-black px-3.5 py-1.5 rounded-lg border transition-all shadow-xs ${app.color}`}
                                >
                                  {app.name}
                                </a>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1">
                              UTR / Online Transaction ID (Mandatory for Auto Verification)
                            </label>
                            <input
                              type="text"
                              placeholder="Enter 12-digit UTR No. e.g. 423589124012"
                              value={utrRef}
                              onChange={(e) => setUtrRef(e.target.value)}
                              className="w-full bg-[#0B132B] border border-white/15 focus:border-[#00c58e] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2B: MANUAL FULL PAYMENT VIEW */}
                  {fullPaymentType === "MANUAL" && (
                    <div className="bg-[#0b1329] border border-amber-400/30 rounded-2xl p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow">
                            <Banknote className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-white text-sm">
                              Record Full Manual Payment
                            </h4>
                            <p className="text-[11px] text-amber-200">
                              Settle ₹{ticketFareAmount.toLocaleString("en-IN")} via Cash, Bank Transfer, POS Card or Direct Settlement
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-full">
                          Manual Payment Mode
                        </span>
                      </div>

                      {/* Manual Payment Method Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Payment Method / Collection Channel *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "CASH", label: "💵 Cash in Hand", desc: "Pay at Office/Desk" },
                            { id: "BANK_TRANSFER", label: "🏦 Bank Transfer", desc: "NEFT / RTGS / IMPS" },
                            { id: "POS_CARD", label: "💳 Card (POS)", desc: "Swipe / Debit / Credit" },
                            { id: "CHEQUE", label: "📝 Cheque / DD", desc: "Payable to Fortune Tourism" },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setManualMethod(m.id as any)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                manualMethod === m.id
                                  ? "bg-amber-400/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30 font-bold"
                                  : "bg-[#111c3a]/70 border-white/10 text-slate-400 hover:border-white/20"
                              }`}
                            >
                              <div className="font-extrabold text-white text-xs">{m.label}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* If Bank Transfer: Show Bank Account Details */}
                      {manualMethod === "BANK_TRANSFER" && (
                        <div className="bg-[#111c3a] border border-blue-400/30 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                          <div className="font-black text-blue-300 text-xs">Official Bank Account Details for Transfer:</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                            <div><span className="text-slate-400">Account Name:</span> <strong className="text-white">FORTUNE TOURISM</strong></div>
                            <div><span className="text-slate-400">Bank:</span> <strong className="text-white">AXIS BANK LTD</strong></div>
                            <div><span className="text-slate-400">UPI ID:</span> <strong className="text-white font-mono">fortunetourism@okaxis</strong></div>
                          </div>
                        </div>
                      )}

                      {/* Receipt No & Collected By */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Receipt / Voucher / Transaction Ref No. (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. REC-2026-0041 / CASH / NEFT-Ref"
                            value={manualReceiptNo}
                            onChange={(e) => setManualReceiptNo(e.target.value)}
                            className="w-full bg-[#111c3a] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Handled By / Note
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Booking Portal / Counter"
                            value={collectedBy}
                            onChange={(e) => setCollectedBy(e.target.value)}
                            className="w-full bg-[#111c3a] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Settlement badge */}
                      <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#00c58e]" />
                          <span className="text-xs font-bold text-emerald-200">
                            Full Amount of ₹{ticketFareAmount.toLocaleString("en-IN")} marked as 100% Settled &amp; Confirmed
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          ZERO DUE UPON BOARDING
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OPTION 3: ZERO ADVANCE NOTIFICATION */}
              {paymentChoice === "zero" && (
                <div className="bg-[#111c3a]/90 border border-white/15 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 text-slate-300 flex items-center justify-center font-black">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        Zero Advance Selected (Pay on Boarding)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Pay the full journey fare of <strong>₹{ticketFareAmount.toLocaleString("en-IN")}</strong> directly upon {serviceType === "FLIGHT" ? "ticket issuance / travel date" : "boarding"} via Cash or PhonePe.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-xl shrink-0">
                    Due: ₹{ticketFareAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Confirm Button */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep("PASSENGERS")}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Passenger Details
              </button>

              <button
                type="button"
                onClick={serviceType === "TRAIN" ? handleCompleteTrainBooking : handleCompleteOtherServiceBooking}
                disabled={isSubmitting}
                className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-8 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Ticket...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> CONFIRM BOOKING &amp; GENERATE TICKET COPY
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ================= STEP 3: TICKET CONFIRMATION & OFFICIAL VOUCHER ================= */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Confirmation Banner (Image 3) */}
            <div className="no-print bg-[#0B132B]/95 border border-white/15 rounded-2xl p-5 shadow-2xl text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#00c58e] text-white flex items-center justify-center shadow-md shadow-[#00c58e]/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-white text-base sm:text-lg">
                      Booking Confirmed Successfully!
                    </h2>
                    <p className="text-xs text-slate-400">
                      Your official Ticket Copy is generated below. You can download PDF or print it.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00c58e] hover:bg-[#00a87a] text-white font-black rounded-xl text-xs shadow-md shadow-[#00c58e]/20 transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Download PDF Ticket
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs border border-white/15 shadow transition-all cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-amber-400" /> Print
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <strong className="text-slate-300 uppercase text-xs font-black">TICKET NO:</strong>{" "}
                    <span className="font-mono font-black text-amber-300 text-base sm:text-lg tracking-wider bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-500/40 shadow-2xs">
                      {ticketNumber}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <strong className="text-slate-300 uppercase text-xs font-black">PNR:</strong>{" "}
                    <span className="font-mono font-black text-white text-base sm:text-lg tracking-wider bg-[#111c3a] px-2.5 py-0.5 rounded-lg border border-white/20 shadow-2xs">
                      {pnrNumber}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <strong className="text-slate-300 uppercase text-xs font-black">TOTAL FARE:</strong>{" "}
                    <span className="font-mono font-black text-emerald-400 text-base sm:text-lg tracking-wider bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 shadow-2xs">
                      ₹{ticketFareAmount.toLocaleString("en-IN")}
                    </span>
                  </span>
                </div>

                <a
                  href={buildWhatsAppUrl(
                    `Hello Fortune Tourism! New offline ${serviceType.toLowerCase()} ticket reservation confirmed.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Total Fare:* ₹${ticketFareAmount.toLocaleString("en-IN")}\n*Passenger:* ${primaryPassengerName}\n*Phone:* ${primaryPhone}\n*From:* ${fromLocationDisplay}\n*To:* ${toLocationDisplay}\n*Date:* ${departureDateFormatted}\n*Service:* ${vehicleDisplay}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Share on WhatsApp
                </a>
              </div>
            </div>

            {/* OFFICIAL TICKET COPY VOUCHER CONTAINER */}
            <div
              id="official-ticket-card"
              className="ticket-copy-print-area bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-md space-y-4"
            >
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
                      BOOKING DATE &amp; TIME : <span className="font-extrabold text-slate-950">{bookingDateTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-900 font-sans text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-slate-950 font-black tracking-wide text-base sm:text-lg">
                    Ticket Copy For Your Journey
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                      TOTAL FARE :
                      <strong className="font-mono font-black text-emerald-700 text-sm sm:text-base">
                        ₹{ticketFareAmount.toLocaleString("en-IN")}
                      </strong>
                    </span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      TICKET NUMBER :
                      <strong className="font-mono font-black text-amber-700 text-sm sm:text-base tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                        {ticketNumber}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact Spreadsheet Table Layout */}
              <div className="overflow-x-auto border-2 border-slate-900">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <tbody>
                    {/* Row 1 */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-36 whitespace-nowrap">
                        Passenger Name:
                      </td>
                      <td className="p-2.5 font-black text-slate-900 uppercase">
                        {primaryPassengerName}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-40 whitespace-nowrap">
                        Passenger Phone No.:
                      </td>
                      <td className="p-1.5 font-bold text-slate-900">
                        <input
                          type="tel"
                          value={serviceType === "TRAIN" ? trainData.phone : otherFormData.phone}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (serviceType === "TRAIN") {
                              setTrainData((prev) => ({ ...prev, phone: val }));
                            } else {
                              setOtherFormData((prev: any) => ({ ...prev, phone: val }));
                            }
                          }}
                          placeholder="e.g. 9964600247 / 9740463404"
                          className="w-full bg-transparent border-b border-dashed border-slate-400 hover:border-slate-800 focus:border-emerald-600 focus:bg-emerald-50/40 px-1 py-0.5 text-xs font-bold text-slate-900 outline-none transition"
                          title="Click to edit passenger phone number on ticket copy"
                        />
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-28 whitespace-nowrap">
                        Tour Type
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        {tourTypeDisplay}
                      </td>
                    </tr>

                    {/* Row 2: FROM | TO */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        FROM
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                        {fromLocationDisplay}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        TO:
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                        {toLocationDisplay}
                      </td>
                    </tr>

                    {/* Row 3: Ticket Number | PNR Number | Departure On */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Ticket Number:
                      </td>
                      <td className="p-2.5 font-black font-mono text-amber-700 text-sm tracking-wider">
                        {ticketNumber}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        PNR Number:
                      </td>
                      <td className="p-2.5 font-black font-mono text-slate-950 text-sm tracking-wider">
                        {pnrNumber}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Departure On:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {departureDateFormatted}
                      </td>
                    </tr>

                    {/* Row 4: Boarding Point | Boarding Address */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Boarding Point:
                      </td>
                      <td colSpan={2} className="p-2.5 font-bold text-slate-900 uppercase">
                        {boardingPointDisplay}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Boarding Address:
                      </td>
                      <td colSpan={2} className="p-2.5 font-bold text-slate-900">
                        {boardingAddressDisplay}
                      </td>
                    </tr>

                    {/* Row 5: Trip Type | Type Of Train | Boarding point */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Trip Type:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        ONE WAY
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        {serviceType === "FLIGHT"
                          ? "Type Of Flight:"
                          : serviceType === "BUS"
                          ? "Type Of Bus:"
                          : "Type Of Train:"}
                      </td>
                      <td className="p-2.5 font-black text-slate-900 uppercase">
                        {vehicleDisplay}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Fare Amount:
                      </td>
                      <td className="p-1.5 font-black text-emerald-700 uppercase">
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-700 font-black">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={serviceType === "TRAIN" ? (trainData.fare_amount || ticketFareAmount) : (otherFormData.fare_amount || ticketFareAmount)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (serviceType === "TRAIN") {
                                setTrainData((prev) => ({ ...prev, fare_amount: val }));
                              } else {
                                setOtherFormData((prev: any) => ({ ...prev, fare_amount: val }));
                              }
                              try {
                                window.dispatchEvent(new Event("fortune_booking_created"));
                              } catch {}
                            }}
                            className="w-28 bg-transparent border-b border-dashed border-slate-400 hover:border-slate-800 focus:border-emerald-600 focus:bg-emerald-50/40 px-1 py-0.5 text-xs sm:text-sm font-black text-emerald-800 outline-none transition"
                            title="Click to edit journey fare amount on ticket copy"
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Row 6: Total Fare Amount | Payment Status | GST & Taxes */}
                    <tr className="divide-x divide-slate-900 bg-emerald-50/50">
                      <td className="p-2.5 font-black text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Total Fare Amount:
                      </td>
                      <td className="p-2.5 font-black text-emerald-800 text-sm sm:text-base">
                        ₹{ticketFareAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Payment Status:
                      </td>
                      <td className="p-2.5 font-black text-emerald-700 uppercase">
                        {paymentStatusText}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        GST &amp; Taxes:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        Included (5% GST)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Multi-Passenger Manifest & Berth Allocation Table */}
              {activePassengersList.length > 0 && (
                <div className="border-x-2 border-b-2 border-slate-900 bg-white">
                  <div className="bg-[#0b1329] text-white px-3 py-1.5 flex items-center justify-between text-xs font-black uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      Passenger Manifest &amp; Berth Allocation ({activePassengersList.length} {activePassengersList.length === 1 ? "Passenger" : "Passengers"})
                    </span>
                    <span className="text-emerald-400 font-extrabold text-[10px] hidden sm:inline">
                      Official Passenger Travel Record
                    </span>
                  </div>
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead className="bg-slate-100 text-[10px] font-extrabold uppercase text-slate-800 border-b border-slate-900">
                      <tr className="divide-x divide-slate-900">
                        <th className="p-2 w-10 text-center">#</th>
                        <th className="p-2">Passenger Full Name</th>
                        <th className="p-2 w-20 text-center">Age</th>
                        <th className="p-2 w-24 text-center">Gender</th>
                        <th className="p-2 w-44 text-center">Seat / Berth Preference</th>
                        <th className="p-2 w-28 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {activePassengersList.map((p: any, idx: number) => (
                        <tr key={idx} className="divide-x divide-slate-900 hover:bg-slate-50">
                          <td className="p-2 text-center font-bold text-slate-600 bg-slate-50">{idx + 1}</td>
                          <td className="p-2 font-black text-slate-900 uppercase">
                            {p.name}
                            {idx === 0 && (
                              <span className="ml-1.5 text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                                Primary
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center font-bold text-slate-700">{p.age ? `${p.age} Yrs` : "—"}</td>
                          <td className="p-2 text-center font-bold text-slate-700">{p.gender || "—"}</td>
                          <td className="p-2 text-center font-mono font-bold text-slate-800">
                            {p.berth_preference || p.seat_berth || p.seat || "Confirmed"}
                          </td>
                          <td className="p-2 text-center">
                            <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                              CONFIRMED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Terms and conditions */}
              <div className="border border-slate-300 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                  Terms &amp; Instructions
                </div>
                <div>1. Please carry this ticket copy / SMS during your journey.</div>
                <div>2. Departure platform &amp; coach allocation details are subject to railway confirmation.</div>
                <div>3. 24/7 Helpline &amp; Support: +91 9740463404 | Fortune Tourism Bangalore.</div>
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                </button>

                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2.5 border border-slate-300 bg-white rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Book Another Journey
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-6 py-3 rounded-xl shadow-md transition-all text-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Ticket (PDF)
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-xs border border-white/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" /> Print Ticket Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PhonePe Full QR Code Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3.5 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-bold text-xs shadow-xs">पे</span>
                <div className="text-left">
                  <div className="font-extrabold text-slate-900 text-sm leading-tight">PhonePe Accepted Here</div>
                  <div className="text-[10px] text-purple-700 font-bold">Scan &amp; Pay Using PhonePe App</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border-2 border-purple-200 bg-slate-50 shadow-inner">
              <img
                src="/images/phonepe-qr.jpg"
                alt="PhonePe Payment QR Code - ZAMEER S"
                className="w-full h-auto max-h-[65vh] object-contain mx-auto"
              />
            </div>

            <div className="bg-purple-50 rounded-xl p-2.5 border border-purple-200/80 space-y-1">
              <div className="text-xs font-black text-purple-950 uppercase tracking-wide">
                Account: ZAMEER S
              </div>
              <div className="text-[11px] text-slate-600">
                Official Payment QR Code for Fortune Tourism &amp; Travels
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyUPI}
                className="flex-1 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer"
              >
                {upiCopied ? "✓ UPI Copied" : "Copy UPI ID"}
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
