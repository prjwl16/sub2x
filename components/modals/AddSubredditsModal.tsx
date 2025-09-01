"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Loader2 } from "lucide-react"

type Suggestion = { name: string; topic?: string; audience?: string }

interface AddSubredditsModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (subreddits: string[]) => Promise<void>
  existingSubreddits?: string[]
}

export function AddSubredditsModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  existingSubreddits = [] 
}: AddSubredditsModalProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [initialSuggestions, setInitialSuggestions] = useState<Suggestion[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, Suggestion[]>>(new Map())

  // Load initial suggestions when modal opens
  useEffect(() => {
    if (!isOpen) return
    
    let cancelled = false
    ; (async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/onboarding/suggestions', { method: 'GET', cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load suggestions')
        const json = await res.json()
        if (!cancelled) {
          const data = json.data ?? []
          setSuggestions(data)
          setInitialSuggestions(data)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load suggestions')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    
    return () => { cancelled = true }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelected([])
      setQuery('')
      setError(null)
      setInputError(null)
      setSuggestions([])
      setInitialSuggestions([])
      cacheRef.current.clear()
    }
  }, [isOpen])

  // Debounced server-side suggestions as user types (min 2 chars), with cache and abort
  useEffect(() => {
    if (!isOpen) return
    
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
        const url = `/api/onboarding/suggestions?q=${encodeURIComponent(q)}&limit=20`
        const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal })
        if (!res.ok) return
        const json = await res.json()
        const data: Suggestion[] = json.data ?? []
        cacheRef.current.set(key, data)
        setSuggestions(data)
      } catch {
        // ignore fetch errors (likely aborted)
      }
    }, 300) // Slightly faster debounce for better UX
    
    return () => { clearTimeout(id); controller.abort() }
  }, [query, initialSuggestions, isOpen])

  const toggle = useCallback((name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }, [])

  const normalizeName = useCallback((raw: string): string => {
    let name = (raw || '').trim()
    name = name.replace(/^\/?r\//i, '')
    name = name.toLowerCase()
    name = name.replace(/[^a-z0-9_]/g, '')
    return name
  }, [])

  const addFromInput = useCallback(() => {
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
    if (existingSubreddits.includes(name)) {
      setInputError('Already in your communities')
      return
    }
    if (selected.length >= 20) {
      setInputError('Selection limit reached (20 max)')
      return
    }
    setSelected(prev => [...prev, name])
    setQuery('')
    setInputError(null)
  }, [query, selected, existingSubreddits, normalizeName])

  const handleAdd = useCallback(async () => {
    if (selected.length === 0) return
    
    setAdding(true)
    setError(null)
    try {
      await onAdd(selected)
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Failed to add communities')
    } finally {
      setAdding(false)
    }
  }, [selected, onAdd, onClose])

  const visible: Suggestion[] = useMemo(() => {
    const q = normalizeName(query)
    const filtered: Suggestion[] = q
      ? suggestions.filter(s => s.name.toLowerCase().includes(q))
      : suggestions
    
    // Filter out existing subreddits
    const availableFiltered = filtered.filter(s => 
      !existingSubreddits.includes(s.name.toLowerCase())
    )
    
    const suggestionNames = new Set(availableFiltered.map(s => s.name.toLowerCase()))
    const selectedOnly: Suggestion[] = selected
      .filter(n => !suggestionNames.has(n.toLowerCase()))
      .map(n => ({ name: n }))
    
    return [...selectedOnly, ...availableFiltered]
  }, [suggestions, selected, query, existingSubreddits, normalizeName])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
              <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Communities</DialogTitle>
          <DialogDescription>
            Search for subreddits to add to your content sources. You can select up to 20 at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setInputError(null) }}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') { 
                    e.preventDefault(); 
                    addFromInput() 
                  } 
                }}
                placeholder="Search or add subreddit (e.g., r/typescript)"
                className="flex-1"
                disabled={adding}
              />
              <Button 
                onClick={addFromInput}
                variant="outline"
                size="sm"
                disabled={!query.trim() || adding}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {inputError && <p className="text-xs text-red-600 mt-2">{inputError}</p>}
          </div>

          {selected.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-700 mb-2">Selected ({selected.length}):</div>
              <div className="flex flex-wrap gap-2">
                {selected.map((name) => (
                  <div
                    key={name}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-sm"
                  >
                    <span>r/{name}</span>
                    <button
                      onClick={() => toggle(name)}
                      className="ml-1 hover:bg-gray-700 rounded-full p-0.5"
                      disabled={adding}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading suggestions...</span>
              </div>
            ) : visible.length === 0 && query.trim().length >= 2 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <p className="text-sm mb-3">No suggestions found for "{query}"</p>
                  <button
                    type="button"
                    onClick={addFromInput}
                    disabled={adding}
                    className="px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Add r/{query.trim().replace(/^\/?r\//i, '').toLowerCase()}
                  </button>
                </div>
              </div>
            ) : visible.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <p className="text-sm">Start typing to search for subreddits</p>
                  <p className="text-xs text-gray-400 mt-1">e.g., "technology", "programming", "startups"</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {visible.map((s) => {
                  const active = selected.includes(s.name)
                  const isExisting = existingSubreddits.includes(s.name.toLowerCase())
                  
                  if (isExisting) return null
                  
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => toggle(s.name)}
                      disabled={adding}
                      className={
                        `inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all select-none shrink-0 whitespace-nowrap disabled:opacity-50 hover:scale-[1.02] ` +
                        (active
                          ? 'border-black bg-black text-white shadow-sm transform scale-[1.02]'
                          : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm')
                      }
                    >
                      <span className={`h-2.5 w-2.5 rounded-full transition-colors ${active ? 'bg-white' : 'border border-current opacity-50'}`} />
                      <span className="font-medium truncate max-w-[12rem]">r/{s.name}</span>
                      {s.topic && (
                        <span className={`text-xs ${active ? 'text-gray-200' : 'text-gray-600'} hidden md:inline`}>
                          • {s.topic}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-700">
            {selected.length > 0 ? `${selected.length} selected` : 'No communities selected'}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={selected.length === 0 || adding}
            >
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selected.length} ${selected.length === 1 ? 'Community' : 'Communities'}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
