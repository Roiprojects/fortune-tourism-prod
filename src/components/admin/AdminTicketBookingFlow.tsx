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
} from "lucide-react";
import { generateTicketNumber, generatePNR } from "@/lib/booking-utils";
import { buildWhatsAppUrl } from "@/lib/contact";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";
import { BusBookingForm } from "@/components/booking/BusBookingForm";
import { FlightBookingForm } from "@/components/booking/FlightBookingForm";

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
    phone: "9845003000",
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
    phone: "9845003000",
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
      return trainData.phone || "9845003000";
    }
    return otherFormData.phone || "9845003000";
  }, [serviceType, trainData.phone, otherFormData.phone]);

  const tourTypeDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return `TRAIN (${trainData.travel_class})`;
    if (serviceType === "BUS") return `BUS (${otherFormData.bus_type || "AC Sleeper"})`;
    return `FLIGHT (${otherFormData.cabin_class || "Economy"})`;
  }, [serviceType, trainData.travel_class, otherFormData.bus_type, otherFormData.cabin_class]);

  const fromLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return trainData.from_station || "BANGALORE";
    if (serviceType === "BUS") return otherFormData.from_location || "BANGALORE";
    return otherFormData.from_airport || "BANGALORE";
  }, [serviceType, trainData.from_station, otherFormData.from_location, otherFormData.from_airport]);

  const toLocationDisplay = useMemo(() => {
    if (serviceType === "TRAIN") return trainData.to_station || "CHENNAI";
    if (serviceType === "BUS") return otherFormData.destination || "CHENNAI";
    return otherFormData.to_airport || "CHENNAI";
  }, [serviceType, trainData.to_station, otherFormData.destination, otherFormData.to_airport]);

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
        phone: trainData.phone || "9845003000",
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

      const payload = {
        name: firstP,
        phone: otherFormData.phone || "9845003000",
        email: "booking@fortunetourism.in",
        service: isBus ? "Bus Booking" : "Flight Booking",
        category: isBus ? "BUS" : "FLIGHT",
        booking_type: serviceType,
        pickup: isBus ? otherFormData.from_location : otherFormData.from_airport || "BANGALORE",
        destination: isBus ? otherFormData.destination : otherFormData.to_airport || "CHENNAI",
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
          !isBus && `Flight: ${otherFormData.cabin_class} | Trip: ${otherFormData.flight_trip_type}`,
        ]
          .filter(Boolean)
          .join(" | "),
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
      phone: "9845003000",
    });
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            {/* Top Header with Back to Services */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {serviceType === "TRAIN" && "Train Booking"}
                  {serviceType === "FLIGHT" && "Flight Booking"}
                  {serviceType === "BUS" && "Bus Booking"}
                </span>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer ml-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-700" /> Back to Services
              </button>
            </div>

            {/* 3 Ticket Switcher Tabs (Train Booking, Flight Booking, Bus Booking) */}
            <div className="flex justify-center pb-2">
              <div className="inline-flex rounded-xl border border-slate-300 overflow-hidden bg-slate-100 p-1 gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setServiceType("TRAIN");
                    setStep("JOURNEY");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    serviceType === "TRAIN"
                      ? "bg-[#063f2d] text-white shadow-sm font-extrabold"
                      : "text-slate-700 hover:bg-slate-200"
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
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    serviceType === "FLIGHT"
                      ? "bg-[#063f2d] text-white shadow-sm font-extrabold"
                      : "text-slate-700 hover:bg-slate-200"
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
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    serviceType === "BUS"
                      ? "bg-[#063f2d] text-white shadow-sm font-extrabold"
                      : "text-slate-700 hover:bg-slate-200"
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
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <TrainFront className="w-4 h-4 text-amber-600" /> TRAIN JOURNEY DETAILS
                    </h3>

                    {/* From Station & To Station */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          From Station *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bangalore City (SBC)"
                          value={trainData.from_station}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, from_station: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          To Station *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Chennai Central (MAS)"
                          value={trainData.to_station}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, to_station: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Journey Date, Preferred Train, Class, Quota */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-600" /> Journey Date *
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={trainData.date}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, date: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Preferred Train
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Shatabdi / Rajdhani / Any"
                          value={trainData.preferred_train}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, preferred_train: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Class *
                        </label>
                        <select
                          value={trainData.travel_class}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, travel_class: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        >
                          {CLASS_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Quota *
                        </label>
                        <select
                          value={trainData.quota}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, quota: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        >
                          {QUOTA_OPTIONS.map((q) => (
                            <option key={q.value} value={q.value}>
                              {q.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Preferred Time & Train Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Preferred Time
                        </label>
                        <input
                          type="time"
                          value={trainData.time}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, time: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Train Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 12608 / 12028 / Any"
                          value={trainData.train_number}
                          onChange={(e) =>
                            setTrainData((prev) => ({ ...prev, train_number: e.target.value }))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Continue Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleContinueToPassengers}
                        className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-8 py-3.5 rounded-xl uppercase text-sm shadow-md transition-all hover:scale-105 cursor-pointer"
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
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600" /> PASSENGER DETAILS
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">
                          Number of Passengers:
                        </label>
                        <select
                          value={passengers.length}
                          onChange={(e) => setPassengerCount(Number(e.target.value))}
                          className="bg-white border border-amber-400 rounded-xl px-3 py-1.5 text-sm font-black text-amber-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-2xs"
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Passenger Input Rows */}
                    <div className="space-y-2.5">
                      {passengers.map((p, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold text-amber-800 shrink-0 w-5">
                              {idx + 1}.
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1">
                              <div className="sm:col-span-6">
                                <input
                                  type="text"
                                  placeholder="Full Name (as per Aadhaar / ID)"
                                  value={p.name}
                                  onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
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
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <select
                                  value={p.gender}
                                  onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                >
                                  <option>Male</option>
                                  <option>Female</option>
                                  <option>Child</option>
                                </select>
                              </div>
                            </div>

                            {passengers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePassenger(idx)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                                title="Remove Passenger"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Yellow Boarding Details Box */}
                    <div className="bg-amber-50/40 border border-amber-300/80 rounded-2xl p-4 sm:p-5 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                        BOARDING DETAILS (FOR DRIVER / PICKUP)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Boarding Point *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. City Railway Station, Platform 1"
                            value={trainData.boarding_point}
                            onChange={(e) =>
                              setTrainData((prev) => ({ ...prev, boarding_point: e.target.value }))
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Full Boarding Address *
                          </label>
                          <input
                            type="text"
                            placeholder="Full address / landmark for pickup"
                            value={trainData.boarding_address}
                            onChange={(e) =>
                              setTrainData((prev) => ({ ...prev, boarding_address: e.target.value }))
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setStep("JOURNEY")}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        ← Back to Journey Details
                      </button>

                      <button
                        type="button"
                        onClick={handleCompleteTrainBooking}
                        disabled={isSubmitting}
                        className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-10 py-3.5 rounded-xl uppercase text-sm shadow-md transition-all hover:scale-105 disabled:opacity-60 cursor-pointer"
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
                </div>

                <a
                  href={buildWhatsAppUrl(
                    `Hello Fortune Tourism! New offline ${serviceType.toLowerCase()} ticket reservation confirmed.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Passenger:* ${primaryPassengerName}\n*Phone:* ${primaryPhone}\n*From:* ${fromLocationDisplay}\n*To:* ${toLocationDisplay}\n*Date:* ${departureDateFormatted}\n*Service:* ${vehicleDisplay}`
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
                      <td className="p-2.5 font-bold text-slate-900">
                        {primaryPhone}
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
                    <tr className="divide-x divide-slate-900">
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
                        Boarding point:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        {fromLocationDisplay}
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
