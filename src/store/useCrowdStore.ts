import { create } from "zustand";
import { Place, INITIAL_PLACES, getHourIndex } from "../utils/crowdData";

export type ViewType = "dashboard" | "explore" | "add-report" | "details";

export interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface CrowdStoreState {
  places: Place[];
  activeView: ViewType;
  selectedPlaceId: string | null;
  searchQuery: string;
  lastReportTime: number | null; // Timestamp of the last report
  activeToast: ToastState | null;
  reportingPlaceId: string | null; // Selected place for direct report routing
  
  // Actions
  setView: (view: ViewType, selectedPlaceId?: string | null) => void;
  setSearchQuery: (query: string) => void;
  togglePin: (id: string) => void;
  submitReport: (
    placeId: string, 
    level: "Low" | "Medium" | "High" | "Very High"
  ) => { success: boolean; remainingMinutes?: number; truthScore?: number };
  showToast: (message: string, type: "success" | "error" | "info") => void;
  clearToast: () => void;
  setReportingPlaceId: (placeId: string | null) => void;
}

const LOCAL_STORAGE_PLACES_KEY = "crowdliner_places_v1";
const LOCAL_STORAGE_COOLDOWN_KEY = "crowdliner_cooldown_v1";

// Helper to load places from localStorage or fall back to defaults
function loadPlaces(): Place[] {
  if (typeof window === "undefined") return INITIAL_PLACES;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PLACES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PLACES;
  } catch (error) {
    console.error("Failed to load places from localStorage", error);
    return INITIAL_PLACES;
  }
}

// Helper to save places to localStorage
function savePlaces(places: Place[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_PLACES_KEY, JSON.stringify(places));
  } catch (error) {
    console.error("Failed to save places to localStorage", error);
  }
}

// Helper to load cooldown from localStorage
function loadCooldown(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_COOLDOWN_KEY);
    return saved ? parseInt(saved, 10) : null;
  } catch {
    return null;
  }
}

// Helper to save cooldown to localStorage
function saveCooldown(timestamp: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_COOLDOWN_KEY, timestamp.toString());
  } catch {}
}

export const useCrowdStore = create<CrowdStoreState>((set, get) => ({
  places: loadPlaces(),
  activeView: "dashboard",
  selectedPlaceId: null,
  searchQuery: "",
  lastReportTime: loadCooldown(),
  activeToast: null,
  reportingPlaceId: null,

  setView: (view, selectedPlaceId = null) => {
    set({ activeView: view, selectedPlaceId });
    // Whenever switching views, reset search query for convenience
    if (view !== "explore") {
      set({ searchQuery: "" });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  togglePin: (id) => {
    const updatedPlaces = get().places.map((place) => {
      if (place.id === id) {
        const isPinned = !place.isPinned;
        get().showToast(
          isPinned ? `Pinned "${place.name}" to Dashboard` : `Unpinned "${place.name}"`,
          "success"
        );
        return { ...place, isPinned };
      }
      return place;
    });

    set({ places: updatedPlaces });
    savePlaces(updatedPlaces);
  },

  submitReport: (placeId, level) => {
    const now = Date.now();
    const lastTime = get().lastReportTime;
    const cooldownPeriod = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (lastTime && now - lastTime < cooldownPeriod) {
      const remainingMs = cooldownPeriod - (now - lastTime);
      const remainingMinutes = Math.ceil(remainingMs / 60 / 1000);
      get().showToast(
        `Please wait ${remainingMinutes} minutes before submitting another report.`,
        "error"
      );
      return { success: false, remainingMinutes };
    }

    // Map selected level to percentage value
    let submittedValue = 25;
    if (level === "Medium") submittedValue = 50;
    else if (level === "High") submittedValue = 75;
    else if (level === "Very High") submittedValue = 100;

    // Get current local time in Bengaluru (IST)
    const date = new Date();
    const curHour = date.getHours();
    const hourIdx = getHourIndex(curHour);

    let truthScore = 100;
    const updatedPlaces = get().places.map((place) => {
      if (place.id === placeId) {
        const historicalPrediction = place.crowdCurve[hourIdx];
        
        // Calculate Truth Score
        const diff = Math.abs(submittedValue - historicalPrediction);
        truthScore = Math.max(0, 100 - diff);

        // Blending user report (30% weight) and historical prediction (70% weight)
        // Also smooth out adjacent hours by blending with smaller weights (15% user report weight)
        const newCurve = [...place.crowdCurve];
        
        // Current hour blend
        newCurve[hourIdx] = Math.round(historicalPrediction * 0.7 + submittedValue * 0.3);
        
        // Previous hour blend (smoothing)
        if (hourIdx > 0) {
          newCurve[hourIdx - 1] = Math.round(place.crowdCurve[hourIdx - 1] * 0.85 + submittedValue * 0.15);
        }
        
        // Next hour blend (smoothing)
        if (hourIdx < 17) {
          newCurve[hourIdx + 1] = Math.round(place.crowdCurve[hourIdx + 1] * 0.85 + submittedValue * 0.15);
        }

        const formattedTime = date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });

        return {
          ...place,
          crowdCurve: newCurve,
          lastUpdated: `Reported at ${formattedTime}`
        };
      }
      return place;
    });

    set({
      places: updatedPlaces,
      lastReportTime: now,
      activeView: "details", // Navigate to place details to show updated curves
      selectedPlaceId: placeId
    });

    savePlaces(updatedPlaces);
    saveCooldown(now);

    get().showToast(
      `Report submitted! Truth Score: ${truthScore}%`,
      truthScore >= 70 ? "success" : "info"
    );

    return { success: true, truthScore };
  },

  showToast: (message, type) => {
    set({ activeToast: { message, type } });
  },

  clearToast: () => {
    set({ activeToast: null });
  },

  setReportingPlaceId: (placeId) => {
    set({ reportingPlaceId: placeId, activeView: "add-report" });
  }
}));
