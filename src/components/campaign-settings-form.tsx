"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Pencil } from "lucide-react";

interface CampaignData {
  slug: string;
  name: string;
  appName: string;
  industry: string;
  brandVoice: string;
  targetAudience: string;
  valueProposition: string;
  budgetMonthly: number;
  primaryColor: string | null;
  status: string;
}

export function CampaignSettingsForm({ campaign }: { campaign: CampaignData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const audience = (() => {
    try { return JSON.parse(campaign.targetAudience); }
    catch { return null; }
  })();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const painPoints = (form.get("painPoints") as string || "")
      .split("\n").map((s) => s.trim()).filter(Boolean);
    const goals = (form.get("goals") as string || "")
      .split("\n").map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: campaign.slug,
          name: form.get("name"),
          appName: form.get("appName"),
          industry: form.get("industry"),
          brandVoice: form.get("brandVoice"),
          targetAudience: JSON.stringify({
            demographics: form.get("demographics"),
            painPoints,
            goals,
          }),
          valueProposition: form.get("valueProposition"),
          budgetMonthly: form.get("budgetMonthly"),
          primaryColor: form.get("primaryColor"),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Settings</h1>
            <p className="text-sm text-muted-foreground">{campaign.name}</p>
          </div>
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />Edit
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Brand Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">App Name</p>
                <p className="mt-1 text-sm">{campaign.appName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</p>
                <p className="mt-1 text-sm">{campaign.industry}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Color</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-6 w-6 rounded border border-border" style={{ backgroundColor: campaign.primaryColor || "#888" }} />
                  <span className="font-mono text-sm">{campaign.primaryColor}</span>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="mt-1">{campaign.status}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Budget & Targeting</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Budget</p>
                <p className="mt-1 text-2xl font-bold font-mono">${campaign.budgetMonthly.toLocaleString()}</p>
              </div>
              <Separator />
              {audience && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demographics</p>
                    <p className="mt-1 text-sm">{audience.demographics}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pain Points</p>
                    <ul className="mt-1 space-y-1">
                      {audience.painPoints?.map((p: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">- {p}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Brand Voice</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{campaign.brandVoice}</p></CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Value Proposition</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{campaign.valueProposition}</p></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-sm text-muted-foreground">{campaign.name}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Brand Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Campaign Name</Label>
              <Input id="name" name="name" defaultValue={campaign.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appName" className="text-xs">App Name</Label>
              <Input id="appName" name="appName" defaultValue={campaign.appName} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs">Industry</Label>
              <Input id="industry" name="industry" defaultValue={campaign.industry} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="primaryColor" className="text-xs">Brand Color</Label>
              <input type="color" id="primaryColor" name="primaryColor" defaultValue={campaign.primaryColor || "#6366f1"} className="h-9 w-9 cursor-pointer rounded border border-input" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Budget & Targeting</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="budgetMonthly" className="text-xs">Monthly Budget ($)</Label>
              <Input id="budgetMonthly" name="budgetMonthly" type="number" defaultValue={campaign.budgetMonthly} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="demographics" className="text-xs">Demographics</Label>
              <Input id="demographics" name="demographics" defaultValue={audience?.demographics || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="painPoints" className="text-xs">Pain Points (one per line)</Label>
              <Textarea id="painPoints" name="painPoints" rows={3} defaultValue={audience?.painPoints?.join("\n") || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goals" className="text-xs">Goals (one per line)</Label>
              <Textarea id="goals" name="goals" rows={3} defaultValue={audience?.goals?.join("\n") || ""} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Brand Voice</CardTitle></CardHeader>
          <CardContent>
            <Textarea id="brandVoice" name="brandVoice" rows={4} defaultValue={campaign.brandVoice} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Value Proposition</CardTitle></CardHeader>
          <CardContent>
            <Textarea id="valueProposition" name="valueProposition" rows={4} defaultValue={campaign.valueProposition} />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
