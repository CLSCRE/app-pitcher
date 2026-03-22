import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  FileText,
  MousePointerClick,
  TrendingUp,
  Video,
  BarChart3,
  Search,
  Share2,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const campaigns = await db.campaign.findMany({
    include: {
      videoScripts: true,
      googleAdCopies: true,
      seoArticles: true,
      socialPosts: true,
      approvalItems: { where: { status: "pending" } },
      keywords: true,
    },
  });

  const recentApprovals = await db.approvalQueueItem.findMany({
    include: { campaign: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const activeWorkflows = await db.automationWorkflow.findMany({
    where: { isActive: true },
    include: { campaign: true },
    take: 3,
  });

  return { campaigns, recentApprovals, activeWorkflows };
}

export default async function Dashboard() {
  const { campaigns, recentApprovals, activeWorkflows } = await getDashboardData();

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budgetMonthly, 0);
  const totalContent = campaigns.reduce(
    (sum, c) =>
      sum + c.videoScripts.length + c.googleAdCopies.length + c.seoArticles.length + c.socialPosts.length,
    0
  );
  const pendingApprovals = campaigns.reduce((sum, c) => sum + c.approvalItems.length, 0);
  const totalKeywords = campaigns.reduce((sum, c) => sum + c.keywords.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all campaigns and content pipelines
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {campaigns.length} campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Content Pieces</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContent}</div>
            <p className="text-xs text-muted-foreground">Scripts, ads, articles, posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              {pendingApprovals > 0 ? "Items need your review" : "All clear"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Keywords Tracked</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKeywords}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Lanes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {campaigns.map((campaign) => {
          const content = [
            { label: "Video Scripts", count: campaign.videoScripts.length, icon: Video, href: `/campaigns/${campaign.slug}/video-ads` },
            { label: "Google Ads", count: campaign.googleAdCopies.length, icon: BarChart3, href: `/campaigns/${campaign.slug}/google-ads` },
            { label: "SEO Articles", count: campaign.seoArticles.length, icon: Search, href: `/campaigns/${campaign.slug}/seo` },
            { label: "Social Posts", count: campaign.socialPosts.length, icon: Share2, href: `/campaigns/${campaign.slug}/social` },
          ];

          const drafts = [
            ...campaign.videoScripts.filter((v) => v.approvalStatus === "draft"),
            ...campaign.googleAdCopies.filter((g) => g.approvalStatus === "draft"),
            ...campaign.seoArticles.filter((s) => s.approvalStatus === "draft"),
            ...campaign.socialPosts.filter((s) => s.approvalStatus === "draft"),
          ].length;

          const published = [
            ...campaign.videoScripts.filter((v) => v.approvalStatus === "published"),
            ...campaign.googleAdCopies.filter((g) => g.approvalStatus === "published"),
            ...campaign.seoArticles.filter((s) => s.approvalStatus === "published"),
            ...campaign.socialPosts.filter((s) => s.approvalStatus === "published"),
          ].length;

          const total = campaign.videoScripts.length + campaign.googleAdCopies.length + campaign.seoArticles.length + campaign.socialPosts.length;
          const progress = total > 0 ? Math.round((published / total) * 100) : 0;

          return (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: campaign.primaryColor || "#888" }}
                    />
                    <div>
                      <CardTitle className="text-base">{campaign.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{campaign.industry}</p>
                    </div>
                  </div>
                  <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pipeline Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{drafts} drafts</span>
                    <span>{campaign.approvalItems.length} pending</span>
                    <span>{published} published</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                {/* Content Breakdown */}
                <div className="grid grid-cols-2 gap-2">
                  {content.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="ml-auto font-mono text-xs font-semibold">{item.count}</span>
                    </Link>
                  ))}
                </div>

                {/* Budget */}
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Monthly Budget</span>
                  <span className="font-mono font-semibold">${campaign.budgetMonthly.toLocaleString()}</span>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/campaigns/${campaign.slug}`}
                    className="flex-1 rounded-md border border-border px-3 py-1.5 text-center text-xs font-medium transition-colors hover:bg-accent"
                  >
                    View Campaign
                  </Link>
                  <Link
                    href={`/campaigns/${campaign.slug}/video-ads`}
                    className="flex-1 rounded-md bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Generate Content
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Row: Activity Feed + Active Workflows */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Recent Activity
            </CardTitle>
            <Link href="/approvals" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentApprovals.length > 0 ? (
              <div className="space-y-2">
                {recentApprovals.map((item) => {
                  const statusIcon = item.status === "approved"
                    ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                    : item.status === "pending"
                      ? <Clock className="h-3 w-3 text-yellow-500" />
                      : <Clock className="h-3 w-3 text-muted-foreground" />;
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                      <div className="flex items-center gap-2">
                        {statusIcon}
                        <div>
                          <p className="text-xs font-medium capitalize">{item.contentType.replace("-", " ")}</p>
                          <p className="text-[10px] text-muted-foreground">{item.campaign.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">{item.status}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-6">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Active Workflows */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" /> Active Workflows
            </CardTitle>
            <Link href="/automation" className="text-xs text-muted-foreground hover:text-foreground">
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            {activeWorkflows.length > 0 ? (
              <div className="space-y-2">
                {activeWorkflows.map((wf) => (
                  <div key={wf.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <div>
                      <p className="text-xs font-medium">{wf.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {wf.campaign?.name ?? "All campaigns"} &middot; {wf.automationMode}
                      </p>
                    </div>
                    <Badge variant="default" className="text-[10px]">Active</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">No active workflows</p>
                <Link href="/automation" className="mt-1 inline-block text-xs text-primary hover:underline">
                  Set up automation
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No campaigns yet. Seed the database to get started.</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              POST /api/seed to create sample data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
