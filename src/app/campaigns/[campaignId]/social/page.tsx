export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import Link from "next/link";
import { SubmitForApproval } from "@/components/submit-for-approval";

const platformColors: Record<string, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  x: "#000000",
  tiktok: "#00f2ea",
};

export default async function SocialPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignId },
    include: {
      socialPosts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Media</h1>
          <p className="text-sm text-muted-foreground">{campaign.name}</p>
        </div>
        <Link
          href={`/campaigns/${campaign.slug}/social/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Generate Posts
        </Link>
      </div>

      {campaign.socialPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Share2 className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No social posts yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Generate multi-platform content from a single brief.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaign.socialPosts.map((post) => {
            const platforms: string[] = (() => { try { return JSON.parse(post.platforms); } catch { return []; } })();
            const hashtags: string[] = (() => { try { return JSON.parse(post.hashtags || "[]"); } catch { return []; } })();

            return (
              <Card key={post.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {platforms.map((p) => (
                        <span
                          key={p}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                          style={{ backgroundColor: platformColors[p] || "#666" }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <SubmitForApproval contentType="social-post" contentId={post.id} currentStatus={post.approvalStatus} />
                      <Badge variant="secondary" className="text-[10px]">{post.approvalStatus}</Badge>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{post.body}</p>
                  {hashtags.length > 0 && (
                    <p className="text-xs text-muted-foreground">{hashtags.map(h => `#${h}`).join(" ")}</p>
                  )}
                  {(post.impressions > 0 || post.engagements > 0) && (
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{post.impressions.toLocaleString()} impressions</span>
                      <span>{post.engagements.toLocaleString()} engagements</span>
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
