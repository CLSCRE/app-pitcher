import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { contentType, campaignSlug, data } = body;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignSlug },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  let saved;

  switch (contentType) {
    case "video-script": {
      saved = await db.videoScript.create({
        data: {
          campaignId: campaign.id,
          title: data.title || "Untitled Script",
          style: data.style || "corgi-commercial",
          script: data.content,
          shotList: data.shotList || null,
          voiceoverText: data.voiceoverText || null,
          duration: data.duration ? parseInt(data.duration) : 30,
          approvalStatus: "draft",
        },
      });
      break;
    }
    case "google-ad": {
      saved = await db.googleAdCopy.create({
        data: {
          campaignId: campaign.id,
          adGroupName: data.adGroupName || "General",
          headlines: data.headlines || "[]",
          descriptions: data.descriptions || "[]",
          finalUrl: data.landingUrl || `https://${campaign.slug}.com`,
          approvalStatus: "draft",
        },
      });
      break;
    }
    case "seo-article": {
      saved = await db.seoArticle.create({
        data: {
          campaignId: campaign.id,
          title: data.title || "Untitled Article",
          slug: data.slug || "untitled",
          targetKeyword: data.targetKeyword || "",
          secondaryKeywords: data.secondaryKeywords || null,
          body: data.content,
          metaDescription: data.metaDescription || null,
          wordCount: data.content ? data.content.split(/\s+/).length : 0,
          approvalStatus: "draft",
        },
      });
      break;
    }
    case "social-post": {
      saved = await db.socialPost.create({
        data: {
          campaignId: campaign.id,
          platforms: JSON.stringify(data.platforms || ["instagram", "linkedin", "x"]),
          body: data.content,
          hashtags: data.hashtags || null,
          approvalStatus: "draft",
        },
      });
      break;
    }
    default:
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: saved.id, contentType });
}
