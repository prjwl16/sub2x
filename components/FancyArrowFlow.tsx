import { cn } from "@/lib/utils"

interface FancyArrowFlowProps {
  className?: string
}

// A single responsive composition that scales from mobile → desktop
// using clamp-based sizing and percentage positioning.
export function FancyArrowFlow({ className }: FancyArrowFlowProps) {
  return (
    <div className={cn("w-full max-w-5xl mx-auto relative bg-grid bg-[size:20px_20px] rounded-xl", className)}>
      {/* Keep a consistent, responsive canvas height */}
      <div className="relative h-[clamp(18rem,40vw,28rem)]">
        {/* Decorative flow paths (SVG scales with container) */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 600"
          fill="none"
          aria-hidden
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connect X → Select subs */}
          <path d="M 260 180 Q 500 110 720 180" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="14 8" opacity="0.85" markerEnd="url(#m1)" />
          {/* Select subs → Approve style */}
          <path d="M 720 180 Q 690 300 520 360" stroke="#10b981" strokeWidth="6" strokeDasharray="12 7" opacity="0.85" markerEnd="url(#m2)" />
          {/* Approve style → Auto‑post */}
          <path d="M 520 360 Q 620 430 680 500" stroke="#3b82f6" strokeWidth="6" strokeDasharray="14 8" opacity="0.85" markerEnd="url(#m3)" />

          <defs>
            <marker id="m1" markerWidth="18" markerHeight="14" refX="16" refY="7" orient="auto"><polygon points="0 0, 18 7, 0 14" fill="#8b5cf6" /></marker>
            <marker id="m2" markerWidth="18" markerHeight="14" refX="16" refY="7" orient="auto"><polygon points="0 0, 18 7, 0 14" fill="#10b981" /></marker>
            <marker id="m3" markerWidth="18" markerHeight="14" refX="16" refY="7" orient="auto"><polygon points="0 0, 18 7, 0 14" fill="#3b82f6" /></marker>
          </defs>
        </svg>

        {/* Floating nodes (percentage positions + clamp sizing) */}
        {/* Connect X */}
        <div className="absolute top-[14%] left-[24%] -rotate-[12deg] shadow-lg rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center w-[clamp(2.75rem,5vw,4rem)] h-[clamp(2.75rem,5vw,4rem)]">
          <svg className="w-[55%] h-[55%] text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>

        {/* Select subs */}
        <div className="absolute top-[22%] right-[14%] shadow-lg rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center w-[clamp(2.5rem,4.5vw,3.5rem)] h-[clamp(2.5rem,4.5vw,3.5rem)]">
          <svg className="w-[55%] h-[55%] text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>

        {/* Approve style */}
        <div className="absolute top-[56%] left-[38%] -rotate-[6deg] shadow-lg rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center w-[clamp(2.25rem,4vw,3rem)] h-[clamp(2.25rem,4vw,3rem)]">
          <svg className="w-[55%] h-[55%] text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>

        {/* Auto‑post */}
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 rotate-45 shadow-lg rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center w-[clamp(3rem,6vw,4.5rem)] h-[clamp(3rem,6vw,4.5rem)]">
          <svg className="w-[55%] h-[55%] text-white -rotate-45" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        {/* Labels (responsive text sizing) */}
        <div className="absolute top-[6%] left-[22%] text-[clamp(0.675rem,1.2vw,0.9rem)] font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">Connect X</div>
        <div className="absolute top-[18%] right-[10%] text-[clamp(0.675rem,1.2vw,0.9rem)] font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">Select subs</div>
        <div className="absolute top-[48%] left-[32%] text-[clamp(0.675rem,1.2vw,0.9rem)] font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">Approve style</div>
        <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 text-[clamp(0.675rem,1.2vw,0.9rem)] font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">Auto-post</div>
      </div>
    </div>
  )
}
