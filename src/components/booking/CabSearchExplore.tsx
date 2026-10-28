import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeftRight,
  ShieldCheck,
  Headphones,
  IndianRupee,
  Check,
  Star,
  Luggage,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { LocationSearchInput } from "./LocationSearchInput";
import { getRealCurrentTime } from "@/lib/utils";

export type CabTabType = "ONE WAY" | "ROUND TRIP" | "LOCAL" | "AIRPORT" | "HOURLY PACKAGE";

export interface CabSearchData {
  tab: CabTabType;
  from: string;
  to: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  localPackage: "4hr_40km" | "8hr_80km" | "12hr_120km";
  airportTripType: "Drop to Airport" | "Pickup from Airport";
  airportName: string;
}

export interface AvailableCab {
  id: string;
  name: string;
  categoryName: string;
  rating: number;
  seats: number;
  ac: boolean;
  image: string;
  includedKms: number;
  postLimitRate: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  chargesAndTaxes: number;
  fuelOptions: string[];
}

interface CabSearchExploreProps {
  onSelectCar: (selectedCab: AvailableCab, searchData: CabSearchData, fuelType: string, withLuggage: boolean) => void;
  initialSearchData?: Partial<CabSearchData>;
}

export function CabSearchExplore({ onSelectCar, initialSearchData }: CabSearchExploreProps) {
  // Today formatted as YYYY-MM-DD for input min
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [searchData, setSearchData] = useState<CabSearchData>({
    tab: initialSearchData?.tab || "ONE WAY",
    from: initialSearchData?.from || "Bangalore",
    to: initialSearchData?.to || "Mysore",
    pickupDate: initialSearchData?.pickupDate || today,
    returnDate: initialSearchData?.returnDate || today,
    pickupTime: initialSearchData?.pickupTime || getRealCurrentTime(),
    localPackage: initialSearchData?.localPackage || "4hr_40km",
    airportTripType: initialSearchData?.airportTripType || "Drop to Airport",
    airportName: initialSearchData?.airportName || "Terminal 1, Kempegowda International Airport (BLR)",
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [selectedFuel, setSelectedFuel] = useState<Record<string, string>>({
    wagon_r: "CNG",
    etios: "Diesel",
    ertiga: "Diesel",
    innova: "Diesel",
    tempo: "Diesel",
  });
  const [luggageCarrierSelected, setLuggageCarrierSelected] = useState<Record<string, boolean>>({});

  const swapLocations = () => {
    setSearchData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  // Generate dynamic car listing based on active Tab & Package
  const availableCabs: AvailableCab[] = useMemo(() => {
    if (searchData.tab === "LOCAL") {
      if (searchData.localPackage === "4hr_40km") {
        return [
          {
            id: "wagon_r",
            name: "Wagon R or Equivalent",
            categoryName: "or equivalent | 4 seater AC Cab",
            rating: 4.8,
            seats: 4,
            ac: true,
            image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80",
            includedKms: 40,
            postLimitRate: 12,
            originalPrice: 1540,
            discountedPrice: 1341,
            discountPercent: 13,
            chargesAndTaxes: 67,
            fuelOptions: ["CNG", "Diesel"],
          },
          {
            id: "etios",
            name: "Toyota Etios or Equivalent",
            categoryName: "or equivalent | 4 seater AC Cab",
            rating: 4.8,
            seats: 4,
            ac: true,
            image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
            includedKms: 40,
            postLimitRate: 14,
            originalPrice: 1571,
            discountedPrice: 1369,
            discountPercent: 13,
            chargesAndTaxes: 68,
            fuelOptions: ["CNG", "Diesel"],
          },
          {
            id: "ertiga",
            name: "Maruti Ertiga or Equivalent",
            categoryName: "or equivalent | 6 seater AC SUV",
            rating: 4.9,
            seats: 6,
            ac: true,
            image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
            includedKms: 40,
            postLimitRate: 17,
            originalPrice: 2200,
            discountedPrice: 1850,
            discountPercent: 16,
            chargesAndTaxes: 92,
            fuelOptions: ["CNG", "Diesel"],
          },
          {
            id: "innova",
            name: "Toyota Innova Crysta",
            categoryName: "or equivalent | 7 seater Premium AC Cab",
            rating: 4.9,
            seats: 7,
            ac: true,
            image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80",
            includedKms: 40,
            postLimitRate: 21,
            originalPrice: 2850,
            discountedPrice: 2400,
            discountPercent: 16,
            chargesAndTaxes: 120,
            fuelOptions: ["Diesel"],
          },
        ];
      }
      if (searchData.localPackage === "8hr_80km") {
        return [
          {
            id: "wagon_r",
            name: "Wagon R or Equivalent",
            categoryName: "or equivalent | 4 seater AC Cab",
            rating: 4.8,
            seats: 4,
            ac: true,
            image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80",
            includedKms: 80,
            postLimitRate: 12,
            originalPrice: 2600,
            discountedPrice: 2200,
            discountPercent: 15,
            chargesAndTaxes: 110,
            fuelOptions: ["CNG", "Diesel"],
          },
          {
            id: "etios",
            name: "Toyota Etios or Equivalent",
            categoryName: "or equivalent | 4 seater AC Cab",
            rating: 4.8,
            seats: 4,
            ac: true,
            image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
            includedKms: 80,
            postLimitRate: 14,
            originalPrice: 2850,
            discountedPrice: 2400,
            discountPercent: 16,
            chargesAndTaxes: 120,
            fuelOptions: ["CNG", "Diesel"],
          },
          {
            id: "ertiga",
            name: "Maruti Ertiga or Equivalent",
            categoryName: "or equivalent | 6 seater AC SUV",
            rating: 4.9,
            seats: 6,
            ac: true,
            image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
            includedKms: 80,
            postLimitRate: 17,
            originalPrice: 3800,
            discountedPrice: 3200,
            discountPercent: 16,
            chargesAndTaxes: 160,
            fuelOptions: ["CNG", "Diesel"],
          },
          {
            id: "innova",
            name: "Toyota Innova Crysta",
            categoryName: "or equivalent | 7 seater Premium AC Cab",
            rating: 4.9,
            seats: 7,
            ac: true,
            image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80",
            includedKms: 80,
            postLimitRate: 21,
            originalPrice: 4800,
            discountedPrice: 4100,
            discountPercent: 15,
            chargesAndTaxes: 205,
            fuelOptions: ["Diesel"],
          },
        ];
      }
      // 12hr_120km
      return [
        {
          id: "wagon_r",
          name: "Wagon R or Equivalent",
          categoryName: "or equivalent | 4 seater AC Cab",
          rating: 4.8,
          seats: 4,
          ac: true,
          image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80",
          includedKms: 120,
          postLimitRate: 12,
          originalPrice: 3400,
          discountedPrice: 2900,
          discountPercent: 15,
          chargesAndTaxes: 145,
          fuelOptions: ["CNG", "Diesel"],
        },
        {
          id: "etios",
          name: "Toyota Etios or Equivalent",
          categoryName: "or equivalent | 4 seater AC Cab",
          rating: 4.8,
          seats: 4,
          ac: true,
          image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
          includedKms: 120,
          postLimitRate: 14,
          originalPrice: 3800,
          discountedPrice: 3200,
          discountPercent: 16,
          chargesAndTaxes: 160,
          fuelOptions: ["CNG", "Diesel"],
        },
        {
          id: "ertiga",
          name: "Maruti Ertiga or Equivalent",
          categoryName: "or equivalent | 6 seater AC SUV",
          rating: 4.9,
          seats: 6,
          ac: true,
          image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
          includedKms: 120,
          postLimitRate: 17,
          originalPrice: 4800,
          discountedPrice: 4100,
          discountPercent: 15,
          chargesAndTaxes: 205,
          fuelOptions: ["CNG", "Diesel"],
        },
      ];
    }

    if (searchData.tab === "ROUND TRIP") {
      return [
        {
          id: "wagon_r",
          name: "Wagon R or Equivalent",
          categoryName: "or equivalent | 4 seater AC Cab",
          rating: 4.7,
          seats: 4,
          ac: true,
          image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80",
          includedKms: 294,
          postLimitRate: 10,
          originalPrice: 3630,
          discountedPrice: 3222,
          discountPercent: 11,
          chargesAndTaxes: 528,
          fuelOptions: ["CNG", "Diesel"],
        },
        {
          id: "etios",
          name: "Toyota Etios or Equivalent",
          categoryName: "or equivalent | 4 seater AC Cab",
          rating: 4.7,
          seats: 4,
          ac: true,
          image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
          includedKms: 294,
          postLimitRate: 10,
          originalPrice: 3728,
          discountedPrice: 3296,
          discountPercent: 12,
          chargesAndTaxes: 531,
          fuelOptions: ["CNG", "Diesel"],
        },
        {
          id: "ertiga",
          name: "Maruti Ertiga or Equivalent",
          categoryName: "or equivalent | 6 seater AC SUV",
          rating: 4.8,
          seats: 6,
          ac: true,
          image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
          includedKms: 294,
          postLimitRate: 14,
          originalPrice: 5100,
          discountedPrice: 4450,
          discountPercent: 13,
          chargesAndTaxes: 640,
          fuelOptions: ["CNG", "Diesel"],
        },
        {
          id: "innova",
          name: "Toyota Innova Crysta",
          categoryName: "or equivalent | 7 seater Premium AC Cab",
          rating: 4.9,
          seats: 7,
          ac: true,
          image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80",
          includedKms: 294,
          postLimitRate: 18,
          originalPrice: 6500,
          discountedPrice: 5650,
          discountPercent: 13,
          chargesAndTaxes: 780,
          fuelOptions: ["Diesel"],
        },
      ];
    }

    if (searchData.tab === "AIRPORT") {
      return [
        {
          id: "wagon_r",
          name: "Wagon R or Equivalent",
          categoryName: "or equivalent | 4 seater AC Cab",
          rating: 4.8,
          seats: 4,
          ac: true,
          image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80",
          includedKms: 45,
          postLimitRate: 14,
          originalPrice: 1450,
          discountedPrice: 1199,
          discountPercent: 17,
          chargesAndTaxes: 50,
          fuelOptions: ["CNG", "EV", "Diesel"],
        },
        {
          id: "etios",
          name: "Toyota Etios or Equivalent",
          categoryName: "or equivalent | 4 seater AC Cab",
          rating: 4.8,
          seats: 4,
          ac: true,
          image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
          includedKms: 45,
          postLimitRate: 16,
          originalPrice: 1650,
          discountedPrice: 1399,
          discountPercent: 15,
          chargesAndTaxes: 60,
          fuelOptions: ["CNG", "Diesel"],
        },
        {
          id: "ertiga",
          name: "Maruti Ertiga or Equivalent",
          categoryName: "or equivalent | 6 seater AC SUV",
          rating: 4.9,
          seats: 6,
          ac: true,
          image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
          includedKms: 45,
          postLimitRate: 19,
          originalPrice: 2200,
          discountedPrice: 1850,
          discountPercent: 16,
          chargesAndTaxes: 85,
          fuelOptions: ["CNG", "Diesel"],
        },
      ];
    }

    // Default ONE WAY
    return [
      {
        id: "wagon_r",
        name: "Wagon R or Equivalent",
        categoryName: "or equivalent | 4 seater AC Cab",
        rating: 4.8,
        seats: 4,
        ac: true,
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80",
        includedKms: 145,
        postLimitRate: 18.25,
        originalPrice: 2196,
        discountedPrice: 1783,
        discountPercent: 19,
        chargesAndTaxes: 483,
        fuelOptions: ["CNG", "EV", "Diesel"],
      },
      {
        id: "etios",
        name: "Toyota Etios or Equivalent",
        categoryName: "or equivalent | 4 seater AC Cab",
        rating: 4.8,
        seats: 4,
        ac: true,
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
        includedKms: 145,
        postLimitRate: 19.5,
        originalPrice: 2400,
        discountedPrice: 1950,
        discountPercent: 19,
        chargesAndTaxes: 490,
        fuelOptions: ["CNG", "Diesel"],
      },
      {
        id: "ertiga",
        name: "Maruti Ertiga or Equivalent",
        categoryName: "or equivalent | 6 seater AC SUV",
        rating: 4.9,
        seats: 6,
        ac: true,
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
        includedKms: 145,
        postLimitRate: 22,
        originalPrice: 3200,
        discountedPrice: 2650,
        discountPercent: 17,
        chargesAndTaxes: 580,
        fuelOptions: ["CNG", "Diesel"],
      },
      {
        id: "innova",
        name: "Toyota Innova Crysta",
        categoryName: "or equivalent | 7 seater Premium AC Cab",
        rating: 4.9,
        seats: 7,
        ac: true,
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80",
        includedKms: 145,
        postLimitRate: 26,
        originalPrice: 4100,
        discountedPrice: 3400,
        discountPercent: 17,
        chargesAndTaxes: 720,
        fuelOptions: ["Diesel"],
      },
      {
        id: "tempo",
        name: "Tempo Traveller (12–17 Seater)",
        categoryName: "or equivalent | 12-17 Seater AC Mini Bus",
        rating: 4.8,
        seats: 15,
        ac: true,
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80",
        includedKms: 145,
        postLimitRate: 32,
        originalPrice: 6200,
        discountedPrice: 5200,
        discountPercent: 16,
        chargesAndTaxes: 980,
        fuelOptions: ["Diesel"],
      },
    ];
  }, [searchData.tab, searchData.localPackage]);

  // Route title for the top results bar
  const routeDisplayTitle = useMemo(() => {
    if (searchData.tab === "LOCAL") {
      return `${searchData.from || "Bangalore"}`;
    }
    if (searchData.tab === "ROUND TRIP") {
      return `${searchData.from || "Bangalore"} - ${searchData.to || "Mysore"} - ${searchData.from || "Bangalore"}`;
    }
    if (searchData.tab === "AIRPORT") {
      return searchData.airportTripType === "Drop to Airport"
        ? `${searchData.from || "City Location"} → ${searchData.airportName.split(",")[0]}`
        : `${searchData.airportName.split(",")[0]} → ${searchData.from || "City Location"}`;
    }
    return `${searchData.from || "Bangalore"} - ${searchData.to || "Mysore"}`;
  }, [searchData]);

  return (
    <div className="space-y-6">
      {/* 1. TOP CAB SEARCH WIDGET (Exact layout from uploaded screenshots) */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 sm:p-6 space-y-4">
        {/* Trip Type Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-xs sm:text-sm font-bold bg-white">
            {(["ONE WAY", "ROUND TRIP", "LOCAL", "AIRPORT", "HOURLY PACKAGE"] as CabTabType[]).map((tab) => {
              const isActive = searchData.tab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSearchData((prev) => ({ ...prev, tab }))}
                  style={isActive ? { backgroundColor: "#0E6B50", color: "#ffffff" } : undefined}
                  className={`px-4 sm:px-6 py-2.5 transition-colors uppercase tracking-wider ${
                    isActive
                      ? "bg-[#0E6B50] text-white font-extrabold shadow-inner"
                      : "text-slate-700 hover:bg-slate-50 border-r last:border-r-0 border-slate-200"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* PACKAGE SELECTOR BUTTONS IN ONE ROW (Only For HOURLY PACKAGE) */}
        {searchData.tab === "HOURLY PACKAGE" && (
          <div className="flex flex-col items-center justify-center gap-1.5 pt-2 pb-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> SELECT RENTAL PACKAGE
            </div>
            <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden text-xs sm:text-sm font-bold bg-white shadow-2xs">
              {[
                { id: "4hr_40km", label: "4 hrs | 40 km" },
                { id: "8hr_80km", label: "8 hrs | 80 km" },
                { id: "12hr_120km", label: "12 hrs | 120 km" },
              ].map((pkg) => {
                const isSelected = searchData.localPackage === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSearchData((prev) => ({ ...prev, localPackage: pkg.id as any }))}
                    style={isSelected ? { backgroundColor: "#0E6B50", color: "#ffffff" } : undefined}
                    className={`px-3 sm:px-5 py-2 transition-all uppercase tracking-wider ${
                      isSelected
                        ? "bg-[#0E6B50] text-white font-extrabold shadow-inner"
                        : "text-slate-700 hover:bg-slate-50 border-r last:border-r-0 border-slate-200"
                    }`}
                  >
                    {pkg.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Fields Row */}
        <div className="pt-2">
          {/* ONE WAY */}
          {searchData.tab === "ONE WAY" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
              <div className="md:col-span-6 flex items-end gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                    FROM
                  </label>
                  <LocationSearchInput
                    value={searchData.from}
                    onChange={(val) => setSearchData((prev) => ({ ...prev, from: val }))}
                    placeholder="Enter Pickup Location"
                  />
                </div>

                <div className="flex-shrink-0 pb-1">
                  <button
                    type="button"
                    onClick={swapLocations}
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                    title="Swap From and To"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                    TO
                  </label>
                  <LocationSearchInput
                    value={searchData.to}
                    onChange={(val) => setSearchData((prev) => ({ ...prev, to: val }))}
                    placeholder="Enter Drop Location"
                  />
                </div>
              </div>

              {/* PICK UP DATE */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  PICK UP DATE
                </label>
                <input
                  type="date"
                  min={today}
                  value={searchData.pickupDate}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, pickupDate: e.target.value }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>

              {/* PICK UP TIME */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  PICK UP TIME
                </label>
                <input
                  type="time"
                  value={searchData.pickupTime}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, pickupTime: e.target.value }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* ROUND TRIP */}
          {searchData.tab === "ROUND TRIP" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
              <div className="md:col-span-6 flex items-end gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                    FROM
                  </label>
                  <LocationSearchInput
                    value={searchData.from}
                    onChange={(val) => setSearchData((prev) => ({ ...prev, from: val }))}
                    placeholder="Enter Pickup Location"
                  />
                </div>

                <div className="flex-shrink-0 pb-1">
                  <button
                    type="button"
                    onClick={swapLocations}
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                    title="Swap From and To"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                    TO
                  </label>
                  <LocationSearchInput
                    value={searchData.to}
                    onChange={(val) => setSearchData((prev) => ({ ...prev, to: val }))}
                    placeholder="Enter Drop Location"
                  />
                </div>
              </div>

              {/* PICK UP DATE */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  PICK UP DATE
                </label>
                <input
                  type="date"
                  min={today}
                  value={searchData.pickupDate}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, pickupDate: e.target.value }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>

              {/* RETURN DATE */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  RETURN DATE
                </label>
                <input
                  type="date"
                  min={searchData.pickupDate || today}
                  value={searchData.returnDate}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, returnDate: e.target.value }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>

              {/* PICK UP TIME */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800 whitespace-nowrap">
                  PICK UP TIME
                </label>
                <input
                  type="time"
                  value={searchData.pickupTime}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, pickupTime: e.target.value }))}
                  className="w-full min-w-[100px] bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* LOCAL (With Drop Location and Package Buttons) */}
          {searchData.tab === "LOCAL" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* FROM + SWAP + TO (Equal 50/50 Symmetrical Width) */}
              <div className="md:col-span-6 flex items-end gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                    PICKUP LOCATION
                  </label>
                  <LocationSearchInput
                    value={searchData.from}
                    onChange={(val) => setSearchData((prev) => ({ ...prev, from: val }))}
                    placeholder="Enter Pickup Location"
                  />
                </div>

                <div className="flex-shrink-0 pb-1">
                  <button
                    type="button"
                    onClick={swapLocations}
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                    title="Swap From and To"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                    DROP LOCATION
                  </label>
                  <LocationSearchInput
                    value={searchData.to}
                    onChange={(val) => setSearchData((prev) => ({ ...prev, to: val }))}
                    placeholder="Enter Drop Location"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  PICK UP DATE
                </label>
                <input
                  type="date"
                  min={today}
                  value={searchData.pickupDate}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, pickupDate: e.target.value }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  PICK UP TIME
                </label>
                <input
                  type="time"
                  value={searchData.pickupTime}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, pickupTime: e.target.value }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* AIRPORT */}
          {searchData.tab === "AIRPORT" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  TRIP
                </label>
                <select
                  value={searchData.airportTripType}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, airportTripType: e.target.value as any }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                >
                  <option value="Drop to Airport">Drop to Airport</option>
                  <option value="Pickup from Airport">Pickup from Airport</option>
                </select>
              </div>

              {searchData.airportTripType === "Drop to Airport" ? (
                <>
                  {/* 1. Pickup Location (Search + GPS) */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                      PICKUP LOCATION
                    </label>
                    <LocationSearchInput
                      value={searchData.from}
                      onChange={(val) => setSearchData((prev) => ({ ...prev, from: val }))}
                      placeholder="Enter Pickup Location / Area (e.g. Rajajinagar)"
                    />
                  </div>

                  {/* 2. Drop Airport (Searchable & Editable) */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                      DROP AIRPORT
                    </label>
                    <LocationSearchInput
                      value={searchData.airportName}
                      onChange={(val) => setSearchData((prev) => ({ ...prev, airportName: val }))}
                      placeholder="Enter Airport / Terminal (e.g. Terminal 1, BLR)"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* 1. Pickup Airport (Searchable & Editable) */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                      PICKUP AIRPORT
                    </label>
                    <LocationSearchInput
                      value={searchData.airportName}
                      onChange={(val) => setSearchData((prev) => ({ ...prev, airportName: val }))}
                      placeholder="Enter Airport / Terminal (e.g. Terminal 2, BLR)"
                    />
                  </div>

                  {/* 2. Drop Location (Search + GPS) */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                      DROP LOCATION
                    </label>
                    <LocationSearchInput
                      value={searchData.to}
                      onChange={(val) => setSearchData((prev) => ({ ...prev, to: val }))}
                      placeholder="Enter Drop Location / Area (e.g. Rajajinagar)"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  PICK UP DATE
                </label>
                <input
                  type="date"
                  min={today}
                  value={searchData.pickupDate}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, pickupDate: e.target.value }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black tracking-wider uppercase text-slate-800">
                  PICK UP TIME
                </label>
                <input
                  type="time"
                  value={searchData.pickupTime}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, pickupTime: e.target.value }))}
                  className="w-full bg-white border-b-2 border-slate-300 focus:border-emerald-600 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* EXPLORE CABS Center Orange Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setHasSearched(true)}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-10 py-3 rounded-md uppercase tracking-wider text-sm sm:text-base shadow-md transition-all hover:scale-105"
          >
            EXPLORE CABS
          </button>
        </div>
      </div>

      {/* 2. RESULTS LISTING (Exact layout matching the uploaded screenshots) */}
      {hasSearched && (
        <div className="space-y-4">
          {/* Top Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="font-black text-slate-900 text-base sm:text-lg">
                {routeDisplayTitle}
              </div>

              <div className="text-slate-600">
                <span className="text-slate-400 text-xs uppercase block">Trip Type</span>
                <strong className="text-slate-800 capitalize">{searchData.tab.toLowerCase()}</strong>
              </div>

              <div className="text-slate-600">
                <span className="text-slate-400 text-xs uppercase block">Pick up</span>
                <strong className="text-slate-800">{searchData.pickupDate}</strong>
              </div>

              {searchData.tab === "ROUND TRIP" && (
                <div className="text-slate-600">
                  <span className="text-slate-400 text-xs uppercase block">Return</span>
                  <strong className="text-slate-800">{searchData.returnDate}</strong>
                </div>
              )}

              <div className="text-slate-600">
                <span className="text-slate-400 text-xs uppercase block">Time</span>
                <strong className="text-slate-800">{searchData.pickupTime}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-emerald-600 hover:text-emerald-700 font-bold text-xs underline"
            >
              Modify Booking
            </button>
          </div>

          {/* LOCAL HOURLY DURATION TOGGLE (4 hrs | 40 km, 8 hrs | 80 km, 12 hrs | 120 km) */}
          {searchData.tab === "LOCAL" && (
            <div className="flex justify-center">
              <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-xs sm:text-sm font-bold bg-white shadow-2xs">
                {[
                  { id: "4hr_40km", label: "4 hrs | 40 km" },
                  { id: "8hr_80km", label: "8 hrs | 80 km" },
                  { id: "12hr_120km", label: "12 hrs | 120 km" },
                ].map((pkg) => {
                  const isActive = searchData.localPackage === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSearchData((prev) => ({ ...prev, localPackage: pkg.id as any }))}
                      className={`px-5 py-2 transition-colors ${
                        isActive
                          ? "bg-emerald-600 text-white font-black"
                          : "text-slate-700 hover:bg-slate-50 border-r last:border-r-0 border-slate-200"
                      }`}
                    >
                      {pkg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Green Feature Assurance Bar */}
          <div className="bg-emerald-600 text-white rounded-xl py-3 px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-semibold items-center shadow-xs">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <IndianRupee className="w-5 h-5 bg-white text-emerald-600 rounded-full p-0.5" />
              <span>Book Now at Zero Cost</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <ShieldCheck className="w-5 h-5" />
              <span>Free Cancellations Upto 1 Hour</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-end">
              <Headphones className="w-5 h-5" />
              <span>24x7 Customer Support</span>
            </div>
          </div>

          {/* Car Listing Cards */}
          <div className="space-y-4">
            {availableCabs.map((cab) => {
              const currentFuel = selectedFuel[cab.id] || cab.fuelOptions[0] || "Diesel";
              const hasLuggage = luggageCarrierSelected[cab.id] || false;
              const finalPrice = cab.discountedPrice + (hasLuggage ? 149 : 0);

              return (
                <div
                  key={cab.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Left: Car Image */}
                    <div className="md:col-span-3 flex justify-center items-center">
                      <img
                        src={cab.image}
                        alt={cab.name}
                        className="w-40 h-28 object-cover rounded-xl shadow-xs"
                      />
                    </div>

                    {/* Middle: Car Specs, Amenities & Fuel Selection */}
                    <div className="md:col-span-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {cab.name}
                        </h3>
                        <span className="bg-slate-900 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          {cab.rating} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 italic">
                        {cab.categoryName}
                      </p>

                      <div className="space-y-1 pt-1 text-xs text-slate-700 font-medium">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Driver allowance included</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Luggage className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            <strong>{cab.includedKms} kms</strong> included | Post limit:{" "}
                            <strong>₹{cab.postLimitRate}/km</strong>
                          </span>
                        </div>
                      </div>

                      {/* Select Fuel Type */}
                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-600 mb-1">
                          Select Fuel Type:
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
                          {cab.fuelOptions.map((f) => (
                            <label key={f} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name={`fuel_${cab.id}`}
                                value={f}
                                checked={currentFuel === f}
                                onChange={() =>
                                  setSelectedFuel((prev) => ({ ...prev, [cab.id]: f }))
                                }
                                className="text-[#f97316] focus:ring-[#f97316]"
                              />
                              <span>{f}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Pricing & CTA Button */}
                    <div className="md:col-span-4 flex flex-col items-end justify-center space-y-2 text-right border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                          {cab.discountPercent}% OFF
                        </span>
                        <span className="text-slate-400 line-through text-xs font-semibold">
                          ₹{cab.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                        ₹{finalPrice.toLocaleString()}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        + ₹{cab.chargesAndTaxes} Charges and Taxes
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectCar(cab, searchData, currentFuel, hasLuggage)}
                        className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black px-6 py-2.5 rounded-lg text-sm uppercase tracking-wider shadow-md transition-all hover:scale-105 mt-2"
                      >
                        SELECT CAR
                      </button>
                    </div>
                  </div>

                  {/* Cab with Luggage Carrier Add-on Strip */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between bg-emerald-50/70 p-2.5 rounded-xl text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                      <input
                        type="checkbox"
                        checked={hasLuggage}
                        onChange={(e) =>
                          setLuggageCarrierSelected((prev) => ({
                            ...prev,
                            [cab.id]: e.target.checked,
                          }))
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-600"
                      />
                      <span>🚙 Cab with Luggage Carrier @ ₹149</span>
                    </label>
                    <span className="text-[11px] text-emerald-700 font-bold">Extra Roof Carrier</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
