"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export function SignInButton() {
  const handleSignIn = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    window.location.href = `${backendUrl}/auth/twitter`
  }
  
  return (
    <Button
      onClick={handleSignIn}
      className="gradient-accent text-white hover:opacity-90 transition-opacity"
      size="lg"
    >
      Sign in with
      <Image
        src="/x-black.png"
        alt="X"
        width={16}
        height={16}
      />
    </Button>
  )
}
