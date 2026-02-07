import { Lab } from "@/types/lab";

export const labs: Lab[] = [
  {
    id: "daylight",
    title: "Daylight",
    description: "Warm-tone hardware product page with physical shadow system",
    tags: ["product", "light-theme", "editorial", "scroll-animation"],
    date: "2026-02",
    reference: "https://daylightcomputer.com",
    status: "active",
  },
  {
    id: "typography-001",
    title: "Typography 001",
    description: "Font weight, tracking, and hierarchy exploration",
    tags: ["typography", "motion", "minimal"],
    date: "2025-02",
    status: "active",
  },
  {
    id: "jerry-plants",
    title: "Jerry Plants",
    description: "Premium plant shop landing page",
    tags: ["landing", "e-commerce", "animation"],
    date: "2024-12",
    status: "archived",
  },
  {
    id: "commune",
    title: "Commune",
    description: "Private space rental & gathering service",
    tags: ["service", "booking", "minimal"],
    date: "2024-12",
    status: "archived",
  },
  {
    id: "wayfare",
    title: "Wayfare",
    description: "Travel itinerary consulting with full-page scroll-snap",
    tags: ["scroll-snap", "travel", "full-page"],
    date: "2025-01",
    status: "archived",
  },
  {
    id: "k-trading-ai",
    title: "DBS LABS",
    description: "AI-powered automated trading solution",
    tags: ["fintech", "ai", "dashboard"],
    date: "2025-01",
    status: "archived",
  },
  {
    id: "atelier",
    title: "Atelier",
    description: "Creative studio portfolio",
    tags: ["portfolio", "creative", "typography"],
    date: "2025-01",
    status: "archived",
  },
  {
    id: "trading-indicators",
    title: "Trading Indicators",
    description: "Technical analysis indicator visualizations",
    tags: ["fintech", "data-viz", "chart"],
    date: "2025-01",
    status: "archived",
  },
];

export function getLabById(id: string): Lab | undefined {
  return labs.find((lab) => lab.id === id);
}

export function getActiveLabs(): Lab[] {
  return labs.filter((lab) => lab.status !== "archived");
}

export function getAllLabs(): Lab[] {
  return labs;
}
