import { prisma } from '../db'
import { type VoiceSummary } from './gemini.client'

export async function isFirstLogin(userId: string): Promise<boolean> {
  console.log('[onboarding] isFirstLogin', userId)
  // If VoiceProfile exists -> not first time
  const vp = await prisma.voiceProfile.findUnique({ where: { userId }, select: { id: true } })
  if (vp) return false

  // No onboarding flag on User model; use heuristic on createdAt
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } })
  if (!user) return false
  const ageMs = Date.now() - user.createdAt.getTime()
  // return ageMs <= 2 * 60 * 1000 // within 2 minutes
  return true;
}

export async function markOnboardingStarted(userId: string): Promise<void> {
  console.log('[onboarding] markOnboardingStarted', userId)
  // No explicit flag; presence of CronLock indicates in-progress. Ensure a placeholder user update to bump updatedAt.
  await prisma.user.update({ where: { id: userId }, data: { updatedAt: new Date() } })
}

export async function markOnboardingFailed(userId: string): Promise<void> {
  console.log('[onboarding] markOnboardingFailed', userId)
  await prisma.user.update({ where: { id: userId }, data: { updatedAt: new Date() } })
}

export async function saveVoiceProfile(userId: string, summary: VoiceSummary): Promise<void> {
  const trimmedExamples = (summary.examples || []).slice(0, 5)
  await prisma.voiceProfile.upsert({
    where: { userId },
    update: { rules: { ...summary, examples: trimmedExamples }, examples: trimmedExamples },
    create: { userId, rules: { ...summary, examples: trimmedExamples }, examples: trimmedExamples },
  })
}

export async function markOnboardingDone(userId: string): Promise<void> {
  // Presence of VoiceProfile is our completion marker; bump updatedAt to reflect completion timestamp semantics
  await prisma.user.update({ where: { id: userId }, data: { updatedAt: new Date() } })
}

export async function hasMinCommunities(userId: string, min: number): Promise<boolean> {
  const count = await prisma.userSubreddit.count({ where: { userId, isEnabled: true } })
  return count >= min
}


