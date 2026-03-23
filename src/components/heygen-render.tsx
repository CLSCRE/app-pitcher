"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, Loader2, CheckCircle2, XCircle, ExternalLink, Download } from "lucide-react";

interface HeyGenRenderProps {
  scriptId: string;
  heygenVideoId: string | null;
  heygenStatus: string | null;
}

export function HeyGenRender({ scriptId, heygenVideoId, heygenStatus: initialStatus }: HeyGenRenderProps) {
  const [status, setStatus] = useState(initialStatus);
  const [videoId, setVideoId] = useState(heygenVideoId);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [avatarId, setAvatarId] = useState("");
  const [background, setBackground] = useState("dark");

  // Poll for status when processing
  useEffect(() => {
    if (!videoId || status !== "processing") return;

    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/heygen?videoId=${videoId}&scriptId=${scriptId}`);
        const data = await res.json();
        if (data.status === "completed") {
          setStatus("completed");
          setVideoUrl(data.videoUrl);
          setPolling(false);
          clearInterval(interval);
        } else if (data.status === "failed") {
          setStatus("failed");
          setError("Video rendering failed");
          setPolling(false);
          clearInterval(interval);
        }
      } catch {
        // Keep polling on network errors
      }
    }, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [videoId, status, scriptId]);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/heygen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptId,
          avatarId: avatarId || undefined,
          background,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        return;
      }
      setVideoId(data.videoId);
      setStatus("processing");
      setOpen(false);
    } catch {
      setError("Failed to submit to HeyGen");
    } finally {
      setSubmitting(false);
    }
  }

  // Already rendered
  if (status === "completed" && videoUrl) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="gap-1 text-[10px]">
          <CheckCircle2 className="h-3 w-3" />
          Rendered
        </Badge>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
            <Download className="h-3 w-3" />
            Download
          </Button>
        </a>
      </div>
    );
  }

  // Processing
  if (status === "processing") {
    return (
      <Badge variant="secondary" className="gap-1 text-[10px] animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin" />
        Rendering...
      </Badge>
    );
  }

  // Failed
  if (status === "failed") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="gap-1 text-[10px]">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-xs font-medium shadow-xs transition-colors hover:bg-accent h-7">
            Retry
          </DialogTrigger>
          <RenderDialog
            avatarId={avatarId}
            setAvatarId={setAvatarId}
            background={background}
            setBackground={setBackground}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        </Dialog>
      </div>
    );
  }

  // Not yet submitted
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium shadow-xs transition-colors hover:bg-accent h-7">
        <Film className="h-3 w-3" />
        Render Video
      </DialogTrigger>
      <RenderDialog
        avatarId={avatarId}
        setAvatarId={setAvatarId}
        background={background}
        setBackground={setBackground}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
    </Dialog>
  );
}

function RenderDialog({
  avatarId,
  setAvatarId,
  background,
  setBackground,
  onSubmit,
  submitting,
  error,
}: {
  avatarId: string;
  setAvatarId: (v: string) => void;
  background: string;
  setBackground: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Render with HeyGen</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="avatarId" className="text-xs">Avatar ID (optional)</Label>
          <Input
            id="avatarId"
            placeholder="Leave blank for default avatar"
            value={avatarId}
            onChange={(e) => setAvatarId(e.target.value)}
          />
          <p className="text-[10px] text-muted-foreground">
            Find avatar IDs in your <a href="https://app.heygen.com/avatars" target="_blank" rel="noopener noreferrer" className="underline">HeyGen dashboard</a>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Background</Label>
          <div className="flex gap-2">
            {[
              { value: "dark", label: "Dark" },
              { value: "transparent", label: "Transparent" },
              { value: "custom", label: "Custom Image" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBackground(opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  background === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {background === "transparent" && (
            <p className="text-[10px] text-muted-foreground">
              Avatar will render with no background — great for compositing into other scenes.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
        )}

        <Button onClick={onSubmit} disabled={submitting} className="w-full">
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
          ) : (
            <><Film className="mr-2 h-4 w-4" />Send to HeyGen</>
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Rendering typically takes 2-5 minutes. Status will update automatically.
        </p>
      </div>
    </DialogContent>
  );
}
