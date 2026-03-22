-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "brandVoice" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "valueProposition" TEXT NOT NULL,
    "budgetMonthly" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VideoScript" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoScript_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoogleAdCopy" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "ctr" REAL NOT NULL DEFAULT 0,
    "costPerClick" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GoogleAdCopy_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeoArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeoArticle_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hashtags" TEXT,
    "mediaUrls" TEXT,
    "scheduledAt" DATETIME,
    "publishedAt" DATETIME,
    "platformPostIds" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'draft',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "engagements" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialPost_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AutomationWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" TEXT NOT NULL,
    "triggerConfig" TEXT,
    "steps" TEXT,
    "automationMode" TEXT NOT NULL DEFAULT 'semi-auto',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" DATETIME,
    "lastRunStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AutomationWorkflow_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovalQueueItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewerNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "videoScriptId" TEXT,
    "googleAdCopyId" TEXT,
    "seoArticleId" TEXT,
    "socialPostId" TEXT,
    CONSTRAINT "ApprovalQueueItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApprovalQueueItem_videoScriptId_fkey" FOREIGN KEY ("videoScriptId") REFERENCES "VideoScript" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ApprovalQueueItem_googleAdCopyId_fkey" FOREIGN KEY ("googleAdCopyId") REFERENCES "GoogleAdCopy" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ApprovalQueueItem_seoArticleId_fkey" FOREIGN KEY ("seoArticleId") REFERENCES "SeoArticle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ApprovalQueueItem_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "searchVolume" INTEGER NOT NULL DEFAULT 0,
    "difficulty" INTEGER NOT NULL DEFAULT 0,
    "cpc" REAL NOT NULL DEFAULT 0,
    "currentRank" INTEGER,
    "trend" TEXT,
    "trackedSince" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastChecked" DATETIME,
    CONSTRAINT "Keyword_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");
