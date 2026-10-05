import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/contact";

export type ServiceType =
  | "Outstation"
  | "Local Transfer"
  | "Corporate Travel"
  | "Airport Transfer"
  | "Hourly Package"
  | "Tour Package"
  | "Flight"
  | "Train"
  | "Bus Booking"
  | "General Enquiry";

const VEHICLE_OPTIONS = [
  "Sedan (Dzire / Etios)",
  "Premium Sedan (Honda City)",
  "SUV (Maruti Ertiga)",
  "Toyota Innova",
  "Toyota Innova Crysta",
  "Tempo Traveller (12 Seater)",
  "Tempo Traveller (17 Seater)",
  "Mini Bus (21+ Seater)",
];

interface Passenger {
  name: string;
  age: string;
  gender: string;
}

export function EnquiryForm({
  compact = false,
  presetService,
  presetPackage,
  presetVehicle,
}: {
  compact?: boolean;
  presetService?: string;
  presetPackage?: string;
  presetVehicle?: string;
}) {
  const [activeService, setActiveService] = useState<ServiceType>(
    (presetService as ServiceType) || "Outstation",
  );

  // Common Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pickup, setPickup] = useState("Bengaluru");
  const [destination, setDestination] = useState("");
  const [passengers, setPassengers] = useState("4");
  const [carType, setCarType] = useState(presetVehicle || "Sedan (Dzire / Etios)");
  const [notes, setNotes] = useState("");

  // Service Specific Fields
  const [tripType, setTripType] = useState<"One Way" | "Round Trip">("Round Trip");
  const [returnDate, setReturnDate] = useState("");
  const [numberOfDays, setNumberOfDays] = useState("3");

  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const [airportTransferType, setAirportTransferType] = useState<"Airport Drop" | "Airport Pickup">(
    "Airport Drop",
  );
  const [airportName, setAirportName] = useState("Kempegowda Intl Airport BLR");
  const [flightNumber, setFlightNumber] = useState("");

  const [hoursPackage, setHoursPackage] = useState("8 Hours / 80 KM");
  const [tourName, setTourName] = useState(presetPackage || "");

  const [trainClass, setTrainClass] = useState("3AC");
  const [trainPreference, setTrainPreference] = useState("");
  const [passengerList, setPassengerList] = useState<Passenger[]>([
    { name: "", age: "", gender: "Male" },
  ]);

  const [busOperator, setBusOperator] = useState("KSRTC / VRL / Sea Bird");
  const [busType, setBusType] = useState("AC Sleeper");

  const [loading, setLoading] = useState(false);
  const [enquiryRef, setEnquiryRef] = useState<string | null>(null);

  const addPassengerRow = () => {
    setPassengerList((prev) => [...prev, { name: "", age: "", gender: "Male" }]);
  };

  const removePassengerRow = (idx: number) => {
    setPassengerList((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePassenger = (idx: number, field: keyof Passenger, val: string) => {
    setPassengerList((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  };

  const handleSubmit = async (mode: "quote" | "whatsapp") => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      phone,
      email,
      service: activeService,
      pickup,
      destination,
      date,
      return_date: tripType === "Round Trip" ? returnDate : null,
      time,
      passengers,
      trip_type: activeService === "Outstation" ? tripType : null,
      car_type: carType,
      number_of_days: tripType === "Round Trip" ? numberOfDays : null,
      company_name: activeService === "Corporate Travel" ? companyName : null,
      gst_number: activeService === "Corporate Travel" ? gstNumber : null,
      airport_name: activeService === "Airport Transfer" ? airportName : null,
      flight_number: activeService === "Airport Transfer" ? flightNumber : null,
      hours_package: activeService === "Hourly Package" ? hoursPackage : null,
      tour_name: activeService === "Tour Package" ? tourName : presetPackage,
      train_class: activeService === "Train" ? trainClass : null,
      train_preference: activeService === "Train" ? trainPreference : null,
      bus_operator: activeService === "Bus Booking" ? busOperator : null,
      bus_type: activeService === "Bus Booking" ? busType : null,
      passengers_detail: activeService === "Train" ? passengerList : null,
      notes,
      package_slug: presetPackage,
      vehicle_slug: presetVehicle,
      client_token:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `tok-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };

    try {
      if (mode === "whatsapp") {
        const waText = `*${activeService} Enquiry*\nName: ${name}\nPhone: ${phone}\nFrom: ${pickup} to ${destination || "N/A"}\nDate: ${date || "N/A"}\nVehicle: ${carType}\nPassengers: ${passengers}\nNotes: ${notes || "None"}`;
        const waUrl = buildWhatsAppUrl({
          destination: destination || pickup,
          service: activeService,
          notes: waText,
        });
        window.open(waUrl, "_blank", "noopener");
      } else {
        const res = await fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const d = await res.json();
        if (res.ok && d.success) {
          setEnquiryRef(d.enquiry?.enquiry_number || d.enquiry?.id || null);
          toast.success(
            `Enquiry submitted for ${activeService}! Our team will contact you shortly.`,
          );
          setName("");
          setPhone("");
          setEmail("");
          setNotes("");
          setDate("");
        } else {
          toast.error(d.error || "Failed to submit enquiry.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none focus:border-[color:var(--color-navy)] focus:ring-2 focus:ring-[color:var(--color-navy)]/20 transition";

  const servicesList: ServiceType[] = [
    "Outstation",
    "Local Transfer",
    "Airport Transfer",
    "Corporate Travel",
    "Hourly Package",
    "Tour Package",
    "Flight",
    "Train",
    "Bus Booking",
    "General Enquiry",
  ];

  return (
    <div className="w-full">
      {enquiryRef && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-sm font-bold text-emerald-800">
            Enquiry Received! Your Reference Number:
          </p>
          <p className="mt-1 font-heading text-2xl font-bold tracking-wider text-[color:var(--color-navy)]">
            {enquiryRef}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Save this reference — our team will contact you within 30 minutes during working hours.
          </p>
        </div>
      )}

      {/* Service Tabs Header */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3 overflow-x-auto">
        {servicesList.map((srv) => (
          <button
            key={srv}
            type="button"
            onClick={() => setActiveService(srv)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition ${
              activeService === srv
                ? "bg-[color:var(--color-navy)] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {srv}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit("quote");
        }}
        className="grid gap-4.5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Outstation Specific Controls */}
        {activeService === "Outstation" && (
          <>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trip Type
              </label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value as any)}
                className={fieldClass}
              >
                <option value="Round Trip">Round Trip</option>
                <option value="One Way">One Way</option>
              </select>
            </div>
            {tripType === "Round Trip" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
            )}
          </>
        )}

        {/* Airport Transfer Controls */}
        {activeService === "Airport Transfer" && (
          <>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transfer Direction
              </label>
              <select
                value={airportTransferType}
                onChange={(e) => setAirportTransferType(e.target.value as any)}
                className={fieldClass}
              >
                <option value="Airport Drop">Airport Drop (City to Airport)</option>
                <option value="Airport Pickup">Airport Pickup (Airport to City)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Flight Number (Optional)
              </label>
              <input
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="e.g. 6E 503"
                className={fieldClass}
              />
            </div>
          </>
        )}

        {/* Corporate Controls */}
        {activeService === "Corporate Travel" && (
          <>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company Name
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Infosys / TCS"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                GST / Tax ID (Optional)
              </label>
              <input
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="GST Number"
                className={fieldClass}
              />
            </div>
          </>
        )}

        {/* Hourly Package Controls */}
        {activeService === "Hourly Package" && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Package Duration
            </label>
            <select
              value={hoursPackage}
              onChange={(e) => setHoursPackage(e.target.value)}
              className={fieldClass}
            >
              <option value="4 Hours / 40 KM">4 Hours / 40 KM</option>
              <option value="8 Hours / 80 KM">8 Hours / 80 KM</option>
              <option value="12 Hours / 120 KM">12 Hours / 120 KM</option>
              <option value="Full Day Local">Full Day Local</option>
            </select>
          </div>
        )}

        {/* Train Controls */}
        {activeService === "Train" && (
          <>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Travel Class
              </label>
              <select
                value={trainClass}
                onChange={(e) => setTrainClass(e.target.value)}
                className={fieldClass}
              >
                <option value="1AC">1st AC (1AC)</option>
                <option value="2AC">2nd AC (2AC)</option>
                <option value="3AC">3rd AC (3AC)</option>
                <option value="SL">Sleeper (SL)</option>
                <option value="CC">Chair Car (CC)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Train Name / No. Preference
              </label>
              <input
                value={trainPreference}
                onChange={(e) => setTrainPreference(e.target.value)}
                placeholder="e.g. Shatabdi / Vande Bharat"
                className={fieldClass}
              />
            </div>
          </>
        )}

        {/* Bus Controls */}
        {activeService === "Bus Booking" && (
          <>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bus Operator Preference
              </label>
              <input
                value={busOperator}
                onChange={(e) => setBusOperator(e.target.value)}
                placeholder="e.g. KSRTC, VRL, Jabbar"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bus Type
              </label>
              <select
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className={fieldClass}
              >
                <option value="AC Sleeper">AC Multi-Axle Sleeper</option>
                <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                <option value="Volvo Seater">Volvo AC Seater</option>
              </select>
            </div>
          </>
        )}

        {/* Locations */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pickup Location
          </label>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="e.g. Bengaluru / Majestic / Airport"
            className={fieldClass}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Destination / Drop
          </label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Mysuru / Coorg / Ooty"
            className={fieldClass}
          />
        </div>

        {/* Dates & Time */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Travel Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pickup Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={fieldClass}
          />
        </div>

        {/* Passengers & Vehicles */}
        {activeService !== "Flight" &&
          activeService !== "Train" &&
          activeService !== "Bus Booking" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vehicle Preference
              </label>
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                className={fieldClass}
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Number of Passengers
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            className={fieldClass}
          />
        </div>

        {/* Customer Contact */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Full Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className={fieldClass}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Phone Number *
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 97404 63404"
            className={fieldClass}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className={fieldClass}
          />
        </div>

        {/* Train Dynamic Passengers Section */}
        {activeService === "Train" && (
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-border bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Passenger List (Admin Required)
              </label>
              <button
                type="button"
                onClick={addPassengerRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-navy)] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Passenger
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {passengerList.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                  <input
                    value={p.name}
                    onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                    placeholder="Passenger Name"
                    className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={p.age}
                    onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                    placeholder="Age"
                    className="w-16 rounded-lg border border-border bg-white px-2 py-1.5 text-xs"
                  />
                  <select
                    value={p.gender}
                    onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                    className="w-24 rounded-lg border border-border bg-white px-2 py-1.5 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {passengerList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassengerRow(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Special Requirements / Admin Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific requirements, luggage details or preferences..."
            className={fieldClass}
          />
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-3 sm:flex-row pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-navy)] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Submitting…" : `Submit ${activeService} Request`}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("whatsapp")}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-emerald)] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
          >
            Continue via WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
}

export default EnquiryForm;
