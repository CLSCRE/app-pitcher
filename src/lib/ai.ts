import { openai } from "@ai-sdk/openai";

export const model = openai("gpt-4o-mini");

export function buildSystemPrompt(campaign: {
  name: string;
  appName: string;
  industry: string;
  brandVoice: string;
  targetAudience: string;
  valueProposition: string;
}) {
  const audience = (() => {
    try { return JSON.parse(campaign.targetAudience); }
    catch { return { demographics: "General audience" }; }
  })();

  return `You are an expert marketing copywriter for ${campaign.appName}.

BRAND: ${campaign.appName}
INDUSTRY: ${campaign.industry}
BRAND VOICE: ${campaign.brandVoice}
VALUE PROPOSITION: ${campaign.valueProposition}

TARGET AUDIENCE:
- Demographics: ${audience.demographics || "Not specified"}
- Pain Points: ${audience.painPoints?.join(", ") || "Not specified"}
- Goals: ${audience.goals?.join(", ") || "Not specified"}

Always write in the brand voice described above. Focus on the target audience's pain points and goals. Make the value proposition clear and compelling.`;
}
