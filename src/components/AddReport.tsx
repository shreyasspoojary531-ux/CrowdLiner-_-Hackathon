"use client";

import { useState, useEffect } from "react";
import { Compass, Navigation, MapPin, Activity, ArrowRight } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { Place, getHourIndex, getCrowdStatus } from "@/utils/crowdData";
import { motion } from "framer-motion";
import ReportForm from "./ReportForm";
import React from "react";

// Sequential expanding ring component for Radar
const RadarRing = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0.35 }}
    animate={{ scale: 2.2, opacity: 0 }}
    transition={{
      duration: 2.4,
      repeat: Infinity,
      delay: delay,
      ease: "easeOut"
    }}
    className="absolute w-24 h-24 rounded-full border border-primary/45 pointer-events-none"
  />
);

export default function AddReport() {
  const { places, reportingPlaceId, setReportingPlaceId } = useCrowdStore();
  const [scanning, setScanning] = useState(true);
  const [scanText, setScanText] = useState("Acquiring GPS Signal...");
  const [displayedText, setDisplayedText] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // If a reportingPlaceId was set via the navbar notification, find that place
  // and jump straight to the report form, skipping the scan
  const notifPlace = reportingPlaceId
    ? places.find((p) => p.id === reportingPlaceId) ?? null
    : null;

  // Simulation steps for scanning text
  useEffect(() => {
    if (!scanning || notifPlace) return;

    const timer1 = setTimeout(() => {
      setScanText("Pinging cellular towers...");
    }, 800);

    const timer2 = setTimeout(() => {
      setScanText("Syncing Bengaluru traffic nodes...");
    }, 1600);

    const timer3 = setTimeout(() => {
      // Pick 4 random places
      const shuffled = [...places].sort(() => 0.5 - Math.random());
      setNearbyPlaces(shuffled.slice(0, 4));
      setScanning(false);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [scanning, places, notifPlace]);

  // Typewriter effect for scanning logs text
  useEffect(() => {
    let currentText = scanText;
    let i = 0;
    setDisplayedText("");
    
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + currentText.charAt(i));
      i++;
      if (i >= currentText.length) {
        clearInterval(interval);
      }
    }, 25);
    
    return () => clearInterval(interval);
  }, [scanText]);

  // Card hover glow handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  // Short-circuit: notification-triggered report
  if (notifPlace) {
    return (
      <ReportForm
        place={notifPlace}
        onBack={() => setReportingPlaceId(null)}
      />
    );
  }

  // If a place has been selected to report, show the ReportForm
  if (selectedPlace) {
    return (
      <ReportForm 
        place={selectedPlace} 
        onBack={() => setSelectedPlace(null)} 
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full min-h-[calc(100vh-140px)] justify-center items-center">
      {scanning ? (
        /* Full Screen Radar Scanning experience */
        <div className="flex flex-col items-center justify-center gap-10 max-w-md w-full py-12">
          {/* Pulsing Radar UI with Sequential Rings */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* 3 Sequential rings expanding with 800ms offset */}
            <RadarRing delay={0} />
            <RadarRing delay={0.8} />
            <RadarRing delay={1.6} />
            
            {/* Radar Center pulsing in sync */}
            <motion.div 
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-primary/10 border border-primary flex items-center justify-center shadow-lg shadow-primary/20 relative z-10"
            >
              <Navigation className="w-8 h-8 text-primary rotate-45" />
            </motion.div>
            
            {/* Radar Sweep Line */}
            <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-tr from-transparent via-transparent to-primary/10 animate-spin" style={{ animationDuration: "3.5s" }} />
          </div>

          <div className="flex flex-col gap-2.5 items-center text-center">
            <h2 className="text-lg font-bold text-white tracking-wider uppercase text-[11px]">
              Acquiring Crowd Nodes
            </h2>
            <p className="text-xs text-text-secondary font-mono h-5 font-semibold">
              {displayedText}
            </p>
          </div>

          {/* Skeletal Loading indicators beneath the radar */}
          <div className="w-full flex flex-col gap-3.5 mt-4">
            <div className="h-2 bg-white/5 rounded-full w-2/3 mx-auto animate-pulse" />
            <div className="h-1.5 bg-white/5 rounded-full w-1/2 mx-auto animate-pulse" />
          </div>
        </div>
      ) : (
        /* Results screen showing 4 nearby places */
        <div className="flex flex-col gap-8 w-full max-w-4xl py-6">
          <div className="flex items-center justify-between border-b border-border-custom pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success-custom/10 border border-success-custom/20 flex items-center justify-center text-success-custom">
                <Compass className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white leading-none">
                  You are near these places
                </h2>
                <span className="text-[10px] text-text-secondary font-semibold tracking-wider uppercase mt-1.5">
                  GPS-verified within 500m
                </span>
              </div>
            </div>

            <button
              onClick={() => setScanning(true)}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Rescan location
            </button>
          </div>

          {/* Grid of 4 redesigned nearby cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nearbyPlaces.map((place) => {
              const currentHour = new Date().getHours();
              const hourIdx = getHourIndex(currentHour);
              const crowdPct = place.crowdCurve[hourIdx];
              const { color, label } = getCrowdStatus(crowdPct);

              return (
                <div
                  key={place.id}
                  onMouseMove={handleMouseMove}
                  className="bg-card-surface border border-border-custom hover:border-border-light rounded-2xl p-5 flex flex-col justify-between group glow-card min-h-[180px] shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-4 flex-1">
                    {/* Left: place info */}
                    <div className="flex flex-col gap-1 w-[70%]">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-background border border-border-custom text-text-secondary uppercase font-bold w-fit tracking-wider">
                        {place.category}
                      </span>
                      <h3 className="font-bold text-white text-base leading-snug group-hover:text-primary transition-colors duration-300 truncate mt-2">
                        {place.name}
                      </h3>
                      <p className="text-text-secondary text-xs flex items-center gap-1 font-medium truncate mt-1">
                        <MapPin className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                        <span>{place.address}</span>
                      </p>
                    </div>

                    {/* Right: Giant percentage occupancy status number */}
                    <div className="text-right shrink-0 flex flex-col justify-center items-end">
                      <span className="text-[44px] font-black font-mono leading-none tracking-tighter" style={{ color }}>
                        {crowdPct}%
                      </span>
                      <span style={{ color }} className="text-[10px] font-black uppercase tracking-wider mt-1.5 leading-none">
                        {label} Load
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Solid orange action button spanning full-width */}
                  <div className="mt-5">
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="w-full bg-primary hover:bg-orange-600 text-black text-xs font-black py-2.5 px-4 rounded-xl shadow-md shadow-primary/5 hover:shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-98"
                    >
                      <span>Add Live Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
