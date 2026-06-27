"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Pin, PinOff, Clock, AlertCircle, Sparkles, MapPin, Calendar } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { 
  getHourIndex, 
  getHourLabel, 
  getCrowdStatus, 
  getEstimatedWaitingTime, 
  getBestTimeRecommendation,
  OPERATING_HOURS
} from "@/utils/crowdData";
import { 
  AreaChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from "recharts";
import CrowdBar from "./ui/CrowdBar";
import React from "react";

export default function PlaceDetails() {
  const { selectedPlaceId, places, togglePin, setView } = useCrowdStore();
  const [mounted, setMounted] = useState(false);
  
  // Local state for planning visit time picker
  const currentHour = new Date().getHours();
  const defaultHourIndex = getHourIndex(currentHour);
  const [selectedHourIdx, setSelectedHourIdx] = useState<number>(defaultHourIndex);

  // SSR fix for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  const place = places.find((p) => p.id === selectedPlaceId);

  // Set default hour when place changes
  useEffect(() => {
    setSelectedHourIdx(defaultHourIndex);
  }, [selectedPlaceId, defaultHourIndex]);

  if (!place) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
        <AlertCircle className="w-12 h-12 text-danger-custom" />
        <p className="text-text-secondary">Place not found.</p>
        <button 
          onClick={() => setView("explore")}
          className="px-4 py-2 bg-card-surface text-white rounded-xl border border-border-custom cursor-pointer"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  // Pre-calculate status details for current hour
  const currentPercentage = place.crowdCurve[defaultHourIndex];
  const { color, label, badgeBg, badgeText } = getCrowdStatus(currentPercentage);

  // Planning calculations based on selected hours
  const selectedPercentage = place.crowdCurve[selectedHourIdx];
  const selectedStatus = getCrowdStatus(selectedPercentage);
  const waitTime = getEstimatedWaitingTime(selectedPercentage, place.category);
  const { bestHour, recommendationText } = getBestTimeRecommendation(place, selectedHourIdx);

  // Format Recharts data
  const chartData = place.crowdCurve.map((val, idx) => ({
    hour: getHourLabel(idx),
    level: val,
    rawHourIdx: idx
  }));

  // Recharts custom glass tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const status = getCrowdStatus(data.level);
      const estWait = getEstimatedWaitingTime(data.level, place.category);
      return (
        <div className="layer-glass p-3 rounded-xl border border-border-light shadow-2xl flex flex-col gap-1 font-sans">
          <p className="text-xs font-bold text-white leading-none mb-1">{data.hour}</p>
          <p className="text-[11px] font-semibold" style={{ color: status.color }}>
            Crowd: {data.level}% ({status.label})
          </p>
          <p className="text-[10px] text-text-secondary">
            Est. Wait: ~{estWait} mins
          </p>
        </div>
      );
    }
    return null;
  };

  const selectedHourLabel = getHourLabel(selectedHourIdx);
  const currentHourLabel = getHourLabel(defaultHourIndex);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb / Back button */}
      <div>
        <button
          onClick={() => setView("explore")}
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition-colors duration-150 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Explore Places</span>
        </button>
      </div>

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 layer-1 border border-border-custom rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-bold text-white tracking-tight leading-tight">
                {place.name}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeBg} ${badgeText}`}>
                {label} Load
              </span>
            </div>
            
            <p className="text-text-secondary text-xs flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-text-secondary shrink-0" />
              <span>{place.address}</span>
            </p>
          </div>
        </div>

        {/* Pin button */}
        <button
          onClick={() => togglePin(place.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border hover:scale-102 shrink-0 cursor-pointer ${
            place.isPinned
              ? "bg-primary/10 border-primary/20 text-primary"
              : "bg-secondary-surface border-border-custom text-text-secondary hover:text-white"
          }`}
        >
          {place.isPinned ? (
            <>
              <Pin className="w-3.5 h-3.5 fill-primary" />
              <span>Pinned to Dashboard</span>
            </>
          ) : (
            <>
              <PinOff className="w-3.5 h-3.5" />
              <span>Pin to Dashboard</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph Section - Takes 2 cols */}
        <div className="lg:col-span-2 layer-2 border border-border-custom rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Crowd Density Trend (IST)
            </h2>
            <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
              Operating window: 6 AM — 11 PM
            </span>
          </div>

          <div className="w-full h-[320px] flex items-center justify-center mt-2 relative">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={chartData} 
                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid 
                    strokeDasharray="4 4" 
                    stroke="rgba(255, 255, 255, 0.02)" 
                    vertical={false} 
                  />

                  {/* Reference Areas (Horizontal Bands) for Crowd load zones */}
                  <ReferenceArea y1={0} y2={35} fill="#00E676" fillOpacity={0.015} />
                  <ReferenceArea y1={36} y2={65} fill="#FFB300" fillOpacity={0.015} />
                  <ReferenceArea y1={66} y2={100} fill="#FF3B30" fillOpacity={0.015} />

                  {/* Spotlight selection highlight (vertical column indicator) */}
                  <ReferenceArea 
                    x1={selectedHourLabel} 
                    x2={selectedHourLabel} 
                    fill="#FF7A00" 
                    fillOpacity={0.07} 
                  />

                  {/* Current hour NOW indicator */}
                  <ReferenceLine 
                    x={currentHourLabel} 
                    stroke="#007AFF" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: "NOW", 
                      fill: "#007AFF", 
                      fontSize: 9, 
                      fontWeight: 800, 
                      position: "top",
                      offset: 6
                    }} 
                  />

                  <XAxis 
                    dataKey="hour" 
                    stroke="#4E4E52" 
                    fontSize={10} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false} 
                    dy={8}
                  />

                  <YAxis 
                    stroke="#4E4E52" 
                    fontSize={10} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 100]} 
                    dx={-8}
                    tickFormatter={() => ""} // Remove Y axis numbers entirely per redesign spec
                  />

                  <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ stroke: "rgba(255, 122, 0, 0.08)", strokeWidth: 1.5 }} 
                  />
                  
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke="none"
                    fillOpacity={1}
                    fill="url(#colorLevel)"
                    animationDuration={1000}
                  />

                  <Line 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#FF7A00" 
                    strokeWidth={3} 
                    dot={{ r: 2.5, stroke: "#FF7A00", strokeWidth: 1.5, fill: "#141414" }}
                    activeDot={{ r: 4.5, stroke: "#FFFFFF", strokeWidth: 1.5, fill: "#FF7A00" }}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded bg-white/5 animate-pulse" />
            )}
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-text-secondary font-semibold border-t border-border-custom pt-3 px-1 mt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>TODAY&apos;S CROWD CURVE DATASET</span>
            </span>
            <span>{place.lastUpdated}</span>
          </div>
        </div>

        {/* Planning Tool Section - Takes 1 col */}
        <div className="layer-2 border border-border-custom rounded-2xl p-5 flex flex-col gap-6 shadow-xl justify-between">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-border-custom pb-3">
              <Clock className="w-4.5 h-4.5 text-primary" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Planning to visit?
              </h2>
            </div>

            {/* Time Picker Slider/Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Select Target Time</label>
              <select
                value={selectedHourIdx}
                onChange={(e) => setSelectedHourIdx(parseInt(e.target.value, 10))}
                className="w-full bg-[#0C0C0C] border border-border-custom text-white text-xs font-bold rounded-xl py-2.5 px-3.5 outline-none focus:border-primary/50 cursor-pointer"
              >
                {OPERATING_HOURS.map((hr, idx) => (
                  <option key={hr} value={idx}>
                    {hr} {idx === defaultHourIndex ? "(Current Hour)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-border-custom my-1" />

            {/* Expected Crowd Level details */}
            <div className="flex flex-col gap-2 bg-[#0C0C0C] p-4 rounded-xl border border-border-custom">
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest leading-none">
                Forecasted Crowd at {getHourLabel(selectedHourIdx)}
              </span>
              
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-black text-white font-mono leading-none">
                  {selectedPercentage}%
                </span>
                <span className="text-xs font-bold" style={{ color: selectedStatus.color }}>
                  {selectedStatus.label} Load
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mt-2 border border-border-custom">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedPercentage}%`, backgroundColor: selectedStatus.color }}
                />
              </div>
            </div>

            {/* Waiting estimation details */}
            <div className="flex flex-col gap-1 px-1 mt-1">
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest leading-none">
                Est. Queue Delay
              </span>
              <p className="text-lg font-black text-white font-mono mt-1">
                ~{waitTime} {waitTime === 1 ? "min" : "mins"}
              </p>
              <p className="text-[10px] text-text-secondary leading-relaxed mt-1">
                Calculated dynamic checkout queue delay for category: <span className="underline decoration-primary/30 uppercase font-bold text-[9px]">{place.category}</span>.
              </p>
            </div>
          </div>

          {/* Best Recommendation Box */}
          <div className="bg-primary/[0.03] border border-primary/10 rounded-xl p-4 flex gap-3 mt-4">
            <Sparkles className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-primary font-bold uppercase tracking-wider">
                Smart Recommendation
              </span>
              <p className="text-xs text-white leading-relaxed font-semibold mt-0.5">
                {recommendationText}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
