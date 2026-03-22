import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, BarChart3, Search, Share2 } from "lucide-react";
import Link from "next/link";

export default async function CampaignsPage() {
  const campaigns = await db.campaign.findMany({
    include: {
      _count: {
        select: {
          videoScripts: true,
          googleAdCopies: true,
          seoArticles: true,
          socialPosts: true,
          keywords: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-sm text-muted-foreground">
          Manage your marketing campaigns
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.slug}`}>
            <Card className="transition-colors hover:bg-accent/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: campaign.primaryColor || "#888" }}
                    />
                    <div>
                      <CardTitle>{campaign.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{campaign.industry}</p>
                    </div>
                  </div>
                  <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {campaign.valueProposition}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Video className="h-3.5 w-3.5" />
                    <span>{campaign._count.videoScripts} scripts</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>{campaign._count.googleAdCopies} ads</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Search className="h-3.5 w-3.5" />
                    <span>{campaign._count.seoArticles} articles</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{campaign._count.socialPosts} posts</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-mono font-semibold">${campaign.budgetMonthly.toLocaleString()}/mo</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
