"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pin, PinOff, MapPin, Compass, Train, ShoppingBag, Briefcase, Trees, Activity } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { CrowdCategory, getHourIndex } from "@/utils/crowdData";
import CrowdBar from "./ui/CrowdBar";
import React from "react";

export default function Explore() {
  const { places, togglePin, setView, searchQuery, setSearchQuery } = useCrowdStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const currentHour = new Date().getHours();
  const hourIdx = getHourIndex(currentHour);

  // Categories list for filtering
  const categories = [
    { id: "all", label: "All Areas", icon: Compass },
    { id: "transit", label: "Transit", icon: Train },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "office", label: "Office Parks", icon: Briefcase },
    { id: "park", label: "Parks", icon: Trees },
    { id: "leisure", label: "Leisure & Arts", icon: Activity },
  ];

  // Map category to premium colors for left borders
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "transit": return "#007AFF"; // Blue
      case "shopping": return "#AF52DE"; // Purple
      case "office": return "#8E8E93"; // Slate Gray
      case "park": return "#00E676"; // Emerald Green
      case "leisure": return "#FF2D55"; // Pink
      default: return "#FF7A00";
    }
  };

  // Card hover glow tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  // Filter places based on search query and category
  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "all" || place.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] tracking-[-0.02em] font-extrabold text-white">Explore Places</h1>
        <p className="text-text-secondary text-xs font-semibold">
          Real-time crowd tracking and predictions for {places.length} locations in Bengaluru.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors duration-200" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location name or area..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-surface border border-border-custom focus:border-primary/50 text-white placeholder-text-muted text-xs font-semibold rounded-xl outline-none transition-all duration-300"
          />
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1.5 max-w-full no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shrink-0 select-none cursor-pointer ${
                  isSelected
                    ? "text-black"
                    : "text-text-secondary border border-border-custom hover:text-white hover:border-border-light bg-[#0C0C0C]"
                }`}
              >
                {/* Framer motion layoutId sliding background */}
                {isSelected && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Places Grid */}
      <div className="mt-2">
        {filteredPlaces.length === 0 ? (
          <div className="layer-1 border-dashed border-border-light rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-full border border-border-light flex items-center justify-center text-text-secondary">
              <Search className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-white text-sm font-bold">No matching locations found</p>
              <p className="text-text-secondary text-xs max-w-sm leading-relaxed">
                We couldn&apos;t find any place matching &quot;{searchQuery}&quot; under the current filters. Check your spelling or clear the query.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-2 px-4 py-2 bg-card-surface hover:bg-card-highlight text-white text-xs font-bold rounded-xl border border-border-custom transition-all duration-200 cursor-pointer"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredPlaces.map((place) => {
                const crowdPct = place.crowdCurve[hourIdx];
                const categoryColor = getCategoryColor(place.category);
                return (
                  <motion.div
                    key={place.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onMouseMove={handleMouseMove}
                    className="group relative overflow-hidden layer-2 hover:border-border-light rounded-2xl p-4 shadow-md transition-all duration-300 cursor-pointer flex flex-col gap-3.5 glow-card"
                    style={{ 
                      borderLeft: `3.5px solid ${categoryColor}` 
                    }}
                    onClick={() => setView("details", place.id)}
                  >
                    {/* Card Header section */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5 w-[82%]">
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors duration-300 text-sm sm:text-base leading-snug truncate">
                          {place.name}
                        </h3>
                        <p className="text-text-secondary text-[11px] flex items-center gap-1 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                          <span>{place.address}</span>
                        </p>
                      </div>

                      {/* Pin Toggle Button — reveals on hover, stays visible when pinned */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(place.id);
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0 cursor-pointer ${
                          place.isPinned
                            ? "opacity-100 bg-primary/10 border-primary/20 text-primary"
                            : "opacity-0 group-hover:opacity-100 focus:opacity-100 bg-background border-border-custom text-text-secondary hover:text-white hover:border-border-light"
                        }`}
                        title={place.isPinned ? "Unpin place" : "Pin place to Dashboard"}
                      >
                        {place.isPinned ? (
                          <Pin className="w-3 h-3 fill-primary" />
                        ) : (
                          <PinOff className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Crowd indicator bar */}
                    <div className="mt-1">
                      <CrowdBar percentage={crowdPct} animate={false} height={4} />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[10px] text-text-secondary font-semibold border-t border-border-custom pt-3 mt-1">
                      <span className="uppercase text-[9px] px-2 py-0.5 rounded bg-background border border-border-custom text-text-secondary">
                        {place.category}
                      </span>
                      <span className="font-mono text-text-secondary/70">{place.lastUpdated}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
