import { GlassCard } from "./GlassCard"
import { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <GlassCard>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="text-4xl">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </GlassCard>
  )
}
