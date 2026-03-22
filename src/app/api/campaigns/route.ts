import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    appName,
    industry,
    brandVoice,
    targetAudience,
    valueProposition,
    budgetMonthly,
    primaryColor,
  } = body;

  if (!name || !appName || !industry) {
    return NextResponse.json(
      { error: "Name, app name, and industry are required" },
      { status: 400 }
    );
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await db.campaign.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A campaign with this name already exists" },
      { status: 409 }
    );
  }

  const campaign = await db.campaign.create({
    data: {
      name,
      slug,
      appName,
      industry,
      brandVoice: brandVoice || "",
      targetAudience: targetAudience || "{}",
      valueProposition: valueProposition || "",
      budgetMonthly: parseFloat(budgetMonthly) || 0,
      primaryColor: primaryColor || "#6366f1",
    },
  });

  return NextResponse.json({ success: true, slug: campaign.slug });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { slug, ...updates } = body;

  const campaign = await db.campaign.findUnique({ where: { slug } });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.appName !== undefined) data.appName = updates.appName;
  if (updates.industry !== undefined) data.industry = updates.industry;
  if (updates.brandVoice !== undefined) data.brandVoice = updates.brandVoice;
  if (updates.targetAudience !== undefined) data.targetAudience = updates.targetAudience;
  if (updates.valueProposition !== undefined) data.valueProposition = updates.valueProposition;
  if (updates.budgetMonthly !== undefined) data.budgetMonthly = parseFloat(updates.budgetMonthly) || 0;
  if (updates.primaryColor !== undefined) data.primaryColor = updates.primaryColor;
  if (updates.status !== undefined) data.status = updates.status;

  await db.campaign.update({ where: { slug }, data });

  return NextResponse.json({ success: true });
}
