"use client";

import { useCrowdStore } from "@/store/useCrowdStore";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Explore from "@/components/Explore";
import PlaceDetails from "@/components/PlaceDetails";
import AddReport from "@/components/AddReport";
import Toast from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { activeView } = useCrowdStore();

  const viewVariants = {
    initial: { opacity: 0, y: 8, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as any } },
    exit: { opacity: 0, y: -8, scale: 0.995, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout containing Sidebar and Active View Content */}
      <div className="flex flex-1 relative items-stretch">
        {/* Permanent Left Sidebar */}
        <Sidebar />

        {/* Scrollable View Panel */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-73px)] pb-16 md:pb-0 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={viewVariants}
              className="h-full w-full"
            >
              {activeView === "dashboard" && <Dashboard />}
              {activeView === "explore" && <Explore />}
              {activeView === "details" && <PlaceDetails />}
              {activeView === "add-report" && <AddReport />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Notifications */}
      <Toast />
    </div>
  );
}
