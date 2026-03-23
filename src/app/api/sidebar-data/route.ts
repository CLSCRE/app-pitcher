import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [campaigns, pendingCount] = await Promise.all([
    db.campaign.findMany({
      select: { slug: true, name: true, primaryColor: true },
      orderBy: { createdAt: "asc" },
    }),
    db.approvalQueueItem.count({ where: { status: "pending" } }),
  ]);

  return NextResponse.json({ campaigns, pendingCount });
}
