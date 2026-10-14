import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  Download,
  MessageCircle,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Users,
  Hotel,
  Building2,
  MapPin,
  Calendar,
  Bed,
  Phone,
  User,
  Coffee,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { generateTicketNumber, generatePNR } from "@/lib/booking-utils";
import { buildWhatsAppUrl } from "@/lib/contact";
import { downloadTicketCopyPDF } from "@/lib/ticket-copy-pdf";

export interface HotelRoomOption {
  id: string;
  hotelName: string;
  city: string;
  roomType: string;
  pricePerNight: number;
  rating: number;
  image: string;
  capacity: string;
  bedType: string;
  category: string;
  amenities: string[];
  description: string;
}

export const CURATED_HOTEL_ROOMS: HotelRoomOption[] = [
  // MYSURU (3)
  {
    id: "htl-grand-heritage",
    hotelName: "Fortune Grand Heritage",
    city: "Mysuru",
    roomType: "Deluxe Suite King",
    pricePerNight: 4800,
    rating: 4.9,
    image: "/images/packages/pkg-mysuru-palace.jpg",
    capacity: "2 Adults + 1 Child",
    bedType: "King Bed",
    category: "Heritage & Boutique",
    amenities: ["Free Breakfast", "Royal Decor", "Swimming Pool", "High-Speed WiFi", "AC Suite"],
    description: "Palatial comfort near Mysuru Palace with antique teak furnishings and regal hospitality.",
  },
  {
    id: "htl-radisson-mysuru",
    hotelName: "Radisson Blu Plaza Hotel",
    city: "Mysuru",
    roomType: "Executive Golf View Room",
    pricePerNight: 6200,
    rating: 4.8,
    image: "/images/packages/pkg-mysuru-heritage.jpg",
    capacity: "2 Guests",
    bedType: "King Bed",
    category: "Palatial & 5-Star",
    amenities: ["Golf View", "Chamundi Hills View", "Infinity Pool", "Buffet Breakfast", "Spa"],
    description: "Premier 5-star property situated next to the Chamundi foothills and Mysore Golf Club.",
  },
  {
    id: "htl-royal-orchid-mysuru",
    hotelName: "Royal Orchid Metropole",
    city: "Mysuru",
    roomType: "Heritage Balcony Suite",
    pricePerNight: 5400,
    rating: 4.8,
    image: "/images/packages/pkg-mysuru-palace.jpg",
    capacity: "2 Adults + 1 Child",
    bedType: "Heritage Teak Bed",
    category: "Heritage & Boutique",
    amenities: ["Courtyard Dining", "Heritage Architecture", "Private Balcony", "Free Breakfast", "Bar"],
    description: "Built by the Maharaja of Mysore in 1920, featuring sprawling courtyards and colonial grandeur.",
  },

  // PUDUCHERRY (4)
  {
    id: "htl-promenade",
    hotelName: "The Promenade White Town",
    city: "Puducherry",
    roomType: "Sea View Executive",
    pricePerNight: 9300,
    rating: 4.8,
    image: "/images/packages/pkg-pondi-promenade.jpg",
    capacity: "2 - 4 Guests",
    bedType: "Executive King Bed",
    category: "Beach & Coast",
    amenities: ["Ocean View Balcony", "French Quarter", "Free Breakfast", "Mini Bar", "AC Suite"],
    description: "Iconic oceanfront residence directly on Goubert Avenue overlooking the Bay of Bengal.",
  },
  {
    id: "htl-le-dupleix",
    hotelName: "Le Dupleix French Heritage Villa",
    city: "Puducherry",
    roomType: "French Heritage Penthouse",
    pricePerNight: 7500,
    rating: 4.9,
    image: "/images/packages/pkg-pondi-whitetown.jpg",
    capacity: "2 Guests",
    bedType: "Carved Teak Bed",
    category: "Heritage & Boutique",
    amenities: ["French Architecture", "Courtyard Restaurant", "High Ceilings", "Free Breakfast", "WiFi"],
    description: "Restored French mayor's 18th-century residence with antique woodwork and gourmet dining.",
  },
  {
    id: "htl-palais-de-mahe",
    hotelName: "Palais de Mahe CGH Earth",
    city: "Puducherry",
    roomType: "Colonial Verandah Suite",
    pricePerNight: 11800,
    rating: 4.9,
    image: "/images/packages/pkg-pondi-matrimandir.jpg",
    capacity: "2 Adults + 1 Child",
    bedType: "Four-Poster Bed",
    category: "Palatial & 5-Star",
    amenities: ["Courtyard Swimming Pool", "Ochre Facades", "Ayurvedic Spa", "French Cafe", "AC"],
    description: "Classic French colonial mansion in the historic French Quarter just steps away from the promenade.",
  },
  {
    id: "htl-fortune-puducherry",
    hotelName: "Fortune Select Grand",
    city: "Puducherry",
    roomType: "Deluxe Pool View Room",
    pricePerNight: 5900,
    rating: 4.8,
    image: "/images/packages/pkg-pondi-paradise.jpg",
    capacity: "2 - 3 Guests",
    bedType: "Queen Suite Bed",
    category: "Beach & Coast",
    amenities: ["Swimming Pool", "Near Paradise Beach", "Multi-Cuisine Buffet", "Free WiFi", "Gym"],
    description: "Modern upscale hospitality offering relaxing lagoon views and quick access to Paradise beach.",
  },

  // OOTY (3)
  {
    id: "htl-sterling-ooty",
    hotelName: "Sterling Resort & Spa",
    city: "Ooty",
    roomType: "Valley View Chalet",
    pricePerNight: 5600,
    rating: 4.8,
    image: "/images/packages/pkg-ooty-real.jpg",
    capacity: "2 Adults + 1 Child",
    bedType: "Chalet King Bed",
    category: "Hill Stations",
    amenities: ["Mountain Valley View", "Fireplace", "Ayurvedic Spa", "Heater", "Buffet Breakfast"],
    description: "Nestled in the Nilgiri hills with sweeping tea garden vistas and mountain mist breezes.",
  },
  {
    id: "htl-savoy-ooty",
    hotelName: "Savoy - IHCL SeleQtions",
    city: "Ooty",
    roomType: "British Colonial Heritage Suite",
    pricePerNight: 12900,
    rating: 4.9,
    image: "/images/packages/hero-ooty.jpg",
    capacity: "2 Guests",
    bedType: "King Four-Poster Bed",
    category: "Heritage & Boutique",
    amenities: ["Wood Fireplace", "Heritage Lawns", "High Tea", "English Dining", "Heated Room"],
    description: "180-year-old landmark heritage cottage retreat reflecting timeless British country manor style.",
  },
  {
    id: "htl-sinclairs-ooty",
    hotelName: "Sinclairs Retreat Ooty",
    city: "Ooty",
    roomType: "Nilgiri Panoramic Premier",
    pricePerNight: 6400,
    rating: 4.8,
    image: "/images/packages/pkg-ooty-real.jpg",
    capacity: "2 - 3 Guests",
    bedType: "Executive Double Bed",
    category: "Hill Stations",
    amenities: ["Panoramic Mountain View", "Pine Woods", "Bonfire Nights", "Free Breakfast", "Game Room"],
    description: "Located at the highest vantage point in Ooty with spectacular views of the Blue Mountains.",
  },

  // ALLEPPEY & KERALA BACKWATERS (3)
  {
    id: "htl-kumarakom",
    hotelName: "Kumarakom Lake Luxury Resort",
    city: "Alleppey",
    roomType: "Heritage Lake Villa",
    pricePerNight: 13100,
    rating: 4.9,
    image: "/images/packages/pkg-alleppey-backwaters.jpg",
    capacity: "2 - 3 Guests",
    bedType: "Teak Canopy Bed",
    category: "Backwaters & Lagoons",
    amenities: ["Private Plunge Pool", "Vembanad Lake View", "Ayurmana Spa", "Traditional Kerala Woodwork"],
    description: "Exclusive backwater haven featuring 16th-century ancestral Kerala villas with private courtyards.",
  },
  {
    id: "htl-ramada-alleppey",
    hotelName: "Ramada by Wyndham Alleppey",
    city: "Alleppey",
    roomType: "Royal Backwater Lagoon Suite",
    pricePerNight: 6800,
    rating: 4.8,
    image: "/images/packages/hero-munnar-alleppey.jpg",
    capacity: "2 Adults + 1 Child",
    bedType: "King Bed",
    category: "Backwaters & Lagoons",
    amenities: ["Infinity Pool", "Houseboat Dock Access", "Waterfront Restaurant", "Spa", "Free WiFi"],
    description: "Luxury 5-star waterside retreat right on Punnamada Lake, famous for Nehru Trophy boat races.",
  },
  {
    id: "htl-lake-palace-alleppey",
    hotelName: "Lake Palace Resort",
    city: "Alleppey",
    roomType: "Island Water Chalet",
    pricePerNight: 10200,
    rating: 4.9,
    image: "/images/packages/pkg-alleppey-backwaters.jpg",
    capacity: "2 - 4 Guests",
    bedType: "Lakeview King Bed",
    category: "Backwaters & Lagoons",
    amenities: ["Private Island", "Canal Boat Transfer", "Private Pier", "Kerala Ayurvedic Spa", "Breakfast"],
    description: "A private island sanctuary in the serene Vembanad backwaters accessible only by resort boat.",
  },

  // CHIKMAGALUR (3)
  {
    id: "htl-coffee-county",
    hotelName: "Coffee County Forest Resort",
    city: "Chikmagalur",
    roomType: "Plantation Cottage",
    pricePerNight: 4900,
    rating: 4.8,
    image: "/images/packages/pkg-chikmagalur-real.jpg",
    capacity: "2 Adults + 2 Kids",
    bedType: "Woodland Cottage Bed",
    category: "Nature & Cottages",
    amenities: ["Estate Plantation View", "Campfire & BBQ", "Nature Trails", "Fresh Organic Brews", "Balcony"],
    description: "Private wood cottages immersed in lush Arabica coffee estates with serene bird sanctuary views.",
  },
  {
    id: "htl-serai-chikmagalur",
    hotelName: "The Serai Luxury Resort",
    city: "Chikmagalur",
    roomType: "Estate Private Pool Villa",
    pricePerNight: 16500,
    rating: 4.9,
    image: "/images/packages/hero-chikmagalur.jpg",
    capacity: "2 Guests",
    bedType: "King Canopy Bed",
    category: "Palatial & 5-Star",
    amenities: ["Private Swimming Pool", "Coffee Spa Therapy", "Fine Dining", "Lush Coffee Estate", "Jacuzzi"],
    description: "Award-winning ultra-luxury villa resort enveloped by 70 acres of whispering coffee plantations.",
  },
  {
    id: "htl-java-rain",
    hotelName: "Java Rain Nature Resort",
    city: "Chikmagalur",
    roomType: "Hilltop Plantation Suite",
    pricePerNight: 8400,
    rating: 4.8,
    image: "/images/packages/pkg-chikmagalur.jpg",
    capacity: "2 - 3 Guests",
    bedType: "Executive King Bed",
    category: "Nature & Cottages",
    amenities: ["Mullayanagiri Valley View", "Infinity Pool", "Coffee Plantation Walk", "Outdoor Jacuzzi"],
    description: "Perched atop the Mullayanagiri hills overlooking Chikmagalur town with breathtaking sunset decks.",
  },

  // BENGALURU (3)
  {
    id: "htl-leela-palace",
    hotelName: "The Leela Palace",
    city: "Bengaluru",
    roomType: "Royal Premiere Room",
    pricePerNight: 12500,
    rating: 4.9,
    image: "/images/packages/karnataka-hero.jpg",
    capacity: "2 Guests",
    bedType: "Super King Bed",
    category: "Palatial & 5-Star",
    amenities: ["5-Star Palatial Luxury", "Marble Bathroom", "City Skyline", "Fine Dining", "24/7 Butler"],
    description: "Vijayanagara royal architecture nestled within nine acres of cascading gardens in the heart of Bangalore.",
  },
  {
    id: "htl-itc-gardenia",
    hotelName: "ITC Gardenia Luxury Collection",
    city: "Bengaluru",
    roomType: "Peacock Suite Executive",
    pricePerNight: 11200,
    rating: 4.9,
    image: "/images/packages/south-india-special.jpg",
    capacity: "2 Guests",
    bedType: "Executive King Bed",
    category: "Palatial & 5-Star",
    amenities: ["LEED Platinum Certified", "Kaya Kalp Spa", "UB City Views", "Fine Dining", "Lounge Access"],
    description: "Inspired by the garden city aesthetics, offering opulent residential luxury near MG Road and UB City.",
  },
  {
    id: "htl-taj-west-end",
    hotelName: "Taj West End Heritage Resort",
    city: "Bengaluru",
    roomType: "Colonial Garden View Villa",
    pricePerNight: 14000,
    rating: 4.9,
    image: "/images/packages/karnataka-hero.jpg",
    capacity: "2 - 3 Guests",
    bedType: "Grand Heritage Bed",
    category: "Heritage & Boutique",
    amenities: ["20-Acre Botanical Garden", "Century-old Trees", "Jiva Spa", "Golf Course Access", "Butler"],
    description: "Established in 1887, Bangalore's oldest and most prestigious luxury sanctuary nestled in a forest.",
  },

  // KODAIKANAL (2)
  {
    id: "htl-kodai-pine",
    hotelName: "Fortune Trinity Hill Resort",
    city: "Kodaikanal",
    roomType: "Misty Pine Suite",
    pricePerNight: 6200,
    rating: 4.8,
    image: "/images/packages/pkg-kodaikanal-real.jpg",
    capacity: "2 - 3 Guests",
    bedType: "Queen Suite Bed",
    category: "Hill Stations",
    amenities: ["Kodai Lake Valley", "Cozy Fireplace", "Pine Forest View", "Free Breakfast", "Heated Room"],
    description: "High-altitude hill sanctuary wrapped in misty eucalyptus woods near Kodai Lake.",
  },
  {
    id: "htl-carlton-kodai",
    hotelName: "The Carlton Lakeside Resort",
    city: "Kodaikanal",
    roomType: "Lake View Cottage",
    pricePerNight: 8900,
    rating: 4.8,
    image: "/images/packages/pkg-kodaikanal-real.jpg",
    capacity: "2 Adults + 1 Child",
    bedType: "Colonial King Bed",
    category: "Hill Stations",
    amenities: ["Direct Lakefront Lawn", "Boating Dock", "Hearth Fireplace", "Golf & Billiards", "Spa"],
    description: "The only 5-star resort positioned directly on the edge of the pristine star-shaped Kodaikanal Lake.",
  },

  // COORG (2)
  {
    id: "htl-tamara-coorg",
    hotelName: "The Tamara Coorg",
    city: "Coorg",
    roomType: "Luxury Plantation Cottage",
    pricePerNight: 14200,
    rating: 4.9,
    image: "/images/packages/hero-mysuru-coorg.jpg",
    capacity: "2 Guests",
    bedType: "Canopy King Bed",
    category: "Nature & Cottages",
    amenities: ["Stilt Wooden Cottage", "180-Acre Coffee Estate", "Natural Waterfalls", "Elevation Spa", "Verandah"],
    description: "Exclusive eco-luxury wooden cottages on stilts perched above organic cardamom and coffee hills.",
  },
  {
    id: "htl-heritage-coorg",
    hotelName: "Heritage Resort Coorg",
    city: "Coorg",
    roomType: "Kodagu Hilltop Suite",
    pricePerNight: 5800,
    rating: 4.8,
    image: "/images/packages/hero-mysuru-coorg.jpg",
    capacity: "2 - 3 Guests",
    bedType: "King Bed",
    category: "Hill Stations",
    amenities: ["Western Ghats Valley View", "Rainforest Pool", "Coffee Plantation Walk", "Bonfire", "Ayurveda"],
    description: "Set high atop green ridges in Madikeri overlooking mist-covered slopes and pepper vines.",
  },

  // KABINI (2)
  {
    id: "htl-evolve-back-kabini",
    hotelName: "Evolve Back Kuruba Safari Lodge",
    city: "Kabini",
    roomType: "Safari Pool Hut",
    pricePerNight: 18500,
    rating: 5.0,
    image: "/images/packages/pkg-kabini.jpg",
    capacity: "2 Adults + 1 Child",
    bedType: "Tribal Thatched King Bed",
    category: "Nature & Cottages",
    amenities: ["Private Plunge Pool", "Kabini River Safari", "Nagarhole Forest Access", "Tribal Architecture"],
    description: "Legendary safari lodge inspired by Hadhi tribal villages on the banks of the Kabini reservoir.",
  },
  {
    id: "htl-serai-kabini",
    hotelName: "The Serai Kabini Waterside",
    city: "Kabini",
    roomType: "Waterfront Luxury Cabin",
    pricePerNight: 14800,
    rating: 4.9,
    image: "/images/packages/pkg-kabini.jpg",
    capacity: "2 Guests",
    bedType: "Waterfront King Bed",
    category: "Nature & Cottages",
    amenities: ["Riverfront Balcony", "Boat Safari", "Wild Elephant Sightings", "Oma Spa", "Infinity Pool"],
    description: "Waterfront cabins situated directly alongside the wildlife migratory path on the Kabini riverbank.",
  },

  // WAYANAD (1)
  {
    id: "htl-vythiri-village",
    hotelName: "Vythiri Village Resort & Spa",
    city: "Wayanad",
    roomType: "Rainforest Stream Villa",
    pricePerNight: 8200,
    rating: 4.9,
    image: "/images/packages/pkg-wayanad-nature.jpg",
    capacity: "2 - 4 Guests",
    bedType: "Stream Villa King Bed",
    category: "Nature & Cottages",
    amenities: ["Hanging Rope Bridge", "Natural Waterfall Pool", "Houseboat Dining", "Ayurvedic Spa", "Zip line"],
    description: "Five-star nature resort hidden inside untouched Wayanad rainforest canopy with natural mountain streams.",
  },

  // MUNNAR (1)
  {
    id: "htl-blanket-munnar",
    hotelName: "Blanket Luxury Resort & Spa",
    city: "Munnar",
    roomType: "Tea Valley Presidential Suite",
    pricePerNight: 9600,
    rating: 4.9,
    image: "/images/packages/pkg-munnar-alleppey.jpg",
    capacity: "2 - 3 Guests",
    bedType: "Valley View King Bed",
    category: "Hill Stations",
    amenities: ["Attukad Waterfall View", "Tea Estate Balcony", "Heated Swimming Pool", "Spa", "Trekking"],
    description: "Perched majestically above Attukad waterfalls, providing front-row panoramas of rolling Munnar tea slopes.",
  },

  // THEKKADY (1)
  {
    id: "htl-spice-village",
    hotelName: "Spice Village CGH Earth",
    city: "Thekkady",
    roomType: "Tribal Spice Garden Cottage",
    pricePerNight: 7900,
    rating: 4.8,
    image: "/images/packages/pkg-thekkady-periyar.jpg",
    capacity: "2 Adults + 1 Child",
    bedType: "Elephant Grass Thatched Bed",
    category: "Nature & Cottages",
    amenities: ["Spice Plantation Tour", "Periyar Tiger Sanctuary", "Eco Architecture", "Buffet", "Botanical Walk"],
    description: "Eco-living recreated as a Mannan tribal village using elephant grass roofs within aromatic spice gardens.",
  },

  // HAMPI (1)
  {
    id: "htl-heritage-hampi",
    hotelName: "Heritage Resort Hampi",
    city: "Hampi",
    roomType: "Vijayanagara Royal Villa",
    pricePerNight: 7800,
    rating: 4.9,
    image: "/images/packages/pkg-hampi-real.jpg",
    capacity: "2 - 3 Guests",
    bedType: "Royal Stone Villa Bed",
    category: "Heritage & Boutique",
    amenities: ["Stone Carved Verandah", "Organic Mango Orchards", "Swimming Pool", "Tungabhadra Heritage Tour"],
    description: "Stone cottages echoing the 14th-century architectural heritage of the Vijayanagara Empire.",
  },

  // TIRUPATI (2)
  {
    id: "htl-fortune-tirupati",
    hotelName: "Fortune Park Ridge",
    city: "Tirupati",
    roomType: "Divine Executive Suite",
    pricePerNight: 4500,
    rating: 4.8,
    image: "/images/packages/pkg-tirupati-real.jpg",
    capacity: "2 - 3 Guests",
    bedType: "King Bed",
    category: "Heritage & Boutique",
    amenities: ["Express Darshan Desk", "Near Alipiri Gate", "Pure Veg Dining", "Free WiFi", "Travel Desk"],
    description: "Upscale pilgrimage haven close to the Tirumala foothills with specialized darshan assistance.",
  },
  {
    id: "htl-marasa-tirupati",
    hotelName: "Marasa Sarovar Premiere",
    city: "Tirupati",
    roomType: "Temple View Premium Deluxe",
    pricePerNight: 5400,
    rating: 4.8,
    image: "/images/packages/hero-tirupati.jpg",
    capacity: "2 Adults + 2 Kids",
    bedType: "Double King Bed",
    category: "Palatial & 5-Star",
    amenities: ["Dashavatara Concept Architecture", "Lotus Pool", "Fine Dining", "Gym", "Tirumala Hills View"],
    description: "World's only 5-star hotel themed on the ten avatars of Lord Vishnu, located near Karakambadi road.",
  },

  // GOKARNA (1)
  {
    id: "htl-kahani-gokarna",
    hotelName: "Kahani Paradise Clifftop Resort",
    city: "Gokarna",
    roomType: "Arabian Sea View Villa",
    pricePerNight: 11000,
    rating: 4.9,
    image: "/images/packages/pkg-gokarna-om-beach.jpg",
    capacity: "2 Guests",
    bedType: "Oceanfront King Bed",
    category: "Beach & Coast",
    amenities: ["180-Degree Ocean Panorama", "Clifftop Infinity Pool", "Private Beach Path", "Organic Orchards"],
    description: "An ultra-private cliffside estate overlooking the Arabian Sea, where jungle meets the ocean.",
  },

  // MAHABALIPURAM (1)
  {
    id: "htl-radisson-mahabs",
    hotelName: "Radisson Resort Temple Bay",
    city: "Mahabalipuram",
    roomType: "Shoreline Chalet Suite",
    pricePerNight: 10500,
    rating: 4.8,
    image: "/images/packages/pkg-mahabalipuram-real.jpg",
    capacity: "2 - 4 Guests",
    bedType: "Beachside King Bed",
    category: "Beach & Coast",
    amenities: ["27000 Sq Ft Meandering Pool", "Bay of Bengal Beachfront", "Shore Temple Proximity", "Ayur Spa"],
    description: "Sprawling 44-acre coastal paradise directly bordering the Bay of Bengal and UNESCO Shore Temple.",
  },
];

const POPULAR_DESTINATIONS = [
  "Mysuru",
  "Puducherry",
  "Ooty",
  "Alleppey",
  "Chikmagalur",
  "Bengaluru",
  "Kodaikanal",
  "Coorg",
  "Kabini",
  "Wayanad",
  "Munnar",
  "Thekkady",
  "Hampi",
  "Tirupati",
  "Gokarna",
  "Mahabalipuram",
];

const HOTEL_CATEGORIES = [
  "ALL",
  "Palatial & 5-Star",
  "Nature & Cottages",
  "Hill Stations",
  "Beach & Coast",
  "Backwaters & Lagoons",
  "Heritage & Boutique",
];

interface AdminHotelBookingFlowProps {
  onBack: () => void;
  onOpenHotelManagement?: () => void;
  onBookingCompleted?: () => void;
}

export function AdminHotelBookingFlow({
  onBack,
  onOpenHotelManagement,
  onBookingCompleted,
}: AdminHotelBookingFlowProps) {
  // 5-step flow matching the images
  // 1: Schedule & Dates | 2: Select Hotel/Room Fleet | 3: Guest Details | 4: Payment Choice | 5: Official Voucher
  const [step, setStep] = useState<number>(1);

  // Step 1: Destination & Dates State
  const [destinationCity, setDestinationCity] = useState("Mysuru");
  const [customHotelName, setCustomHotelName] = useState("");
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [guestsCount, setGuestsCount] = useState<number>(2);

  // Calculate nights
  const nightsCount = useMemo(() => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays || 1);
    } catch {
      return 2;
    }
  }, [checkInDate, checkOutDate]);

  // Step 2 Filters & Search State
  const [step2CityFilter, setStep2CityFilter] = useState<string>("ALL");
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "rating">("featured");

  // Step 2: Selected Room Option
  const [selectedRoom, setSelectedRoom] = useState<HotelRoomOption>(CURATED_HOTEL_ROOMS[0]);
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [customRoomType, setCustomRoomType] = useState("Executive AC Room");
  const [customPricePerNight, setCustomPricePerNight] = useState<number>(4500);

  // Step 3: Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [idProofType, setIdProofType] = useState("Aadhaar Card");
  const [mealPlan, setMealPlan] = useState("CP - Complimentary Breakfast");
  const [specialRequests, setSpecialRequests] = useState("");
  const [customFareAdjustment, setCustomFareAdjustment] = useState<string>("");

  // Step 4: Payment
  const [advanceOption, setAdvanceOption] = useState<number>(1000); // 1000 or 0
  const [customAdvanceInput, setCustomAdvanceInput] = useState<string>("1000");
  const [utrRef, setUtrRef] = useState("");
  const [upiCopied, setUpiCopied] = useState(false);

  // Step 5: Confirmation identifiers
  const [ticketNumber, setTicketNumber] = useState(() => `FT-HTL-2026-${String(Math.floor(100 + Math.random() * 900))}`);
  const [pnrNumber, setPnrNumber] = useState(() => generatePNR());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fare calculations
  const effectivePricePerNight = isCustomRoom ? customPricePerNight : selectedRoom.pricePerNight;
  const calculatedRoomFare = useMemo(() => {
    return effectivePricePerNight * nightsCount * roomsCount;
  }, [effectivePricePerNight, nightsCount, roomsCount]);

  const totalFare = useMemo(() => {
    if (customFareAdjustment && Number(customFareAdjustment) > 0) {
      return Number(customFareAdjustment);
    }
    return calculatedRoomFare;
  }, [customFareAdjustment, calculatedRoomFare]);

  const effectiveAdvance = advanceOption === 0 ? 0 : Number(customAdvanceInput) || 1000;
  const balanceDue = Math.max(0, totalFare - effectiveAdvance);

  // Date and Time Displays
  const bookingDateTime = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }, []);

  const effectiveHotelName = isCustomRoom
    ? customHotelName || "Fortune Partner Resort"
    : selectedRoom.hotelName;
  const effectiveRoomType = isCustomRoom ? customRoomType : selectedRoom.roomType;
  const effectiveCity = isCustomRoom ? destinationCity : selectedRoom.city;

  // Filter available rooms in Step 2 based on search, city, category & sort
  const filteredRooms = useMemo(() => {
    let list = [...CURATED_HOTEL_ROOMS];

    // Destination Filter
    if (step2CityFilter !== "ALL") {
      list = list.filter((r) => r.city.toLowerCase() === step2CityFilter.toLowerCase());
    }

    // Category Filter
    if (selectedCategoryFilter !== "ALL") {
      list = list.filter((r) => r.category === selectedCategoryFilter);
    }

    // Search Query
    if (roomSearchQuery.trim()) {
      const q = roomSearchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.hotelName.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.roomType.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "price_asc") {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [step2CityFilter, selectedCategoryFilter, roomSearchQuery, sortBy]);

  const copyUPI = () => {
    navigator.clipboard.writeText("fortunetourism@okaxis");
    setUpiCopied(true);
    toast.success("UPI ID fortunetourism@okaxis copied!");
    setTimeout(() => setUpiCopied(false), 3000);
  };

  const handleStep1Next = () => {
    if (!destinationCity.trim()) {
      toast.error("Please enter or select a destination city.");
      return;
    }
    // Pre-sync Step 2 destination filter if matching city exists, else keep ALL
    const cityExists = CURATED_HOTEL_ROOMS.some(
      (r) => r.city.toLowerCase() === destinationCity.trim().toLowerCase()
    );
    if (cityExists) {
      setStep2CityFilter(destinationCity.trim());
    } else {
      setStep2CityFilter("ALL");
    }
    setStep(2);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const handleStep2Next = () => {
    setStep(3);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const handleStep3Next = () => {
    if (!guestName.trim()) {
      toast.error("Please enter guest's full name.");
      return;
    }
    const cleanPhone = guestPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setStep(4);
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const generatedId = `HTL-${Math.floor(100 + Math.random() * 900)}`;
      const generatedRef = ticketNumber;

      // 1. Save to local storage for instant sync with HotelAdminManager table
      const storedBookings = localStorage.getItem("fortune_hotel_bookings");
      let currentList = [];
      try {
        currentList = storedBookings ? JSON.parse(storedBookings) : [];
      } catch {
        currentList = [];
      }

      const newEntry = {
        id: generatedId,
        bookingRef: generatedRef,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        hotelName: effectiveHotelName,
        city: effectiveCity,
        roomType: effectiveRoomType,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: nightsCount,
        rooms: roomsCount,
        guests: guestsCount,
        totalAmount: totalFare,
        advancePaid: effectiveAdvance,
        status: "Confirmed",
        voucherSent: true,
      };

      localStorage.setItem("fortune_hotel_bookings", JSON.stringify([newEntry, ...currentList]));

      // 2. Dispatch to server database / enquiries API
      const payload = {
        name: guestName.trim(),
        phone: guestPhone.trim(),
        email: guestEmail.trim() || "booking@fortunetourism.in",
        service: "Hotel Booking",
        category: "HOTEL",
        pickup: effectiveCity,
        destination: `${effectiveHotelName} (${effectiveRoomType})`,
        date: checkInDate,
        time: "12:00",
        passengers: String(guestsCount),
        boarding_point: effectiveHotelName,
        boarding_address: `${effectiveHotelName}, ${effectiveCity}`,
        notes: [
          `Offline Admin Hotel Booking`,
          `Ticket Ref: ${generatedRef}`,
          `PNR: ${pnrNumber}`,
          `Hotel: ${effectiveHotelName}`,
          `Room: ${effectiveRoomType}`,
          `Nights: ${nightsCount}N (${checkInDate} to ${checkOutDate})`,
          `Rooms: ${roomsCount} Room(s)`,
          `Meal Plan: ${mealPlan}`,
          `Total Fare: ₹${totalFare}`,
          `Advance: ₹${effectiveAdvance} (${advanceOption === 0 ? "Zero Advance" : "Paid"})`,
          utrRef && `UTR: ${utrRef}`,
          specialRequests && `Special Req: ${specialRequests}`,
        ]
          .filter(Boolean)
          .join(" | "),
        client_token: `FT-ADMIN-HTL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };

      try {
        await fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.warn("Could not sync with /api/enquiries, saved to local state:", e);
      }

      setStep(5);
      toast.success("Hotel reservation confirmed! Official ticket copy voucher generated.");
      if (onBookingCompleted) {
        onBookingCompleted();
      }
      window.scrollTo({ top: 80, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message || "An error occurred while confirming hotel booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    downloadTicketCopyPDF({
      ticketNumber,
      pnrNumber,
      bookingDate: bookingDateTime,
      passengerName: guestName,
      passengerPhone: guestPhone,
      tourType: "HOTEL RESERVATION",
      fromLocation: effectiveCity.toUpperCase(),
      toLocation: effectiveHotelName.toUpperCase(),
      departureOn: `${checkInDate} to ${checkOutDate}`,
      tripType: `${nightsCount} NIGHTS · ${roomsCount} ROOM(S)`,
      vehicleOrMode: effectiveRoomType,
      boardingPoint: effectiveHotelName,
      boardingAddress: `${effectiveHotelName}, ${effectiveCity}`,
      serviceType: "HOTEL",
      fareAmount: totalFare,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=fortunetourism@okaxis&pn=Fortune%20Tourism&am=${effectiveAdvance}&tn=Hotel%20Reservation%20Advance`
  )}`;

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B132B]/95 backdrop-blur-md rounded-2xl border border-white/15 p-4 sm:p-5 shadow-xl text-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Hotel className="w-3 h-3 text-indigo-400" /> Hotel Booking System
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                33 Curated Luxury Resorts &amp; Hotels
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Hotel &amp; Resort Reservations
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHotelManagement && (
            <button
              type="button"
              onClick={onOpenHotelManagement}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/15 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Hotel Management Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Multi-Step Wizard Progress Indicator (Clickable Buttons) */}
      <div className="no-print bg-[#0B132B]/95 border border-white/15 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { num: 1, label: "1. Stay & Dates", icon: Calendar },
            { num: 2, label: "2. Room & Resort", icon: Bed },
            { num: 3, label: "3. Guest Details", icon: User },
            { num: 4, label: "4. Advance & Pay", icon: Zap },
            { num: 5, label: "5. Official Voucher", icon: CheckCircle2 },
          ].map((item) => {
            const isActive = step === item.num;
            const isCompleted = step > item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => setStep(item.num)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#00c58e] text-white font-black shadow-lg shadow-[#00c58e]/25 scale-[1.02] ring-2 ring-[#00c58e]/50"
                    : isCompleted
                    ? "bg-white/10 text-emerald-400 font-bold hover:bg-white/20"
                    : "text-slate-400 font-medium hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] sm:text-xs truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STEP 1: STAY & SCHEDULE ================= */}
      {step === 1 && (
        <div className="bg-[#0B132B]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black mb-2">
                <Hotel className="w-3.5 h-3.5" /> STEP 1 OF 5
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Select Destination, Hotel &amp; Stay Dates
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your guest’s destination city, check-in schedules, and room allotment requirements.
              </p>
            </div>
          </div>

          {/* Quick Destination Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Popular South India Destinations:
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_DESTINATIONS.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setDestinationCity(city)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    destinationCity.toLowerCase() === city.toLowerCase()
                      ? "bg-[#00c58e] text-white shadow-md shadow-[#00c58e]/30 font-black scale-105"
                      : "bg-[#111c3a] text-slate-300 border border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{city}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Destination / City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Destination City *
              </label>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="e.g. Mysuru, Ooty, Puducherry"
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#00c58e] focus:ring-1 focus:ring-[#00c58e] outline-none font-semibold"
              />
            </div>

            {/* Check-In Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Check-in Date *
              </label>
              <input
                type="date"
                value={checkInDate}
                min={today}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00c58e] focus:ring-1 focus:ring-[#00c58e] outline-none font-semibold [color-scheme:dark]"
              />
            </div>

            {/* Check-Out Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-out Date *
              </label>
              <input
                type="date"
                value={checkOutDate}
                min={checkInDate || today}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00c58e] focus:ring-1 focus:ring-[#00c58e] outline-none font-semibold [color-scheme:dark]"
              />
            </div>

            {/* Nights Duration Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Duration of Stay
              </label>
              <div className="bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm font-black text-amber-400 flex items-center justify-between">
                <span>{nightsCount} Night{nightsCount > 1 ? "s" : ""}</span>
                <span className="text-[11px] text-slate-400 font-normal">Check-in at 12:00 PM</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number of Rooms */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-indigo-400" /> Number of Rooms
              </label>
              <select
                value={roomsCount}
                onChange={(e) => setRoomsCount(Number(e.target.value))}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00c58e] outline-none font-semibold cursor-pointer [color-scheme:dark]"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} Room{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Guests */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Total Guests
              </label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00c58e] outline-none font-semibold cursor-pointer [color-scheme:dark]"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} Guest{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleStep1Next}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00c58e] hover:bg-[#00a87a] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00c58e]/30 transition-all cursor-pointer hover:scale-105"
            >
              <span>Next: Select Room Fleet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: SELECT HOTEL & ROOM CATEGORY ================= */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-[#0B132B]/95 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-5">
            {/* Header with Title and Modifiers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black mb-1">
                  <Bed className="w-3.5 h-3.5" /> STEP 2 OF 5 · ROOM &amp; RESORT FLEET
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Select Hotel &amp; Room Category
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Showing <strong>{filteredRooms.length}</strong> of <strong>{CURATED_HOTEL_ROOMS.length}</strong> resorts for {nightsCount} Night(s) · {roomsCount} Room(s) ({checkInDate} to {checkOutDate})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Modify Dates
                </button>
              </div>
            </div>

            {/* Live Search & Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              {/* Search input */}
              <div className="md:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by hotel name, city, room type, or amenity..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  className="w-full bg-[#111c3a] border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#00c58e]"
                />
                {roomSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRoomSearchQuery("")}
                    className="text-xs text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Sort by dropdown */}
              <div className="md:col-span-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-bold outline-none focus:border-[#00c58e] cursor-pointer [color-scheme:dark]"
                >
                  <option value="featured">✨ Recommended / Featured</option>
                  <option value="price_asc">💰 Price: Low to High</option>
                  <option value="price_desc">💎 Price: High to Low</option>
                  <option value="rating">⭐ Highest Rated (4.9+ ★)</option>
                </select>
              </div>
            </div>

            {/* Destination Filter Pills */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Filter by Destination City:</span>
                <span className="text-emerald-400 font-extrabold">{filteredRooms.length} Hotels Matched</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setStep2CityFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    step2CityFilter === "ALL"
                      ? "bg-[#00c58e] text-white shadow-md shadow-[#00c58e]/30 font-black scale-102"
                      : "bg-[#111c3a] text-slate-300 border border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span>✨ All Destinations ({CURATED_HOTEL_ROOMS.length})</span>
                </button>
                {POPULAR_DESTINATIONS.map((city) => {
                  const count = CURATED_HOTEL_ROOMS.filter(
                    (r) => r.city.toLowerCase() === city.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setStep2CityFilter(city)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                        step2CityFilter.toLowerCase() === city.toLowerCase()
                          ? "bg-[#00c58e] text-white shadow-md shadow-[#00c58e]/30 font-black scale-102"
                          : "bg-[#111c3a] text-slate-300 border border-white/10 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{city}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Category:
              </span>
              {HOTEL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedCategoryFilter === cat
                      ? "bg-indigo-600 text-white font-black shadow-xs"
                      : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat === "ALL" ? "All Types" : cat}
                </button>
              ))}
            </div>

            {/* Curated Rooms Grid */}
            {filteredRooms.length === 0 ? (
              <div className="p-8 text-center bg-[#091024] rounded-2xl border border-white/10 text-slate-400 space-y-3">
                <Bed className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-bold text-sm">No hotels found matching your current filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setRoomSearchQuery("");
                    setStep2CityFilter("ALL");
                    setSelectedCategoryFilter("ALL");
                  }}
                  className="px-4 py-2 bg-[#00c58e] text-white font-bold rounded-xl text-xs"
                >
                  Reset Filters &amp; Show All 33 Hotels
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
                {filteredRooms.map((room) => {
                  const isSelected = !isCustomRoom && selectedRoom.id === room.id;
                  const totalStayFare = room.pricePerNight * nightsCount * roomsCount;

                  return (
                    <div
                      key={room.id}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl ${
                        isSelected
                          ? "border-[#00c58e] ring-2 ring-[#00c58e]/50 bg-[#102046]"
                          : "border-white/15 bg-[#0e1733] hover:border-white/30 hover:bg-[#14234b]"
                      }`}
                    >
                      <div>
                        {/* Image Thumbnail */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                          <img
                            src={room.image}
                            alt={room.hotelName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1733] via-transparent to-black/30" />
                          <div className="absolute top-3 left-3 bg-[#0B132B]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[11px] font-black text-amber-300 flex items-center gap-1 shadow-sm">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{room.city}</span>
                          </div>
                          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-lg text-xs flex items-center gap-1 shadow-md">
                            <Star className="w-3 h-3 fill-slate-950" />
                            <span>{room.rating}</span>
                          </div>
                          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                            <span className="text-white font-black text-sm drop-shadow-md truncate">
                              {room.roomType}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-indigo-300 backdrop-blur-xs border border-white/10 shrink-0">
                              {room.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-black text-white text-base leading-tight group-hover:text-emerald-300 transition-colors">
                              {room.hotelName}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                              {room.description}
                            </p>
                          </div>

                          {/* Amenities Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {room.amenities.slice(0, 3).map((amenity) => (
                              <span
                                key={amenity}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                            <span className="flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5 text-indigo-400" />
                              {room.bedType}
                            </span>
                            <span className="text-slate-400">
                              {room.capacity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Selection Footer */}
                      <div className="p-4 pt-2 border-t border-white/10 bg-[#091024]/70 space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">
                              Tariff / Night
                            </div>
                            <div className="text-xs font-bold text-slate-300">
                              ₹{room.pricePerNight.toLocaleString("en-IN")} / night
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">
                              {nightsCount}N · {roomsCount} Room(s)
                            </div>
                            <div className="text-lg font-black text-[#00c58e]">
                              ₹{totalStayFare.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsCustomRoom(false);
                            }}
                            className={`py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? "bg-[#00c58e] text-white shadow-lg shadow-[#00c58e]/30 font-black ring-1 ring-white/20"
                                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> SELECTED ✓
                              </>
                            ) : (
                              "SELECT HOTEL"
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsCustomRoom(false);
                              setStep(3);
                              window.scrollTo({ top: 80, behavior: "smooth" });
                            }}
                            className="py-2 px-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md hover:scale-[1.02]"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Option for Custom Hotel / Room Entry */}
            <div className="mt-6 p-4 rounded-2xl bg-[#091024] border border-white/15">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-black text-white text-sm">
                    Custom Hotel or Non-Listed Resort Booking
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomRoom(!isCustomRoom)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    isCustomRoom
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "bg-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  {isCustomRoom ? "Using Custom Entry ✓" : "+ Custom Hotel Entry"}
                </button>
              </div>

              {isCustomRoom && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Hotel Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Radisson Blu Resort"
                      value={customHotelName}
                      onChange={(e) => setCustomHotelName(e.target.value)}
                      className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Room Category *</label>
                    <input
                      type="text"
                      placeholder="e.g. Deluxe Villa / Lake Suite"
                      value={customRoomType}
                      onChange={(e) => setCustomRoomType(e.target.value)}
                      className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Rate / Night (₹) *</label>
                    <input
                      type="number"
                      placeholder="4500"
                      value={customPricePerNight}
                      onChange={(e) => setCustomPricePerNight(Number(e.target.value))}
                      className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dates
              </button>

              <button
                type="button"
                onClick={handleStep2Next}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00c58e] hover:bg-[#00a87a] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00c58e]/30 transition-all cursor-pointer hover:scale-105"
              >
                <span>Next: Guest Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: GUEST DETAILS ================= */}
      {step === 3 && (
        <div className="bg-[#0B132B]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
          {/* Summary Box */}
          <div className="bg-[#111c3a] border border-white/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                SELECTED HOTEL &amp; RESERVATION
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {effectiveHotelName} · {effectiveCity}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {effectiveRoomType} · {checkInDate} to {checkOutDate} ({nightsCount} Nights · {roomsCount} Room · {guestsCount} Guests)
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Stay Tariff</div>
              <div className="text-xl font-black text-[#00c58e]">
                ₹{totalFare.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="pb-3 border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black mb-1">
              <User className="w-3.5 h-3.5" /> STEP 3 OF 5
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Primary Guest &amp; Contact Details
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              This information will be printed on the official hotel voucher and recorded in the reservations manifest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Guest Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Guest Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#00c58e] outline-none font-semibold"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="e.g. 9964600247 / 9740463404"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#00c58e] outline-none font-semibold"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                e.g. 9964600247, 9740463404
              </p>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. guest@email.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#00c58e] outline-none font-semibold"
              />
            </div>

            {/* ID Proof Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Government ID Type
              </label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00c58e] outline-none font-semibold cursor-pointer [color-scheme:dark]"
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Passport">Passport (Mandatory for International Guests)</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            {/* Meal Plan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-400" /> Meal Plan
              </label>
              <select
                value={mealPlan}
                onChange={(e) => setMealPlan(e.target.value)}
                className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00c58e] outline-none font-semibold cursor-pointer [color-scheme:dark]"
              >
                <option value="CP - Complimentary Breakfast">CP - Continental Plan (Free Breakfast)</option>
                <option value="EP - Room Only">EP - European Plan (Room Only, No Meals)</option>
                <option value="MAP - Breakfast & Dinner">MAP - Modified American (Breakfast + Dinner)</option>
                <option value="AP - All Meals Included">AP - American Plan (All 3 Meals Included)</option>
              </select>
            </div>

            {/* Admin Custom Fare Override */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                ⚡ Admin Fare Adjustment (Optional)
              </label>
              <input
                type="number"
                placeholder={`Leave blank to keep ₹${calculatedRoomFare}`}
                value={customFareAdjustment}
                onChange={(e) => setCustomFareAdjustment(e.target.value)}
                className="w-full bg-[#111c3a] border border-amber-500/40 rounded-xl px-4 py-2.5 text-sm text-amber-300 placeholder:text-slate-500 focus:border-amber-400 outline-none font-bold"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Special Instructions / Bedding Preferences / Airport Pickup:
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Non-smoking room, King Bed preferred, late check-in at 8 PM, extra bed required."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full bg-[#111c3a] border border-white/20 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:border-[#00c58e] outline-none"
            />
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Fleet
            </button>

            <button
              type="button"
              onClick={handleStep3Next}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00c58e] hover:bg-[#00a87a] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00c58e]/30 transition-all cursor-pointer hover:scale-105"
            >
              <span>Next: Payment Choice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: PAYMENT CHOICE ================= */}
      {step === 4 && (
        <div className="bg-[#0B132B]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
          <div className="pb-4 border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black mb-1">
              <Zap className="w-3.5 h-3.5" /> STEP 4 OF 5
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Payment Choice</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select payment option to confirm reservation and issue official hotel voucher.
            </p>
          </div>

          {/* Payment Method Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pay Advance via UPI */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setAdvanceOption(1000)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                advanceOption !== 0
                  ? "border-[#00c58e] bg-[#112444] shadow-lg shadow-[#00c58e]/20 ring-2 ring-[#00c58e]/50"
                  : "border-white/15 bg-[#0e1733] hover:border-white/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-black text-white text-base">
                    <Zap className="w-5 h-5 text-amber-400" /> Pay Token Advance
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#00c58e]/20 text-[#00c58e] border border-[#00c58e]/40">
                    PRIORITY LOCK
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Instant room allotment lock with official hotel confirmation voucher generation.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Advance Amount:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={customAdvanceInput}
                    onChange={(e) => {
                      setCustomAdvanceInput(e.target.value);
                      setAdvanceOption(Number(e.target.value) || 1);
                    }}
                    className="w-24 bg-[#091024] border border-white/20 rounded-lg px-2.5 py-1 text-sm font-black text-[#00c58e] text-right outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Zero Advance */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setAdvanceOption(0);
                setCustomAdvanceInput("0");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                advanceOption === 0
                  ? "border-[#00c58e] bg-[#112444] shadow-lg shadow-[#00c58e]/20 ring-2 ring-[#00c58e]/50"
                  : "border-white/15 bg-[#0e1733] hover:border-white/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-black text-white text-base">
                    Zero Advance / Pay at Hotel
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    Pay ₹0 Today
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Pay the full tariff amount of ₹{totalFare.toLocaleString("en-IN")} upon arrival at the hotel front desk.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-right">
                <span className="text-xs font-black text-amber-400">Pay at Check-in</span>
              </div>
            </div>
          </div>

          {/* UPI Payment Container */}
          {advanceOption !== 0 && (
            <div className="p-5 rounded-2xl bg-[#091024] border border-white/15 space-y-4">
              <div className="flex items-center gap-2 font-black text-white text-sm">
                <Zap className="w-4 h-4 text-[#00c58e]" />
                <span>Pay ₹{effectiveAdvance.toLocaleString("en-IN")} Token Advance via UPI</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* QR Code */}
                <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0 text-center border-2 border-purple-300">
                  <div className="w-40 overflow-hidden rounded-xl bg-slate-50 border border-slate-200">
                    <img src="/images/phonepe-qr.jpg" alt="PhonePe QR Code - ZAMEER S" className="w-full h-auto object-contain" />
                  </div>
                  <div className="text-[10px] font-black text-purple-900 mt-1">
                    PhonePe · ZAMEER S
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="bg-[#0B132B] border border-white/15 rounded-xl p-3 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Beneficiary / Merchant</div>
                      <div className="font-black text-white text-base flex items-center gap-2">
                        ZAMEER S
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">Verified</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">fortunetourism@okaxis</div>
                    </div>
                    <button
                      type="button"
                      onClick={copyUPI}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/70 px-3 py-1.5 rounded-lg border border-emerald-500/40 hover:bg-emerald-900 transition-colors cursor-pointer"
                    >
                      {upiCopied ? <Check className="w-3.5 h-3.5 text-[#00c58e]" /> : <Copy className="w-3.5 h-3.5" />}
                      {upiCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "GPay", link: `tez://upi/pay?pa=fortunetourism@okaxis&pn=Fortune+Tourism&am=${effectiveAdvance}&tn=Hotel+Advance` },
                      { name: "PhonePe", link: `phonepe://pay?pa=fortunetourism@okaxis&pn=Fortune+Tourism&am=${effectiveAdvance}` },
                      { name: "Paytm", link: `paytmmp://upi/pay?pa=fortunetourism@okaxis&pn=Fortune+Tourism&am=${effectiveAdvance}` },
                      { name: "Any UPI App", link: `upi://pay?pa=fortunetourism@okaxis&pn=Fortune%20Tourism&am=${effectiveAdvance}&tn=Hotel%20Advance` },
                    ].map((app) => (
                      <a
                        key={app.name}
                        href={app.link}
                        className="text-xs font-bold text-slate-200 bg-[#16244a] border border-white/15 px-3 py-1.5 rounded-lg hover:border-[#00c58e] hover:text-white transition-all shadow-xs"
                      >
                        {app.name}
                      </a>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      UTR / Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 423589124012"
                      value={utrRef}
                      onChange={(e) => setUtrRef(e.target.value)}
                      className="w-full bg-[#111c3a] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Guest Details
            </button>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00c58e] hover:bg-[#00a87a] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00c58e]/30 transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Generating Voucher..." : "Confirm Booking & Generate Voucher"}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: OFFICIAL VOUCHER & TICKET COPY ================= */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Banner with Actions */}
          <div className="no-print bg-[#0B132B]/95 border border-white/15 rounded-2xl p-5 shadow-2xl text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00c58e] text-white flex items-center justify-center shadow-md shadow-[#00c58e]/20 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-base sm:text-lg">
                    Hotel Booking Confirmed Successfully!
                  </h2>
                  <p className="text-xs text-slate-400">
                    Your official Ticket Copy &amp; Hotel Voucher is generated below. You can download PDF or print it.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
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

                {onOpenHotelManagement && (
                  <button
                    type="button"
                    onClick={onOpenHotelManagement}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" /> View in Hotel Hub
                  </button>
                )}
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

              <div className="flex items-center gap-2">
                <a
                  href={buildWhatsAppUrl(
                    `Hello Fortune Tourism! New offline Hotel Reservation confirmed.\n\n*Ticket No:* ${ticketNumber}\n*PNR:* ${pnrNumber}\n*Guest:* ${guestName}\n*Phone:* ${guestPhone}\n*Hotel:* ${effectiveHotelName}\n*City:* ${effectiveCity}\n*Room:* ${effectiveRoomType}\n*Stay:* ${checkInDate} to ${checkOutDate} (${nightsCount}N)\n*Total Fare:* ₹${totalFare.toLocaleString("en-IN")}\n*Advance:* ₹${effectiveAdvance.toLocaleString("en-IN")}\n*Balance:* ₹${balanceDue.toLocaleString("en-IN")}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Share on WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setTicketNumber(`FT-HTL-2026-${String(Math.floor(100 + Math.random() * 900))}`);
                    setPnrNumber(generatePNR());
                    setGuestName("");
                    setGuestPhone("");
                  }}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10"
                >
                  + New Reservation
                </button>
              </div>
            </div>
          </div>

          {/* OFFICIAL TICKET COPY VOUCHER CONTAINER */}
          <div
            id="official-ticket-card"
            className="ticket-copy-print-area bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-md space-y-4"
          >
            {/* Brand Header with Logo & Official Address */}
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
                  Official Hotel Reservation &amp; Stay Voucher
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
                    <strong className="font-mono font-black text-emerald-700 text-sm sm:text-base tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                      ₹{totalFare.toLocaleString("en-IN")}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Official 4-Row Spreadsheet Grid matching Screenshot 145113 */}
            <div className="border border-slate-900 overflow-x-auto text-[11px] sm:text-xs text-slate-900 font-sans">
              <table className="w-full border-collapse">
                <tbody>
                  {/* ROW 1 */}
                  <tr className="border-b border-slate-900">
                    <td className="w-[18%] p-2 font-black border-r border-slate-900 bg-slate-100">
                      Guest Name:
                    </td>
                    <td className="w-[32%] p-2 font-black border-r border-slate-900 uppercase">
                      {guestName || "GUEST"}
                    </td>
                    <td className="w-[18%] p-2 font-black border-r border-slate-900 bg-slate-100">
                      Guest Phone No.:
                    </td>
                    <td className="w-[16%] p-2 font-black border-r border-slate-900 font-mono">
                      {guestPhone || "+91 9740463404"}
                    </td>
                    <td className="w-[8%] p-2 font-black border-r border-slate-900 bg-slate-100">
                      Tour Type
                    </td>
                    <td className="w-[8%] p-2 font-black uppercase text-center bg-indigo-50 text-indigo-900">
                      HOTEL STAY
                    </td>
                  </tr>

                  {/* ROW 2 */}
                  <tr className="border-b border-slate-900">
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      CITY / DESTINATION:
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 uppercase">
                      {effectiveCity}
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      HOTEL &amp; RESORT:
                    </td>
                    <td colSpan={3} className="p-2 font-black uppercase text-indigo-950">
                      {effectiveHotelName}
                    </td>
                  </tr>

                  {/* ROW 3 */}
                  <tr className="border-b border-slate-900">
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      Ticket Number:
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 font-mono text-amber-700">
                      {ticketNumber}
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      PNR Number:
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 font-mono">
                      {pnrNumber}
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      Check-in:
                    </td>
                    <td className="p-2 font-black text-center font-mono">
                      {checkInDate}
                    </td>
                  </tr>

                  {/* ROW 4 */}
                  <tr className="border-b border-slate-900">
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      Room Category:
                    </td>
                    <td className="p-2 font-bold border-r border-slate-900">
                      {effectiveRoomType} ({roomsCount} Room · {guestsCount} Guests)
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      Check-out Date:
                    </td>
                    <td colSpan={3} className="p-2 font-black font-mono">
                      {checkOutDate} · {nightsCount} Night(s) Stay
                    </td>
                  </tr>

                  {/* ROW 5 */}
                  <tr className="border-b border-slate-900">
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      Meal Plan:
                    </td>
                    <td className="p-2 font-bold border-r border-slate-900">
                      {mealPlan}
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      ID Proof:
                    </td>
                    <td colSpan={3} className="p-2 font-bold">
                      {idProofType} (Presented at Check-in)
                    </td>
                  </tr>

                  {/* ROW 6: FARE & PAYMENT */}
                  <tr>
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      Total Fare Amount:
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 text-emerald-800 text-sm">
                      ₹{totalFare.toLocaleString("en-IN")}
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      Payment Status:
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 text-emerald-700 uppercase">
                      {effectiveAdvance > 0
                        ? `ADVANCE PAID (₹${effectiveAdvance})`
                        : "ZERO ADVANCE · PAY AT CHECK-IN"}
                    </td>
                    <td className="p-2 font-black border-r border-slate-900 bg-slate-100">
                      Balance Due:
                    </td>
                    <td className="p-2 font-black text-rose-700 text-center">
                      ₹{balanceDue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms and Instructions Footer */}
            <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-[10px] sm:text-[11px] text-slate-700 space-y-1">
              <div className="font-black text-slate-900 uppercase">TERMS &amp; INSTRUCTIONS</div>
              <div>1. Please carry this official hotel voucher along with valid government photo identification during check-in.</div>
              <div>2. Standard hotel check-in time is 12:00 PM and check-out is 11:00 AM unless prior early check-in is arranged.</div>
              <div>3. For customer support, room adjustments, or invoice requests, call Fortune Tourism 24/7 hotline at +91 9740463404.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
