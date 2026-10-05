import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT, buildWhatsAppUrl } from "@/lib/contact";
import { NAV } from "@/data/site";
import { destinations } from "@/data/destinations";
import { WhatsAppIcon } from "./Header";
import logoAsset from "@/assets/fortune-tourism-logo.png";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 bg-black text-white relative z-20">
      <div className="container-fortune grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-white">
              <img src={logoAsset} alt="Fortune Tourism logo" className="h-full w-full object-contain" />
            </span>
            <span className="font-heading text-lg">Fortune Tourism</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/90 font-medium">
            Chauffeur-driven cars and curated tour packages across Karnataka, Andhra Pradesh, Tamil Nadu, Kerala and Puducherry — starting from Bengaluru.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={CONTACT.phoneHref} className="rounded-full border border-white/25 p-2" aria-label="Call">
              <Phone className="h-4 w-4" />
            </a>
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer noopener" className="rounded-full bg-[color:var(--color-emerald)] p-2" aria-label="WhatsApp">
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            <a href={`mailto:${CONTACT.email}`} className="rounded-full border border-white/25 p-2" aria-label="Email">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-white/90 hover:text-white hover:underline font-medium">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Destinations</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {destinations.map((d) => (
              <li key={d.slug} className="text-white/90 font-medium">
                {d.state}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/95 font-medium">
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /> <span>{CONTACT.phone}</span></li>
            <li className="flex items-start gap-2"><WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0" /> <span>WhatsApp bookings</span></li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> <span>{CONTACT.email}</span></li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> <span>{CONTACT.address}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-fortune flex flex-col items-start justify-between gap-2 py-5 text-xs text-white/80 font-semibold md:flex-row md:items-center">
          <p>© {year} Fortune Tourism. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}