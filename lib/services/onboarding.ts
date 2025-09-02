// // import { prisma } from "../db"
import { type VoiceSummary } from './gemini.client'

export async function isFirstLogin(userId: string): Promise<boolean> {
  console.log('[onboarding] isFirstLogin', userId)
  // TODO: Re-implement using backend API instead of Prisma
  // If VoiceProfile exists -> not first time
  // const vp = await prisma.voiceProfile.findUnique({ where: { userId }, select: { id: true } })
  // if (vp) return false

  // // No onboarding flag on User model; use heuristic on createdAt
  // const user = await prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } })
  // if (!user) return false
  // const ageMs = Date.now() - user.createdAt.getTime()
  // // return ageMs <= 2 * 60 * 1000 // within 2 minutes
  // return true;

  // Temporary mock response until backend API is implemented
  console.log(`[onboarding] isFirstLogin temporarily disabled - using backend API instead: ${userId}`)
  return false
}

export async function markOnboardingStarted(userId: string): Promise<void> {
  console.log('[onboarding] markOnboardingStarted', userId)
  // TODO: Re-implement using backend API instead of Prisma
  // No explicit flag; presence of CronLock indicates in-progress. Ensure a placeholder user update to bump updatedAt.
  // await prisma.user.update({ where: { id: userId }, data: { updatedAt: new Date() } })
  
  console.log(`[onboarding] markOnboardingStarted temporarily disabled - using backend API instead: ${userId}`)
}

export async function markOnboardingFailed(userId: string): Promise<void> {
  console.log('[onboarding] markOnboardingFailed', userId)
  // TODO: Re-implement using backend API instead of Prisma
  // await prisma.user.update({ where: { id: userId }, data: { updatedAt: new Date() } })
  
  console.log(`[onboarding] markOnboardingFailed temporarily disabled - using backend API instead: ${userId}`)
}

export async function saveVoiceProfile(userId: string, summary: VoiceSummary): Promise<void> {
  // TODO: Re-implement using backend API instead of Prisma
  // const trimmedExamples = (summary.examples || []).slice(0, 5)
  // await prisma.voiceProfile.upsert({
  //   where: { userId },
  //   update: { rules: { ...summary, examples: trimmedExamples }, examples: trimmedExamples },
  //   create: { userId, rules: { ...summary, examples: trimmedExamples }, examples: trimmedExamples },
  // })
  
  console.log(`[onboarding] saveVoiceProfile temporarily disabled - using backend API instead: ${userId}`)
}

export async function markOnboardingDone(userId: string): Promise<void> {
  // TODO: Re-implement using backend API instead of Prisma
  // Presence of VoiceProfile is our completion marker; bump updatedAt to reflect completion timestamp semantics
  // await prisma.user.update({ where: { id: userId }, data: { updatedAt: new Date() } })
  
  console.log(`[onboarding] markOnboardingDone temporarily disabled - using backend API instead: ${userId}`)
}

export async function hasMinCommunities(userId: string, min: number): Promise<boolean> {
  // TODO: Re-implement using backend API instead of Prisma
  // const count = await prisma.userSubreddit.count({ where: { userId, isEnabled: true } })
  // return count >= min
  
  console.log(`[onboarding] hasMinCommunities temporarily disabled - using backend API instead: ${userId}, ${min}`)
  return false
}


