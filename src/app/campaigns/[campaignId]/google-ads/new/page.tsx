"use client";

import { useParams, useRouter } from "next/navigation";
import { GenerateForm } from "@/components/generate-form";
import { saveContent } from "@/lib/save-content";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewGoogleAdCopy() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params.campaignId as string;

  async function handleSave(content: string, formData: Record<string, string>) {
    await saveContent("google-ad", campaignSlug, {
      adGroupName: formData.adGroupName || "General",
      landingUrl: formData.landingUrl,
      headlines: JSON.stringify(
        (content.match(/^\d+\.\s+(.+)/gm) || []).slice(0, 15).map((h) => h.replace(/^\d+\.\s+/, ""))
      ),
      descriptions: JSON.stringify([]),
    }, content);
    router.push(`/campaigns/${campaignSlug}/google-ads`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/campaigns/${campaignSlug}/google-ads`}
          className="rounded-md p-1.5 transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate Google Ads Copy</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered Responsive Search Ad generator
          </p>
        </div>
      </div>

      <GenerateForm
        title="Ad Copy Settings"
        description="Configure your ad group and targeting keywords"
        apiEndpoint="/api/ai/generate-ad-copy"
        campaignSlug={campaignSlug}
        onSave={handleSave}
        fields={[
          {
            name: "adGroupName",
            label: "Ad Group Name",
            type: "text",
            placeholder: "e.g., Land Investing - General",
            required: true,
          },
          {
            name: "targetKeywords",
            label: "Target Keywords",
            type: "textarea",
            placeholder: "e.g., land investing, how to invest in land, land investment calculator",
          },
          {
            name: "landingUrl",
            label: "Landing Page URL",
            type: "text",
            placeholder: "https://yourapp.com/landing-page",
          },
        ]}
      />
    </div>
  );
}
