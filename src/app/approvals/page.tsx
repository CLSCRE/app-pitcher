export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Video, BarChart3, Search, Share2, Clock } from "lucide-react";
import { ApprovalActions } from "@/components/approval-actions";

const contentTypeIcons: Record<string, typeof Video> = {
  "video-script": Video,
  "google-ad": BarChart3,
  "seo-article": Search,
  "social-post": Share2,
};

async function getContentPreview(contentType: string, contentId: string) {
  switch (contentType) {
    case "video-script": {
      const item = await db.videoScript.findUnique({ where: { id: contentId } });
      return item ? { title: item.title, preview: item.script.slice(0, 300) + "...", meta: `${item.style} · ${item.duration}s` } : null;
    }
    case "google-ad": {
      const item = await db.googleAdCopy.findUnique({ where: { id: contentId } });
      if (!item) return null;
      const headlines: string[] = (() => { try { return JSON.parse(item.headlines); } catch { return []; } })();
      return { title: item.adGroupName, preview: headlines.slice(0, 5).join(" | "), meta: `${headlines.length} headlines · ${item.finalUrl}` };
    }
    case "seo-article": {
      const item = await db.seoArticle.findUnique({ where: { id: contentId } });
      return item ? { title: item.title, preview: item.body.slice(0, 300) + "...", meta: `${item.wordCount} words · KW: ${item.targetKeyword}` } : null;
    }
    case "social-post": {
      const item = await db.socialPost.findUnique({ where: { id: contentId } });
      return item ? { title: "Social Post", preview: item.body.slice(0, 300) + "...", meta: (() => { try { return JSON.parse(item.platforms).join(", "); } catch { return ""; } })() } : null;
    }
    default:
      return null;
  }
}

export default async function ApprovalsPage() {
  const pendingItems = await db.approvalQueueItem.findMany({
    where: { status: "pending" },
    include: { campaign: true },
    orderBy: { createdAt: "desc" },
  });

  const recentItems = await db.approvalQueueItem.findMany({
    where: { status: { not: "pending" } },
    include: { campaign: true },
    orderBy: { resolvedAt: "desc" },
    take: 20,
  });

  // Fetch content previews for pending items
  const pendingWithPreviews = await Promise.all(
    pendingItems.map(async (item) => ({
      ...item,
      content: await getContentPreview(item.contentType, item.contentId),
    }))
  );

  const recentWithPreviews = await Promise.all(
    recentItems.map(async (item) => ({
      ...item,
      content: await getContentPreview(item.contentType, item.contentId),
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approval Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review and approve content before it goes live
          </p>
        </div>
        {pendingItems.length > 0 && (
          <Badge variant="default" className="text-sm">
            {pendingItems.length} pending
          </Badge>
        )}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({recentItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingWithPreviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">All clear!</p>
                <p className="mt-1 text-xs text-muted-foreground">No items pending approval.</p>
              </CardContent>
            </Card>
          ) : (
            pendingWithPreviews.map((item) => {
              const Icon = contentTypeIcons[item.contentType] || CheckCircle2;
              return (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md bg-muted p-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {item.content?.title || item.contentType.replace("-", " ")}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: item.campaign.primaryColor || "#888" }}
                            />
                            <span>{item.campaign.name}</span>
                            <span>&middot;</span>
                            <span className="capitalize">{item.contentType.replace("-", " ")}</span>
                            {item.content?.meta && (
                              <>
                                <span>&middot;</span>
                                <span>{item.content.meta}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Content Preview */}
                    {item.content?.preview && (
                      <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed max-h-48 overflow-auto">
                        {item.content.preview}
                      </pre>
                    )}

                    {/* Actions */}
                    <ApprovalActions
                      approvalItemId={item.id}
                      currentStatus={item.status}
                    />
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {recentWithPreviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No approval history yet.</p>
              </CardContent>
            </Card>
          ) : (
            recentWithPreviews.map((item) => {
              const Icon = contentTypeIcons[item.contentType] || CheckCircle2;
              const statusColors: Record<string, "default" | "destructive" | "secondary"> = {
                approved: "default",
                rejected: "destructive",
                "changes-requested": "secondary",
              };
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {item.content?.title || item.contentType.replace("-", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.campaign.name} &middot; {item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColors[item.status] || "secondary"} className="capitalize text-xs">
                        {item.status.replace("-", " ")}
                      </Badge>
                      {item.reviewerNotes && (
                        <span className="max-w-48 truncate text-xs text-muted-foreground" title={item.reviewerNotes}>
                          "{item.reviewerNotes}"
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
