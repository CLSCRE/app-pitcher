export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentBarChart, StatusPieChart, KeywordDifficultyChart } from "@/components/charts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CampaignAnalytics({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignId },
    include: {
      videoScripts: true,
      googleAdCopies: true,
      seoArticles: true,
      socialPosts: true,
      keywords: { orderBy: { searchVolume: "desc" } },
      approvalItems: true,
    },
  });

  if (!campaign) notFound();

  // Content by status
  const allStatuses = [
    ...campaign.videoScripts.map((v) => v.approvalStatus),
    ...campaign.googleAdCopies.map((g) => g.approvalStatus),
    ...campaign.seoArticles.map((s) => s.approvalStatus),
    ...campaign.socialPosts.map((s) => s.approvalStatus),
  ];

  const statusCounts: Record<string, number> = {};
  allStatuses.forEach((s) => { statusCounts[s] = (statusCounts[s] || 0) + 1; });

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Content by type
  const contentByType = [
    { name: "Video Scripts", value: campaign.videoScripts.length },
    { name: "Google Ads", value: campaign.googleAdCopies.length },
    { name: "SEO Articles", value: campaign.seoArticles.length },
    { name: "Social Posts", value: campaign.socialPosts.length },
  ];

  // Keyword data
  const keywordData = campaign.keywords.slice(0, 10).map((k) => ({
    term: k.term.length > 20 ? k.term.slice(0, 20) + "..." : k.term,
    difficulty: k.difficulty,
    volume: k.searchVolume,
  }));

  // Google Ads performance
  const adPerformance = campaign.googleAdCopies.filter((a) => a.impressions > 0);
  const totalImpressions = adPerformance.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = adPerformance.reduce((s, a) => s + a.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/analytics" className="rounded-md p-1.5 transition-colors hover:bg-accent">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: campaign.primaryColor || "#888" }} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name} Analytics</h1>
            <p className="text-sm text-muted-foreground">{campaign.industry}</p>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{allStatuses.length}</p>
            <p className="text-xs text-muted-foreground">Total Content</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{statusCounts["draft"] || 0}</p>
            <p className="text-xs text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{statusCounts["pending"] || 0}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{statusCounts["approved"] || 0}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold font-mono">${campaign.budgetMonthly.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Monthly Budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentBarChart data={contentByType} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <StatusPieChart data={statusData} />
            ) : (
              <p className="py-16 text-center text-xs text-muted-foreground">No content yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keyword Difficulty */}
      {keywordData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keyword Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <KeywordDifficultyChart data={keywordData} />
          </CardContent>
        </Card>
      )}

      {/* Keyword Table */}
      {campaign.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keyword Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Keyword</th>
                    <th className="pb-2 text-right font-medium">Volume</th>
                    <th className="pb-2 text-right font-medium">Difficulty</th>
                    <th className="pb-2 text-right font-medium">CPC</th>
                    <th className="pb-2 text-right font-medium">Rank</th>
                    <th className="pb-2 text-right font-medium">Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.keywords.map((kw) => {
                    const opportunity = kw.difficulty < 40 && kw.searchVolume > 1000 ? "High" : kw.difficulty < 60 ? "Medium" : "Low";
                    return (
                      <tr key={kw.id} className="border-b border-border/50">
                        <td className="py-2.5 font-medium">{kw.term}</td>
                        <td className="py-2.5 text-right font-mono text-xs">{kw.searchVolume.toLocaleString()}</td>
                        <td className="py-2.5 text-right">
                          <Badge
                            variant={kw.difficulty < 30 ? "default" : kw.difficulty < 50 ? "secondary" : "destructive"}
                            className="text-[10px]"
                          >
                            {kw.difficulty}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right font-mono text-xs">${kw.cpc.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-mono text-xs">{kw.currentRank ?? "—"}</td>
                        <td className="py-2.5 text-right">
                          <Badge
                            variant={opportunity === "High" ? "default" : opportunity === "Medium" ? "secondary" : "outline"}
                            className="text-[10px]"
                          >
                            {opportunity}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Ads Performance */}
      {adPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Ads Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 rounded-md bg-muted/50 p-4 text-center">
              <div>
                <p className="text-xl font-bold font-mono">{totalImpressions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Clicks</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono">{avgCtr}%</p>
                <p className="text-xs text-muted-foreground">CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
