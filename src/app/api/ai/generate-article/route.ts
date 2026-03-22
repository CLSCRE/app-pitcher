import { streamText } from "ai";
import { model, buildSystemPrompt } from "@/lib/ai";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { campaignSlug, targetKeyword, secondaryKeywords, articleType, wordCount } = await req.json();

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignSlug },
  });

  if (!campaign) {
    return new Response("Campaign not found", { status: 404 });
  }

  const systemPrompt = buildSystemPrompt(campaign);

  const result = streamText({
    model,
    system: `${systemPrompt}

SEO CONTENT WRITING GUIDELINES:
- Write in a natural, engaging style that matches the brand voice
- Use proper heading hierarchy (H1 > H2 > H3)
- Include the target keyword naturally in the title, first paragraph, and 2-3 subheadings
- Include secondary keywords naturally throughout
- Write scannable content with short paragraphs (2-3 sentences max)
- Include actionable takeaways and specific examples
- End with a clear CTA that drives to the app
- Aim for a Flesch reading score of 60-70 (conversational but informative)`,
    prompt: `Write a ${wordCount || 1500}-word SEO-optimized ${articleType || "blog post"} for ${campaign.appName}.

Target Keyword: ${targetKeyword}
Secondary Keywords: ${secondaryKeywords || "related terms based on the target keyword"}

Format your response as:

TITLE: [SEO-optimized title including target keyword]
META DESCRIPTION: [155 characters max, compelling and keyword-rich]
SLUG: [url-friendly-slug]

---

[Full article with proper markdown heading hierarchy]

---

SEO CHECKLIST:
- Target keyword density: [X%]
- Secondary keywords used: [list]
- Internal link opportunities: [suggestions]
- Schema markup type: [Article/HowTo/FAQ]
- Estimated reading time: [X minutes]`,
  });

  return result.toTextStreamResponse();
}
