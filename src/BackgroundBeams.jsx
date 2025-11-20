import React from "react";

export const BackgroundBeams = () => {
  return (
    <div className="fixed inset-0 z-0 h-full w-full bg-neutral-950 pointer-events-none">
      <div className="absolute h-full w-full bg-[radial-gradient(circle_800px_at_50%_200px,#3e3e3e,transparent)]" />
      {/* Moving Grid */}
      <svg
        className="absolute left-0 top-0 h-full w-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="1" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)">
           <animate attributeName="opacity" values="0.1;0.3;0.1" dur="10s" repeatCount="indefinite" />
        </rect>
      </svg>
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[120px] animate-pulse" style={{animationDelay: '2s'}} />
    </div>
  );
};