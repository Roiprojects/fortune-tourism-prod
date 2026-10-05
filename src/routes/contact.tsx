import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { CONTACT, buildWhatsAppUrl } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/site/Header";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Copy,
  Navigation,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  Users,
  Plane,
  Car,
  ChevronDown,
  Send,
  Home,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Fortune Tourism | Bengaluru Travel Enquiries" },
      { name: "description", content: "Call, WhatsApp, email or visit Fortune Tourism in Bengaluru for car rentals, airport transfers and South India tour packages." },
      { property: "og:title", content: "Contact Fortune Tourism" },
      { property: "og:description", content: "Fast booking assistance for Bengaluru and South India travel." },
      { property: "og:image", content: "/images/contact/hero-contact.jpg" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <Hero />
      <QuickActionBar />
      <ContactCards />
      <EnquirySection />
      <MapSection />
      <ProcessSteps />
      <ResponsePanel />
      <FaqSection />
      <TrustStrip />
      <FinalCTA />
      <MobileBar />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src="/images/contact/hero-contact.jpg"
        alt="Fortune Tourism travel consultant assisting an Indian family with a South India itinerary in a Bengaluru office"
        width={1920}
        height={820}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-navy)]/92 via-[color:var(--color-navy)]/70 to-transparent" />
      <div className="relative container-fortune min-h-[460px] py-16 text-[color:var(--color-cream)] md:min-h-[480px] md:py-24">
        <nav className="text-xs uppercase tracking-[0.25em] opacity-80">
          <Link to="/" className="story-link">Home</Link>
          <span className="mx-2">/</span>
          <span>Contact Us</span>
        </nav>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Contact</p>
        <h1 className="mt-3 max-w-2xl font-heading text-4xl leading-tight md:text-6xl">
          Let's plan your journey
        </h1>
        <p className="mt-5 max-w-xl text-base opacity-90 md:text-lg">
          Contact Fortune Tourism for Bengaluru car rentals, airport transfers, outstation travel and customised South India tour packages.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#enquiry" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-gold)] px-6 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition hover:brightness-105">
            Send an Enquiry <ArrowRight className="h-4 w-4" />
          </a>
          <a href={buildWhatsAppUrl()} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-emerald)] px-6 py-3 text-sm font-semibold text-[color:var(--color-cream)] transition hover:brightness-110">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp Us
          </a>
          <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-cream)]/60 px-6 py-3 text-sm font-semibold text-[color:var(--color-cream)] transition hover:bg-white/10">
            <Phone className="h-4 w-4" /> Call Now
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs opacity-90 md:text-sm">
          {["Fast Booking Assistance", "Bengaluru-Based Team", "Local & Outstation", "Custom Tour Planning", "24×7 Booking"].map((t) => (
            <li key={t} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[color:var(--color-gold)]" /> {t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const QUICK = [
  { icon: Phone, label: "Call", helper: CONTACT.phone, href: CONTACT.phoneHref },
  { icon: WhatsAppIcon, label: "WhatsApp", helper: "Chat with us", href: buildWhatsAppUrl(), external: true },
  { icon: Mail, label: "Email", helper: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { icon: MapPin, label: "Directions", helper: "Bengaluru office", href: mapsDirUrl(), external: true },
  { icon: Send, label: "Send Enquiry", helper: "Custom quote", href: "#enquiry" },
];

function QuickActionBar() {
  return (
    <section className="relative -mt-8 md:-mt-10">
      <div className="container-fortune">
        <ul className="grid gap-3 rounded-2xl border border-border bg-white p-3 shadow-lg sm:grid-cols-3 md:grid-cols-5">
          {QUICK.map(({ icon: Icon, label, helper, href, external }) => (
            <li key={label}>
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener" : undefined}
                className="group flex min-h-[64px] items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[color:var(--color-navy)]/5"
              >
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[color:var(--color-navy)]/5 text-[color:var(--color-navy)]"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{helper}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ContactCards() {
  const copy = (v: string) => {
    navigator.clipboard?.writeText(v).then(() => toast.success("Copied"));
  };
  return (
    <section className="py-14 md:py-20">
      <div className="container-fortune">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-emerald)]">Reach us</p>
        <h2 className="mt-3 font-heading text-3xl md:text-4xl">Contact information</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">A real Bengaluru-based team, ready to help with your travel plans.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card icon={Phone} label="Phone">
            <a href={CONTACT.phoneHref} className="mt-1 block font-heading text-lg">{CONTACT.phone}</a>
            <p className="mt-1 text-sm text-muted-foreground">Talk to a booking coordinator directly.</p>
            <div className="mt-3 flex gap-2">
              <a href={CONTACT.phoneHref} className={btnDark}>Call Now</a>
              <button type="button" onClick={() => copy(CONTACT.phone)} className={btnGhost}><Copy className="h-4 w-4" /> Copy</button>
            </div>
          </Card>
          <Card icon={WhatsAppIcon} label="WhatsApp">
            <p className="mt-1 font-heading text-lg">+91 97404 63404</p>
            <p className="mt-1 text-sm text-muted-foreground">Fastest response with a prefilled enquiry.</p>
            <div className="mt-3 flex gap-2">
              <a href={buildWhatsAppUrl()} target="_blank" rel="noopener" className={btnEmerald}>Start Chat</a>
            </div>
          </Card>
          <Card icon={Mail} label="Email">
            <a href={`mailto:${CONTACT.email}`} className="mt-1 block font-heading text-lg break-all">{CONTACT.email}</a>
            <p className="mt-1 text-sm text-muted-foreground">Written quotations and detailed itineraries.</p>
            <div className="mt-3 flex gap-2">
              <a href={`mailto:${CONTACT.email}`} className={btnDark}>Send Email</a>
              <button type="button" onClick={() => copy(CONTACT.email)} className={btnGhost}><Copy className="h-4 w-4" /> Copy</button>
            </div>
          </Card>
          <Card icon={MapPin} label="Office Address">
            <p className="mt-1 font-heading text-lg leading-snug">{CONTACT.address}</p>
            <p className="mt-1 text-sm text-muted-foreground">Nearest landmark: Trinity Metro Station.</p>
            <div className="mt-3 flex gap-2">
              <a href={mapsDirUrl()} target="_blank" rel="noopener" className={btnDark}><Navigation className="h-4 w-4" /> Directions</a>
              <button type="button" onClick={() => copy(CONTACT.address)} className={btnGhost}><Copy className="h-4 w-4" /> Copy</button>
            </div>
          </Card>
          <Card icon={Clock} label="Business Hours">
            <p className="mt-1 font-heading text-lg">Mon – Sat · 9:00 AM – 8:00 PM</p>
            <p className="mt-1 text-sm text-muted-foreground">Sun · 10:00 AM – 5:00 PM (bookings only)</p>
          </Card>
          <Card icon={ShieldCheck} label="Booking Assistance">
            <p className="mt-1 font-heading text-lg">24×7 for airport & urgent travel</p>
            <p className="mt-1 text-sm text-muted-foreground">Same-day and airport enquiries handled outside office hours, subject to vehicle and driver availability.</p>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <div className="h-full rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--color-navy)]/5 text-[color:var(--color-navy)]"><Icon className="h-5 w-5" /></span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
        {children}
      </div>
    </Reveal>
  );
}

// ------------- Enquiry Form -------------

const SERVICES = [
  "Local Car Rental",
  "Outstation Car Rental",
  "Airport Pickup",
  "Airport Drop",
  "Round Trip",
  "Corporate Transportation",
  "Group Travel",
  "Pilgrimage Tour",
  "Wedding Transportation",
  "South India Tour Package",
  "Custom Travel Requirement",
  "Other",
] as const;

const VEHICLES = [
  "Let Fortune Tourism Recommend",
  "Hatchback",
  "Sedan",
  "Premium Sedan",
  "Ertiga / MUV",
  "Innova",
  "Innova Crysta",
  "Tempo Traveller",
  "Mini Bus",
] as const;

const VEHICLE_CAPACITY: Record<string, number> = {
  Hatchback: 4,
  Sedan: 4,
  "Premium Sedan": 4,
  "Ertiga / MUV": 6,
  Innova: 7,
  "Innova Crysta": 7,
  "Tempo Traveller": 17,
  "Mini Bus": 27,
};

const DEPARTMENTS = [
  "New Booking",
  "Existing Booking Support",
  "Airport Transfer",
  "Vehicle Rental",
  "Tour Package",
  "Corporate Requirement",
  "Group Transportation",
  "Payment or Invoice",
  "Feedback",
  "Other",
] as const;

const schema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name").max(80),
    mobile: z.string().trim().regex(/^[+0-9\s-]{7,15}$/, "Enter a valid mobile number"),
    whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
    email: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
    contactMethod: z.enum(["Phone", "WhatsApp", "Email"]),
    department: z.string(),
    service: z.string().min(1, "Choose a service"),
    pickup: z.string().trim().min(2, "Pickup location is required").max(120),
    destination: z.string().trim().max(120).optional().or(z.literal("")),
    travelDate: z.string().min(1, "Travel date is required"),
    returnDate: z.string().optional().or(z.literal("")),
    travellers: z.coerce.number().int().min(1, "At least one traveller"),
    bags: z.coerce.number().int().min(0).optional(),
    vehicle: z.string(),
    budget: z.string().optional().or(z.literal("")),
    message: z.string().trim().min(3, "Add a short travel requirement").max(600),
    hp: z.string().max(0, "Bot detected"),
  })
  .refine((v) => !v.returnDate || v.returnDate >= v.travelDate, {
    path: ["returnDate"],
    message: "Return date cannot be earlier than travel date",
  });

type FormState = z.infer<typeof schema>;

const initialForm: FormState = {
  name: "",
  mobile: "",
  whatsapp: "",
  email: "",
  contactMethod: "WhatsApp",
  department: "New Booking",
  service: "Local Car Rental",
  pickup: "Bengaluru",
  destination: "",
  travelDate: "",
  returnDate: "",
  travellers: 2,
  bags: 2,
  vehicle: "Let Fortune Tourism Recommend",
  budget: "",
  message: "",
  hp: "",
};

function EnquirySection() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const vehicleWarning = useMemo(() => {
    const cap = VEHICLE_CAPACITY[form.vehicle];
    if (!cap) return null;
    if (form.travellers > cap) {
      const bigger = Object.entries(VEHICLE_CAPACITY).find(([, c]) => c >= form.travellers);
      return bigger
        ? `${form.vehicle} seats ${cap}. Consider ${bigger[0]} for ${form.travellers} travellers.`
        : `${form.vehicle} seats ${cap}. Please contact us for a larger vehicle.`;
    }
    return null;
  }, [form.vehicle, form.travellers]);

  const submit = async (mode: "quote" | "whatsapp") => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      for (const i of parsed.error.issues) e[i.path[0] as string] = i.message;
      setErrors(e);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "whatsapp") {
        const url = buildWhatsAppUrl({
          service: form.service,
          pickup: form.pickup,
          destination: form.destination,
          date: form.travelDate,
          returnDate: form.returnDate,
          passengers: form.travellers,
          vehicle: form.vehicle,
          name: form.name,
          phone: form.mobile,
          notes: [form.bags ? `Bags: ${form.bags}` : "", form.budget ? `Budget: ${form.budget}` : "", form.message].filter(Boolean).join(" · "),
        });
        window.open(url, "_blank", "noopener");
      } else {
        // TODO: wire to backend
        await new Promise((r) => setTimeout(r, 700));
        const ref = `FT-${Date.now().toString().slice(-6)}`;
        setSuccess(ref);
        toast.success("Enquiry received.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isAirport = form.service === "Airport Pickup" || form.service === "Airport Drop";
  const isLocal = form.service === "Local Car Rental";
  const isOutstation = form.service === "Outstation Car Rental" || form.service === "Round Trip";
  const isTour = form.service === "South India Tour Package" || form.service === "Pilgrimage Tour";
  const isCorporate = form.service === "Corporate Transportation";

  return (
    <section id="enquiry" className="bg-[color:var(--color-cream)] py-14 md:py-20">
      <div className="container-fortune grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-emerald)]">Enquiry</p>
          <h2 className="mt-3 font-heading text-3xl md:text-4xl">Send your travel details</h2>
          <p className="mt-3 text-muted-foreground">Share your route, date and traveller count so our team can recommend the most suitable vehicle or package.</p>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[color:var(--color-emerald)]" /> {CONTACT.phone}</p>
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[color:var(--color-emerald)]" /> {CONTACT.email}</p>
            <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-[color:var(--color-emerald)]" /> Mon–Sat 9 AM – 8 PM · 24×7 airport support</p>
          </div>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set("department", d)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs transition " +
                    (form.department === d
                      ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-[color:var(--color-cream)]"
                      : "border-border bg-white text-foreground hover:border-[color:var(--color-navy)]/40")
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          {success ? (
            <SuccessState ref_={success} onReset={() => { setSuccess(null); setForm(initialForm); }} />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit("quote");
              }}
              className="grid gap-4 md:grid-cols-2"
              noValidate
            >
              {/* honeypot */}
              <input type="text" value={form.hp} onChange={(e) => set("hp", e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <Field label="Full name" required error={errors.name}>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Full name" />
              </Field>
              <Field label="Mobile number" required error={errors.mobile}>
                <input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} className={inputCls} placeholder="+91 …" />
              </Field>
              <Field label="WhatsApp number" error={errors.whatsapp}>
                <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls} placeholder="If different" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="Optional" />
              </Field>

              <Field label="Preferred contact method" full>
                <div className="mt-1 flex gap-2">
                  {(["Phone", "WhatsApp", "Email"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("contactMethod", m)}
                      className={
                        "flex-1 rounded-lg border px-3 py-2 text-sm transition " +
                        (form.contactMethod === m
                          ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-[color:var(--color-cream)]"
                          : "border-border bg-white hover:border-[color:var(--color-navy)]/40")
                      }
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Service required" required error={errors.service} full>
                <select value={form.service} onChange={(e) => set("service", e.target.value)} className={inputCls}>
                  {SERVICES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>

              <Field label={isAirport ? "Bengaluru area" : "Pickup location"} required error={errors.pickup}>
                <input value={form.pickup} onChange={(e) => set("pickup", e.target.value)} className={inputCls} placeholder="e.g. Whitefield" />
              </Field>
              <Field label={isAirport ? "Airport terminal" : "Destination"} error={errors.destination}>
                <input value={form.destination} onChange={(e) => set("destination", e.target.value)} className={inputCls} placeholder={isAirport ? "T1 / T2" : "Coorg, Munnar…"} />
              </Field>

              <Field label={isAirport ? "Pickup date & time" : "Travel date"} required error={errors.travelDate}>
                <input type={isAirport ? "datetime-local" : "date"} value={form.travelDate} onChange={(e) => set("travelDate", e.target.value)} className={inputCls} />
              </Field>
              {(isOutstation || isTour) && (
                <Field label="Return date" error={errors.returnDate}>
                  <input type="date" value={form.returnDate} onChange={(e) => set("returnDate", e.target.value)} className={inputCls} />
                </Field>
              )}

              <Field label="Number of travellers" required error={errors.travellers}>
                <input type="number" min={1} value={form.travellers} onChange={(e) => set("travellers", Number(e.target.value) || 1)} className={inputCls} />
              </Field>
              <Field label="Number of bags">
                <input type="number" min={0} value={form.bags ?? 0} onChange={(e) => set("bags", Number(e.target.value) || 0)} className={inputCls} />
              </Field>

              <Field label="Vehicle preference">
                <select value={form.vehicle} onChange={(e) => set("vehicle", e.target.value)} className={inputCls}>
                  {VEHICLES.map((v) => <option key={v}>{v}</option>)}
                </select>
                {vehicleWarning && <p className="mt-1 text-xs text-amber-700">{vehicleWarning}</p>}
              </Field>
              <Field label="Approximate budget">
                <input value={form.budget} onChange={(e) => set("budget", e.target.value)} className={inputCls} placeholder="₹" />
              </Field>

              {isAirport && (
                <Field label="Flight number">
                  <input value={form.budget} onChange={(e) => set("budget", e.target.value)} className={inputCls} placeholder="e.g. AI 803" />
                </Field>
              )}
              {isLocal && (
                <Field label="Hours / approx km">
                  <input value={form.budget} onChange={(e) => set("budget", e.target.value)} className={inputCls} placeholder="8 hrs / 80 km" />
                </Field>
              )}
              {isCorporate && (
                <Field label="Company name">
                  <input value={form.budget} onChange={(e) => set("budget", e.target.value)} className={inputCls} placeholder="Company / GST" />
                </Field>
              )}

              <Field label="Message or special requirement" required error={errors.message} full>
                <textarea rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} className={inputCls} placeholder="Share stops, timing, hotel preferences…" />
              </Field>

              <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
                <button type="submit" disabled={loading} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--color-navy)] px-6 py-3 text-sm font-semibold text-[color:var(--color-cream)] transition hover:brightness-110 disabled:opacity-60">
                  {loading ? "Sending…" : "Submit Enquiry"}
                </button>
                <button type="button" onClick={() => submit("whatsapp")} disabled={loading} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--color-emerald)] px-6 py-3 text-sm font-semibold text-[color:var(--color-cream)] transition hover:brightness-110 disabled:opacity-60">
                  <WhatsAppIcon className="h-4 w-4" /> Continue on WhatsApp
                </button>
              </div>
              <p className="text-xs text-muted-foreground md:col-span-2">
                By submitting, you agree to be contacted about your travel enquiry. We never share your details with third parties.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function SuccessState({ ref_, onReset }: { ref_: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-emerald)]/10 text-[color:var(--color-emerald)]"><CheckCircle2 className="h-8 w-8" /></span>
      <h3 className="mt-4 font-heading text-2xl">Thank you</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your enquiry has been received. The Fortune Tourism team will review your travel requirement and contact you shortly.
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reference {ref_}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <a href={CONTACT.phoneHref} className={btnDark}><Phone className="h-4 w-4" /> Call Now</a>
        <a href={buildWhatsAppUrl()} target="_blank" rel="noopener" className={btnEmerald}><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
        <Link to="/" className={btnGhost}><Home className="h-4 w-4" /> Home</Link>
        <Link to="/car-rentals" className={btnGhost}><Car className="h-4 w-4" /> Vehicles</Link>
        <Link to="/tour-packages" className={btnGhost}><MapPin className="h-4 w-4" /> Packages</Link>
        <button type="button" onClick={onReset} className={btnGhost}>New enquiry</button>
      </div>
    </div>
  );
}

// ------------- Map -------------

function mapsDirUrl() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONTACT.address)}`;
}
function mapsEmbedUrl() {
  return `https://www.google.com/maps?q=${encodeURIComponent(CONTACT.address)}&output=embed`;
}

function MapSection() {
  const [loaded, setLoaded] = useState(false);
  const copy = () => navigator.clipboard?.writeText(CONTACT.address).then(() => toast.success("Address copied"));
  return (
    <section className="py-14 md:py-20">
      <div className="container-fortune grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
          <div className="aspect-[4/3] w-full">
            {loaded ? (
              <iframe
                src={mapsEmbedUrl()}
                title="Fortune Tourism office on Google Maps"
                loading="lazy"
                className="h-full w-full"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <button type="button" onClick={() => setLoaded(true)} className="group relative block h-full w-full text-left">
                <img src="/images/state-karnataka.jpg" alt="Preview of Fortune Tourism Bengaluru office location" className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute inset-0 grid place-items-center bg-[color:var(--color-navy)]/50 text-[color:var(--color-cream)]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-gold)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-navy)] shadow-lg transition group-hover:brightness-105">
                    <MapPin className="h-4 w-4" /> Load Map
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-emerald)]">Visit us</p>
          <h2 className="mt-3 font-heading text-3xl md:text-4xl">Fortune Tourism · Bengaluru Office</h2>
          <p className="mt-3 text-muted-foreground">{CONTACT.address}</p>
          <p className="mt-1 text-sm text-muted-foreground">Nearest landmark: Trinity Metro Station · Free parking on premises.</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoRow label="Phone" value={<a href={CONTACT.phoneHref}>{CONTACT.phone}</a>} />
            <InfoRow label="WhatsApp" value={<a href={buildWhatsAppUrl()} target="_blank" rel="noopener">Chat with us</a>} />
            <InfoRow label="Email" value={<a href={`mailto:${CONTACT.email}`} className="break-all">{CONTACT.email}</a>} />
            <InfoRow label="Hours" value={<span>Mon–Sat 9 AM – 8 PM</span>} />
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={mapsDirUrl()} target="_blank" rel="noopener" className={btnDark}><Navigation className="h-4 w-4" /> Directions</a>
            <button type="button" onClick={copy} className={btnGhost}><Copy className="h-4 w-4" /> Copy Address</button>
            <a href={CONTACT.phoneHref} className={btnEmerald}><Phone className="h-4 w-4" /> Call Office</a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Map not loading? <a href={mapsDirUrl()} target="_blank" rel="noopener" className="story-link">Open in Google Maps</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

// ------------- Steps / Response / FAQ / Trust / CTA / Mobile -------------

const STEPS = [
  { n: "1", title: "Share Your Travel Details", blurb: "Submit your route, date, traveller count and preferred service." },
  { n: "2", title: "Receive a Recommendation", blurb: "We suggest a suitable vehicle, package or travel plan." },
  { n: "3", title: "Confirm the Quotation", blurb: "Confirm pricing, pickup details and any advance payment." },
  { n: "4", title: "Receive Travel Confirmation", blurb: "Driver and vehicle information shared before travel." },
];

function ProcessSteps() {
  return (
    <section className="bg-[color:var(--color-cream)] py-14 md:py-20">
      <div className="container-fortune">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-emerald)]">How it works</p>
        <h2 className="mt-3 font-heading text-3xl md:text-4xl">A simple four-step booking</h2>
        <div className="relative mt-10 grid gap-6 md:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-[color:var(--color-navy)]/20 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="relative rounded-2xl border border-border bg-white p-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--color-navy)] font-heading text-lg text-[color:var(--color-cream)]">{s.n}</span>
                <h4 className="mt-4 font-heading text-lg">{s.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResponsePanel() {
  const items = [
    "Enquiries are reviewed as quickly as possible during business hours.",
    "Quotations are shared over WhatsApp or email based on your preferred contact.",
    "Driver and vehicle details are shared before your scheduled journey.",
    "Urgent or same-day airport enquiries are handled subject to availability.",
    "WhatsApp messages use structured details for faster confirmation.",
    "Advance payment requirements depend on the booking type and quotation.",
  ];
  return (
    <section className="py-14 md:py-20">
      <div className="container-fortune rounded-2xl border border-border bg-[color:var(--color-navy)] p-8 text-[color:var(--color-cream)] md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-gold)]">What to expect</p>
        <h2 className="mt-3 font-heading text-3xl md:text-4xl">Response &amp; support</h2>
        <p className="mt-3 max-w-2xl opacity-90">
          Our team aims to review enquiries as quickly as possible. Urgent or same-day travel requests are subject to vehicle and driver availability.
        </p>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {items.map((t) => (
            <li key={t} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[color:var(--color-gold)]" />{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const CONTACT_FAQS = [
  { q: "How quickly will I receive a response?", a: "Response time depends on business hours, travel date and enquiry urgency. Most enquiries during office hours are answered within a few minutes." },
  { q: "How does the booking process work?", a: "Send your enquiry, receive a quotation, confirm pricing and pickup details, and we assign a driver and vehicle before your journey." },
  { q: "Will I receive a written quotation?", a: "Yes. Quotations are shared through WhatsApp, email or another configured method based on your preference." },
  { q: "Is advance payment required?", a: "Advance requirements depend on the booking type and are clearly mentioned in the quotation." },
  { q: "Can tour packages be customised?", a: "Destinations, number of days, vehicle and hotel preferences can be adjusted based on availability." },
  { q: "Can I book an airport transfer for the same day?", a: "Same-day airport bookings are handled subject to vehicle and driver availability. Please call or WhatsApp for urgent pickups." },
  { q: "When will I receive driver details?", a: "Driver name, vehicle and contact number are shared shortly before the scheduled pickup." },
  { q: "Can I change my booking after confirmation?", a: "Changes are possible subject to availability and may affect pricing." },
  { q: "What payment methods are accepted?", a: "UPI, bank transfer and card payments are accepted. Payment details are shared with the quotation." },
  { q: "Can I contact Fortune Tourism through WhatsApp?", a: "Yes. Use the WhatsApp button anywhere on this site to send a structured travel enquiry." },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-[color:var(--color-cream)] py-14 md:py-20">
      <div className="container-fortune">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-emerald)]">FAQ</p>
        <h2 className="mt-3 font-heading text-3xl md:text-4xl">Frequently asked</h2>
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-white shadow-sm">
          {CONTACT_FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-heading text-base md:text-lg">{f.q}</span>
                  <ChevronDown className={"h-5 w-5 flex-none transition " + (isOpen ? "rotate-180" : "")} />
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: ShieldCheck, label: "Professional Drivers" },
  { icon: Sparkles, label: "Clean Vehicles" },
  { icon: BadgeCheck, label: "Transparent Quotation" },
  { icon: MapPin, label: "Bengaluru Expertise" },
  { icon: Car, label: "South India Tour Support" },
  { icon: Users, label: "Airport & Group Travel" },
];

function TrustStrip() {
  return (
    <section className="py-10 md:py-14">
      <div className="container-fortune grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {TRUST.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--color-navy)]/5 text-[color:var(--color-navy)]"><Icon className="h-4 w-4" /></span>
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden py-16 text-[color:var(--color-cream)] md:py-24">
      <img src="/images/cta-road.jpg" alt="Innova Crysta on a scenic South Indian road" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-navy)]/95 via-[color:var(--color-navy)]/85 to-[color:var(--color-navy)]/50" />
      <div className="relative container-fortune max-w-3xl">
        <h2 className="font-heading text-3xl md:text-5xl">Ready to travel?</h2>
        <p className="mt-4 text-base opacity-90 md:text-lg">
          Call, message or send your travel details. Fortune Tourism will help you choose a suitable vehicle, airport transfer or customised South India package.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-gold)] px-6 py-3 text-sm font-semibold text-[color:var(--color-navy)]">
            <Phone className="h-4 w-4" /> Call Now
          </a>
          <a href={buildWhatsAppUrl()} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-emerald)] px-6 py-3 text-sm font-semibold text-[color:var(--color-cream)]">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp Now
          </a>
          <a href="#enquiry" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-cream)]/60 px-6 py-3 text-sm font-semibold text-[color:var(--color-cream)]">
            Send Enquiry <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-3">
        <a href={CONTACT.phoneHref} className="flex flex-col items-center gap-1 py-3 text-xs font-semibold text-[color:var(--color-navy)]">
          <Phone className="h-5 w-5" /> Call
        </a>
        <a href={buildWhatsAppUrl()} target="_blank" rel="noopener" className="flex flex-col items-center gap-1 border-x border-border py-3 text-xs font-semibold text-[color:var(--color-emerald)]">
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp
        </a>
        <a href="#enquiry" className="flex flex-col items-center gap-1 py-3 text-xs font-semibold text-[color:var(--color-navy)]">
          <MessageCircle className="h-5 w-5" /> Enquire
        </a>
      </div>
    </div>
  );
}

// ------------- Shared UI -------------

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground shadow-sm outline-none focus:border-[color:var(--color-navy)] focus:ring-2 focus:ring-[color:var(--color-navy)]/20";

const btnDark =
  "inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-navy)] px-4 py-2 text-xs font-semibold text-[color:var(--color-cream)] transition hover:brightness-110";
const btnEmerald =
  "inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-emerald)] px-4 py-2 text-xs font-semibold text-[color:var(--color-cream)] transition hover:brightness-110";
const btnGhost =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground transition hover:border-[color:var(--color-navy)]/40";

function Field({
  label,
  children,
  required,
  error,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  full?: boolean;
}) {
  return (
    <label className={"block " + (full ? "md:col-span-2" : "")}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
