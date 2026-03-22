"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkflowControlsProps {
  workflowId: string;
  isActive: boolean;
  automationMode: string;
}

export function WorkflowControls({ workflowId, isActive, automationMode }: WorkflowControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleToggle() {
    setLoading("toggle");
    try {
      await fetch("/api/workflows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          action: isActive ? "deactivate" : "activate",
        }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleRun() {
    setLoading("run");
    try {
      const res = await fetch("/api/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Workflow execution failed");
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleModeChange(mode: string) {
    setLoading("mode");
    try {
      await fetch("/api/workflows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, automationMode: mode }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this workflow?")) return;
    setLoading("delete");
    try {
      await fetch("/api/workflows", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Active Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={loading !== null}
        />
        <span className="text-xs text-muted-foreground">
          {isActive ? "Active" : "Paused"}
        </span>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-1">
        {(["full-auto", "semi-auto", "manual"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            disabled={loading !== null}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              automationMode === mode
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {mode.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Run Now */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleRun}
        disabled={loading !== null}
        className="h-7 gap-1 text-xs"
      >
        {loading === "run" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Play className="h-3 w-3" />
        )}
        Run Now
      </Button>

      {/* Delete */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={loading !== null}
        className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface CreateWorkflowButtonProps {
  templateId: string;
  templateName: string;
  campaigns: { slug: string; name: string }[];
}

export function CreateWorkflowButton({ templateId, templateName, campaigns }: CreateWorkflowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]?.slug || "");
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    try {
      await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          campaignSlug: selectedCampaign || null,
        }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedCampaign}
        onChange={(e) => setSelectedCampaign(e.target.value)}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs"
      >
        <option value="">All campaigns</option>
        {campaigns.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>
      <Button
        size="sm"
        onClick={handleCreate}
        disabled={loading}
        className="h-7 gap-1 text-xs"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        Create
      </Button>
    </div>
  );
}
