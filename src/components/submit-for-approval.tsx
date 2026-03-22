"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubmitForApprovalProps {
  contentType: string;
  contentId: string;
  currentStatus: string;
}

export function SubmitForApproval({ contentType, contentId, currentStatus }: SubmitForApprovalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  if (currentStatus !== "draft") {
    return null;
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/content/submit-for-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId }),
      });

      if (res.ok) {
        setSubmitted(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Button size="sm" variant="outline" disabled className="h-7 gap-1 text-xs">
        <CheckCircle2 className="h-3 w-3" />
        Submitted
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleSubmit}
      disabled={loading}
      className="h-7 gap-1 text-xs"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
      Submit for Approval
    </Button>
  );
}
