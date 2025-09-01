import { cn } from "@/lib/utils"

interface FancyArrowFlowProps {
  className?: string
}

export function FancyArrowFlow({ className }: FancyArrowFlowProps) {
  return (
    <div className={cn("w-full max-w-5xl mx-auto relative", className)}>
      {/* Desktop Floating Flow */}
      <div className="hidden md:block relative h-64">
        {/* Floating Elements */}
        <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl transform rotate-12 shadow-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
        
        <div className="absolute top-16 right-32 w-14 h-14 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        <div className="absolute bottom-12 left-1/3 w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl transform -rotate-6 shadow-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        
        <div className="absolute bottom-8 right-16 w-18 h-18 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl transform rotate-45 shadow-lg flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        {/* Organic Flow Paths */}
        <svg className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Flowing path 1 */}
          <path
            d="M 80 40 Q 200 80 320 80 Q 400 100 480 120"
            stroke="url(#gradient1)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.7"
          />
          
          {/* Flowing path 2 */}
          <path
            d="M 120 60 Q 250 100 380 140 Q 500 160 600 180"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8,4"
            opacity="0.6"
          />
          
          {/* Flowing path 3 */}
          <path
            d="M 60 100 Q 180 140 300 160 Q 420 180 540 200"
            stroke="url(#gradient3)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="6,6"
            opacity="0.5"
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Labels */}
        <div className="absolute top-2 left-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          Connect X
        </div>
        <div className="absolute top-20 right-20 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          Select subs
        </div>
        <div className="absolute bottom-16 left-1/4 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          Approve style
        </div>
        <div className="absolute bottom-2 right-8 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          Auto-post
        </div>
      </div>

      {/* Mobile Floating Flow */}
      <div className="block md:hidden relative h-96">
        {/* Floating Elements */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl transform rotate-12 shadow-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
        
        <div className="absolute top-32 right-8 w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        <div className="absolute top-56 left-8 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl transform -rotate-6 shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl transform rotate-45 shadow-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        {/* Organic Flow Paths */}
        <svg className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Flowing path 1 */}
          <path
            d="M 120 40 Q 200 80 280 120 Q 200 160 120 200"
            stroke="url(#mobileGradient1)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="4,4"
            opacity="0.7"
          />
          
          {/* Flowing path 2 */}
          <path
            d="M 80 80 Q 160 120 240 160 Q 160 200 80 240"
            stroke="url(#mobileGradient2)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6,3"
            opacity="0.6"
          />
          
          {/* Flowing path 3 */}
          <path
            d="M 160 120 Q 240 160 160 200 Q 80 240 160 280"
            stroke="url(#mobileGradient3)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.5"
          />

          {/* Mobile Gradient definitions */}
          <defs>
            <linearGradient id="mobileGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="mobileGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="mobileGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Labels */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          Connect X
        </div>
        <div className="absolute top-36 right-2 text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          Select subs
        </div>
        <div className="absolute top-60 left-2 text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          Approve style
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          Auto-post
        </div>
      </div>
    </div>
  )
}
