"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Clock, Calendar, ShieldCheck, HelpCircle, ChevronRight, Activity } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { Place, getHourIndex, getHourLabel, getCrowdStatus } from "@/utils/crowdData";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, ResponsiveContainer } from "recharts";
import React from "react";

interface ReportFormProps {
  place: Place;
  onBack: () => void;
}

export default function ReportForm({ place, onBack }: ReportFormProps) {
  const { submitReport, lastReportTime, setView } = useCrowdStore();
  const [selectedLevel, setSelectedLevel] = useState<"Low" | "Medium" | "High" | "Very High">("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [truthScoreResult, setTruthScoreResult] = useState<number | null>(null);

  // Time and Date formatting states
  const [istTimeStr, setIstTimeStr] = useState("");
  const [istDateStr, setIstDateStr] = useState("");

  // Store the original crowd curve before blending
  const [originalCurve, setOriginalCurve] = useState<number[]>([]);

  // Radial progress and counter animation states
  const [progressOffset, setProgressOffset] = useState(2 * Math.PI * 64);
  const [liveCounter, setLiveCounter] = useState(0);

  useEffect(() => {
    if (place) {
      setOriginalCurve([...place.crowdCurve]);
    }
  }, [place]);

  useEffect(() => {
    const now = new Date();
    setIstTimeStr(
      now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    );
    setIstDateStr(
      now.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    );
  }, []);

  // Animate the radial score and live number counter
  useEffect(() => {
    if (truthScoreResult !== null) {
      const radius = 64;
      const circumference = 2 * Math.PI * radius;
      let startValue = 0;
      const duration = 1200; // 1.2 seconds
      const steps = 60;
      const stepValue = truthScoreResult / steps;
      const stepOffset = circumference / steps;
      const intervalTime = duration / steps;

      const timer = setInterval(() => {
        startValue += stepValue;
        if (startValue >= truthScoreResult) {
          startValue = truthScoreResult;
          clearInterval(timer);
        }
        setLiveCounter(Math.round(startValue));
        
        // Calculate offset: 0% offset means full circle, 100% offset means empty
        const percentFilled = startValue / 100;
        setProgressOffset(circumference - percentFilled * circumference);
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [truthScoreResult]);

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Dynamic pattern processing delay
    setTimeout(() => {
      const result = submitReport(place.id, selectedLevel);
      setIsSubmitting(false);
      
      if (result.success && result.truthScore !== undefined) {
        setTruthScoreResult(result.truthScore);
      }
    }, 1000);
  };

  // Cooldown status checking
  const now = Date.now();
  const cooldownPeriod = 30 * 60 * 1000;
  const isCooldownActive = lastReportTime && now - lastReportTime < cooldownPeriod;
  const remainingMinutes = lastReportTime 
    ? Math.ceil((cooldownPeriod - (now - lastReportTime)) / 60000) 
    : 0;

  const currentHour = new Date().getHours();
  const hourIdx = getHourIndex(currentHour);
  const currentPrediction = originalCurve[hourIdx] || place.crowdCurve[hourIdx];

  // Mini-graph setup for 5-hour window centered around current hour
  const startIdx = Math.max(0, Math.min(13, hourIdx - 2));
  const endIdx = startIdx + 4;
  const miniGraphData = [];
  for (let i = startIdx; i <= endIdx; i++) {
    miniGraphData.push({
      hour: getHourLabel(i),
      before: originalCurve[i] || place.crowdCurve[i],
      after: place.crowdCurve[i]
    });
  }

  // Crowd Options UI setup
  const crowdOptions = [
    { 
      level: "Low" as const, 
      emoji: "🟢", 
      desc: "Sparse/Quiet. Easy seat/queue", 
      colorClass: "border-success-custom/10 hover:border-success-custom/30 bg-success-custom/[0.02]",
      activeClass: "border-success-custom bg-success-custom/[0.06] text-success-custom shadow-lg shadow-success-custom/5"
    },
    { 
      level: "Medium" as const, 
      emoji: "🟡", 
      desc: "Moderate traffic. Short queues", 
      colorClass: "border-warning-custom/10 hover:border-warning-custom/30 bg-warning-custom/[0.02]",
      activeClass: "border-warning-custom bg-warning-custom/[0.06] text-warning-custom shadow-lg shadow-warning-custom/5"
    },
    { 
      level: "High" as const, 
      emoji: "🟠", 
      desc: "Heavy rush. Long billing queues", 
      colorClass: "border-primary/10 hover:border-primary/30 bg-primary/[0.02]",
      activeClass: "border-primary bg-primary/[0.06] text-primary shadow-lg shadow-primary/5"
    },
    { 
      level: "Very High" as const, 
      emoji: "🔴", 
      desc: "Peak capacity. Blocked entry", 
      colorClass: "border-danger-custom/10 hover:border-danger-custom/30 bg-danger-custom/[0.02]",
      activeClass: "border-danger-custom bg-danger-custom/[0.06] text-danger-custom shadow-lg shadow-danger-custom/5"
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto w-full">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition-colors duration-150 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Scan List</span>
        </button>
      </div>

      {truthScoreResult !== null ? (
        /* Redesigned Celebratory Truth Score Result Screen */
        <div className="layer-2 border border-border-custom rounded-2xl p-6 shadow-2xl flex flex-col gap-6 items-center text-center">
          
          {/* Big Score Radial Ring with Particle Burst and Backglow */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Pulsing Backglow */}
            <div 
              className={`absolute inset-4 rounded-full blur-xl opacity-20 transition-all duration-500 ${
                truthScoreResult >= 70 ? "bg-success-custom" : "bg-warning-custom"
              }`} 
            />

            {/* Particle Burst animation elements for score >= 70% */}
            {truthScoreResult >= 70 && Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8;
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * 85;
              const y = Math.sin(rad) * 85;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{ x, y, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
                  className="absolute w-2 h-2 rounded-full bg-success-custom z-20 pointer-events-none"
                />
              );
            })}

            {/* SVG circle container */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-neutral-900 fill-transparent"
                strokeWidth="7"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className={`fill-transparent transition-all duration-75 ${
                  truthScoreResult >= 70 ? "stroke-success-custom" : "stroke-warning-custom"
                }`}
                strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white font-mono leading-none">
                {liveCounter}%
              </span>
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest mt-1.5 leading-none">
                Truth Score
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Title with variance shake animation on low score */}
            <motion.h2 
              variants={{
                shake: {
                  x: [0, -3, 3, -3, 3, 0],
                  transition: { duration: 0.25 }
                }
              }}
              animate={truthScoreResult < 70 ? "shake" : undefined}
              className="text-lg font-bold text-white flex items-center justify-center gap-2"
            >
              {truthScoreResult >= 70 ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-success-custom" />
                  <span>Report Approved &amp; Blended</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-5 h-5 text-warning-custom" />
                  <span>Variance Shift Registered</span>
                </>
              )}
            </motion.h2>
            <p className="text-xs text-text-secondary max-w-sm leading-relaxed px-2 font-medium">
              {truthScoreResult >= 70 
                ? "Your observation perfectly matches recent crowd sensors. Live forecasting curves updated."
                : "A difference was recorded. Your report has been blended in to shift local crowd expectations."}
            </p>
          </div>

          {/* Before / After Mini-Graph display */}
          <div className="w-full flex flex-col gap-3 bg-[#0C0C0C] p-4 rounded-xl border border-border-custom">
            <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest text-left">
              Blended Shift (5-Hour Window)
            </span>
            <div className="w-full h-20 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniGraphData}>
                  <XAxis 
                    dataKey="hour" 
                    stroke="#4E4E52" 
                    fontSize={8} 
                    tickLine={false} 
                    axisLine={false}
                    dy={5}
                  />
                  {/* Before Blend (dashed, faded) */}
                  <Line 
                    type="monotone" 
                    dataKey="before" 
                    stroke="#FF7A00" 
                    strokeWidth={1.5} 
                    strokeDasharray="3 3" 
                    opacity={0.35} 
                    dot={false}
                    animationDuration={0}
                  />
                  {/* After Blend (solid orange) */}
                  <Line 
                    type="monotone" 
                    dataKey="after" 
                    stroke="#FF7A00" 
                    strokeWidth={2} 
                    dot={false}
                    animationDuration={1200}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[8px] font-bold text-text-secondary tracking-wider mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-[1.5px] border-t border-dashed border-primary opacity-50" />
                <span>PREVIOUS ESTIMATE</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-[1.5px] bg-primary" />
                <span>NEW BLENDED TREND</span>
              </span>
            </div>
          </div>

          {/* Sync Stats Info */}
          <div className="w-full grid grid-cols-2 gap-4 bg-[#0C0C0C] p-4 rounded-xl border border-border-custom">
            <div className="flex flex-col items-center gap-0.5 border-r border-border-custom">
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Forecast Load</span>
              <span className="text-sm font-bold text-white font-mono">{currentPrediction}%</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Your Report</span>
              <span className="text-sm font-bold text-primary font-mono">{selectedLevel}</span>
            </div>
          </div>

          <button
            onClick={() => setView("details", place.id)}
            className="w-full bg-primary hover:bg-orange-600 text-black text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
          >
            <span>Proceed to Place Trends</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Report Form Card */
        <form 
          onSubmit={handleSubmission}
          className="layer-2 border border-border-custom rounded-2xl p-6 shadow-2xl flex flex-col gap-6"
        >
          {/* Form Header */}
          <div className="flex flex-col gap-1.5 border-b border-border-custom pb-4">
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
              Submit Live Data
            </span>
            <h2 className="text-xl font-bold text-white leading-tight">
              Report Crowd Level for <span className="text-primary">{place.name}</span>
            </h2>
          </div>

          {/* Auto-filled Metadata Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0C0C0C] p-3.5 rounded-xl border border-border-custom flex items-center gap-3">
              <Clock className="w-4.5 h-4.5 text-text-secondary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">IST Time (Locked)</span>
                <span className="text-xs font-bold text-white font-mono mt-0.5">{istTimeStr || "..."}</span>
              </div>
            </div>
            <div className="bg-[#0C0C0C] p-3.5 rounded-xl border border-border-custom flex items-center gap-3">
              <Calendar className="w-4.5 h-4.5 text-text-secondary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Date (Locked)</span>
                <span className="text-xs font-bold text-white mt-0.5">{istDateStr || "..."}</span>
              </div>
            </div>
          </div>

          {/* Crowd Level Choices */}
          <div className="flex flex-col gap-3">
            <label className="text-xs text-text-secondary font-bold px-0.5 uppercase tracking-wider">
              What is the current crowd size?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {crowdOptions.map((opt) => {
                const isSelected = selectedLevel === opt.level;
                return (
                  <div
                    key={opt.level}
                    onClick={() => setSelectedLevel(opt.level)}
                    className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                      isSelected ? opt.activeClass : `${opt.colorClass} border-border-custom hover:bg-[#0C0C0C]`
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-xl shrink-0">{opt.emoji}</span>
                      <div className="flex flex-col">
                        <span className={`text-xs font-black ${isSelected ? "" : "text-white"}`}>
                          {opt.level}
                        </span>
                        <span className="text-[10px] text-text-secondary font-semibold mt-1">
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button & Cooldown */}
          <div className="mt-2 flex flex-col gap-3.5">
            {isCooldownActive ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled
                  className="w-full bg-neutral-900 border border-white/5 text-gray-500 text-xs font-bold py-3.5 rounded-xl cursor-not-allowed"
                >
                  Submit Live Report
                </button>
                <p className="text-[10px] text-danger-custom font-semibold text-center leading-normal">
                  ⚠️ You recently submitted a report. Please wait {remainingMinutes} {remainingMinutes === 1 ? "minute" : "minutes"}.
                </p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-orange-600 disabled:bg-primary/50 text-black text-xs font-black py-3.5 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="w-4 h-4 text-black animate-spin" />
                    <span>Analyzing Crowd Patterns...</span>
                  </>
                ) : (
                  <span>Submit Live Report</span>
                )}
              </button>
            )}
            
            <p className="text-[9px] text-text-secondary text-center font-medium leading-relaxed max-w-sm mx-auto">
              Submitted reports alter prediction datasets using weighted historical blending. Please only report truthful values based on local observations.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
