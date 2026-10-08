export interface TourPackage {
  slug: string;
  title: string;
  duration: string;
  from: string;
  states: Array<"karnataka" | "andhra-pradesh" | "tamil-nadu" | "kerala" | "puducherry">;
  destinations: string[];
  vehicles: string[];
  startingPrice?: number;
  image: string;
  heroImage?: string;
  highlights?: string[];
  summary: string;
  itinerary: { day: number; title: string; details: string }[];
  inclusions: string[];
  exclusions: string[];
}

import pkgMysuruAsset from "@/assets/pkg-mysuru-palace.jpg";
import pkgChikmagalurAsset from "@/assets/pkg-chikmagalur-real.jpg";
import pkgHampiAsset from "@/assets/pkg-hampi-real.jpg";
import pkgGokarnaAsset from "@/assets/pkg-gokarna-om-beach.jpg";
import pkgKabini from "@/assets/pkg-kabini.jpg";
import pkgTirupatiAsset from "@/assets/pkg-tirupati-real.jpg";
import pkgArakuAsset from "@/assets/pkg-araku-real.jpg";
import pkgGandikotaAsset from "@/assets/pkg-gandikota-real.jpg";
import pkgSrisailamAsset from "@/assets/pkg-srisailam-real.jpg";
import pkgOotyAsset from "@/assets/pkg-ooty-real.jpg";
import pkgPuducherryAsset from "@/assets/pkg-puducherry-real.jpg";
import pkgMahabalipuramAsset from "@/assets/pkg-mahabalipuram-real.jpg";
import pkgKodaikanalAsset from "@/assets/pkg-kodaikanal-real.jpg";
import pkgMunnarAlleppeyAsset from "@/assets/pkg-munnar-alleppey.jpg";
import pkgAlleppeyBackwatersAsset from "@/assets/pkg-alleppey-backwaters.jpg";
import pkgThekkadyAsset from "@/assets/pkg-thekkady-periyar.jpg";
import pkgWayanadAsset from "@/assets/pkg-wayanad-nature.jpg";
import pkgPondiWhiteTownAsset from "@/assets/pkg-pondi-whitetown.jpg";
import pkgPondiPromenadeAsset from "@/assets/pkg-pondi-promenade.jpg";
import pkgPondiMatrimandirAsset from "@/assets/pkg-pondi-matrimandir.jpg";
import pkgPondiParadiseAsset from "@/assets/pkg-pondi-paradise.jpg";
const pkgTirupati = pkgTirupatiAsset;
const pkgAraku = pkgArakuAsset;
const pkgGandikota = pkgGandikotaAsset;
const pkgSrisailam = pkgSrisailamAsset;
const pkgOoty = pkgOotyAsset;
const pkgPuducherry = pkgPuducherryAsset;
const pkgMahabalipuram = pkgMahabalipuramAsset;
const pkgKodaikanal = pkgKodaikanalAsset;
const pkgMunnarAlleppey = pkgMunnarAlleppeyAsset;
const pkgAlleppeyBackwaters = pkgAlleppeyBackwatersAsset;
const pkgThekkady = pkgThekkadyAsset;
const pkgWayanad = pkgWayanadAsset;
const pkgPondiWhiteTown = pkgPondiWhiteTownAsset;
const pkgPondiPromenade = pkgPondiPromenadeAsset;
const pkgPondiMatrimandir = pkgPondiMatrimandirAsset;
const pkgPondiParadise = pkgPondiParadiseAsset;
const pkgMysuruHeritage = pkgMysuruAsset;
const pkgChikmagalur = pkgChikmagalurAsset;
const pkgHampi = pkgHampiAsset;
const pkgGokarna = pkgGokarnaAsset;

export const packages: TourPackage[] = [
  {
    slug: "bengaluru-mysuru-coorg",
    title: "Bengaluru → Mysuru & Coorg",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Mysuru Palace", "Coorg Coffee Estates", "Abbey Falls", "Dubare"],
    vehicles: ["Sedan", "SUV", "Innova Crysta"],
    startingPrice: 12500,
    image: pkgMysuruHeritage,
    summary:
      "A weekend loop from Bengaluru covering the royal city of Mysuru and the misty coffee hills of Coorg.",
    heroImage: "/images/packages/hero-mysuru-coorg.jpg",
    highlights: ["Visit Mysuru Palace", "Coorg coffee estate stay", "Abbey Falls viewpoint", "Dubare elephant camp", "Scenic Western Ghats drive"],
    itinerary: [
      { day: 1, title: "Bengaluru → Mysuru", details: "Depart early, visit Mysuru Palace, Brindavan Gardens and check into a heritage stay." },
      { day: 2, title: "Mysuru → Coorg", details: "Drive to Coorg via Dubare elephant camp, spend the evening in a coffee estate." },
      { day: 3, title: "Coorg → Bengaluru", details: "Morning walk in the estate, visit Abbey Falls and drive back to Bengaluru." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata", "Airport / home pickup"],
    exclusions: ["Hotel stay", "Meals", "Monument entry fees"],
  },
  {
    slug: "bengaluru-ooty",
    title: "Bengaluru → Ooty Hills",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["tamil-nadu"],
    destinations: ["Ooty", "Coonoor", "Doddabetta", "Botanical Gardens"],
    vehicles: ["SUV", "Innova", "Innova Crysta"],
    startingPrice: 13500,
    image: pkgOoty,
    summary: "Cool weather, tea gardens and a slow train ride through the Nilgiris.",
    heroImage: "/images/packages/hero-ooty.jpg",
    highlights: ["Drive via Bandipur forest", "Doddabetta peak view", "Ooty tea museum", "Coonoor viewpoints", "Botanical Gardens"],
    itinerary: [
      { day: 1, title: "Bengaluru → Ooty", details: "Scenic drive via Bandipur & Mudumalai forest." },
      { day: 2, title: "Ooty local", details: "Doddabetta peak, tea museum, Ooty lake and Coonoor viewpoints." },
      { day: 3, title: "Ooty → Bengaluru", details: "Morning at leisure, return via Mysuru with lunch stop." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals", "Entry tickets"],
  },
  {
    slug: "bengaluru-chikmagalur",
    title: "Bengaluru → Chikmagalur",
    duration: "2 Days · 1 Night",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Mullayanagiri", "Baba Budangiri", "Coffee Estates", "Hebbe Falls"],
    vehicles: ["Sedan", "SUV"],
    startingPrice: 8500,
    image: pkgChikmagalur,
    summary: "A quick escape to Karnataka's coffee country and the tallest peak in the state.",
    heroImage: "/images/packages/hero-chikmagalur.jpg",
    highlights: ["Sunrise at Mullayanagiri", "Coffee estate homestay", "Baba Budangiri drive", "Hebbe Falls trek"],
    itinerary: [
      { day: 1, title: "Bengaluru → Chikmagalur", details: "Drive to a coffee estate homestay, evening walk." },
      { day: 2, title: "Peaks & falls", details: "Sunrise at Mullayanagiri, waterfalls, then drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "bengaluru-tirupati",
    title: "Bengaluru → Tirupati Darshan",
    duration: "1 Day · Return",
    from: "Bengaluru",
    states: ["andhra-pradesh"],
    destinations: ["Tirumala", "Tirupati Temple", "Kanipakam (optional)"],
    vehicles: ["Sedan", "Innova", "Tempo Traveller"],
    startingPrice: 6500,
    image: pkgTirupati,
    summary: "Same-day return darshan trip with early pickup and comfortable seating.",
    heroImage: "/images/packages/hero-tirupati.jpg",
    highlights: ["Early morning pickup", "Darshan assistance", "Comfortable AC vehicle", "Same-day return"],
    itinerary: [
      { day: 1, title: "Bengaluru ↔ Tirupati", details: "Early departure, darshan assistance, return by night." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Darshan tickets", "Meals"],
  },
  {
    slug: "bengaluru-mysuru-1day",
    title: "Bengaluru → Mysuru Royal Heritage Day Tour",
    duration: "1 Day · Return",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Mysuru Palace", "Chamundi Hills", "Brindavan Gardens", "St. Philomena's"],
    vehicles: ["Sedan", "Innova", "Tempo Traveller"],
    startingPrice: 4299,
    image: pkgMysuruHeritage,
    summary: "Complete 1-day same-day return tour covering the iconic Mysuru Palace, Chamundi Hill viewpoint, and illuminated musical fountains at Brindavan Gardens.",
    heroImage: "/images/packages/hero-mysuru.jpg",
    highlights: ["Early morning pickup", "Mysuru Palace guided visit", "Chamundi Hill Darshan", "Brindavan Gardens evening show", "Return same night"],
    itinerary: [
      { day: 1, title: "Bengaluru ↔ Mysuru Heritage Circuit", details: "06:00 AM departure via expressway, explore palace & Chamundi hills, visit illuminated Brindavan Gardens, return by 10:30 PM." },
    ],
    inclusions: ["Chauffeur-driven AC vehicle", "Expressway toll & fuel", "Driver bata", "Doorstep pickup & drop"],
    exclusions: ["Palace & garden entrance tickets", "Meals"],
  },
  {
    slug: "bengaluru-nandi-hills-lepakshi-1day",
    title: "Bengaluru → Nandi Hills & Lepakshi Day Trip",
    duration: "1 Day · Return",
    from: "Bengaluru",
    states: ["karnataka", "andhra-pradesh"],
    destinations: ["Nandi Hills Sunrise", "Bhoganandishwara Temple", "Lepakshi Monolith Bull", "Veerabhadra Temple"],
    vehicles: ["Sedan", "SUV", "Innova"],
    startingPrice: 3499,
    image: pkgHampi,
    summary: "Mesmerizing early sunrise over the clouds at Nandi Hills followed by ancient 16th-century Vijayanagara monolithic wonders at Lepakshi.",
    heroImage: "/images/packages/hero-nandi-hills.jpg",
    highlights: ["04:30 AM sunrise pickup", "Sea of clouds viewpoint", "Hanging pillar mystery", "Gigantic monolith Basavanna"],
    itinerary: [
      { day: 1, title: "Bengaluru ↔ Nandi Hills ↔ Lepakshi", details: "Catch the sunrise at Nandi Hills, temple breakfast at Bhoganandishwara, architectural tour of Lepakshi, return to Bengaluru by 6:00 PM." },
    ],
    inclusions: ["Chauffeur-driven AC vehicle", "Tolls & parking", "Driver bata"],
    exclusions: ["Nandi Hills entry fee", "Meals"],
  },
  {
    slug: "bengaluru-shivanasamudra-talakadu-1day",
    title: "Bengaluru → Shivanasamudra Falls & Talakadu",
    duration: "1 Day · Return",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Gaganachukki Falls", "Barachukki Falls", "Talakadu Sand Temples", "Somnathpur Keshava"],
    vehicles: ["Sedan", "Innova", "Tempo Traveller"],
    startingPrice: 3899,
    image: pkgKabini,
    summary: "Scenic Kaveri waterfall spectacles at Barachukki and Gaganachukki, historic buried sand temples in Talakadu, and intricate Hoysala stone carvings.",
    heroImage: "/images/packages/hero-shivanasamudra.jpg",
    highlights: ["Twin waterfall viewpoints", "Talakadu coracle river ride", "Hoysala UNESCO heritage temple", "Scenic countryside drive"],
    itinerary: [
      { day: 1, title: "Bengaluru ↔ Shivanasamudra Circuit", details: "06:30 AM departure, visit Gaganachukki & Barachukki waterfalls, explore Talakadu sand temples, evening return by 8:30 PM." },
    ],
    inclusions: ["Chauffeur-driven AC vehicle", "Tolls & fuel", "Driver bata"],
    exclusions: ["Coracle ride ticket", "Meals"],
  },
  {
    slug: "bengaluru-city-sightseeing-1day",
    title: "Bengaluru Full Day Local Sightseeing",
    duration: "1 Day · Return",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Lalbagh Botanical Garden", "Cubbon Park", "Vidhana Soudha", "Bangalore Palace", "ISKCON Temple"],
    vehicles: ["Sedan", "SUV", "Tempo Traveller"],
    startingPrice: 2799,
    image: pkgChikmagalur,
    summary: "Comprehensive 8-hour / 80-km Bangalore heritage tour exploring royal palaces, lush botanical gardens, and majestic civic architecture.",
    heroImage: "/images/packages/hero-bangalore.jpg",
    highlights: ["Doorstep city pickup & drop", "Lalbagh Glass House", "Bangalore Tudor-style Palace", "ISKCON temple darshan", "Zero parking hassle"],
    itinerary: [
      { day: 1, title: "Bengaluru City Highlights", details: "09:00 AM pickup, visit Lalbagh, Vidhana Soudha photo-op, Bangalore Palace, lunch, ISKCON temple darshan, 07:00 PM drop." },
    ],
    inclusions: ["Chauffeur-driven AC vehicle", "Fuel & driver allowance", "Parking fees"],
    exclusions: ["Palace entrance tickets", "Meals"],
  },
  {
    slug: "bengaluru-shravanabelagola-belur-1day",
    title: "Bengaluru → Shravanabelagola & Belur Heritage",
    duration: "1 Day · Return",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Shravanabelagola Gommateshwara", "Belur Chennakeshava Temple", "Halebidu Hoysaleswara Temple"],
    vehicles: ["Sedan", "Innova", "Innova Crysta"],
    startingPrice: 4699,
    image: pkgGandikota,
    summary: "Marvel at the world's tallest monolithic statue at Vindhyagiri hill and intricate stone carvings of the Hoysala dynasty.",
    heroImage: "/images/packages/hero-shravanabelagola.jpg",
    highlights: ["World-famous monolithic Bahubali", "Intricate stone filigree of Belur", "Comfortable NH-75 expressway drive", "Same-day return"],
    itinerary: [
      { day: 1, title: "Bengaluru ↔ Hoysala Heritage Circuit", details: "Depart 05:30 AM via NH-75, climb Vindhyagiri, explore Belur Chennakeshava temple, return to Bengaluru by 9:30 PM." },
    ],
    inclusions: ["Chauffeur-driven AC vehicle", "Highway tolls & fuel", "Driver bata"],
    exclusions: ["Doli / palanquin service", "Meals"],
  },
  {
    slug: "bengaluru-munnar-alleppey",
    title: "Bengaluru → Munnar & Alleppey",
    duration: "5 Days · 4 Nights",
    from: "Bengaluru",
    states: ["kerala"],
    destinations: ["Munnar", "Thekkady", "Alleppey Backwaters", "Kochi"],
    vehicles: ["SUV", "Innova Crysta", "Tempo Traveller"],
    startingPrice: 24500,
    image: pkgMunnarAlleppey,
    summary: "Signature Kerala loop with tea gardens, spice trails and a night on the backwaters.",
    heroImage: "/images/packages/hero-munnar-alleppey.jpg",
    highlights: ["Munnar tea gardens", "Eravikulam National Park", "Thekkady spice trails", "Alleppey houseboat night", "Fort Kochi walk"],
    itinerary: [
      { day: 1, title: "Bengaluru → Munnar", details: "Long scenic drive, evening at leisure." },
      { day: 2, title: "Munnar sightseeing", details: "Tea gardens, Eravikulam, Mattupetty." },
      { day: 3, title: "Munnar → Thekkady", details: "Spice plantations & Periyar lake." },
      { day: 4, title: "Thekkady → Alleppey", details: "Check into a houseboat, cruise the backwaters." },
      { day: 5, title: "Alleppey → Kochi → Bengaluru", details: "Fort Kochi walk, drop at airport or drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Houseboat", "Meals"],
  },
  {
    slug: "bengaluru-puducherry",
    title: "Bengaluru → Puducherry",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["tamil-nadu", "puducherry"],
    destinations: ["White Town", "Promenade", "Paradise Beach", "Auroville"],
    vehicles: ["Sedan", "SUV", "Innova"],
    startingPrice: 14500,
    image: pkgPondiWhiteTown,
    summary: "French quarter mornings, quiet beaches and a slow drive back through the eastern coast.",
    heroImage: "/images/packages/hero-puducherry.jpg",
    highlights: ["White Town heritage walk", "Promenade sunrise", "Paradise Beach ferry", "Auroville visit"],
    itinerary: [
      { day: 1, title: "Bengaluru → Puducherry", details: "Drive via Krishnagiri, evening on the Promenade." },
      { day: 2, title: "Puducherry", details: "White Town walk, Paradise Beach ferry, Auroville." },
      { day: 3, title: "Puducherry → Bengaluru", details: "Beach breakfast, return via Chennai bypass." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals", "Ferry tickets"],
  },
  // --- Karnataka extras ---
  {
    slug: "hampi-heritage",
    title: "Hampi Heritage Journey",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Hampi", "Virupaksha Temple", "Vittala Temple", "Hospet"],
    vehicles: ["Sedan", "SUV"],
    startingPrice: 13500,
    image: pkgHampi,
    summary: "Stone chariots, boulder-strewn ruins and a UNESCO heritage weekend.",
    itinerary: [
      { day: 1, title: "Bengaluru → Hospet", details: "Overnight drive/day drive to Hospet base." },
      { day: 2, title: "Hampi sightseeing", details: "Virupaksha, Vittala Temple, royal enclosure." },
      { day: 3, title: "Return", details: "Morning viewpoints, drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals", "Entry tickets"],
  },
  {
    slug: "gokarna-beach",
    title: "Gokarna Beach Getaway",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Om Beach", "Kudle Beach", "Mirjan Fort"],
    vehicles: ["Sedan", "SUV"],
    startingPrice: 14500,
    image: pkgGokarna,
    summary: "Quiet coastline, temple town mornings and long beach walks.",
    itinerary: [
      { day: 1, title: "Drive to Gokarna", details: "Check in, evening at Om Beach." },
      { day: 2, title: "Beach hopping", details: "Kudle, Half-moon, sunset at Om." },
      { day: 3, title: "Return via Mirjan", details: "Fort visit, drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "kabini-wildlife",
    title: "Kabini Wildlife Escape",
    duration: "2 Days · 1 Night",
    from: "Bengaluru",
    states: ["karnataka"],
    destinations: ["Kabini", "Nagarhole", "Forest safari"],
    vehicles: ["SUV", "Innova"],
    startingPrice: 11500,
    image: pkgKabini,
    summary: "Riverside lodges and jungle safari in Nagarhole tiger reserve.",
    itinerary: [
      { day: 1, title: "Bengaluru → Kabini", details: "Afternoon safari." },
      { day: 2, title: "Morning safari", details: "Drive back to Bengaluru." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Safari fees"],
  },
  // --- Andhra Pradesh extras ---
  {
    slug: "vizag-araku",
    title: "Visakhapatnam & Araku Valley",
    duration: "4 Days · 3 Nights",
    from: "Visakhapatnam",
    states: ["andhra-pradesh"],
    destinations: ["Vizag", "Borra Caves", "Araku Valley", "Tribal Museum"],
    vehicles: ["SUV", "Innova"],
    startingPrice: 18500,
    image: pkgAraku,
    summary: "Beaches, coffee valleys and the scenic Araku train ride.",
    itinerary: [
      { day: 1, title: "Vizag arrival", details: "RK Beach, Kailasagiri." },
      { day: 2, title: "Araku Valley", details: "Borra Caves, tribal museum." },
      { day: 3, title: "Araku local", details: "Coffee plantations, waterfalls." },
      { day: 4, title: "Return", details: "Simhachalam, drop." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "gandikota-belum",
    title: "Gandikota & Belum Caves",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["andhra-pradesh"],
    destinations: ["Gandikota Fort", "Penna Gorge", "Belum Caves"],
    vehicles: ["SUV", "Innova"],
    startingPrice: 13500,
    image: pkgGandikota,
    summary: "India's Grand Canyon and the country's longest cave system.",
    itinerary: [
      { day: 1, title: "Bengaluru → Gandikota", details: "Sunset at the gorge." },
      { day: 2, title: "Belum Caves", details: "Cave tour, drive to base." },
      { day: 3, title: "Return", details: "Drive to Bengaluru." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "srisailam-temple",
    title: "Srisailam Temple & Nature",
    duration: "2 Days · 1 Night",
    from: "Bengaluru",
    states: ["andhra-pradesh"],
    destinations: ["Srisailam Temple", "Srisailam Dam", "Nallamala forest"],
    vehicles: ["Sedan", "Innova"],
    startingPrice: 9500,
    image: pkgSrisailam,
    summary: "Jyotirlinga darshan and forest drives along the Krishna river.",
    itinerary: [
      { day: 1, title: "Drive & darshan", details: "Arrive, evening aarti." },
      { day: 2, title: "Dam & return", details: "Dam viewpoint, drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  // --- Tamil Nadu extras ---
  {
    slug: "chennai-mahabalipuram",
    title: "Chennai & Mahabalipuram",
    duration: "2 Days · 1 Night",
    from: "Chennai",
    states: ["tamil-nadu"],
    destinations: ["Chennai", "Marina Beach", "Mahabalipuram"],
    vehicles: ["Sedan", "SUV"],
    startingPrice: 8500,
    image: pkgMahabalipuram,
    summary: "City heritage, seaside temples and shore-carved rock reliefs.",
    itinerary: [
      { day: 1, title: "Chennai local", details: "Marina, Kapaleeshwarar." },
      { day: 2, title: "Mahabalipuram", details: "Shore Temple, Five Rathas." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "kodaikanal",
    title: "Kodaikanal Nature Retreat",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["tamil-nadu"],
    destinations: ["Kodaikanal Lake", "Coaker's Walk", "Pillar Rocks"],
    vehicles: ["SUV", "Innova"],
    startingPrice: 14500,
    image: pkgKodaikanal,
    summary: "Cool climate, lake mornings and pine-scented viewpoints.",
    itinerary: [
      { day: 1, title: "Drive to Kodai", details: "Evening at the lake." },
      { day: 2, title: "Kodai sightseeing", details: "Coaker's Walk, Pillar Rocks." },
      { day: 3, title: "Return", details: "Drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "madurai-rameswaram",
    title: "Madurai & Rameswaram",
    duration: "4 Days · 3 Nights",
    from: "Madurai",
    states: ["tamil-nadu"],
    destinations: ["Madurai", "Rameswaram", "Dhanushkodi"],
    vehicles: ["SUV", "Innova"],
    startingPrice: 16500,
    image: "/images/state-tamilnadu.jpg",
    summary: "Meenakshi Temple mornings and Pamban Bridge sunsets.",
    itinerary: [
      { day: 1, title: "Madurai", details: "Meenakshi Temple, palace." },
      { day: 2, title: "→ Rameswaram", details: "Pamban Bridge, temple." },
      { day: 3, title: "Dhanushkodi", details: "Ghost town, sea view." },
      { day: 4, title: "Return", details: "Drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  // --- Kerala extras ---
  {
    slug: "alleppey-houseboat",
    title: "Alleppey Backwater Experience",
    duration: "2 Days · 1 Night",
    from: "Kochi",
    states: ["kerala"],
    destinations: ["Alleppey backwaters", "Houseboat"],
    vehicles: ["Sedan", "SUV"],
    startingPrice: 12500,
    image: pkgAlleppeyBackwaters,
    summary: "A slow night on the backwaters with home-cooked Kerala meals.",
    itinerary: [
      { day: 1, title: "Board houseboat", details: "Cruise, sunset." },
      { day: 2, title: "Disembark", details: "Drive back / drop." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Houseboat", "Meals"],
  },
  {
    slug: "thekkady-wildlife",
    title: "Thekkady Wildlife Retreat",
    duration: "3 Days · 2 Nights",
    from: "Kochi",
    states: ["kerala"],
    destinations: ["Thekkady", "Periyar Lake", "Spice plantation"],
    vehicles: ["SUV", "Innova"],
    startingPrice: 14500,
    image: pkgThekkady,
    summary: "Boat safaris on Periyar and a walk through cardamom hills.",
    itinerary: [
      { day: 1, title: "→ Thekkady", details: "Evening at leisure." },
      { day: 2, title: "Lake & spice trail", details: "Boat safari, plantation." },
      { day: 3, title: "Return", details: "Drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "wayanad-nature",
    title: "Wayanad Nature Journey",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["kerala"],
    destinations: ["Wayanad", "Edakkal Caves", "Waterfalls"],
    vehicles: ["SUV", "Innova"],
    startingPrice: 13500,
    image: pkgWayanad,
    summary: "Ancient caves, tea gardens and misty Western Ghats viewpoints.",
    itinerary: [
      { day: 1, title: "→ Wayanad", details: "Check-in, viewpoint." },
      { day: 2, title: "Local", details: "Edakkal, Soochipara Falls." },
      { day: 3, title: "Return", details: "Drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  // --- Puducherry extras ---
  {
    slug: "puducherry-weekend",
    title: "Pondicherry Weekend Escape",
    duration: "2 Days · 1 Night",
    from: "Chennai",
    states: ["puducherry"],
    destinations: ["White Town", "Promenade", "French Quarter"],
    vehicles: ["Sedan", "SUV"],
    startingPrice: 9500,
    image: pkgPondiPromenade,
    summary: "French colonial streets, cafés and long promenade evenings.",
    itinerary: [
      { day: 1, title: "Arrival", details: "White Town walk, promenade sunset." },
      { day: 2, title: "Local & return", details: "Cafés, drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "auroville-retreat",
    title: "Auroville Spiritual Retreat",
    duration: "2 Days · 1 Night",
    from: "Chennai",
    states: ["puducherry"],
    destinations: ["Auroville", "Matrimandir viewpoint", "Serenity Beach"],
    vehicles: ["Sedan", "SUV"],
    startingPrice: 10500,
    image: pkgPondiMatrimandir,
    summary: "A quiet visit to the international township and its beach.",
    itinerary: [
      { day: 1, title: "→ Auroville", details: "Visitor centre, viewpoint." },
      { day: 2, title: "Beach & return", details: "Serenity Beach, drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
  {
    slug: "puducherry-family",
    title: "Pondicherry Family Holiday",
    duration: "3 Days · 2 Nights",
    from: "Bengaluru",
    states: ["puducherry"],
    destinations: ["Beaches", "Botanical garden", "White Town", "Boat house"],
    vehicles: ["SUV", "Innova"],
    startingPrice: 15500,
    image: pkgPondiParadise,
    summary: "Family-friendly beaches, gardens and the Chunnambar boat house.",
    itinerary: [
      { day: 1, title: "Arrival", details: "Beach evening." },
      { day: 2, title: "Local", details: "Botanical garden, boat house, White Town." },
      { day: 3, title: "Return", details: "Drive back." },
    ],
    inclusions: ["Chauffeur-driven vehicle", "Fuel & toll", "Driver bata"],
    exclusions: ["Stay", "Meals"],
  },
];

export function findPackage(slug: string) {
  if (!slug) return packages[0];
  const normalized = slug.toLowerCase().trim();
  let found = packages.find((p) => p.slug === normalized);
  if (found) return found;

  // Fuzzy match fallback by slug or title
  found = packages.find(
    (p) =>
      p.slug.includes(normalized) ||
      normalized.includes(p.slug) ||
      p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(normalized) ||
      normalized.includes(p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
  );
  if (found) return found;

  // Default fallback to first package if completely unknown
  return packages[0];
}