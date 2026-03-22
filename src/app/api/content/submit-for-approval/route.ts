import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { contentType, contentId } = await req.json();

  // Look up the content to get campaignId and validate it exists
  let campaignId: string;
  let updateModel: "videoScript" | "googleAdCopy" | "seoArticle" | "socialPost";
  let fkField: string;

  switch (contentType) {
    case "video-script": {
      const item = await db.videoScript.findUnique({ where: { id: contentId } });
      if (!item) return NextResponse.json({ error: "Content not found" }, { status: 404 });
      campaignId = item.campaignId;
      updateModel = "videoScript";
      fkField = "videoScriptId";
      break;
    }
    case "google-ad": {
      const item = await db.googleAdCopy.findUnique({ where: { id: contentId } });
      if (!item) return NextResponse.json({ error: "Content not found" }, { status: 404 });
      campaignId = item.campaignId;
      updateModel = "googleAdCopy";
      fkField = "googleAdCopyId";
      break;
    }
    case "seo-article": {
      const item = await db.seoArticle.findUnique({ where: { id: contentId } });
      if (!item) return NextResponse.json({ error: "Content not found" }, { status: 404 });
      campaignId = item.campaignId;
      updateModel = "seoArticle";
      fkField = "seoArticleId";
      break;
    }
    case "social-post": {
      const item = await db.socialPost.findUnique({ where: { id: contentId } });
      if (!item) return NextResponse.json({ error: "Content not found" }, { status: 404 });
      campaignId = item.campaignId;
      updateModel = "socialPost";
      fkField = "socialPostId";
      break;
    }
    default:
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  // Update the content's approval status to "pending"
  await (db[updateModel] as any).update({
    where: { id: contentId },
    data: { approvalStatus: "pending" },
  });

  // Create an approval queue item
  const approvalItem = await db.approvalQueueItem.create({
    data: {
      campaignId,
      contentType,
      contentId,
      status: "pending",
      [fkField]: contentId,
    },
  });

  return NextResponse.json({ success: true, approvalItemId: approvalItem.id });
}
