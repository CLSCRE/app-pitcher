"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Settings, Loader2 } from "lucide-react";

interface IntegrationField {
  name: string;
  label: string;
  type: "text" | "password";
  placeholder: string;
}

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  status: "connected" | "not-connected" | "available";
  fields?: IntegrationField[];
  onConnect?: (data: Record<string, string>) => Promise<void>;
}

export function IntegrationCard({
  name,
  description,
  icon,
  color,
  status: initialStatus,
  fields,
  onConnect,
}: IntegrationCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  async function handleConnect() {
    if (!onConnect) return;
    setLoading(true);
    try {
      await onConnect(formData);
      setStatus("connected");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="transition-colors hover:bg-accent/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
            <CardTitle className="text-sm">{name}</CardTitle>
          </div>
          <Badge
            variant={status === "connected" ? "default" : status === "available" ? "secondary" : "outline"}
            className="text-[10px] gap-1"
          >
            {status === "connected" && <CheckCircle2 className="h-3 w-3" />}
            {status === "connected" ? "Connected" : status === "available" ? "Via MCP" : "Setup Needed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{description}</p>

        {fields && fields.length > 0 ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground">
              {status === "connected" ? (
                <><Settings className="h-3 w-3" /> Configure</>
              ) : (
                "Connect"
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect {name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {fields.map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs">{field.label}</Label>
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  </div>
                ))}
                <Button onClick={handleConnect} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {status === "connected" ? "Update Connection" : "Connect"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button variant="outline" className="w-full text-xs" size="sm" disabled={status === "available"}>
            {status === "available" ? "Available via MCP" : "Connect"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
