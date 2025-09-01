"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { SignInButton } from "./SignInButton"
import { SignOutButton } from "./SignOutButton"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="w-full border-b border-white/20 backdrop-blur-md bg-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Sub2X
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Features
            </Link>
          </nav>

          {/* Auth Button */}
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <SignOutButton />
              </div>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
