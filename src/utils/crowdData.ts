export type CrowdCategory = "transit" | "shopping" | "office" | "park" | "leisure";

export interface Place {
  id: string;
  name: string;
  address: string;
  category: CrowdCategory;
  isPinned: boolean;
  crowdCurve: number[]; // 18 numbers representing crowd level 0-100 at 6 AM - 11 PM
  lastUpdated: string;
}

// Hours of operation: 6 AM (index 0) to 11 PM (index 17)
export const OPERATING_HOURS = [
  "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", 
  "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", 
  "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
];

// Map 24h format to hour index in crowdCurve (6 AM -> 0, 23 -> 17)
export function getHourIndex(hour24: number): number {
  if (hour24 < 6) return 0; // clamp to 6 AM
  if (hour24 > 23) return 17; // clamp to 11 PM
  return hour24 - 6;
}

export function getHourLabel(index: number): string {
  return OPERATING_HOURS[index] || "6 AM";
}

// Helper to determine text label and color for a crowd percentage
export function getCrowdStatus(percentage: number): {
  label: "Low" | "Medium" | "High" | "Very High";
  color: string;
  badgeBg: string;
  badgeText: string;
} {
  if (percentage <= 35) {
    return {
      label: "Low",
      color: "#10B981", // Success Green
      badgeBg: "rgba(16, 185, 129, 0.1)",
      badgeText: "text-emerald-400"
    };
  } else if (percentage <= 65) {
    return {
      label: "Medium",
      color: "#F59E0B", // Warning Yellow
      badgeBg: "rgba(245, 158, 11, 0.1)",
      badgeText: "text-amber-400"
    };
  } else if (percentage <= 85) {
    return {
      label: "High",
      color: "#FF7A00", // Brand Orange
      badgeBg: "rgba(255, 122, 0, 0.1)",
      badgeText: "text-orange-400"
    };
  } else {
    return {
      label: "Very High",
      color: "#EF4444", // Danger Red
      badgeBg: "rgba(239, 68, 68, 0.1)",
      badgeText: "text-red-400"
    };
  }
}

// Estimated waiting time calculation based on crowd level
export function getEstimatedWaitingTime(percentage: number, category: CrowdCategory): number {
  let multiplier = 1;
  switch (category) {
    case "transit": multiplier = 0.3; break; // transit moves faster
    case "office": multiplier = 0.2; break; // office entry gates
    case "shopping": multiplier = 0.6; break; // billing queues
    case "leisure": multiplier = 0.8; break; // ticket counters
    case "park": multiplier = 0.1; break; // free access
  }
  
  const baseMins = Math.round(percentage * multiplier);
  return Math.max(1, baseMins); // at least 1 minute
}

// Custom recommendation message based on prediction curve
export function getBestTimeRecommendation(place: Place, selectedHourIndex: number): {
  bestHour: string;
  recommendationText: string;
} {
  const curve = place.crowdCurve;
  
  // Find a 3-hour window around the selected hour
  const start = Math.max(0, selectedHourIndex - 3);
  const end = Math.min(17, selectedHourIndex + 3);
  
  let minCrowd = 101;
  let minIndex = selectedHourIndex;
  
  for (let i = start; i <= end; i++) {
    if (curve[i] < minCrowd) {
      minCrowd = curve[i];
      minIndex = i;
    }
  }
  
  const bestHour = getHourLabel(minIndex);
  const currentCrowd = curve[selectedHourIndex];
  const diff = currentCrowd - minCrowd;
  
  let recommendationText = "";
  if (diff > 15) {
    recommendationText = `Consider shifting to ${bestHour} to save up to ${diff}% on crowd density.`;
  } else if (currentCrowd > 75) {
    recommendationText = `Highly crowded time. Recommended to visit early morning (6 AM - 8 AM) or late evening.`;
  } else {
    recommendationText = `Great choice! The selected time is optimal for this location.`;
  }
  
  return { bestHour, recommendationText };
}

// Initialize the place datasets
export const INITIAL_PLACES: Place[] = [
  {
    id: "majestic-bus-stand",
    name: "Majestic Bus Stand",
    address: "KSR Bengaluru, Kempegowda",
    category: "transit",
    isPinned: true,
    lastUpdated: "Synced with IST",
    crowdCurve: [60, 65, 85, 95, 80, 70, 68, 70, 72, 75, 78, 85, 92, 90, 80, 70, 55, 40]
  },
  {
    id: "kempegowda-metro-station",
    name: "Kempegowda Metro Station",
    address: "Majestic Interchange, W-Line",
    category: "transit",
    isPinned: true,
    lastUpdated: "Synced with IST",
    crowdCurve: [55, 68, 92, 98, 85, 72, 65, 68, 70, 74, 76, 88, 96, 90, 75, 65, 50, 30]
  },
  {
    id: "mg-road",
    name: "MG Road",
    address: "Central Business District",
    category: "shopping",
    isPinned: true,
    lastUpdated: "Synced with IST",
    crowdCurve: [20, 25, 30, 45, 55, 65, 70, 72, 75, 78, 82, 88, 92, 95, 90, 80, 60, 40]
  },
  {
    id: "brigade-road",
    name: "Brigade Road",
    address: "Shanthala Nagar, Ashok Nagar",
    category: "shopping",
    isPinned: true,
    lastUpdated: "Synced with IST",
    crowdCurve: [15, 20, 28, 40, 50, 62, 72, 75, 78, 80, 85, 90, 95, 98, 94, 85, 65, 45]
  },
  {
    id: "commercial-street",
    name: "Commercial Street",
    address: "Tasker Town, Shivaji Nagar",
    category: "shopping",
    isPinned: true,
    lastUpdated: "Synced with IST",
    crowdCurve: [10, 15, 25, 45, 60, 75, 82, 85, 80, 83, 87, 92, 96, 94, 82, 60, 40, 20]
  },
  {
    id: "indiranagar",
    name: "Indiranagar",
    address: "100 Feet Road, Metro Zone",
    category: "shopping", // Shopping & dining
    isPinned: true,
    lastUpdated: "Synced with IST",
    crowdCurve: [15, 22, 28, 38, 45, 58, 68, 70, 72, 75, 78, 84, 92, 96, 95, 90, 75, 55]
  },
  {
    id: "cubbon-park",
    name: "Cubbon Park",
    address: "Kasturba Road, Sampangi Rama Nagar",
    category: "park",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [75, 85, 80, 50, 30, 20, 18, 20, 22, 25, 28, 40, 55, 60, 45, 30, 15, 5]
  },
  {
    id: "lalbagh-botanical-garden",
    name: "Lalbagh Botanical Garden",
    address: "Mavalli, Jayanagar Zone",
    category: "park",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [70, 80, 75, 45, 35, 25, 20, 22, 24, 26, 30, 42, 52, 58, 40, 25, 10, 5]
  },
  {
    id: "ub-city",
    name: "UB City",
    address: "Vittal Mallya Road",
    category: "leisure",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [10, 15, 25, 40, 52, 65, 72, 70, 68, 72, 76, 82, 88, 92, 94, 85, 70, 40]
  },
  {
    id: "bengaluru-palace",
    name: "Bengaluru Palace",
    address: "Vasanth Nagar",
    category: "leisure",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [5, 10, 25, 45, 65, 75, 78, 76, 74, 75, 70, 58, 45, 30, 15, 10, 5, 2]
  },
  {
    id: "forum-mall",
    name: "Forum Mall",
    address: "Hosur Road, Koramangala",
    category: "shopping",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [15, 22, 30, 45, 58, 70, 75, 72, 74, 78, 83, 88, 93, 95, 88, 72, 55, 30]
  },
  {
    id: "phoenix-marketcity",
    name: "Phoenix Marketcity",
    address: "Whitefield Main Road, Mahadevapura",
    category: "shopping",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [10, 18, 25, 40, 55, 72, 80, 78, 76, 80, 84, 90, 94, 97, 92, 80, 60, 30]
  },
  {
    id: "orion-mall",
    name: "Orion Mall",
    address: "Dr. Rajkumar Road, Malleshwaram",
    category: "shopping",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [12, 20, 28, 42, 56, 70, 78, 75, 73, 76, 82, 88, 92, 95, 90, 78, 58, 32]
  },
  {
    id: "nexus-shantiniketan",
    name: "Nexus Shantiniketan",
    address: "ITPL Main Road, Whitefield",
    category: "shopping",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [10, 15, 22, 35, 48, 62, 70, 68, 67, 70, 74, 82, 88, 90, 85, 70, 50, 25]
  },
  {
    id: "church-street",
    name: "Church Street",
    address: "Off MG Road, Central Zone",
    category: "leisure",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [25, 30, 35, 42, 50, 65, 72, 76, 78, 82, 86, 92, 97, 99, 98, 95, 88, 70]
  },
  {
    id: "koramangala",
    name: "Koramangala",
    address: "Start-up Hub & Food Zone",
    category: "shopping",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [20, 25, 32, 45, 55, 68, 75, 74, 76, 79, 83, 89, 94, 96, 92, 84, 70, 48]
  },
  {
    id: "whitefield",
    name: "Whitefield",
    address: "Outer Suburban IT Corridor",
    category: "office",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [40, 58, 85, 92, 78, 62, 55, 52, 55, 58, 62, 78, 88, 82, 60, 48, 35, 20]
  },
  {
    id: "electronic-city",
    name: "Electronic City",
    address: "IT Hub, Phase I & II",
    category: "office",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [42, 60, 88, 94, 80, 60, 52, 50, 53, 56, 60, 80, 90, 84, 58, 44, 30, 18]
  },
  {
    id: "jayanagar",
    name: "Jayanagar",
    address: "4th Block Shopping Complex",
    category: "shopping",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [15, 22, 35, 50, 65, 78, 82, 80, 78, 80, 84, 90, 93, 91, 78, 58, 40, 20]
  },
  {
    id: "banashankari",
    name: "Banashankari",
    address: "South Bengaluru Interchange",
    category: "transit",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [45, 58, 82, 88, 75, 62, 58, 60, 62, 65, 68, 80, 86, 82, 68, 55, 42, 28]
  },
  {
    id: "basavanagudi",
    name: "Basavanagudi",
    address: "DVG Road, Heritage Zone",
    category: "shopping",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [25, 32, 45, 58, 68, 75, 78, 76, 74, 76, 79, 85, 90, 88, 75, 55, 38, 22]
  },
  {
    id: "iskcon-temple",
    name: "ISKCON Temple",
    address: "Hare Krishna Hill, Rajajinagar",
    category: "leisure",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [30, 45, 55, 62, 68, 72, 70, 68, 65, 68, 72, 80, 88, 85, 70, 50, 30, 15]
  },
  {
    id: "kr-market",
    name: "KR Market",
    address: "Krishna Rajendra Flower Market",
    category: "shopping", // Wholesale market
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [85, 98, 95, 88, 75, 62, 55, 50, 48, 52, 58, 68, 78, 72, 58, 40, 25, 10]
  },
  {
    id: "vidhana-soudha",
    name: "Vidhana Soudha",
    address: "Dr. Ambedkar Veedhi",
    category: "office", // Govt offices, tourist spot
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [20, 35, 60, 75, 80, 68, 60, 58, 62, 65, 55, 48, 38, 25, 15, 10, 5, 2]
  },
  {
    id: "manyata-tech-park",
    name: "Manyata Tech Park",
    address: "Outer Ring Road, Hebbal",
    category: "office",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [38, 56, 86, 94, 82, 64, 52, 48, 50, 55, 60, 76, 88, 84, 55, 40, 28, 15]
  },
  {
    id: "eco-world",
    name: "Eco World",
    address: "Bellandur, Outer Ring Road",
    category: "office",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [40, 58, 88, 96, 85, 65, 55, 50, 52, 56, 62, 78, 92, 85, 58, 42, 30, 15]
  },
  {
    id: "kempegowda-international-airport",
    name: "Kempegowda International Airport",
    address: "Devanahalli Zone",
    category: "transit",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [70, 75, 82, 80, 78, 75, 73, 76, 75, 78, 80, 82, 85, 88, 84, 80, 78, 75]
  },
  {
    id: "bannerghatta-zoo",
    name: "Bannerghatta Zoo",
    address: "National Park Road, Anekal",
    category: "park", // Zoo & safari
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [5, 12, 32, 58, 78, 85, 88, 84, 80, 75, 65, 48, 30, 15, 8, 4, 1, 0]
  },
  {
    id: "yesvantpur-railway-station",
    name: "Yesvantpur Railway Station",
    address: "Tumkur Road, Yeswanthpur",
    category: "transit",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [50, 58, 72, 78, 70, 65, 62, 65, 68, 70, 74, 80, 84, 82, 72, 64, 55, 45]
  },
  {
    id: "bangalore-cantonment-railway-station",
    name: "Bangalore Cantonment Railway Station",
    address: "Vasanth Nagar Zone",
    category: "transit",
    isPinned: false,
    lastUpdated: "Synced with IST",
    crowdCurve: [40, 48, 62, 68, 60, 55, 52, 56, 58, 60, 62, 68, 72, 70, 62, 55, 48, 38]
  }
];
