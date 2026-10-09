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
  Download,
  Printer,
  MessageCircle,
  CheckCircle2,
  Clock,
  Phone,
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

  // Step: "JOURNEY" | "PASSENGERS" | "CONFIRMED"
  const [step, setStep] = useState<"JOURNEY" | "PASSENGERS" | "CONFIRMED">("JOURNEY");

  // Train Journey Form Data
  const [trainData, setTrainData] = useState({
    from_station: "",
    to_station: "",
    date: () => new Date().toISOString().split("T")[0],
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
    date: () => new Date().toISOString().split("T")[0],
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

  const primaryPassengerName = useMemo(() => {
    if (serviceType === "TRAIN") {
      return passengers[0]?.name?.trim() || "GUEST";
    }
    return otherFormData.passengers?.[0]?.name?.trim() || otherFormData.name || "GUEST";
  }, [serviceType, passengers, otherFormData]);

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
    return otherFormData.from_airport || otherFormData.from_location || otherFormData.pickup || "BANGALORE";
  }, [serviceType, trainData.from_station, otherFormData.from_location, otherFormData.from_airport, otherFormData.pickup]);

  const toLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return trainData.to_station || "CHENNAI";
    if (serviceType === "BUS") return otherFormData.destination || "CHENNAI";
    return otherFormData.destination || otherFormData.to_airport || otherFormData.to_destination || otherFormData.to_location || "DELHI";
  }, [serviceType, trainData.to_station, otherFormData.destination, otherFormData.to_airport, otherFormData.to_destination, otherFormData.to_location]);

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

  // Step 2 Submit Train Booking
  const handleCompleteTrainBooking = async () => {
    const firstP = passengers[0];
    if (!firstP || !firstP.name.trim()) {
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

    setIsSubmitting(true);
    try {
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
        boarding_point: trainData.boarding_point.trim(),
        boarding_address: trainData.boarding_address.trim(),
        notes: [
          `Offline Admin Train Booking`,
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          `Train: ${trainData.preferred_train || "Any"} | No: ${trainData.train_number || "N/A"} | Class: ${trainData.travel_class} | Quota: ${trainData.quota}`,
          `Total Fare: ₹${ticketFareAmount}`,
          `Passengers: ${passengers.map((p, i) => `P${i + 1}: ${p.name} (${p.age}y/${p.gender})`).join(", ")}`,
        ]
          .filter(Boolean)
          .join(" | "),
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

  // Submit other services (Bus, Flight)
  const handleCompleteOtherServiceBooking = async () => {
    setIsSubmitting(true);
    try {
      const isBus = serviceType === "BUS";
      const pCount = otherFormData.passengers?.length || 1;
      const firstP = otherFormData.passengers?.[0]?.name || "GUEST";

      const flightFrom = otherFormData.from_airport || otherFormData.from_location || otherFormData.pickup || "BANGALORE";
      const flightTo = otherFormData.destination || otherFormData.to_airport || otherFormData.to_destination || otherFormData.to_location || "DELHI";

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
        boarding_point: otherFormData.boarding_point || "",
        boarding_address: otherFormData.boarding_address || "",
        notes: [
          `Offline Admin Ticket Booking`,
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          isBus && `Bus Type: ${otherFormData.bus_type}`,
          !isBus && `Flight: ${otherFormData.cabin_class} | Trip: ${otherFormData.flight_trip_type} | Route: ${flightFrom} → ${flightTo}`,
          `Total Fare: ₹${ticketFareAmount}`,
        ]
          .filter(Boolean)
          .join(" | "),
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
        {step !== "CONFIRMED" ? (
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
                        placeholder="Enter passenger mobile number (e.g. 9845003000 / 9876543210)"
                        value={trainData.phone}
                        onChange={(e) =>
                          setTrainData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="w-full bg-[#0b1329]/90 border border-white/15 focus:border-[#00c58e] focus:ring-2 focus:ring-[#00c58e]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none placeholder:text-slate-500 [color-scheme:dark]"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        This phone number will be recorded on the official ticket voucher and used for SMS / WhatsApp dispatch.
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
                        onClick={handleCompleteTrainBooking}
                        disabled={isSubmitting}
                        className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 sm:px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-102 active:scale-98 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                      >
                        {isSubmitting ? "Generating Ticket..." : "CONTINUE TO BOOKING →"}
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
                onCompleteBooking={handleCompleteOtherServiceBooking}
                isSubmitting={isSubmitting}
              />
            )}

            {/* BUS BOOKING FORM */}
            {serviceType === "BUS" && (
              <BusBookingForm
                formData={otherFormData}
                onChange={onOtherChange}
                errors={{}}
                onCompleteBooking={handleCompleteOtherServiceBooking}
                isSubmitting={isSubmitting}
              />
            )}
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
                          placeholder="Enter phone no."
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
                      <td className="p-2.5 font-black text-emerald-700 uppercase">
                        ₹{ticketFareAmount.toLocaleString("en-IN")}
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
    </div>
  );
}
