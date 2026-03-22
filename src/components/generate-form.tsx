"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Save, RotateCcw } from "lucide-react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface GenerateFormProps {
  title: string;
  description: string;
  apiEndpoint: string;
  campaignSlug: string;
  fields: FormField[];
  onSave?: (content: string, formData: Record<string, string>) => void;
}

export function GenerateForm({
  title,
  description,
  apiEndpoint,
  campaignSlug,
  fields,
  onSave,
}: GenerateFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    setOutput("");

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignSlug, ...formData }),
      });

      if (!response.ok) {
        setOutput(`Error: ${response.statusText}`);
        setIsGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setOutput("Error: No response stream");
        setIsGenerating(false);
        return;
      }

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setOutput(accumulated);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Generation failed"}`);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!output || !onSave) return;
    setIsSaving(true);
    try {
      await onSave(output, formData);
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setOutput("");
    setFormData({});
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input Form */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs">
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
              {output && (
                <Button variant="outline" onClick={handleReset} size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Output Preview */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generated Output</CardTitle>
              <div className="flex items-center gap-2">
                {isGenerating && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Streaming...
                  </Badge>
                )}
                {output && !isGenerating && onSave && (
                  <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {output ? (
              <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-mono text-xs leading-relaxed max-h-[600px] overflow-auto">
                {output}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Sparkles className="mb-3 h-8 w-8" />
                <p className="text-sm">Configure your inputs and hit Generate</p>
                <p className="mt-1 text-xs">AI-generated content will stream here in real time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
