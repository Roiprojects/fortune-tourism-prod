import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Reveal } from "@/components/site/Reveal";
import { findPackage, packages, type TourPackage } from "@/data/packages";
import { CONTACT, buildWhatsAppUrl } from "@/lib/contact";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Moon,
  Phone,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/tour-packages/$packageId")({
  loader: ({ params }) => {
    const pkg = findPackage(params.packageId);
    return { pkg };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.pkg.title} — South India Tour | Fortune Tourism` },
          {
            name: "description",
            content: `${loaderData.pkg.duration} chauffeur-driven tour from ${loaderData.pkg.from}. ${loaderData.pkg.summary}`,
          },
          { property: "og:title", content: `${loaderData.pkg.title} | Fortune Tourism` },
          { property: "og:description", content: loaderData.pkg.summary },
          { property: "og:image", content: loaderData.pkg.heroImage ?? loaderData.pkg.image },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Package | Fortune Tourism" }],
  }),
  component: PackageDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-fortune py-24 text-center">
        <h1 className="font-heading text-3xl">Package not found</h1>
        <Link
          to="/tour-packages"
          className="mt-4 inline-block text-[color:var(--color-emerald)] underline"
        >
          Back to packages
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="container-fortune py-24 text-center">Something went wrong.</div>
    </SiteLayout>
  ),
});

const STATE_LABEL: Record<TourPackage["states"][number], string> = {
  karnataka: "Karnataka",
  "andhra-pradesh": "Andhra Pradesh",
  "tamil-nadu": "Tamil Nadu",
  kerala: "Kerala",
  puducherry: "Puducherry",
};

const STATE_IMAGE: Record<TourPackage["states"][number], string> = {
  karnataka: "/images/state-karnataka.jpg",
  "andhra-pradesh": "/images/state-andhra.jpg",
  "tamil-nadu": "/images/state-tamilnadu.jpg",
  kerala: "/images/state-kerala.jpg",
  puducherry: "/images/state-puducherry.jpg",
};

const HOTEL_TIERS = [
  { name: "Standard", rooms: "Clean AC rooms", meals: "Breakfast", note: "Best value option" },
  { name: "Deluxe", rooms: "Spacious rooms", meals: "Breakfast + dinner", note: "Most popular" },
  { name: "Premium", rooms: "Resort / boutique stay", meals: "Breakfast + dinner", note: "Best comfort" },
];

function PackageDetail() {
  const { pkg } = Route.useLoaderData() as { pkg: TourPackage };
  const heroImg = pkg.heroImage ?? pkg.image;

  // Gallery: hero + state imagery
  const gallery = useMemo(() => {
    const g = [heroImg, ...pkg.states.map((s) => STATE_IMAGE[s])];
    return Array.from(new Set(g));
  }, [heroImg, pkg.states]);

  const related = useMemo(
    () =>
      packages
        .filter((p) => p.slug !== pkg.slug)
        .sort((a, b) => {
          const shared = (x: TourPackage) => x.states.filter((s) => pkg.states.includes(s)).length;
          return shared(b) - shared(a);
        })
        .slice(0, 3),
    [pkg]
  );

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(pkg.vehicles[0]);
  const [selectedHotel, setSelectedHotel] = useState<string>(HOTEL_TIERS[1].name);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [travelDate, setTravelDate] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const whatsapp = buildWhatsAppUrl({
    service: "Tour Package",
    package: pkg.title,
    vehicle: selectedVehicle,
    date: travelDate || undefined,
    passengers: `${adults} adults, ${children} children`,
    notes: `Hotel preference: ${selectedHotel}`,
  });

  const routeChain = [pkg.from, ...pkg.destinations.slice(0, 3), pkg.from].join(" → ");

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[520px] w-full overflow-hidden md:h-[600px]">
          <img
            src={heroImg}
            alt={pkg.title}
            className="h-full w-full object-cover"
            width={1920}
            height={820}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
          <div className="absolute inset-0 flex items-end">
            <div className="container-fortune pb-10 md:pb-14">
              <nav className="mb-4 text-sm text-white/80">
                <Link to="/" className="hover:text-white">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/tour-packages" className="hover:text-white">Tour Packages</Link>
                <span className="mx-2">/</span>
                <span className="text-white">{pkg.title}</span>
              </nav>
              <div className="flex flex-wrap gap-2">
                {pkg.states.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-white backdrop-blur"
                  >
                    {STATE_LABEL[s]}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-tight text-white md:text-6xl">
                {pkg.title}
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90">
                <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {pkg.duration}</span>
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Starts from {pkg.from}</span>
                <span className="hidden md:inline">•</span>
                <span className="max-w-lg truncate">{pkg.destinations.slice(0, 4).join(" • ")}</span>
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[color:var(--color-emerald)] px-6 py-3 text-sm font-medium text-white shadow-lg hover:opacity-90"
                >
                  Enquire on WhatsApp
                </a>
                <a
                  href="#enquiry"
                  className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
                >
                  Get Custom Quote
                </a>
                <a
                  href={CONTACT.phoneHref}
                  className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
                >
                  <Phone className="mr-2 inline h-4 w-4" /> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Booking summary strip */}
        <div className="border-b border-border bg-card">
          <div className="container-fortune grid grid-cols-2 gap-4 py-5 text-sm md:grid-cols-5">
            <Stat icon={<CalendarDays className="h-4 w-4" />} label="Duration" value={pkg.duration} />
            <Stat icon={<MapPin className="h-4 w-4" />} label="Starts" value={pkg.from} />
            <Stat icon={<Car className="h-4 w-4" />} label="Vehicles" value={`${pkg.vehicles.length} options`} />
            <Stat icon={<Moon className="h-4 w-4" />} label="Hotels" value="On request" />
            <Stat
              icon={<Sparkles className="h-4 w-4" />}
              label="From"
              value={pkg.startingPrice ? `₹ ${pkg.startingPrice.toLocaleString("en-IN")}` : "Custom quote"}
            />
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-14">
        <div className="container-fortune grid gap-12 lg:grid-cols-[1.55fr_1fr]">
          <div className="min-w-0">
            {/* Overview */}
            <Reveal>
              <h2 className="font-heading text-2xl md:text-3xl">Package overview</h2>
              <p className="mt-3 text-muted-foreground">{pkg.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Private Vehicle", "Customisable", "Bengaluru Pickup", ...(pkg.states.includes("kerala") ? ["Backwater Stay"] : []), "Chauffeur Driven"].map(
                  (chip) => (
                    <span key={chip} className="rounded-full bg-muted px-3 py-1 text-xs">{chip}</span>
                  )
                )}
              </div>
            </Reveal>

            {/* Gallery */}
            <Reveal delay={0.05}>
              <div className="mt-12">
                <h3 className="font-heading text-xl">Destination gallery</h3>
                <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => setLightbox(0)}
                    className="col-span-4 aspect-[16/9] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto"
                  >
                    <img src={gallery[0]} alt={`${pkg.title} view 1`} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  </button>
                  {gallery.slice(1, 5).map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setLightbox(i + 1)}
                      className="col-span-2 aspect-[4/3] overflow-hidden rounded-2xl md:col-span-1"
                    >
                      <img src={src} alt={`${pkg.title} view ${i + 2}`} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Highlights */}
            {pkg.highlights && (
              <Reveal delay={0.05}>
                <div className="mt-12">
                  <h3 className="font-heading text-xl">Package highlights</h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {pkg.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-emerald)]" />
                        <span className="text-sm">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {/* Itinerary timeline */}
            <Reveal delay={0.05}>
              <div className="mt-12">
                <h3 className="font-heading text-xl">Day-by-day itinerary</h3>
                <ol className="relative mt-6 space-y-6 border-l border-border pl-6">
                  {pkg.itinerary.map((d) => (
                    <li key={d.day} className="relative">
                      <span className="absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-emerald)] text-xs font-semibold text-white">
                        {d.day}
                      </span>
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Day {d.day}</p>
                        <h4 className="mt-1 font-heading text-lg">{d.title}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{d.details}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                            <Moon className="h-3 w-3" /> Overnight: {d.title.split("→").pop()?.trim() ?? pkg.from}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            {/* Route */}
            <Reveal delay={0.05}>
              <div className="mt-12 rounded-2xl border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 font-heading text-xl">
                  <RouteIcon className="h-5 w-5" /> Route overview
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{routeChain}</p>
              </div>
            </Reveal>

            {/* Places covered */}
            <Reveal delay={0.05}>
              <div className="mt-12">
                <h3 className="font-heading text-xl">Places covered</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pkg.destinations.map((d, i) => (
                    <div key={d} className="overflow-hidden rounded-2xl border border-border bg-card">
                      <img
                        src={gallery[(i + 1) % gallery.length]}
                        alt={d}
                        loading="lazy"
                        className="h-32 w-full object-cover"
                      />
                      <div className="p-4">
                        <p className="font-heading text-base">{d}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Day {Math.min(i + 1, pkg.itinerary.length)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Vehicle options */}
            <Reveal delay={0.05}>
              <div className="mt-12">
                <h3 className="font-heading text-xl">Vehicle options</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pkg.vehicles.map((v) => {
                    const active = v === selectedVehicle;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSelectedVehicle(v)}
                        className={`rounded-2xl border p-4 text-left transition ${active ? "border-[color:var(--color-emerald)] bg-[color:var(--color-emerald)]/5" : "border-border bg-card hover:border-[color:var(--color-emerald)]/40"}`}
                      >
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          <span className="font-heading text-base">{v}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Chauffeur driven · AC · Private</p>
                        <p className="mt-3 text-xs font-medium text-[color:var(--color-emerald)]">
                          {active ? "Selected" : "Select vehicle"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Hotel tiers */}
            <Reveal delay={0.05}>
              <div className="mt-12">
                <h3 className="font-heading text-xl">Hotel options</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hotel selection is subject to availability. The exact property is confirmed before booking.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {HOTEL_TIERS.map((h) => {
                    const active = h.name === selectedHotel;
                    return (
                      <button
                        key={h.name}
                        type="button"
                        onClick={() => setSelectedHotel(h.name)}
                        className={`rounded-2xl border p-4 text-left transition ${active ? "border-[color:var(--color-emerald)] bg-[color:var(--color-emerald)]/5" : "border-border bg-card hover:border-[color:var(--color-emerald)]/40"}`}
                      >
                        <p className="font-heading text-base">{h.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{h.rooms}</p>
                        <p className="mt-2 text-xs">{h.meals}</p>
                        <p className="mt-3 text-xs font-medium text-[color:var(--color-emerald)]">{active ? "Selected" : h.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Inclusions / Exclusions */}
            <Reveal delay={0.05}>
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-heading text-lg">Inclusions</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {pkg.inclusions.map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-emerald)]" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-heading text-lg">Exclusions</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {pkg.exclusions.map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            {/* Pickup */}
            <Reveal delay={0.05}>
              <div className="mt-12 rounded-2xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg">Pickup &amp; drop</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <li>• Bengaluru doorstep pickup</li>
                  <li>• Kempegowda International Airport pickup</li>
                  <li>• Railway station / hotel pickup</li>
                  <li>• Flexible pickup time on request</li>
                </ul>
              </div>
            </Reveal>

            {/* Pricing note */}
            <Reveal delay={0.05}>
              <div className="mt-12 rounded-2xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg">Pricing</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pkg.startingPrice
                    ? `Starting from ₹ ${pkg.startingPrice.toLocaleString("en-IN")} per vehicle. Final pricing depends on travel dates, vehicle choice, hotel category and group size.`
                    : "We share a personalised quotation based on your travel dates, vehicle choice, hotel preference and group size."}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Final pricing may vary with seasonal demand, entry fees, permit charges and additional requirements.
                </p>
              </div>
            </Reveal>

            {/* Travel notes */}
            <Reveal delay={0.05}>
              <div className="mt-12">
                <h3 className="font-heading text-xl">Important travel notes</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Carry a valid government-issued photo ID.</li>
                  <li>• Wear comfortable footwear and modest attire at temples.</li>
                  <li>• Hill-station weather may change quickly — carry a light jacket.</li>
                  <li>• Sightseeing order may change based on local conditions and traffic.</li>
                  <li>• Some attractions may remain closed on specific weekdays.</li>
                </ul>
              </div>
            </Reveal>

            {/* Terms + Cancellation + FAQ accordion */}
            <Reveal delay={0.05}>
              <div className="mt-12">
                <h3 className="font-heading text-xl">Policies &amp; FAQs</h3>
                <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-card px-4">
                  <AccordionItem value="terms" className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left text-base font-medium">Terms &amp; conditions</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Booking is confirmed on receipt of advance payment. Balance is payable before trip start. Package
                      is fully customisable. Vehicle substitution with a similar category vehicle may occur based on
                      availability. Driver duty hours and route are managed for guest safety.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="cancellation" className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left text-base font-medium">Cancellation policy</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Cancellation charges depend on notice period and third-party bookings (hotels, houseboats,
                      permits). Refunds are processed on the original payment method. Date changes are subject to
                      availability. No refund on no-show or early return.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q1" className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left text-base font-medium">Can this package be customised?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Yes. Duration, destinations, vehicle, hotel tier and pickup can all be tailored to your plans.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2" className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left text-base font-medium">Is the vehicle private?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Every package uses a private chauffeur-driven vehicle assigned only to your group.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3" className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left text-base font-medium">Are toll &amp; parking included?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Fuel, tolls and driver allowance are included. Interstate permits and entry tickets are billed
                      at actuals unless mentioned otherwise.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q4">
                    <AccordionTrigger className="text-left text-base font-medium">When will driver details be shared?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Chauffeur name, phone number and vehicle registration are shared the evening before pickup.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </Reveal>

            {/* Reviews */}
            <Reveal delay={0.05}>
              <div className="mt-12">
                <h3 className="font-heading text-xl">Traveller reviews</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { name: "Ananya R.", where: "Bengaluru", note: "Very clean vehicle and a polite driver. Loved the estate stay." },
                    { name: "Kiran M.", where: "HSR Layout", note: "Trip was well planned. Pickup and drop were on time. Recommended." },
                  ].map((r) => (
                    <div key={r.name} className="rounded-2xl border border-border bg-card p-5">
                      <p className="text-sm">“{r.note}”</p>
                      <p className="mt-3 text-xs text-muted-foreground">{r.name} · {r.where}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* STICKY ENQUIRY */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div id="enquiry" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <img src={heroImg} alt="" className="h-16 w-16 rounded-xl object-cover" width={64} height={64} />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{pkg.duration}</p>
                  <h2 className="truncate font-heading text-lg">{pkg.title}</h2>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="col-span-2 text-xs">
                  Travel date
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs">
                  Adults
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs">
                  Children
                  <input
                    type="number"
                    min={0}
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="col-span-2 flex flex-wrap items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="font-medium">{selectedVehicle}</span>
                </div>
                <div className="col-span-2 flex flex-wrap items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Hotel</span>
                  <span className="font-medium">{selectedHotel}</span>
                </div>
              </div>

              <div className="mt-5">
                <EnquiryForm compact presetService="Tour Package" presetPackage={pkg.title} />
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  to="/booking"
                  search={{ service: "TOUR", package: pkg.slug }}
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-md hover:brightness-110 flex items-center justify-center gap-2"
                >
                  Book Tour Online <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-full bg-[color:var(--color-emerald)] px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  WhatsApp Enquiry
                </a>
                <a
                  href={CONTACT.phoneHref}
                  className="w-full rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium"
                >
                  <Phone className="mr-2 inline h-4 w-4" /> {CONTACT.phone}
                </a>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" /> Verified chauffeurs · Insured vehicles · 24×7 support
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-14">
          <div className="container-fortune">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-2xl md:text-3xl">Related packages</h2>
              <Link to="/tour-packages" className="text-sm text-[color:var(--color-emerald)]">
                View all <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/tour-packages/$packageId"
                  params={{ packageId: r.slug }}
                  className="group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={r.heroImage ?? r.image}
                      alt={r.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.duration}</p>
                    <h3 className="mt-1 font-heading text-lg">{r.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-[color:var(--color-emerald)]">View details</span>
                      <span className="text-muted-foreground">
                        {r.startingPrice ? `From ₹${r.startingPrice.toLocaleString("en-IN")}` : "Get quote"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MOBILE BOTTOM BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-3 gap-2 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <a href={CONTACT.phoneHref} className="flex items-center justify-center rounded-full border border-border py-2 text-sm">
            <Phone className="mr-1 h-4 w-4" /> Call
          </a>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-full bg-[color:var(--color-emerald)] py-2 text-sm font-medium text-white">
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex items-center justify-center rounded-full border border-border py-2 text-sm"
          >
            Get Quote
          </button>
        </div>
      </div>

      {/* MOBILE SHEET */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-background p-5 pb-[max(env(safe-area-inset-bottom),1rem)]">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg">Request quote</h3>
              <button onClick={() => setSheetOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{pkg.title} · {pkg.duration}</p>
            <div className="mt-4">
              <EnquiryForm compact presetService="Tour Package" presetPackage={pkg.title} />
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" role="dialog" aria-modal="true">
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setLightbox((i) => (i === null ? 0 : (i + gallery.length - 1) % gallery.length))}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setLightbox((i) => (i === null ? 0 : (i + 1) % gallery.length))}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <img src={gallery[lightbox]} alt="" className="max-h-[86vh] max-w-[92vw] rounded-lg object-contain" />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
            {lightbox + 1} / {gallery.length}
          </span>
        </div>
      )}

      {/* padding for mobile bar */}
      <div className="h-20 lg:hidden" aria-hidden />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: pkg.title,
            description: pkg.summary,
            touristType: ["Family", "Couple", "Group"],
            itinerary: pkg.itinerary.map((d) => ({
              "@type": "ItemList",
              name: `Day ${d.day}: ${d.title}`,
              description: d.details,
            })),
            provider: { "@type": "TravelAgency", name: "Fortune Tourism" },
            image: heroImg,
          }),
        }}
      />
    </SiteLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-[color:var(--color-emerald)]">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _users = Users;