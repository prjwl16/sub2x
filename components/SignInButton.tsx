"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Bird, X, XIcon } from "lucide-react"
import Image from "next/image"

export function SignInButton() {
  return (
    <Button
      onClick={() => signIn("twitter", { callbackUrl: "/dashboard" })}
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
