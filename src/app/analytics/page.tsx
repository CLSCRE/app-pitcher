import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentBarChart, StatusPieChart } from "@/components/charts";
import { Video, BarChart3, Search, Share2, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage() {
  const campaigns = await db.campaign.findMany({
    include: {
      videoScripts: true,
      googleAdCopies: true,
      seoArticles: true,
      socialPosts: true,
      keywords: true,
      approvalItems: true,
    },
  });

  // Aggregate content counts per campaign
  const contentByType = [
    {
      name: "Video Scripts",
      value: campaigns.reduce((s, c) => s + c.videoScripts.length, 0),
    },
    {
      name: "Google Ads",
      value: campaigns.reduce((s, c) => s + c.googleAdCopies.length, 0),
    },
    {
      name: "SEO Articles",
      value: campaigns.reduce((s, c) => s + c.seoArticles.length, 0),
    },
    {
      name: "Social Posts",
      value: campaigns.reduce((s, c) => s + c.socialPosts.length, 0),
    },
  ];

  // Aggregate approval statuses
  const allContent = campaigns.flatMap((c) => [
    ...c.videoScripts.map((v) => v.approvalStatus),
    ...c.googleAdCopies.map((g) => g.approvalStatus),
    ...c.seoArticles.map((s) => s.approvalStatus),
    ...c.socialPosts.map((s) => s.approvalStatus),
  ]);

  const statusCounts: Record<string, number> = {};
  allContent.forEach((s) => {
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  const approvalFunnel = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Content per campaign
  const contentByCampaign = campaigns.map((c) => ({
    name: c.name,
    value: c.videoScripts.length + c.googleAdCopies.length + c.seoArticles.length + c.socialPosts.length,
  }));

  // Budget allocation
  const totalBudget = campaigns.reduce((s, c) => s + c.budgetMonthly, 0);
  const totalKeywords = campaigns.reduce((s, c) => s + c.keywords.length, 0);
  const totalContent = allContent.length;
  const approvalRate = allContent.length > 0
    ? Math.round((statusCounts["approved"] || 0) / allContent.length * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Cross-campaign performance metrics and content insights
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-blue-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalContent}</p>
              <p className="text-xs text-muted-foreground">Total Content Pieces</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-green-500/10 p-2">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Monthly Budget</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-purple-500/10 p-2">
              <Search className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalKeywords}</p>
              <p className="text-xs text-muted-foreground">Keywords Tracked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-yellow-500/10 p-2">
              <BarChart3 className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvalRate}%</p>
              <p className="text-xs text-muted-foreground">Approval Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
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
            <CardTitle className="text-base">Approval Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {approvalFunnel.length > 0 ? (
              <StatusPieChart data={approvalFunnel} />
            ) : (
              <p className="py-16 text-center text-xs text-muted-foreground">No content to analyze yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content by Campaign */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Production by Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentBarChart data={contentByCampaign} />
        </CardContent>
      </Card>

      {/* Per-Campaign Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Campaign Breakdowns
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((campaign) => {
            const stats = [
              { icon: Video, label: "Scripts", count: campaign.videoScripts.length },
              { icon: BarChart3, label: "Ads", count: campaign.googleAdCopies.length },
              { icon: Search, label: "Articles", count: campaign.seoArticles.length },
              { icon: Share2, label: "Posts", count: campaign.socialPosts.length },
            ];

            const avgKeywordDifficulty = campaign.keywords.length > 0
              ? Math.round(campaign.keywords.reduce((s, k) => s + k.difficulty, 0) / campaign.keywords.length)
              : 0;

            return (
              <Link key={campaign.id} href={`/analytics/${campaign.slug}`}>
                <Card className="transition-colors hover:bg-accent/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: campaign.primaryColor || "#888" }} />
                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        ${campaign.budgetMonthly.toLocaleString()}/mo
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {stats.map((s) => (
                        <div key={s.label} className="text-center">
                          <s.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                          <p className="text-lg font-bold">{s.count}</p>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground">{campaign.keywords.length} keywords tracked</span>
                      <span className="text-muted-foreground">Avg difficulty: {avgKeywordDifficulty}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
