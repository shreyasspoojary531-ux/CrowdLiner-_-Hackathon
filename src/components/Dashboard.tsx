"use client";

import { motion } from "framer-motion";
import { Pin, ArrowRight, Activity, TrendingUp, Users, MapPin } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { getHourIndex, getCrowdStatus } from "@/utils/crowdData";
import CrowdBar from "./ui/CrowdBar";
import React from "react";

export default function Dashboard() {
  const { places, togglePin, setView } = useCrowdStore();

  // Determine current crowd levels based on current IST time
  const currentHour = new Date().getHours();
  const hourIdx = getHourIndex(currentHour);

  // Filter pinned places
  const pinnedPlaces = places.filter((place) => place.isPinned);

  // Calculate statistics
  const totalPlaces = places.length;
  const pinnedCount = pinnedPlaces.length;
  
  const avgCrowd = Math.round(
    places.reduce((acc, place) => acc + place.crowdCurve[hourIdx], 0) / totalPlaces
  );
  
  const cityStatus = getCrowdStatus(avgCrowd);

  // Card hover glow handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  // Stagger entry configurations
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as any
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-10 p-6 md:p-8 max-w-7xl mx-auto w-full"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-[36px] tracking-[-0.03em] font-extrabold text-white leading-tight">
          Welcome back, Shreyas
        </h1>
        <p className="text-text-secondary text-sm font-medium leading-relaxed max-w-2xl">
          Bengaluru crowd intelligence network. Select, map, and plan commute intervals. Dynamic real-time observations synced below.
        </p>
      </motion.div>

      {/* Analytics Widgets */}
      <motion.div 
        variants={itemVariants} 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* City Density Index */}
        <div className="relative overflow-hidden layer-2 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-[120px]">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-none">
              City Density Index
            </span>
            <span className="text-2xl font-black text-white mt-1.5">{avgCrowd}%</span>
          </div>
          <span className="text-xs font-bold leading-none mt-2" style={{ color: cityStatus.color }}>
            Overall {cityStatus.label} Load
          </span>
          <TrendingUp className="absolute bottom-2 right-2 w-16 h-16 text-white/5 pointer-events-none stroke-[1.5]" />
        </div>

        {/* Pinned Locations */}
        <div className="relative overflow-hidden layer-2 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-[120px]">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-none">
              Pinned Locations
            </span>
            <span className="text-2xl font-black text-white mt-1.5">{pinnedCount}</span>
          </div>
          <span className="text-xs text-text-secondary font-semibold leading-none mt-2">
            Favorites in focus
          </span>
          <Pin className="absolute bottom-2 right-2 w-16 h-16 text-white/5 pointer-events-none rotate-45 stroke-[1.5]" />
        </div>

        {/* Monitored Zones */}
        <div className="relative overflow-hidden layer-2 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-[120px] sm:col-span-2 lg:col-span-1">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-none">
              Monitored Zones
            </span>
            <span className="text-2xl font-black text-white mt-1.5">{totalPlaces}</span>
          </div>
          <span className="text-xs text-text-secondary font-semibold leading-none mt-2">
            Active tracking sensors
          </span>
          <Users className="absolute bottom-2 right-2 w-16 h-16 text-white/5 pointer-events-none stroke-[1.5]" />
        </div>
      </motion.div>

      {/* Pinned Places Section */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border-custom pb-3.5">
          <h2 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2">
            <Pin className="w-4 h-4 text-primary fill-primary/10" />
            <span>Pinned Places</span>
          </h2>
          {pinnedCount === 0 && (
            <button 
              onClick={() => setView("explore")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <span>Explore Places</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {pinnedCount === 0 ? (
          <div className="layer-1 border-dashed border-border-light rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-full border border-border-light flex items-center justify-center text-text-secondary">
              <Pin className="w-5 h-5 rotate-45" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-white text-sm font-bold">No locations pinned to your dashboard</p>
              <p className="text-text-secondary text-xs max-w-sm leading-relaxed">
                Add places from the Explore view to monitor their crowd metrics immediately on dashboard cards.
              </p>
            </div>
            <button
              onClick={() => setView("explore")}
              className="mt-2 px-5 py-2.5 bg-primary hover:bg-orange-600 text-black text-xs font-black rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200 active:scale-97 cursor-pointer"
            >
              Find Places to Pin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedPlaces.map((place) => {
              const crowdPct = place.crowdCurve[hourIdx];
              const status = getCrowdStatus(crowdPct);
              return (
                <motion.div
                  key={place.id}
                  variants={itemVariants}
                  onMouseMove={handleMouseMove}
                  className="group relative min-h-[190px] overflow-hidden layer-2 hover:border-border-light rounded-2xl p-5 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between glow-card"
                  onClick={() => setView("details", place.id)}
                >
                  {/* Subtle top-edge accent line matching the crowd status color */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-[2.5px] transition-all duration-300"
                    style={{ backgroundColor: status.color }}
                  />

                  {/* Card Top Header */}
                  <div className="flex justify-between items-start pt-1">
                    <div className="flex flex-col gap-1 w-[80%]">
                      <h3 className="font-bold text-white group-hover:text-primary transition-colors duration-300 text-base leading-snug truncate">
                        {place.name}
                      </h3>
                      <p className="text-text-secondary text-xs flex items-center gap-1 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                        <span>{place.address}</span>
                      </p>
                    </div>

                    {/* Unpin Action Icon: Rounded Circle with tooltip capability */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(place.id);
                      }}
                      className="relative w-6 h-6 rounded-full bg-background border border-border-custom hover:border-danger-custom hover:bg-danger-custom/5 flex items-center justify-center text-text-secondary hover:text-danger-custom transition-all duration-200 shrink-0 cursor-pointer"
                      title="Unpin"
                    >
                      <Pin className="w-3 h-3 fill-primary text-primary group-hover:fill-primary" />
                    </button>
                  </div>

                  {/* Thicker Crowd Indicator */}
                  <div className="mt-4">
                    <CrowdBar percentage={crowdPct} height={6} />
                  </div>

                  {/* Card Footer Info */}
                  <div className="flex items-center justify-between text-[10px] text-text-secondary font-semibold border-t border-border-custom pt-3 mt-4">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-success-custom animate-pulse" />
                      <span className="uppercase tracking-wider">{place.category}</span>
                    </span>
                    <span className="font-mono text-text-secondary/70">
                      {place.lastUpdated.includes("min") ? place.lastUpdated : `Sync: ${place.lastUpdated}`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
