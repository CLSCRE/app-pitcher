export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SubmitForApproval } from "@/components/submit-for-approval";

export default async function SeoPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignId },
    include: {
      seoArticles: { orderBy: { createdAt: "desc" } },
      keywords: { orderBy: { searchVolume: "desc" } },
    },
  });

  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO Content</h1>
          <p className="text-sm text-muted-foreground">{campaign.name}</p>
        </div>
        <Link
          href={`/campaigns/${campaign.slug}/seo/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Generate Article
        </Link>
      </div>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" /> Tracked Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.keywords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Keyword</th>
                    <th className="pb-2 font-medium text-right">Volume</th>
                    <th className="pb-2 font-medium text-right">Difficulty</th>
                    <th className="pb-2 font-medium text-right">CPC</th>
                    <th className="pb-2 font-medium text-right">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.keywords.map((kw) => (
                    <tr key={kw.id} className="border-b border-border/50">
                      <td className="py-2.5 font-medium">{kw.term}</td>
                      <td className="py-2.5 text-right font-mono text-xs">{kw.searchVolume.toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant={kw.difficulty < 30 ? "default" : kw.difficulty < 50 ? "secondary" : "destructive"} className="text-[10px]">
                          {kw.difficulty}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs">${kw.cpc.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-mono text-xs">{kw.currentRank ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No keywords tracked yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Articles */}
      {campaign.seoArticles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No SEO articles yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Generate optimized content targeting your keywords.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaign.seoArticles.map((article) => (
            <Card key={article.id}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="font-medium">{article.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Target: {article.targetKeyword}</span>
                    <span>{article.wordCount} words</span>
                    <span>SEO Score: {article.seoScore}/100</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SubmitForApproval contentType="seo-article" contentId={article.id} currentStatus={article.approvalStatus} />
                  <Badge variant="secondary">{article.approvalStatus}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
