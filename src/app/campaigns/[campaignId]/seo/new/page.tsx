"use client";

import { useParams, useRouter } from "next/navigation";
import { GenerateForm } from "@/components/generate-form";
import { saveContent } from "@/lib/save-content";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSeoArticle() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params.campaignId as string;

  async function handleSave(content: string, formData: Record<string, string>) {
    await saveContent("seo-article", campaignSlug, {
      title: content.match(/TITLE:\s*(.+)/)?.[1] || "Untitled Article",
      slug: content.match(/SLUG:\s*(.+)/)?.[1] || "untitled",
      metaDescription: content.match(/META DESCRIPTION:\s*(.+)/)?.[1],
      targetKeyword: formData.targetKeyword || "",
      secondaryKeywords: formData.secondaryKeywords,
    }, content);
    router.push(`/campaigns/${campaignSlug}/seo`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/campaigns/${campaignSlug}/seo`}
          className="rounded-md p-1.5 transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate SEO Article</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered long-form content with SEO optimization
          </p>
        </div>
      </div>

      <GenerateForm
        title="Article Settings"
        description="Configure keywords and article type"
        apiEndpoint="/api/ai/generate-article"
        campaignSlug={campaignSlug}
        onSave={handleSave}
        fields={[
          {
            name: "targetKeyword",
            label: "Target Keyword",
            type: "text",
            placeholder: "e.g., how to invest in land",
            required: true,
          },
          {
            name: "secondaryKeywords",
            label: "Secondary Keywords",
            type: "textarea",
            placeholder: "e.g., land investment ROI, vacant land for sale, raw land investing tips",
          },
          {
            name: "articleType",
            label: "Article Type",
            type: "select",
            options: [
              { value: "blog-post", label: "Blog Post (Educational)" },
              { value: "how-to-guide", label: "How-To Guide (Step by step)" },
              { value: "listicle", label: "Listicle (Top 10, Best of)" },
              { value: "comparison", label: "Comparison (vs Competitors)" },
              { value: "case-study", label: "Case Study (Results-focused)" },
            ],
          },
          {
            name: "wordCount",
            label: "Target Word Count",
            type: "select",
            options: [
              { value: "800", label: "800 words (Quick read)" },
              { value: "1500", label: "1,500 words (Standard)" },
              { value: "2500", label: "2,500 words (In-depth)" },
              { value: "3000", label: "3,000 words (Comprehensive)" },
            ],
          },
        ]}
      />
    </div>
  );
}
