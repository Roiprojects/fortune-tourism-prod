import { useState, useCallback, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { packages } from "@/data/packages";
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
  Banknote,
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
  Maximize2,
  QrCode,
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
import { useFleetTariffs } from "@/lib/fleet-tariffs";
import { useTourTariffs } from "@/lib/tour-tariffs";

export const Route = createFileRoute("/booking")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      service: typeof search.service === "string" ? search.service : undefined,
      package: typeof search.package === "string" ? search.package : undefined,
    };
  },
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

const POPULAR_CAB_CITIES = [
  "Bangalore",
  "Mysore",
  "Ooty",
  "Coorg (Madikeri)",
  "Wayanad",
  "Pondicherry",
  "Chikmagalur",
  "Chennai",
  "Tirupati",
  "Coimbatore",
  "Hyderabad",
  "Mangalore",
  "Goa",
  "Hassan",
  "Shimoga",
];

const POPULAR_CAB_ROUND_TRIP_DESTINATIONS = [
  { label: "Mysore", value: "Mysore" },
  { label: "Ooty", value: "Ooty" },
  { label: "Coorg", value: "Coorg (Madikeri)" },
  { label: "Wayanad", value: "Wayanad" },
  { label: "Pondicherry", value: "Pondicherry" },
  { label: "Chikmagalur", value: "Chikmagalur" },
  { label: "Chennai", value: "Chennai" },
  { label: "Tirupati", value: "Tirupati" },
  { label: "Goa", value: "Goa" },
];

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
  const search = Route.useSearch();
  const { fleetList: liveFleetOptions, roofLuggageRate } = useFleetTariffs();
  const fleetOptions = liveFleetOptions.length > 0 ? liveFleetOptions : FLEET_OPTIONS;
  const { packagesList: liveTourPackages } = useTourTariffs();

  // Step 0: Choose Service (5 cards)
  // Step 1: Cab Journey Route & Dropdown (One Way / Round Trip / Local / Airport)
  // Step 2: Fleet Selection Page (Hatchback, Sedan, SUV, Innova, Tempo)
  // Step 3: Passenger Details (Name & Phone Number only) -> [ NEXT PAGE ]
  // Step 4: Payment Choice Page (₹100 or Zero advance) -> [ CONFIRM BOOKING ]
  // Step 5: Official Ticket Confirmation PDF Voucher
  const [step, setStep] = useState(0);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);

  useEffect(() => {
    if (search.service?.toUpperCase() === "TOUR" || search.package) {
      setServiceType("TOUR");
      setStep(1);
      if (search.package) {
        const found = liveTourPackages.find((p) => p.slug === search.package);
        if (found) {
          setOtherFormData((prev: any) => ({
            ...prev,
            package_slug: found.slug,
            package_title: found.title,
            number_of_days: found.duration.split(" ")[0] || "3",
            destination: found.destinations.join(" → "),
          }));
        }
      }
    }
  }, [search.service, search.package, liveTourPackages]);

  // Cab Journey Inputs
  const [cabTripType, setCabTripType] = useState<CabTripType>("ONE WAY");
  const [cabFrom, setCabFrom] = useState("Bangalore");
  const [cabTo, setCabTo] = useState("Mysore");
  const [cabReturnFrom, setCabReturnFrom] = useState("Mysore");
  const [cabReturnTo, setCabReturnTo] = useState("Bangalore");
  const [cabDate, setCabDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [cabReturnDate, setCabReturnDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [cabTime, setCabTime] = useState("07:00");
  const [cabReturnTime, setCabReturnTime] = useState("18:00");
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
  const [paymentChoice, setPaymentChoice] = useState<"token_100" | "full" | "zero">("token_100");
  const [fullPaymentType, setFullPaymentType] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [manualMethod, setManualMethod] = useState<"CASH" | "BANK_TRANSFER" | "POS_CARD" | "CHEQUE">("CASH");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [collectedBy, setCollectedBy] = useState("Online Booking");
  const [utrRef, setUtrRef] = useState("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

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

  // Format return date for Round Trip
  const cabReturnDateFormatted = useMemo(() => {
    const rawDate = cabReturnDate || cabDate || today;
    const [y, m, d] = rawDate.split("-");
    return `${d}-${m}-${y}`;
  }, [cabReturnDate, cabDate, today]);

  // Selected Fleet details
  const selectedFleet = useMemo(() => {
    return fleetOptions.find((f) => f.id === selectedFleetId) || fleetOptions[1] || fleetOptions[0];
  }, [fleetOptions, selectedFleetId]);

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
    return base + (withLuggageCarrier ? roofLuggageRate : 0);
  }, [selectedFleet, cabTripType, localPackage, withLuggageCarrier, roofLuggageRate]);

  // Dynamic Total Fare calculation for confirmation ticket copy
  const displayTotalFare = useMemo(() => {
    if (serviceType === "CAB") {
      return calculatedFare;
    }
    if (serviceType === "TOUR") {
      if (otherFormData.fare_amount && Number(otherFormData.fare_amount) > 0) {
        return Number(otherFormData.fare_amount);
      }
      const pkg = liveTourPackages.find((p) => p.slug === otherFormData.package_slug) || liveTourPackages[0];
      const base = pkg?.startingPrice || 4999;
      const adults = Number(otherFormData.adults || 2);
      const days = Number(otherFormData.number_of_days || 2);
      return Math.round(base * Math.max(1, adults / 2) * Math.max(1, days / 2));
    }
    if (serviceType === "TRAIN") {
      if (otherFormData.fare_amount && Number(otherFormData.fare_amount) > 0) {
        return Number(otherFormData.fare_amount);
      }
      const count = Math.max(1, otherFormData.passengers?.length || 1);
      const cls = String(otherFormData.travel_class || "3A").toUpperCase();
      let perTicket = 850;
      if (cls === "1A") perTicket = 2450;
      else if (cls === "2A") perTicket = 1650;
      else if (cls === "3A" || cls === "3E") perTicket = 1150;
      else if (cls === "CC") perTicket = 750;
      else if (cls === "SL") perTicket = 450;
      else if (cls === "2S") perTicket = 190;
      return count * perTicket;
    }
    if (serviceType === "BUS") {
      if (otherFormData.fare_amount && Number(otherFormData.fare_amount) > 0) {
        return Number(otherFormData.fare_amount);
      }
      const count = Math.max(1, Number(otherFormData.seats_count || otherFormData.passengers?.length || 1));
      const busType = String(otherFormData.bus_type || "").toUpperCase();
      let perSeat = 850;
      if (busType.includes("VOLVO") || busType.includes("MULTI-AXLE")) perSeat = 1450;
      else if (busType.includes("SLEEPER")) perSeat = 1100;
      else if (busType.includes("SEMI")) perSeat = 750;
      return count * perSeat;
    }
    if (serviceType === "FLIGHT") {
      if (otherFormData.fare_amount && Number(otherFormData.fare_amount) > 0) {
        return Number(otherFormData.fare_amount);
      }
      const count = Math.max(1, Number(otherFormData.passengers?.length || 1));
      const trip = String(otherFormData.flight_trip_type || "").toUpperCase();
      const cabin = String(otherFormData.cabin_class || "ECONOMY").toUpperCase();
      let perFlight = cabin === "BUSINESS" ? 14500 : 4850;
      if (trip.includes("ROUND")) perFlight *= 2;
      if (trip.includes("MULTI")) {
        const legsCount = Array.isArray(otherFormData.multi_city_flights) ? otherFormData.multi_city_flights.length : 2;
        perFlight *= legsCount;
      }
      return count * perFlight;
    }
    return calculatedFare;
  }, [serviceType, calculatedFare, otherFormData, liveTourPackages]);

  const paymentStatusText = useMemo(() => {
    if (paymentChoice === "full") {
      return fullPaymentType === "AUTOMATIC"
        ? "CONFIRMED / 100% PAID (ONLINE UPI)"
        : `CONFIRMED / 100% PAID (${manualMethod === "CASH" ? "CASH" : manualMethod === "BANK_TRANSFER" ? "BANK TRANSFER" : manualMethod === "POS_CARD" ? "CARD POS" : "CHEQUE"})`;
    }
    if (paymentChoice === "token_100") {
      return `₹100 ADVANCE PAID (BAL: ₹${Math.max(0, (displayTotalFare || 0) - 100).toLocaleString("en-IN")})`;
    }
    return `PAY ON BOARDING (DUE: ₹${Number(displayTotalFare || 0).toLocaleString("en-IN")})`;
  }, [paymentChoice, fullPaymentType, manualMethod, displayTotalFare]);

  // From and To locations
  const fromLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return (otherFormData.from_station || "BANGALORE CITY (SBC)").toUpperCase();
    if (serviceType === "BUS") return (otherFormData.from_location || "BANGALORE").toUpperCase();
    if (serviceType === "FLIGHT") {
      if (otherFormData.flight_trip_type === "Multi City" && Array.isArray(otherFormData.multi_city_flights) && otherFormData.multi_city_flights[0]?.from) {
        return (otherFormData.multi_city_flights[0].from.split(",")[0] || otherFormData.multi_city_flights[0].from).toUpperCase();
      }
      return (otherFormData.from_airport || otherFormData.from_location || otherFormData.pickup || "BANGALORE (BLR)").toUpperCase();
    }
    if (serviceType === "TOUR") return "BANGALORE";
    if (cabTripType === "AIRPORT" && airportTripType === "Pickup from Airport") {
      return airportName.split(",")[0].toUpperCase();
    }
    return (cabFrom || "BANGALORE").toUpperCase();
  }, [serviceType, otherFormData, cabTripType, airportTripType, airportName, cabFrom]);

  const toLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return (otherFormData.to_station || "CHENNAI CENTRAL (MAS)").toUpperCase();
    if (serviceType === "BUS") return (otherFormData.destination || "MYSORE").toUpperCase();
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
        const to = (otherFormData.destination || otherFormData.to_airport || "DELHI (DEL)").toUpperCase();
        return `${to} (ROUND TRIP)`;
      }
      return (otherFormData.destination || otherFormData.to_airport || otherFormData.to_destination || otherFormData.to_location || "DELHI (DEL)").toUpperCase();
    }
    if (serviceType === "TOUR") return (otherFormData.package_title || "SOUTH INDIA TOUR").toUpperCase();
    if (cabTripType === "AIRPORT" && airportTripType === "Drop to Airport") {
      return airportName.split(",")[0].toUpperCase();
    }
    if (cabTripType === "ROUND TRIP") {
      const dest = cabTo && cabTo.trim() ? cabTo.trim().toUpperCase() : "MYSORE";
      const ret = cabReturnTo && cabReturnTo.trim() ? cabReturnTo.trim().toUpperCase() : (cabFrom || "BANGALORE").toUpperCase();
      return `${dest} ➔ ${ret} (ROUND TRIP)`;
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
    if (otherFormData.passengers?.[0]?.name) {
      const count = otherFormData.passengers.length;
      return count > 1
        ? `${otherFormData.passengers[0].name.toUpperCase()} (+${count - 1} OTHERS)`
        : otherFormData.passengers[0].name.toUpperCase();
    }
    return (passengerName || "GUEST").toUpperCase();
  }, [otherFormData, passengerName]);

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

  const handleCabFromChange = (val: string) => {
    setCabFrom(val);
    if (!cabReturnTo || cabReturnTo === cabFrom) {
      setCabReturnTo(val);
    }
  };

  const handleCabToChange = (val: string) => {
    setCabTo(val);
    if (!cabReturnFrom || cabReturnFrom === cabTo) {
      setCabReturnFrom(val);
    }
  };

  const handleSelectPopularRoundTrip = (destination: string) => {
    setCabTo(destination);
    setCabReturnFrom(destination);
    setCabReturnTo(cabFrom || "Bangalore");
  };

  const swapOutbound = () => {
    const temp = cabFrom;
    setCabFrom(cabTo);
    setCabTo(temp);
    setCabReturnFrom(temp);
    setCabReturnTo(cabFrom);
  };

  const swapReturn = () => {
    const temp = cabReturnFrom;
    setCabReturnFrom(cabReturnTo);
    setCabReturnTo(temp);
  };

  const swapLocations = () => {
    const temp = cabFrom;
    setCabFrom(cabTo);
    setCabTo(temp);
    setCabReturnFrom(temp);
    setCabReturnTo(cabFrom);
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

      const flightFrom = otherFormData.from_airport || otherFormData.from_location || otherFormData.pickup || "BANGALORE (BLR)";
      const flightTo = otherFormData.destination || otherFormData.to_airport || otherFormData.to_destination || otherFormData.to_location || "DELHI (DEL)";

      const payload = {
        name: firstPassenger,
        phone: otherFormData.phone || passengerPhone || "9964600247",
        service: isTrain ? "Train" : isBus ? "Bus" : isFlight ? "Flight" : "Tour",
        booking_type: serviceType,
        pickup: isTrain ? otherFormData.from_station : isBus ? otherFormData.from_location : flightFrom,
        destination: isTrain ? otherFormData.to_station : isBus ? otherFormData.destination : flightTo,
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
          isFlight && (
            otherFormData.flight_trip_type === "Multi City" && Array.isArray(otherFormData.multi_city_flights)
              ? `Flight: ${otherFormData.cabin_class || "Economy"} | Multi City (${otherFormData.multi_city_flights.length} Flights): ${otherFormData.multi_city_flights.map((f: any, i: number) => `F${i + 1}: ${f.from?.split(",")[0] || f.from} → ${f.to?.split(",")[0] || f.to} (${f.date || "?"} ${f.preferred_time || ""})`).join(" | ")}`
              : otherFormData.flight_trip_type === "Round Trip"
              ? `Flight: ${otherFormData.cabin_class || "Economy"} | Round Trip: ${flightFrom} ⇄ ${flightTo} | Dep: ${otherFormData.date || today} | Return: ${otherFormData.return_date || "N/A"}`
              : `Flight: ${otherFormData.cabin_class || "Economy"} | Trip: ${otherFormData.flight_trip_type} | Route: ${flightFrom} → ${flightTo}`
          ),
          `Fare: ₹${displayTotalFare}`,
          otherFormData.passengers && `Passengers: ${otherFormData.passengers.map((p: any, i: number) => `P${i + 1}: ${p.name} (${p.age}y/${p.gender}/${p.berth_preference || "None"})`).join(", ")}`,
        ].filter(Boolean).join(" | "),
        ticket_number: ticketNumber,
        pnr_number: pnrNumber,
        total_amount: Number(displayTotalFare || 0),
        fare: Number(displayTotalFare || 0),
        advance_amount: paymentChoice === "full" ? Number(displayTotalFare || 0) : paymentChoice === "token_100" ? 100 : 0,
        payment_method: paymentChoice === "full" ? (fullPaymentType === "AUTOMATIC" ? "UPI" : `MANUAL_${manualMethod}`) : paymentChoice === "token_100" ? "UPI" : "PAY_ON_ARRIVAL",
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
    if (cabTripType === "ROUND TRIP") {
      if (!cabReturnDate) e.returnDate = "Return date is required for round trip.";
      else if (cabReturnDate < cabDate) e.returnDate = "Return date cannot be earlier than departure date.";
      if (!cabReturnFrom.trim()) setCabReturnFrom(cabTo || "Mysore");
      if (!cabReturnTo.trim()) setCabReturnTo(cabFrom || "Bangalore");
    }

    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep(2);
      window.scrollTo({ top: 80, behavior: "smooth" });
    } else {
      toast.error(e.returnDate || "Please fill required journey details.");
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
      const isRt = cabTripType === "ROUND TRIP";
      const totalKm = isRt ? ((selectedFleet.includedKms || 145) * 2) : (selectedFleet.includedKms || 145);
      const rateKm = selectedFleet.postLimitRate || 14;
      const minKm = isRt ? 250 : 145;
      const driverAllowance = 350;
      const gstAmt = Math.round(calculatedFare * 0.05);
      const baseAmt = Math.max(0, calculatedFare - driverAllowance - gstAmt);

      const payload: Record<string, any> = {
        name: passengerName || "GUEST",
        phone: passengerPhone.replace(/\s+/g, ""),
        email: null,
        service: "Taxi",
        booking_type: "CAB",
        pickup: fromLocationDisplay,
        destination: isRt ? `${toLocationDisplay} (Round Trip)` : toLocationDisplay,
        date: cabDate || today,
        return_date: isRt ? cabReturnDate : null,
        time: cabTime || "07:00",
        passengers: String(selectedFleet.seats),
        trip_type: cabTripType,
        car_type: selectedFleet.name,
        vehicle_type: selectedFleet.name,
        distance_km: totalKm,
        rate_per_km: rateKm,
        min_km: minKm,
        base_amount: baseAmt,
        driver_allowance: driverAllowance,
        gst_amount: gstAmt,
        boarding_point: boardingPoint,
        boarding_address: boardingAddress,
        notes: [
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          `Fleet: ${selectedFleet.name} (${selectedFleet.seats} Seater)`,
          isRt
            ? `Round Trip: ${cabFrom} ➔ ${cabTo} ➔ ${cabReturnTo || cabFrom} | Onward: ${cabDate} ${cabTime} | Return: ${cabReturnDate} ${cabReturnTime}`
            : `One Way: ${fromLocationDisplay} → ${toLocationDisplay} | Dep: ${cabDate} ${cabTime}`,
          `Distance: ~${totalKm} km | Rate: ₹${rateKm}/km`,
          `Fare: ₹${calculatedFare} (Base: ₹${baseAmt} + Driver Allowance: ₹${driverAllowance} + GST: ₹${gstAmt})`,
          paymentChoice === "full"
            ? `Payment: 100% Full Payment (${fullPaymentType === "AUTOMATIC" ? "Online UPI" : `Manual - ${manualMethod}`})`
            : paymentChoice === "token_100"
            ? `Payment: ₹100 Advance Paid (Balance: ₹${Math.max(0, calculatedFare - 100)})`
            : `Payment: Zero Advance (Pay on Boarding)`,
          utrRef && `UTR/Ref: ${utrRef}`,
          manualReceiptNo && `Manual Ref: ${manualReceiptNo}`,
        ]
          .filter(Boolean)
          .join(" | "),
        total_amount: Number(calculatedFare || 0),
        fare: Number(calculatedFare || 0),
        advance_amount: paymentChoice === "full" ? Number(calculatedFare || 0) : paymentChoice === "token_100" ? 100 : 0,
        payment_method: paymentChoice === "full" ? (fullPaymentType === "AUTOMATIC" ? "UPI" : `MANUAL_${manualMethod}`) : paymentChoice === "token_100" ? "UPI" : "PAY_ON_ARRIVAL",
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
      passengerPhone: passengerPhone || "9964600247",
      tourType: tourTypeDisplay,
      fromLocation: fromLocationDisplay,
      toLocation: cabTripType === "ROUND TRIP" ? `${toLocationDisplay} (ROUND TRIP)` : toLocationDisplay,
      departureOn: departureDateFormatted,
      returnDate: cabTripType === "ROUND TRIP" ? cabReturnDateFormatted : undefined,
      tripType: cabTripType,
      vehicleOrMode: vehicleDisplay,
      boardingPoint: boardingPointDisplay,
      boardingAddress: boardingAddressDisplay,
      serviceType: serviceType || undefined,
      fareAmount: displayTotalFare,
      paymentStatus: paymentStatusText,
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

      <div className={`min-h-[calc(100vh-5rem)] relative px-4 sm:px-6 lg:px-8 ${step === 0 ? "flex flex-col justify-between items-center pt-16 sm:pt-20 pb-4 sm:pb-8 -mb-20" : "py-6 sm:py-10"}`}>
        {/* Background Image */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/images/booking-bg.jpg')" }}
        />
        <div className="fixed inset-0 bg-slate-950/30 z-0 pointer-events-none" />
        <div className={`w-full max-w-5xl mx-auto relative z-10 ${step === 0 ? "flex-1 flex flex-col justify-between items-center" : "space-y-6"}`}>

          {/* STEP 0: Initial Page — Centered "Book your journey here" + 3 Separate Cards directly above footer */}
          {step === 0 && (
            <>
              {/* Centered Heading Div */}
              <div className="my-auto text-center px-4 py-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]">
                  Book your journey here
                </h1>
              </div>

              {/* 3 Separate Standalone Cards situated directly above footer */}
              <div className="w-full mt-auto pb-4 sm:pb-8 animate-in fade-in duration-300">
                <MultiServiceTypeCards
                  selectedService={serviceType}
                  onSelect={handleSelectServiceCard}
                />
              </div>
            </>
          )}

          {/* STEP 1: Cab Booking Route & Journey Form */}
          {step === 1 && serviceType === "CAB" && (
            <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
              {/* Top Header with Back */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full px-3.5 py-1 shadow-sm">
                    🚕 Cab Booking
                  </span>
                  <span className="text-slate-300 text-xs sm:text-sm font-semibold">Select Journey & Schedule</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Services
                </button>
              </div>

              {/* Trip Type Tabs: ONE WAY | ROUND TRIP | LOCAL | AIRPORT | HOURLY PACKAGE */}
              <div className="flex justify-center">
                <div className="inline-flex flex-wrap justify-center rounded-2xl border border-white/15 overflow-hidden text-xs sm:text-sm font-bold bg-[#111c3a]/90 p-1.5 gap-1 shadow-inner backdrop-blur-md">
                  {(["ONE WAY", "ROUND TRIP", "LOCAL", "AIRPORT", "HOURLY PACKAGE"] as CabTripType[]).map((tab) => {
                    const isActive = cabTripType === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setCabTripType(tab)}
                        className={`px-3.5 sm:px-5 py-2.5 transition-all rounded-xl uppercase tracking-wider font-extrabold ${
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

              {/* PACKAGE SELECTOR BUTTONS IN ONE ROW (Only For HOURLY PACKAGE) */}
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
                          className={`px-3 sm:px-5 py-2 transition-all uppercase tracking-wider rounded-lg ${
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
                    {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
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
                          className="w-9 h-9 rounded-full bg-[#111c3a] border border-white/20 hover:border-[#00c58e] hover:bg-[#16254c] flex items-center justify-center text-slate-300 transition-all shadow-md hover:scale-105"
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

                {/* ROUND TRIP (Matching Image 1: Outbound & Return Leg Cards with Popular Destinations) */}
                {cabTripType === "ROUND TRIP" && (
                  <div className="space-y-4">
                    {/* Header Bar matching Image 1 */}
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider">
                          ROUND TRIP
                        </span>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          ORIGIN ⇄ DESTINATION
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-3">
                        <span>
                          🚗 <strong>Outbound:</strong> {cabDate || "Not set"}
                        </span>
                        <span>
                          🔄 <strong>Return:</strong> {cabReturnDate || "Not set"}
                        </span>
                      </div>
                    </div>

                    {/* CARD 1: OUTBOUND TRIP (ONWARD JOURNEY) */}
                    <div className="bg-[#0e1730]/80 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                            1
                          </span>
                          🚗 Outbound Cab (Onward Journey)
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Leg 1
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                        <div className="lg:col-span-5">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                            From (Departure / Pickup City) *
                          </label>
                          <div className="space-y-1.5">
                            <LocationSearchInput
                              value={cabFrom}
                              onChange={handleCabFromChange}
                              placeholder="Select pickup city"
                              dark={true}
                            />
                            <select
                              value={cabFrom}
                              onChange={(e) => handleCabFromChange(e.target.value)}
                              className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                            >
                              <option value="">-- Quick Select Departure City --</option>
                              {POPULAR_CAB_CITIES.map((c) => (
                                <option key={c} value={c} className="bg-[#0b1329] text-white">
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="lg:col-span-2 flex justify-center pb-2">
                          <button
                            type="button"
                            onClick={swapOutbound}
                            className="p-2.5 bg-[#111c3a] hover:bg-[#1a2c5a] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
                            title="Swap Outbound route"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            <span className="lg:hidden text-[11px]">Swap</span>
                          </button>
                        </div>

                        <div className="lg:col-span-5">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                            To (Destination / Arrival City) *
                          </label>
                          <div className="space-y-1.5">
                            <LocationSearchInput
                              value={cabTo}
                              onChange={handleCabToChange}
                              placeholder="Select destination city"
                              dark={true}
                            />
                            <select
                              value={cabTo}
                              onChange={(e) => handleCabToChange(e.target.value)}
                              className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                            >
                              <option value="">-- Quick Select Destination City --</option>
                              {POPULAR_CAB_CITIES.map((c) => (
                                <option key={c} value={c} className="bg-[#0b1329] text-white">
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Popular Destinations Quick Select matching Image 1 */}
                      <div className="bg-[#111c3a]/60 border border-white/10 rounded-xl p-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                          Popular Destinations (Automatically Configures Round Trip):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_CAB_ROUND_TRIP_DESTINATIONS.map((d) => (
                            <button
                              key={d.label}
                              type="button"
                              onClick={() => handleSelectPopularRoundTrip(d.value)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                cabTo === d.value
                                  ? "bg-[#00c58e] text-white border-[#00c58e] shadow-xs"
                                  : "bg-[#0b1329] text-slate-300 border-white/15 hover:border-emerald-500 hover:text-white"
                              }`}
                            >
                              🚗 {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                            <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Outbound Departure Date *
                          </label>
                          <input
                            type="date"
                            min={today}
                            value={cabDate}
                            onChange={(e) => {
                              setCabDate(e.target.value);
                              if (cabReturnDate && cabReturnDate < e.target.value) {
                                setCabReturnDate(e.target.value);
                              }
                            }}
                            className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                            <Clock className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Outbound Preferred Time
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

                    {/* CARD 2: RETURN TRIP (RETURN JOURNEY) */}
                    <div className="bg-[#0e1730]/80 border-2 border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
                            2
                          </span>
                          🔄 Return Cab (Return Journey)
                        </h3>
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                          Leg 2 (Return)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                        <div className="lg:col-span-5">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                            From (Return Departure City) *
                          </label>
                          <div className="space-y-1.5">
                            <LocationSearchInput
                              value={cabReturnFrom}
                              onChange={setCabReturnFrom}
                              placeholder="Return Departure City"
                              dark={true}
                            />
                            <select
                              value={cabReturnFrom}
                              onChange={(e) => setCabReturnFrom(e.target.value)}
                              className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                            >
                              <option value="">-- Quick Select Return Departure --</option>
                              {POPULAR_CAB_CITIES.map((c) => (
                                <option key={c} value={c} className="bg-[#0b1329] text-white">
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="lg:col-span-2 flex justify-center pb-2">
                          <button
                            type="button"
                            onClick={swapReturn}
                            className="p-2.5 bg-[#111c3a] hover:bg-[#1a2c5a] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
                            title="Swap Return route"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            <span className="lg:hidden text-[11px]">Swap</span>
                          </button>
                        </div>

                        <div className="lg:col-span-5">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                            To (Return Drop City / Back to Origin) *
                          </label>
                          <div className="space-y-1.5">
                            <LocationSearchInput
                              value={cabReturnTo}
                              onChange={setCabReturnTo}
                              placeholder="Return Drop City"
                              dark={true}
                            />
                            <select
                              value={cabReturnTo}
                              onChange={(e) => setCabReturnTo(e.target.value)}
                              className="w-full bg-[#0b1329]/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                            >
                              <option value="">-- Quick Select Return Drop --</option>
                              {POPULAR_CAB_CITIES.map((c) => (
                                <option key={c} value={c} className="bg-[#0b1329] text-white">
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                            <Calendar className="w-3.5 h-3.5 inline mr-1 text-cyan-400" /> Return Date *
                          </label>
                          <input
                            type="date"
                            min={cabDate || today}
                            value={cabReturnDate}
                            onChange={(e) => setCabReturnDate(e.target.value)}
                            className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5">
                            <Clock className="w-3.5 h-3.5 inline mr-1 text-cyan-400" /> Return Preferred Time
                          </label>
                          <input
                            type="time"
                            value={cabReturnTime}
                            onChange={(e) => setCabReturnTime(e.target.value)}
                            className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white outline-none transition-all shadow-inner [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Circuit Banner */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/30 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00c58e] animate-pulse shrink-0" />
                        <span className="text-slate-300">
                          2-Way Round Trip Circuit:{" "}
                          <strong className="text-white font-extrabold">{cabFrom}</strong>
                          {" ➔ "}
                          <strong className="text-emerald-400 font-extrabold">{cabTo}</strong>
                          {" ➔ "}
                          <strong className="text-cyan-300 font-extrabold">{cabReturnTo || cabFrom}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Dep: <strong className="text-white">{departureDateFormatted}</strong> ({cabTime}) · Ret: <strong className="text-white">{cabReturnDateFormatted}</strong> ({cabReturnTime})
                      </span>
                    </div>
                  </div>
                )}

                {/* LOCAL & HOURLY PACKAGE (50/50 Pickup and Drop Location) */}
                {(cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
                    <div className="md:col-span-6 flex items-end gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
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

                      <div className="flex-shrink-0 pb-1">
                        <button
                          type="button"
                          onClick={swapLocations}
                          className="w-9 h-9 rounded-full bg-[#111c3a] border border-white/20 hover:border-[#00c58e] hover:bg-[#16254c] flex items-center justify-center text-slate-300 transition-all shadow-md hover:scale-105"
                          title="Swap Locations"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-[#00c58e]" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
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
                        <option value="Drop to Airport" className="bg-[#0B132B] text-white">Drop to Airport</option>
                        <option value="Pickup from Airport" className="bg-[#0B132B] text-white">Pickup from Airport</option>
                      </select>
                    </div>

                    {airportTripType === "Drop to Airport" ? (
                      <>
                        {/* 1. Pickup Location (Search + GPS) */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                            PICKUP LOCATION
                          </label>
                          <LocationSearchInput
                            value={cabFrom}
                            onChange={setCabFrom}
                            placeholder="Enter Pickup Location / Area (e.g. Rajajinagar)"
                            dark={true}
                          />
                        </div>

                        {/* 2. Drop Airport (Searchable & Editable) */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                            DROP AIRPORT
                          </label>
                          <LocationSearchInput
                            value={airportName}
                            onChange={setAirportName}
                            placeholder="Enter Airport / Terminal (e.g. Terminal 1, BLR)"
                            dark={true}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 1. Pickup Airport (Searchable & Editable) */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                            PICKUP AIRPORT
                          </label>
                          <LocationSearchInput
                            value={airportName}
                            onChange={setAirportName}
                            placeholder="Enter Airport / Terminal (e.g. Terminal 2, BLR)"
                            dark={true}
                          />
                        </div>

                        {/* 2. Drop Location (Search + GPS) */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                            DROP LOCATION
                          </label>
                          <LocationSearchInput
                            value={cabTo}
                            onChange={setCabTo}
                            placeholder="Enter Drop Location / Area (e.g. Rajajinagar)"
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
                  className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  NEXT PAGE <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 FOR OTHER SERVICES (Train, Bus, Flight, Tour) */}
          {step === 1 && serviceType !== "CAB" && (
            <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full px-3.5 py-1 shadow-sm">
                    {serviceType === "TRAIN" && "🚅 Train Booking"}
                    {serviceType === "FLIGHT" && "✈️ Flight Booking"}
                    {serviceType === "BUS" && "🚌 Bus Booking"}
                    {serviceType === "TOUR" && "🌴 Tour Packages"}
                  </span>
                  <span className="text-slate-300 text-xs sm:text-sm font-semibold">
                    {serviceType === "TOUR"
                      ? "Curated holiday itineraries across South India"
                      : "Select Journey & Schedule"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer ml-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Services
                </button>
              </div>

              {/* 3 Ticket Switcher Tabs (Train, Flight, Bus) */}
              {serviceType !== "TOUR" && (
                <div className="flex justify-center pb-2">
                  <div className="inline-flex rounded-full border border-white/15 bg-[#111c3a]/90 p-1.5 gap-1.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setServiceType("TRAIN")}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                        serviceType === "TRAIN"
                          ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <TrainFront className="w-4 h-4" /> Train Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType("FLIGHT")}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                        serviceType === "FLIGHT"
                          ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Plane className="w-4 h-4" /> Flight Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType("BUS")}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                        serviceType === "BUS"
                          ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
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
                  <TourBookingForm
                    formData={otherFormData}
                    onChange={onOtherChange}
                    errors={errors}
                    onFareCalculated={() => {}}
                    onCompleteBooking={handleCompleteTicketBooking}
                    isSubmitting={isSubmitting}
                    onBackToServices={() => setStep(0)}
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT VEHICLE FLEET PAGE (Clean without fuel selector) */}
          {step === 2 && (
            <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="font-extrabold text-white text-lg sm:text-xl">
                    Select Vehicle Fleet
                  </h2>
                  <p className="text-xs text-slate-400">
                    {cabTripType === "ROUND TRIP" ? `${fromLocationDisplay} ⇄ ${cabTo} ➔ ${cabReturnTo || cabFrom} (2-Way Round Trip)` : `${fromLocationDisplay} → ${toLocationDisplay}`} · Dep: {departureDateFormatted} {cabTripType === "ROUND TRIP" ? `· Ret: ${cabReturnDateFormatted}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm"
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

                          {cabTripType === "ROUND TRIP" && (
                            <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px]">
                              <span className="bg-[#00c58e]/20 text-[#00c58e] border border-[#00c58e]/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                                🔄 2-Way Return ({fleet.includedKms * 2} km incl.)
                              </span>
                              <span className="text-slate-300 font-medium">
                                Extra km: ₹{fleet.postLimitRate}/km · Return: {cabReturnDateFormatted}
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
                              setSelectedFleetId(fleet.id);
                              handleGoToPassengerDetails();
                            }}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all ${
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

              {/* Bottom Continue to Passenger Details Button */}
              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Route
                </button>

                <button
                  type="button"
                  onClick={handleGoToPassengerDetails}
                  className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-8 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Continue to Passenger Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PASSENGER DETAILS PAGE (Only Name & Phone Number -> NEXT PAGE button) */}
          {step === 3 && (
            <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="font-extrabold text-white text-lg sm:text-xl">
                    Passenger Details
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enter passenger details for your trip
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Fleet
                </button>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-[#111c3a]/90 border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    SELECTED VEHICLE & ROUTE
                  </span>
                  <div className="font-black text-white text-base sm:text-lg">
                    {vehicleDisplay}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {cabTripType === "ROUND TRIP" ? `${cabFrom} ➔ ${cabTo} ➔ ${cabReturnTo || cabFrom} (Round Trip Circuit)` : `${fromLocationDisplay} → ${toLocationDisplay}`} · Dep: {departureDateFormatted} ({cabTime}) {cabTripType === "ROUND TRIP" ? `· Ret: ${cabReturnDateFormatted} (${cabReturnTime})` : ""} · {cabTripType}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block">TOTAL FARE</span>
                  <div className="text-2xl font-black text-[#00c58e]">
                    ₹{calculatedFare.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Passenger Inputs (Only Name and Mobile Number) */}
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

              {/* Boarding Point & Address (helps driver locate passenger) */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  BOARDING DETAILS (For Driver)
                </span>
                <p className="text-[11px] text-slate-400 -mt-2">
                  Enter the exact pick-up location so the driver can locate you easily.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Boarding Point *
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
                      Boarding Address *
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

              {/* Bottom NEXT PAGE Button */}
              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Fleet
                </button>

                <button
                  type="button"
                  onClick={handleGoToPayment}
                  className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  NEXT PAGE <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT CHOICE PAGE */}
          {step === 4 && (
            <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="font-extrabold text-white text-lg sm:text-xl">
                    Payment Choice
                  </h2>
                  <p className="text-xs text-slate-400">
                    Select payment option to confirm your reservation
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm"
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
                    <span className="font-black text-[#00c58e] text-lg sm:text-xl">₹{calculatedFare.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-400 font-semibold">Route &amp; Journey:</div>
                    <div className="text-white font-bold">
                      {cabTripType === "ROUND TRIP" ? `${cabFrom} ➔ ${cabTo} ➔ ${cabReturnTo || cabFrom} (Round Trip)` : `${fromLocationDisplay} → ${toLocationDisplay}`}
                    </div>
                    <div className="text-slate-300 text-[11px] space-y-0.5 pt-0.5">
                      {cabTripType === "ROUND TRIP" ? (
                        <>
                          <div>🛫 <strong>Leg 1 (Onward):</strong> {cabFrom} → {cabTo} on {departureDateFormatted} at {cabTime}</div>
                          <div>🛬 <strong>Leg 2 (Return):</strong> {cabReturnFrom || cabTo} → {cabReturnTo || cabFrom} on {cabReturnDateFormatted} at {cabReturnTime}</div>
                        </>
                      ) : (
                        <div>Departure: {departureDateFormatted} at {cabTime}</div>
                      )}
                    </div>
                    {cabTripType === "ROUND TRIP" && (
                      <span className="inline-block mt-1 bg-[#00c58e]/20 text-[#00c58e] border border-[#00c58e]/30 px-2 py-0.5 rounded font-bold text-[10px]">
                        🔄 2-Way Round Trip ({selectedFleet.includedKms * 2} km included)
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <div className="text-slate-400 font-semibold">Fare Components Breakdown:</div>
                    <div className="text-slate-300 text-[11px] space-y-0.5">
                      <div>Base Fare: <strong className="text-white">₹{Math.max(0, calculatedFare - 350 - Math.round(calculatedFare * 0.05)).toLocaleString()}</strong></div>
                      <div>Driver Allowance: <strong className="text-emerald-400">Included (₹350)</strong></div>
                      <div>Taxes &amp; GST: <strong className="text-emerald-400">Included (5% GST)</strong></div>
                      <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{calculatedFare.toLocaleString()}</strong></div>
                    </div>
                  </div>
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
                      setAdvanceOption(displayTotalFare);
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
                      100% full amount (₹{displayTotalFare.toLocaleString("en-IN")}) by manual cash/bank or automatically via UPI.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentChoice("full");
                          setAdvanceOption(displayTotalFare);
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
                          setAdvanceOption(displayTotalFare);
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
                            Pay ₹100 Token Advance to confirm and instantly generate your journey ticket copy (Balance ₹{(Math.max(0, displayTotalFare - 100)).toLocaleString("en-IN")} on boarding)
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
                            100% Fare: ₹{displayTotalFare.toLocaleString("en-IN")}
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
                                Pay full fare of ₹{displayTotalFare.toLocaleString("en-IN")} via QR scan to confirm booking 100% settled
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                            Full Amount ₹{displayTotalFare.toLocaleString("en-IN")}
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
                                Fast Pay Full Amount (₹{displayTotalFare.toLocaleString("en-IN")}) With UPI App
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { name: "PhonePe", link: `phonepe://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${displayTotalFare}&cu=INR`, color: "bg-[#5f259f] text-white hover:bg-purple-800 border-purple-400/30" },
                                  { name: "Google Pay", link: `tez://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${displayTotalFare}&cu=INR`, color: "bg-blue-600 text-white hover:bg-blue-700 border-blue-400/30" },
                                  { name: "Paytm", link: `paytmmp://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${displayTotalFare}&cu=INR`, color: "bg-sky-600 text-white hover:bg-sky-700 border-sky-400/30" },
                                  { name: "Any UPI App", link: `upi://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${displayTotalFare}&cu=INR&tn=Full%20Payment%20Fortune%20Tourism`, color: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-400/30" },
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
                                Settle ₹{displayTotalFare.toLocaleString("en-IN")} via Cash, Bank Transfer, POS Card or Direct Settlement
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
                              Full Amount of ₹{displayTotalFare.toLocaleString("en-IN")} marked as 100% Settled &amp; Confirmed
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
                          Pay the full journey fare of <strong>₹{displayTotalFare.toLocaleString("en-IN")}</strong> directly upon boarding via Cash or PhonePe.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-xl shrink-0">
                      Due: ₹{displayTotalFare.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Confirm Button */}
              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Passenger Details
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndGenerateTicket}
                  disabled={isSubmitting}
                  className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-8 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-105 disabled:opacity-60 flex items-center gap-2"
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
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00c58e] hover:bg-[#00a87a] text-white font-black rounded-xl text-xs shadow-md shadow-[#00c58e]/20 transition-all"
                    >
                      <Download className="h-4 w-4" /> Download PDF Ticket
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs border border-white/15 shadow transition-all"
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
                      `Hello Fortune Tourism! I have booked my cab.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Passenger:* ${passengerName || "GUEST"}\n*Phone:* ${passengerPhone || "9964600247"}\n*From:* ${fromLocationDisplay}\n*To:* ${toLocationDisplay}\n*Date:* ${departureDateFormatted}\n*Vehicle:* ${vehicleDisplay}\n\nPlease confirm driver assignment.`
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
                          ₹{Number(displayTotalFare || 0).toLocaleString("en-IN")}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ticket Table Grid (Exact Spreadsheet Structure with Fare Amount) */}
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
                          {cabTripType === "ROUND TRIP" ? "ONWARD (FROM):" : "FROM:"}
                        </td>
                        <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                          {fromLocationDisplay}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                          {cabTripType === "ROUND TRIP" ? "DESTINATION & RETURN:" : "TO:"}
                        </td>
                        <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                          {cabTripType === "ROUND TRIP" ? `${(cabTo || "MYSORE").toUpperCase()} ➔ ${(cabReturnTo || cabFrom || "BANGALORE").toUpperCase()} (ROUND TRIP 2-WAY)` : toLocationDisplay}
                        </td>
                      </tr>

                      {/* Row 3: Ticket Number | PNR Number | Departure & Return */}
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
                          {cabTripType === "ROUND TRIP" ? "Departure & Return:" : "Departure On:"}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {cabTripType === "ROUND TRIP" ? (
                            <div className="text-xs space-y-0.5">
                              <div>Onward: <strong>{departureDateFormatted} ({cabTime})</strong></div>
                              <div className="text-emerald-800 font-black">Return: <strong>{cabReturnDateFormatted} ({cabReturnTime})</strong></div>
                            </div>
                          ) : (
                            departureDateFormatted
                          )}
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

                      {/* Row 4: Trip Type | Type Of Car:/bus/Flight | Fare Amount */}
                      <tr className="border-b border-slate-900 divide-x divide-slate-900">
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                          Trip Type:
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 uppercase">
                          {cabTripType === "ROUND TRIP" ? "ROUND TRIP (2-WAY)" : cabTripType}
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
                          {cabTripType === "ROUND TRIP" ? "Return Date:" : "Fare Amount:"}
                        </td>
                        <td className="p-2.5 font-black uppercase">
                          {cabTripType === "ROUND TRIP" ? (
                            <span className="text-emerald-800 font-black">{cabReturnDateFormatted}</span>
                          ) : (
                            <span className="text-emerald-700">₹{Number(displayTotalFare || 0).toLocaleString("en-IN")}</span>
                          )}
                        </td>
                      </tr>

                      {/* Row 5: Total Fare Amount | Payment Status | Taxes */}
                      <tr className="divide-x divide-slate-900 bg-emerald-50/50">
                        <td className="p-2.5 font-black text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                          Total Fare Amount:
                        </td>
                        <td className="p-2.5 font-black text-emerald-800 text-sm sm:text-base">
                          ₹{Number(displayTotalFare || 0).toLocaleString("en-IN")}
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
                          {cabTripType === "ROUND TRIP" ? "Base + Driver Allowance + 5% GST Included" : "Included (5% GST)"}
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
    </SiteLayout>
  );
}
