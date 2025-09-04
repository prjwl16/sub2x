"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { Suspense } from "react"
import { userApi } from "@/lib/api/services"

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setToken, setUser, setUsage, logout } = useAuthStore()
  const handledRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (handledRef.current) return
    const status = searchParams.get("status")
    const token = searchParams.get("token")

    const cleanUrl = () => {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("token")
      newUrl.searchParams.delete("status")
      window.history.replaceState({}, "", newUrl.toString())
    }

    const bootstrap = async () => {
      handledRef.current = true
      if (status !== "success" || !token) {
        setError("Invalid auth response. Please try signing in again.")
        return
      }
      try {
        setToken(token)
        const me = await userApi.getMe()
        setUser(me.user)
        setUsage(me.usage)
        cleanUrl()
        router.replace("/onboarding")
      } catch (e: any) {
        logout()
        cleanUrl()
        if (e?.response?.status === 404) {
          setError("User not found. Please sign in again.")
          setTimeout(() => router.replace('/'), 2000)
        } else {
          setError("Authentication failed. Please try again.")
        }
      }
    }

    bootstrap()
  }, [searchParams, router, setToken, setUser, setUsage, logout])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Signing you in…</h1>
          <p className="text-gray-600 mb-6">Finishing authentication and preparing your dashboard.</p>
          {!error && (
            <div className="flex justify-center mt-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}
          {error && (
            <p className="text-red-600 text-sm mt-4">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
