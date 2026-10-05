import { useState, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
  CreditCard,
  CheckCircle2,
  Car,
  Clock,
  Calendar,
  MapPin,
  ArrowLeftRight,
  User,
  Phone,
  ShieldCheck,
  Star,
  Users,
  TrainFront,
  Plane,
  Bus,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { generateTicketNumber, generatePNR } from "@/lib/booking-utils";
import { buildWhatsAppUrl } from "@/lib/contact";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";
import { MultiServiceTypeCards, ServiceType } from "@/components/booking/MultiServiceTypeCards";
import { LocationSearchInput } from "@/components/booking/LocationSearchInput";
import { TrainBookingForm } from "@/components/booking/TrainBookingForm";
import { BusBookingForm } from "@/components/booking/BusBookingForm";
import { FlightBookingForm } from "@/components/booking/FlightBookingForm";
import { TourBookingForm } from "@/components/booking/TourBookingForm";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book Cabs & Tour Packages — Fortune Tourism" },
      {
        name: "description",
        content:
          "Book cabs, outstation, local hourly, and airport transfers with vehicle selection, transparent fare, and instant ticket copy download.",
      },
    ],
  }),
  component: BookingPage,
});

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
    basePriceLocal12hr: 4700,
    basePriceAirport: 2150,
  },
  {
    id: "innova-crysta",
    name: "Toyota Innova Crysta",
    category: "7 Seater Luxury Premium AC Cab · VIP Captain Seats",
    seats: 7,
    rating: 4.9,
    image: "/images/fleet/car-crysta.jpg",
    includedKms: 145,
    postLimitRate: 21,
    basePriceOneWay: 3400,
    basePriceRoundTrip: 5650,
    basePriceLocal4hr: 2400,
    basePriceLocal8hr: 4100,
    basePriceLocal12hr: 5200,
    basePriceAirport: 2400,
  },
  {
    id: "tempo-traveller",
    name: "Tempo Traveller",
    category: "9 / 12 / 17 Seater Tempo Traveller · AC Group Travel",
    seats: 12,
    rating: 4.8,
    image: "/images/fleet/car-tempo.jpg",
    includedKms: 145,
    postLimitRate: 28,
    basePriceOneWay: 5200,
    basePriceRoundTrip: 8900,
    basePriceLocal4hr: 3800,
    basePriceLocal8hr: 6500,
    basePriceLocal12hr: 8200,
    basePriceAirport: 3800,
  },
  {
    id: "mini-bus",
    name: "Mini Bus",
    category: "17 / 20 / 25 / 30 Seater Mini Bus · Recliner Seats",
    seats: 27,
    rating: 4.8,
    image: "/images/fleet/car-minibus.jpg",
    includedKms: 145,
    postLimitRate: 45,
    basePriceOneWay: 8500,
    basePriceRoundTrip: 14500,
    basePriceLocal4hr: 6200,
    basePriceLocal8hr: 10500,
    basePriceLocal12hr: 13500,
    basePriceAirport: 6200,
  },
];

function BookingPage() {
  // Step 0: Choose Service (5 cards)
  // Step 1: Cab Journey Route & Dropdown (One Way / Round Trip / Local / Airport)
  // Step 2: Fleet Selection Page (Hatchback, Sedan, SUV, Innova, Tempo)
  // Step 3: Passenger Details (Name & Phone Number only) -> [ NEXT PAGE ]
  // Step 4: Payment Choice Page (₹100 or Zero advance) -> [ CONFIRM BOOKING ]
  // Step 5: Official Ticket Confirmation PDF Voucher
  const [step, setStep] = useState(0);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);

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

  // Passenger state (Cleaned: no predefined values)
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [boardingAddress, setBoardingAddress] = useState("");

  // Payment state
  const [advanceOption, setAdvanceOption] = useState<number>(100);
  const [utrRef, setUtrRef] = useState("");

  const [ticketNumber, setTicketNumber] = useState(() => generateTicketNumber());
  const [pnrNumber, setPnrNumber] = useState(() => generatePNR());
  const [upiCopied, setUpiCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State for non-cab services
  const [otherFormData, setOtherFormData] = useState<any>({
    date: "",
    time: "07:00",
    from_station: "",
    to_station: "",
    travel_class: "3A",
    from_location: "",
    destination: "",
    bus_type: "AC Sleeper",
    flight_trip_type: "One Way",
    cabin_class: "Economy",
    from_airport: "",
    to_airport: "",
    package_slug: "",
    package_title: "",
    boarding_point: "",
    boarding_address: "",
  });

  const onOtherChange = useCallback((field: string, value: any) => {
    setOtherFormData((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const boardingPointDisplay = serviceType === "CAB" ? boardingPoint : (otherFormData.boarding_point || "");
  const boardingAddressDisplay = serviceType === "CAB" ? boardingAddress : (otherFormData.boarding_address || "");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Booking date and time formatted as DD-MM-YYYY HH:MM (24h)
  const bookingDateTime = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }, []);

  // Format departure date
  const departureDateFormatted = useMemo(() => {
    const rawDate = cabDate || today;
    const [y, m, d] = rawDate.split("-");
    const rawTime = (cabTime || "07:00").replace(":", ".");
    return `${d}-${m}-${y}.${rawTime}`;
  }, [cabDate, cabTime, today]);

  // Selected Fleet details
  const selectedFleet = useMemo(() => {
    return FLEET_OPTIONS.find((f) => f.id === selectedFleetId) || FLEET_OPTIONS[1];
  }, [selectedFleetId]);

  // Dynamic Price calculation based on Trip Type & Package
  const calculatedFare = useMemo(() => {
    let base = selectedFleet.basePriceOneWay;
    if (cabTripType === "ROUND TRIP") base = selectedFleet.basePriceRoundTrip;
    if (cabTripType === "AIRPORT") base = selectedFleet.basePriceAirport;
    if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
      if (localPackage === "4hr_40km") base = selectedFleet.basePriceLocal4hr;
      else if (localPackage === "8hr_80km") base = selectedFleet.basePriceLocal8hr;
      else base = selectedFleet.basePriceLocal12hr;
    }
    return base + (withLuggageCarrier ? 149 : 0);
  }, [selectedFleet, cabTripType, localPackage, withLuggageCarrier]);

  // From and To locations
  const fromLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return (otherFormData.from_station || "BANGALORE CITY (SBC)").toUpperCase();
    if (serviceType === "BUS") return (otherFormData.from_location || "BANGALORE").toUpperCase();
    if (serviceType === "FLIGHT") return (otherFormData.from_airport || "BANGALORE (BLR)").toUpperCase();
    if (serviceType === "TOUR") return "BANGALORE";
    if (cabTripType === "AIRPORT" && airportTripType === "Pickup from Airport") {
      return airportName.split(",")[0].toUpperCase();
    }
    return (cabFrom || "BANGALORE").toUpperCase();
  }, [serviceType, otherFormData, cabTripType, airportTripType, airportName, cabFrom]);

  const toLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return (otherFormData.to_station || "CHENNAI CENTRAL (MAS)").toUpperCase();
    if (serviceType === "BUS") return (otherFormData.destination || "MYSORE").toUpperCase();
    if (serviceType === "FLIGHT") return (otherFormData.to_airport || "DELHI (DEL)").toUpperCase();
    if (serviceType === "TOUR") return (otherFormData.package_title || "SOUTH INDIA TOUR").toUpperCase();
    if (cabTripType === "AIRPORT" && airportTripType === "Drop to Airport") {
      return airportName.split(",")[0].toUpperCase();
    }
    if (cabTo && cabTo.trim()) {
      return cabTo.trim().toUpperCase();
    }
    if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
      return (cabFrom || "BANGALORE LOCAL").toUpperCase();
    }
    return (cabTo || "MYSORE").toUpperCase();
  }, [serviceType, otherFormData, cabTripType, airportTripType, airportName, cabTo, cabFrom]);

  const primaryPassengerName = useMemo(() => {
    if (serviceType === "TRAIN" && otherFormData.passengers?.[0]?.name) {
      const count = otherFormData.passengers.length;
      return count > 1
        ? `${otherFormData.passengers[0].name.toUpperCase()} (+${count - 1} OTHERS)`
        : otherFormData.passengers[0].name.toUpperCase();
    }
    return (passengerName || "GUEST").toUpperCase();
  }, [serviceType, otherFormData, passengerName]);

  const tourTypeDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return `TRAIN (${otherFormData.travel_class || "3A"})`;
    if (serviceType === "BUS") return `BUS (${otherFormData.bus_type || "AC SLEEPER"})`;
    if (serviceType === "FLIGHT") return `FLIGHT (${otherFormData.cabin_class || "ECONOMY"})`;
    if (serviceType === "TOUR") return "TOUR PACKAGE";
    if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
      if (localPackage === "8hr_80km") return "HOURLY (8 HRS / 80 KM)";
      if (localPackage === "12hr_120km") return "HOURLY (12 HRS / 120 KM)";
      return "HOURLY (4 HRS / 40 KM)";
    }
    return cabTripType;
  }, [serviceType, otherFormData, cabTripType, localPackage]);

  // Vehicle display without fuel text
  const vehicleDisplay = useMemo(() => {
    if (serviceType === "TRAIN") {
      return `TRAIN: ${otherFormData.preferred_train || otherFormData.train_number || "IRCTC EXPRESS"} (${otherFormData.travel_class || "3A"})`;
    }
    if (serviceType === "BUS") {
      return `BUS: ${otherFormData.bus_type || "AC SLEEPER / VOLVO"}`;
    }
    if (serviceType === "FLIGHT") {
      return `FLIGHT: ${otherFormData.cabin_class || "ECONOMY"} (${otherFormData.flight_trip_type || "ONE WAY"})`;
    }
    if (serviceType === "TOUR") {
      return `TOUR: ${otherFormData.package_title || "SOUTH INDIA HOLIDAY"}`;
    }
    return `${selectedFleet.name.toUpperCase()}${withLuggageCarrier ? " + CARRIER" : ""}`;
  }, [serviceType, otherFormData, selectedFleet, withLuggageCarrier]);

  const swapLocations = () => {
    const temp = cabFrom;
    setCabFrom(cabTo);
    setCabTo(temp);
  };

  // Direct confirmation for Ticket Booking (No payment step)
  const handleCompleteTicketBooking = async () => {
    setIsSubmitting(true);
    try {
      const isTrain = serviceType === "TRAIN";
      const isBus = serviceType === "BUS";
      const isFlight = serviceType === "FLIGHT";

      const firstPassenger = otherFormData.passengers?.[0]?.name || passengerName || "GUEST";
      const pCount = otherFormData.passengers?.length || 1;

      const payload = {
        name: firstPassenger,
        phone: passengerPhone || "9845003000",
        service: isTrain ? "Train" : isBus ? "Bus" : isFlight ? "Flight" : "Tour",
        booking_type: serviceType,
        pickup: isTrain ? otherFormData.from_station : isBus ? otherFormData.from_location : otherFormData.from_airport || "BANGALORE",
        destination: isTrain ? otherFormData.to_station : isBus ? otherFormData.destination : otherFormData.to_airport || "CHENNAI",
        date: otherFormData.date || today,
        time: otherFormData.time || "07:00",
        passengers: String(pCount),
        boarding_point: otherFormData.boarding_point || "",
        boarding_address: otherFormData.boarding_address || "",
        notes: [
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          isTrain && `Train: ${otherFormData.preferred_train || "Any"} | No: ${otherFormData.train_number || "N/A"} | Class: ${otherFormData.travel_class} | Quota: ${otherFormData.quota}`,
          isBus && `Bus Type: ${otherFormData.bus_type}`,
          isFlight && `Flight: ${otherFormData.cabin_class} | Trip: ${otherFormData.flight_trip_type}`,
          otherFormData.passengers && `Passengers: ${otherFormData.passengers.map((p: any, i: number) => `P${i + 1}: ${p.name} (${p.age}y/${p.gender}/${p.berth_preference || "None"})`).join(", ")}`,
        ].filter(Boolean).join(" | "),
        client_token: `FT-TKT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };

      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setStep(5);
      window.scrollTo({ top: 80, behavior: "smooth" });
      toast.success("Booking submitted! Official Ticket Copy generated.");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while confirming booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 0 -> Step 1
  const handleSelectServiceCard = (type: ServiceType) => {
    setServiceType(type);
    setStep(1);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  // Step 1 -> Step 2 (Route validation to Fleet Selection)
  const handleGoToFleetSelection = () => {
    const e: Record<string, string> = {};
    if (cabTripType !== "LOCAL" && cabTripType !== "HOURLY PACKAGE") {
      if (!cabFrom.trim()) e.from = "Pickup location is required.";
      if (!cabTo.trim()) e.to = "Drop location is required.";
    }
    if (!cabDate) e.date = "Travel date is required.";

    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep(2);
      window.scrollTo({ top: 80, behavior: "smooth" });
    } else {
      toast.error("Please fill required journey details.");
    }
  };

  // Step 2 -> Step 3 (Fleet Selection to Passenger Details)
  const handleGoToPassengerDetails = () => {
    setStep(3);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  // Step 3 -> Step 4 (Passenger Details validation to Payment Choice)
  const handleGoToPayment = () => {
    if (!passengerName.trim()) {
      toast.error("Please enter passenger full name.");
      return;
    }
    if (!passengerPhone.trim() || !/^[6-9]\d{9}$/.test(passengerPhone.replace(/\s+/g, ""))) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!boardingPoint.trim()) {
      toast.error("Please enter the boarding point.");
      return;
    }
    if (!boardingAddress.trim()) {
      toast.error("Please enter the boarding address.");
      return;
    }
    setStep(4);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  // Step 4 -> Step 5 (Confirm & Generate Ticket)
  const handleConfirmAndGenerateTicket = async () => {
    setIsSubmitting(true);

    try {
      const payload: Record<string, any> = {
        name: passengerName || "GUEST",
        phone: passengerPhone.replace(/\s+/g, ""),
        email: null,
        service: "Taxi",
        booking_type: "CAB",
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
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          `Fleet: ${vehicleDisplay}`,
          `Fare: ₹${calculatedFare}`,
          `Payment: ${advanceOption === 100 ? "₹100 Advance Paid" : "Zero Advance"}`,
          utrRef && `UTR: ${utrRef}`,
        ]
          .filter(Boolean)
          .join(" | "),
        client_token: `FT-BKG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
      toast.success("Booking confirmed! Your official ticket copy is generated below.");
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
      boardingPoint: boardingPointDisplay,
      boardingAddress: boardingAddressDisplay,
      serviceType: serviceType || undefined,
    });
    toast.success("Ticket PDF downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <SiteLayout>
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

      <div className="min-h-screen relative py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/images/booking-btn-bg.jpg')" }}
        />
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">

          {/* STEP 0: Initial Page — What would you like to book? (5 Cards ONLY) */}
          {step === 0 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <MultiServiceTypeCards
                selectedService={serviceType}
                onSelect={handleSelectServiceCard}
              />
            </div>
          )}

          {/* STEP 1: Cab Booking Route & Journey Form */}
          {step === 1 && serviceType === "CAB" && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 sm:p-7 space-y-6 animate-in fade-in duration-300">
              {/* Top Header with Back */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                    🚕 Cab Booking
                  </span>
                  <span className="text-slate-500 text-xs font-medium">Select Journey & Schedule</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Services
                </button>
              </div>

              {/* Trip Type Tabs: ONE WAY | ROUND TRIP | LOCAL | AIRPORT | HOURLY PACKAGE */}
              <div className="flex justify-center">
                <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-xs sm:text-sm font-bold bg-white">
                  {(["ONE WAY", "ROUND TRIP", "LOCAL", "AIRPORT", "HOURLY PACKAGE"] as CabTripType[]).map((tab) => {
                    const isActive = cabTripType === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setCabTripType(tab)}
                        style={isActive ? { backgroundColor: "#0E6B50", color: "#ffffff" } : undefined}
                        className={`px-3 sm:px-5 py-2.5 transition-colors uppercase tracking-wider ${
                          isActive
                            ? "bg-[#0E6B50] text-white font-extrabold shadow-inner"
                            : "text-slate-700 hover:bg-slate-50 border-r last:border-r-0 border-slate-200"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PACKAGE SELECTOR BUTTONS IN ONE ROW (Only For HOURLY PACKAGE) */}
              {cabTripType === "HOURLY PACKAGE" && (
                <div className="flex flex-col items-center justify-center gap-1.5 pt-2 pb-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> SELECT RENTAL PACKAGE
                  </div>
                  <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden text-xs sm:text-sm font-bold bg-white shadow-2xs">
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
                          style={isSelected ? { backgroundColor: "#0E6B50", color: "#ffffff" } : undefined}
                          className={`px-3 sm:px-5 py-2 transition-all uppercase tracking-wider ${
                            isSelected
                              ? "bg-[#0E6B50] text-white font-extrabold shadow-inner"
                              : "text-slate-700 hover:bg-slate-50 border-r last:border-r-0 border-slate-200"
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
                    {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
                    <div className="md:col-span-6 flex items-end gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                          FROM
                        </label>
                        <LocationSearchInput
                          value={cabFrom}
                          onChange={setCabFrom}
                          placeholder="Enter Pickup Location"
                        />
                      </div>

                      <div className="flex-shrink-0 pb-1">
                        <button
                          type="button"
                          onClick={swapLocations}
                          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                          title="Swap Locations"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                          TO
                        </label>
                        <LocationSearchInput
                          value={cabTo}
                          onChange={setCabTo}
                          placeholder="Enter Drop Location"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        PICK UP DATE
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={cabDate}
                        onChange={(e) => setCabDate(e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        PICK UP TIME
                      </label>
                      <input
                        type="time"
                        value={cabTime}
                        onChange={(e) => setCabTime(e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* ROUND TRIP */}
                {cabTripType === "ROUND TRIP" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
                    <div className="md:col-span-6 flex items-end gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                          FROM
                        </label>
                        <LocationSearchInput
                          value={cabFrom}
                          onChange={setCabFrom}
                          placeholder="Enter Pickup Location"
                        />
                      </div>

                      <div className="flex-shrink-0 pb-1">
                        <button
                          type="button"
                          onClick={swapLocations}
                          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                          title="Swap Locations"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                          TO
                        </label>
                        <LocationSearchInput
                          value={cabTo}
                          onChange={setCabTo}
                          placeholder="Enter Drop Location"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        PICK UP DATE
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={cabDate}
                        onChange={(e) => setCabDate(e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        RETURN DATE
                      </label>
                      <input
                        type="date"
                        min={cabDate || today}
                        value={cabReturnDate}
                        onChange={(e) => setCabReturnDate(e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800 whitespace-nowrap">
                        PICK UP TIME
                      </label>
                      <input
                        type="time"
                        value={cabTime}
                        onChange={(e) => setCabTime(e.target.value)}
                        className="w-full min-w-[100px] bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* LOCAL & HOURLY PACKAGE (50/50 Pickup and Drop Location) */}
                {(cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
                    <div className="md:col-span-6 flex items-end gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                          PICKUP LOCATION
                        </label>
                        <LocationSearchInput
                          value={cabFrom}
                          onChange={setCabFrom}
                          placeholder="Enter Pickup Location"
                        />
                      </div>

                      <div className="flex-shrink-0 pb-1">
                        <button
                          type="button"
                          onClick={swapLocations}
                          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                          title="Swap Locations"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                          DROP LOCATION
                        </label>
                        <LocationSearchInput
                          value={cabTo}
                          onChange={setCabTo}
                          placeholder="Enter Drop Location"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        PICK UP DATE
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={cabDate}
                        onChange={(e) => setCabDate(e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        PICK UP TIME
                      </label>
                      <input
                        type="time"
                        value={cabTime}
                        onChange={(e) => setCabTime(e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* AIRPORT */}
                {cabTripType === "AIRPORT" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        TRIP
                      </label>
                      <select
                        value={airportTripType}
                        onChange={(e) => setAirportTripType(e.target.value as any)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      >
                        <option value="Drop to Airport">Drop to Airport</option>
                        <option value="Pickup from Airport">Pickup from Airport</option>
                      </select>
                    </div>

                    {airportTripType === "Drop to Airport" ? (
                      <>
                        {/* 1. Pickup Location (Search + GPS) */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                            PICKUP LOCATION
                          </label>
                          <LocationSearchInput
                            value={cabFrom}
                            onChange={setCabFrom}
                            placeholder="Enter Pickup Location / Area (e.g. Rajajinagar)"
                          />
                        </div>

                        {/* 2. Drop Airport (Searchable & Editable) */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                            DROP AIRPORT
                          </label>
                          <LocationSearchInput
                            value={airportName}
                            onChange={setAirportName}
                            placeholder="Enter Airport / Terminal (e.g. Terminal 1, BLR)"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 1. Pickup Airport (Searchable & Editable) */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                            PICKUP AIRPORT
                          </label>
                          <LocationSearchInput
                            value={airportName}
                            onChange={setAirportName}
                            placeholder="Enter Airport / Terminal (e.g. Terminal 2, BLR)"
                          />
                        </div>

                        {/* 2. Drop Location (Search + GPS) */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                            DROP LOCATION
                          </label>
                          <LocationSearchInput
                            value={cabTo}
                            onChange={setCabTo}
                            placeholder="Enter Drop Location / Area (e.g. Rajajinagar)"
                          />
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        PICK UP DATE
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={cabDate}
                        onChange={(e) => setCabDate(e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                        PICK UP TIME
                      </label>
                      <input
                        type="time"
                        value={cabTime}
                        onChange={(e) => setCabTime(e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* NEXT PAGE ORANGE BUTTON */}
              <div className="flex justify-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleGoToFleetSelection}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-10 py-3.5 rounded-xl uppercase tracking-wider text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2"
                >
                  NEXT PAGE <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 FOR OTHER SERVICES (Train, Bus, Flight, Tour) */}
          {step === 1 && serviceType !== "CAB" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg">
                    {serviceType === "TRAIN" && "IRCTC Train Ticket Booking"}
                    {serviceType === "BUS" && "Bus Ticket Booking Assistance"}
                    {serviceType === "FLIGHT" && "Domestic & International Flight Booking"}
                    {serviceType === "TOUR" && "Holiday Tour Packages"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {serviceType !== "TOUR"
                      ? "Assisted Ticket Booking with Live PNR & Confirmation Voucher"
                      : "Curated holiday itineraries across South India"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Services
                </button>
              </div>

              {/* 3 Ticket Switcher Tabs (Train, Flight, Bus) */}
              {serviceType !== "TOUR" && (
                <div className="flex justify-center pb-2">
                  <div className="inline-flex rounded-xl border border-slate-300 overflow-hidden bg-slate-100 p-1 gap-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setServiceType("TRAIN")}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                        serviceType === "TRAIN"
                          ? "bg-[#0E6B50] text-white shadow-sm font-extrabold"
                          : "text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <TrainFront className="w-4 h-4" /> Train Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType("FLIGHT")}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                        serviceType === "FLIGHT"
                          ? "bg-[#0E6B50] text-white shadow-sm font-extrabold"
                          : "text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Plane className="w-4 h-4" /> Flight Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType("BUS")}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                        serviceType === "BUS"
                          ? "bg-[#0E6B50] text-white shadow-sm font-extrabold"
                          : "text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Bus className="w-4 h-4" /> Bus Booking
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {serviceType === "TRAIN" && (
                  <TrainBookingForm
                    formData={otherFormData}
                    onChange={onOtherChange}
                    errors={errors}
                    onCompleteBooking={handleCompleteTicketBooking}
                    isSubmitting={isSubmitting}
                  />
                )}
                {serviceType === "BUS" && (
                  <BusBookingForm
                    formData={otherFormData}
                    onChange={onOtherChange}
                    errors={errors}
                    onCompleteBooking={handleCompleteTicketBooking}
                    isSubmitting={isSubmitting}
                  />
                )}
                {serviceType === "FLIGHT" && (
                  <FlightBookingForm
                    formData={otherFormData}
                    onChange={onOtherChange}
                    errors={errors}
                    onCompleteBooking={handleCompleteTicketBooking}
                    isSubmitting={isSubmitting}
                  />
                )}
                {serviceType === "TOUR" && (
                  <TourBookingForm formData={otherFormData} onChange={onOtherChange} errors={errors} onFareCalculated={() => {}} />
                )}
              </div>

              {serviceType === "TOUR" && (
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCompleteTicketBooking}
                    disabled={isSubmitting}
                    className="relative overflow-hidden text-white font-black px-8 py-3.5 rounded-xl uppercase text-sm shadow-md transition-all hover:scale-105 disabled:opacity-60 group flex items-center justify-center min-w-[280px]"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-500 group-hover:scale-110" 
                      style={{ backgroundImage: "url('/images/booking-btn-bg.jpg')" }} 
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-0" />
                    <span className="relative z-10 drop-shadow-md tracking-wider">
                      {isSubmitting ? "Generating Ticket..." : "CONTINUE TO BOOKING →"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT VEHICLE FLEET PAGE (Clean without fuel selector) */}
          {step === 2 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    Select Vehicle Fleet
                  </h2>
                  <p className="text-xs text-slate-500">
                    {fromLocationDisplay} → {toLocationDisplay} · {departureDateFormatted}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Modify Route
                </button>
              </div>

              {/* Fleet Selection List */}
              <div className="space-y-4">
                {FLEET_OPTIONS.map((fleet) => {
                  const isSelected = selectedFleetId === fleet.id;
                  let price = fleet.basePriceOneWay;
                  if (cabTripType === "ROUND TRIP") price = fleet.basePriceRoundTrip;
                  if (cabTripType === "AIRPORT") price = fleet.basePriceAirport;
                  if (cabTripType === "LOCAL") {
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
                          ? "border-[#f97316] bg-amber-50/40 ring-2 ring-amber-500/20 shadow-md"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex justify-center">
                          <img
                            src={fleet.image}
                            alt={fleet.name}
                            className="w-36 h-24 object-cover rounded-xl shadow-xs"
                          />
                        </div>

                        <div className="md:col-span-5 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base">
                              {fleet.name}
                            </h3>
                            <span className="bg-slate-900 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              {fleet.rating} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </span>
                          </div>

                          <p className="text-xs text-slate-500">{fleet.category}</p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 pt-1 font-medium">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" /> {fleet.seats} Seater
                            </span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Driver Allowance Included
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-4 flex flex-col items-end justify-center space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 text-right">
                          <div className="text-2xl font-black text-emerald-700">
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
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all ${
                              isSelected
                                ? "bg-[#f97316] text-white hover:bg-[#ea580c] shadow-md"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-800"
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
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={withLuggageCarrier}
                    onChange={(e) => setWithLuggageCarrier(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>🚙 Add Roof Luggage Carrier @ ₹149</span>
                </label>
                <span className="text-emerald-800 font-extrabold">+₹149 Extra</span>
              </div>

              {/* Bottom Continue to Passenger Details Button */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Route
                </button>

                <button
                  type="button"
                  onClick={handleGoToPassengerDetails}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-wider text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2"
                >
                  Continue to Passenger Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PASSENGER DETAILS PAGE (Only Name & Phone Number -> NEXT PAGE button) */}
          {step === 3 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    Passenger Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enter passenger details for your trip
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Fleet
                </button>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    SELECTED VEHICLE & ROUTE
                  </span>
                  <div className="font-black text-slate-900 text-base sm:text-lg">
                    {vehicleDisplay}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {fromLocationDisplay} → {toLocationDisplay} · {departureDateFormatted} · {cabTripType}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block">TOTAL FARE</span>
                  <div className="text-2xl font-black text-emerald-700">
                    ₹{calculatedFare.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Passenger Inputs (Only Name and Mobile Number) */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  PASSENGER CONTACT
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                      PASSENGER FULL NAME *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter passenger full name"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                      MOBILE NUMBER *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Boarding Point & Address (helps driver locate passenger) */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  BOARDING DETAILS (For Driver)
                </span>
                <p className="text-[11px] text-slate-500 -mt-2">
                  Enter the exact pick-up location so the driver can locate you easily.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                      Boarding Point *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. KR Market, MG Road Metro"
                      value={boardingPoint}
                      onChange={(e) => setBoardingPoint(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                      Boarding Address *
                    </label>
                    <input
                      type="text"
                      placeholder="Full address / landmark for pick-up"
                      value={boardingAddress}
                      onChange={(e) => setBoardingAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom NEXT PAGE Button */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Fleet
                </button>

                <button
                  type="button"
                  onClick={handleGoToPayment}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-10 py-3.5 rounded-xl uppercase tracking-wider text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2"
                >
                  NEXT PAGE <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT CHOICE PAGE */}
          {step === 4 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    Payment Choice
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select payment option to confirm your reservation
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Passenger Details
                </button>
              </div>


              {/* Payment Options */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  PAYMENT CHOICE
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAdvanceOption(100)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      advanceOption === 100
                        ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/40 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-slate-900 text-sm sm:text-base">⚡ Pay ₹100 Advance</span>
                      <span className="bg-[#f97316] text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                        PRIORITY LOCK
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Instant vehicle lock with priority driver dispatch.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdvanceOption(0)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      advanceOption === 0
                        ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/40 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-slate-900 text-sm sm:text-base">Zero Advance</span>
                      <span className="bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        Pay ₹0 Today
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Pay full amount directly upon boarding.
                    </p>
                  </button>
                </div>

                {/* UPI QR if ₹100 Advance is selected */}
                {advanceOption === 100 && (
                  <div className="bg-gradient-to-b from-amber-50/60 to-white border border-amber-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Pay ₹100 Token Advance via UPI
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 shrink-0 text-center">
                        <div className="w-32 h-32 flex items-center justify-center mx-auto">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=fortunetourism@okaxis%26pn=Fortune%20Tourism%26am=100%26tn=Token%20Advance&size=128x128&format=png"
                            alt="UPI QR Code"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="text-center text-[10px] font-bold text-slate-800 mt-1">Scan · Pay ₹100</div>
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">UPI ID</div>
                            <div className="font-black text-slate-900 text-sm">fortunetourism@okaxis</div>
                          </div>
                          <button
                            type="button"
                            onClick={copyUPI}
                            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
                          >
                            {upiCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {upiCopied ? "Copied!" : "Copy"}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: "GPay", link: "tez://upi/pay?pa=fortunetourism@okaxis&pn=Fortune+Tourism&am=100&tn=Token+Advance" },
                            { name: "PhonePe", link: "phonepe://pay?pa=fortunetourism@okaxis&pn=Fortune+Tourism&am=100" },
                            { name: "Paytm", link: "paytmmp://upi/pay?pa=fortunetourism@okaxis&pn=Fortune+Tourism&am=100" },
                            { name: "Any UPI App", link: "upi://pay?pa=fortunetourism@okaxis&pn=Fortune%20Tourism&am=100&tn=Token%20Advance" },
                          ].map((app) => (
                            <a
                              key={app.name}
                              href={app.link}
                              className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all shadow-xs"
                            >
                              {app.name}
                            </a>
                          ))}
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            UTR / Transaction ID (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 423589124012"
                            value={utrRef}
                            onChange={(e) => setUtrRef(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Confirm Button */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Passenger Details
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndGenerateTicket}
                  disabled={isSubmitting}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-wider text-sm shadow-md transition-all hover:scale-105 disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Ticket...
                    </>
                  ) : (
                    <>
                      Confirm Booking & Generate Ticket <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: OFFICIAL TICKET COPY VOUCHER & PDF DOWNLOAD (Exact 4-Row Spreadsheet) */}
          {step === 5 && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        Booking Confirmed Successfully!
                      </h2>
                      <p className="text-xs text-slate-500">
                        Your official Ticket Copy is generated below. You can download PDF or print it.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-black rounded-xl text-xs shadow-md transition-all"
                    >
                      <Download className="h-4 w-4" /> Download PDF Ticket
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow transition-all"
                    >
                      <Printer className="h-4 w-4 text-amber-400" /> Print
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <strong className="text-slate-700 uppercase text-xs font-black">TICKET NO:</strong>{" "}
                      <span className="font-mono font-black text-amber-700 text-base sm:text-lg tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs">
                        {ticketNumber}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <strong className="text-slate-700 uppercase text-xs font-black">PNR:</strong>{" "}
                      <span className="font-mono font-black text-slate-950 text-base sm:text-lg tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-300 shadow-2xs">
                        {pnrNumber}
                      </span>
                    </span>
                  </div>

                  <a
                    href={buildWhatsAppUrl(
                      `Hello Fortune Tourism! I have booked my cab.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Passenger:* ${passengerName || "GUEST"}\n*Phone:* ${passengerPhone || "9845003000"}\n*From:* ${fromLocationDisplay}\n*To:* ${toLocationDisplay}\n*Date:* ${departureDateFormatted}\n*Vehicle:* ${vehicleDisplay}\n\nPlease confirm driver assignment.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Share on WhatsApp
                  </a>
                </div>
              </div>

              {/* TICKET COPY VOUCHER CONTAINER (Exact Spreadsheet Layout) */}
              <div
                id="official-ticket-card"
                className="ticket-copy-print-area bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-md space-y-4"
              >
                {/* Brand Header with Logo & Official Address */}
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
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-slate-950 font-black tracking-wide text-base sm:text-lg">
                      Ticket Copy For Your Journey
                    </div>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      TICKET NUMBER :
                      <strong className="font-mono font-black text-amber-700 text-sm sm:text-base tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                        {ticketNumber}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Ticket Table Grid (Exact 4-Row Spreadsheet Structure) */}
                <div className="overflow-x-auto border-2 border-slate-900">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <tbody>
                      {/* Row 1: Passenger Name | Passenger Phone No. | Tour Type */}
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

                      {/* Row: Boarding Point | Boarding Address */}
                      <tr className="border-b border-slate-900 divide-x divide-slate-900">
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                          Boarding Point:
                        </td>
                        <td colSpan={2} className="p-2.5 font-bold text-slate-900 uppercase">
                          {boardingPointDisplay || "—"}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                          Boarding Address:
                        </td>
                        <td colSpan={2} className="p-2.5 font-bold text-slate-900">
                          {boardingAddressDisplay || "—"}
                        </td>
                      </tr>

                      {/* Row 4: Trip Type | Type Of Car:/bus/Flight | Boarding point */}
                      <tr className="divide-x divide-slate-900">
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                          Trip Type:
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 uppercase">
                          {cabTripType}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                          {serviceType === "FLIGHT"
                            ? "Type Of Flight:"
                            : serviceType === "BUS"
                            ? "Type Of Bus:"
                            : serviceType === "TRAIN"
                            ? "Type Of Train:"
                            : serviceType === "TOUR"
                            ? "Tour Package:"
                            : "Type Of Cab:"}
                        </td>
                        <td className="p-2.5 font-black text-slate-900 uppercase">
                          {vehicleDisplay}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                          Boarding point:
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 uppercase">
                          {fromLocationDisplay}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Terms and conditions footnote */}
                <div className="border border-slate-300 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                    Terms & Instructions
                  </div>
                  <div>1. Please carry this ticket copy / SMS during your journey.</div>
                  <div>2. Driver & vehicle assignment details will be shared prior to departure.</div>
                  <div>3. 24/7 Helpline & Support: +91 9740463404 | Fortune Tourism Bangalore.</div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setServiceType(null);
                    setTicketNumber(generateTicketNumber());
                    setPnrNumber(generatePNR());
                    setPassengerName("");
                    setPassengerPhone("");
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Book Another Journey
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-6 py-3 rounded-xl shadow-md transition-all text-xs"
                  >
                    <Download className="w-4 h-4" /> Download Ticket (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-xs"
                  >
                    <Printer className="w-4 h-4 text-amber-400" /> Print Ticket Copy
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </SiteLayout>
  );
}
