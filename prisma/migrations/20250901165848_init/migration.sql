-- CreateEnum
CREATE TYPE "public"."SocialProvider" AS ENUM ('X', 'REDDIT');

-- CreateEnum
CREATE TYPE "public"."SourceProvider" AS ENUM ('REDDIT', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."DraftStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED', 'SCHEDULED', 'POSTED');

-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('SCHEDULED', 'POSTED', 'FAILED', 'CANCELED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."PostEventType" AS ENUM ('ENQUEUED', 'BUILD_PAYLOAD', 'ATTEMPT', 'SUCCESS', 'FAILURE', 'CANCEL');

-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "image" TEXT,
    "handle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "public"."SocialProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "scope" TEXT,
    "tokenType" TEXT,
    "expiresAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subreddit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subreddit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSubreddit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subredditId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubreddit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SourceItem" (
    "id" TEXT NOT NULL,
    "provider" "public"."SourceProvider" NOT NULL DEFAULT 'REDDIT',
    "externalId" TEXT,
    "url" TEXT,
    "title" TEXT,
    "author" TEXT,
    "subredditId" TEXT,
    "summary" TEXT,
    "content" JSONB,
    "score" INTEGER,
    "commentsCount" INTEGER,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Draft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceItemId" TEXT,
    "text" TEXT NOT NULL,
    "status" "public"."DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "score" DOUBLE PRECISION,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchedulePolicy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "postsPerDay" INTEGER NOT NULL DEFAULT 1,
    "preferredTimes" TEXT[],
    "daysOfWeek" "public"."DayOfWeek"[],
    "windowStart" INTEGER,
    "windowEnd" INTEGER,
    "nextRunAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchedulePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScheduledPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "draftId" TEXT,
    "status" "public"."PostStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "lockedAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "externalPostId" TEXT,
    "error" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostEvent" (
    "id" TEXT NOT NULL,
    "scheduledPostId" TEXT NOT NULL,
    "type" "public"."PostEventType" NOT NULL,
    "message" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MonthlyUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "postsAllotted" INTEGER NOT NULL DEFAULT 100,
    "postsScheduled" INTEGER NOT NULL DEFAULT 0,
    "postsPosted" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoiceProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "examples" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CronLock" (
    "key" TEXT NOT NULL,
    "owner" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronLock_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "SocialAccount_userId_idx" ON "public"."SocialAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_provider_providerAccountId_key" ON "public"."SocialAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Subreddit_name_key" ON "public"."Subreddit"("name");

-- CreateIndex
CREATE INDEX "Subreddit_name_idx" ON "public"."Subreddit"("name");

-- CreateIndex
CREATE INDEX "UserSubreddit_userId_idx" ON "public"."UserSubreddit"("userId");

-- CreateIndex
CREATE INDEX "UserSubreddit_subredditId_idx" ON "public"."UserSubreddit"("subredditId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubreddit_userId_subredditId_key" ON "public"."UserSubreddit"("userId", "subredditId");

-- CreateIndex
CREATE INDEX "SourceItem_subredditId_idx" ON "public"."SourceItem"("subredditId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceItem_provider_externalId_key" ON "public"."SourceItem"("provider", "externalId");

-- CreateIndex
CREATE INDEX "Draft_userId_status_idx" ON "public"."Draft"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SchedulePolicy_userId_key" ON "public"."SchedulePolicy"("userId");

-- CreateIndex
CREATE INDEX "ScheduledPost_status_scheduledFor_idx" ON "public"."ScheduledPost"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledPost_userId_scheduledFor_idx" ON "public"."ScheduledPost"("userId", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledPost_socialAccountId_externalPostId_key" ON "public"."ScheduledPost"("socialAccountId", "externalPostId");

-- CreateIndex
CREATE INDEX "PostEvent_scheduledPostId_idx" ON "public"."PostEvent"("scheduledPostId");

-- CreateIndex
CREATE INDEX "MonthlyUsage_userId_year_month_idx" ON "public"."MonthlyUsage"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyUsage_userId_year_month_key" ON "public"."MonthlyUsage"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceProfile_userId_key" ON "public"."VoiceProfile"("userId");

-- AddForeignKey
ALTER TABLE "public"."SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSubreddit" ADD CONSTRAINT "UserSubreddit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSubreddit" ADD CONSTRAINT "UserSubreddit_subredditId_fkey" FOREIGN KEY ("subredditId") REFERENCES "public"."Subreddit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SourceItem" ADD CONSTRAINT "SourceItem_subredditId_fkey" FOREIGN KEY ("subredditId") REFERENCES "public"."Subreddit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Draft" ADD CONSTRAINT "Draft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Draft" ADD CONSTRAINT "Draft_sourceItemId_fkey" FOREIGN KEY ("sourceItemId") REFERENCES "public"."SourceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchedulePolicy" ADD CONSTRAINT "SchedulePolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduledPost" ADD CONSTRAINT "ScheduledPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduledPost" ADD CONSTRAINT "ScheduledPost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "public"."SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduledPost" ADD CONSTRAINT "ScheduledPost_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."Draft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostEvent" ADD CONSTRAINT "PostEvent_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "public"."ScheduledPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MonthlyUsage" ADD CONSTRAINT "MonthlyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoiceProfile" ADD CONSTRAINT "VoiceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
