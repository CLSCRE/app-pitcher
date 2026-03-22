import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { workflowTemplates } from "@/lib/workflow-templates";

// Create a workflow from a template
export async function POST(req: NextRequest) {
  const { templateId, campaignSlug, automationMode } = await req.json();

  const template = workflowTemplates.find((t) => t.id === templateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const campaign = campaignSlug
    ? await db.campaign.findUnique({ where: { slug: campaignSlug } })
    : null;

  const workflow = await db.automationWorkflow.create({
    data: {
      name: template.name,
      description: template.description,
      campaignId: campaign?.id || null,
      triggerType: template.triggerType,
      triggerConfig: JSON.stringify(template.triggerConfig),
      steps: JSON.stringify(template.steps),
      automationMode: automationMode || template.automationMode,
      isActive: false,
    },
  });

  return NextResponse.json({ success: true, id: workflow.id });
}

// Toggle workflow active/inactive
export async function PATCH(req: NextRequest) {
  const { workflowId, action, automationMode } = await req.json();

  const workflow = await db.automationWorkflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if (action === "activate") {
    updates.isActive = true;
  } else if (action === "deactivate") {
    updates.isActive = false;
  } else if (action === "run") {
    updates.lastRunAt = new Date();
    updates.lastRunStatus = "running";
  }

  if (automationMode) {
    updates.automationMode = automationMode;
  }

  await db.automationWorkflow.update({
    where: { id: workflowId },
    data: updates,
  });

  return NextResponse.json({ success: true });
}

// Delete a workflow
export async function DELETE(req: NextRequest) {
  const { workflowId } = await req.json();

  await db.automationWorkflow.delete({
    where: { id: workflowId },
  });

  return NextResponse.json({ success: true });
}
