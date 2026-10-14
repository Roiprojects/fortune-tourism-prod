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
} from "lucide-react";
import { LocationSearchInput } from "@/components/booking/LocationSearchInput";
import { generateTicketNumber, generatePNR } from "@/lib/booking-utils";
import { buildWhatsAppUrl } from "@/lib/contact";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";
import { useFleetTariffs } from "@/lib/fleet-tariffs";

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
    basePriceRoundTrip: 3222,
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
    basePriceRoundTrip: 3296,
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
    basePriceRoundTrip: 3950,
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
    basePriceRoundTrip: 4450,
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
    basePriceRoundTrip: 5100,
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
    basePriceRoundTrip: 5600,
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
    basePriceRoundTrip: 8500,
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
    basePriceRoundTrip: 14000,
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
  const [airportTripType, setAirportTripType] = useState<"Drop to Airport" | "Pickup from Airport">("Drop to Airport");
  const [airportName, setAirportName] = useState("Terminal 1, Kempegowda International Airport (BLR)");

  // Selected Fleet
  const [selectedFleetId, setSelectedFleetId] = useState<string>("sedan");
  const [withLuggageCarrier, setWithLuggageCarrier] = useState<boolean>(false);

  // Passenger state
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [boardingAddress, setBoardingAddress] = useState("");

  // Payment state
  const [advanceOption, setAdvanceOption] = useState<number>(100);
  const [utrRef, setUtrRef] = useState("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

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

  // Selected Fleet details
  const selectedFleet = useMemo(() => {
    return fleetOptions.find((f) => f.id === selectedFleetId) || fleetOptions[1] || fleetOptions[0];
  }, [fleetOptions, selectedFleetId]);

  // Dynamic Fare calculation
  const calculatedFare = useMemo(() => {
    let base = selectedFleet.basePriceOneWay;
    if (cabTripType === "ROUND TRIP") {
      base = selectedFleet.basePriceRoundTrip;
    } else if (cabTripType === "AIRPORT") {
      base = selectedFleet.basePriceAirport;
    } else if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
      if (localPackage === "4hr_40km") base = selectedFleet.basePriceLocal4hr;
      else if (localPackage === "8hr_80km") base = selectedFleet.basePriceLocal8hr;
      else base = selectedFleet.basePriceLocal12hr;
    }
    return withLuggageCarrier ? base + roofLuggageRate : base;
  }, [cabTripType, selectedFleet, localPackage, withLuggageCarrier, roofLuggageRate]);

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
    setIsSubmitting(true);
    try {
      const payload = {
        name: passengerName.trim(),
        phone: passengerPhone.trim(),
        email: "booking@fortunetourism.in",
        service: "Cab Booking",
        category: "CAR",
        pickup: fromLocationDisplay,
        destination: toLocationDisplay,
        date: cabDate || today,
        time: cabTime || "07:00",
        passengers: String(selectedFleet.seats),
        trip_type: cabTripType,
        car_type: vehicleDisplay,
        boarding_point: boardingPoint,
        boarding_address: boardingAddress,
        notes: [
          `Offline Admin Booking`,
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          `Fleet: ${vehicleDisplay}`,
          `Fare: ₹${calculatedFare}`,
          `Payment: ${advanceOption === 100 ? "₹100 Advance Paid" : "Zero Advance"}`,
          utrRef && `UTR: ${utrRef}`,
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
      passengerPhone: passengerPhone || "9845003000",
      tourType: tourTypeDisplay,
      fromLocation: fromLocationDisplay,
      toLocation: toLocationDisplay,
      departureOn: departureDateFormatted,
      tripType: cabTripType,
      vehicleOrMode: vehicleDisplay,
      boardingPoint: boardingPoint || "—",
      boardingAddress: boardingAddress || "—",
      serviceType: "CAB",
      fareAmount: calculatedFare,
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

            {/* INPUT FIELDS ROW */}
            <div className="pt-2">
              {/* ONE WAY */}
              {cabTripType === "ONE WAY" && (
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
              )}

              {/* ROUND TRIP */}
              {cabTripType === "ROUND TRIP" && (
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

            {/* NEXT PAGE BUTTON */}
            <div className="flex justify-center pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleGoToFleetSelection}
                className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                NEXT PAGE <ArrowRight className="w-4 h-4" />
              </button>
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
                const isSelected = selectedFleetId === fleet.id;
                let price = fleet.basePriceOneWay;
                if (cabTripType === "ROUND TRIP") price = fleet.basePriceRoundTrip;
                if (cabTripType === "AIRPORT") price = fleet.basePriceAirport;
                if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
                  if (localPackage === "4hr_40km") price = fleet.basePriceLocal4hr;
                  else if (localPackage === "8hr_80km") price = fleet.basePriceLocal8hr;
                  else price = fleet.basePriceLocal12hr;
                }

                return (
                  <div
                    key={fleet.id}
                    onClick={() => setSelectedFleetId(fleet.id)}
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
                            setSelectedFleetId(fleet.id);
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
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none transition-all"
                  />
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

            {/* Payment Options */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                PAYMENT CHOICE
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAdvanceOption(100)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    advanceOption === 100
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

                <button
                  type="button"
                  onClick={() => setAdvanceOption(0)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    advanceOption === 0
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

              {/* UPI QR if ₹100 Advance */}
              {advanceOption === 100 && (
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
                          Collect ₹100 Token Advance to confirm and generate offline ticket copy
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      Official Payment QR
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
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fast Pay With UPI App</div>
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
                    `Hello Fortune Tourism! New offline cab reservation booked.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Passenger:* ${passengerName || "GUEST"}\n*Phone:* ${passengerPhone || "9845003000"}\n*From:* ${fromLocationDisplay}\n*To:* ${toLocationDisplay}\n*Date:* ${departureDateFormatted}\n*Vehicle:* ${vehicleDisplay}\n*Fare:* ₹${calculatedFare}`
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
                        ₹{Number(calculatedFare || 0).toLocaleString("en-IN")}
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
                        {passengerPhone || "9845003000"}
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

                    {/* Row 5: Trip Type | Type Of Cab | Boarding point */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Trip Type:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        {cabTripType}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Type Of Cab:
                      </td>
                      <td className="p-2.5 font-black text-slate-900 uppercase">
                        {vehicleDisplay}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Fare Amount:
                      </td>
                      <td className="p-2.5 font-black text-emerald-700 uppercase">
                        ₹{Number(calculatedFare || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>

                    {/* Row 6: Total Fare Amount | Payment Status | Taxes */}
                    <tr className="divide-x divide-slate-900 bg-emerald-50/50">
                      <td className="p-2.5 font-black text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Total Fare Amount:
                      </td>
                      <td className="p-2.5 font-black text-emerald-800 text-sm sm:text-base">
                        ₹{Number(calculatedFare || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Payment Status:
                      </td>
                      <td className="p-2.5 font-black text-emerald-700 uppercase">
                        CONFIRMED / PAID
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
