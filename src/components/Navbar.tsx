"use client";

import { useEffect, useState, useCallback } from "react";
import { Compass, MapPin, X, Vote, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCrowdStore } from "@/store/useCrowdStore";

export default function Navbar() {
  const { setView, places, setReportingPlaceId } = useCrowdStore();
  const [timeStr, setTimeStr] = useState<string>("");

  // Notification state
  const [notifPlace, setNotifPlace] = useState<{ id: string; name: string } | null>(null);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setTimeStr(now.toLocaleTimeString("en-IN", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fake proximity notification — fires once after 5 seconds
  useEffect(() => {
    if (notifDismissed) return;

    const timer = setTimeout(() => {
      // Pick a random place to simulate proximity
      const randomIdx = Math.floor(Math.random() * places.length);
      const picked = places[randomIdx];
      setNotifPlace({ id: picked.id, name: picked.name });
      setNotifVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [places, notifDismissed]);

  // Auto-dismiss notification after 12 seconds
  useEffect(() => {
    if (!notifVisible) return;
    const autoDismiss = setTimeout(() => {
      setNotifVisible(false);
    }, 12000);
    return () => clearTimeout(autoDismiss);
  }, [notifVisible]);

  const handleVoteNow = useCallback(() => {
    if (!notifPlace) return;
    setNotifVisible(false);
    setNotifDismissed(true);
    setReportingPlaceId(notifPlace.id);
  }, [notifPlace, setReportingPlaceId]);

  const handleDismiss = useCallback(() => {
    setNotifVisible(false);
    setNotifDismissed(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full layer-1 border-b border-border-custom px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setView("dashboard")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:shadow-primary/40 group-hover:scale-105">
            <Compass className="w-4.5 h-4.5 text-black stroke-[2.5]" />
            {/* Subtle light glow behind icon on hover */}
            <div className="absolute inset-0 rounded-lg bg-primary blur-[6px] opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight text-base leading-none transition-colors duration-200 group-hover:text-primary">
              Crowd<span className="text-primary group-hover:text-white transition-colors duration-200">Liner</span>
            </span>
            <span className="text-[10px] text-text-secondary font-semibold tracking-wider uppercase mt-0.5">
              Predictive Tracking
            </span>
          </div>
        </div>

        {/* City Badge & Live Clock */}
        <div className="flex items-center gap-6">
          {/* City Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-surface border border-border-custom text-xs font-semibold text-white">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>Bengaluru</span>
            <span className="relative flex h-1.5 w-1.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-custom opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success-custom"></span>
            </span>
          </div>

          {/* Live Clock with Blue Accent */}
          <div className="text-xs md:text-sm font-mono text-text-secondary font-medium bg-background px-3 py-1.5 rounded-lg border border-border-custom">
            <span className="text-accent-blue font-bold mr-1">IST</span>{" "}
            <span className="text-white font-bold">
              {timeStr || "Loading..."}
            </span>
          </div>

          {/* User profile placeholder */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-card-surface border border-border-custom flex items-center justify-center text-sm font-bold text-gray-300 hover:border-primary/50 transition-colors duration-200">
                S
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-custom border-2 border-background rounded-full"></div>
            </div>
            <span className="hidden md:inline text-xs font-semibold text-text-secondary group-hover:text-white transition-colors duration-200">
              Shreyas
            </span>
          </div>
        </div>
      </header>

      {/* Floating Corner Notification (Top-Right of Viewport, floating below navbar) */}
      <div className="fixed top-[88px] right-6 z-50 pointer-events-none flex flex-col items-end w-full max-w-[420px]">
        <AnimatePresence>
          {notifVisible && notifPlace && (
            <motion.div
              initial={{ x: 120, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ 
                height: 0, 
                opacity: 0, 
                scale: 0.9,
                transition: { 
                  height: { duration: 0.3 }, 
                  opacity: { duration: 0.2 }, 
                  scale: { duration: 0.2 } 
                } 
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="pointer-events-auto w-full mb-4 overflow-hidden layer-glass rounded-2xl relative border-l-[3px] border-l-primary"
            >
              <div className="p-4 flex items-start gap-3.5">
                {/* Pulsing radar icon */}
                <div className="relative shrink-0 w-8 h-8 flex items-center justify-center mt-0.5">
                  <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30" />
                  <span className="absolute inset-1 rounded-full bg-primary/15 animate-ping opacity-50" style={{ animationDelay: "0.3s" }} />
                  <div className="relative w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Navigation className="w-3.5 h-3.5 text-primary rotate-45" />
                  </div>
                </div>

                {/* Text Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">
                    📍 Proximity Alert
                  </span>
                  <p className="text-sm font-bold text-white truncate mt-1">
                    You are near <span className="text-primary">{notifPlace.name}</span>
                  </p>
                  <p className="text-[11px] text-text-secondary font-medium leading-normal">
                    Help others — report the live crowd level right now.
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleVoteNow}
                      className="flex items-center gap-1 bg-primary hover:bg-orange-600 text-black text-[11px] font-black px-3.5 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-97 cursor-pointer"
                    >
                      <Vote className="w-3 h-3" />
                      <span>Vote Now</span>
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="text-text-secondary hover:text-white text-[11px] font-semibold px-2 py-1 rounded-md transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={handleDismiss}
                  className="shrink-0 w-6 h-6 rounded-full hover:bg-white/5 flex items-center justify-center text-text-secondary hover:text-white transition-all duration-150"
                  title="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Draining Countdown Progress Bar at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.04]">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 12, ease: "linear" }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
