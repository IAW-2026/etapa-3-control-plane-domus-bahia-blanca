"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  visible: boolean;
  icon: React.ReactNode;
  message: string;
  color: string;
  glowColor?: string;
}

export function Toast({ visible, icon, message, color, glowColor }: ToastProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[9999] pointer-events-none"
      style={{
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(-50%) translateY(0) scale(1)"
          : "translateX(-50%) translateY(16px) scale(0.95)",
        filter: visible && glowColor ? `drop-shadow(0 0 20px ${glowColor})` : "none",
        maxWidth: "90vw",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold text-white"
        style={{
          background: color,
          boxShadow: glowColor
            ? `0 8px 32px ${glowColor}, 0 2px 8px ${glowColor}`
            : "0 8px 32px rgba(0,0,0,0.2)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="flex-shrink-0" style={{ color: "rgba(255,255,255,0.85)" }}>
          {icon}
        </span>
        {message}
      </div>
    </div>,
    document.body,
  );
}
