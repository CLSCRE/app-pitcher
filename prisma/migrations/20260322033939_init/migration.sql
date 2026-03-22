-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "brandVoice" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "valueProposition" TEXT NOT NULL,
    "budgetMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoScript" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "shotList" TEXT,
    "voiceoverText" TEXT,
    "duration" INTEGER,
    "heygenVideoId" TEXT,
    "heygenStatus" TEXT,
    "thumbnailUrl" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'draft',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAdCopy" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "adGroupName" TEXT NOT NULL,
    "headlines" TEXT NOT NULL,
    "descriptions" TEXT NOT NULL,
    "sitelinks" TEXT,
    "callouts" TEXT,
    "finalUrl" TEXT NOT NULL,
    "pathField1" TEXT,
    "pathField2" TEXT,
    "googleAdId" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'draft',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerClick" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAdCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoArticle" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "metaDescription" TEXT,
    "targetKeyword" TEXT NOT NULL,
    "secondaryKeywords" TEXT,
    "body" TEXT NOT NULL,
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readabilityGrade" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'draft',
    "publishedUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hashtags" TEXT,
    "mediaUrls" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "platformPostIds" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'draft',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "engagements" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationWorkflow" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" TEXT NOT NULL,
    "triggerConfig" TEXT,
    "steps" TEXT,
    "automationMode" TEXT NOT NULL DEFAULT 'semi-auto',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalQueueItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "videoScriptId" TEXT,
    "googleAdCopyId" TEXT,
    "seoArticleId" TEXT,
    "socialPostId" TEXT,

    CONSTRAINT "ApprovalQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "searchVolume" INTEGER NOT NULL DEFAULT 0,
    "difficulty" INTEGER NOT NULL DEFAULT 0,
    "cpc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentRank" INTEGER,
    "trend" TEXT,
    "trackedSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastChecked" TIMESTAMP(3),

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- AddForeignKey
ALTER TABLE "VideoScript" ADD CONSTRAINT "VideoScript_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAdCopy" ADD CONSTRAINT "GoogleAdCopy_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoArticle" ADD CONSTRAINT "SeoArticle_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationWorkflow" ADD CONSTRAINT "AutomationWorkflow_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalQueueItem" ADD CONSTRAINT "ApprovalQueueItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalQueueItem" ADD CONSTRAINT "ApprovalQueueItem_videoScriptId_fkey" FOREIGN KEY ("videoScriptId") REFERENCES "VideoScript"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalQueueItem" ADD CONSTRAINT "ApprovalQueueItem_googleAdCopyId_fkey" FOREIGN KEY ("googleAdCopyId") REFERENCES "GoogleAdCopy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalQueueItem" ADD CONSTRAINT "ApprovalQueueItem_seoArticleId_fkey" FOREIGN KEY ("seoArticleId") REFERENCES "SeoArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalQueueItem" ADD CONSTRAINT "ApprovalQueueItem_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
