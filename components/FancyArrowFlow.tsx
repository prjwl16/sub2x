import { cn } from "@/lib/utils"
import { ArrowDown, Twitter, Users, Check, Zap } from "lucide-react"

interface FancyArrowFlowProps {
  className?: string
}

export function FancyArrowFlow({ className }: FancyArrowFlowProps) {
  return (
    <div className={cn("w-full max-w-5xl mx-auto py-20", className)}>
      {/* Mobile Stack Layout */}
      <div className="block lg:hidden space-y-12">
        {/* Step 1 */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg border border-slate-300/60">
              <Twitter className="w-8 h-8 text-slate-600" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-slate-200/40 to-slate-300/40 rounded-2xl blur-sm -z-10"></div>
          </div>
          <div className="text-center max-w-xs">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Connect X</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Secure one-click authentication</p>
          </div>
          <ArrowDown className="w-6 h-6 text-slate-300" />
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg border border-indigo-300/60">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-200/40 to-indigo-300/40 rounded-2xl blur-sm -z-10"></div>
          </div>
          <div className="text-center max-w-xs">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Select r/communities</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Pick your favorite subreddits</p>
          </div>
          <ArrowDown className="w-6 h-6 text-slate-300" />
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-lg border border-emerald-300/60">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-200/40 to-emerald-300/40 rounded-2xl blur-sm -z-10"></div>
          </div>
          <div className="text-center max-w-xs">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">AI Generates</h3>
            <p className="text-slate-500 text-sm leading-relaxed">AI turns Reddit gold into tweets</p>
          </div>
          <ArrowDown className="w-6 h-6 text-slate-300" />
        </div>

        {/* Step 4 */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center shadow-lg border border-amber-300/60">
              <Zap className="w-8 h-8 text-amber-600" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-amber-200/40 to-amber-300/40 rounded-2xl blur-sm -z-10"></div>
          </div>
          <div className="text-center max-w-xs">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Stay Visible</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Look active every day, even when you're offline</p>
          </div>
        </div>
      </div>

      {/* Desktop Flow Layout */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-3xl -z-20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.03),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.03),transparent_50%)] rounded-3xl -z-10"></div>
          
          {/* Connecting Line */}
          <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          
          {/* Flow Container */}
          <div className="grid grid-cols-4 gap-12 px-8 py-16">
            {/* Step 1: Connect X */}
            <div className="flex flex-col items-center space-y-8 group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center shadow-lg border border-slate-300/60 group-hover:shadow-xl transition-all duration-500">
                  <Twitter className="w-10 h-10 text-slate-600" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-slate-200/20 to-slate-300/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-700 mb-3">Connect X</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-40">Secure authentication with enterprise-grade security</p>
              </div>
              
              {/* Subtle connector */}
              <div className="absolute top-10 -right-6 w-12 h-px bg-gradient-to-r from-slate-200 to-indigo-200 opacity-60"></div>
            </div>

            {/* Step 2: Select Sources */}
            <div className="flex flex-col items-center space-y-8 group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-3xl flex items-center justify-center shadow-lg border border-indigo-300/60 group-hover:shadow-xl transition-all duration-500">
                  <Users className="w-10 h-10 text-indigo-600" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-indigo-200/20 to-indigo-300/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-700 mb-3">Select Sources</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-40">Curate premium content from trusted communities</p>
              </div>
              
              {/* Subtle connector */}
              <div className="absolute top-10 -right-6 w-12 h-px bg-gradient-to-r from-indigo-200 to-emerald-200 opacity-60"></div>
            </div>

            {/* Step 3: Train Voice */}
            <div className="flex flex-col items-center space-y-8 group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center shadow-lg border border-emerald-300/60 group-hover:shadow-xl transition-all duration-500">
                  <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-200/20 to-emerald-300/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-700 mb-3">Train Voice</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-40">AI learns your unique voice and style patterns</p>
              </div>
              
              {/* Subtle connector */}
              <div className="absolute top-10 -right-6 w-12 h-px bg-gradient-to-r from-emerald-200 to-amber-200 opacity-60"></div>
            </div>

            {/* Step 4: Auto-Publish */}
            <div className="flex flex-col items-center space-y-8 group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl flex items-center justify-center shadow-lg border border-amber-300/60 group-hover:shadow-xl transition-all duration-500">
                  <Zap className="w-10 h-10 text-amber-600" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-amber-200/20 to-amber-300/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-700 mb-3">Auto-Publish</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-40">Intelligent scheduling with optimal timing</p>
              </div>
            </div>
          </div>

          {/* Floating accent elements */}
          <div className="absolute top-8 left-16 w-1 h-1 bg-slate-300 rounded-full opacity-30"></div>
          <div className="absolute bottom-8 right-20 w-2 h-2 bg-indigo-200 rounded-full opacity-25"></div>
          <div className="absolute top-20 right-32 w-1.5 h-1.5 bg-emerald-200 rounded-full opacity-30"></div>
        </div>

        {/* Bottom subtle accent */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-200/40 shadow-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full"></div>
            <span className="text-slate-600 font-medium text-sm">Enterprise-ready automation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
