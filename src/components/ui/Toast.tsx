"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";

export default function Toast() {
  const { activeToast, clearToast } = useCrowdStore();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5000); // Auto dismiss after 5s
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearToast]);

  const getToastColors = (type: string) => {
    switch (type) {
      case "success":
        return {
          icon: "text-success-custom",
          border: "border-l-success-custom"
        };
      case "info":
        return {
          icon: "text-warning-custom",
          border: "border-l-warning-custom"
        };
      case "error":
        return {
          icon: "text-danger-custom",
          border: "border-l-danger-custom"
        };
      default:
        return {
          icon: "text-primary",
          border: "border-l-primary"
        };
    }
  };

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3.5 layer-glass px-5 py-4 rounded-xl shadow-2xl border-l-[3.5px] max-w-sm pointer-events-auto ${
            getToastColors(activeToast.type).border
          }`}
        >
          {activeToast.type === "success" && (
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${getToastColors("success").icon}`} />
          )}
          {activeToast.type === "info" && (
            <AlertTriangle className={`w-5 h-5 shrink-0 ${getToastColors("info").icon}`} />
          )}
          {activeToast.type === "error" && (
            <XCircle className={`w-5 h-5 shrink-0 ${getToastColors("error").icon}`} />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white leading-normal">
              {activeToast.message}
            </p>
          </div>

          <button
            onClick={clearToast}
            className="text-text-secondary hover:text-white transition-colors duration-150 ml-1.5 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
