import type { Metadata } from "next";
import { LandingPage } from "@/features/marketing/LandingPage";

export const metadata: Metadata = {
  title: "Tabi — תכנון וליווי טיול",
  description:
    "Tabi מרכזת את המסלול, ההזמנות, הלינה, התחבורה והמסמכים — לפני שיוצאים וגם בזמן הטיול.",
};

export default function HomePage() {
  return <LandingPage />;
}
