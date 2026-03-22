"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApprovalActionsProps {
  approvalItemId: string;
  currentStatus: string;
}

export function ApprovalActions({ approvalItemId, currentStatus }: ApprovalActionsProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const router = useRouter();

  async function handleAction(action: string) {
    setLoading(action);
    try {
      const res = await fetch("/api/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalItemId,
          action,
          reviewerNotes: notes || undefined,
        }),
      });

      if (res.ok) {
        setResolved(true);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  if (resolved) {
    return (
      <Badge variant="secondary" className="text-xs">
        Resolved
      </Badge>
    );
  }

  if (currentStatus !== "pending") {
    return (
      <Badge variant="outline" className="text-xs capitalize">
        {currentStatus}
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
          className="h-7 gap-1 bg-green-600 text-xs hover:bg-green-700"
        >
          {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleAction("reject")}
          disabled={loading !== null}
          className="h-7 gap-1 text-xs"
        >
          {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowNotes(!showNotes)}
          disabled={loading !== null}
          className="h-7 gap-1 text-xs"
        >
          <MessageSquare className="h-3 w-3" />
          Notes
        </Button>
      </div>
      {showNotes && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add reviewer notes (optional for approve/reject, recommended for changes requested)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="text-xs"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAction("request-changes")}
            disabled={loading !== null}
            className="h-7 gap-1 text-xs"
          >
            {loading === "request-changes" ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
            Request Changes
          </Button>
        </div>
      )}
    </div>
  );
}
