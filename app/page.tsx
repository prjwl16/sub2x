"use client"
import { SignInButton } from "@/components/SignInButton";
import { FeatureCard } from "@/components/FeatureCard";
import { FancyArrowFlow } from "@/components/FancyArrowFlow";
import { Target, Zap, TrendingUp, Snowflake, Link } from "lucide-react";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/SignOutButton";
import { DashboardButton } from "@/components/DashboardButton";

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 leading-tight">
            Daily tweets.
            <br />
            <span className="gradient-accent bg-clip-text text-transparent text-white">
              Zero effort.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            → Pick your Reddit communities
            <br />
            → AI shapes them into authentic tweets
            <br />
            → you stay active on X.
          </p>

          <div className="flex justify-center items-center pt-8 text-gray-600">
            {session ? <DashboardButton /> : <SignInButton />}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to automate your Twitter presence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Target className="w-12 h-12 text-indigo-500" />}
            title="Pick Communities"
            description="Choose your niche subreddits once. We'll monitor them for the best content."
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-violet-500" />}
            title="AI Generates"
            description="We turn Reddit gold into tweets in your voice. Authentic, engaging, and on-brand."
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12 text-emerald-500" />}
            title="Stay Visible"
            description="Look active every day, even when you're offline. Consistent engagement builds your audience."
          />
          <FeatureCard
            icon={<Snowflake className="w-12 h-12 text-blue-500" />}
            title="Set & Forget"
            description="Minimal setup, clean dashboard. Review and approve before posting, or let it run automatically."
          />
        </div>

        {/* How it works strip */}
        <div className="text-center py-12">
          <FancyArrowFlow />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-gray-800">
            Turn Reddit into your ghostwriter
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Never run out of content ideas. Stay consistent. Grow your audience.
          </p>
          <div className="pt-4">
            {session ? <DashboardButton /> : <SignInButton />}
          </div>
        </div>
      </section>
    </div>
  );
}