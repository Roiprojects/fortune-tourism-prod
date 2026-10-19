import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  Download,
  MessageCircle,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  ShieldCheck,
  Star,
  Users,
  Maximize2,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  Wallet,
  Gauge,
  Car,
  Calculator,
  Sliders,
  ChevronDown,
} from "lucide-react";
import { LocationSearchInput } from "@/components/booking/LocationSearchInput";
import { generateTicketNumber, generatePNR } from "@/lib/booking-utils";
import { buildWhatsAppUrl } from "@/lib/contact";
import {
  useFleetTariffs,
  KM_OPTIONS_LIST,
  PER_KM_RATES_LIST,
  FIXED_TOTAL_FARES_LIST,
} from "@/lib/fleet-tariffs";

type CabTripType = "ONE WAY" | "ROUND TRIP" | "LOCAL" | "AIRPORT" | "HOURLY PACKAGE";

interface FleetOption {
  id: string;
  name: string;
  category: string;
  seats: number;
  rating: number;
  image: string;
  includedKms: number;
  postLimitRate: number;
  basePriceOneWay: number;
  basePriceRoundTrip: number;
  basePriceLocal4hr: number;
  basePriceLocal8hr: number;
  basePriceLocal12hr: number;
  basePriceAirport: number;
}

const FLEET_OPTIONS: FleetOption[] = [
  {
    id: "hatchback",
    name: "Hatchback",
    category: "Maruti Swift, Tata Altroz, Hyundai i20 · 4 Seater AC Cab",
    seats: 4,
    rating: 4.8,
    image: "/images/fleet/car-hatchback.jpg",
    includedKms: 145,
    postLimitRate: 12,
    basePriceOneWay: 1783,
    basePriceRoundTrip: 3566,
    basePriceLocal4hr: 1341,
    basePriceLocal8hr: 2200,
    basePriceLocal12hr: 2900,
    basePriceAirport: 1199,
  },
  {
    id: "sedan",
    name: "Sedan",
    category: "Maruti Dzire, Hyundai Aura, Honda Amaze · 4 Seater Sedan",
    seats: 4,
    rating: 4.8,
    image: "/images/fleet/car-sedan.jpg",
    includedKms: 145,
    postLimitRate: 14,
    basePriceOneWay: 1950,
    basePriceRoundTrip: 3900,
    basePriceLocal4hr: 1369,
    basePriceLocal8hr: 2400,
    basePriceLocal12hr: 3200,
    basePriceAirport: 1399,
  },
  {
    id: "premium-sedan",
    name: "Premium Sedan",
    category: "Honda City, Hyundai Verna, Skoda Slavia · Luxury 4 Seater",
    seats: 4,
    rating: 4.9,
    image: "/images/fleet/car-premium-sedan.jpg",
    includedKms: 145,
    postLimitRate: 16,
    basePriceOneWay: 2350,
    basePriceRoundTrip: 4700,
    basePriceLocal4hr: 1650,
    basePriceLocal8hr: 2900,
    basePriceLocal12hr: 3800,
    basePriceAirport: 1650,
  },
  {
    id: "suv",
    name: "MUV / SUV",
    category: "Maruti Ertiga, Toyota Rumion, Kia Carens · 6 Seater AC SUV",
    seats: 6,
    rating: 4.9,
    image: "/images/fleet/car-suv.jpg",
    includedKms: 145,
    postLimitRate: 17,
    basePriceOneWay: 2650,
    basePriceRoundTrip: 5300,
    basePriceLocal4hr: 1850,
    basePriceLocal8hr: 3200,
    basePriceLocal12hr: 4100,
    basePriceAirport: 1850,
  },
  {
    id: "innova",
    name: "Toyota Innova",
    category: "Toyota Innova 7 Seater · Dependable Highway Comfort",
    seats: 7,
    rating: 4.8,
    image: "/images/fleet/car-innova.jpg",
    includedKms: 145,
    postLimitRate: 19,
    basePriceOneWay: 3100,
    basePriceRoundTrip: 6200,
    basePriceLocal4hr: 2150,
    basePriceLocal8hr: 3700,
    basePriceLocal12hr: 4800,
    basePriceAirport: 2200,
  },
  {
    id: "crysta",
    name: "Toyota Innova Crysta",
    category: "7 Seater Luxury Premium AC Cab · VIP Captain Seats",
    seats: 7,
    rating: 4.9,
    image: "/images/fleet/car-crysta.jpg",
    includedKms: 145,
    postLimitRate: 21,
    basePriceOneWay: 3400,
    basePriceRoundTrip: 6800,
    basePriceLocal4hr: 2400,
    basePriceLocal8hr: 4100,
    basePriceLocal12hr: 5300,
    basePriceAirport: 2450,
  },
  {
    id: "tempo",
    name: "Tempo Traveller",
    category: "9 / 12 / 17 Seater Tempo Traveller · AC Group Travel",
    seats: 12,
    rating: 4.8,
    image: "/images/fleet/car-tempo.jpg",
    includedKms: 145,
    postLimitRate: 26,
    basePriceOneWay: 5200,
    basePriceRoundTrip: 10400,
    basePriceLocal4hr: 3600,
    basePriceLocal8hr: 6200,
    basePriceLocal12hr: 7900,
    basePriceAirport: 3800,
  },
  {
    id: "minibus",
    name: "Mini Bus",
    category: "17 / 20 / 25 / 30 Seater Mini Bus · Recliner Seats",
    seats: 27,
    rating: 4.8,
    image: "/images/fleet/car-tempo.jpg",
    includedKms: 145,
    postLimitRate: 35,
    basePriceOneWay: 8500,
    basePriceRoundTrip: 17000,
    basePriceLocal4hr: 5800,
    basePriceLocal8hr: 9800,
    basePriceLocal12hr: 12500,
    basePriceAirport: 6200,
  },
];

interface AdminCabBookingFlowProps {
  onBack: () => void;
  onBookingCompleted?: () => void;
}

export function AdminCabBookingFlow({ onBack, onBookingCompleted }: AdminCabBookingFlowProps) {
  const { fleetList: liveFleetOptions, roofLuggageRate } = useFleetTariffs();
  const fleetOptions = liveFleetOptions.length > 0 ? liveFleetOptions : FLEET_OPTIONS;

  // Steps: 1 = Journey & Schedule, 2 = Fleet Selection, 3 = Passenger Details, 4 = Payment Choice, 5 = Confirmation
  const [step, setStep] = useState<number>(1);

  // Cab Journey Inputs
  const [cabTripType, setCabTripType] = useState<CabTripType>("ONE WAY");
  const [cabFrom, setCabFrom] = useState("Bangalore");
  const [cabTo, setCabTo] = useState("Mysore");
  const [cabDate, setCabDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [cabReturnDate, setCabReturnDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [cabTime, setCabTime] = useState("07:00");
  const [localPackage, setLocalPackage] = useState<"4hr_40km" | "8hr_80km" | "12hr_120km">("4hr_40km");
  const [cabOneWayKm, setCabOneWayKm] = useState<number>(145);
  const [cabRoundTripKm, setCabRoundTripKm] = useState<number>(290);
  const [isCustomKm, setIsCustomKm] = useState<boolean>(false);
  const [airportTripType, setAirportTripType] = useState<"Drop to Airport" | "Pickup from Airport">("Drop to Airport");
  const [airportName, setAirportName] = useState("Terminal 1, Kempegowda International Airport (BLR)");

  // Selected Fleet
  const [selectedFleetId, setSelectedFleetId] = useState<string>("sedan");
  const [withLuggageCarrier, setWithLuggageCarrier] = useState<boolean>(false);

  // Fare Customization & Auto Calculation States: "STANDARD" | "CUSTOM_PER_KM" | "FIXED_TOTAL"
  const [fareCalculationMode, setFareCalculationMode] = useState<"STANDARD" | "CUSTOM_PER_KM" | "FIXED_TOTAL">("STANDARD");
  const [customRatePerKm, setCustomRatePerKm] = useState<number>(14);
  const [customFixedFare, setCustomFixedFare] = useState<number>(2000);

  // Passenger state
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [boardingAddress, setBoardingAddress] = useState("");

  // Payment state
  const [advanceOption, setAdvanceOption] = useState<number>(100);
  const [paymentChoice, setPaymentChoice] = useState<"token_100" | "full" | "zero">("token_100");
  const [fullPaymentType, setFullPaymentType] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [manualMethod, setManualMethod] = useState<"CASH" | "BANK_TRANSFER" | "POS_CARD" | "CHEQUE">("CASH");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [collectedBy, setCollectedBy] = useState("Admin Desk");
  const [utrRef, setUtrRef] = useState("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [manualFareAmount, setManualFareAmount] = useState<string>("");

  // Ticket Identifiers
  const [ticketNumber, setTicketNumber] = useState(() => generateTicketNumber());
  const [pnrNumber, setPnrNumber] = useState(() => generatePNR());
  const [upiCopied, setUpiCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Format departure date e.g. 07-10-2026.07.00
  const departureDateFormatted = useMemo(() => {
    const rawDate = cabDate || today;
    const [y, m, d] = rawDate.split("-");
    const rawTime = (cabTime || "07:00").replace(":", ".");
    return `${d}-${m}-${y}.${rawTime}`;
  }, [cabDate, cabTime, today]);

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

  // Selected Fleet details with cross-compatible ID matching
  const selectedFleet = useMemo(() => {
    return (
      fleetOptions.find(
        (f) =>
          f.id === selectedFleetId ||
          (selectedFleetId === "crysta" && f.id === "innova-crysta") ||
          (selectedFleetId === "innova-crysta" && f.id === "crysta") ||
          (selectedFleetId === "tempo" && f.id === "tempo-traveller") ||
          (selectedFleetId === "tempo-traveller" && f.id === "tempo") ||
          (selectedFleetId === "minibus" && f.id === "mini-bus") ||
          (selectedFleetId === "mini-bus" && f.id === "minibus")
      ) ||
      fleetOptions[1] ||
      fleetOptions[0]
    );
  }, [fleetOptions, selectedFleetId]);

  // Car selection handler to sync default rate
  const handleCarChange = (newCarId: string) => {
    setSelectedFleetId(newCarId);
    const found = fleetOptions.find(
      (f) =>
        f.id === newCarId ||
        (newCarId === "crysta" && f.id === "innova-crysta") ||
        (newCarId === "innova-crysta" && f.id === "crysta") ||
        (newCarId === "tempo" && f.id === "tempo-traveller") ||
        (newCarId === "tempo-traveller" && f.id === "tempo") ||
        (newCarId === "minibus" && f.id === "mini-bus") ||
        (newCarId === "mini-bus" && f.id === "minibus")
    );
    if (found && fareCalculationMode !== "CUSTOM_PER_KM") {
      setCustomRatePerKm(found.postLimitRate);
    }
  };

  // Active Journey Kilometers
  const activeJourneyKm = useMemo(() => {
    return cabTripType === "ROUND TRIP" ? cabRoundTripKm : cabOneWayKm;
  }, [cabTripType, cabRoundTripKm, cabOneWayKm]);

  // Dynamic Fare calculation based on Trip Type, Selected Kilometers & Customization Mode
  const calculatedFare = useMemo(() => {
    const activeKm = cabTripType === "ROUND TRIP" ? cabRoundTripKm : cabOneWayKm;

    // 1. FIXED TOTAL FARE MODE
    if (fareCalculationMode === "FIXED_TOTAL") {
      const fixedBase = Math.max(0, Number(customFixedFare) || 0);
      return Math.round(fixedBase + (withLuggageCarrier ? roofLuggageRate : 0));
    }

    // 2. CUSTOM RATE PER KM MODE (Auto-calculated: Km * Custom Rate)
    if (fareCalculationMode === "CUSTOM_PER_KM") {
      const rate = Math.max(0, Number(customRatePerKm) || 0);
      const distanceFare = activeKm * rate;
      return Math.round(distanceFare + (withLuggageCarrier ? roofLuggageRate : 0));
    }

    // 3. STANDARD VEHICLE TARIFF MODE
    let base = selectedFleet.basePriceOneWay;
    if (cabTripType === "ONE WAY") {
      if (cabOneWayKm <= 0) {
        base = 0;
      } else if (cabOneWayKm <= selectedFleet.includedKms) {
        base = selectedFleet.basePriceOneWay;
      } else {
        base = selectedFleet.basePriceOneWay + (cabOneWayKm - selectedFleet.includedKms) * selectedFleet.postLimitRate;
      }
    } else if (cabTripType === "ROUND TRIP") {
      if (cabRoundTripKm <= 0) {
        base = 0;
      } else {
        const baseRtKm = selectedFleet.includedKms * 2;
        if (cabRoundTripKm <= baseRtKm) {
          base = selectedFleet.basePriceRoundTrip;
        } else {
          base = selectedFleet.basePriceRoundTrip + (cabRoundTripKm - baseRtKm) * selectedFleet.postLimitRate;
        }
      }
    } else if (cabTripType === "AIRPORT") {
      base = selectedFleet.basePriceAirport;
    } else if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
      if (localPackage === "4hr_40km") base = selectedFleet.basePriceLocal4hr;
      else if (localPackage === "8hr_80km") base = selectedFleet.basePriceLocal8hr;
      else base = selectedFleet.basePriceLocal12hr;
    }
    return withLuggageCarrier ? Math.round(base + roofLuggageRate) : Math.round(base);
  }, [
    fareCalculationMode,
    customFixedFare,
    customRatePerKm,
    cabTripType,
    selectedFleet,
    cabOneWayKm,
    cabRoundTripKm,
    localPackage,
    withLuggageCarrier,
    roofLuggageRate,
  ]);

  // Formula explanation text for complete live fare display
  const fareFormulaExplanation = useMemo(() => {
    const activeKm = cabTripType === "ROUND TRIP" ? cabRoundTripKm : cabOneWayKm;
    if (fareCalculationMode === "FIXED_TOTAL") {
      return `Fixed Total Fare: ₹${Number(customFixedFare || 0).toLocaleString("en-IN")}${withLuggageCarrier ? ` + ₹${roofLuggageRate} (Luggage Carrier)` : ""}`;
    }
    if (fareCalculationMode === "CUSTOM_PER_KM") {
      return `${activeKm} km × ₹${customRatePerKm}/km = ₹${(activeKm * customRatePerKm).toLocaleString("en-IN")}${withLuggageCarrier ? ` + ₹${roofLuggageRate} (Luggage Carrier)` : ""}`;
    }
    if (cabTripType === "ONE WAY") {
      if (cabOneWayKm <= 0) return "0 Km selected · ₹0 Fare";
      if (cabOneWayKm <= selectedFleet.includedKms) {
        return `Base Fare (includes ${selectedFleet.includedKms} km) = ₹${selectedFleet.basePriceOneWay.toLocaleString("en-IN")}${withLuggageCarrier ? ` + ₹${roofLuggageRate}` : ""}`;
      }
      const extraKm = cabOneWayKm - selectedFleet.includedKms;
      return `Base ₹${selectedFleet.basePriceOneWay.toLocaleString("en-IN")} (${selectedFleet.includedKms} km) + ${extraKm} extra km @ ₹${selectedFleet.postLimitRate}/km (₹${(extraKm * selectedFleet.postLimitRate).toLocaleString("en-IN")})${withLuggageCarrier ? ` + ₹${roofLuggageRate}` : ""}`;
    }
    if (cabTripType === "ROUND TRIP") {
      if (cabRoundTripKm <= 0) return "0 Km selected · ₹0 Fare";
      const baseRtKm = selectedFleet.includedKms * 2;
      if (cabRoundTripKm <= baseRtKm) {
        return `Round Trip Base (${baseRtKm} km included) = ₹${selectedFleet.basePriceRoundTrip.toLocaleString("en-IN")}${withLuggageCarrier ? ` + ₹${roofLuggageRate}` : ""}`;
      }
      const extraKm = cabRoundTripKm - baseRtKm;
      return `Round Trip Base ₹${selectedFleet.basePriceRoundTrip.toLocaleString("en-IN")} (${baseRtKm} km) + ${extraKm} extra km @ ₹${selectedFleet.postLimitRate}/km (₹${(extraKm * selectedFleet.postLimitRate).toLocaleString("en-IN")})${withLuggageCarrier ? ` + ₹${roofLuggageRate}` : ""}`;
    }
    if (cabTripType === "AIRPORT") {
      return `Airport Transfer Flat Fare = ₹${selectedFleet.basePriceAirport.toLocaleString("en-IN")}`;
    }
    return `Local Hourly Package = ₹${calculatedFare.toLocaleString("en-IN")}`;
  }, [
    fareCalculationMode,
    customFixedFare,
    customRatePerKm,
    cabTripType,
    cabOneWayKm,
    cabRoundTripKm,
    selectedFleet,
    withLuggageCarrier,
    roofLuggageRate,
    calculatedFare,
  ]);

  // Effective Cab Fare prioritizing manual amount entered by user
  const effectiveCabFare = useMemo(() => {
    if (manualFareAmount && Number(manualFareAmount) > 0) {
      return Number(manualFareAmount);
    }
    return calculatedFare;
  }, [manualFareAmount, calculatedFare]);

  const paymentStatusText = useMemo(() => {
    if (paymentChoice === "full") {
      return fullPaymentType === "AUTOMATIC"
        ? "CONFIRMED / 100% PAID (ONLINE UPI)"
        : `CONFIRMED / 100% PAID (${manualMethod === "CASH" ? "CASH" : manualMethod === "BANK_TRANSFER" ? "BANK TRANSFER" : manualMethod === "POS_CARD" ? "CARD POS" : "CHEQUE"})`;
    }
    if (paymentChoice === "token_100") {
      return `₹100 ADVANCE PAID (BAL: ₹${Math.max(0, effectiveCabFare - 100).toLocaleString("en-IN")})`;
    }
    return `PAY ON BOARDING (DUE: ₹${effectiveCabFare.toLocaleString("en-IN")})`;
  }, [paymentChoice, fullPaymentType, manualMethod, effectiveCabFare]);

  const fromLocationDisplay = useMemo(() => {
    if (cabTripType === "AIRPORT") {
      return airportTripType === "Drop to Airport" ? cabFrom : airportName;
    }
    return cabFrom || "Bangalore";
  }, [cabTripType, airportTripType, cabFrom, airportName]);

  const toLocationDisplay = useMemo(() => {
    if (cabTripType === "ROUND TRIP") return `${cabTo} (Round Trip)`;
    if (cabTripType === "AIRPORT") {
      return airportTripType === "Drop to Airport" ? airportName : cabTo;
    }
    if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
      const pkgLabel =
        localPackage === "4hr_40km"
          ? "4 Hrs / 40 Kms"
          : localPackage === "8hr_80km"
          ? "8 Hrs / 80 Kms"
          : "12 Hrs / 120 Kms";
      return `Local City Use (${pkgLabel})`;
    }
    return cabTo || "Mysore";
  }, [cabTripType, airportTripType, cabTo, airportName, localPackage]);

  const vehicleDisplay = useMemo(() => {
    return selectedFleet.name.toUpperCase();
  }, [selectedFleet]);

  const tourTypeDisplay = useMemo(() => {
    return cabTripType;
  }, [cabTripType]);

  const swapLocations = () => {
    const temp = cabFrom;
    setCabFrom(cabTo);
    setCabTo(temp);
  };

  const handleGoToFleetSelection = () => {
    if (!cabFrom || !cabFrom.trim()) {
      toast.error("Please enter a pickup location.");
      return;
    }
    if (cabTripType === "ONE WAY" || cabTripType === "ROUND TRIP") {
      if (!cabTo || !cabTo.trim()) {
        toast.error("Please enter a drop location.");
        return;
      }
    }
    setStep(2);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const handleGoToPassengerDetails = () => {
    setStep(3);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const handleGoToPayment = () => {
    if (!passengerName || !passengerName.trim()) {
      toast.error("Please enter passenger full name.");
      return;
    }
    const cleanPhone = passengerPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!boardingPoint || !boardingPoint.trim()) {
      toast.error("Please enter boarding point.");
      return;
    }
    if (!boardingAddress || !boardingAddress.trim()) {
      toast.error("Please enter boarding address.");
      return;
    }
    setStep(4);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const handleConfirmAndGenerateTicket = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const isHourly = cabTripType === "HOURLY PACKAGE";
      const hourlyHoursStr = isHourly
        ? (localPackage === "4hr_40km" ? "4" : localPackage === "12hr_120km" ? "12" : "8")
        : null;
      const hourlyLabel = isHourly
        ? (localPackage === "4hr_40km" ? "4 Hr's" : localPackage === "12hr_120km" ? "12 Hr's" : "8 Hr's")
        : null;

      const effectiveAdvance = paymentChoice === "full" ? Number(effectiveCabFare || 0) : paymentChoice === "token_100" ? 100 : 0;
      const effectivePaymentStatus = paymentChoice === "full" ? "Fully Paid" : paymentChoice === "token_100" ? "Advance Paid" : "Pending";
      const effectiveMethod = paymentChoice === "full" ? (fullPaymentType === "AUTOMATIC" ? "UPI" : `MANUAL_${manualMethod}`) : paymentChoice === "token_100" ? "UPI" : "PAY_ON_ARRIVAL";

      const totalKm = cabTripType === "ROUND TRIP" ? cabRoundTripKm : (cabTripType === "ONE WAY" ? cabOneWayKm : (selectedFleet.includedKms || 145));

      const payload = {
        name: passengerName.trim(),
        phone: passengerPhone.trim(),
        email: "booking@fortunetourism.in",
        service: isHourly ? "Hourly Package" : "Cab Booking",
        booking_type: "CAB",
        booking_source: "ADMIN",
        category: "CAR",
        pickup: fromLocationDisplay,
        destination: toLocationDisplay,
        date: cabDate || today,
        return_date: cabTripType === "ROUND TRIP" ? cabReturnDate : null,
        time: cabTime || "07:00",
        passengers: String(selectedFleet.seats),
        trip_type: cabTripType,
        car_type: vehicleDisplay,
        vehicle_type: vehicleDisplay,
        hours_package: hourlyHoursStr,
        hours: hourlyLabel,
        distance_km: totalKm,
        boarding_point: boardingPoint,
        boarding_address: boardingAddress,
        ticket_number: ticketNumber,
        pnr_number: pnrNumber,
        total_amount: Number(effectiveCabFare || 0),
        fare: Number(effectiveCabFare || 0),
        advance_amount: effectiveAdvance,
        payment_choice: paymentChoice,
        payment_method: effectiveMethod,
        payment_status: effectivePaymentStatus,
        payment_ref: utrRef || manualReceiptNo || null,
        transaction_id: utrRef || manualReceiptNo || null,
        notes: [
          `Offline Admin Booking`,
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          `Fleet: ${vehicleDisplay}`,
          cabTripType === "ROUND TRIP" ? `Round Trip (${cabRoundTripKm} km)` : cabTripType === "ONE WAY" ? `One Way (${cabOneWayKm} km)` : null,
          `Calculation Mode: ${fareCalculationMode === "CUSTOM_PER_KM" ? `Custom ₹${customRatePerKm}/km` : fareCalculationMode === "FIXED_TOTAL" ? `Fixed Fare ₹${customFixedFare}` : "Standard Tariff"}`,
          withLuggageCarrier ? `Roof Luggage Carrier: Yes (+₹${roofLuggageRate})` : null,
          isHourly ? `Rental Package: ${hourlyLabel || "Hourly"} (${fromLocationDisplay})` : null,
          `Fare: ₹${effectiveCabFare}`,
          paymentChoice === "full"
            ? `Payment: 100% Full Payment of ₹${effectiveCabFare} (${fullPaymentType === "AUTOMATIC" ? "Online UPI" : `Manual - ${manualMethod}`})`
            : paymentChoice === "token_100"
            ? `Payment: ₹100 Advance Paid (Balance: ₹${Math.max(0, effectiveCabFare - 100)})`
            : `Payment: Zero Advance (Pay on Boarding)`,
          utrRef && `UTR/Ref: ${utrRef}`,
          manualReceiptNo && `Manual Ref: ${manualReceiptNo}`,
          paymentChoice === "full" && fullPaymentType === "MANUAL" && `Collected By: ${collectedBy || "Admin Desk"}`,
        ]
          .filter(Boolean)
          .join(" | "),
        client_token: `FT-ADMIN-BKG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

      // If hourly package, also persist directly to hourly packages storage for instant report view
      if (isHourly) {
        try {
          const STORAGE_KEY = "fortune_hourly_packages_trips_data";
          const saved = localStorage.getItem(STORAGE_KEY);
          let currentList: any[] = saved ? JSON.parse(saved) : [];
          const now = new Date();
          const curMonthGroup = `1/${now.getMonth() + 1}/${now.getFullYear()}`;
          const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
          const newEntry = {
            id: `HPT-${Date.now()}`,
            monthGroup: curMonthGroup,
            slNo: currentList.length + 1,
            date: dateStr,
            paxName: passengerName.trim().toUpperCase(),
            phNumber: passengerPhone.trim(),
            from: fromLocationDisplay,
            to: toLocationDisplay,
            hours: hourlyLabel || "8 Hr's",
            car: vehicleDisplay,
            driver: "ZAMEER",
            drPhNo: "9740463404",
            taxiNo: "KA 51 AC 6052",
            toll: "INCLUDED",
            boarding: boardingPoint,
            amount: effectiveCabFare,
            paymentStatus: effectivePaymentStatus === "Fully Paid" ? "Paid" : effectivePaymentStatus === "Advance Paid" ? "Advance Paid" : "Pending",
            paymentMethod: effectiveMethod,
            pnr: pnrNumber,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...currentList]));
        } catch (e) {
          console.warn("Could not save to fortune_hourly_packages_trips_data:", e);
        }
      }

      setStep(5);
      toast.success("Booking confirmed! Official ticket copy generated.");
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

  const copyUPI = () => {
    navigator.clipboard.writeText("fortunetourism@okaxis");
    setUpiCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setUpiCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    downloadTicketCopyPDF({
      ticketNumber,
      pnrNumber,
      bookingDate: bookingDateTime,
      passengerName: passengerName || "GUEST",
      passengerPhone: passengerPhone || "9964600247",
      tourType: tourTypeDisplay,
      fromLocation: fromLocationDisplay,
      toLocation: toLocationDisplay,
      departureOn: departureDateFormatted,
      tripType: cabTripType,
      vehicleOrMode: vehicleDisplay,
      boardingPoint: boardingPoint || "—",
      boardingAddress: boardingAddress || "—",
      serviceType: "CAB",
      fareAmount: effectiveCabFare,
      paymentStatus: paymentStatusText,
    });
    toast.success("Ticket PDF downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetForAnother = () => {
    setStep(1);
    setTicketNumber(generateTicketNumber());
    setPnrNumber(generatePNR());
    setPassengerName("");
    setPassengerPhone("");
    setBoardingPoint("");
    setBoardingAddress("");
    setUtrRef("");
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
        {/* ================= STEP 1: CAB BOOKING ROUTE & JOURNEY ================= */}
        {step === 1 && (
          <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
            {/* Top Header with Back to Services */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full px-3.5 py-1 shadow-sm">
                  🚕 CAB BOOKING
                </span>
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">
                  Select Journey &amp; Schedule
                </span>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Services
              </button>
            </div>

            {/* Trip Type Tabs */}
            <div className="flex justify-center">
              <div className="inline-flex flex-wrap justify-center rounded-2xl border border-white/15 overflow-hidden text-xs sm:text-sm font-bold bg-[#111c3a]/90 p-1.5 gap-1 shadow-inner backdrop-blur-md">
                {(["ONE WAY", "ROUND TRIP", "LOCAL", "AIRPORT", "HOURLY PACKAGE"] as CabTripType[]).map((tab) => {
                  const isActive = cabTripType === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCabTripType(tab)}
                      className={`px-3.5 sm:px-5 py-2.5 transition-all rounded-xl uppercase tracking-wider font-extrabold cursor-pointer ${
                        isActive
                          ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30 scale-[1.02]"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PACKAGE SELECTOR (Only For HOURLY PACKAGE) */}
            {cabTripType === "HOURLY PACKAGE" && (
              <div className="flex flex-col items-center justify-center gap-1.5 pt-2 pb-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#00c58e]" /> SELECT RENTAL PACKAGE
                </div>
                <div className="inline-flex rounded-xl border border-white/15 overflow-hidden text-xs sm:text-sm font-bold bg-[#111c3a]/90 p-1 gap-1 shadow-inner">
                  {[
                    { id: "4hr_40km", label: "4 hrs | 40 km" },
                    { id: "8hr_80km", label: "8 hrs | 80 km" },
                    { id: "12hr_120km", label: "12 hrs | 120 km" },
                  ].map((pkg) => {
                    const isSelected = localPackage === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setLocalPackage(pkg.id as any)}
                        className={`px-3 sm:px-5 py-2 transition-all uppercase tracking-wider rounded-lg cursor-pointer ${
                          isSelected
                            ? "bg-[#00c58e] text-white font-extrabold shadow-md shadow-[#00c58e]/30"
                            : "text-slate-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {pkg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= CAR DROPDOWN & KILOMETERS (FROM 0 KM) & FARE CUSTOMIZATION ================= */}
            <div className="bg-[#111c3a]/90 border border-white/15 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              {/* 1. CAR / FLEET SELECTION DROPDOWN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#00c58e]" />
                    <span>SELECT CAR / VEHICLE TYPE</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    Active: <strong className="text-emerald-400">{selectedFleet.name}</strong> ({selectedFleet.seats} Seater · ₹{selectedFleet.postLimitRate}/km)
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedFleet.id}
                    onChange={(e) => handleCarChange(e.target.value)}
                    className="w-full bg-[#0b1329] hover:bg-[#0e1935] focus:bg-[#0e1935] border border-white/20 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 text-white text-xs sm:text-sm font-black rounded-xl px-3.5 py-3 outline-none transition-all cursor-pointer shadow-inner [color-scheme:dark]"
                  >
                    {fleetOptions.map((fleet) => (
                      <option key={fleet.id} value={fleet.id} className="bg-[#0b1329] text-white py-2">
                        🚗 {fleet.name} ({fleet.seats} Seater) — Base ₹{fleet.basePriceOneWay.toLocaleString()} · Extra ₹{fleet.postLimitRate}/km — {fleet.category.split("·")[0].trim()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. KILOMETER SELECTOR (DROPDOWN + DIRECT INPUT STARTING FROM 0 KM) */}
              {(cabTripType === "ONE WAY" || cabTripType === "ROUND TRIP") && (
                <div className="border-t border-white/10 pt-3 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-[#00c58e]" />
                      <span>
                        {cabTripType === "ROUND TRIP" ? "ROUND TRIP KILOMETERS (2-WAY RETURN)" : "JOURNEY KILOMETERS"} (STARTS FROM 0 KM)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Selected: <strong className="text-emerald-300">{activeJourneyKm} Km</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    {/* Km Dropdown */}
                    <div className="sm:col-span-7 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Select Km from Dropdown (Starts from 0 Km)
                      </label>
                      <select
                        value={KM_OPTIONS_LIST.some((opt) => opt.value === activeJourneyKm) ? activeJourneyKm : "custom"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setIsCustomKm(true);
                          } else {
                            const kmNum = Number(val);
                            if (cabTripType === "ROUND TRIP") {
                              setCabRoundTripKm(kmNum);
                            } else {
                              setCabOneWayKm(kmNum);
                            }
                            setIsCustomKm(false);
                          }
                        }}
                        className="w-full bg-[#0b1329] border border-white/20 focus:border-[#00c58e] text-white text-xs sm:text-sm font-black rounded-xl px-3 py-2.5 outline-none transition-all cursor-pointer [color-scheme:dark]"
                      >
                        {KM_OPTIONS_LIST.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#0b1329] text-white">
                            {opt.label}
                          </option>
                        ))}
                        <option value="custom" className="bg-[#0b1329] text-white">
                          ✍ Custom Km (Type Below)
                        </option>
                      </select>
                    </div>

                    {/* Direct Enter Kms Input (Starts from 0) */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Enter Custom Km (Min 0)
                      </label>
                      <div className="flex items-center gap-1.5 bg-[#0b1329] border border-white/20 focus-within:border-[#00c58e] rounded-xl px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          max={10000}
                          step={1}
                          value={activeJourneyKm}
                          onFocus={() => setIsCustomKm(true)}
                          onChange={(e) => {
                            setIsCustomKm(true);
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            if (cabTripType === "ROUND TRIP") {
                              setCabRoundTripKm(val);
                            } else {
                              setCabOneWayKm(val);
                            }
                          }}
                          className="w-full bg-transparent text-white font-black text-xs sm:text-sm outline-none"
                          placeholder="0"
                        />
                        <span className="text-xs font-black text-emerald-400">Km</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Buttons (Includes 0 Km) */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Quick Km:
                    </span>
                    {(cabTripType === "ROUND TRIP" ? [0, 100, 200, 290, 300, 400, 500, 600, 800] : [0, 50, 100, 145, 150, 200, 250, 300, 400]).map((kmVal) => {
                      const isSel = activeJourneyKm === kmVal && !isCustomKm;
                      return (
                        <button
                          key={kmVal}
                          type="button"
                          onClick={() => {
                            if (cabTripType === "ROUND TRIP") {
                              setCabRoundTripKm(kmVal);
                            } else {
                              setCabOneWayKm(kmVal);
                            }
                            setIsCustomKm(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            isSel
                              ? "bg-[#00c58e] text-white shadow-md shadow-[#00c58e]/30 scale-105"
                              : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                          }`}
                        >
                          {kmVal} Km {kmVal === 145 || kmVal === 290 ? "★" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. FARE CUSTOMIZATION & AUTO-CALCULATION SECTION */}
              <div className="border-t border-white/10 pt-3 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-[#00c58e]" />
                    <span>CUSTOMIZE FARE &amp; AUTO CALCULATE</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Select Mode:
                  </span>
                </div>

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFareCalculationMode("STANDARD")}
                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      fareCalculationMode === "STANDARD"
                        ? "bg-[#00c58e] text-white border-[#00c58e] shadow-lg shadow-[#00c58e]/30"
                        : "bg-[#0b1329] text-slate-300 border-white/10 hover:border-white/20"
                    }`}
                  >
                    1. Standard Vehicle Tariff
                  </button>

                  <button
                    type="button"
                    onClick={() => setFareCalculationMode("CUSTOM_PER_KM")}
                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      fareCalculationMode === "CUSTOM_PER_KM"
                        ? "bg-[#00c58e] text-white border-[#00c58e] shadow-lg shadow-[#00c58e]/30"
                        : "bg-[#0b1329] text-slate-300 border-white/10 hover:border-white/20"
                    }`}
                  >
                    2. Custom Rate/Km (Auto-Calc)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFareCalculationMode("FIXED_TOTAL")}
                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      fareCalculationMode === "FIXED_TOTAL"
                        ? "bg-[#00c58e] text-white border-[#00c58e] shadow-lg shadow-[#00c58e]/30"
                        : "bg-[#0b1329] text-slate-300 border-white/10 hover:border-white/20"
                    }`}
                  >
                    3. Fixed Total Fare
                  </button>
                </div>

                {/* Sub-controls based on Mode */}
                {fareCalculationMode === "CUSTOM_PER_KM" && (
                  <div className="p-3 bg-[#0b1329] border border-emerald-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-emerald-400 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" /> Rate Per Km Dropdown &amp; Edit
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Formula: {activeJourneyKm} Km × ₹{customRatePerKm}/km = <strong className="text-white">₹{(activeJourneyKm * customRatePerKm).toLocaleString("en-IN")}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-8">
                        <select
                          value={PER_KM_RATES_LIST.some((r) => r.value === customRatePerKm) ? customRatePerKm : "custom"}
                          onChange={(e) => {
                            if (e.target.value !== "custom") {
                              setCustomRatePerKm(Number(e.target.value));
                            }
                          }}
                          className="w-full bg-[#111c3a] border border-white/20 focus:border-[#00c58e] text-white text-xs sm:text-sm font-black rounded-lg px-3 py-2 outline-none cursor-pointer [color-scheme:dark]"
                        >
                          {PER_KM_RATES_LIST.map((rate) => (
                            <option key={rate.value} value={rate.value} className="bg-[#0b1329] text-white">
                              {rate.label}
                            </option>
                          ))}
                          <option value="custom" className="bg-[#0b1329] text-white">
                            ✍ Custom Rate (Type Here)
                          </option>
                        </select>
                      </div>

                      <div className="sm:col-span-4 flex items-center gap-1.5 bg-[#111c3a] border border-white/20 focus-within:border-[#00c58e] rounded-lg px-2.5 py-1.5">
                        <span className="text-[11px] font-bold text-slate-400">Rate:</span>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          step={0.5}
                          value={customRatePerKm}
                          onChange={(e) => setCustomRatePerKm(Math.max(1, parseFloat(e.target.value) || 0))}
                          className="w-full bg-transparent text-white font-black text-xs sm:text-sm outline-none text-right"
                        />
                        <span className="text-xs font-bold text-emerald-400">₹/km</span>
                      </div>
                    </div>
                  </div>
                )}

                {fareCalculationMode === "FIXED_TOTAL" && (
                  <div className="p-3 bg-[#0b1329] border border-emerald-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-emerald-400 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" /> Fixed Total Fare Presets &amp; Direct Edit
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Flat Total Fare: <strong className="text-white">₹{customFixedFare.toLocaleString("en-IN")}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-8">
                        <select
                          value={FIXED_TOTAL_FARES_LIST.some((f) => f.value === customFixedFare) ? customFixedFare : "custom"}
                          onChange={(e) => {
                            if (e.target.value !== "custom") {
                              setCustomFixedFare(Number(e.target.value));
                            }
                          }}
                          className="w-full bg-[#111c3a] border border-white/20 focus:border-[#00c58e] text-white text-xs sm:text-sm font-black rounded-lg px-3 py-2 outline-none cursor-pointer [color-scheme:dark]"
                        >
                          {FIXED_TOTAL_FARES_LIST.map((fare) => (
                            <option key={fare.value} value={fare.value} className="bg-[#0b1329] text-white">
                              {fare.label}
                            </option>
                          ))}
                          <option value="custom" className="bg-[#0b1329] text-white">
                            ✍ Custom Flat Fare (Type Here)
                          </option>
                        </select>
                      </div>

                      <div className="sm:col-span-4 flex items-center gap-1.5 bg-[#111c3a] border border-white/20 focus-within:border-[#00c58e] rounded-lg px-2.5 py-1.5">
                        <span className="text-[11px] font-bold text-slate-400">Total:</span>
                        <input
                          type="number"
                          min={0}
                          max={500000}
                          step={50}
                          value={customFixedFare}
                          onChange={(e) => setCustomFixedFare(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-transparent text-white font-black text-xs sm:text-sm outline-none text-right"
                        />
                        <span className="text-xs font-bold text-emerald-400">₹</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Luggage Carrier Toggle */}
                <div className="flex items-center justify-between p-2.5 bg-[#0b1329]/80 rounded-xl border border-white/10 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={withLuggageCarrier}
                      onChange={(e) => setWithLuggageCarrier(e.target.checked)}
                      className="rounded accent-[#00c58e] text-[#00c58e] focus:ring-[#00c58e]"
                    />
                    <span>🚙 Add Roof Luggage Carrier (+₹{roofLuggageRate})</span>
                  </label>
                  <span className="text-emerald-400 font-extrabold text-[11px]">
                    {withLuggageCarrier ? `+₹${roofLuggageRate} Added` : "Optional"}
                  </span>
                </div>
              </div>
            </div>

            {/* INPUT FIELDS ROW */}
            <div className="pt-2">
              {/* ONE WAY */}
              {cabTripType === "ONE WAY" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider">
                        ONE WAY TRIP
                      </span>
                      <span className="text-xs text-slate-300 font-bold">
                        POINT TO POINT JOURNEY
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
                      <span className="bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-emerald-300 font-bold flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-[#00c58e]" /> Distance: {cabOneWayKm} km
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* FROM + SWAP + TO */}
                    <div className="md:col-span-6 flex items-end gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          FROM
                        </label>
                        <LocationSearchInput
                          value={cabFrom}
                          onChange={setCabFrom}
                          placeholder="Enter Pickup Location"
                          dark={true}
                        />
                      </div>

                      <div className="flex-shrink-0 pb-1">
                        <button
                          type="button"
                          onClick={swapLocations}
                          className="w-9 h-9 rounded-full bg-[#111c3a] border border-white/20 hover:border-[#00c58e] hover:bg-[#16254c] flex items-center justify-center text-slate-300 transition-all shadow-md hover:scale-105 cursor-pointer"
                          title="Swap Locations"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-[#00c58e]" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          TO
                        </label>
                        <LocationSearchInput
                          value={cabTo}
                          onChange={setCabTo}
                          placeholder="Enter Drop Location"
                          dark={true}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                        PICK UP DATE
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={cabDate}
                        onChange={(e) => setCabDate(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                        PICK UP TIME
                      </label>
                      <input
                        type="time"
                        value={cabTime}
                        onChange={(e) => setCabTime(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ROUND TRIP */}
              {cabTripType === "ROUND TRIP" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider">
                        ROUND TRIP
                      </span>
                      <span className="text-xs text-slate-300 font-bold">
                        ORIGIN ⇄ DESTINATION (RETURN)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-2.5 flex-wrap">
                      <span className="bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-emerald-300 font-bold flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-[#00c58e]" /> {cabRoundTripKm} km 2-Way Total
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5 flex items-end gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          FROM
                        </label>
                        <LocationSearchInput
                          value={cabFrom}
                          onChange={setCabFrom}
                          placeholder="Enter Pickup Location"
                          dark={true}
                        />
                      </div>

                      <div className="flex-shrink-0 pb-1">
                        <button
                          type="button"
                          onClick={swapLocations}
                          className="w-9 h-9 rounded-full bg-[#111c3a] border border-white/20 hover:border-[#00c58e] hover:bg-[#16254c] flex items-center justify-center text-slate-300 transition-all shadow-md hover:scale-105 cursor-pointer"
                          title="Swap Locations"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-[#00c58e]" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          TO
                        </label>
                        <LocationSearchInput
                          value={cabTo}
                          onChange={setCabTo}
                          placeholder="Enter Drop Location"
                          dark={true}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                        PICK UP DATE
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={cabDate}
                        onChange={(e) => setCabDate(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                        RETURN DATE
                      </label>
                      <input
                        type="date"
                        min={cabDate || today}
                        value={cabReturnDate}
                        onChange={(e) => setCabReturnDate(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                        TIME
                      </label>
                      <input
                        type="time"
                        value={cabTime}
                        onChange={(e) => setCabTime(e.target.value)}
                        className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* LOCAL / HOURLY */}
              {(cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      PICKUP LOCATION / AREA
                    </label>
                    <LocationSearchInput
                      value={cabFrom}
                      onChange={setCabFrom}
                      placeholder="Enter Pickup Location"
                      dark={true}
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      PICK UP DATE
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={cabDate}
                      onChange={(e) => setCabDate(e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      PICK UP TIME
                    </label>
                    <input
                      type="time"
                      value={cabTime}
                      onChange={(e) => setCabTime(e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                    />
                  </div>
                </div>
              )}

              {/* AIRPORT */}
              {cabTripType === "AIRPORT" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      TRIP
                    </label>
                    <select
                      value={airportTripType}
                      onChange={(e) => setAirportTripType(e.target.value as any)}
                      className="w-full bg-[#111c3a]/90 border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all [color-scheme:dark]"
                    >
                      <option value="Drop to Airport" className="bg-[#0B132B] text-white">
                        Drop to Airport
                      </option>
                      <option value="Pickup from Airport" className="bg-[#0B132B] text-white">
                        Pickup from Airport
                      </option>
                    </select>
                  </div>

                  {airportTripType === "Drop to Airport" ? (
                    <>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          PICKUP LOCATION
                        </label>
                        <LocationSearchInput
                          value={cabFrom}
                          onChange={setCabFrom}
                          placeholder="Enter Pickup Location"
                          dark={true}
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          DROP AIRPORT
                        </label>
                        <LocationSearchInput
                          value={airportName}
                          onChange={setAirportName}
                          placeholder="Enter Airport / Terminal"
                          dark={true}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          PICKUP AIRPORT
                        </label>
                        <LocationSearchInput
                          value={airportName}
                          onChange={setAirportName}
                          placeholder="Enter Airport / Terminal"
                          dark={true}
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          DROP LOCATION
                        </label>
                        <LocationSearchInput
                          value={cabTo}
                          onChange={setCabTo}
                          placeholder="Enter Drop Location"
                          dark={true}
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      PICK UP DATE
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={cabDate}
                      onChange={(e) => setCabDate(e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      PICK UP TIME
                    </label>
                    <input
                      type="time"
                      value={cabTime}
                      onChange={(e) => setCabTime(e.target.value)}
                      className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ================= COMPLETE LIVE FARE DISPLAY CARD ================= */}
            <div className="bg-gradient-to-r from-[#0d1f3d] via-[#102a43] to-[#0c1e36] border-2 border-[#00c58e]/60 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#00c58e]/20 border border-[#00c58e]/40 flex items-center justify-center text-emerald-300 text-sm font-black">
                    ✓
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300">
                      LIVE FARE BREAKDOWN &amp; CALCULATION
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedFleet.name} ({selectedFleet.seats} Seater) · {cabTripType} · {activeJourneyKm} Km
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {fareCalculationMode === "STANDARD"
                    ? "Standard Tariff"
                    : fareCalculationMode === "CUSTOM_PER_KM"
                    ? `Custom ₹${customRatePerKm}/km`
                    : "Fixed Flat Fare"}
                </span>
              </div>

              {/* Fare Formula & Big Amount */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-7 space-y-2">
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                      Calculation Formula:
                    </span>
                    <strong className="text-emerald-300 font-mono text-xs sm:text-sm">
                      {fareFormulaExplanation}
                    </strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      🛡️ Toll &amp; State Taxes Included
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      ⛽ Fuel &amp; Driver Allowance Included
                    </span>
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-col items-center md:items-end justify-center p-3.5 bg-[#070d1e]/80 border border-emerald-500/30 rounded-2xl">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    COMPLETE TOTAL FARE
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#00c58e] tracking-tight drop-shadow-sm">
                    ₹{effectiveCabFare.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-slate-300 font-bold mt-1 flex items-center gap-2">
                    <span className="text-emerald-400">Token Advance: ₹100</span>
                    <span>|</span>
                    <span className="text-amber-300">Due: ₹{Math.max(0, effectiveCabFare - 100).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* DUAL ACTION BUTTONS: PROCEED DIRECTLY TO PASSENGERS OR BROWSE FLEET CARDS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleGoToFleetSelection}
                  className="w-full sm:w-auto text-xs font-bold text-slate-300 hover:text-white px-5 py-3 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Car className="w-4 h-4 text-emerald-400" />
                  View All Fleet Cards (Step 2)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Direct fast-track validation
                    if (!cabFrom || !cabFrom.trim()) {
                      toast.error("Please enter a pickup location.");
                      return;
                    }
                    if (cabTripType !== "LOCAL" && cabTripType !== "HOURLY PACKAGE" && (!cabTo || !cabTo.trim()) && cabTripType !== "AIRPORT") {
                      toast.error("Please enter a drop location.");
                      return;
                    }
                    setStep(3);
                    window.scrollTo({ top: 80, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-8 py-3.5 rounded-2xl uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  CONTINUE TO PASSENGER DETAILS <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SELECT VEHICLE FLEET ================= */}
        {step === 2 && (
          <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-extrabold text-white text-lg sm:text-xl">
                  Select Vehicle Fleet
                </h2>
                <p className="text-xs text-slate-400">
                  {fromLocationDisplay} → {toLocationDisplay} · {departureDateFormatted}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Modify Route
              </button>
            </div>

            {/* Fleet Selection List */}
            <div className="space-y-4">
              {fleetOptions.map((fleet) => {
                const isSelected = selectedFleetId === fleet.id || (selectedFleetId === "crysta" && fleet.id === "innova-crysta") || (selectedFleetId === "innova-crysta" && fleet.id === "crysta");
                let price = fleet.basePriceOneWay;
                if (fareCalculationMode === "FIXED_TOTAL") {
                  price = isSelected ? customFixedFare : fleet.basePriceOneWay;
                } else if (fareCalculationMode === "CUSTOM_PER_KM") {
                  const r = isSelected ? customRatePerKm : fleet.postLimitRate;
                  price = activeJourneyKm * r;
                } else {
                  if (cabTripType === "ONE WAY") {
                    if (cabOneWayKm <= 0) {
                      price = 0;
                    } else if (cabOneWayKm <= fleet.includedKms) {
                      price = fleet.basePriceOneWay;
                    } else {
                      price = fleet.basePriceOneWay + (cabOneWayKm - fleet.includedKms) * fleet.postLimitRate;
                    }
                  } else if (cabTripType === "ROUND TRIP") {
                    if (cabRoundTripKm <= 0) {
                      price = 0;
                    } else {
                      const baseRtKm = fleet.includedKms * 2;
                      if (cabRoundTripKm <= baseRtKm) {
                        price = fleet.basePriceRoundTrip;
                      } else {
                        price = fleet.basePriceRoundTrip + (cabRoundTripKm - baseRtKm) * fleet.postLimitRate;
                      }
                    }
                  } else if (cabTripType === "AIRPORT") {
                    price = fleet.basePriceAirport;
                  } else if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
                    if (localPackage === "4hr_40km") price = fleet.basePriceLocal4hr;
                    else if (localPackage === "8hr_80km") price = fleet.basePriceLocal8hr;
                    else price = fleet.basePriceLocal12hr;
                  }
                }
                if (withLuggageCarrier && isSelected) {
                  price += roofLuggageRate;
                }
                price = Math.round(price);

                return (
                  <div
                    key={fleet.id}
                    onClick={() => handleCarChange(fleet.id)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#00c58e] bg-[#162544]/95 ring-2 ring-[#00c58e]/30 shadow-xl shadow-black/40"
                        : "border-white/10 hover:border-white/25 bg-[#111c3a]/80 hover:bg-[#111c3a]"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3 flex justify-center">
                        <div className="bg-white/95 p-2 rounded-xl border border-white/15 shadow-inner flex items-center justify-center">
                          <img
                            src={fleet.image}
                            alt={fleet.name}
                            className="w-36 h-24 object-contain rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-5 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-white text-base">
                            {fleet.name}
                          </h3>
                          <span className="bg-[#0B132B] text-amber-300 border border-amber-400/30 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                            {fleet.rating} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">{fleet.category}</p>

                        <div className="flex flex-wrap items-center gap-3 text-xs pt-1 font-medium">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> {fleet.seats} Seater
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#00c58e]" /> Driver Allowance Included
                          </span>
                        </div>

                        {cabTripType === "ONE WAY" && (
                          <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px]">
                            <span className="bg-[#00c58e]/20 text-[#00c58e] border border-[#00c58e]/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                              🛣️ {cabOneWayKm} Km Journey
                            </span>
                            <span className="text-slate-300 font-medium">
                              {cabOneWayKm <= fleet.includedKms
                                ? `${fleet.includedKms} km standard base included`
                                : `Base ₹${fleet.basePriceOneWay.toLocaleString()} (${fleet.includedKms} km) + ${cabOneWayKm - fleet.includedKms} extra km @ ₹${fleet.postLimitRate}/km`}
                            </span>
                          </div>
                        )}

                        {cabTripType === "ROUND TRIP" && (
                          <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px]">
                            <span className="bg-[#00c58e]/20 text-[#00c58e] border border-[#00c58e]/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                              🔄 2-Way Return ({cabRoundTripKm} km total)
                            </span>
                            <span className="text-slate-300 font-medium">
                              {cabRoundTripKm <= fleet.includedKms * 2
                                ? `Onward: ₹${fleet.basePriceOneWay.toLocaleString()} + Return: ₹${(price - fleet.basePriceOneWay).toLocaleString()} · Ret: ${cabReturnDate}`
                                : `2-Way Base ₹${fleet.basePriceRoundTrip.toLocaleString()} (${fleet.includedKms * 2} km) + ${cabRoundTripKm - fleet.includedKms * 2} extra km @ ₹${fleet.postLimitRate}/km · Ret: ${cabReturnDate}`}
                            </span>
                          </div>
                        )}
                        {(cabTripType === "HOURLY PACKAGE" || cabTripType === "LOCAL") && (
                          <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px]">
                            <span className="bg-[#00c58e]/20 text-[#00c58e] border border-[#00c58e]/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                              ⏰ {localPackage === "4hr_40km" ? "4 Hrs / 40 Kms Full Package Fare" : localPackage === "8hr_80km" ? "8 Hrs / 80 Kms Full Package Fare" : "12 Hrs / 120 Kms Full Package Fare"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-4 flex flex-col items-end justify-center space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4 text-right">
                        <div className="text-2xl font-black text-[#00c58e]">
                          ₹{price.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          All-Inclusive Transparent Fare
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCarChange(fleet.id);
                            handleGoToPassengerDetails();
                          }}
                          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#00c58e] text-white hover:bg-[#00a87a] shadow-lg shadow-[#00c58e]/30 scale-[1.02]"
                              : "bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15"
                          }`}
                        >
                          {isSelected ? "Selected ✓" : "Select"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Luggage Carrier Add-on */}
            <div className="p-3 bg-[#111c3a]/90 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                <input
                  type="checkbox"
                  checked={withLuggageCarrier}
                  onChange={(e) => setWithLuggageCarrier(e.target.checked)}
                  className="rounded accent-[#00c58e] text-[#00c58e] focus:ring-[#00c58e]"
                />
                <span>🚙 Add Roof Luggage Carrier @ ₹{roofLuggageRate}</span>
              </label>
              <span className="text-[#00c58e] font-extrabold">+₹{roofLuggageRate} Extra</span>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Route
              </button>

              <button
                type="button"
                onClick={handleGoToPassengerDetails}
                className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-8 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                Continue to Passenger Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PASSENGER DETAILS ================= */}
        {step === 3 && (
          <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-extrabold text-white text-lg sm:text-xl font-heading">
                  Passenger Details
                </h2>
                <p className="text-xs text-slate-400">
                  Enter passenger details for your trip
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Fleet
              </button>
            </div>

            {/* Booking Summary Box */}
            <div className="bg-[#111c3a]/90 border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  SELECTED VEHICLE &amp; ROUTE
                </span>
                <div className="font-black text-white text-base sm:text-lg">
                  {vehicleDisplay}
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {fromLocationDisplay} → {toLocationDisplay} · {departureDateFormatted} · {cabTripType}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 block">TOTAL FARE</span>
                <div className="text-2xl font-black text-[#00c58e]">
                  ₹{calculatedFare.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Passenger Contact Inputs */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                PASSENGER CONTACT
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    PASSENGER FULL NAME *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter passenger full name"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    MOBILE NUMBER *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9964600247 / 9740463404"
                    maxLength={15}
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    e.g. 9964600247, 9740463404
                  </p>
                </div>
              </div>
            </div>

            {/* Boarding Details (For Driver) */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                BOARDING DETAILS (FOR DRIVER)
              </span>
              <p className="text-[11px] text-slate-400 -mt-2">
                Enter the exact pick-up location so the driver can locate you easily.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    BOARDING POINT *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KR Market, MG Road Metro"
                    value={boardingPoint}
                    onChange={(e) => setBoardingPoint(e.target.value)}
                    className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    BOARDING ADDRESS *
                  </label>
                  <input
                    type="text"
                    placeholder="Full address / landmark for pick-up"
                    value={boardingAddress}
                    onChange={(e) => setBoardingAddress(e.target.value)}
                    className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Fleet
              </button>

              <button
                type="button"
                onClick={handleGoToPayment}
                className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                NEXT PAGE <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: PAYMENT CHOICE ================= */}
        {step === 4 && (
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
                onClick={() => setStep(3)}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Passenger Details
              </button>
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
                  value={manualFareAmount || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setManualFareAmount(val);
                    if (paymentChoice === "full") {
                      setAdvanceOption(Number(val) || calculatedFare);
                    }
                  }}
                  placeholder={String(effectiveCabFare)}
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
                  onClick={() => {
                    setPaymentChoice("token_100");
                    setAdvanceOption(100);
                  }}
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
                    Instant vehicle lock with priority driver dispatch.
                  </p>
                </button>

                {/* 2. Full Payment Method (Manual & Automatically) */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentChoice("full");
                    setAdvanceOption(effectiveCabFare);
                  }}
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
                    100% full amount (₹{effectiveCabFare.toLocaleString("en-IN")}) by manual cash/bank or automatically via UPI.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentChoice("full");
                        setAdvanceOption(effectiveCabFare);
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
                        setAdvanceOption(effectiveCabFare);
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
                  onClick={() => {
                    setPaymentChoice("zero");
                    setAdvanceOption(0);
                  }}
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
                    Pay full amount directly upon boarding.
                  </p>
                </button>
              </div>

              {/* OPTION 1: UPI QR if ₹100 Advance */}
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
                          Collect ₹100 Token Advance to confirm and generate offline ticket copy (Balance ₹{(Math.max(0, effectiveCabFare - 100)).toLocaleString("en-IN")} on boarding)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      Token Advance QR (₹100)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* PhonePe QR Card */}
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

              {/* OPTION 2: FULL PAYMENT METHOD (AUTOMATIC & MANUAL) */}
              {paymentChoice === "full" && (
                <div className="bg-[#111c3a]/95 border-2 border-amber-400/50 rounded-2xl p-5 space-y-5 shadow-2xl shadow-amber-950/20">
                  {/* Sub-Navbar / Mode Selector Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base flex items-center gap-1.5">
                          <CreditCard className="w-5 h-5 text-amber-400" /> Full Payment Method:
                        </span>
                        <span className="text-xs font-mono font-black text-amber-300 bg-amber-400/15 px-3 py-1 rounded-lg border border-amber-400/30">
                          100% Fare: ₹{effectiveCabFare.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Choose between <strong>Automatically</strong> (instant online UPI QR) or <strong>Manually</strong> (Cash / Bank / Card).
                      </p>
                    </div>

                    {/* Mode Toggle Navbar Buttons */}
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
                              Collect full fare of ₹{effectiveCabFare.toLocaleString("en-IN")} via QR scan to mark booking 100% settled
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          Full Amount ₹{effectiveCabFare.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* PhonePe QR Card */}
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
                              Fast Pay Full Amount (₹{effectiveCabFare.toLocaleString("en-IN")}) With UPI App
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { name: "PhonePe", link: `phonepe://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${effectiveCabFare}&cu=INR`, color: "bg-[#5f259f] text-white hover:bg-purple-800 border-purple-400/30" },
                                { name: "Google Pay", link: `tez://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${effectiveCabFare}&cu=INR`, color: "bg-blue-600 text-white hover:bg-blue-700 border-blue-400/30" },
                                { name: "Paytm", link: `paytmmp://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${effectiveCabFare}&cu=INR`, color: "bg-sky-600 text-white hover:bg-sky-700 border-sky-400/30" },
                                { name: "Any UPI App", link: `upi://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${effectiveCabFare}&cu=INR&tn=Full%20Payment%20Fortune%20Tourism`, color: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-400/30" },
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
                              Collect ₹{effectiveCabFare.toLocaleString("en-IN")} via Cash, Bank Transfer, POS Card or Cheque
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-full">
                          Manual Payment Mode
                        </span>
                      </div>

                      {/* Manual Payment Amount Field */}
                      <div className="bg-[#111c3a] border-2 border-amber-400/60 rounded-xl p-3.5 space-y-1.5 shadow-inner">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Banknote className="w-4 h-4 text-amber-400" /> Manual Payment / Total Fare Amount (₹) *
                          </label>
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                            Prints on Ticket &amp; Reports
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white font-black text-base">₹</span>
                          <input
                            type="number"
                            min={1}
                            value={manualFareAmount || effectiveCabFare}
                            onChange={(e) => {
                              const val = e.target.value;
                              setManualFareAmount(val);
                              setAdvanceOption(Number(val) || 0);
                            }}
                            placeholder={String(effectiveCabFare)}
                            className="w-full bg-[#0B132B] border border-amber-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/40 rounded-xl pl-8 pr-4 py-2.5 text-base font-black text-amber-300 placeholder:text-slate-500 outline-none"
                          />
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Enter the manual amount collected for this booking. This exact amount will be displayed on the generated ticket, confirmation voucher, and all accounting reports.
                        </p>
                      </div>

                      {/* Manual Payment Method Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Payment Method / Collection Channel *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "CASH", label: "💵 Cash in Hand", desc: "Received at Office/Desk" },
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
                            Collected By / Staff Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Admin Desk / Accounts"
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
                            Full Amount of ₹{effectiveCabFare.toLocaleString("en-IN")} marked as 100% Collected &amp; Confirmed
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
                        Passenger will pay the full journey fare of <strong>₹{effectiveCabFare.toLocaleString("en-IN")}</strong> directly to the driver upon boarding.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-xl shrink-0">
                    Due: ₹{effectiveCabFare.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Passenger Details
              </button>

              <button
                type="button"
                onClick={handleConfirmAndGenerateTicket}
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
                    CONFIRM BOOKING &amp; GENERATE TICKET <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: TICKET CONFIRMATION & VOUCHER ================= */}
        {step === 5 && (
          <div className="space-y-6">
            {/* Top Confirmation Banner */}
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
                </div>

                <a
                  href={buildWhatsAppUrl(
                    `Hello Fortune Tourism! New offline cab reservation booked.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Passenger:* ${passengerName || "GUEST"}\n*Phone:* ${passengerPhone || "9964600247"}\n*From:* ${fromLocationDisplay}\n*To:* ${toLocationDisplay}\n*Date:* ${departureDateFormatted}\n*Vehicle:* ${vehicleDisplay}\n*Fare:* ₹${effectiveCabFare}`
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
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      TICKET NUMBER :
                      <strong className="font-mono font-black text-amber-700 text-sm sm:text-base tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                        {ticketNumber}
                      </strong>
                    </span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      TOTAL FARE :
                      <strong className="font-mono font-black text-emerald-800 text-sm sm:text-base tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-400 shadow-2xs">
                        ₹{Number(effectiveCabFare || 0).toLocaleString("en-IN")}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact 4-Row Spreadsheet Structure */}
              <div className="overflow-x-auto border-2 border-slate-900">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <tbody>
                    {/* Row 1 */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-36 whitespace-nowrap">
                        Passenger Name:
                      </td>
                      <td className="p-2.5 font-black text-slate-900 uppercase">
                        {passengerName || "GUEST"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-40 whitespace-nowrap">
                        Passenger Phone No.:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {passengerPhone || "9964600247"}
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
                        {boardingPoint || "—"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Boarding Address:
                      </td>
                      <td colSpan={2} className="p-2.5 font-bold text-slate-900">
                        {boardingAddress || "—"}
                      </td>
                    </tr>

                    {/* Row 5: Trip Type | Type Of Cab | Fare Amount */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Trip Type:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        {cabTripType === "ROUND TRIP"
                          ? `ROUND TRIP (2-WAY · ${cabRoundTripKm} KM)`
                          : cabTripType === "ONE WAY"
                          ? `ONE WAY (${cabOneWayKm} KM)`
                          : cabTripType === "HOURLY PACKAGE"
                          ? `HOURLY PACKAGE (${localPackage === "4hr_40km" ? "4 HRS / 40 KM" : localPackage === "8hr_80km" ? "8 HRS / 80 KM" : "12 HRS / 120 KM"})`
                          : cabTripType}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Type Of Cab:
                      </td>
                      <td className="p-2.5 font-black text-slate-900 uppercase">
                        {vehicleDisplay}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        {cabTripType === "ROUND TRIP" ? "Onward + Return Fare:" : "Fare Amount:"}
                      </td>
                      <td className="p-2.5 font-black uppercase">
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-700 font-black">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={manualFareAmount || effectiveCabFare}
                            onChange={(e) => {
                              const val = e.target.value;
                              setManualFareAmount(val);
                              if (paymentChoice === "full") {
                                setAdvanceOption(Number(val) || 0);
                              }
                            }}
                            className="w-28 bg-transparent border-b border-dashed border-slate-400 hover:border-slate-800 focus:border-emerald-600 focus:bg-emerald-50/40 px-1 py-0.5 text-xs sm:text-sm font-black text-emerald-800 outline-none transition"
                            title="Click to edit journey fare amount on ticket copy"
                          />
                        </div>
                        {cabTripType === "ROUND TRIP" && (
                          <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                            Onward: ₹{Math.round((Number(manualFareAmount || effectiveCabFare)) / 2).toLocaleString("en-IN")} + Return: ₹{Math.round((Number(manualFareAmount || effectiveCabFare)) / 2).toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Row 6: Total Fare Amount | Payment Status */}
                    <tr className="divide-x divide-slate-900 bg-emerald-50/50">
                      <td className="p-2.5 font-black text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Total Fare Amount:
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-emerald-800 text-sm sm:text-base">
                        ₹{Number(effectiveCabFare || 0).toLocaleString("en-IN")}
                        {cabTripType === "ROUND TRIP" && (
                          <span className="text-[10px] font-bold text-emerald-700 ml-2">
                            (Includes Full 2-Way Return Circuit · {cabRoundTripKm} Km)
                          </span>
                        )}
                        {cabTripType === "ONE WAY" && (
                          <span className="text-[10px] font-bold text-emerald-700 ml-2">
                            ({cabOneWayKm} Km Journey)
                          </span>
                        )}
                        {(cabTripType === "HOURLY PACKAGE" || cabTripType === "LOCAL") && (
                          <span className="text-[10px] font-bold text-emerald-700 ml-2">
                            ({localPackage === "4hr_40km" ? "4 Hrs / 40 Kms Full Fare" : localPackage === "8hr_80km" ? "8 Hrs / 80 Kms Full Fare" : "12 Hrs / 120 Kms Full Fare"})
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Payment Status:
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-emerald-700 uppercase">
                        {paymentStatusText}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Official PhonePe QR & Verification Bar + Terms & Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch pt-2">
                <div className="md:col-span-8 border border-slate-300 rounded-xl p-3.5 text-[11px] text-slate-700 space-y-1.5 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Terms &amp; Journey Instructions
                    </div>
                    <div className="space-y-0.5 text-slate-600 text-[10.5px]">
                      <div>1. Please carry this official Ticket Copy / SMS during your journey.</div>
                      <div>2. Driver &amp; vehicle assignment details will be shared prior to departure.</div>
                      <div>3. Balance fare (if any) can be settled directly with the driver via PhonePe / Cash upon boarding.</div>
                      <div>4. 24/7 Helpline &amp; Support: <strong>+91 9740463404</strong> | Fortune Tourism Bangalore.</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 border-t border-slate-200 pt-1.5">
                    Fortune Tourism · Narayana Hospital Health City, Bommasandra, Bangalore - 560099
                  </div>
                </div>

                {/* Payment & Verification QR Code Badge */}
                <div className="md:col-span-4 border-2 border-purple-200 bg-purple-50/60 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                  <div className="text-[10px] font-black uppercase text-purple-950 tracking-wider flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[8px] font-bold">पे</span>
                    PhonePe Accepted Here
                  </div>
                  <div
                    className="w-24 sm:w-28 my-1.5 bg-white p-1 rounded-lg border border-purple-200 shadow-xs cursor-pointer group"
                    onClick={() => setShowQrModal(true)}
                    title="Tap to enlarge QR"
                  >
                    <img
                      src="/images/phonepe-qr.jpg"
                      alt="Official PhonePe QR Code - ZAMEER S"
                      className="w-full h-auto object-contain rounded transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-900">
                    Merchant: ZAMEER S
                  </div>
                  <div className="text-[9px] text-purple-700 font-bold">
                    Scan to Pay / Verify Ticket
                  </div>
                </div>
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
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/20 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  Book Another Cab
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
