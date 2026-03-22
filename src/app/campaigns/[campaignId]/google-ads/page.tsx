export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ExternalLink } from "lucide-react";
import Link from "next/link";
import { SubmitForApproval } from "@/components/submit-for-approval";

export default async function GoogleAdsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignId },
    include: {
      googleAdCopies: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
          <p className="text-sm text-muted-foreground">{campaign.name}</p>
        </div>
        <Link
          href={`/campaigns/${campaign.slug}/google-ads/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Generate Ad Copy
        </Link>
      </div>

      {campaign.googleAdCopies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No Google Ad copies yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaign.googleAdCopies.map((ad) => {
            const headlines: string[] = (() => { try { return JSON.parse(ad.headlines); } catch { return []; } })();
            const descriptions: string[] = (() => { try { return JSON.parse(ad.descriptions); } catch { return []; } })();

            return (
              <Card key={ad.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{ad.adGroupName}</CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        {ad.finalUrl}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SubmitForApproval contentType="google-ad" contentId={ad.id} currentStatus={ad.approvalStatus} />
                      <Badge variant="secondary">{ad.approvalStatus}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Headlines ({headlines.length}/15)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {headlines.map((h, i) => (
                        <span key={i} className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Descriptions ({descriptions.length}/4)
                    </p>
                    <div className="space-y-1.5">
                      {descriptions.map((d, i) => (
                        <p key={i} className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs">
                          {d}
                        </p>
                      ))}
                    </div>
                  </div>
                  {/* Performance */}
                  {(ad.impressions > 0 || ad.clicks > 0) && (
                    <div className="grid grid-cols-4 gap-3 rounded-md bg-muted/50 p-3">
                      <div className="text-center">
                        <p className="font-mono text-sm font-bold">{ad.impressions.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Impressions</p>
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-sm font-bold">{ad.clicks.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-sm font-bold">{ad.ctr.toFixed(2)}%</p>
                        <p className="text-[10px] text-muted-foreground">CTR</p>
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-sm font-bold">${ad.costPerClick.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">CPC</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
