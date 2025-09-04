"use client"

import { onboardingApi, useVoiceProfile } from '@/lib/api';
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Suggestion = { name: string; topic?: string; audience?: string }

export default function OnboardingPage() {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [initialSuggestions, setInitialSuggestions] = useState<Suggestion[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, Suggestion[]>>(new Map())
  
  const { data: voiceProfile, isLoading: voiceProfileLoading, error: voiceProfileError } = useVoiceProfile()

  useEffect(() => {
    if (voiceProfileLoading) return
    
    if (voiceProfileError) {
      const axiosError = voiceProfileError as any
      if (axiosError?.response?.status === 404) {
        return
      }
      setError('Failed to check onboarding status. Please refresh the page.')
      return
    }
    
    if (voiceProfile && voiceProfile.length > 0) {
      router.replace('/dashboard')
      return
    }
  }, [voiceProfile, voiceProfileLoading, voiceProfileError, router])

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const res = await onboardingApi.getSuggestions()
          if (!res) throw new Error('Failed to load suggestions')
          const json = await res
          if (!cancelled) {
            const data = json ?? []
            setSuggestions(data)
            setInitialSuggestions(data)
          }
        } catch (e: any) {
          if (!cancelled) setError(e?.message || 'Failed to load')
        }
      })()
    return () => { cancelled = true }
  }, [])

  // Debounced server-side suggestions as user types (min 2 chars), with cache and abort
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      // Restore default top suggestions when user clears/backspaces
      if (initialSuggestions.length) setSuggestions(initialSuggestions)
      return
    }

    const key = q.toLowerCase()
    const cached = cacheRef.current.get(key)
    if (cached) {
      setSuggestions(cached)
      return
    }

    const controller = new AbortController()
    const id = setTimeout(async () => {
      try {
        const res = await onboardingApi.getSuggestions({ q, limit: 20 })
        if (!res) return
        const data: Suggestion[] = res ?? []
        cacheRef.current.set(key, data)
        setSuggestions(data)
      } catch {
        // ignore
      }
    }, 400)
    return () => { clearTimeout(id); controller.abort() }
  }, [query, initialSuggestions])

  const canComplete = useMemo(() => selected.length >= 5, [selected])

  const toggle = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  const normalizeName = (raw: string): string => {
    let name = (raw || '').trim()
    name = name.replace(/^\/?r\//i, '')
    name = name.toLowerCase()
    name = name.replace(/[^a-z0-9_]/g, '')
    return name
  }

  const addFromInput = () => {
    const name = normalizeName(query)
    if (!name) {
      setInputError('Enter a subreddit name')
      return
    }
    if (name.length < 2 || name.length > 21) {
      setInputError('Name must be 2–21 characters')
      return
    }
    if (selected.includes(name)) {
      setInputError('Already selected')
      return
    }
    if (selected.length >= 50) {
      setInputError('Selection limit reached')
      return
    }
    setSelected(prev => [...prev, name])
    setQuery('')
    setInputError(null)
  }

  const complete = async () => {
    if (!canComplete) return
    setLoading(true)
    setError(null)
    try {
      await onboardingApi.completeOnboarding({ subreddits: selected })
      router.replace('/dashboard')
    } catch (e: any) {
      setError(e?.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const visible: Suggestion[] = useMemo(() => {
    const q = normalizeName(query)
    const filtered: Suggestion[] = q
      ? suggestions.filter(s => s.name.toLowerCase().includes(q))
      : suggestions
    const suggestionNames = new Set(filtered.map(s => s.name.toLowerCase()))
    const selectedOnly: Suggestion[] = selected
      .filter(n => !suggestionNames.has(n.toLowerCase()))
      .map(n => ({ name: n }))
    return [...selectedOnly, ...filtered]
  }, [suggestions, selected, query])

  // Show loading state while checking voice profile
  if (voiceProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking onboarding status...</h2>
          <p className="text-gray-600">Verifying your voice profile setup.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-2">Pick your communities</h1>
      <p className="text-gray-600 mb-6">Choose at least 5 subreddits to personalize your feed.</p>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-4 flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setInputError(null) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFromInput() } }}
          placeholder="Search or add subreddit (e.g., r/typescript)"
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-black"
        />
      </div>
      {inputError && <p className="text-xs text-red-600 mb-4">{inputError}</p>}

      <div className="flex flex-wrap gap-2 mb-8">
        {visible.map((s) => {
          const active = selected.includes(s.name)
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => toggle(s.name)}
              role="checkbox"
              aria-checked={active}
              className={
                `inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors select-none shrink-0 whitespace-nowrap ` +
                (active
                  ? 'border-black bg-black text-white shadow-sm'
                  : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 hover:bg-gray-50')
              }
            >
              <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-white' : 'border border-current opacity-50'}`} />
              <span className="font-medium truncate max-w-[12rem]">r/{s.name}</span>
              {s.topic && <span className={`text-xs ${active ? 'text-gray-200' : 'text-gray-600'} hidden md:inline`}>• {s.topic}</span>}
            </button>
          )
        })}
        {suggestions.length === 0 && (
          <button
            type="button"
            onClick={addFromInput}
            className="px-4 py-2 rounded-full bg-black text-white text-sm border-2 border-black border animate-pulse"
          >add
          <span className="px-2">r/{query}</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Selected: {selected.length} / 5 min</div>
        <button
          onClick={complete}
          disabled={!canComplete || loading}
          className={`px-4 py-2 rounded-full ${canComplete ? 'bg-black text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
        >
          {loading ? 'Saving…' : 'Complete'}
        </button>
      </div>
    </div>
  )
}


