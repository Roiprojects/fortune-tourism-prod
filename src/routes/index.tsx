import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  MapPin,
  Phone,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { useParallax } from "@/hooks/useParallax";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { StateTourPackages } from "@/components/home/StateTourPackages";
import { TravelServicesSection } from "@/components/home/TravelServicesSection";
import { FleetBanner } from "@/components/home/FleetBanner";
import { FleetShowcase } from "@/components/home/FleetShowcase";
import { PremiumQuickEnquiry } from "@/components/home/PremiumQuickEnquiry";
import karnatakaHeroAsset from "@/assets/karnataka-hero.jpg";
const karnatakaHero = karnatakaHeroAsset;
import andhraHeroAsset from "@/assets/andhra-hero.jpg";
const andhraHero = andhraHeroAsset;
import tamilnaduHeroAsset from "@/assets/tamilnadu-hero.jpg";
const tamilnaduHero = tamilnaduHeroAsset;
import pondicherryHeroAsset from "@/assets/pondicherry-hero.jpg";
const pondicherryHero = pondicherryHeroAsset;
import keralaHeroAsset from "@/assets/kerala-hero.jpg";
const keralaHero = keralaHeroAsset;
import southIndiaSpecial from "@/assets/south-india-special.jpg";
import destKarnataka from "@/assets/destination-gallery/karnataka.jpg";
import destTamilNadu from "@/assets/destination-gallery/tamilnadu.jpg";
import destKerala from "@/assets/destination-gallery/kerala.jpg";
import destAndhra from "@/assets/destination-gallery/andhra.jpg";
import destPondicherry from "@/assets/destination-gallery/pondicherry.jpg";
import destSouthIndia from "@/assets/destination-gallery/southindia.jpg";
import TrustStatistics from "@/components/home/TrustStatistics";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { vehicles } from "@/data/vehicles";
import {
  trustPoints,
  bookingSteps,
  testimonials,
  faqs,
} from "@/data/site";
import { CONTACT, buildWhatsAppUrl } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/site/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fortune Tourism | South India Car Rentals & Tour Packages" },
      {
        name: "description",
        content:
          "Chauffeur-driven car rentals, curated tour packages and Bengaluru airport transfers across Karnataka, Andhra Pradesh, Tamil Nadu, Kerala & Puducherry.",
      },
      { property: "og:title", content: "Fortune Tourism | South India Car Rentals & Tour Packages" },
      {
        property: "og:description",
        content: "Chauffeur-driven car rentals, curated tour packages and Bengaluru airport transfers across Karnataka, Andhra Pradesh, Tamil Nadu, Kerala & Puducherry.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <KarnatakaHero />
      <PremiumQuickEnquiry />
      <TrustStatistics />
      <TravelServicesSection />
      <FleetBanner />
      <FleetShowcase />
      <ExploreDestinationsBento />
      {/* ServicesGrid removed per request */}
      <StateTourPackages />

      {/* FleetPreview removed */}
      <RouteMap />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <FAQSection />
      {/* FinalCTA removed */}
    </SiteLayout>
  );
}

/* --- Hero Carousel --- */
function HeroSlideOverlay({
  state,
  title,
  subtitle,
  quote,
}: {
  state: string;
  title: string;
  subtitle: string;
  quote: string;
}) {
  const waHref = buildWhatsAppUrl({
    destination: state,
    service: `${state} Tour Package`,
    notes: `Enquiry from ${state} hero banner`,
  });
  const stop = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-4"
      onMouseEnter={stop as unknown as React.MouseEventHandler}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
      <div className="pointer-events-auto relative flex w-full max-w-[900px] flex-col items-center text-center text-white">
        <p className="font-heading text-[10px] uppercase tracking-[0.3em] text-[#f6d67a] sm:text-xs md:text-sm">
          Explore
        </p>
        <h1
          className="mt-1 font-heading font-bold leading-[1.02] tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]"
          style={{ fontSize: "clamp(1.9rem, 6.5vw, 4.5rem)" }}
        >
          {title}
        </h1>
        <div className="mt-2 flex items-center gap-2 sm:mt-3">
          <span className="h-px w-6 bg-[#f6d67a]/80 sm:w-10" />
          <p className="font-heading text-[11px] uppercase tracking-[0.22em] text-white/90 sm:text-sm md:text-base">
            {subtitle}
          </p>
          <span className="h-px w-6 bg-[#f6d67a]/80 sm:w-10" />
        </div>
        <p
          className="mx-auto mt-3 max-w-[92%] font-serif italic text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:mt-4 sm:max-w-[640px]"
          style={{ fontSize: "clamp(0.82rem, 1.9vw, 1.15rem)", lineHeight: 1.45 }}
        >
          &ldquo;{quote}&rdquo;
        </p>
        <div className="mt-4 flex flex-row items-center justify-center gap-2 sm:mt-5 sm:gap-3">
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer noopener"
            onClick={stop}
            onTouchStart={stop}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            WhatsApp
          </a>
          <Link
            to="/contact"
            hash="enquiry"
            onClick={stop as unknown as React.MouseEventHandler}
            onTouchStart={stop as unknown as React.TouchEventHandler}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#f6d67a] to-[#d4a53a] px-4 py-2 text-xs font-semibold text-[#2b1d05] shadow-lg transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Enquire Now
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
        <div className="mt-2.5 sm:mt-3 flex items-center justify-center">
          <a
            href="tel:+919740463404"
            onClick={stop}
            onTouchStart={stop}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/60 border border-white/30 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-black/80 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <Phone className="h-3.5 w-3.5 text-[#f6d67a] sm:h-4 sm:w-4" />
            <span>9740463404</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function KarnatakaHero() {
  const slides = [
    {
      src: karnatakaHero,
      alt: "Karnataka — Mysore Palace, Vidhana Soudha, Hampi chariot, Jog Falls and Coorg tea gardens.",
      state: "Karnataka",
      title: "KARNATAKA",
      subtitle: "One State. Endless Experiences.",
      quote: "From royal palaces to whispering waterfalls — every road here tells a story.",
    },
    {
      src: andhraHero,
      alt: "Andhra Pradesh — Tirupati temple, Charminar, Araku Valley train, Borra Caves and coastal sunsets.",
      state: "Andhra Pradesh",
      title: "ANDHRA PRADESH",
      subtitle: "Spiritual. Scenic. Unforgettable.",
      quote: "Temple bells, hill trains and golden shores — the soul of the south awaits.",
    },
    {
      src: tamilnaduHero,
      alt: "Tamil Nadu — Meenakshi Amman Temple, Brihadeeswarar Temple, Marina Beach, Nilgiri Railway and Vivekananda Rock.",
      state: "Tamil Nadu",
      title: "TAMIL NADU",
      subtitle: "Land of Heritage, Nature & Spirituality.",
      quote: "Temples, coastlines and cool hill escapes — a journey of culture in every direction.",
    },
    {
      src: pondicherryHero,
      alt: "Pondicherry — French Quarter, Promenade Beach, Auroville Matrimandir, Paradise Beach and the Basilica.",
      state: "Pondicherry",
      title: "PONDICHERRY",
      subtitle: "A French Soul by the Sea.",
      quote: "Cobbled lanes, café mornings and turquoise waters — a little Europe on Indian shores.",
    },
    {
      src: keralaHero,
      alt: "Kerala — Kathakali artist, Munnar tea hills, Alleppey backwaters, Chinese fishing nets and temple architecture.",
      state: "Kerala",
      title: "KERALA",
      subtitle: "God's Own Country.",
      quote: "Backwaters, misty hills and coconut coasts — where nature slows time down.",
    },
  ];
  const [i, setI] = useState(0);
  const n = slides.length;

  // Continuous auto-sliding timer every 4 seconds
  useEffect(() => {
    const id = window.setInterval(() => {
      setI((v) => (v + 1) % n);
    }, 4000);
    return () => window.clearInterval(id);
  }, [n]);

  const touch = { x: 0 };
  const parallaxRef = useParallax<HTMLDivElement>(0.12);

  return (
    <section className="relative w-full bg-[#f7f1e7] pt-3 pb-6 md:pt-5 md:pb-8" aria-roledescription="carousel">
      <div
        className="relative mx-auto w-[calc(100%-16px)] max-w-[1440px] overflow-hidden rounded-[24px] bg-[#f7f1e7] shadow-[0_20px_50px_rgba(68,45,15,0.12)] md:w-[calc(100%-32px)] md:rounded-[32px]"
        onTouchStart={(e) => { touch.x = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.x;
          if (Math.abs(dx) > 40) setI((v) => (v + (dx < 0 ? 1 : -1) + n) % n);
        }}
      >
        <div ref={parallaxRef} className="parallax home-hero relative w-full">
          {slides.map((s, idx) => {
            const isActive = idx === i;
            return (
              <div
                key={idx}
                className={`absolute inset-0 overflow-hidden transition-all duration-1000 ease-in-out ${
                  isActive
                    ? "opacity-100 scale-100 z-[1] translate-x-0"
                    : idx < i
                    ? "opacity-0 scale-105 z-0 -translate-x-full"
                    : "opacity-0 scale-105 z-0 translate-x-full"
                }`}
                aria-hidden={!isActive}
                aria-label={`Explore ${s.state} tour packages`}
              >
                <img
                  src={s.src}
                  alt={s.alt}
                  width={1920}
                  height={1080}
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  decoding="async"
                  className={`h-full w-full object-cover [object-position:center_center] transition-transform duration-[4000ms] ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                />
                <HeroSlideOverlay
                  state={s.state}
                  title={s.title}
                  subtitle={s.subtitle}
                  quote={s.quote}
                />
              </div>
            );
          })}
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setI((v) => (v - 1 + n) % n)}
            className="glass absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-black shadow-lg transition hover:scale-105 hover:bg-white md:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setI((v) => (v + 1) % n)}
            className="glass absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-black shadow-lg transition hover:scale-105 hover:bg-white md:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-2.5 rounded-full backdrop-blur transition-all duration-500 ${
                  idx === i ? "w-8 bg-white shadow-lg" : "w-2.5 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = destinations.length;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % n), 7500);
    return () => window.clearInterval(id);
  }, [paused, n]);

  const go = (d: number) => {
    setPaused(true);
    setI((v) => (v + d + n) % n);
  };

  return (
    <section
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[color:var(--color-navy)] text-[color:var(--color-cream)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {destinations.map((d, idx) => (
        <div
          key={d.slug}
          className={
            "absolute inset-0 transition-opacity duration-1000 ease-out " +
            (idx === i ? "opacity-100" : "opacity-0 pointer-events-none")
          }
          aria-hidden={idx !== i}
        >
          <img
            src={d.image}
            alt={`${d.state} — ${d.highlights.slice(0, 3).join(", ")}`}
            className={"h-full w-full object-cover " + (idx === i ? "animate-kenburns" : "")}
            loading={idx === 0 ? "eager" : "lazy"}
            width={1600}
            height={1000}
          />
          <div className="absolute inset-0 bg-hero-gradient" />
        </div>
      ))}

      <div className="relative z-10 flex h-full flex-col">
        <div className="mt-auto container-fortune pb-28 md:pb-36">
          {destinations.map((d, idx) => (
            <div
              key={d.slug}
              className={
                "max-w-2xl transition-all duration-700 " +
                (idx === i ? "opacity-100 translate-y-0" : "hidden opacity-0 translate-y-4")
              }
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">{d.label}</p>
              <h1 className="mt-4 font-heading text-4xl leading-tight md:text-6xl">
                {d.heading}
              </h1>
              <p className="mt-4 max-w-xl text-base italic opacity-90 md:text-lg">"{d.quote}"</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/tour-packages"
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-gold)] px-6 py-3 text-sm font-semibold text-[color:var(--color-navy)] hover:brightness-110"
                >
                  Explore {d.state} <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={buildWhatsAppUrl({ destination: d.state, service: "Tour Package" })}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Plan on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="container-fortune flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => go(-1)} aria-label="Previous slide" className="rounded-full border border-white/30 p-2 hover:bg-white/10">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next slide" className="rounded-full border border-white/30 p-2 hover:bg-white/10">
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="ml-3 text-xs opacity-80">
              {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2 pl-6">
            {destinations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setPaused(true); setI(idx); }}
                className="h-0.5 flex-1 overflow-hidden bg-white/25"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={"block h-full bg-[color:var(--color-gold)] transition-all duration-500 " + (idx === i ? "w-full" : "w-0")}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Quick enquiry overlapping the hero --- */
function QuickEnquiry() {
  return (
    <section className="relative -mt-24 md:-mt-20">
      <div className="container-fortune">
        <Reveal className="rounded-3xl border border-border bg-card p-6 shadow-xl md:p-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-emerald)]">Plan in a minute</p>
              <h2 className="mt-1 font-heading text-2xl md:text-3xl">Tell us where you'd like to go</h2>
            </div>
            <p className="text-sm text-muted-foreground">Written quote within 15 minutes.</p>
          </div>
          <EnquiryForm />
        </Reveal>
      </div>
    </section>
  );
}

/* --- Explore --- */
function ExploreSouthIndia() {
  return (
    <section className="bg-[color:var(--color-lightgrey)] py-20 md:py-28">
      <div className="container-fortune">
        <SectionHeader eyebrow="Explore" title="Five states, one seamless journey" />
        <div className="mt-12 grid gap-5 md:grid-cols-6 md:grid-rows-2">
          {destinations.map((d, idx) => {
            const spans = [
              "md:col-span-3 md:row-span-2",
              "md:col-span-3",
              "md:col-span-2",
              "md:col-span-4",
              "md:col-span-6",
            ];
            return (
              <Reveal key={d.slug} delay={idx * 100} variant="scale" className={spans[idx]}>
                <Link to="/tour-packages" className="card-lift group relative block h-full min-h-[220px] overflow-hidden rounded-2xl shadow-md">
                  <img
                    src={d.image}
                    alt={d.state}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                    loading="lazy"
                    width={1600}
                    height={1000}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-navy)]/20 via-transparent to-[color:var(--color-gold)]/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col justify-end p-6 text-[color:var(--color-cream)]">
                    <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">{d.packageCount} packages</p>
                    <h3 className="mt-2 font-heading text-2xl md:text-3xl">{d.state}</h3>
                    <p className="mt-1 line-clamp-1 text-sm opacity-90">{d.highlights.slice(0, 4).join(" · ")}</p>
                    <span className="mt-3 inline-flex w-max items-center gap-1 rounded-full border border-white/40 px-3 py-1 text-xs font-medium">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --- Explore Destinations Bento (reference layout: 4 cols × 2 rows) --- */
function ExploreDestinationsBento() {
  const tiles = [
    {
      name: "Karnataka",
      image: destKarnataka,
      alt: "Mysore Palace illuminated during evening in Karnataka",
      to: "/tour-packages" as const,
      area: "md:col-span-1 md:row-span-2",
      minH: "min-h-[420px] md:min-h-[720px]",
      position: "center 60%",
    },
    {
      name: "Tamil Nadu",
      image: destTamilNadu,
      alt: "Meenakshi Amman Temple towers in Tamil Nadu",
      to: "/tour-packages" as const,
      area: "md:col-span-2 md:row-span-1",
      minH: "min-h-[240px] md:min-h-[350px]",
      position: "center 40%",
    },
    {
      name: "Kerala",
      image: destKerala,
      alt: "Luxury houseboat travelling through Kerala backwaters",
      to: "/tour-packages" as const,
      area: "md:col-span-1 md:row-span-1",
      minH: "min-h-[240px] md:min-h-[350px]",
      position: "center center",
    },
    {
      name: "Andhra Pradesh",
      image: destAndhra,
      alt: "Gandikota Canyon landscape in Andhra Pradesh",
      to: "/tour-packages" as const,
      area: "md:col-span-1 md:row-span-1",
      minH: "min-h-[240px] md:min-h-[350px]",
      position: "center 55%",
    },
    {
      name: "Pondicherry",
      image: destPondicherry,
      alt: "French colonial street in Pondicherry White Town",
      to: "/tour-packages" as const,
      area: "md:col-span-1 md:row-span-1",
      minH: "min-h-[240px] md:min-h-[350px]",
      position: "center center",
    },
    {
      name: "South India Special Tours",
      image: destSouthIndia,
      alt: "Scenic South India travel destination landscape",
      to: "/tour-packages" as const,
      area: "md:col-span-1 md:row-span-1",
      minH: "min-h-[240px] md:min-h-[350px]",
      position: "center center",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-[calc(100%-24px)] max-w-[1880px] md:w-[calc(100%-32px)]">
        <Reveal variant="up">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-emerald)]">
              Explore
            </p>
            <h2 className="mt-3 font-heading text-3xl md:text-4xl">
              Explore South India Tour Destinations
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              Discover the most beautiful places across Karnataka, Tamil Nadu,
              Kerala, Andhra Pradesh and Pondicherry.
            </p>
          </div>
        </Reveal>

        <div className="destination-gallery-grid mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-14 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          {tiles.map((t, idx) => (
            <Reveal
              key={t.name}
              delay={idx * 80}
              variant="scale"
              className={`${t.area}`}
            >
              <Link
                to={t.to}
                className={`group relative block h-full w-full overflow-hidden rounded-2xl bg-[#e9e5dc] ${t.minH}`}
                aria-label={t.name}
              >
                <img
                  src={t.image}
                  alt={t.alt}
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1000}
                  style={{ objectPosition: t.position }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0) 70%)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-navy)]/10 via-transparent to-[color:var(--color-gold)]/15 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <h3 className="font-heading text-xl font-semibold text-white drop-shadow-md md:text-2xl">
                    {t.name}
                  </h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Featured packages --- */
function FeaturedPackages() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-fortune">
        <SectionHeader eyebrow="Featured" title="Tour packages built from Bengaluru" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p, idx) => (
            <Reveal key={p.slug} delay={idx * 90} variant="up">
              <article className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.title} loading="lazy" width={1200} height={900} className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-[color:var(--color-navy)]">{p.duration}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-xl">{p.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> from {p.from}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                    {p.vehicles.slice(0, 3).map((v) => (
                      <span key={v} className="rounded-full bg-[color:var(--color-lightgrey)] px-2 py-0.5">{v}</span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Starting at</p>
                      <p className="font-heading text-lg text-[color:var(--color-navy)]">₹ {p.startingPrice?.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to="/tour-packages/$packageId"
                        params={{ packageId: p.slug }}
                        className="inline-flex items-center rounded-full border border-[color:var(--color-navy)]/20 px-3 py-2 text-xs font-medium text-[color:var(--color-navy)] hover:bg-[color:var(--color-navy)]/5"
                      >
                        Details
                      </Link>
                      <a
                        href={buildWhatsAppUrl({ package: p.title, service: "Tour Package" })}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-emerald)] px-3 py-2 text-xs font-medium text-[color:var(--color-cream)]"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" /> Enquire
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Fleet --- */
function FleetPreview() {
  return (
    <section className="bg-[color:var(--color-lightgrey)] py-20 md:py-28">
      <div className="container-fortune">
        <SectionHeader eyebrow="Our Fleet" title="Vehicles for every kind of trip" />
        <div className="mt-12 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
          {vehicles.map((v, idx) => (
            <Reveal key={v.slug} delay={idx * 70} variant="up" className="min-w-[260px] snap-start md:min-w-0">
              <article className="card-lift flex h-full flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--color-navy)]/5 to-[color:var(--color-emerald)]/10">
                  <VehicleIllustration category={v.category} />
                </div>
                <h3 className="mt-4 font-heading text-lg">{v.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{v.bestFor}</p>
                <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <li>{v.seats} seats</li>
                  <li>{v.luggage}</li>
                </ul>
                <Link
                  to="/car-rentals/$vehicleId"
                  params={{ vehicleId: v.slug }}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[color:var(--color-emerald)]"
                >
                  View vehicle <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VehicleIllustration({ category }: { category: string }) {
  return (
    <svg viewBox="0 0 120 60" className="h-20 w-40 text-[color:var(--color-navy)]" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <title>{category}</title>
      <path d="M8 42h104" strokeLinecap="round" opacity=".2" />
      <path d="M18 42c-4 0-7-3-7-7v-6l6-2 8-10c1.5-2 4-3 6.5-3h39c2.5 0 5 1 6.5 3l8 10 6 2v6c0 4-3 7-7 7" strokeLinejoin="round" />
      <circle cx="34" cy="42" r="6" fill="currentColor" />
      <circle cx="86" cy="42" r="6" fill="currentColor" />
      <path d="M30 30l7-8h20l7 8" opacity=".4" />
    </svg>
  );
}

/* --- Route map --- */
function RouteMap() {
  const stops = ["Bengaluru", "Mysuru", "Coorg", "Ooty", "Tirupati", "Munnar", "Puducherry"];
  return (
    <section className="py-20 md:py-28">
      <div className="container-fortune">
        <SectionHeader eyebrow="On the road" title="Starting from Bengaluru, across South India" center />
        <Reveal className="mt-12">
          <div className="rounded-3xl bg-[color:var(--color-navy)] p-8 text-[color:var(--color-cream)] md:p-12">
            <svg viewBox="0 0 1000 240" className="h-auto w-full">
              <defs>
                <linearGradient id="rline" x1="0" x2="1">
                  <stop offset="0%" stopColor="var(--color-gold)" />
                  <stop offset="100%" stopColor="var(--color-emerald)" />
                </linearGradient>
              </defs>
              <path
                d="M40 180 C 150 60, 250 60, 320 140 S 500 220, 580 120 S 780 40, 880 160 L 960 120"
                stroke="url(#rline)"
                strokeWidth="3"
                fill="none"
                className="draw-route"
                strokeLinecap="round"
              />
              {[40, 180, 320, 460, 620, 780, 940].map((x, idx) => (
                <g key={idx}>
                  <circle cx={x} cy={idx % 2 === 0 ? 160 : 100} r="7" fill="var(--color-gold)" />
                  <text x={x} y={idx % 2 === 0 ? 190 : 78} fill="currentColor" fontSize="14" textAnchor="middle" opacity=".9">
                    {stops[idx]}
                  </text>
                </g>
              ))}
            </svg>
            <p className="mt-6 text-center text-sm opacity-80">
              A signature Fortune Tourism arc — cool hills, temple towns, backwaters and coastal calm, all with one chauffeur.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --- Why us --- */
function WhyChooseUs() {
  return (
    <section className="bg-[color:var(--color-lightgrey)] py-20 md:py-28">
      <div className="container-fortune grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal variant="left">
          <div className="card-lift relative overflow-hidden rounded-3xl shadow-xl h-[520px] md:h-[600px]">
            <div className="why-marquee flex flex-col">
              {[destKarnataka, destKerala, destTamilNadu, destPondicherry, destKarnataka, destKerala, destTamilNadu, destPondicherry].map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="South India destination"
                  loading="lazy"
                  className="h-[520px] md:h-[600px] w-full flex-shrink-0 object-cover"
                />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[color:var(--color-navy)]/25 via-transparent to-transparent" />
          </div>
        </Reveal>
        <div>
          <SectionHeader eyebrow="Why travel with us" title="Small details, big journeys" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {trustPoints.map((t, idx) => (
              <Reveal key={t.title} delay={idx * 90} variant="right">
                <div className="flex gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--color-navy)]/10 text-[color:var(--color-navy)]">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg">{t.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- How it works --- */
function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-fortune">
        <SectionHeader eyebrow="How it works" title="Booking is refreshingly simple" center />
        <div className="relative mt-14">
          <div className="pointer-events-none absolute left-6 top-0 hidden h-full w-px bg-border md:left-1/2 md:h-px md:w-full md:top-8" />
          <div className="grid gap-8 md:grid-cols-4">
            {bookingSteps.map((s, idx) => (
              <Reveal key={s.n} delay={idx * 120} variant="scale">
                <div className="relative flex items-start gap-4 md:block">
                  <div className="z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[color:var(--color-gold)] font-heading text-lg font-semibold text-[color:var(--color-navy)] md:mx-auto">
                    {s.n}
                  </div>
                  <div className="md:mt-5 md:text-center">
                    <h4 className="font-heading text-lg">{s.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Testimonials --- */
function Testimonials() {
  const [i, setI] = useState(0);
  const n = testimonials.length;
  return (
    <section className="bg-[color:var(--color-navy)] py-20 text-[color:var(--color-cream)] md:py-28">
      <div className="container-fortune">
        <SectionHeader eyebrow="Traveller stories" title="Loved by families, groups and companies" inverse center />
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="glass-dark rounded-3xl p-8 md:p-10">
            <div className="flex items-center gap-1 text-[color:var(--color-gold)]">
              {Array.from({ length: testimonials[i].rating }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-5 font-heading text-xl md:text-2xl">"{testimonials[i].text}"</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{testimonials[i].name}</p>
                <p className="text-sm opacity-80">{testimonials[i].route} · {testimonials[i].vehicle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button aria-label="Previous" onClick={() => setI((v) => (v - 1 + n) % n)} className="rounded-full border border-white/30 p-2 hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button aria-label="Next" onClick={() => setI((v) => (v + 1) % n)} className="rounded-full border border-white/30 p-2 hover:bg-white/10">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)} aria-label={`Review ${idx + 1}`} className={"h-1.5 w-6 rounded-full transition " + (idx === i ? "bg-[color:var(--color-gold)]" : "bg-white/25")} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- FAQ --- */
function FAQSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-fortune grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeader eyebrow="Answers" title="Questions travellers usually ask" />
          <p className="mt-4 text-sm text-muted-foreground">Can't find your answer? Message us on WhatsApp — we usually reply within a few minutes.</p>
          <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer noopener" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-emerald)] px-5 py-2.5 text-sm font-medium text-[color:var(--color-cream)]">
            <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
          </a>
        </div>
        <Reveal>
          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4">
            {faqs.map((f, idx) => (
              <AccordionItem key={idx} value={`f${idx}`} className="border-b last:border-b-0">
                <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* --- Final CTA --- */
function FinalCTA() {
  const bgRef = useParallax<HTMLImageElement>(0.18);
  return (
    <section className="relative overflow-hidden">
      <img ref={bgRef} src="/images/cta-road.jpg" alt="Scenic South India road at sunset" loading="lazy" width={1920} height={1080} className="parallax absolute inset-0 h-[120%] w-full -top-[10%] object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-navy)]/90 via-[color:var(--color-navy)]/65 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-navy)]/60 to-transparent" />
      <div className="relative container-fortune py-24 text-[color:var(--color-cream)] md:py-32">
        <Reveal variant="up" className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Ready when you are</p>
          <h2 className="mt-3 font-heading text-3xl md:text-5xl">Your next journey starts with Fortune Tourism</h2>
          <p className="mt-4 max-w-lg text-base opacity-90">
            Tell us where you want to go, and we'll help you choose the right vehicle, route and travel plan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-emerald)] px-6 py-3 text-sm font-semibold">
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
            </a>
            <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10">
              Call {CONTACT.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --- Shared --- */
function SectionHeader({
  eyebrow,
  title,
  center = false,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  center?: boolean;
  inverse?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={"text-xs uppercase tracking-[0.3em] " + (inverse ? "text-[color:var(--color-gold)]" : "text-[color:var(--color-emerald)]")}>{eyebrow}</p>
      <h2 className={"mt-3 font-heading text-3xl md:text-4xl " + (inverse ? "text-[color:var(--color-cream)]" : "text-foreground")}>{title}</h2>
    </div>
  );
}

export { SectionHeader };