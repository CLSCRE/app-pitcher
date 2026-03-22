import { streamText } from "ai";
import { model, buildSystemPrompt } from "@/lib/ai";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { campaignSlug, platforms, topic, tone } = await req.json();

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignSlug },
  });

  if (!campaign) {
    return new Response("Campaign not found", { status: 404 });
  }

  const systemPrompt = buildSystemPrompt(campaign);
  const selectedPlatforms = platforms || ["instagram", "linkedin", "x"];

  const result = streamText({
    model,
    system: `${systemPrompt}

SOCIAL MEDIA CONTENT GUIDELINES:
- Adapt tone and length for each platform
- Instagram: visual-first, use line breaks, emojis sparingly, 5-10 relevant hashtags
- LinkedIn: professional but personable, longer form OK, 3-5 hashtags, value-driven
- X (Twitter): punchy, conversational, max 280 chars for main post, 2-3 hashtags
- Facebook: conversational, medium length, engagement-focused questions
- TikTok: trendy, casual, hook-first, reference video format ideas`,
    prompt: `Generate social media posts for ${campaign.appName} across these platforms: ${selectedPlatforms.join(", ")}.

Topic/Angle: ${topic || "Highlight the core value proposition and drive app downloads"}
Tone: ${tone || "Match the brand voice"}

For EACH platform, provide:

---
PLATFORM: [platform name]

POST:
[The post content, properly formatted for the platform]

HASHTAGS: [relevant hashtags]

BEST TIME TO POST: [suggested day/time]

IMAGE SUGGESTION: [description of ideal accompanying image or graphic]

---

After all platform posts, include:

CONTENT CALENDAR NOTE:
- [When to post each version for maximum reach]
- [Which post to boost/promote if budget allows]
- [Engagement strategy: what to reply when people comment]`,
  });

  return new Response(result.textStream.pipeThrough(new TextEncoderStream()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
