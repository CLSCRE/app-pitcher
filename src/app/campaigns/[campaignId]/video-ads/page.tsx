export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, Film } from "lucide-react";
import Link from "next/link";
import { SubmitForApproval } from "@/components/submit-for-approval";
import { HeyGenRender } from "@/components/heygen-render";

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  published: "default",
};

export default async function VideoAdsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignId },
    include: {
      videoScripts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video Ad Scripts</h1>
          <p className="text-sm text-muted-foreground">{campaign.name}</p>
        </div>
        <Link
          href={`/campaigns/${campaign.slug}/video-ads/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Generate New Script
        </Link>
      </div>

      {campaign.videoScripts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No video scripts yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Generate your first Corgi commercial or HeyGen script.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaign.videoScripts.map((script) => (
            <Card key={script.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-muted p-2">
                      <Film className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{script.title}</CardTitle>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          {script.style.replace("-", " ")}
                        </span>
                        {script.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {script.duration}s
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {script.style === "heygen-avatar" && (
                      <HeyGenRender
                        scriptId={script.id}
                        heygenVideoId={script.heygenVideoId}
                        heygenStatus={script.heygenStatus}
                      />
                    )}
                    <SubmitForApproval
                      contentType="video-script"
                      contentId={script.id}
                      currentStatus={script.approvalStatus}
                    />
                    <Badge variant={statusColors[script.approvalStatus] || "secondary"}>
                      {script.approvalStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-mono text-xs leading-relaxed">
                  {script.script}
                </pre>
                {script.voiceoverText && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voiceover</p>
                    <p className="mt-1 text-sm text-muted-foreground italic">{script.voiceoverText}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
