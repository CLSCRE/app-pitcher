import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const { approvalItemId, action, reviewerNotes } = await req.json();

  const item = await db.approvalQueueItem.findUnique({
    where: { id: approvalItemId },
  });

  if (!item) {
    return NextResponse.json({ error: "Approval item not found" }, { status: 404 });
  }

  // Map action to status
  const statusMap: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    "request-changes": "changes-requested",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Update approval queue item
  await db.approvalQueueItem.update({
    where: { id: approvalItemId },
    data: {
      status: newStatus,
      reviewerNotes: reviewerNotes || null,
      resolvedAt: new Date(),
    },
  });

  // Update the content's approval status
  const contentStatusMap: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    "request-changes": "draft",
  };

  const contentStatus = contentStatusMap[action];

  switch (item.contentType) {
    case "video-script":
      await db.videoScript.update({
        where: { id: item.contentId },
        data: {
          approvalStatus: contentStatus,
          ...(action === "approve" ? { approvedAt: new Date() } : {}),
        },
      });
      break;
    case "google-ad":
      await db.googleAdCopy.update({
        where: { id: item.contentId },
        data: { approvalStatus: contentStatus },
      });
      break;
    case "seo-article":
      await db.seoArticle.update({
        where: { id: item.contentId },
        data: { approvalStatus: contentStatus },
      });
      break;
    case "social-post":
      await db.socialPost.update({
        where: { id: item.contentId },
        data: { approvalStatus: contentStatus },
      });
      break;
  }

  return NextResponse.json({ success: true, status: newStatus });
}
