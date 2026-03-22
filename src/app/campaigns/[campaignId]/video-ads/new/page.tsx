"use client";

import { useParams, useRouter } from "next/navigation";
import { GenerateForm } from "@/components/generate-form";
import { saveContent } from "@/lib/save-content";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewVideoScript() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params.campaignId as string;

  async function handleSave(content: string, formData: Record<string, string>) {
    await saveContent("video-script", campaignSlug, {
      title: content.match(/TITLE:\s*(.+)/)?.[1] || "Untitled Script",
      style: formData.style || "corgi-commercial",
      duration: formData.duration || "30",
    }, content);
    router.push(`/campaigns/${campaignSlug}/video-ads`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/campaigns/${campaignSlug}/video-ads`}
          className="rounded-md p-1.5 transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate Video Script</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered video ad script generator
          </p>
        </div>
      </div>

      <GenerateForm
        title="Script Settings"
        description="Configure the style and angle for your video ad"
        apiEndpoint="/api/ai/generate-script"
        campaignSlug={campaignSlug}
        onSave={handleSave}
        fields={[
          {
            name: "style",
            label: "Video Style",
            type: "select",
            required: true,
            options: [
              { value: "corgi-commercial", label: "Corgi Commercial (Humorous, Narrative)" },
              { value: "heygen-avatar", label: "HeyGen Avatar (Professional Talking Head)" },
              { value: "screen-capture", label: "Screen Capture (Product Demo)" },
            ],
          },
          {
            name: "duration",
            label: "Duration (seconds)",
            type: "select",
            options: [
              { value: "15", label: "15 seconds (Quick hook)" },
              { value: "30", label: "30 seconds (Standard)" },
              { value: "60", label: "60 seconds (Extended)" },
            ],
          },
          {
            name: "angle",
            label: "Creative Angle / Focus",
            type: "textarea",
            placeholder: "e.g., Focus on the pain of missing investment opportunities, highlight the AI calculator feature, emphasize passive income...",
          },
        ]}
      />
    </div>
  );
}
