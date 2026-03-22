"use client";

import { useParams, useRouter } from "next/navigation";
import { GenerateForm } from "@/components/generate-form";
import { saveContent } from "@/lib/save-content";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSocialPost() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params.campaignId as string;

  async function handleSave(content: string, formData: Record<string, string>) {
    const platforms = formData.platforms
      ? formData.platforms.split(",").map((p) => p.trim())
      : ["instagram", "linkedin", "x"];
    await saveContent("social-post", campaignSlug, {
      platforms: JSON.stringify(platforms),
    }, content);
    router.push(`/campaigns/${campaignSlug}/social`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/campaigns/${campaignSlug}/social`}
          className="rounded-md p-1.5 transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate Social Posts</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered multi-platform content from a single brief
          </p>
        </div>
      </div>

      <GenerateForm
        title="Social Post Settings"
        description="Describe your post and select platforms"
        apiEndpoint="/api/ai/generate-social"
        campaignSlug={campaignSlug}
        onSave={handleSave}
        fields={[
          {
            name: "topic",
            label: "Topic / Angle",
            type: "textarea",
            placeholder: "e.g., Announce new feature launch, share a customer success story, promote a limited-time offer...",
            required: true,
          },
          {
            name: "platforms",
            label: "Platforms (comma separated)",
            type: "text",
            placeholder: "instagram, linkedin, x, facebook, tiktok",
          },
          {
            name: "tone",
            label: "Tone Override",
            type: "select",
            options: [
              { value: "", label: "Use brand voice (default)" },
              { value: "casual", label: "Casual & Fun" },
              { value: "professional", label: "Professional & Polished" },
              { value: "urgent", label: "Urgent & Action-oriented" },
              { value: "educational", label: "Educational & Informative" },
              { value: "inspirational", label: "Inspirational & Motivational" },
            ],
          },
        ]}
      />
    </div>
  );
}
