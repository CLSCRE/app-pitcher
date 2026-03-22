import { streamText } from "ai";
import { model, buildSystemPrompt } from "@/lib/ai";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { campaignSlug, style, angle, duration } = await req.json();

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignSlug },
  });

  if (!campaign) {
    return new Response("Campaign not found", { status: 404 });
  }

  const systemPrompt = buildSystemPrompt(campaign);

  const styleGuide =
    style === "corgi-commercial"
      ? `Write a humorous, narrative-driven video ad script featuring Cooper the Corgi as the mascot.
The script should be formatted with scene headings (e.g., [SCENE 1 - INT. LIVING ROOM - DAY]),
action lines, narrator voiceover (NARRATOR V.O.), and a final call-to-action super.
The tone should be warm, funny, and relatable. Cooper should be the star — doing human-like things that relate to the product's benefits.`
      : style === "heygen-avatar"
        ? `Write a professional talking-head video script for an AI avatar (HeyGen style).
Format with clear sections: INTRO, PROBLEM, SOLUTION, FEATURES (2-3), SOCIAL PROOF, CTA.
Each section should have the avatar's dialogue written in a natural, conversational tone.
Include [SLIDE CUE: description] markers where supporting visuals should appear.`
        : `Write a screen-capture product demo video script.
Format with NARRATOR voiceover paired with [SCREEN: description of what's shown].
Walk through the key features of the app step by step.
Keep it practical and benefit-focused.`;

  const result = streamText({
    model,
    system: `${systemPrompt}

VIDEO AD SCRIPT GUIDELINES:
${styleGuide}

Target duration: ${duration || 30} seconds.
Keep the script tight and impactful. Every second counts in a video ad.`,
    prompt: `Generate a ${duration || 30}-second ${style.replace("-", " ")} video ad script for ${campaign.appName}.

${angle ? `Creative angle/focus: ${angle}` : "Choose the most compelling angle based on the target audience's biggest pain point."}

Include:
1. A compelling hook in the first 3 seconds
2. The core problem/solution narrative
3. A clear call-to-action
4. Shot list with timing for each scene

Format the output as:
TITLE: [catchy title for this script]
STYLE: ${style}
DURATION: ${duration || 30}s

---

[Full formatted script]

---

SHOT LIST:
- [Scene description] - [duration]
- ...

VOICEOVER TEXT:
[Clean voiceover text without stage directions, suitable for recording]`,
  });

  return result.toTextStreamResponse();
}
