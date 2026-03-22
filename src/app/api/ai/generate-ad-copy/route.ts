import { streamText } from "ai";
import { model, buildSystemPrompt } from "@/lib/ai";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { campaignSlug, adGroupName, targetKeywords, landingUrl } = await req.json();

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

GOOGLE ADS RESPONSIVE SEARCH AD (RSA) GUIDELINES:
- Generate exactly 10 headlines (max 30 characters each, STRICTLY enforced)
- Generate exactly 3 descriptions (max 90 characters each, STRICTLY enforced)
- Headlines should be varied: include benefit-focused, action-oriented, feature-based, and urgency-driven variants
- Descriptions should expand on different value propositions
- Include natural keyword integration without keyword stuffing
- Each headline and description must stand alone AND work together in any combination`,
    prompt: `Generate Google Ads Responsive Search Ad copy for ${campaign.appName}.

Ad Group: ${adGroupName || "General"}
Target Keywords: ${targetKeywords || "based on the app's core value proposition"}
Landing URL: ${landingUrl || campaign.valueProposition}

Format your response EXACTLY as:
AD GROUP: ${adGroupName || "General"}
LANDING URL: ${landingUrl || "https://example.com"}

HEADLINES:
1. [headline - max 30 chars]
2. [headline - max 30 chars]
3. [headline - max 30 chars]
4. [headline - max 30 chars]
5. [headline - max 30 chars]
6. [headline - max 30 chars]
7. [headline - max 30 chars]
8. [headline - max 30 chars]
9. [headline - max 30 chars]
10. [headline - max 30 chars]

DESCRIPTIONS:
1. [description - max 90 chars]
2. [description - max 90 chars]
3. [description - max 90 chars]

KEYWORD ALIGNMENT:
- [How each headline group targets specific search intent]

A/B TESTING NOTES:
- [Which headline combinations to test first and why]`,
  });

  return result.toTextStreamResponse();
}
