import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { packages, type TourPackage } from "@/data/packages";
import { destinations } from "@/data/destinations";
import { testimonials } from "@/data/site";
import { buildWhatsAppUrl, CONTACT } from "@/lib/contact";
import {
  MapPin,
  Users,
  Calendar,
  Star,
  Phone,
  MessageCircle,
  ArrowRight,
  ChevronDown,
  X,
  SlidersHorizontal,
  Sparkles,
  Heart,
  Mountain,
  Waves,
  Landmark,
  Baby,
  Briefcase,
  Palmtree,
  Car,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { TourPackageTicketCopySection } from "@/components/packages/TourPackageTicketCopySection";

type StateSlug = TourPackage["states"][number] | "all";

export const Route = createFileRoute("/tour-packages")({
  head: () => ({
    meta: [
      { title: "South India Tour Packages from Bengaluru | Fortune Tourism" },
      {
        name: "description",
        content:
          "Explore customisable Karnataka, Kerala, Tamil Nadu, Andhra Pradesh and Puducherry tour packages from Bengaluru with professional drivers and comfortable vehicles.",
      },
      { property: "og:title", content: "South India Tour Packages from Bengaluru" },
      {
        property: "og:description",
        content: "Weekend escapes, hill stations, temples, beaches and backwaters — all curated by Fortune Tourism.",
      },
      { property: "og:image", content: "/images/hero-travel.jpg" },
      { property: "og:url", content: "/tour-packages" },
    ],
    links: [{ rel: "canonical", href: "/tour-packages" }],
  }),
  component: TourPackagesPage,
});

const durations = ["Any", "1 Day", "2–3 Days", "4–5 Days", "6+ Days"] as const;
const themes = [
  { key: "Family", icon: Users },
  { key: "Couple", icon: Heart },
  { key: "Weekend", icon: Calendar },
  { key: "Pilgrimage", icon: Landmark },
  { key: "Hill Station", icon: Mountain },
  { key: "Heritage", icon: Landmark },
  { key: "Beach", icon: Waves },
  { key: "Nature", icon: Palmtree },
  { key: "Group", icon: Users },
  { key: "Corporate", icon: Briefcase },
  { key: "Senior Citizens", icon: Baby },
  { key: "Custom", icon: Sparkles },
] as const;

const popularRoutes = [
  { from: "Bengaluru", to: "Mysuru", days: "1–2", vehicle: "Sedan", who: "Family" },
  { from: "Bengaluru", to: "Coorg", days: "2–3", vehicle: "SUV", who: "Couple" },
  { from: "Bengaluru", to: "Chikmagalur", days: "2", vehicle: "SUV", who: "Weekend" },
  { from: "Bengaluru", to: "Hampi", days: "2–3", vehicle: "Innova", who: "Heritage" },
  { from: "Bengaluru", to: "Ooty", days: "3", vehicle: "Innova", who: "Family" },
  { from: "Bengaluru", to: "Tirupati", days: "1", vehicle: "Sedan", who: "Pilgrimage" },
  { from: "Bengaluru", to: "Puducherry", days: "3", vehicle: "SUV", who: "Weekend" },
  { from: "Bengaluru", to: "Wayanad", days: "2–3", vehicle: "SUV", who: "Nature" },
  { from: "Bengaluru", to: "Rameswaram", days: "3–4", vehicle: "Innova Crysta", who: "Pilgrimage" },
  { from: "Bengaluru", to: "Munnar", days: "4–5", vehicle: "Innova Crysta", who: "Honeymoon" },
];

function TourPackagesPage() {
  const [state, setState] = useState<StateSlug>("all");
  const [duration, setDuration] = useState<(typeof durations)[number]>("Any");
  const [sort, setSort] = useState("recommended");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [detailPackage, setDetailPackage] = useState<TourPackage | null>(null);

  const [livePackages, setLivePackages] = useState<TourPackage[]>(packages);

  useEffect(() => {
    fetch("/api/packages")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.packages && d.packages.length > 0) {
          const mapped: TourPackage[] = d.packages.map((p: any) => ({
            slug: p.slug,
            title: p.title,
            duration: p.duration,
            from: p.from_city || "Bengaluru",
            states: Array.isArray(p.states) ? p.states : ["karnataka"],
            destinations: Array.isArray(p.destinations) ? p.destinations : [],
            vehicles: Array.isArray(p.vehicles) ? p.vehicles : ["Sedan", "SUV"],
            startingPrice: Number(p.starting_price || 0),
            image: p.image || "/images/packages/default.jpg",
            heroImage: p.hero_image || p.image,
            summary: p.summary,
            highlights: Array.isArray(p.highlights) ? p.highlights : [],
            itinerary: Array.isArray(p.itinerary)
              ? p.itinerary
              : typeof p.itinerary === "string"
                ? JSON.parse(p.itinerary)
                : [],
            inclusions: Array.isArray(p.inclusions) ? p.inclusions : [],
            exclusions: Array.isArray(p.exclusions) ? p.exclusions : [],
          }));
          setLivePackages(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list =
      state === "all"
        ? livePackages
        : livePackages.filter((p) => (p.states || []).includes(state as any));
    if (duration !== "Any") {
      list = list.filter((p) => {
        const nights = parseInt(p.duration.split(" ")[0], 10) || 0;
        if (duration === "1 Day") return nights <= 1;
        if (duration === "2–3 Days") return nights >= 2 && nights <= 3;
        if (duration === "4–5 Days") return nights >= 4 && nights <= 5;
        return nights >= 6;
      });
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => (a.startingPrice ?? 0) - (b.startingPrice ?? 0));
    if (sort === "price-desc") list = [...list].sort((a, b) => (b.startingPrice ?? 0) - (a.startingPrice ?? 0));
    if (sort === "duration") list = [...list].sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    return list;
  }, [livePackages, state, duration, sort]);

  const toggleCompare = (slug: string) => {
    setCompareIds((ids) => (ids.includes(slug) ? ids.filter((i) => i !== slug) : ids.length < 3 ? [...ids, slug] : ids));
  };

  return (
    <SiteLayout>
      {/* Section 1 — Hero */}
      <section className="relative overflow-hidden text-[color:var(--color-cream)]">
        <img
          src="/images/hero-travel.jpg"
          alt="Panoramic view of South India destinations — Karnataka, Andhra Pradesh, Tamil Nadu, Kerala and Puducherry"
          className="absolute inset-0 h-full w-full animate-[hero-pan_20s_ease-in-out_infinite] object-cover"
          loading="eager"
          width={1920}
          height={900}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-navy)]/85 via-[color:var(--color-navy)]/55 to-transparent" />
        <div className="relative container-fortune py-20 md:py-24 lg:py-28">
          <nav aria-label="Breadcrumb" className="text-xs opacity-80">
            <ol className="flex gap-1">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li aria-hidden>/</li>
              <li>Tour Packages</li>
            </ol>
          </nav>
          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Fortune Tourism · South India</p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl leading-tight md:text-6xl animate-fade-in">
            Explore South India with Fortune Tourism
          </h1>
          <p className="mt-4 max-w-2xl text-base opacity-90 md:text-lg">
            Thoughtfully planned journeys from Bengaluru to the most beautiful hill stations, heritage sites,
            coastal escapes, and temple towns of South India.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#packages"
              className="rounded-full bg-[color:var(--color-gold)] px-6 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition hover:brightness-110"
            >
              Browse All Packages
            </a>
            <a
              href="#packages"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20"
            >
              Explore Packages
            </a>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs opacity-90">
            {[
              "Customisable itineraries",
              "Professional drivers",
              "Comfortable vehicles",
              "Family & group packages",
              "Bengaluru pickup",
            ].map((c) => (
              <li key={c} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-gold)]" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 2 — Sticky state tabs */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-white/95 backdrop-blur">
        <div className="container-fortune">
          <div className="flex gap-2 overflow-x-auto py-3">
            <StateTab active={state === "all"} onClick={() => setState("all")} label="All States" count={packages.length} />
            {destinations.map((d) => (
              <StateTab
                key={d.slug}
                active={state === d.slug}
                onClick={() => setState(d.slug)}
                label={d.state}
                image={d.image}
                count={packages.filter((p) => p.states.includes(d.slug as TourPackage["states"][number])).length}
              />
            ))}
          </div>
        </div>
      </div>



      {/* Section 3 — Featured editorial */}
      <section className="py-14">
        <div className="container-fortune">
          <SectionHeader eyebrow="Featured" title="Signature South India journeys" />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {packages[0] && <FeaturedLarge pkg={packages[0]} />}
            <div className="grid gap-5">
              {packages.slice(1, 3).map((p) => (
                <FeaturedSmall key={p.slug} pkg={p} />
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.slice(3, 6).map((p) => (
              <FeaturedSmall key={p.slug} pkg={p} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Smart finder */}
      <section className="border-y border-border/60 bg-[color:var(--color-cream)]/60 py-14">
        <div className="container-fortune">
          <SectionHeader eyebrow="Smart Finder" title="Find your perfect South India trip" />
          <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
            <EnquiryForm presetService="Tour Package" />
          </div>
        </div>
      </section>

      {/* Section 5 & 6 — Filters + grid */}
      <section className="py-14" id="packages">
        <div className="container-fortune grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Desktop filters */}
          <aside className="hidden lg:block">
            <FiltersPanel
              state={state}
              setState={setState}
              duration={duration}
              setDuration={setDuration}
              onReset={() => {
                setState("all");
                setDuration("Any");
              }}
            />
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> packages match
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                </button>
                <label className="text-xs text-muted-foreground">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-full border border-border bg-white px-3 py-2 text-xs"
                >
                  <option value="recommended">Recommended</option>
                  <option value="duration">Duration: short to long</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No packages match your filters yet. Try adjusting them or request a custom itinerary.
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <PackageCard
                    key={p.slug}
                    pkg={p}
                    inCompare={compareIds.includes(p.slug)}
                    onCompare={() => toggleCompare(p.slug)}
                    onOpenDetails={() => setDetailPackage(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {detailPackage && (
        <PackageDetailsModal pkg={detailPackage} onClose={() => setDetailPackage(null)} />
      )}

      {/* Sections 8–12 — State highlights */}
      {destinations.map((d) => (
        <StateHighlight key={d.slug} slug={d.slug} onExplore={() => setState(d.slug)} />
      ))}

      {/* Section 13 — Themes */}
      <section className="py-14">
        <div className="container-fortune">
          <SectionHeader eyebrow="Travel Themes" title="Choose a journey that suits your style" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {themes.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Icon className="h-6 w-6 text-[color:var(--color-emerald)]" />
                <span className="text-sm font-semibold">{key}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 14 — Popular routes */}
      <section className="border-y border-border/60 bg-[color:var(--color-cream)]/60 py-14">
        <div className="container-fortune">
          <SectionHeader eyebrow="From Bengaluru" title="Popular routes travellers love" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {popularRoutes.map((r) => (
              <div key={r.to} className="rounded-2xl border border-border bg-white p-5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.from} →</p>
                <p className="mt-1 font-heading text-lg">{r.to}</p>
                <p className="mt-2 text-xs text-muted-foreground">{r.days} days · {r.vehicle}</p>
                <p className="mt-1 text-xs text-muted-foreground">Best for: {r.who}</p>
                <a
                  href="#packages"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-emerald)]"
                >
                  View packages <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 15 — Custom package builder */}
      <section className="py-14" id="custom-builder">
        <div className="container-fortune">
          <SectionHeader
            eyebrow="Custom Package"
            title="Build a South India tour that fits you perfectly"
          />
          <CustomBuilder />
        </div>
      </section>

      {/* Section 17 — Why Fortune */}
      <section className="border-t border-border/60 bg-[color:var(--color-navy)]/[0.03] py-14">
        <div className="container-fortune">
          <SectionHeader eyebrow="Why Fortune Tourism" title="South India expertise you can rely on" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPin, t: "South India experts", d: "Deep knowledge of routes, stays and hidden gems." },
              { icon: Car, t: "Comfortable vehicles", d: "Sedans, SUVs, Innovas & Tempo Travellers." },
              { icon: ShieldCheck, t: "Verified drivers", d: "Trained, uniformed and background checked." },
              { icon: Sparkles, t: "Transparent quotes", d: "Written itineraries with clear inclusions." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border bg-white p-5">
                <Icon className="h-5 w-5 text-[color:var(--color-emerald)]" />
                <p className="mt-3 font-heading text-lg">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 18 — Travel stories */}
      <section className="py-14">
        <div className="container-fortune">
          <SectionHeader eyebrow="Travel Stories" title="Real customers, real South India journeys" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center gap-1 text-[color:var(--color-gold)]">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-2 text-sm">"{t.text}"</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t.name} · {t.route} · {t.vehicle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 19 — Final CTA */}
      <section className="relative overflow-hidden text-[color:var(--color-cream)]">
        <img src="/images/cta-road.jpg" alt="Scenic South Indian road" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-navy)]/85 to-[color:var(--color-navy)]/40" />
        <div className="relative container-fortune py-16 md:py-20">
          <h2 className="max-w-3xl font-heading text-3xl md:text-5xl">Your South India journey starts in Bengaluru</h2>
          <p className="mt-3 max-w-2xl opacity-90">
            Tell us your destination, travel dates and group size. We'll craft a comfortable, memorable South India tour.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#custom-builder" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-emerald)] px-6 py-3 text-sm font-semibold hover:brightness-110">
              Plan My Trip
            </a>
            <a
              href={buildWhatsAppUrl({ service: "Tour Package", pickup: "Bengaluru" })}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
            </a>
            <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold">
              <Phone className="h-4 w-4" /> Call Now
            </a>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg">Filters</h3>
              <button type="button" onClick={() => setShowFilters(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersPanel
              state={state}
              setState={setState}
              duration={duration}
              setDuration={setDuration}
              onReset={() => {
                setState("all");
                setDuration("Any");
              }}
            />
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="mt-5 w-full rounded-full bg-[color:var(--color-navy)] py-3 text-sm font-semibold text-[color:var(--color-cream)]"
            >
              Apply filters
            </button>
          </div>
        </div>
      )}

      {/* Compare floating bar */}
      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white shadow-lg" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="container-fortune flex items-center gap-3 py-3">
            <p className="text-xs font-semibold">Compare ({compareIds.length}/3):</p>
            <div className="flex flex-1 flex-wrap gap-2">
              {compareIds.map((id) => {
                const p = packages.find((pk) => pk.slug === id)!;
                return (
                  <span key={id} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                    {p.title}
                    <button type="button" aria-label="Remove" onClick={() => toggleCompare(id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              disabled={compareIds.length < 2}
              onClick={() => setShowCompare(true)}
              className="rounded-full bg-[color:var(--color-emerald)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Compare now
            </button>
          </div>
        </div>
      )}

      {/* Compare modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-2xl">Compare packages</h3>
              <button type="button" onClick={() => setShowCompare(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3">Attribute</th>
                    {compareIds.map((id) => {
                      const p = packages.find((pk) => pk.slug === id)!;
                      return <th key={id} className="py-2 pr-3 font-heading">{p.title}</th>;
                    })}
                  </tr>
                </thead>
                <tbody className="[&_tr]:border-b [&_tr]:border-border/60 [&_td]:py-3 [&_td]:pr-3 [&_td]:align-top">
                  <CompareRow label="Duration" ids={compareIds} render={(p) => p.duration} />
                  <CompareRow label="Destinations" ids={compareIds} render={(p) => p.destinations.join(" · ")} />
                  <CompareRow label="Vehicles" ids={compareIds} render={(p) => p.vehicles.join(", ")} />
                  <CompareRow label="From price" ids={compareIds} render={(p) => (p.startingPrice ? `₹${p.startingPrice.toLocaleString("en-IN")}` : "On request")} />
                  <CompareRow label="Inclusions" ids={compareIds} render={(p) => p.inclusions.join(", ")} />
                  <CompareRow label="Exclusions" ids={compareIds} render={(p) => p.exclusions.join(", ")} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

/* -------------------- helpers -------------------- */

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-emerald)]">{eyebrow}</p>
      <h2 className="mt-2 font-heading text-3xl md:text-4xl">{title}</h2>
    </div>
  );
}

function StateTab({ active, onClick, label, image, count }: { active: boolean; onClick: () => void; label: string; image?: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
        (active
          ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-[color:var(--color-cream)]"
          : "border-border bg-white hover:border-[color:var(--color-navy)]/40")
      }
    >
      {image ? (
        <img src={image} alt="" className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span className="h-6 w-6 rounded-full bg-muted" />
      )}
      {label}
      <span className={"rounded-full px-1.5 py-0.5 text-[10px] " + (active ? "bg-white/20" : "bg-muted")}>{count}</span>
    </button>
  );
}

function FeaturedLarge({ pkg }: { pkg: TourPackage }) {
  return (
    <Link
      to="/tour-packages/$packageId"
      params={{ packageId: pkg.slug }}
      className="group relative col-span-1 flex min-h-[420px] overflow-hidden rounded-3xl lg:col-span-2 lg:row-span-2"
    >
      <img src={pkg.image} alt={pkg.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="relative mt-auto p-6 text-white">
        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
          Featured
        </span>
        <h3 className="mt-3 font-heading text-3xl md:text-4xl">{pkg.title}</h3>
        <p className="mt-2 text-sm opacity-90">{pkg.duration} · from {pkg.from}</p>
        <p className="mt-3 max-w-lg text-sm opacity-90">{pkg.summary}</p>
        <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
          View package <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}

function FeaturedSmall({ pkg, compact }: { pkg: TourPackage; compact?: boolean }) {
  return (
    <Link
      to="/tour-packages/$packageId"
      params={{ packageId: pkg.slug }}
      className={"group relative flex overflow-hidden rounded-3xl " + (compact ? "min-h-[200px]" : "min-h-[200px]")}
    >
      <img src={pkg.image} alt={pkg.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="relative mt-auto p-5 text-white">
        <p className="text-[10px] uppercase tracking-wider opacity-80">{pkg.duration}</p>
        <h4 className="mt-1 font-heading text-xl">{pkg.title}</h4>
      </div>
    </Link>
  );
}

function PackageCard({
  pkg,
  inCompare,
  onCompare,
  onOpenDetails,
}: {
  pkg: TourPackage;
  inCompare: boolean;
  onCompare: () => void;
  onOpenDetails?: () => void;
}) {
  const stateNames = pkg.states
    .map((s) => destinations.find((d) => d.slug === s)?.state ?? s)
    .join(", ");
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pkg.image}
          alt={`${pkg.title} — ultra-realistic South India tour photograph`}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
          width={800}
          height={600}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/assets/pkg-mysuru-palace.jpg";
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold text-[color:var(--color-navy)]">
          {stateNames}
        </span>
        <button
          type="button"
          onClick={onCompare}
          className={
            "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur transition " +
            (inCompare ? "bg-[color:var(--color-emerald)] text-white" : "bg-white/90 text-foreground hover:bg-white")
          }
        >
          {inCompare ? "✓ Compare" : "+ Compare"}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg">{pkg.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> {pkg.duration}
          <span className="mx-1">·</span>
          <MapPin className="h-3.5 w-3.5" /> {pkg.from}
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{pkg.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {pkg.destinations.slice(0, 3).map((d) => (
            <span key={d} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{d}</span>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Vehicles: {pkg.vehicles.join(" · ")}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
            <p className="font-heading text-lg text-[color:var(--color-navy)]">
              {pkg.startingPrice ? `₹${pkg.startingPrice.toLocaleString("en-IN")}` : "Get quote"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/booking"
              search={{ service: "TOUR", package: pkg.slug }}
              className="inline-flex items-center gap-1 rounded-full bg-purple-600 hover:bg-purple-700 px-3 py-2 text-xs font-semibold text-white transition shadow-2xs"
            >
              Book
            </Link>
            <button
              type="button"
              onClick={onOpenDetails}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold hover:border-[color:var(--color-navy)]/40"
            >
              Details <ArrowRight className="h-3 w-3" />
            </button>
            <a
              href={buildWhatsAppUrl({ service: "Tour Package", package: pkg.title })}
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp enquiry"
              className="inline-flex items-center rounded-full bg-[color:var(--color-emerald)] px-3 py-2 text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function PackageDetailsModal({ pkg, onClose }: { pkg: TourPackage; onClose: () => void }) {
  const waUrl = buildWhatsAppUrl({
    service: "Tour Package",
    package: pkg.title,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-border p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100 mb-6">
          <img src={pkg.image} alt={pkg.title} className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[color:var(--color-navy)] backdrop-blur">
            {pkg.duration}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl text-[#12213b]">{pkg.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">From {pkg.from} · {pkg.destinations.join(" · ")}</p>
          </div>
          {pkg.startingPrice && (
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Starting from</p>
              <p className="font-heading text-2xl text-[color:var(--color-navy)]">₹{pkg.startingPrice.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{pkg.summary}</p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Available Vehicles</h4>
          <p className="text-sm font-semibold text-slate-800">{pkg.vehicles.join(" · ")}</p>
        </div>

        <div className="mt-5 rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">Inclusions</h4>
          <ul className="grid grid-cols-2 gap-1.5 text-xs text-emerald-900">
            {pkg.inclusions.map((inc) => (
              <li key={inc} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {inc}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row border-t border-border pt-6">
          <Link
            to="/booking"
            search={{ service: "TOUR", package: pkg.slug }}
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow hover:brightness-110"
          >
            Book Tour Online <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--color-emerald)] px-6 py-3 text-sm font-bold text-white shadow hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" /> Book on WhatsApp
          </a>
          <Link
            to="/tour-packages/$packageId"
            params={{ packageId: pkg.slug }}
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[color:var(--color-navy)] bg-white px-6 py-3 text-sm font-bold text-[color:var(--color-navy)] hover:bg-slate-50"
          >
            View Full Package Page <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FiltersPanel({
  state,
  setState,
  duration,
  setDuration,
  onReset,
}: {
  state: StateSlug;
  setState: (s: StateSlug) => void;
  duration: (typeof durations)[number];
  setDuration: (d: (typeof durations)[number]) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["all", ...destinations.map((d) => d.slug)] as StateSlug[]).map((s) => {
            const label = s === "all" ? "All" : destinations.find((d) => d.slug === s)?.state ?? s;
            const active = state === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setState(s)}
                className={
                  "rounded-full border px-3 py-1.5 text-xs " +
                  (active
                    ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-[color:var(--color-cream)]"
                    : "border-border bg-white")
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {durations.map((d) => {
            const active = duration === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={
                  "rounded-full border px-3 py-1.5 text-xs " +
                  (active
                    ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-[color:var(--color-cream)]"
                    : "border-border bg-white")
                }
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-semibold text-[color:var(--color-emerald)] hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}

function StateHighlight({ slug, onExplore }: { slug: string; onExplore: () => void }) {
  const d = destinations.find((x) => x.slug === slug);
  if (!d) return null;
  return (
    <section className="py-14 odd:bg-white even:bg-[color:var(--color-cream)]/40">
      <div className="container-fortune grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={d.image}
            alt={`Ultra-realistic ${d.state} travel photograph featured in a Fortune Tourism package from Bengaluru`}
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-emerald)]">{d.label}</p>
          <h2 className="mt-2 font-heading text-3xl md:text-4xl">{d.heading}</h2>
          <p className="mt-3 italic text-muted-foreground">"{d.quote}"</p>
          <p className="mt-4 text-sm text-muted-foreground">{d.blurb}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {d.highlights.map((h) => (
              <span key={h} className="rounded-full border border-border bg-white px-3 py-1 text-xs">{h}</span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              onExplore();
              setTimeout(() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" }), 50);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-cream)] hover:brightness-110"
          >
            Explore {d.state} packages <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function CustomBuilder() {
  const [step, setStep] = useState(1);
  const total = 4;
  return (
    <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={
                "h-1.5 w-10 rounded-full " +
                (i < step ? "bg-[color:var(--color-emerald)]" : "bg-muted")
              }
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Step {step} of {total}</p>
      </div>

      <div className="mt-6 min-h-[220px]">
        {step === 1 && (
          <StepBlock title="Trip basics">
            <Field label="Starting city"><input className={fieldCls} defaultValue="Bengaluru" /></Field>
            <Field label="Preferred states"><input className={fieldCls} placeholder="Karnataka, Kerala…" /></Field>
            <Field label="Travel date"><input type="date" className={fieldCls} /></Field>
            <Field label="Number of days"><input type="number" min={1} className={fieldCls} placeholder="4" /></Field>
          </StepBlock>
        )}
        {step === 2 && (
          <StepBlock title="Travellers">
            <Field label="Adults"><input type="number" min={1} className={fieldCls} placeholder="2" /></Field>
            <Field label="Children"><input type="number" min={0} className={fieldCls} placeholder="0" /></Field>
            <Field label="Rooms"><input type="number" min={1} className={fieldCls} placeholder="1" /></Field>
            <Field label="Group type">
              <select className={fieldCls}>
                <option>Family</option><option>Couple</option><option>Friends</option>
                <option>Corporate</option><option>Pilgrimage Group</option><option>Senior Citizens</option>
              </select>
            </Field>
          </StepBlock>
        )}
        {step === 3 && (
          <StepBlock title="Preferences">
            <Field label="Vehicle">
              <select className={fieldCls}>
                <option>Let Fortune Tourism recommend</option>
                <option>Sedan</option><option>Ertiga / SUV</option><option>Innova</option>
                <option>Innova Crysta</option><option>Tempo Traveller</option><option>Mini Bus</option>
              </select>
            </Field>
            <Field label="Hotel">
              <select className={fieldCls}>
                <option>Let Fortune Tourism recommend</option>
                <option>No hotel required</option><option>Budget</option><option>Standard</option>
                <option>Deluxe</option><option>Premium</option><option>Luxury</option>
              </select>
            </Field>
            <Field label="Theme">
              <select className={fieldCls}>
                {themes.map((t) => <option key={t.key}>{t.key}</option>)}
              </select>
            </Field>
            <Field label="Budget (₹)"><input type="number" className={fieldCls} placeholder="25000" /></Field>
          </StepBlock>
        )}
        {step === 4 && (
          <StepBlock title="Your details">
            <Field label="Full name"><input className={fieldCls} placeholder="Your name" /></Field>
            <Field label="Mobile number"><input className={fieldCls} placeholder="+91 …" /></Field>
            <Field label="Email"><input type="email" className={fieldCls} placeholder="you@example.com" /></Field>
            <Field label="Preferred callback">
              <select className={fieldCls}>
                <option>Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option>
              </select>
            </Field>
          </StepBlock>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          Back
        </button>
        {step < total ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(total, s + 1))}
            className="rounded-full bg-[color:var(--color-navy)] px-6 py-2.5 text-sm font-semibold text-[color:var(--color-cream)]"
          >
            Continue
          </button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={buildWhatsAppUrl({ service: "Custom Tour Package", pickup: "Bengaluru" })}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-emerald)] px-6 py-2.5 text-sm font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" /> Continue on WhatsApp
            </a>
            <button
              type="button"
              className="rounded-full bg-[color:var(--color-navy)] px-6 py-2.5 text-sm font-semibold text-[color:var(--color-cream)]"
            >
              Create my custom package
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const fieldCls =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-navy)] focus:ring-2 focus:ring-[color:var(--color-navy)]/20";

function StepBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-heading text-xl">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function CompareRow({ label, ids, render }: { label: string; ids: string[]; render: (p: TourPackage) => string }) {
  return (
    <tr>
      <td className="font-semibold">{label}</td>
      {ids.map((id) => {
        const p = packages.find((pk) => pk.slug === id)!;
        return <td key={id}>{render(p)}</td>;
      })}
    </tr>
  );
}

// unused helper to satisfy ChevronDown import trimming — remove if not needed
export const _icons = { ChevronDown };