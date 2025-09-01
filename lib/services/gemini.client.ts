import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ---------- Types ----------
export interface VoiceSummary {
  version: number
  model: string
  tone: string
  cadence: { avgChars: number; sentences: 'one' | 'two'; questionRate: number; exclaimRate: number }
  emoji: { allowed: boolean; maxPerTweet: number; position?: 'end' | 'inline' | 'none' }
  hashtags: { frequency: 'rare' | 'sometimes' | 'often'; position?: 'end' | 'inline'; whitelist?: string[] }
  lexicon: { prefer: string[]; avoid: string[]; hedges?: string[] }
  structure: string[]
  topics: string[]
  engagementHints: string[]
  safety: string[]
  examples: { text: string; note?: string }[]
}

export interface XTweet {
  id: string
  text: string
  createdAt: string
  publicMetrics?: { likeCount?: number; replyCount?: number; retweetCount?: number; bookmarkCount?: number }
}

// ---------- Zod ----------
const VoiceSummarySchema = z.object({
  version: z.number(),
  model: z.string(),
  tone: z.string(),
  cadence: z.object({
    avgChars: z.number(),
    sentences: z.union([z.literal('one'), z.literal('two')]),
    questionRate: z.number().min(0).max(1),
    exclaimRate: z.number().min(0).max(1),
  }),
  emoji: z.object({
    allowed: z.boolean(),
    maxPerTweet: z.number().min(0),
    position: z.union([z.literal('end'), z.literal('inline'), z.literal('none')]).optional(),
  }),
  hashtags: z.object({
    frequency: z.union([z.literal('rare'), z.literal('sometimes'), z.literal('often')]),
    position: z.union([z.literal('end'), z.literal('inline')]).optional(),
    whitelist: z.array(z.string()).optional(),
  }),
  lexicon: z.object({
    prefer: z.array(z.string()),
    avoid: z.array(z.string()),
    hedges: z.array(z.string()).optional(),
  }),
  structure: z.array(z.string()),
  topics: z.array(z.string()),
  engagementHints: z.array(z.string()),
  safety: z.array(z.string()),
  examples: z.array(z.object({ text: z.string().optional().nullable(), note: z.string().optional().nullable() })),
})

// ---------- Prompt ----------
export const VOICE_SUMMARY_SYSTEM_PROMPT = `You are an expert writing style analyst. Given a user's recent tweets (text only), produce a compact JSON profile of their voice.
Rules:
- Do not return markdown, code blocks, or explanations.
- Output valid JSON matching the VoiceSummary TypeScript interface (no extra keys).
- Summarize: tone (concise adjectives), cadence (avg chars; one or two sentences typical; question/exclamation rates as decimals 0..1), emoji (allowed, maxPerTweet, typical position), hashtags (frequency & position; whitelist if any), lexicon (prefer/avoid/hedges arrays), structure rules, top topics (3–5), engagementHints (specific, actionable), safety rails.
- Provide 3-5 short, PARAPHRASED example tweets (not quotes from input), capturing their style. Keep them under 200 chars.
- Do NOT copy or quote or reference usernames or links from the input.
- Keep it model-neutral and safe.
- Do not return null values for any fields. Instead, return empty arrays or strings.
- below is the zod schema for the json you should return, do not deviate from it in any way.
  z.object({
  version: z.number(),
  model: z.string(),
  tone: z.string(),
  cadence: z.object({
    avgChars: z.number(),
    sentences: z.union([z.literal('one'), z.literal('two')]),
    questionRate: z.number().min(0).max(1),
    exclaimRate: z.number().min(0).max(1),
  }),
  emoji: z.object({
    allowed: z.boolean(),
    maxPerTweet: z.number().min(0),
    position: z.union([z.literal('end'), z.literal('inline'), z.literal('none')]).optional(),
  }),
  hashtags: z.object({
    frequency: z.union([z.literal('rare'), z.literal('sometimes'), z.literal('often')]),
    position: z.union([z.literal('end'), z.literal('inline')]).optional(),
    whitelist: z.array(z.string()).optional(),
  }),
  lexicon: z.object({
    prefer: z.array(z.string()),
    avoid: z.array(z.string()),
    hedges: z.array(z.string()).optional(),
  }),
  structure: z.array(z.string()),
  topics: z.array(z.string()),
  engagementHints: z.array(z.string()),
  safety: z.array(z.string()),
  examples: z.array(z.object({ text: z.string().optional().nullable(), note: z.string().optional().nullable() })),
})
Return ONLY the JSON. No prose.`



// ---------- Utils ----------
function sanitizeTweetText(input: string): string {
  const noUrls = input.replace(/https?:\/\/\S+/g, '')
  const noMentions = noUrls.replace(/[@#][\w_]+/g, '')
  return noMentions.replace(/\s+/g, ' ').trim()
}

function clampExamples(examples: { text: string; note?: string }[], max: number = 5) {
  return examples.slice(0, max).map(e => ({
    text: e.text.slice(0, 240),
    note: e.note ? e.note.slice(0, 240) : undefined,
  }))
}

function extractJson(raw: string): unknown {
  // Try plain JSON first
  try {
    return JSON.parse(raw)
  } catch {}

  // Try fenced ```json ... ``` blocks
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) {
    try {
      return JSON.parse(fenced[1])
    } catch {}
  }

  // Fallback: slice between first { and last }
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1))
    } catch {}
  }

  throw new Error('Unable to parse JSON from model output')
}


// ---------- Client (lazy) ----------
function getModel() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  const genAI = new GoogleGenerativeAI(apiKey)
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash' // or 'gemini-1.5-pro'
  return genAI.getGenerativeModel({ model: modelName })
}

/** Summarize voice from recent tweets. */
export async function summarizeVoice(input: { tweets: XTweet[]; locale?: string }): Promise<VoiceSummary | null> {
  const model = getModel()

  // Pre-clean for prompt
  const cleaned = input.tweets.map(t => `- ${sanitizeTweetText(t.text)}`).join('\n')
  const localeLine = input.locale ? `\nLocale: ${input.locale}` : ''
  const prompt = `${VOICE_SUMMARY_SYSTEM_PROMPT}\n\nTweets (cleaned):\n${cleaned || '-'}${localeLine}`

  if (!model) {
    console.warn('GEMINI_API_KEY missing; summarizeVoice returning null fallback.')
    return null
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1200,
      },
    })

    const rawText = result.response.text()
    let parsed = extractJson(rawText)
    const validated = VoiceSummarySchema.parse(parsed) as VoiceSummary
    return validated
  } catch (err) {
    console.warn('summarizeVoice: Gemini call failed:', err)
    return null
  }
}
