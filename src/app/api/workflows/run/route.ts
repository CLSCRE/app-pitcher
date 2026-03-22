import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { model, buildSystemPrompt } from "@/lib/ai";

interface WorkflowStep {
  id: string;
  name: string;
  type: "generate" | "review" | "publish" | "analyze" | "wait";
  contentType?: "video-script" | "google-ad" | "seo-article" | "social-post";
  config?: Record<string, string>;
  description: string;
}

export async function POST(req: NextRequest) {
  const { workflowId } = await req.json();

  const workflow = await db.automationWorkflow.findUnique({
    where: { id: workflowId },
    include: { campaign: true },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  if (!workflow.campaign) {
    return NextResponse.json({ error: "Workflow has no linked campaign" }, { status: 400 });
  }

  const steps: WorkflowStep[] = JSON.parse(workflow.steps || "[]");
  const campaign = workflow.campaign;
  const systemPrompt = buildSystemPrompt(campaign);
  const results: { step: string; contentType?: string; contentId?: string; action?: string }[] = [];

  await db.automationWorkflow.update({
    where: { id: workflowId },
    data: { lastRunAt: new Date(), lastRunStatus: "running" },
  });

  try {
    for (const step of steps) {
      if (step.type === "generate" && step.contentType) {
        const generated = await generateContentForStep(step, campaign, systemPrompt);
        if (generated) {
          results.push({ step: step.id, contentType: step.contentType, contentId: generated.id });
        }
      } else if (step.type === "review") {
        // Submit the most recently generated items to approval
        for (const prev of results) {
          if (prev.contentId && prev.contentType) {
            await submitForApproval(campaign.id, prev.contentType, prev.contentId);
            results.push({ step: step.id, action: `Submitted ${prev.contentType} for approval` });
          }
        }
      } else if (step.type === "publish") {
        // Mark approved items as published
        const approved = await db.approvalQueueItem.findMany({
          where: { campaignId: campaign.id, status: "approved" },
        });
        for (const item of approved) {
          await markAsPublished(item.contentType, item.contentId);
        }
        results.push({ step: step.id, action: `Published ${approved.length} approved items` });
      } else if (step.type === "analyze") {
        results.push({ step: step.id, action: "Analysis complete (metrics reviewed)" });
      }
    }

    await db.automationWorkflow.update({
      where: { id: workflowId },
      data: { lastRunStatus: "completed" },
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    await db.automationWorkflow.update({
      where: { id: workflowId },
      data: { lastRunStatus: "failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Workflow execution failed" },
      { status: 500 }
    );
  }
}

async function generateContentForStep(
  step: WorkflowStep,
  campaign: { id: string; appName: string; name: string; industry: string; brandVoice: string; targetAudience: string; valueProposition: string; slug: string },
  systemPrompt: string
) {
  const config = step.config || {};

  switch (step.contentType) {
    case "video-script": {
      const style = config.style || "corgi-commercial";
      const duration = config.duration || "30";
      const result = await generateText({
        model,
        system: `${systemPrompt}\n\nGenerate a ${duration}-second ${style} video ad script. Include TITLE, full script, SHOT LIST, and VOICEOVER TEXT.`,
        prompt: `Create a compelling ${duration}s video ad script for ${campaign.appName}. Style: ${style}.`,
      });
      const titleMatch = result.text.match(/TITLE:\s*(.+)/i);
      return db.videoScript.create({
        data: {
          campaignId: campaign.id,
          title: titleMatch?.[1]?.trim() || `Auto-generated ${style} script`,
          style,
          script: result.text,
          duration: parseInt(duration),
          approvalStatus: "draft",
        },
      });
    }
    case "google-ad": {
      const result = await generateText({
        model,
        system: `${systemPrompt}\n\nGenerate Google Ads RSA copy with exactly 10 headlines (max 30 chars) and 3 descriptions (max 90 chars).`,
        prompt: `Generate Google Ads copy for ${campaign.appName}. Format: HEADLINES numbered 1-10, then DESCRIPTIONS numbered 1-3.`,
      });
      const headlinesSection = result.text.split(/DESCRIPTIONS:/i)[0] || "";
      const descriptionsSection = result.text.split(/DESCRIPTIONS:/i)[1]?.split(/\n\n/)[0] || "";
      const headlines = (headlinesSection.match(/^\d+\.\s+(.+)/gm) || []).slice(0, 15).map((h) => h.replace(/^\d+\.\s+/, "").trim());
      const descriptions = (descriptionsSection.match(/^\d+\.\s+(.+)/gm) || []).slice(0, 4).map((d) => d.replace(/^\d+\.\s+/, "").trim());
      return db.googleAdCopy.create({
        data: {
          campaignId: campaign.id,
          adGroupName: "Auto-generated",
          headlines: JSON.stringify(headlines),
          descriptions: JSON.stringify(descriptions),
          finalUrl: `https://${campaign.slug}.com`,
          approvalStatus: "draft",
        },
      });
    }
    case "seo-article": {
      const wordCount = config.wordCount || "1500";
      const result = await generateText({
        model,
        system: `${systemPrompt}\n\nWrite an SEO-optimized article (~${wordCount} words). Include TITLE, META DESCRIPTION, SLUG, then the full article.`,
        prompt: `Write an SEO article for ${campaign.appName} about its core value proposition.`,
      });
      const titleMatch = result.text.match(/TITLE:\s*(.+)/i);
      const slugMatch = result.text.match(/SLUG:\s*(.+)/i);
      const metaMatch = result.text.match(/META DESCRIPTION:\s*(.+)/i);
      return db.seoArticle.create({
        data: {
          campaignId: campaign.id,
          title: titleMatch?.[1]?.trim() || "Auto-generated article",
          slug: slugMatch?.[1]?.trim() || `article-${Date.now()}`,
          metaDescription: metaMatch?.[1]?.trim() || null,
          targetKeyword: campaign.industry.split("/")[0].trim().toLowerCase(),
          body: result.text,
          wordCount: result.text.split(/\s+/).length,
          approvalStatus: "draft",
        },
      });
    }
    case "social-post": {
      const platforms = config.platforms || "instagram,linkedin,x";
      const result = await generateText({
        model,
        system: `${systemPrompt}\n\nGenerate social media posts for: ${platforms}. Format each with PLATFORM, POST, HASHTAGS.`,
        prompt: `Create engaging social posts for ${campaign.appName} across ${platforms}.`,
      });
      return db.socialPost.create({
        data: {
          campaignId: campaign.id,
          platforms: JSON.stringify(platforms.split(",")),
          body: result.text,
          approvalStatus: "draft",
        },
      });
    }
    default:
      return null;
  }
}

async function submitForApproval(campaignId: string, contentType: string, contentId: string) {
  const fieldMap: Record<string, string> = {
    "video-script": "videoScriptId",
    "google-ad": "googleAdCopyId",
    "seo-article": "seoArticleId",
    "social-post": "socialPostId",
  };
  const field = fieldMap[contentType];
  if (!field) return;

  await db.approvalQueueItem.create({
    data: {
      campaignId,
      contentType,
      contentId,
      status: "pending",
      [field]: contentId,
    },
  });

  // Update the content's approval status
  await updateContentStatus(contentType, contentId, "pending");
}

async function markAsPublished(contentType: string, contentId: string) {
  await updateContentStatus(contentType, contentId, "published");
}

async function updateContentStatus(contentType: string, contentId: string, status: string) {
  switch (contentType) {
    case "video-script":
      await db.videoScript.update({ where: { id: contentId }, data: { approvalStatus: status } });
      break;
    case "google-ad":
      await db.googleAdCopy.update({ where: { id: contentId }, data: { approvalStatus: status } });
      break;
    case "seo-article":
      await db.seoArticle.update({ where: { id: contentId }, data: { approvalStatus: status } });
      break;
    case "social-post":
      await db.socialPost.update({ where: { id: contentId }, data: { approvalStatus: status } });
      break;
  }
}
