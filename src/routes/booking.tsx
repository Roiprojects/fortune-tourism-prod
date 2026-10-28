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
  Gauge,
  Calculator,
  Sliders,
  Plus,
  Trash2,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { generateTicketNumber, generatePNR } from "@/lib/booking-utils";
import { buildWhatsAppUrl } from "@/lib/contact";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";
import { getRealCurrentTime, formatTime12Hour, formatDepartureDateString } from "@/lib/utils";
import { MultiServiceTypeCards, ServiceType } from "@/components/booking/MultiServiceTypeCards";
import { LocationSearchInput } from "@/components/booking/LocationSearchInput";
import { TrainBookingForm } from "@/components/booking/TrainBookingForm";
import { BusBookingForm } from "@/components/booking/BusBookingForm";
import { FlightBookingForm } from "@/components/booking/FlightBookingForm";
import { TourBookingForm } from "@/components/booking/TourBookingForm";
import {
  useFleetTariffs,
  KM_OPTIONS_LIST,
  PER_KM_RATES_LIST,
  FIXED_TOTAL_FARES_LIST,
} from "@/lib/fleet-tariffs";
import { useTourTariffs } from "@/lib/tour-tariffs";
import { INITIAL_HOURLY_PACKAGES_RECORDS } from "@/components/admin/HourlyPackagesTripsModal";

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

export interface CabMultiCityLeg {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
}

type CabTripType = "ONE WAY" | "ROUND TRIP" | "MULTI CITY" | "LOCAL" | "AIRPORT" | "HOURLY PACKAGE";

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
    basePriceRoundTrip: 6800,
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
    basePriceRoundTrip: 10400,
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
    basePriceRoundTrip: 17000,
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
  const [cabTime, setCabTime] = useState(() => getRealCurrentTime());
  const [cabReturnTime, setCabReturnTime] = useState("18:00");
  const [localPackage, setLocalPackage] = useState<"4hr_40km" | "8hr_80km" | "12hr_120km">("4hr_40km");
  const [cabOneWayKm, setCabOneWayKm] = useState<number>(145);
  const [cabRoundTripKm, setCabRoundTripKm] = useState<number>(290);
  const [cabMultiCityKm, setCabMultiCityKm] = useState<number>(500);
  const [multiCityStops, setMultiCityStops] = useState<CabMultiCityLeg[]>([
    { id: "1", from: "Bangalore", to: "Mysore", date: new Date().toISOString().split("T")[0], time: getRealCurrentTime() },
    { id: "2", from: "Mysore", to: "Ooty", date: new Date().toISOString().split("T")[0], time: getRealCurrentTime() },
  ]);
  const [localViaStops, setLocalViaStops] = useState<string[]>([]);
  const [isCustomKm, setIsCustomKm] = useState<boolean>(false);
  const [airportTripType, setAirportTripType] = useState<"Drop to Airport" | "Pickup from Airport">("Drop to Airport");
  const [airportName, setAirportName] = useState("Terminal 1, Kempegowda International Airport (BLR)");

  // Multi-City Leg Handlers
  const addMultiCityStop = () => {
    const lastStop = multiCityStops[multiCityStops.length - 1];
    const newFrom = lastStop?.to || "Mysore";
    setMultiCityStops([
      ...multiCityStops,
      {
        id: String(Date.now()),
        from: newFrom,
        to: "",
        date: lastStop?.date || cabDate,
        time: "08:00",
      },
    ]);
  };

  const updateMultiCityStop = (idx: number, field: keyof CabMultiCityLeg, val: string) => {
    const updated = [...multiCityStops];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === "to" && idx < updated.length - 1) {
      updated[idx + 1] = { ...updated[idx + 1], from: val };
    }
    setMultiCityStops(updated);
  };

  const removeMultiCityStop = (idx: number) => {
    if (multiCityStops.length <= 2) {
      toast.error("Multi-city route requires at least 2 destinations/legs.");
      return;
    }
    const updated = multiCityStops.filter((_, i) => i !== idx);
    setMultiCityStops(updated);
  };

  // Local Via Stops Handlers
  const addLocalViaStop = () => {
    setLocalViaStops([...localViaStops, ""]);
  };

  const updateLocalViaStop = (idx: number, val: string) => {
    const updated = [...localViaStops];
    updated[idx] = val;
    setLocalViaStops(updated);
  };

  const removeLocalViaStop = (idx: number) => {
    setLocalViaStops(localViaStops.filter((_, i) => i !== idx));
  };

  // Selected Fleet
  const [selectedFleetId, setSelectedFleetId] = useState<string>("sedan");
  const [withLuggageCarrier, setWithLuggageCarrier] = useState<boolean>(false);
  // Committed / Prepared Vehicle Model (Allows choosing Dzire even with custom rate e.g. 16/km)
  const [customVehicleType, setCustomVehicleType] = useState<string>("Sedan (Swift Dzire)");

  // Fare Customization & Auto Calculation States: "STANDARD" | "CUSTOM_PER_KM" | "FIXED_TOTAL"
  const [fareCalculationMode, setFareCalculationMode] = useState<"STANDARD" | "CUSTOM_PER_KM" | "FIXED_TOTAL">("STANDARD");
  const [customRatePerKm, setCustomRatePerKm] = useState<number>(14);
  const [customFixedFare, setCustomFixedFare] = useState<number>(2000);

  // Passenger state (Cleaned: no predefined values)
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [boardingAddress, setBoardingAddress] = useState("");

  // Payment state - Customizable Advance Amount and Toll Option
  const [advanceAmount, setAdvanceAmount] = useState<number>(500);
  const [advanceOption, setAdvanceOption] = useState<number>(500);
  const [tollOption, setTollOption] = useState<"INCLUDED" | "EXCLUDED">("INCLUDED");
  const [paymentChoice, setPaymentChoice] = useState<"advance" | "full" | "zero">("advance");
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
    time: getRealCurrentTime(),
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

  // Effective departure date and time based on selected serviceType
  const effectiveDepartureDate = useMemo(() => {
    if (serviceType === "CAB") {
      return cabTripType === "MULTI CITY" && multiCityStops[0]?.date ? multiCityStops[0].date : (cabDate || today);
    }
    return otherFormData.date || otherFormData.tour_date || today;
  }, [serviceType, cabTripType, multiCityStops, cabDate, today, otherFormData.date, otherFormData.tour_date]);

  const effectiveDepartureTime = useMemo(() => {
    if (serviceType === "CAB") {
      return cabTripType === "MULTI CITY" && multiCityStops[0]?.time ? multiCityStops[0].time : (cabTime || getRealCurrentTime());
    }
    return otherFormData.departure_time || otherFormData.time || otherFormData.preferred_time || getRealCurrentTime();
  }, [serviceType, cabTripType, multiCityStops, cabTime, otherFormData.departure_time, otherFormData.time, otherFormData.preferred_time]);

  // Format departure date e.g. 28-10-2026.10.45
  const departureDateFormatted = useMemo(() => {
    return formatDepartureDateString(effectiveDepartureDate, effectiveDepartureTime);
  }, [effectiveDepartureDate, effectiveDepartureTime]);

  // Format return date for Round Trip
  const cabReturnDateFormatted = useMemo(() => {
    const rawDate = cabReturnDate || cabDate || today;
    const [y, m, d] = rawDate.split("-");
    return `${d}-${m}-${y}`;
  }, [cabReturnDate, cabDate, today]);

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

  // Car selection handler to sync default rate & committed vehicle
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
    if (newCarId === "sedan") {
      setCustomVehicleType("Sedan (Swift Dzire)");
    } else if (newCarId === "premium-sedan") {
      setCustomVehicleType("Premium Sedan (Honda City)");
    } else if (newCarId === "hatchback") {
      setCustomVehicleType("Hatchback (Wagon R / Swift)");
    } else if (newCarId === "suv") {
      setCustomVehicleType("MUV / SUV (Maruti Ertiga)");
    } else if (newCarId === "innova") {
      setCustomVehicleType("Toyota Innova (7 Seater)");
    } else if (newCarId === "innova-crysta" || newCarId === "crysta") {
      setCustomVehicleType("Toyota Innova Crysta (VIP)");
    } else if (newCarId === "tempo" || newCarId === "tempo-traveller") {
      setCustomVehicleType("Tempo Traveller (12/17 Seater)");
    } else if (newCarId === "minibus" || newCarId === "mini-bus") {
      setCustomVehicleType("Mini Bus Coach");
    } else if (found) {
      setCustomVehicleType(found.name);
    }
  };

  // Active Journey Kilometers
  const activeJourneyKm = useMemo(() => {
    if (cabTripType === "ROUND TRIP") return cabRoundTripKm;
    if (cabTripType === "MULTI CITY") return cabMultiCityKm;
    return cabOneWayKm;
  }, [cabTripType, cabRoundTripKm, cabMultiCityKm, cabOneWayKm]);

  // Dynamic Price calculation based on Trip Type, Selected Kilometers & Customization Mode
  const calculatedFare = useMemo(() => {
    const activeKm =
      cabTripType === "ROUND TRIP"
        ? cabRoundTripKm
        : cabTripType === "MULTI CITY"
        ? cabMultiCityKm
        : cabOneWayKm;

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
    } else if (cabTripType === "ROUND TRIP" || cabTripType === "MULTI CITY") {
      const kmToUse = cabTripType === "MULTI CITY" ? cabMultiCityKm : cabRoundTripKm;
      if (kmToUse <= 0) {
        base = 0;
      } else {
        const baseRtKm = selectedFleet.includedKms * 2;
        if (kmToUse <= baseRtKm) {
          base = selectedFleet.basePriceRoundTrip;
        } else {
          base = selectedFleet.basePriceRoundTrip + (kmToUse - baseRtKm) * selectedFleet.postLimitRate;
        }
      }
    } else if (cabTripType === "AIRPORT") {
      base = selectedFleet.basePriceAirport;
    } else if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
      if (localPackage === "4hr_40km") base = selectedFleet.basePriceLocal4hr;
      else if (localPackage === "8hr_80km") base = selectedFleet.basePriceLocal8hr;
      else base = selectedFleet.basePriceLocal12hr;
    }
    return Math.round(base + (withLuggageCarrier ? roofLuggageRate : 0));
  }, [
    fareCalculationMode,
    customFixedFare,
    customRatePerKm,
    selectedFleet,
    cabTripType,
    cabOneWayKm,
    cabRoundTripKm,
    cabMultiCityKm,
    localPackage,
    withLuggageCarrier,
    roofLuggageRate,
  ]);

  // Formula explanation text for complete live fare display
  const fareFormulaExplanation = useMemo(() => {
    const activeKm =
      cabTripType === "ROUND TRIP"
        ? cabRoundTripKm
        : cabTripType === "MULTI CITY"
        ? cabMultiCityKm
        : cabOneWayKm;
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
    if (cabTripType === "MULTI CITY") {
      if (cabMultiCityKm <= 0) return "0 Km selected · ₹0 Fare";
      const baseRtKm = selectedFleet.includedKms * 2;
      if (cabMultiCityKm <= baseRtKm) {
        return `Multi-City Outstation Base (${baseRtKm} km included) = ₹${selectedFleet.basePriceRoundTrip.toLocaleString("en-IN")}${withLuggageCarrier ? ` + ₹${roofLuggageRate}` : ""}`;
      }
      const extraKm = cabMultiCityKm - baseRtKm;
      return `Multi-City Base ₹${selectedFleet.basePriceRoundTrip.toLocaleString("en-IN")} (${baseRtKm} km) + ${extraKm} extra km @ ₹${selectedFleet.postLimitRate}/km (₹${(extraKm * selectedFleet.postLimitRate).toLocaleString("en-IN")})${withLuggageCarrier ? ` + ₹${roofLuggageRate}` : ""}`;
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
    cabMultiCityKm,
    selectedFleet,
    withLuggageCarrier,
    roofLuggageRate,
    calculatedFare,
  ]);

  // Dynamic Total Fare calculation for confirmation ticket copy
  const displayTotalFare = useMemo(() => {
    // If a custom manual fare amount has been entered, prioritize it for ALL service types (CAB, TRAIN, BUS, FLIGHT, TOUR)
    if (otherFormData.fare_amount && Number(otherFormData.fare_amount) > 0) {
      return Number(otherFormData.fare_amount);
    }
    if (serviceType === "CAB") {
      return calculatedFare;
    }
    if (serviceType === "TOUR") {
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

  const remainingBalance = useMemo(() => {
    const total = Number(displayTotalFare || 0);
    if (paymentChoice === "full") return 0;
    if (paymentChoice === "zero") return total;
    return Math.max(0, total - advanceAmount);
  }, [paymentChoice, displayTotalFare, advanceAmount]);

  const paymentStatusText = useMemo(() => {
    const total = Number(displayTotalFare || 0);
    if (paymentChoice === "full" || (paymentChoice === "advance" && advanceAmount >= total && total > 0)) {
      return fullPaymentType === "AUTOMATIC"
        ? "CONFIRMED / 100% PAID (ONLINE UPI) (BAL: ₹0)"
        : `CONFIRMED / 100% PAID (${manualMethod === "CASH" ? "CASH" : manualMethod === "BANK_TRANSFER" ? "BANK TRANSFER" : manualMethod === "POS_CARD" ? "CARD POS" : "CHEQUE"}) (BAL: ₹0)`;
    }
    if (paymentChoice === "advance") {
      if (advanceAmount <= 0) return `PAY ON BOARDING (DUE: ₹${total.toLocaleString("en-IN")})`;
      return `₹${advanceAmount.toLocaleString("en-IN")} ADVANCE PAID (BAL: ₹${remainingBalance.toLocaleString("en-IN")})`;
    }
    return `PAY ON BOARDING (DUE: ₹${total.toLocaleString("en-IN")})`;
  }, [paymentChoice, fullPaymentType, manualMethod, displayTotalFare, advanceAmount, remainingBalance]);

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
    if (serviceType === "CAB" && cabTripType === "MULTI CITY") {
      return (multiCityStops[0]?.from || cabFrom || "BANGALORE").toUpperCase();
    }
    return (cabFrom || "BANGALORE").toUpperCase();
  }, [serviceType, otherFormData, cabTripType, airportTripType, airportName, cabFrom, multiCityStops]);

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
    if (serviceType === "CAB" && cabTripType === "MULTI CITY") {
      const cities = multiCityStops
        .map((s) => (s.to?.split(",")[0] || s.to || "").trim().toUpperCase())
        .filter(Boolean);
      return `${cities.join(" ➔ ")} (MULTI CITY)`;
    }
    if (cabTripType === "ROUND TRIP") {
      const dest = cabTo && cabTo.trim() ? cabTo.trim().toUpperCase() : "MYSORE";
      const ret = cabReturnTo && cabReturnTo.trim() ? cabReturnTo.trim().toUpperCase() : (cabFrom || "BANGALORE").toUpperCase();
      return `${dest} ➔ ${ret} (ROUND TRIP)`;
    }
    if (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") {
      const validStops = localViaStops.filter((s) => s && s.trim());
      const stopsText = validStops.length > 0 ? ` VIA ${validStops.join(", ").toUpperCase()}` : "";
      return `${(cabTo || cabFrom || "BANGALORE LOCAL").toUpperCase()}${stopsText}`;
    }
    if (cabTo && cabTo.trim()) {
      return cabTo.trim().toUpperCase();
    }
    return (cabTo || "MYSORE").toUpperCase();
  }, [serviceType, otherFormData, cabTripType, airportTripType, airportName, cabTo, cabFrom, multiCityStops, localViaStops]);

  const primaryPassengerName = useMemo(() => {
    if (otherFormData.passengers?.[0]?.name) {
      const count = otherFormData.passengers.length;
      return count > 1
        ? `${otherFormData.passengers[0].name.toUpperCase()} (+${count - 1} OTHERS)`
        : otherFormData.passengers[0].name.toUpperCase();
    }
    return (passengerName || "GUEST").toUpperCase();
  }, [otherFormData, passengerName]);

  const bookingPassengersList = useMemo(() => {
    if (Array.isArray(otherFormData?.passengers)) {
      return otherFormData.passengers.filter((p: any) => p && p.name && p.name.trim());
    }
    return [];
  }, [otherFormData?.passengers]);

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
    const baseCar = (customVehicleType || (selectedFleetId === "sedan" ? "Sedan (Swift Dzire)" : selectedFleet.name)).toUpperCase();
    return `${baseCar}${withLuggageCarrier ? " + CARRIER" : ""}`;
  }, [serviceType, otherFormData, customVehicleType, selectedFleetId, selectedFleet, withLuggageCarrier]);

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

  // Step 1 -> Step 4 for Train, Bus, Flight, Tour (Go to Payment Choice)
  const handleGoToTicketPayment = () => {
    const isTrain = serviceType === "TRAIN";
    const isBus = serviceType === "BUS";
    const isFlight = serviceType === "FLIGHT";

    if (isTrain) {
      if (!otherFormData.from_station || !otherFormData.from_station.trim()) {
        toast.error("Please enter From Station.");
        return;
      }
      if (!otherFormData.to_station || !otherFormData.to_station.trim()) {
        toast.error("Please enter To Station.");
        return;
      }
      if (!otherFormData.date) {
        toast.error("Please select Journey Date.");
        return;
      }
      const firstP = otherFormData.passengers?.[0];
      if (!firstP || !firstP.name || !firstP.name.trim()) {
        toast.error("Please enter Passenger 1 Full Name.");
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
    } else if (isBus) {
      if (!otherFormData.from_location || !otherFormData.from_location.trim()) {
        toast.error("Please enter Boarding City.");
        return;
      }
      if (!otherFormData.destination || !otherFormData.destination.trim()) {
        toast.error("Please enter Destination.");
        return;
      }
      if (!otherFormData.date) {
        toast.error("Please select Journey Date.");
        return;
      }
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
    } else if (isFlight) {
      const flightFrom = otherFormData.from_airport || otherFormData.from_location || otherFormData.pickup;
      const flightTo = otherFormData.destination || otherFormData.to_airport || otherFormData.to_destination || otherFormData.to_location;
      if (!flightFrom || !flightFrom.trim()) {
        toast.error("Please enter From Airport.");
        return;
      }
      if (!flightTo || !flightTo.trim()) {
        toast.error("Please enter Destination Airport.");
        return;
      }
      if (!otherFormData.date) {
        toast.error("Please select Departure Date.");
        return;
      }
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

    setStep(4);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  // Confirmation for Ticket Booking after Payment Choice (Step 4 -> Step 5)
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

      const effectiveAdvance = paymentChoice === "full" ? Number(displayTotalFare || 0) : paymentChoice === "advance" ? Math.min(Number(displayTotalFare || 0), advanceAmount) : 0;
      const effectivePaymentStatus = paymentChoice === "full" || effectiveAdvance >= Number(displayTotalFare || 0) ? "Fully Paid" : effectiveAdvance > 0 ? "Advance Paid" : "Pending";
      const effectiveMethod = paymentChoice === "full"
        ? (fullPaymentType === "AUTOMATIC" ? "UPI" : `MANUAL_${manualMethod}`)
        : paymentChoice === "advance"
        ? "UPI"
        : "PAY_ON_ARRIVAL";

      const paymentNotes = [
        `Payment Choice: ${paymentChoice === "advance" ? `₹${effectiveAdvance} Advance Paid (Balance: ₹${Math.max(0, Number(displayTotalFare || 0) - effectiveAdvance)})` : paymentChoice === "full" ? `Full Payment (${fullPaymentType})` : "Zero Advance (Pay on Boarding)"}`,
        paymentChoice === "advance" && utrRef && `UTR Ref: ${utrRef}`,
        paymentChoice === "full" && fullPaymentType === "AUTOMATIC" && utrRef && `UPI UTR: ${utrRef}`,
        paymentChoice === "full" && fullPaymentType === "MANUAL" && `Manual Channel: ${manualMethod}${manualReceiptNo ? ` | Receipt: ${manualReceiptNo}` : ""}${collectedBy ? ` | Handled By: ${collectedBy}` : ""}`,
      ].filter(Boolean).join(" | ");

      const payload = {
        name: firstPassenger,
        phone: otherFormData.phone || passengerPhone || "9964600247",
        service: isTrain ? "Train" : isBus ? "Bus" : isFlight ? "Flight" : "Tour",
        booking_type: serviceType,
        pickup: isTrain ? otherFormData.from_station : isBus ? otherFormData.from_location : flightFrom,
        destination: isTrain ? otherFormData.to_station : isBus ? otherFormData.destination : flightTo,
        date: otherFormData.date || today,
        time: otherFormData.departure_time || otherFormData.time || effectiveDepartureTime,
        passengers: String(pCount),
        passengers_list: otherFormData.passengers || [],
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
          `Total Fare: ₹${displayTotalFare}`,
          paymentNotes,
          otherFormData.passengers && `Passengers: ${otherFormData.passengers.map((p: any, i: number) => `P${i + 1}: ${p.name} (${p.age}y/${p.gender}/${p.berth_preference || "None"})`).join(", ")}`,
        ].filter(Boolean).join(" | "),
        ticket_number: ticketNumber,
        pnr_number: pnrNumber,
        total_amount: Number(displayTotalFare || 0),
        fare: Number(displayTotalFare || 0),
        advance_amount: effectiveAdvance,
        payment_choice: paymentChoice,
        payment_method: effectiveMethod,
        payment_status: effectivePaymentStatus,
        payment_ref: utrRef || manualReceiptNo || null,
        transaction_id: utrRef || manualReceiptNo || null,
        client_token: `FT-TKT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };

      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setStep(5);
      window.scrollTo({ top: 80, behavior: "smooth" });
      try {
        window.dispatchEvent(new Event("fortune_booking_created"));
      } catch {}
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
    if (cabTripType === "MULTI CITY") {
      let invalidLeg = false;
      multiCityStops.forEach((leg, idx) => {
        if (!leg.from?.trim() || !leg.to?.trim()) {
          invalidLeg = true;
          e[`leg_${idx}`] = `Leg ${idx + 1} pickup and destination are required.`;
        }
        if (!leg.date) {
          invalidLeg = true;
          e[`leg_date_${idx}`] = `Leg ${idx + 1} date is required.`;
        }
      });
      if (invalidLeg) {
        toast.error("Please fill all Multi-City stop details (From, To, Date).");
      }
    } else if (cabTripType !== "LOCAL" && cabTripType !== "HOURLY PACKAGE") {
      if (!cabFrom.trim()) e.from = "Pickup location is required.";
      if (!cabTo.trim()) e.to = "Drop location is required.";
    }
    if (cabTripType !== "MULTI CITY" && !cabDate) e.date = "Travel date is required.";
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
      const isMultiCity = cabTripType === "MULTI CITY";
      const totalKm = isMultiCity ? cabMultiCityKm : isRt ? cabRoundTripKm : (cabTripType === "ONE WAY" ? cabOneWayKm : (selectedFleet.includedKms || 145));
      const rateKm = fareCalculationMode === "CUSTOM_PER_KM" ? customRatePerKm : (selectedFleet.postLimitRate || 14);
      const minKm = isMultiCity ? 250 : isRt ? 250 : 145;
      const driverAllowance = 350;
      const gstAmt = Math.round(calculatedFare * 0.05);
      const baseAmt = Math.max(0, calculatedFare - driverAllowance - gstAmt);

      const isHourly = cabTripType === "HOURLY PACKAGE" || cabTripType === "LOCAL";
      const hourlyHoursStr = isHourly
        ? (localPackage === "4hr_40km" ? "4" : localPackage === "12hr_120km" ? "12" : "8")
        : null;
      const hourlyLabel = isHourly
        ? (localPackage === "4hr_40km" ? "4 Hr's" : localPackage === "12hr_120km" ? "12 Hr's" : "8 Hr's")
        : null;

      const committedCar = (customVehicleType || (selectedFleetId === "sedan" ? "Sedan (Swift Dzire)" : selectedFleet.name)).trim();
      const effectiveCabTotal = Number(otherFormData.fare_amount && Number(otherFormData.fare_amount) > 0 ? otherFormData.fare_amount : calculatedFare);
      const effectiveAdvance = paymentChoice === "full" ? effectiveCabTotal : paymentChoice === "advance" ? Math.min(effectiveCabTotal, advanceAmount) : 0;
      const effectivePaymentStatus = paymentChoice === "full" || effectiveAdvance >= effectiveCabTotal ? "Fully Paid" : effectiveAdvance > 0 ? "Advance Paid" : "Pending";
      const effectiveMethod = paymentChoice === "full" ? (fullPaymentType === "AUTOMATIC" ? "UPI" : `MANUAL_${manualMethod}`) : paymentChoice === "advance" ? "UPI" : "PAY_ON_ARRIVAL";

      const payload: Record<string, any> = {
        name: passengerName || "GUEST",
        phone: passengerPhone.replace(/\s+/g, ""),
        email: null,
        service: isHourly ? "Hourly Package" : "Taxi",
        booking_type: "CAB",
        booking_source: "WEBSITE",
        pickup: fromLocationDisplay,
        destination: isMultiCity ? toLocationDisplay : isRt ? `${toLocationDisplay} (Round Trip)` : toLocationDisplay,
        date: isMultiCity ? (multiCityStops[0]?.date || cabDate || today) : (cabDate || today),
        return_date: isRt ? cabReturnDate : null,
        time: isMultiCity ? (multiCityStops[0]?.time || effectiveDepartureTime) : effectiveDepartureTime,
        passengers: String(selectedFleet.seats),
        trip_type: cabTripType,
        car_type: committedCar,
        vehicle_type: committedCar,
        hours_package: hourlyHoursStr,
        hours: hourlyLabel,
        distance_km: totalKm,
        rate_per_km: rateKm,
        min_km: minKm,
        base_amount: Math.max(0, effectiveCabTotal - driverAllowance - gstAmt),
        driver_allowance: driverAllowance,
        gst_amount: gstAmt,
        boarding_point: boardingPoint,
        boarding_address: boardingAddress,
        ticket_number: ticketNumber,
        pnr_number: pnrNumber,
        multi_city_cab: isMultiCity ? multiCityStops : null,
        local_via_stops: (isHourly && localViaStops.filter((s) => s.trim()).length > 0) ? localViaStops.filter((s) => s.trim()) : null,
        notes: [
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          `Fleet: ${committedCar} (${selectedFleet.seats} Seater)`,
          `Toll: ${tollOption}`,
          isMultiCity
            ? `Multi City: ${multiCityStops.map((s) => `${s.from} ➔ ${s.to} (${s.date})`).join(" | ")}`
            : isRt
            ? `Round Trip: ${cabFrom} ➔ ${cabTo} ➔ ${cabReturnTo || cabFrom} | Onward: ${cabDate} ${cabTime} | Return: ${cabReturnDate} ${cabReturnTime}`
            : isHourly
            ? `Hourly Rental: ${hourlyLabel || "Package"} | From: ${fromLocationDisplay}${localViaStops.filter((s) => s.trim()).length > 0 ? ` | Via Stops: ${localViaStops.filter((s) => s.trim()).join(", ")}` : ""}`
            : `One Way: ${fromLocationDisplay} → ${toLocationDisplay} | Dep: ${cabDate} ${cabTime}`,
          `Distance: ~${totalKm} km | Rate: ₹${rateKm}/km`,
          `Calculation Mode: ${fareCalculationMode === "CUSTOM_PER_KM" ? `Custom ₹${customRatePerKm}/km` : fareCalculationMode === "FIXED_TOTAL" ? `Fixed Fare ₹${customFixedFare}` : "Standard Tariff"}`,
          withLuggageCarrier ? `Roof Luggage Carrier: Yes (+₹${roofLuggageRate})` : null,
          `Fare: ₹${effectiveCabTotal} (Base: ₹${Math.max(0, effectiveCabTotal - driverAllowance - gstAmt)} + Driver Allowance: ₹${driverAllowance} + GST: ₹${gstAmt})`,
          paymentChoice === "full" || effectiveAdvance >= effectiveCabTotal
            ? `Payment: 100% Full Payment of ₹${effectiveCabTotal} (${fullPaymentType === "AUTOMATIC" ? "Online UPI" : `Manual - ${manualMethod}`})`
            : paymentChoice === "advance"
            ? `Payment: ₹${effectiveAdvance} Advance Paid (Balance: ₹${Math.max(0, effectiveCabTotal - effectiveAdvance)})`
            : `Payment: Zero Advance (Pay on Boarding)`,
          utrRef && `UTR/Ref: ${utrRef}`,
          manualReceiptNo && `Manual Ref: ${manualReceiptNo}`,
        ]
          .filter(Boolean)
          .join(" | "),
        total_amount: effectiveCabTotal,
        fare: effectiveCabTotal,
        advance_amount: effectiveAdvance,
        payment_choice: paymentChoice,
        payment_method: effectiveMethod,
        payment_status: effectivePaymentStatus,
        payment_ref: utrRef || manualReceiptNo || null,
        transaction_id: utrRef || manualReceiptNo || null,
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

      // If hourly package, also persist to local storage for instant Hourly Packages Modal view
      if (isHourly) {
        try {
          const STORAGE_KEY = "fortune_hourly_packages_trips_data";
          const saved = localStorage.getItem(STORAGE_KEY);
          let currentList: any[] = [];
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) currentList = parsed;
            } catch (err) {}
          }
          if (currentList.length === 0) {
            currentList = [...INITIAL_HOURLY_PACKAGES_RECORDS];
          }

          let dateObj = new Date();
          if (cabDate) {
            const p = new Date(cabDate);
            if (!isNaN(p.getTime())) dateObj = p;
          }
          const curMonthGroup = `1/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
          const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;

          const newEntry = {
            id: `HPT-${Date.now()}`,
            monthGroup: curMonthGroup,
            slNo: currentList.length + 1,
            date: dateStr,
            paxName: (passengerName || "GUEST").trim().toUpperCase(),
            phNumber: passengerPhone.replace(/\s+/g, ""),
            from: fromLocationDisplay,
            to: toLocationDisplay,
            hours: hourlyLabel || "8 Hr's",
            car: selectedFleet.name,
            driver: "ZAMEER",
            drPhNo: "9740463404",
            taxiNo: "KA 51 AC 6052",
            toll: "INCLUDED",
            boarding: boardingPoint || fromLocationDisplay,
            amount: effectiveCabTotal,
            paymentStatus: effectivePaymentStatus === "Fully Paid" ? "Paid" : effectivePaymentStatus === "Advance Paid" ? "Advance Paid" : "Pending",
            paymentMethod: effectiveMethod,
            pnr: pnrNumber,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...currentList]));
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("fortune_hourly_storage_updated"));
          }
        } catch (e) {
          console.warn("Could not save hourly package trip locally:", e);
        }
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
      passengerName: primaryPassengerName || "GUEST",
      passengerPhone: otherFormData.phone || passengerPhone || "9964600247",
      passengers: bookingPassengersList.length > 0 ? bookingPassengersList : undefined,
      tourType: tourTypeDisplay,
      fromLocation: fromLocationDisplay,
      toLocation: cabTripType === "ROUND TRIP" ? `${toLocationDisplay} (ROUND TRIP)` : toLocationDisplay,
      departureOn: `${departureDateFormatted} (${formatTime12Hour(effectiveDepartureTime)})`,
      returnDate: cabTripType === "ROUND TRIP" ? cabReturnDateFormatted : undefined,
      tripType: cabTripType,
      vehicleOrMode: vehicleDisplay,
      boardingPoint: boardingPointDisplay,
      boardingAddress: boardingAddressDisplay,
      serviceType: serviceType || undefined,
      fareAmount: displayTotalFare,
      paymentStatus: paymentStatusText,
      toll: tollOption,
    });
    toast.success("Ticket PDF downloaded successfully!");
  };

  const handlePrint = () => {
    const card = document.getElementById("official-ticket-card");
    if (!card) {
      window.print();
      return;
    }

    try {
      const printWindow = window.open("", "_blank", "width=850,height=900");
      if (!printWindow) {
        window.print();
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Ticket Voucher - ${ticketNumber}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                background-color: #ffffff !important;
                color: #000000 !important;
                margin: 0;
                padding: 10px;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              table {
                width: 100% !important;
                border-collapse: collapse !important;
              }
              th, td {
                border: 1px solid #000 !important;
                padding: 6px 10px !important;
              }
              .no-print, .print-hidden {
                display: none !important;
              }
              .print-only {
                display: block !important;
              }
              img {
                max-width: 100% !important;
                height: auto !important;
              }
            </style>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
          </head>
          <body>
            <div style="max-width: 820px; margin: 0 auto;">
              ${card.outerHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 400);
              };
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error("Print popup error, falling back to window.print():", e);
      window.print();
    }
  };

  return (
    <SiteLayout>
      {/* Printable CSS block for Ticket Copy */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          header, nav, footer, .no-print, [role="navigation"] {
            display: none !important;
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
            background: #fff !important;
            color: #000 !important;
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

              {/* Trip Type Tabs: ONE WAY | ROUND TRIP | MULTI CITY | LOCAL | AIRPORT | HOURLY PACKAGE */}
              <div className="flex justify-center">
                <div className="inline-flex flex-wrap justify-center rounded-2xl border border-white/15 overflow-hidden text-xs sm:text-sm font-bold bg-[#111c3a]/90 p-1.5 gap-1 shadow-inner backdrop-blur-md">
                  {(["ONE WAY", "ROUND TRIP", "MULTI CITY", "LOCAL", "AIRPORT", "HOURLY PACKAGE"] as CabTripType[]).map((tab) => {
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
                {(cabTripType === "ONE WAY" || cabTripType === "ROUND TRIP" || cabTripType === "MULTI CITY") && (
                  <div className="border-t border-white/10 pt-3 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-[#00c58e]" />
                        <span>
                          {cabTripType === "ROUND TRIP"
                            ? "ROUND TRIP KILOMETERS (2-WAY RETURN)"
                            : cabTripType === "MULTI CITY"
                            ? "MULTI-CITY OUTSTATION KILOMETERS"
                            : "JOURNEY KILOMETERS"}{" "}
                          (STARTS FROM 0 KM)
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
                              } else if (cabTripType === "MULTI CITY") {
                                setCabMultiCityKm(kmNum);
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
                              } else if (cabTripType === "MULTI CITY") {
                                setCabMultiCityKm(val);
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
                      {(cabTripType === "MULTI CITY"
                        ? [0, 200, 300, 400, 500, 600, 800, 1000, 1200]
                        : cabTripType === "ROUND TRIP"
                        ? [0, 100, 200, 290, 300, 400, 500, 600, 800]
                        : [0, 50, 100, 145, 150, 200, 250, 300, 400]
                      ).map((kmVal) => {
                        const isSel = activeJourneyKm === kmVal && !isCustomKm;
                        return (
                          <button
                            key={kmVal}
                            type="button"
                            onClick={() => {
                              if (cabTripType === "ROUND TRIP") {
                                setCabRoundTripKm(kmVal);
                              } else if (cabTripType === "MULTI CITY") {
                                setCabMultiCityKm(kmVal);
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

                      {/* Quick Vehicle Model Commitment for Custom Rate */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/10">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-[#00c58e]" /> Allocated Vehicle:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            { id: "sedan", label: "Swift Dzire (Sedan)", committed: "Sedan (Swift Dzire)" },
                            { id: "hatchback", label: "Hatchback (WagonR)", committed: "Hatchback (Wagon R / Swift)" },
                            { id: "suv", label: "Ertiga (SUV/MUV)", committed: "MUV / SUV (Maruti Ertiga)" },
                            { id: "innova", label: "Toyota Innova", committed: "Toyota Innova (7 Seater)" },
                            { id: "innova-crysta", label: "Innova Crysta", committed: "Toyota Innova Crysta (VIP)" },
                            { id: "premium-sedan", label: "Honda City (Premium)", committed: "Premium Sedan (Honda City)" },
                          ].map((car) => {
                            const isSel = selectedFleetId === car.id || customVehicleType.toLowerCase().includes(car.id);
                            return (
                              <button
                                key={car.id}
                                type="button"
                                onClick={() => {
                                  setSelectedFleetId(car.id);
                                  setCustomVehicleType(car.committed);
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                                  isSel
                                    ? "bg-[#00c58e] text-white border-[#00c58e] shadow-md shadow-[#00c58e]/30 scale-105"
                                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                                }`}
                              >
                                {car.label}
                              </button>
                            );
                          })}
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

                      {/* Quick Vehicle Model Commitment for Fixed Fare */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/10">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-[#00c58e]" /> Allocated Vehicle:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            { id: "sedan", label: "Swift Dzire (Sedan)", committed: "Sedan (Swift Dzire)" },
                            { id: "hatchback", label: "Hatchback (WagonR)", committed: "Hatchback (Wagon R / Swift)" },
                            { id: "suv", label: "Ertiga (SUV/MUV)", committed: "MUV / SUV (Maruti Ertiga)" },
                            { id: "innova", label: "Toyota Innova", committed: "Toyota Innova (7 Seater)" },
                            { id: "innova-crysta", label: "Innova Crysta", committed: "Toyota Innova Crysta (VIP)" },
                            { id: "premium-sedan", label: "Honda City (Premium)", committed: "Premium Sedan (Honda City)" },
                          ].map((car) => {
                            const isSel = selectedFleetId === car.id || customVehicleType.toLowerCase().includes(car.id);
                            return (
                              <button
                                key={car.id}
                                type="button"
                                onClick={() => {
                                  setSelectedFleetId(car.id);
                                  setCustomVehicleType(car.committed);
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                                  isSel
                                    ? "bg-[#00c58e] text-white border-[#00c58e] shadow-md shadow-[#00c58e]/30 scale-105"
                                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                                }`}
                              >
                                {car.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Luggage Carrier and Toll Options Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    {/* Toll / Parking Button Toggle */}
                    <div className="flex items-center justify-between p-2.5 bg-[#0b1329]/80 rounded-xl border border-white/10 text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        🛣️ Toll &amp; Parking:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTollOption("INCLUDED")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            tollOption === "INCLUDED"
                              ? "bg-emerald-600 text-white font-black shadow-sm ring-1 ring-emerald-400"
                              : "bg-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          ✓ Toll Included
                        </button>
                        <button
                          type="button"
                          onClick={() => setTollOption("EXCLUDED")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            tollOption === "EXCLUDED"
                              ? "bg-rose-600 text-white font-black shadow-sm ring-1 ring-rose-400"
                              : "bg-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          ✕ Toll Excluded
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

                    {/* Selected Distance Pill */}
                    <div className="md:col-span-12 flex flex-wrap items-center justify-between text-xs text-slate-300 bg-[#111c3a]/70 px-3.5 py-2 rounded-xl border border-white/10 gap-2">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[#00c58e]" />
                        <span>Selected Distance: <strong className="text-white font-extrabold">{cabOneWayKm} km</strong></span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({cabOneWayKm <= 145 ? "Standard base covers up to 145 km" : `${cabOneWayKm - 145} extra km beyond 145 km base`})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-bold">Quick Select:</span>
                        {[100, 145, 200, 300].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => { setCabOneWayKm(k); setIsCustomKm(false); }}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-bold border transition cursor-pointer ${
                              cabOneWayKm === k && !isCustomKm ? "bg-[#00c58e] text-white border-[#00c58e]" : "bg-white/5 border-white/15 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {k} km
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ROUND TRIP (Matching Image 1: Outbound & Return Leg Cards with Popular Destinations) */}
                {cabTripType === "ROUND TRIP" && (
                  <div className="space-y-4">
                    {/* Header Bar matching Image 1 */}
                    <div className="flex items-center justify-between pb-1 border-b border-white/10 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider">
                          ROUND TRIP
                        </span>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          ORIGIN ⇄ DESTINATION
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-2.5 flex-wrap">
                        <span>
                          🚗 <strong>Outbound:</strong> {cabDate || "Not set"}
                        </span>
                        <span>
                          🔄 <strong>Return:</strong> {cabReturnDate || "Not set"}
                        </span>
                        <span className="bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-emerald-300 font-bold flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-[#00c58e]" /> {cabRoundTripKm} km 2-Way
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

                {/* MULTI CITY (Multi-destination outstation route with customizable legs) */}
                {cabTripType === "MULTI CITY" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider">
                          MULTI CITY OUTSTATION
                        </span>
                        <span className="text-xs text-slate-300 font-bold">
                          {multiCityStops.length} DESTINATION LEGS
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-emerald-300 font-bold flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-[#00c58e]" /> Total Km: {cabMultiCityKm} km
                        </span>
                        <button
                          type="button"
                          onClick={addMultiCityStop}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Leg
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {multiCityStops.map((leg, idx) => (
                        <div
                          key={leg.id || idx}
                          className="bg-[#0e1730]/80 border-2 border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              Leg {idx + 1}: {leg.from || "From"} ➔ {leg.to || "To"}
                            </span>

                            {multiCityStops.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeMultiCityStop(idx)}
                                className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-500/20 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                                title="Remove this leg"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-4 space-y-1">
                              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                                From City *
                              </label>
                              <LocationSearchInput
                                value={leg.from}
                                onChange={(val) => updateMultiCityStop(idx, "from", val)}
                                placeholder="Enter Pickup City"
                                dark={true}
                              />
                            </div>

                            <div className="md:col-span-4 space-y-1">
                              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                                To City *
                              </label>
                              <LocationSearchInput
                                value={leg.to}
                                onChange={(val) => updateMultiCityStop(idx, "to", val)}
                                placeholder="Enter Destination City"
                                dark={true}
                              />
                            </div>

                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                                Date *
                              </label>
                              <input
                                type="date"
                                min={today}
                                value={leg.date}
                                onChange={(e) => updateMultiCityStop(idx, "date", e.target.value)}
                                className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-2.5 py-2.5 rounded-xl text-xs font-bold text-white outline-none [color-scheme:dark]"
                              />
                            </div>

                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                                Time *
                              </label>
                              <input
                                type="time"
                                value={leg.time || getRealCurrentTime()}
                                onChange={(e) => updateMultiCityStop(idx, "time", e.target.value)}
                                className="w-full bg-[#111c3a]/90 hover:bg-[#16244a] focus:bg-[#1a2c5a] border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 px-2.5 py-2.5 rounded-xl text-xs font-bold text-white outline-none [color-scheme:dark]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Action: Add Return to Origin Leg */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={addMultiCityStop}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Another Destination Leg
                      </button>

                      {multiCityStops.length > 0 &&
                        multiCityStops[multiCityStops.length - 1]?.to?.trim().toLowerCase() !==
                          multiCityStops[0]?.from?.trim().toLowerCase() && (
                          <button
                            type="button"
                            onClick={() => {
                              const lastTo = multiCityStops[multiCityStops.length - 1]?.to || "Destination";
                              const firstFrom = multiCityStops[0]?.from || "Bangalore";
                              setMultiCityStops([
                                ...multiCityStops,
                                {
                                  id: String(Date.now()),
                                  from: lastTo,
                                  to: firstFrom,
                                  date: multiCityStops[multiCityStops.length - 1]?.date || cabDate,
                                  time: "18:00",
                                },
                              ]);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            🔄 Add Return to {multiCityStops[0]?.from || "Origin"}
                          </button>
                        )}
                    </div>
                  </div>
                )}

                {/* LOCAL & HOURLY PACKAGE (50/50 Pickup and Drop Location with Multi-Stop Via Areas) */}
                {(cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider">
                          {cabTripType === "HOURLY PACKAGE" ? "HOURLY RENTAL PACKAGE" : "LOCAL CITY USE"}
                        </span>
                        <span className="text-xs text-slate-300 font-bold">
                          {localPackage === "4hr_40km" ? "4 Hrs / 40 Kms" : localPackage === "8hr_80km" ? "8 Hrs / 80 Kms" : "12 Hrs / 120 Kms"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={addLocalViaStop}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 text-emerald-400 text-xs font-bold rounded-lg border border-white/15 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Via Stop / Local Area
                        </button>
                        <button
                          type="button"
                          onClick={() => setCabTripType("MULTI CITY")}
                          className="text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
                        >
                          Need Multi-City Outstation? ➔
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
                      <div className="md:col-span-6 flex items-end gap-2">
                        <div className="flex-1 min-w-0 space-y-1">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                            PICKUP LOCATION / AREA *
                          </label>
                          <LocationSearchInput
                            value={cabFrom}
                            onChange={setCabFrom}
                            placeholder="Enter Pickup Location / Area"
                            dark={true}
                          />
                        </div>

                        <div className="flex-shrink-0 pb-1">
                          <button
                            type="button"
                            onClick={swapLocations}
                            className="w-9 h-9 rounded-full bg-[#111c3a] border border-white/20 hover:border-[#00c58e] hover:bg-[#16254c] flex items-center justify-center text-slate-300 transition-all shadow-md hover:scale-105 cursor-pointer"
                            title="Swap Pickup & Drop Locations"
                          >
                            <ArrowLeftRight className="w-4 h-4 text-[#00c58e]" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                            DROP LOCATION / AREA *
                          </label>
                          <LocationSearchInput
                            value={cabTo}
                            onChange={setCabTo}
                            placeholder="Enter Drop Location / Area"
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

                    {/* Multi-Stop / Via Locations inside Local Use */}
                    <div className="bg-[#0b1329]/70 border border-white/10 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#00c58e]" /> Local Multi-Stop / Via Locations
                          </span>
                          <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                            Add multiple stops/areas within local city use
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={addLocalViaStop}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Stop / Area
                        </button>
                      </div>

                      {localViaStops.length > 0 ? (
                        <div className="space-y-2 pt-1">
                          {localViaStops.map((stop, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <LocationSearchInput
                                  value={stop}
                                  onChange={(val) => updateLocalViaStop(idx, val)}
                                  placeholder={`Enter Via Location / Area ${idx + 1} (e.g. MG Road, Indiranagar, Whitefield)`}
                                  dark={true}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLocalViaStop(idx)}
                                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                                title="Remove stop"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic bg-white/5 p-2.5 rounded-lg border border-dashed border-white/10 flex items-center justify-between">
                          <span>No extra via stops added yet. Click &quot;Add Stop / Area&quot; to add intermediate visiting points in the city.</span>
                          <button
                            type="button"
                            onClick={addLocalViaStop}
                            className="text-emerald-400 font-bold hover:underline ml-2"
                          >
                            + Add First Stop
                          </button>
                        </div>
                      )}
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
                      <span className={`flex items-center gap-1 font-bold ${tollOption === "INCLUDED" ? "text-emerald-300" : "text-rose-400"}`}>
                        {tollOption === "INCLUDED" ? "🛡️ Toll & Parking: INCLUDED" : "⚠️ Toll & Parking: EXCLUDED"}
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
                      ₹{calculatedFare.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-slate-300 font-bold mt-1 flex items-center gap-2">
                      <span className="text-emerald-400">Advance: ₹{advanceAmount.toLocaleString("en-IN")}</span>
                      <span>|</span>
                      <span className="text-amber-300">Balance: ₹{remainingBalance.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* DUAL ACTION BUTTONS: PROCEED TO FLEET SELECTION (STEP 2) OR FAST-TRACK */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleGoToFleetSelection}
                    className="w-full sm:w-auto bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-8 py-3.5 rounded-2xl uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Car className="w-4 h-4" />
                    PROCEED TO SELECT VEHICLE FLEET & FARE (STEP 2) <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
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
                    className="w-full sm:w-auto text-xs font-bold text-slate-300 hover:text-white px-5 py-3 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Fast-Track to Passenger Details (Step 3) →
                  </button>
                </div>
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
                    onCompleteBooking={handleGoToTicketPayment}
                    isSubmitting={isSubmitting}
                  />
                )}
                {serviceType === "BUS" && (
                  <BusBookingForm
                    formData={otherFormData}
                    onChange={onOtherChange}
                    errors={errors}
                    onCompleteBooking={handleGoToTicketPayment}
                    isSubmitting={isSubmitting}
                  />
                )}
                {serviceType === "FLIGHT" && (
                  <FlightBookingForm
                    formData={otherFormData}
                    onChange={onOtherChange}
                    errors={errors}
                    onCompleteBooking={handleGoToTicketPayment}
                    isSubmitting={isSubmitting}
                  />
                )}
                {serviceType === "TOUR" && (
                  <TourBookingForm
                    formData={otherFormData}
                    onChange={onOtherChange}
                    errors={errors}
                    onFareCalculated={() => {}}
                    onCompleteBooking={handleGoToTicketPayment}
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

              {/* Active Selected Vehicle Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00c58e]/20 border border-[#00c58e]/40 flex items-center justify-center text-[#00c58e]">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Currently Selected Vehicle
                    </div>
                    <div className="text-base font-extrabold text-white flex items-center gap-2">
                      {selectedFleet.name}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {selectedFleet.seats} Seater AC
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Total Estimated Fare
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#00c58e]">
                      ₹{calculatedFare.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoToPassengerDetails}
                    className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-5 py-2.5 rounded-xl uppercase tracking-wider text-xs shadow-lg shadow-[#00c58e]/30 transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    Continue →
                  </button>
                </div>
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
                                  ? `Onward: ₹${fleet.basePriceOneWay.toLocaleString()} + Return: ₹${(price - fleet.basePriceOneWay).toLocaleString()} · Ret: ${cabReturnDateFormatted}`
                                  : `2-Way Base ₹${fleet.basePriceRoundTrip.toLocaleString()} (${fleet.includedKms * 2} km) + ${cabRoundTripKm - fleet.includedKms * 2} extra km @ ₹${fleet.postLimitRate}/km · Ret: ${cabReturnDateFormatted}`}
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
                  onClick={() => setStep(serviceType === "CAB" ? 3 : 1)}
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
                    <span className="font-black text-[#00c58e] text-lg sm:text-xl">₹{displayTotalFare.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-400 font-semibold">Route &amp; Journey:</div>
                    <div className="text-white font-bold">
                      {serviceType === "CAB" && cabTripType === "ROUND TRIP"
                        ? `${cabFrom} ➔ ${cabTo} ➔ ${cabReturnTo || cabFrom} (Round Trip)`
                        : `${fromLocationDisplay} → ${toLocationDisplay}`}
                    </div>
                    <div className="text-slate-300 text-[11px] space-y-0.5 pt-0.5">
                      {serviceType === "CAB" && cabTripType === "MULTI CITY" ? (
                        <>
                          {multiCityStops.map((leg, lIdx) => (
                            <div key={lIdx}>
                              🚗 <strong>Leg {lIdx + 1}:</strong> {leg.from} → {leg.to} on {leg.date} ({formatTime12Hour(leg.time)})
                            </div>
                          ))}
                        </>
                      ) : serviceType === "CAB" && cabTripType === "ROUND TRIP" ? (
                        <>
                          <div>🛫 <strong>Leg 1 (Onward):</strong> {cabFrom} → {cabTo} on {departureDateFormatted} at {formatTime12Hour(cabTime)}</div>
                          <div>🛬 <strong>Leg 2 (Return):</strong> {cabReturnFrom || cabTo} → {cabReturnTo || cabFrom} on {cabReturnDateFormatted} at {formatTime12Hour(cabReturnTime)}</div>
                        </>
                      ) : (
                        <div>Departure: {departureDateFormatted} ({formatTime12Hour(effectiveDepartureTime)})</div>
                      )}
                      {serviceType === "CAB" && (cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") && localViaStops.filter((s) => s && s.trim()).length > 0 && (
                        <div className="text-emerald-300">
                          📍 <strong>Via Stops:</strong> {localViaStops.filter((s) => s && s.trim()).join(" ➔ ")}
                        </div>
                      )}
                      {serviceType === "TRAIN" && (
                        <div>Train: <strong>{otherFormData.preferred_train || otherFormData.train_number || "Express"}</strong> | Class: <strong>{otherFormData.travel_class || "3A"}</strong> | Quota: <strong>{otherFormData.quota || "General"}</strong></div>
                      )}
                      {serviceType === "BUS" && (
                        <div>Bus: <strong>{otherFormData.bus_type || "AC Sleeper"}</strong> | Boarding: <strong>{otherFormData.boarding_point || fromLocationDisplay}</strong></div>
                      )}
                      {serviceType === "FLIGHT" && (
                        <div>Flight: <strong>{otherFormData.flight_trip_type || "One Way"}</strong> | Cabin: <strong>{otherFormData.cabin_class || "Economy"}</strong></div>
                      )}
                      {serviceType === "TOUR" && (
                        <div>Tour: <strong>{otherFormData.package_title || "South India Tour"}</strong></div>
                      )}
                    </div>
                    {serviceType === "CAB" && cabTripType === "MULTI CITY" && (
                      <span className="inline-block mt-1 bg-[#00c58e]/20 text-[#00c58e] border border-[#00c58e]/30 px-2 py-0.5 rounded font-bold text-[10px]">
                        🏙️ Multi-City Outstation ({cabMultiCityKm} km journey)
                      </span>
                    )}
                    {serviceType === "CAB" && cabTripType === "ROUND TRIP" && (
                      <span className="inline-block mt-1 bg-[#00c58e]/20 text-[#00c58e] border border-[#00c58e]/30 px-2 py-0.5 rounded font-bold text-[10px]">
                        🔄 2-Way Round Trip ({selectedFleet.includedKms * 2} km included)
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <div className="text-slate-400 font-semibold">Fare Components Breakdown:</div>
                    <div className="text-slate-300 text-[11px] space-y-0.5">
                      {serviceType === "CAB" ? (
                        <>
                          <div>Base Fare: <strong className="text-white">₹{Math.max(0, calculatedFare - 350 - Math.round(calculatedFare * 0.05)).toLocaleString("en-IN")}</strong></div>
                          <div>Driver Allowance: <strong className="text-emerald-400">Included (₹350)</strong></div>
                          <div>Taxes &amp; GST: <strong className="text-emerald-400">Included (5% GST)</strong></div>
                          <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{calculatedFare.toLocaleString("en-IN")}</strong></div>
                        </>
                      ) : serviceType === "TRAIN" ? (
                        <>
                          <div>Ticket Fare: <strong className="text-white">₹{displayTotalFare.toLocaleString("en-IN")}</strong></div>
                          <div>IRCTC &amp; Reservation Charges: <strong className="text-emerald-400">Included</strong></div>
                          <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{displayTotalFare.toLocaleString("en-IN")}</strong></div>
                        </>
                      ) : serviceType === "BUS" ? (
                        <>
                          <div>Seat Fare: <strong className="text-white">₹{displayTotalFare.toLocaleString("en-IN")}</strong></div>
                          <div>Toll &amp; Operator Charges: <strong className="text-emerald-400">Included</strong></div>
                          <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{displayTotalFare.toLocaleString("en-IN")}</strong></div>
                        </>
                      ) : serviceType === "FLIGHT" ? (
                        <>
                          <div>Airfare: <strong className="text-white">₹{displayTotalFare.toLocaleString("en-IN")}</strong></div>
                          <div>Fuel &amp; Airline Charges: <strong className="text-emerald-400">Included</strong></div>
                          <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{displayTotalFare.toLocaleString("en-IN")}</strong></div>
                        </>
                      ) : (
                        <>
                          <div>Package Fare: <strong className="text-white">₹{displayTotalFare.toLocaleString("en-IN")}</strong></div>
                          <div>Sightseeing, Hotel &amp; Transport: <strong className="text-emerald-400">Included</strong></div>
                          <div>Total All-Inclusive: <strong className="text-[#00c58e] font-black">₹{displayTotalFare.toLocaleString("en-IN")}</strong></div>
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
                    value={otherFormData.fare_amount || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOtherFormData((prev: any) => ({ ...prev, fare_amount: val }));
                      if (paymentChoice === "full") {
                        setAdvanceOption(Number(val) || 0);
                      }
                    }}
                    placeholder={String(displayTotalFare)}
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
                  {/* 1. Advance Payment (Custom Amount & Auto-Calculated Balance) */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentChoice("advance");
                      if (advanceAmount <= 0) setAdvanceAmount(500);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentChoice === "advance"
                        ? "bg-[#162544]/95 border-[#00c58e] ring-2 ring-[#00c58e]/30 shadow-xl shadow-black/40"
                        : "bg-[#111c3a]/80 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-white text-sm sm:text-base">⚡ Advance Payment</span>
                      <span className="bg-[#00c58e] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                        CUSTOM ADVANCE
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Pay custom advance (₹{advanceAmount.toLocaleString("en-IN")}). Balance ₹{remainingBalance.toLocaleString("en-IN")} due on boarding.
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
                      {serviceType === "CAB" && "Pay full amount directly upon boarding."}
                      {serviceType === "TRAIN" && "Pay full amount directly upon boarding / journey date."}
                      {serviceType === "BUS" && "Pay full amount directly upon boarding."}
                      {serviceType === "FLIGHT" && "Pay full amount upon ticket issuance / travel date."}
                      {serviceType === "TOUR" && "Pay full amount upon tour start date."}
                    </p>
                  </button>
                </div>

                {/* OPTION 1: ADVANCE PAYMENT DETAILS & QR */}
                {paymentChoice === "advance" && (
                  <div className="bg-[#111c3a]/95 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl shadow-emerald-950/20">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-bold text-sm shadow">
                          पे
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-sm">
                            Advance Payment &amp; Auto Balance Calculation
                          </h3>
                          <p className="text-[11px] text-emerald-200">
                            Enter custom advance amount — balance is automatically computed in real time.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        Advance: ₹{advanceAmount.toLocaleString("en-IN")} | Bal: ₹{remainingBalance.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Manual Advance Amount Input & Quick Preset Buttons */}
                    <div className="p-4 bg-[#0a1228] border border-white/10 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <label className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                            Enter Advance Amount (₹)
                          </label>
                          <p className="text-[11px] text-slate-400">
                            Type any custom amount or click the quick presets below
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-white font-black text-lg">₹</span>
                          <input
                            type="number"
                            min={0}
                            max={displayTotalFare}
                            value={advanceAmount || ""}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value) || 0);
                              setAdvanceAmount(val);
                            }}
                            placeholder="500"
                            className="w-36 bg-[#0B132B] border-2 border-emerald-500/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 text-white font-black text-base px-3 py-1.5 rounded-xl outline-none"
                          />
                        </div>
                      </div>

                      {/* Quick Preset Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Presets:</span>
                        {[200, 500, 1000, 1500, 2000, 2500].filter(amt => amt < displayTotalFare).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAdvanceAmount(preset)}
                            className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                              advanceAmount === preset
                                ? "bg-emerald-600 border-emerald-400 text-white font-black shadow-xs"
                                : "bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            ₹{preset.toLocaleString("en-IN")}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setAdvanceAmount(displayTotalFare)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                            advanceAmount === displayTotalFare
                              ? "bg-amber-500 border-amber-300 text-slate-950 font-black shadow-xs"
                              : "bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20"
                          }`}
                        >
                          Full Paid (₹{displayTotalFare.toLocaleString("en-IN")})
                        </button>
                      </div>

                      {/* Real-time Balance Box */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-[#070e20] rounded-xl border border-emerald-500/30 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Fare</div>
                          <div className="text-base font-black text-white">₹{displayTotalFare.toLocaleString("en-IN")}</div>
                        </div>
                        <div className="border-x border-white/10">
                          <div className="text-[10px] text-emerald-400 font-bold uppercase">Advance Paid</div>
                          <div className="text-base font-black text-emerald-400">₹{advanceAmount.toLocaleString("en-IN")}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-amber-400 font-bold uppercase">Remaining Balance</div>
                          <div className={`text-base font-black ${remainingBalance === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                            ₹{remainingBalance.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      {remainingBalance === 0 && (
                        <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          100% Full Payment Settled — Zero Remaining Balance
                        </div>
                      )}
                    </div>

                    {/* PhonePe QR Card and Fast Pay Links */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
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
                            Fast Pay ₹{advanceAmount.toLocaleString("en-IN")} Advance With UPI App
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { name: "PhonePe", link: `phonepe://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${advanceAmount}&cu=INR`, color: "bg-[#5f259f] text-white hover:bg-purple-800 border-purple-400/30" },
                              { name: "Google Pay", link: `tez://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${advanceAmount}&cu=INR`, color: "bg-blue-600 text-white hover:bg-blue-700 border-blue-400/30" },
                              { name: "Paytm", link: `paytmmp://upi/pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${advanceAmount}&cu=INR`, color: "bg-sky-600 text-white hover:bg-sky-700 border-sky-400/30" },
                              { name: "Any UPI App", link: `upi://pay?pa=fortunetourism@okaxis&pn=Zameer%20S%20Fortune%20Tourism&am=${advanceAmount}&cu=INR&tn=Advance%20Booking%20Fortune%20Tourism`, color: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-400/30" },
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
                              value={otherFormData.fare_amount || displayTotalFare}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOtherFormData((prev: any) => ({ ...prev, fare_amount: val }));
                                setAdvanceOption(Number(val) || 0);
                              }}
                              placeholder={String(displayTotalFare)}
                              className="w-full bg-[#0B132B] border border-amber-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/40 rounded-xl pl-8 pr-4 py-2.5 text-base font-black text-amber-300 placeholder:text-slate-500 outline-none"
                            />
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Enter the exact manual amount collected for this booking. This exact amount will be displayed on the generated ticket, confirmation voucher, and all accounting reports.
                          </p>
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
                  onClick={() => setStep(serviceType === "CAB" ? 3 : 1)}
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#00c58e]" /> Back to Passenger Details
                </button>

                <button
                  type="button"
                  onClick={serviceType === "CAB" ? handleConfirmAndGenerateTicket : handleCompleteTicketBooking}
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
                      <CheckCircle2 className="w-4 h-4" /> CONFIRM BOOKING &amp; GENERATE TICKET COPY
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
                      `Hello Fortune Tourism! I have booked my cab.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Passenger:* ${passengerName || "GUEST"}\n*Phone:* ${passengerPhone || "9964600247"}\n*From:* ${fromLocationDisplay}\n*To:* ${toLocationDisplay}\n*Date:* ${departureDateFormatted} (${formatTime12Hour(effectiveDepartureTime)})\n*Vehicle:* ${vehicleDisplay}\n\nPlease confirm driver assignment.`
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
                          {otherFormData.phone || passengerPhone || "9964600247"}
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

                      {/* Multi-City Route Legs Details */}
                      {cabTripType === "MULTI CITY" && (
                        <tr className="border-b border-slate-900 bg-slate-50">
                          <td colSpan={6} className="p-2.5">
                            <div className="font-black text-slate-950 uppercase text-[11px] mb-1.5 flex items-center justify-between">
                              <span>Multi-City Route Legs ({multiCityStops.length} Stops / Destinations):</span>
                              <span className="text-emerald-700 font-extrabold">{cabMultiCityKm} Km Total Journey</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {multiCityStops.map((leg, lIdx) => (
                                <div key={lIdx} className="bg-white border border-slate-400 rounded-lg p-2 text-[11px]">
                                  <div className="font-extrabold text-slate-900">
                                    Leg {lIdx + 1}: <span className="text-emerald-700">{leg.from}</span> ➔ <span className="text-blue-700">{leg.to}</span>
                                  </div>
                                  <div className="text-slate-600 text-[10px]">
                                    Date: <strong>{leg.date}</strong> | Time: <strong>{formatTime12Hour(leg.time)}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Local Multi-Stop Visiting Areas */}
                      {(cabTripType === "LOCAL" || cabTripType === "HOURLY PACKAGE") &&
                        localViaStops.filter((s) => s && s.trim()).length > 0 && (
                          <tr className="border-b border-slate-900 bg-slate-50">
                            <td colSpan={6} className="p-2.5">
                              <span className="font-bold text-slate-900">Local Multi-Stop Visiting Areas: </span>
                              <strong className="text-slate-950">
                                {localViaStops.filter((s) => s && s.trim()).join(" ➔ ")}
                              </strong>
                            </td>
                          </tr>
                        )}

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
                              <div>Onward: <strong>{departureDateFormatted} ({formatTime12Hour(cabTime)})</strong></div>
                              <div className="text-emerald-800 font-black">Return: <strong>{cabReturnDateFormatted} ({formatTime12Hour(cabReturnTime)})</strong></div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{departureDateFormatted}</span>
                              <span className="text-slate-600 font-semibold text-xs">({formatTime12Hour(effectiveDepartureTime)})</span>
                            </div>
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
                          {cabTripType === "MULTI CITY"
                            ? `MULTI CITY (${cabMultiCityKm} KM · ${multiCityStops.length} LEGS)`
                            : cabTripType === "ROUND TRIP"
                            ? `ROUND TRIP (2-WAY · ${cabRoundTripKm} KM)`
                            : cabTripType === "ONE WAY"
                            ? `ONE WAY (${cabOneWayKm} KM)`
                            : cabTripType === "HOURLY PACKAGE"
                            ? `HOURLY PACKAGE (${localPackage === "4hr_40km" ? "4 HRS / 40 KM" : localPackage === "8hr_80km" ? "8 HRS / 80 KM" : "12 HRS / 120 KM"})`
                            : cabTripType}
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
                          {serviceType === "CAB" ? (
                            <div className="space-y-1.5">
                              {/* Print View: Clean Formal Uppercase Vehicle Name */}
                              <div className="hidden print:block print-only font-black text-slate-950 uppercase text-xs">
                                {vehicleDisplay}
                              </div>
                              {/* Screen View: Interactive Vehicle Commit / Customization */}
                              <div className="no-print print-hidden print:hidden space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={customVehicleType}
                                    onChange={(e) => setCustomVehicleType(e.target.value)}
                                    className="w-full bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white border border-emerald-600/40 focus:border-emerald-700 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-black text-slate-950 outline-none uppercase shadow-2xs transition"
                                    placeholder="e.g. SEDAN (SWIFT DZIRE)"
                                    title="Click to prepare and commit exact vehicle model"
                                  />
                                </div>
                                <div className="flex items-center gap-1 flex-wrap text-[10px]">
                                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                                    Commit Car:
                                  </span>
                                  {[
                                    "Sedan (Swift Dzire)",
                                    "Swift Dzire",
                                    "Sedan (Etios/Dzire)",
                                    "Hatchback (WagonR)",
                                    "MUV (Ertiga)",
                                    "Toyota Innova",
                                    "Innova Crysta",
                                    "Premium Sedan (Honda City)",
                                  ].map((carOption) => (
                                    <button
                                      key={carOption}
                                      type="button"
                                      onClick={() => {
                                        setCustomVehicleType(carOption);
                                        if (carOption.toLowerCase().includes("honda city") || carOption.toLowerCase().includes("premium")) {
                                          setSelectedFleetId("premium-sedan");
                                        } else if (carOption.toLowerCase().includes("dzire") || carOption.toLowerCase().includes("sedan") || carOption.toLowerCase().includes("etios")) {
                                          setSelectedFleetId("sedan");
                                        } else if (carOption.toLowerCase().includes("hatchback") || carOption.toLowerCase().includes("wagon")) {
                                          setSelectedFleetId("hatchback");
                                        } else if (carOption.toLowerCase().includes("ertiga")) {
                                          setSelectedFleetId("suv");
                                        } else if (carOption.toLowerCase().includes("crysta")) {
                                          setSelectedFleetId("innova-crysta");
                                        } else if (carOption.toLowerCase().includes("innova")) {
                                          setSelectedFleetId("innova");
                                        }
                                      }}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border transition cursor-pointer ${
                                        customVehicleType.toLowerCase() === carOption.toLowerCase()
                                          ? "bg-emerald-800 text-white border-emerald-900 shadow-2xs"
                                          : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                                      }`}
                                    >
                                      {carOption.split("(")[0].trim() || carOption}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span>{vehicleDisplay}</span>
                          )}
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
                              value={otherFormData.fare_amount || displayTotalFare}
                              onChange={(e) => {
                                setOtherFormData((prev: any) => ({ ...prev, fare_amount: e.target.value }));
                                try {
                                  window.dispatchEvent(new Event("fortune_booking_created"));
                                } catch {}
                              }}
                              className="w-28 bg-transparent border-b border-dashed border-slate-400 hover:border-slate-800 focus:border-emerald-600 focus:bg-emerald-50/40 px-1 py-0.5 text-xs sm:text-sm font-black text-emerald-800 outline-none transition"
                              title="Click to edit journey fare amount on ticket copy"
                            />
                          </div>
                          {cabTripType === "ROUND TRIP" && (
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                              Onward: ₹{Math.round((Number(otherFormData.fare_amount || displayTotalFare)) / 2).toLocaleString("en-IN")} + Return: ₹{Math.round((Number(otherFormData.fare_amount || displayTotalFare)) / 2).toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Row 5: Total Fare Amount | Payment Status | Toll / Parking */}
                      <tr className="divide-x divide-slate-900 bg-emerald-50/50">
                        <td className="p-2.5 font-black text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                          Total Fare Amount:
                        </td>
                        <td className="p-2.5 font-black text-emerald-800 text-sm sm:text-base">
                          ₹{Number(displayTotalFare || 0).toLocaleString("en-IN")}
                          {cabTripType === "ROUND TRIP" && (
                            <div className="text-[10px] font-bold text-emerald-700">
                              (2-Way Return · {cabRoundTripKm} Km)
                            </div>
                          )}
                          {cabTripType === "ONE WAY" && (
                            <div className="text-[10px] font-bold text-emerald-700">
                              ({cabOneWayKm} Km Journey)
                            </div>
                          )}
                          {(cabTripType === "HOURLY PACKAGE" || cabTripType === "LOCAL") && (
                            <div className="text-[10px] font-bold text-emerald-700">
                              ({localPackage === "4hr_40km" ? "4 Hrs / 40 Kms" : localPackage === "8hr_80km" ? "8 Hrs / 80 Kms" : "12 Hrs / 120 Kms"})
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                          Payment Status:
                        </td>
                        <td className="p-2.5 font-black text-emerald-700 uppercase">
                          {paymentStatusText}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                          Toll / Parking:
                        </td>
                        <td className={`p-2.5 font-black uppercase ${tollOption === "INCLUDED" ? "text-emerald-700" : "text-rose-600"}`}>
                          {tollOption === "INCLUDED" ? "✓ TOLL INCLUDED" : "✕ TOLL EXCLUDED"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Multi-Passenger Manifest & Berth Allocation Table */}
                {bookingPassengersList && bookingPassengersList.length > 0 && (
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-white shadow-xs">
                    <div className="bg-[#0B132B] text-white px-3 py-1.5 flex items-center justify-between border-b border-slate-900">
                      <span className="font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-400" />
                        Passenger Manifest &amp; Berth Allocation ({bookingPassengersList.length} {bookingPassengersList.length === 1 ? "Passenger" : "Passengers"})
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
                        {bookingPassengersList.map((p: any, idx: number) => (
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
