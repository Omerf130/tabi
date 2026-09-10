import type { Metadata } from "next";
import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";

export const metadata: Metadata = {
  title: "Tabi — Your journey. Perfectly planned.",
  description:
    "Plan and travel with everything in one place — itinerary, stays, transport, and documents.",
};

export default function HomePage() {
  return <WelcomeScreen />;
}
