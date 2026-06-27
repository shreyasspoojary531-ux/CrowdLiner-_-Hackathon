"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Compass, PlusCircle } from "lucide-react";
import { useCrowdStore, ViewType } from "@/store/useCrowdStore";
import { useState } from "react";

export default function Sidebar() {
  const { activeView, setView } = useCrowdStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    {
      id: "dashboard" as ViewType,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "explore" as ViewType,
      label: "Explore Places",
      icon: Compass,
    },
    {
      id: "add-report" as ViewType,
      label: "Add Report",
      icon: PlusCircle,
    },
  ];

  return (
    <>
      {/* Sidebar for Desktop (>=1024px) and Tablet (768px - 1023px) */}
      <aside className="hidden md:flex flex-col justify-between p-4 sticky top-[73px] h-[calc(100vh-73px)] shrink-0 layer-1 border-r border-border-custom transition-all duration-300 w-16 lg:w-[220px]">
        <div className="flex flex-col gap-1.5">
          {/* Navigation Title (Hidden on Tablet) */}
          <span className="hidden lg:inline text-[10px] font-bold tracking-wider text-text-muted uppercase px-3 mb-2">
            Navigation
          </span>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeView === item.id ||
                (item.id === "explore" && activeView === "details");

              return (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    onClick={() => setView(item.id)}
                    className={`relative w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 text-left outline-none cursor-pointer ${
                      isActive
                        ? "text-primary bg-primary/[0.03]"
                        : "text-text-secondary hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Active vertical accent line */}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-r"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Icon container with emitting glow on active item */}
                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                      {isActive && (
                        <div className="absolute inset-0 w-8 h-8 rounded-full bg-primary/10 blur-[6px] -translate-x-1.5 -translate-y-1.5 animate-pulse-slow" />
                      )}
                      <Icon
                        className={`w-5 h-5 z-10 transition-transform duration-300 group-hover:scale-110 ${
                          isActive ? "text-primary" : "text-text-secondary group-hover:text-white"
                        }`}
                      />
                    </div>

                    {/* Label (Hidden on Tablet) */}
                    <span className="hidden lg:inline flex-1 truncate transition-colors duration-200">
                      {item.label}
                    </span>
                  </button>

                  {/* Tablet Hover Tooltip */}
                  <div className="lg:hidden absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-card-highlight border border-border-light text-xs font-semibold text-white shadow-xl opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Info (Hidden on Tablet) */}
        <div className="hidden lg:flex p-3 bg-background border border-border-custom rounded-xl flex-col gap-1.5 text-[11px] text-text-secondary">
          <p className="font-bold text-white">CrowdLiner v1.0</p>
          <p className="leading-relaxed text-[10px]">
            Real-time commute density planning models powered by Bengaluru crowd reports.
          </p>
        </div>
      </aside>

      {/* Bottom Tab Bar for Mobile (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 layer-glass border-t border-border-light z-40 px-6 flex items-center justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.id ||
            (item.id === "explore" && activeView === "details");

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="flex flex-col items-center justify-center gap-1 py-1 px-3 min-w-[70px] relative outline-none"
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="mobile-glow"
                    className="absolute inset-0 w-8 h-8 rounded-full bg-primary/10 blur-[8px] -translate-x-1.5 -translate-y-1.5"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? "text-primary scale-110" : "text-text-secondary"
                  }`}
                />
              </div>

              {isActive ? (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-bold text-primary tracking-tight"
                >
                  {item.label.split(" ")[0]} {/* Show short label on mobile (e.g. "Explore") */}
                </motion.span>
              ) : (
                <span className="text-[10px] font-semibold text-text-secondary opacity-60 tracking-tight">
                  {item.label.split(" ")[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
