import { useState, useEffect } from "react";
import { packages as defaultPackages, TourPackage } from "@/data/packages";

export const STORAGE_KEY_TOUR_TARIFFS = "FT_TOUR_PACKAGE_TARIFFS";
export const TOUR_TARIFFS_UPDATED_EVENT = "ft-tour-fares-updated";

/**
 * Get map of package slug -> custom startingPrice from localStorage
 */
export function getSavedTourTariffs(): Record<string, number> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOUR_TARIFFS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (err) {
    console.error("Error reading saved tour tariffs:", err);
    return {};
  }
}

/**
 * Save updated tour package prices map and broadcast to all listeners
 */
export function saveTourTariffs(priceMap: Record<string, number>): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY_TOUR_TARIFFS, JSON.stringify(priceMap));

  // Dispatch custom event for real-time in-tab updates
  window.dispatchEvent(
    new CustomEvent(TOUR_TARIFFS_UPDATED_EVENT, { detail: priceMap })
  );

  // Dispatch standard storage event for cross-tab updates
  window.dispatchEvent(new Event("storage"));
}

/**
 * Reset tour package tariffs to system defaults
 */
export function resetTourTariffsToDefaults(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_TOUR_TARIFFS);

  window.dispatchEvent(
    new CustomEvent(TOUR_TARIFFS_UPDATED_EVENT, { detail: {} })
  );
  window.dispatchEvent(new Event("storage"));
}

/**
 * Return packages list with custom prices applied
 */
export function getTourPackagesWithLivePrices(): TourPackage[] {
  const overrides = getSavedTourTariffs();
  return defaultPackages.map((pkg) => {
    const customPrice = overrides[pkg.slug];
    if (typeof customPrice === "number" && !isNaN(customPrice) && customPrice > 0) {
      return {
        ...pkg,
        startingPrice: customPrice,
      };
    }
    return pkg;
  });
}

/**
 * React hook to subscribe to live tour package tariffs
 */
export function useTourTariffs() {
  const [packagesList, setPackagesList] = useState<TourPackage[]>(() =>
    getTourPackagesWithLivePrices()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setPackagesList(getTourPackagesWithLivePrices());
    };

    window.addEventListener(TOUR_TARIFFS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(TOUR_TARIFFS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    packagesList,
  };
}
