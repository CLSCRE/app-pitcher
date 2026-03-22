export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Clock, Webhook, MousePointerClick, TrendingDown, LayoutTemplate } from "lucide-react";
import { workflowTemplates } from "@/lib/workflow-templates";
import { WorkflowControls, CreateWorkflowButton } from "@/components/workflow-controls";

const triggerIcons: Record<string, typeof Zap> = {
  schedule: Clock,
  webhook: Webhook,
  manual: MousePointerClick,
  "performance-threshold": TrendingDown,
};

export default async function AutomationPage() {
  const workflows = await db.automationWorkflow.findMany({
    include: { campaign: true },
    orderBy: { createdAt: "desc" },
  });

  const campaigns = await db.campaign.findMany({
    select: { slug: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automation</h1>
        <p className="text-sm text-muted-foreground">
          Automated content generation workflows
        </p>
      </div>

      {/* Active Workflows */}
      {workflows.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Workflows ({workflows.length})
          </h2>
          {workflows.map((wf) => {
            const Icon = triggerIcons[wf.triggerType] || Zap;
            const steps = (() => {
              try { return JSON.parse(wf.steps || "[]"); }
              catch { return []; }
            })();

            return (
              <Card key={wf.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-md bg-muted p-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{wf.name}</CardTitle>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {wf.campaign?.name ?? "All campaigns"} &middot; {wf.triggerType.replace("-", " ")}
                          {wf.lastRunAt && (
                            <> &middot; Last run: {new Date(wf.lastRunAt).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={wf.isActive ? "default" : "secondary"}>
                        {wf.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {wf.description && (
                    <p className="text-sm text-muted-foreground">{wf.description}</p>
                  )}

                  {/* Step visualization */}
                  {steps.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {steps.map((step: { id: string; name: string; type: string }, i: number) => (
                        <div key={step.id} className="flex items-center gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              step.type === "generate"
                                ? "bg-blue-500/10 text-blue-500"
                                : step.type === "review"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : step.type === "publish"
                                    ? "bg-green-500/10 text-green-500"
                                    : step.type === "analyze"
                                      ? "bg-purple-500/10 text-purple-500"
                                      : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {step.name}
                          </span>
                          {i < steps.length - 1 && (
                            <span className="text-[10px] text-muted-foreground">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <WorkflowControls
                    workflowId={wf.id}
                    isActive={wf.isActive}
                    automationMode={wf.automationMode}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Workflow Templates */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <LayoutTemplate className="h-4 w-4" />
          Workflow Templates
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {workflowTemplates.map((template) => {
            const Icon = triggerIcons[template.triggerType] || Zap;
            return (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-muted p-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <div className="mt-1 flex gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {template.triggerType.replace("-", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {template.steps.length} steps
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {template.description}
                  </p>

                  {/* Steps preview */}
                  <div className="space-y-1">
                    {template.steps.map((step) => (
                      <div key={step.id} className="flex items-center gap-2 text-[10px]">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            step.type === "generate"
                              ? "bg-blue-500"
                              : step.type === "review"
                                ? "bg-yellow-500"
                                : step.type === "publish"
                                  ? "bg-green-500"
                                  : "bg-purple-500"
                          }`}
                        />
                        <span className="text-muted-foreground">{step.description}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <CreateWorkflowButton
                    templateId={template.id}
                    templateName={template.name}
                    campaigns={campaigns}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
