import { useState, useEffect } from "react";

export interface FleetTariff {
  id: string;
  name: string;
  category: string;
  seats: number;
  rating: number;
  image: string;
  includedKms: number;
  postLimitRate: number;
  basePriceOneWay: number;
  basePriceRoundTrip: number;
  basePriceLocal4hr: number;
  basePriceLocal8hr: number;
  basePriceLocal12hr: number;
  basePriceAirport: number;
}

export interface FleetPricingConfig {
  vehicles: Record<string, FleetTariff>;
  roofLuggageRate: number;
  updatedAt?: string;
}

export const DEFAULT_FLEET_OPTIONS: FleetTariff[] = [
  {
    id: "hatchback",
    name: "Hatchback",
    category: "Maruti Swift, Tata Altroz, Hyundai i20 · 4 Seater AC Cab",
    seats: 4,
    rating: 4.8,
    image: "/images/fleet/car-hatchback.jpg",
    includedKms: 145,
    postLimitRate: 12,
    basePriceOneWay: 1783,
    basePriceRoundTrip: 3566,
    basePriceLocal4hr: 1341,
    basePriceLocal8hr: 2200,
    basePriceLocal12hr: 2900,
    basePriceAirport: 1199,
  },
  {
    id: "sedan",
    name: "Sedan",
    category: "Maruti Dzire, Hyundai Aura, Honda Amaze · 4 Seater Sedan",
    seats: 4,
    rating: 4.8,
    image: "/images/fleet/car-sedan.jpg",
    includedKms: 145,
    postLimitRate: 14,
    basePriceOneWay: 1950,
    basePriceRoundTrip: 3900,
    basePriceLocal4hr: 1369,
    basePriceLocal8hr: 2400,
    basePriceLocal12hr: 3200,
    basePriceAirport: 1399,
  },
  {
    id: "premium-sedan",
    name: "Premium Sedan",
    category: "Honda City, Hyundai Verna, Skoda Slavia · Luxury 4 Seater",
    seats: 4,
    rating: 4.9,
    image: "/images/fleet/car-premium-sedan.jpg",
    includedKms: 145,
    postLimitRate: 16,
    basePriceOneWay: 2350,
    basePriceRoundTrip: 4700,
    basePriceLocal4hr: 1650,
    basePriceLocal8hr: 2900,
    basePriceLocal12hr: 3800,
    basePriceAirport: 1650,
  },
  {
    id: "suv",
    name: "MUV / SUV",
    category: "Maruti Ertiga, Toyota Rumion, Kia Carens · 6 Seater AC SUV",
    seats: 6,
    rating: 4.9,
    image: "/images/fleet/car-suv.jpg",
    includedKms: 145,
    postLimitRate: 17,
    basePriceOneWay: 2650,
    basePriceRoundTrip: 5300,
    basePriceLocal4hr: 1850,
    basePriceLocal8hr: 3200,
    basePriceLocal12hr: 4100,
    basePriceAirport: 1850,
  },
  {
    id: "innova",
    name: "Toyota Innova",
    category: "Toyota Innova 7 Seater · Dependable Highway Comfort",
    seats: 7,
    rating: 4.8,
    image: "/images/fleet/car-innova.jpg",
    includedKms: 145,
    postLimitRate: 19,
    basePriceOneWay: 3100,
    basePriceRoundTrip: 6200,
    basePriceLocal4hr: 2150,
    basePriceLocal8hr: 3700,
    basePriceLocal12hr: 4700,
    basePriceAirport: 2150,
  },
  {
    id: "innova-crysta",
    name: "Toyota Innova Crysta",
    category: "7 Seater Luxury Premium AC Cab · VIP Captain Seats",
    seats: 7,
    rating: 4.9,
    image: "/images/fleet/car-crysta.jpg",
    includedKms: 145,
    postLimitRate: 21,
    basePriceOneWay: 3400,
    basePriceRoundTrip: 6800,
    basePriceLocal4hr: 2400,
    basePriceLocal8hr: 4100,
    basePriceLocal12hr: 5200,
    basePriceAirport: 2400,
  },
  {
    id: "tempo-traveller",
    name: "Tempo Traveller",
    category: "9 / 12 / 17 Seater Tempo Traveller · AC Group Travel",
    seats: 12,
    rating: 4.8,
    image: "/images/fleet/car-tempo.jpg",
    includedKms: 145,
    postLimitRate: 28,
    basePriceOneWay: 5200,
    basePriceRoundTrip: 10400,
    basePriceLocal4hr: 3800,
    basePriceLocal8hr: 6500,
    basePriceLocal12hr: 8200,
    basePriceAirport: 3800,
  },
  {
    id: "mini-bus",
    name: "Mini Bus",
    category: "17 / 20 / 25 / 30 Seater Mini Bus · Recliner Seats",
    seats: 27,
    rating: 4.8,
    image: "/images/fleet/car-minibus.jpg",
    includedKms: 145,
    postLimitRate: 45,
    basePriceOneWay: 8500,
    basePriceRoundTrip: 17000,
    basePriceLocal4hr: 6200,
    basePriceLocal8hr: 10500,
    basePriceLocal12hr: 13500,
    basePriceAirport: 6200,
  },
];

export const STORAGE_KEY_FLEET_TARIFFS = "FT_CAR_FLEET_TARIFFS";
export const FLEET_TARIFFS_UPDATED_EVENT = "ft-car-fares-updated";

/**
 * Get current saved fleet tariffs merged with defaults
 */
export function getSavedFleetPricing(): FleetPricingConfig {
  const defaultVehiclesMap: Record<string, FleetTariff> = {};
  DEFAULT_FLEET_OPTIONS.forEach((v) => {
    defaultVehiclesMap[v.id] = { ...v };
  });

  if (typeof window === "undefined") {
    return {
      vehicles: defaultVehiclesMap,
      roofLuggageRate: 149,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_FLEET_TARIFFS);
    if (!raw) {
      return {
        vehicles: defaultVehiclesMap,
        roofLuggageRate: 149,
      };
    }

    const parsed: Partial<FleetPricingConfig> = JSON.parse(raw);
    const mergedVehicles: Record<string, FleetTariff> = { ...defaultVehiclesMap };

    if (parsed.vehicles) {
      Object.keys(parsed.vehicles).forEach((id) => {
        if (mergedVehicles[id]) {
          mergedVehicles[id] = {
            ...mergedVehicles[id],
            ...parsed.vehicles![id],
          };
        } else {
          mergedVehicles[id] = parsed.vehicles![id];
        }
      });
    }

    return {
      vehicles: mergedVehicles,
      roofLuggageRate: Number(parsed.roofLuggageRate ?? 149),
      updatedAt: parsed.updatedAt,
    };
  } catch (err) {
    console.error("Error reading saved fleet tariffs:", err);
    return {
      vehicles: defaultVehiclesMap,
      roofLuggageRate: 149,
    };
  }
}

/**
 * Save updated fleet pricing config and broadcast to all listeners
 */
export function saveFleetPricing(config: FleetPricingConfig): void {
  if (typeof window === "undefined") return;

  const dataToSave: FleetPricingConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY_FLEET_TARIFFS, JSON.stringify(dataToSave));

  // Dispatch custom event for real-time in-tab updates
  window.dispatchEvent(
    new CustomEvent(FLEET_TARIFFS_UPDATED_EVENT, { detail: dataToSave })
  );

  // Dispatch standard storage event for cross-tab updates
  window.dispatchEvent(new Event("storage"));
}

/**
 * Reset fleet pricing to original system defaults
 */
export function resetFleetPricingToDefaults(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_FLEET_TARIFFS);

  const defaultVehiclesMap: Record<string, FleetTariff> = {};
  DEFAULT_FLEET_OPTIONS.forEach((v) => {
    defaultVehiclesMap[v.id] = { ...v };
  });

  const defaultConfig: FleetPricingConfig = {
    vehicles: defaultVehiclesMap,
    roofLuggageRate: 149,
    updatedAt: new Date().toISOString(),
  };

  window.dispatchEvent(
    new CustomEvent(FLEET_TARIFFS_UPDATED_EVENT, { detail: defaultConfig })
  );
  window.dispatchEvent(new Event("storage"));
}

/**
 * Get fleet options as an ordered list for rendering
 */
export function getFleetOptionsList(): FleetTariff[] {
  const pricing = getSavedFleetPricing();
  return DEFAULT_FLEET_OPTIONS.map((def) => {
    return pricing.vehicles[def.id] || def;
  });
}

/**
 * React hook to subscribe to live fleet pricing updates
 */
export function useFleetTariffs() {
  const [fleetList, setFleetList] = useState<FleetTariff[]>(() => getFleetOptionsList());
  const [roofLuggageRate, setRoofLuggageRate] = useState<number>(() => {
    return getSavedFleetPricing().roofLuggageRate;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const current = getSavedFleetPricing();
      setFleetList(
        DEFAULT_FLEET_OPTIONS.map((def) => current.vehicles[def.id] || def)
      );
      setRoofLuggageRate(current.roofLuggageRate);
    };

    window.addEventListener(FLEET_TARIFFS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(FLEET_TARIFFS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    fleetList,
    roofLuggageRate,
  };
}

export const KM_OPTIONS_LIST = [
  { value: 0, label: "0 Km (Local Start / Zero Distance)" },
  { value: 10, label: "10 Km (City Short Trip)" },
  { value: 20, label: "20 Km" },
  { value: 30, label: "30 Km" },
  { value: 40, label: "40 Km (City Limit)" },
  { value: 50, label: "50 Km" },
  { value: 60, label: "60 Km" },
  { value: 75, label: "75 Km" },
  { value: 100, label: "100 Km" },
  { value: 120, label: "120 Km" },
  { value: 145, label: "145 Km (★ One-Way Standard Included)" },
  { value: 150, label: "150 Km (Bangalore to Mysore)" },
  { value: 180, label: "180 Km" },
  { value: 200, label: "200 Km" },
  { value: 250, label: "250 Km (Bangalore to Hassan/Coorg)" },
  { value: 290, label: "290 Km (★ Round-Trip Standard Included)" },
  { value: 300, label: "300 Km (Bangalore ⇄ Mysore RT)" },
  { value: 350, label: "350 Km" },
  { value: 400, label: "400 Km" },
  { value: 450, label: "450 Km" },
  { value: 500, label: "500 Km" },
  { value: 600, label: "600 Km (Bangalore ⇄ Ooty RT)" },
  { value: 700, label: "700 Km" },
  { value: 800, label: "800 Km (Bangalore ⇄ Goa RT)" },
  { value: 1000, label: "1000 Km (Extended Outstation)" },
];

export const PER_KM_RATES_LIST = [
  { value: 10, label: "₹10 / km (Economy Offer Rate)" },
  { value: 11, label: "₹11 / km" },
  { value: 12, label: "₹12 / km (Hatchback Swift Standard)" },
  { value: 13, label: "₹13 / km" },
  { value: 14, label: "₹14 / km (Sedan Dzire Standard)" },
  { value: 15, label: "₹15 / km" },
  { value: 16, label: "₹16 / km (Sedan / Dzire Custom Rate)" },
  { value: 17, label: "₹17 / km (SUV / Ertiga Standard)" },
  { value: 18, label: "₹18 / km" },
  { value: 19, label: "₹19 / km (Toyota Innova Standard)" },
  { value: 20, label: "₹20 / km" },
  { value: 21, label: "₹21 / km (Innova Crysta VIP Standard)" },
  { value: 22, label: "₹22 / km" },
  { value: 24, label: "₹24 / km" },
  { value: 26, label: "₹26 / km (Tempo Traveller 12 Seater)" },
  { value: 28, label: "₹28 / km (Tempo Traveller 17 Seater)" },
  { value: 30, label: "₹30 / km" },
  { value: 35, label: "₹35 / km (Mini Bus Standard)" },
  { value: 40, label: "₹40 / km" },
  { value: 45, label: "₹45 / km (Mini Bus Coach)" },
  { value: 50, label: "₹50 / km (Luxury Volvo Coach)" },
];

export const FIXED_TOTAL_FARES_LIST = [
  { value: 1000, label: "₹1,000 (Local / City Transfer)" },
  { value: 1200, label: "₹1,200" },
  { value: 1500, label: "₹1,500 (Airport Drop / Pickup)" },
  { value: 1800, label: "₹1,800" },
  { value: 2000, label: "₹2,000 (Short Outstation)" },
  { value: 2500, label: "₹2,500" },
  { value: 3000, label: "₹3,000 (Bangalore to Mysore One-Way)" },
  { value: 3500, label: "₹3,500" },
  { value: 4000, label: "₹4,000" },
  { value: 4500, label: "₹4,500" },
  { value: 5000, label: "₹5,000 (Round Trip Special)" },
  { value: 6000, label: "₹6,000" },
  { value: 7500, label: "₹7,500" },
  { value: 10000, label: "₹10,000 (Multi-day Group Tour)" },
  { value: 12000, label: "₹12,000" },
  { value: 15000, label: "₹15,000 (Group Tempo Package)" },
  { value: 18000, label: "₹18,000" },
  { value: 20000, label: "₹20,000 (Mini Bus Package)" },
];
