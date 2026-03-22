export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

  const audience = (() => {
    try { return JSON.parse(campaign.targetAudience); }
    catch { return null; }
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaign Settings</h1>
        <p className="text-sm text-muted-foreground">{campaign.name}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Brand Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">App Name</p>
              <p className="mt-1 text-sm">{campaign.appName}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</p>
              <p className="mt-1 text-sm">{campaign.industry}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Color</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-6 w-6 rounded border border-border" style={{ backgroundColor: campaign.primaryColor || "#888" }} />
                <span className="font-mono text-sm">{campaign.primaryColor}</span>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
              <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="mt-1">
                {campaign.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Budget & Targeting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget & Targeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Budget</p>
              <p className="mt-1 text-2xl font-bold font-mono">${campaign.budgetMonthly.toLocaleString()}</p>
            </div>
            <Separator />
            {audience && (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demographics</p>
                  <p className="mt-1 text-sm">{audience.demographics}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pain Points</p>
                  <ul className="mt-1 space-y-1">
                    {audience.painPoints?.map((p: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">- {p}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Brand Voice */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Brand Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{campaign.brandVoice}</p>
          </CardContent>
        </Card>

        {/* Value Proposition */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Value Proposition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{campaign.valueProposition}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
