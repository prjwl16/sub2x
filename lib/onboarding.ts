// import { prisma } from "../db"
import { isFirstLogin, markOnboardingDone, markOnboardingStarted, saveVoiceProfile } from './services/onboarding'
import { fetchTweetsLastN } from './services/x.client'
import { summarizeVoice, type VoiceSummary } from './services/gemini.client'

async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  const now = Date.now()
  const expiresAt = new Date(now + ttlMs)
  
  // TODO: Re-implement using backend API instead of Prisma
  // try {
  //   await prisma.cronLock.create({ data: { key, owner: 'onboarding', expiresAt } })
  // } catch (e) {
  //   // Lock exists; check expiry and opportunistically take over if expired
  //   const existing = await prisma.cronLock.findUnique({ where: { key } })
  //   if (!existing) return null
  //   if (existing.expiresAt.getTime() > now) return null
  //   await prisma.cronLock.update({ where: { key }, data: { expiresAt } })
  // }

  try {
    const result = await fn()
    return result
  } finally {
    // Best-effort release; ignore errors
    // try { await prisma.cronLock.delete({ where: { key } }) } catch {}
  }
}

export async function processUserFirstLogin(userId: string): Promise<void> {
  if (!userId) return

  // Quick pre-check to avoid unnecessary work
  // const firstPre = await isFirstLogin(userId)
  // if (!firstPre) return

  // TODO: Re-implement using backend API instead of Prisma
  // await withLock(`onboarding:${userId}`, 60_000, async () => {
  //   // Recheck after lock to ensure idempotency
  //   // const first = await isFirstLogin(userId)
  //   // if (!first) return

  //   await markOnboardingStarted(userId)

  //   let tweets: { id: string; text: string; createdAt: string }[] = []
  //   try {
  //     tweets = await fetchTweetsLastN({ userId, n: 20 })
  //   } catch (err) {
  //     console.error('[onboarding] fetchTweetsLastN failed', err)
  //   }

  //   const summary = await summarizeVoice({ tweets })

  //   console.log('[onboarding] summary', summary)

  //   if (summary) {
  //     try {
  //       await saveVoiceProfile(userId, summary)
  //       await markOnboardingDone(userId)
  //     } catch (err) {
  //       console.error('[onboarding] saveVoiceProfile failed', err)
  //     }
  //   }

  //   return
  // })

  console.log('[onboarding] processUserFirstLogin temporarily disabled - using backend API instead')
}


