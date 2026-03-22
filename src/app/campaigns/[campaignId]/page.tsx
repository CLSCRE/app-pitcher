import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, BarChart3, Search, Share2, Target, Users, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function CampaignOverview({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignId },
    include: {
      videoScripts: { orderBy: { createdAt: "desc" }, take: 5 },
      googleAdCopies: { orderBy: { createdAt: "desc" }, take: 5 },
      seoArticles: { orderBy: { createdAt: "desc" }, take: 5 },
      socialPosts: { orderBy: { createdAt: "desc" }, take: 5 },
      keywords: { orderBy: { searchVolume: "desc" }, take: 5 },
    },
  });

  if (!campaign) notFound();

  const audience = (() => {
    try { return JSON.parse(campaign.targetAudience); }
    catch { return null; }
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: campaign.primaryColor || "#888" }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="text-sm text-muted-foreground">{campaign.industry}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
            {campaign.status}
          </Badge>
          <Link
            href={`/campaigns/${campaign.slug}/settings`}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Value Prop */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{campaign.valueProposition}</p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href={`/campaigns/${campaign.slug}/video-ads`}>
          <Card className="transition-colors hover:bg-accent/30">
            <CardContent className="flex items-center gap-3 pt-6">
              <Video className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{campaign.videoScripts.length}</p>
                <p className="text-xs text-muted-foreground">Video Scripts</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/campaigns/${campaign.slug}/google-ads`}>
          <Card className="transition-colors hover:bg-accent/30">
            <CardContent className="flex items-center gap-3 pt-6">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{campaign.googleAdCopies.length}</p>
                <p className="text-xs text-muted-foreground">Google Ads</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/campaigns/${campaign.slug}/seo`}>
          <Card className="transition-colors hover:bg-accent/30">
            <CardContent className="flex items-center gap-3 pt-6">
              <Search className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{campaign.seoArticles.length}</p>
                <p className="text-xs text-muted-foreground">SEO Articles</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/campaigns/${campaign.slug}/social`}>
          <Card className="transition-colors hover:bg-accent/30">
            <CardContent className="flex items-center gap-3 pt-6">
              <Share2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{campaign.socialPosts.length}</p>
                <p className="text-xs text-muted-foreground">Social Posts</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Tabs: Audience, Brand Voice, Keywords */}
      <Tabs defaultValue="audience">
        <TabsList>
          <TabsTrigger value="audience">Target Audience</TabsTrigger>
          <TabsTrigger value="brand">Brand Voice</TabsTrigger>
          <TabsTrigger value="keywords">Top Keywords</TabsTrigger>
        </TabsList>

        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" /> Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {audience && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demographics</p>
                    <p className="mt-1 text-sm">{audience.demographics}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pain Points</p>
                    <ul className="mt-1 space-y-1">
                      {audience.painPoints?.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Target className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goals</p>
                    <ul className="mt-1 space-y-1">
                      {audience.goals?.map((g: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Target className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" /> Brand Voice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{campaign.brandVoice}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" /> Top Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.keywords.length > 0 ? (
                <div className="space-y-2">
                  {campaign.keywords.map((kw) => (
                    <div key={kw.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                      <span className="font-medium">{kw.term}</span>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="font-mono text-xs">{kw.searchVolume.toLocaleString()} vol</span>
                        <span className="font-mono text-xs">KD {kw.difficulty}</span>
                        <span className="font-mono text-xs">${kw.cpc.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No keywords tracked yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Content */}
      {campaign.videoScripts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Video Scripts</CardTitle>
            <Link
              href={`/campaigns/${campaign.slug}/video-ads`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {campaign.videoScripts.map((script) => (
                <div key={script.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{script.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {script.style} &middot; {script.duration}s
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {script.approvalStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
