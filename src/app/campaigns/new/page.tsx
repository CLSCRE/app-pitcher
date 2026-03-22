"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Rocket } from "lucide-react";
import Link from "next/link";

export default function NewCampaign() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const painPoints = (form.get("painPoints") as string || "")
      .split("\n").map((s) => s.trim()).filter(Boolean);
    const goals = (form.get("goals") as string || "")
      .split("\n").map((s) => s.trim()).filter(Boolean);

    const body = {
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
    };

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create campaign");
        return;
      }
      router.push(`/campaigns/${data.slug}`);
    } catch {
      setError("Failed to create campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/campaigns" className="rounded-md p-1.5 transition-colors hover:bg-accent">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Campaign</h1>
          <p className="text-sm text-muted-foreground">
            Set up a new marketing campaign for your app
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Campaign Name <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" placeholder="e.g., Land to Yield" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appName" className="text-xs">App Name <span className="text-destructive">*</span></Label>
              <Input id="appName" name="appName" placeholder="e.g., Land to Yield" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs">Industry <span className="text-destructive">*</span></Label>
              <Input id="industry" name="industry" placeholder="e.g., Real Estate / Land Investment" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="primaryColor" className="text-xs">Brand Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" id="primaryColor" name="primaryColor" defaultValue="#6366f1" className="h-9 w-9 cursor-pointer rounded border border-input" />
                <span className="text-xs text-muted-foreground">Pick your brand color</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budgetMonthly" className="text-xs">Monthly Budget ($)</Label>
              <Input id="budgetMonthly" name="budgetMonthly" type="number" placeholder="2000" defaultValue="0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Target Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="demographics" className="text-xs">Demographics</Label>
              <Input id="demographics" name="demographics" placeholder="e.g., Ages 25-55, income $60k+, interested in investing" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="painPoints" className="text-xs">Pain Points (one per line)</Label>
              <Textarea id="painPoints" name="painPoints" rows={3} placeholder={"Don't know where to start\nOverwhelmed by complexity\nWant passive income"} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goals" className="text-xs">Goals (one per line)</Label>
              <Textarea id="goals" name="goals" rows={3} placeholder={"Build long-term wealth\nFind undervalued opportunities\nCalculate ROI confidently"} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Brand Voice & Positioning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="brandVoice" className="text-xs">Brand Voice</Label>
              <Textarea id="brandVoice" name="brandVoice" rows={3} placeholder="Describe the tone and personality of your brand's communication..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valueProposition" className="text-xs">Value Proposition</Label>
              <Textarea id="valueProposition" name="valueProposition" rows={3} placeholder="What makes your app unique and why should users choose it?" />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="lg:col-span-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="lg:col-span-2 flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
            ) : (
              <><Rocket className="mr-2 h-4 w-4" />Create Campaign</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
