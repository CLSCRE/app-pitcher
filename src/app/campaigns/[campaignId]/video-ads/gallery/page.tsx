export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Download, Clock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { HeyGenRender } from "@/components/heygen-render";

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-500", label: "Rendered" },
  processing: { icon: Loader2, color: "text-yellow-500", label: "Rendering" },
  failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
};

export default async function VideoGalleryPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const campaign = await db.campaign.findUnique({
    where: { slug: campaignId },
    include: {
      videoScripts: {
        where: { heygenVideoId: { not: null } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!campaign) notFound();

  const allScripts = await db.videoScript.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video Gallery</h1>
          <p className="text-sm text-muted-foreground">
            {campaign.name} — rendered and pending videos
          </p>
        </div>
        <Link
          href={`/campaigns/${campaign.slug}/video-ads`}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          All Scripts
        </Link>
      </div>

      {/* Rendered Videos */}
      {campaign.videoScripts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rendered Videos ({campaign.videoScripts.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {campaign.videoScripts.map((script) => {
              const config = statusConfig[script.heygenStatus || "processing"];
              const StatusIcon = config?.icon || Clock;
              return (
                <Card key={script.id}>
                  {script.thumbnailUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                      <img
                        src={script.thumbnailUrl}
                        alt={script.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="gap-1 text-[10px] bg-black/60 text-white">
                          <StatusIcon className={`h-3 w-3 ${config?.color || ""}`} />
                          {config?.label || script.heygenStatus}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-t-lg bg-muted">
                      <div className="text-center">
                        <Film className="mx-auto h-8 w-8 text-muted-foreground" />
                        <Badge variant="secondary" className="mt-2 gap-1 text-[10px]">
                          <StatusIcon className={`h-3 w-3 ${config?.color || ""} ${script.heygenStatus === "processing" ? "animate-spin" : ""}`} />
                          {config?.label || script.heygenStatus}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardContent className="pt-3">
                    <p className="text-sm font-medium truncate">{script.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{script.style.replace("-", " ")}</span>
                      {script.duration && <span>· {script.duration}s</span>}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <HeyGenRender
                        scriptId={script.id}
                        heygenVideoId={script.heygenVideoId}
                        heygenStatus={script.heygenStatus}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Scripts Ready to Render */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Scripts Ready to Render
        </h2>
        {allScripts.filter((s) => !s.heygenVideoId && s.style === "heygen-avatar").length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Film className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">No HeyGen scripts pending render.</p>
              <Link
                href={`/campaigns/${campaign.slug}/video-ads/new`}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Generate a HeyGen Avatar script
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {allScripts
              .filter((s) => !s.heygenVideoId && s.style === "heygen-avatar")
              .map((script) => (
                <Card key={script.id}>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-3">
                      <Film className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{script.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {script.duration}s · {script.approvalStatus}
                        </p>
                      </div>
                    </div>
                    <HeyGenRender
                      scriptId={script.id}
                      heygenVideoId={script.heygenVideoId}
                      heygenStatus={script.heygenStatus}
                    />
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
