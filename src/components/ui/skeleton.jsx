import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-gray-800/60 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <style>
        {`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        `}
      </style>
    </div>
  );
}

export default Skeleton;
