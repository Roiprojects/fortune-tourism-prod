import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Printer,
  MessageCircle,
  CheckCircle2,
  Package,
  Users,
  Phone,
  Trash2,
} from "lucide-react";
import { generateTicketNumber, generatePNR } from "@/lib/booking-utils";
import { buildWhatsAppUrl } from "@/lib/contact";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";
import { getRealCurrentTime, formatTime12Hour, formatDepartureDateString } from "@/lib/utils";
import { TourBookingForm } from "@/components/booking/TourBookingForm";
import { packages as defaultPackages } from "@/data/packages";
import { useTourTariffs } from "@/lib/tour-tariffs";

interface AdminTourBookingFlowProps {
  onBack: () => void;
  onBookingCompleted?: () => void;
  onOpenPackagesManagement?: () => void;
}

interface Passenger {
  name: string;
  age: string;
  gender: string;
}

export function AdminTourBookingFlow({
  onBack,
  onBookingCompleted,
  onOpenPackagesManagement,
}: AdminTourBookingFlowProps) {
  // Step: "FORM" (Package & Journey) | "PASSENGERS" (Passenger Details) | "CONFIRMED" (Official Voucher)
  const [step, setStep] = useState<"FORM" | "PASSENGERS" | "CONFIRMED">("FORM");
  const [formInitialStep, setFormInitialStep] = useState<"PACKAGE" | "JOURNEY">("PACKAGE");

  const { packagesList: packages } = useTourTariffs();

  // Tour Form State matching booking.tsx and TourBookingForm
  const [tourFormData, setTourFormData] = useState<any>({
    package_slug: packages[0]?.slug || "bengaluru-mysuru-coorg",
    package_title: packages[0]?.title || "Bengaluru → Mysuru & Coorg",
    tour_trip_type: "Round Trip",
    itinerary_places: ["Bangalore", "Destination 1", "Return to Bangalore"],
    date: new Date().toISOString().split("T")[0],
    time: getRealCurrentTime(),
    number_of_days: packages[0]?.duration.split(" ")[0] || "3",
    destination: packages[0]?.destinations.join(" → ") || "Mysuru · Coorg",
    adults: 2,
    children: 0,
    infants: 0,
    vehicle_slug: "sedan",
    hotel_tier: "Standard",
    boarding_point: "",
    boarding_address: "",
    name: "",
    phone: "",
  });

  // Dedicated passenger list matching ticket booking flows
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", age: "", gender: "Male" },
  ]);

  // Optional custom fare adjustment entered by admin
  const [customFareAmount, setCustomFareAmount] = useState<string>("");

  const [ticketNumber, setTicketNumber] = useState(() => generateTicketNumber());
  const [pnrNumber, setPnrNumber] = useState(() => generatePNR());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const onTourChange = (field: string, value: any) => {
    setTourFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Departure date formatted as DD-MM-YYYY.HH.MM
  const departureDateFormatted = useMemo(() => {
    const rawDate =
      typeof tourFormData.date === "function"
        ? tourFormData.date()
        : tourFormData.date || today;
    return formatDepartureDateString(rawDate, tourFormData.time || getRealCurrentTime());
  }, [tourFormData.date, tourFormData.time, today]);

  // Current booking date & time formatted as DD-MM-YYYY HH:MM
  const bookingDateTime = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }, []);

  const tourTitleDisplay = useMemo(() => {
    const pkg = packages.find((p) => p.slug === tourFormData.package_slug);
    return (pkg?.title || tourFormData.package_title || "South India Tour Package").toUpperCase();
  }, [tourFormData.package_slug, tourFormData.package_title, packages]);

  // Base calculated fare
  const calculatedTourFare = useMemo(() => {
    const selectedPkg = packages.find((p) => p.slug === tourFormData.package_slug);
    const base = selectedPkg?.startingPrice || 4999;
    const paxCount = Math.max(1, passengers.length || Number(tourFormData.adults || 2));
    const days = Number(tourFormData.number_of_days || 2);
    return Math.round(base * Math.max(1, paxCount / 2) * Math.max(1, days / 2));
  }, [tourFormData.package_slug, passengers.length, tourFormData.adults, tourFormData.number_of_days, packages]);

  // Effective fare with admin override
  const effectiveFareAmount = useMemo(() => {
    if (customFareAmount !== "" && !isNaN(Number(customFareAmount))) {
      return Number(customFareAmount);
    }
    return calculatedTourFare;
  }, [customFareAmount, calculatedTourFare]);

  // Primary passenger name & phone
  const primaryPassengerName = useMemo(() => {
    return (tourFormData.name?.trim() || passengers[0]?.name?.trim() || "GUEST").toUpperCase();
  }, [tourFormData.name, passengers]);

  const primaryPhone = useMemo(() => {
    return tourFormData.phone?.trim() || "";
  }, [tourFormData.phone]);

  // Transition from Step 1/2 to Passenger Details
  const handleProceedToPassengers = () => {
    const totalPax = Math.max(1, Number(tourFormData.adults || 1) + Number(tourFormData.children || 0));
    setPassengers((prev) => {
      if (prev.length === 1 && !prev[0].name && totalPax > 1) {
        return Array.from({ length: totalPax }, () => ({
          name: "",
          age: "",
          gender: "Male",
        }));
      }
      return prev;
    });
    setStep("PASSENGERS");
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handlePassengerCountChange = (count: number) => {
    setPassengers((prev) => {
      if (count > prev.length) {
        const extra = Array.from({ length: count - prev.length }, () => ({
          name: "",
          age: "",
          gender: "Male",
        }));
        return [...prev, ...extra];
      } else {
        return prev.slice(0, count);
      }
    });
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit complete Tour booking
  const handleCompleteTourBooking = async () => {
    const rawPhone = String(tourFormData.phone || "").replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      toast.error("Please enter a valid passenger mobile number (minimum 10 digits).");
      return;
    }

    const firstP = passengers[0]?.name?.trim();
    if (!firstP && !tourFormData.name?.trim()) {
      toast.error("Please enter the passenger's full name.");
      return;
    }

    const finalName = (tourFormData.name?.trim() || firstP || "GUEST").toUpperCase();

    setIsSubmitting(true);
    try {
      const selectedPkg = packages.find((p) => p.slug === tourFormData.package_slug);
      const pkgTitle = selectedPkg?.title || tourFormData.package_title || "South India Tour Package";

      const payload = {
        name: finalName,
        phone: tourFormData.phone.trim(),
        email: "booking@fortunetourism.in",
        service: "Tour Package Booking",
        category: "CAR",
        booking_type: "TOUR",
        pickup: "BANGALORE",
        destination: pkgTitle,
        date: tourFormData.date || today,
        time: tourFormData.time || getRealCurrentTime(),
        passengers: String(passengers.length),
        boarding_point: tourFormData.boarding_point?.trim() || "Bangalore Pickup",
        boarding_address: tourFormData.boarding_address?.trim() || "Bangalore",
        notes: [
          `Offline Admin Tour Booking`,
          `Ticket No: ${ticketNumber}`,
          `PNR: ${pnrNumber}`,
          `Package: ${pkgTitle}`,
          `Duration: ${tourFormData.number_of_days || 3} Days`,
          `Hotel: ${tourFormData.hotel_tier || "Standard"}`,
          `Vehicle: ${tourFormData.vehicle_slug || "Sedan"}`,
          `Total Fare: ₹${effectiveFareAmount}`,
          `Passengers: ${passengers.map((p, i) => `P${i + 1}: ${p.name || "Guest"} (${p.age || "—"}y/${p.gender})`).join(", ")}`,
        ]
          .filter(Boolean)
          .join(" | "),
        total_amount: Number(effectiveFareAmount || 0),
        fare: Number(effectiveFareAmount || 0),
        advance_amount: Number(effectiveFareAmount || 0),
        client_token: `FT-ADMIN-TOUR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to submit tour package booking.");
      }

      setStep("CONFIRMED");
      toast.success("Tour package confirmed! Official ticket copy voucher generated.");
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
      tourType: "TOUR PACKAGE",
      fromLocation: "BANGALORE",
      toLocation: tourTitleDisplay,
      departureOn: `${departureDateFormatted} (${formatTime12Hour(tourFormData.time)})`,
      tripType: "ONE WAY",
      vehicleOrMode: `TOUR: ${tourTitleDisplay}`,
      boardingPoint: tourFormData.boarding_point || "—",
      boardingAddress: tourFormData.boarding_address || "—",
      serviceType: "TOUR",
      fareAmount: effectiveFareAmount,
    });
    toast.success("Tour Ticket PDF downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetForAnother = () => {
    setStep("FORM");
    setFormInitialStep("PACKAGE");
    setTicketNumber(generateTicketNumber());
    setPnrNumber(generatePNR());
    setPassengers([{ name: "", age: "", gender: "Male" }]);
    setCustomFareAmount("");
    setTourFormData((prev: any) => ({
      ...prev,
      package_slug: packages[0]?.slug || "bengaluru-mysuru-coorg",
      package_title: packages[0]?.title || "Bengaluru → Mysuru & Coorg",
      date: new Date().toISOString().split("T")[0],
      boarding_point: "",
      boarding_address: "",
      name: "",
      phone: "",
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
        {step === "FORM" && (
          /* ================= STEP 1 & 2: TOUR PACKAGES & JOURNEY FORM ================= */
          <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
            {/* Top Header with Back to Services */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full px-3.5 py-1 shadow-sm">
                  🌴 TOUR PACKAGES
                </span>
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">
                  Curated holiday itineraries across South India
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {onOpenPackagesManagement && (
                  <button
                    type="button"
                    onClick={onOpenPackagesManagement}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-3.5 py-1.5 border border-amber-400/40 bg-amber-500/10 rounded-xl hover:bg-amber-500/20 transition-colors shadow-sm cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" /> View / Manage All Packages
                  </button>
                )}
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Services
                </button>
              </div>
            </div>

            {/* Tour Booking Form Inputs */}
            <TourBookingForm
              formData={tourFormData}
              onChange={onTourChange}
              onFareCalculated={() => {}}
              errors={{}}
              initialStep={formInitialStep}
              showPassengersStep={true}
              submitButtonText="CONTINUE TO PASSENGER DETAILS →"
              onProceedToPassengers={handleProceedToPassengers}
              onCompleteBooking={handleProceedToPassengers}
              isSubmitting={isSubmitting}
              onBackToServices={onBack}
            />
          </div>
        )}

        {step === "PASSENGERS" && (
          /* ================= STEP 3: PASSENGER DETAILS (Matches Provided Image) ================= */
          <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300 text-white">
            {/* Top Header with Back to Services */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full px-3.5 py-1 shadow-sm">
                  🌴 TOUR PACKAGES
                </span>
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">
                  Curated holiday itineraries across South India
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Services
                </button>
              </div>
            </div>

            {/* Step Tabs Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-3">
              <div className="inline-flex rounded-full border border-white/15 bg-[#111c3a]/90 p-1.5 gap-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setFormInitialStep("PACKAGE");
                    setStep("FORM");
                  }}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-500/20 text-emerald-300">
                    ✓
                  </span>
                  <span>1. Select Package</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormInitialStep("JOURNEY");
                    setStep("FORM");
                  }}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-500/20 text-emerald-300">
                    ✓
                  </span>
                  <span>2. Journey Type &amp; Route</span>
                </button>

                <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-black bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-white text-[#0B132B]">
                    3
                  </span>
                  <span>3. Passenger Details</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormInitialStep("JOURNEY");
                  setStep("FORM");
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to Journey Details
              </button>
            </div>

            {/* Passenger Details Form Card (Image 1) */}
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> PASSENGER DETAILS
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    NUMBER OF PASSENGERS:
                  </label>
                  <select
                    value={passengers.length}
                    onChange={(e) => handlePassengerCountChange(Number(e.target.value))}
                    className="bg-[#111c3a] border border-emerald-500/40 rounded-xl px-3 py-1.5 text-sm font-black text-emerald-300 focus:ring-2 focus:ring-[#00c58e]/20 outline-none shadow-inner [color-scheme:dark]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <option key={n} value={n} className="bg-[#0b1329] text-white">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dedicated Passenger Phone Number Input */}
              <div className="bg-[#111c3a]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-inner">
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  PASSENGER PHONE NUMBER (MOBILE / WHATSAPP NO.) *
                </label>
                <input
                  type="tel"
                  maxLength={15}
                  placeholder="Enter passenger mobile number (e.g. 9964600247 / 9740463404)"
                  value={tourFormData.phone || ""}
                  onChange={(e) => onTourChange("phone", e.target.value)}
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
                      BOARDING POINT *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. City Railway Station, Platform 1"
                      value={tourFormData.boarding_point || ""}
                      onChange={(e) => onTourChange("boarding_point", e.target.value)}
                      className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#00c58e] [color-scheme:dark] placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                      FULL BOARDING ADDRESS *
                    </label>
                    <input
                      type="text"
                      placeholder="Full address / landmark for pickup"
                      value={tourFormData.boarding_address || ""}
                      onChange={(e) => onTourChange("boarding_address", e.target.value)}
                      className="w-full bg-[#0b1329]/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#00c58e] [color-scheme:dark] placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Ticket Fare Summary & Custom Fare Adjustment */}
              <div className="bg-[#111c3a]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block">
                    TICKET FARE AMOUNT
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
                    value={customFareAmount !== "" ? customFareAmount : effectiveFareAmount}
                    placeholder={`₹${effectiveFareAmount.toLocaleString("en-IN")}`}
                    onChange={(e) => setCustomFareAmount(e.target.value)}
                    className="w-36 bg-[#0b1329] border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-black text-emerald-300 focus:ring-2 focus:ring-[#00c58e]/30 outline-none shadow-inner [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setFormInitialStep("JOURNEY");
                    setStep("FORM");
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 border border-white/15 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
                >
                  ← Back to Journey Details
                </button>

                <button
                  type="button"
                  onClick={handleCompleteTourBooking}
                  disabled={isSubmitting}
                  className="bg-[#00c58e] hover:bg-[#00a87a] text-white font-black px-10 sm:px-12 py-3.5 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-[#00c58e]/30 transition-all hover:scale-102 active:scale-98 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? "Generating Ticket..." : "CONTINUE TO BOOKING →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "CONFIRMED" && (
          /* ================= STEP 4: TICKET CONFIRMATION & OFFICIAL VOUCHER ================= */
          <div className="space-y-6 animate-in fade-in duration-300">
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
                    `Hello Fortune Tourism! New offline Tour Package reservation confirmed.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Passenger:* ${primaryPassengerName}\n*Phone:* ${primaryPhone}\n*Package:* ${tourTitleDisplay}\n*Date:* ${departureDateFormatted}\n*Total Fare:* ₹${Number(effectiveFareAmount || 0).toLocaleString("en-IN")}\n*Duration:* ${tourFormData.number_of_days || 3} Days`
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
                        ₹{Number(effectiveFareAmount || 0).toLocaleString("en-IN")}
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
                        <input
                          type="text"
                          value={tourFormData.name || primaryPassengerName}
                          onChange={(e) => onTourChange("name", e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-b border-dashed border-slate-400 focus:border-[#00c58e] outline-none font-black text-slate-900 uppercase"
                        />
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-40 whitespace-nowrap">
                        Passenger Phone No.:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        <input
                          type="tel"
                          value={tourFormData.phone || ""}
                          placeholder="e.g. 9964600247 / 9740463404"
                          onChange={(e) => onTourChange("phone", e.target.value)}
                          className="w-full bg-transparent border-b border-dashed border-slate-400 focus:border-[#00c58e] outline-none font-bold text-slate-900"
                        />
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 w-28 whitespace-nowrap">
                        Tour Type
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        TOUR PACKAGE
                      </td>
                    </tr>

                    {/* Row 2: FROM | TO */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        FROM
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                        BANGALORE
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        TO:
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-slate-900 uppercase">
                        {tourTitleDisplay}
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{departureDateFormatted}</span>
                          <span className="text-slate-600 font-semibold text-xs">({formatTime12Hour(tourFormData.time)})</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 4: Boarding Point | Boarding Address */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Boarding Point:
                      </td>
                      <td colSpan={2} className="p-2.5 font-bold text-slate-900 uppercase">
                        <input
                          type="text"
                          value={tourFormData.boarding_point || ""}
                          placeholder="—"
                          onChange={(e) => onTourChange("boarding_point", e.target.value)}
                          className="w-full bg-transparent border-b border-dashed border-slate-400 focus:border-[#00c58e] outline-none font-bold text-slate-900 uppercase"
                        />
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Boarding Address:
                      </td>
                      <td colSpan={2} className="p-2.5 font-bold text-slate-900">
                        <input
                          type="text"
                          value={tourFormData.boarding_address || ""}
                          placeholder="—"
                          onChange={(e) => onTourChange("boarding_address", e.target.value)}
                          className="w-full bg-transparent border-b border-dashed border-slate-400 focus:border-[#00c58e] outline-none font-bold text-slate-900"
                        />
                      </td>
                    </tr>

                    {/* Row 5: Trip Type | Tour Package | Fare Amount */}
                    <tr className="border-b border-slate-900 divide-x divide-slate-900">
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Trip Type:
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 uppercase">
                        {tourFormData.tour_trip_type || "ROUND TRIP"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Tour Package:
                      </td>
                      <td className="p-2.5 font-black text-slate-900 uppercase">
                        TOUR: {tourTitleDisplay}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                        Fare Amount:
                      </td>
                      <td className="p-2.5 font-black text-emerald-700 uppercase">
                        ₹{Number(effectiveFareAmount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>

                    {/* Row 6: Total Fare Amount | Payment Status */}
                    <tr className="divide-x divide-slate-900 bg-emerald-50/50">
                      <td className="p-2.5 font-black text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Total Fare Amount:
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-emerald-800 text-sm sm:text-base">
                        ₹{Number(effectiveFareAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 bg-emerald-100/70 whitespace-nowrap">
                        Payment Status:
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-emerald-700 uppercase">
                        CONFIRMED / PAID
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
                <div>2. Hotel check-in and sightseeing details will be coordinated by our tour representative.</div>
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
