export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CampaignSettingsForm } from "@/components/campaign-settings-form";

export default async function CampaignSettings({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignId },
  });

  if (!campaign) notFound();

  return <CampaignSettingsForm campaign={campaign} />;
}
