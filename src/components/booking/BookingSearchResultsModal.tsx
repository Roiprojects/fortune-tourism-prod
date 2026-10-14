import { useEffect, useState } from "react";
import {
  X,
  ArrowLeft,
  Plane,
  Bus,
  TrainFront,
  CarTaxiFront,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Phone,
  MessageCircle,
  Send,
  User,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { CONTACT, buildWhatsAppUrl } from "@/lib/contact";

interface TaxiBookingSelection {
  cab: string;
  price: string;
  per: string;
  note: string;
}

export interface BookingSearchPayload {
  category: "flight" | "bus" | "train" | "taxi";
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  tripType?: string;
  passengers: number;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  seatType?: string[];
  trainClass?: string;
  vehicleType?: string;
  pickupTime?: string;
}

interface BookingSearchResultsModalProps {
  payload: BookingSearchPayload | null;
  onClose: () => void;
}

export function BookingSearchResultsModal({ payload, onClose }: BookingSearchResultsModalProps) {
  const [bookingSelection, setBookingSelection] = useState<TaxiBookingSelection | null>(null);

  // Reset the taxi booking form whenever a new search payload arrives
  useEffect(() => {
    setBookingSelection(null);
  }, [payload]);

  if (!payload) return null;

  const handleBookNow = (itemTitle: string, price: string) => {
    toast.success(
      `Booking request generated for ${itemTitle} (${price}). Our agent will confirm your tickets shortly!`,
    );
  };

  const inTaxiBookingForm = payload.category === "taxi" && bookingSelection !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0b132b] text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              {payload.category === "flight" && <Plane className="h-6 w-6" />}
              {payload.category === "bus" && <Bus className="h-6 w-6" />}
              {payload.category === "train" && <TrainFront className="h-6 w-6" />}
              {payload.category === "taxi" && <CarTaxiFront className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                {inTaxiBookingForm
                  ? "Confirm Your Taxi Booking"
                  : `Live Search Results (${payload.category.toUpperCase()})`}
              </span>
              <h3 className="font-heading text-lg font-bold truncate">
                {inTaxiBookingForm ? bookingSelection?.cab : `${payload.from} → ${payload.to}`}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {inTaxiBookingForm && (
              <button
                onClick={() => setBookingSelection(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 text-xs font-bold"
                title="Back to results"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close results"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Query Details Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {payload.departureDate} {payload.returnDate ? ` → ${payload.returnDate}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {payload.passengers} Passenger(s)
            </span>
            {payload.cabinClass && (
              <span className="bg-slate-200 px-2 py-0.5 rounded-md text-[10px]">
                {payload.cabinClass}
              </span>
            )}
            {payload.trainClass && (
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px]">
                {payload.trainClass}
              </span>
            )}
            {payload.vehicleType && (
              <span className="bg-lime-100 text-lime-900 px-2 py-0.5 rounded-md text-[10px]">
                {payload.vehicleType}
              </span>
            )}
            {payload.pickupTime && (
              <span className="bg-slate-200 px-2 py-0.5 rounded-md text-[10px]">
                {payload.pickupTime}
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
            ✓ API Ready Engine
          </span>
        </div>

        {/* Body: Taxi Booking Form or Results List */}
        {inTaxiBookingForm && bookingSelection ? (
          <TaxiBookingFormView
            payload={payload}
            selection={bookingSelection}
            onBack={() => setBookingSelection(null)}
            onClose={onClose}
          />
        ) : (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {payload.category === "flight" && (
              <>
                {[
                  {
                    airline: "IndiGo (6E-728)",
                    dep: "06:15 AM",
                    arr: "08:45 AM",
                    dur: "2h 30m",
                    price: "₹5,499",
                    type: "Non-stop",
                  },
                  {
                    airline: "Air India (AI-506)",
                    dep: "09:30 AM",
                    arr: "12:10 PM",
                    dur: "2h 40m",
                    price: "₹6,120",
                    type: "Non-stop",
                  },
                  {
                    airline: "Vistara (UK-812)",
                    dep: "03:45 PM",
                    arr: "06:20 PM",
                    dur: "2h 35m",
                    price: "₹7,250",
                    type: "Non-stop",
                  },
                ].map((flight, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-slate-900">{flight.airline}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="font-semibold">{flight.dep}</span>
                        <span className="text-[10px] text-slate-400">({flight.dur})</span>
                        <span className="font-semibold">{flight.arr}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="block font-heading text-lg font-bold text-slate-900">
                          {flight.price}
                        </span>
                        <span className="text-[10px] text-slate-400">per seat</span>
                      </div>
                      <button
                        onClick={() => handleBookNow(flight.airline, flight.price)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-amber-600 transition"
                      >
                        Book Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {payload.category === "bus" && (
              <>
                {[
                  {
                    operator: "VRL Travels (Volvo A/C Multi-Axle Sleeper)",
                    dep: "09:30 PM",
                    arr: "06:00 AM",
                    dur: "8h 30m",
                    price: "₹1,250",
                    seats: "8 Seats Left",
                  },
                  {
                    operator: "SRS Travels (Non-AC Seater / Sleeper)",
                    dep: "10:15 PM",
                    arr: "06:45 AM",
                    dur: "8h 30m",
                    price: "₹850",
                    seats: "12 Seats Left",
                  },
                  {
                    operator: "KSRTC FlyBus (Premium AC Multi-Axle)",
                    dep: "11:00 PM",
                    arr: "07:15 AM",
                    dur: "8h 15m",
                    price: "₹1,400",
                    seats: "4 Seats Left",
                  },
                ].map((bus, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-slate-900">{bus.operator}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="font-semibold">{bus.dep}</span>
                        <span className="text-[10px] text-slate-400">({bus.dur})</span>
                        <span className="font-semibold">{bus.arr}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="block font-heading text-lg font-bold text-slate-900">
                          {bus.price}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">{bus.seats}</span>
                      </div>
                      <button
                        onClick={() => handleBookNow(bus.operator, bus.price)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-amber-600 transition"
                      >
                        Select Seat
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {payload.category === "taxi" && (
              <>
                {[
                  {
                    cab: "Hatchback — Swift · i20 · Altroz",
                    type: payload.tripType
                      ? `${String(payload.tripType).replace("-", " ").toUpperCase()} · Local Ride`
                      : "Local Ride",
                    per: "₹250 /hr",
                    price: "₹499",
                    note: "Min 30 mins · Up to 4 pax",
                  },
                  {
                    cab: "Sedan — Dzire · Aura · Amaze",
                    type: payload.tripType
                      ? `${String(payload.tripType).replace("-", " ").toUpperCase()} · City / Airport`
                      : "City / Airport",
                    per: "₹750 flat",
                    price: "₹899",
                    note: "Airport drop flat · Up to 4 pax",
                  },
                  {
                    cab: "SUV / MUV — Ertiga · Carens",
                    type: "Family · Outstation",
                    per: "₹16 /km",
                    price: "₹1,299",
                    note: "Family outstation · Up to 6 pax",
                  },
                  {
                    cab: "Innova Crysta — Premium",
                    type: "Premium · Outstation",
                    per: "₹24 /km",
                    price: "₹1,799",
                    note: "Premium comfort · Up to 7 pax",
                  },
                ].map((taxi, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-lime-400 hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-slate-900">{taxi.cab}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold bg-lime-50 text-lime-800 px-2 py-0.5 rounded">
                          {taxi.type}
                        </span>
                        <span className="text-[10px] text-slate-400">{taxi.note}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="block font-heading text-lg font-bold text-slate-900">
                          {taxi.price}
                        </span>
                        <span className="text-[10px] text-slate-400">{taxi.per}</span>
                      </div>
                      <button
                        onClick={() =>
                          setBookingSelection({
                            cab: taxi.cab,
                            price: taxi.price,
                            per: taxi.per,
                            note: taxi.note,
                          })
                        }
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-lime-500 hover:text-slate-950 transition"
                      >
                        Book Cab
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {payload.category === "train" && (
              <>
                {[
                  {
                    train: "KSR Bengaluru Express (12658)",
                    dep: "06:00 AM",
                    arr: "11:45 AM",
                    status: "AVAILABLE - 24 Seats",
                    price: "₹650",
                  },
                  {
                    train: "Mysuru Shatabdi Express (12007)",
                    dep: "11:00 AM",
                    arr: "01:00 PM",
                    status: "AVAILABLE - 18 Seats",
                    price: "₹920",
                  },
                  {
                    train: "Cauvery Superfast Express (16022)",
                    dep: "11:55 PM",
                    arr: "06:30 AM",
                    status: "RAC 12 / AVAILABLE",
                    price: "₹480",
                  },
                ].map((tr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-slate-900">{tr.train}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="font-semibold">{tr.dep}</span>
                        <span className="font-semibold">{tr.arr}</span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          {tr.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="block font-heading text-lg font-bold text-slate-900">
                          {tr.price}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {payload.trainClass || "3AC"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBookNow(tr.train, tr.price)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-amber-600 transition"
                      >
                        Book Berth
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Quick WhatsApp Assistance Banner */}
            <div className="mt-6 bg-gradient-to-r from-slate-900 to-[#0b132b] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm">Need Instant Ticket Confirmation?</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Speak directly with Fortune Tourism travel desk on call or WhatsApp.
                </p>
              </div>
              <a
                href={CONTACT.phoneHref}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition"
              >
                <Phone className="h-4 w-4" />
                Call Booking Desk
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TaxiBookingFormViewProps {
  payload: BookingSearchPayload;
  selection: TaxiBookingSelection;
  onBack: () => void;
  onClose: () => void;
}

function TaxiBookingFormView({ payload, selection, onBack, onClose }: TaxiBookingFormViewProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [pickup, setPickup] = useState(payload.from);
  const [drop, setDrop] = useState(payload.to);
  const [date, setDate] = useState(payload.departureDate);
  const [time, setTime] = useState(payload.pickupTime || "");
  const [pax, setPax] = useState(payload.passengers);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; mobile?: string } = {};
    if (!name.trim()) newErrors.name = "Please enter your full name";
    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitted(true);
    toast.success("Taxi booking request submitted! Our agent will confirm your cab shortly.");
  };

  const waUrl = buildWhatsAppUrl({
    service: `Taxi / Cab Booking · ${selection.cab}`,
    vehicle: selection.cab,
    pickup,
    destination: drop,
    date: `${date}${time ? ` · ${time}` : ""}`,
    passengers: pax,
    name,
    phone: mobile,
    notes,
  });

  const inputBase =
    "w-full py-3 px-4 rounded-2xl border text-sm font-semibold text-slate-900 bg-white focus:outline-none placeholder:text-slate-400 transition";

  return (
    <div className="p-6 overflow-y-auto flex-1 space-y-5">
      {submitted ? (
        <div className="space-y-5 animate-fadeIn">
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-emerald-900 mt-3">
              Booking Request Submitted!
            </h3>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Our travel desk will confirm your <strong>{selection.cab}</strong> cab (
              {selection.price}) shortly. You will be contacted on <strong>{mobile}</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1.5">
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">Cab</span>
              <span className="font-bold text-right">{selection.cab}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">Route</span>
              <span className="font-bold text-right">
                {pickup} → {drop}
              </span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">Date · Time</span>
              <span className="font-bold text-right">
                {date} · {time || "—"}
              </span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">Passengers</span>
              <span className="font-bold text-right">{pax}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">Estimated</span>
              <span className="font-bold text-right">
                {selection.price} ({selection.per})
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 flex-1 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
            >
              <MessageCircle className="h-4 w-4" />
              Confirm on WhatsApp
            </a>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center justify-center gap-1.5 flex-1 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs transition"
            >
              <Phone className="h-4 w-4" />
              Call Booking Desk
            </a>
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Back to Results
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Selected Cab Summary */}
          <div className="rounded-2xl border border-lime-300 bg-lime-50 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2.5 rounded-xl bg-lime-500/20 text-lime-700 shrink-0">
                <CarTaxiFront className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">{selection.cab}</h4>
                <p className="text-[10px] text-lime-800">{selection.note}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="block font-heading text-lg font-bold text-slate-900">
                {selection.price}
              </span>
              <span className="text-[10px] text-slate-500">{selection.per}</span>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Pickup Location
              </span>
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className={inputBase}
                placeholder="Pickup location"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Drop Location
              </span>
              <input
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                className={inputBase}
                placeholder="Drop location"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Pickup Date
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputBase}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pickup Time
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputBase}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Users className="h-3 w-3" /> Passengers
              </span>
              <select
                value={pax}
                onChange={(e) => setPax(Number(e.target.value))}
                className={inputBase}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Passenger" : "Passengers"}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3" /> Special Instructions
              </span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputBase}
                placeholder="Meet & greet, luggage, extra stops..."
              />
            </label>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <span className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Your Contact Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <User className="h-3 w-3" /> Full Name *
                </span>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Your full name"
                  className={`${inputBase} ${
                    errors.name
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-slate-300 focus:border-lime-500"
                  }`}
                />
                {errors.name && (
                  <span className="block text-[10px] font-medium text-red-500 mt-1">
                    {errors.name}
                  </span>
                )}
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Mobile Number *
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
                  }}
                  placeholder="e.g. 9964600247 / 9740463404"
                  className={`${inputBase} ${
                    errors.mobile
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-slate-300 focus:border-lime-500"
                  }`}
                />
                <span className="block text-[10px] text-slate-400 mt-1">
                  e.g. 9964600247, 9740463404
                </span>
                {errors.mobile && (
                  <span className="block text-[10px] font-medium text-red-500 mt-1">
                    {errors.mobile}
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-slate-950 font-heading font-bold text-sm shadow-lg transition"
            >
              <Send className="h-4 w-4" />
              Submit Booking Request
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
