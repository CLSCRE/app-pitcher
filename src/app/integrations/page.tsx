"use client";

import { IntegrationCard } from "@/components/integration-card";
import { Separator } from "@/components/ui/separator";

const adIntegrations = [
  {
    name: "Google Ads",
    description: "Push ad copy, pull performance data, manage campaigns and ad groups automatically.",
    icon: "G",
    color: "#4285F4",
    status: "not-connected" as const,
    fields: [
      { name: "clientId", label: "OAuth Client ID", type: "text" as const, placeholder: "your-client-id.apps.googleusercontent.com" },
      { name: "clientSecret", label: "OAuth Client Secret", type: "password" as const, placeholder: "Client secret" },
      { name: "developerToken", label: "Developer Token", type: "password" as const, placeholder: "Google Ads developer token" },
      { name: "customerId", label: "Customer ID", type: "text" as const, placeholder: "123-456-7890" },
    ],
  },
  {
    name: "Google Search Console",
    description: "Pull keyword rankings, impressions, clicks, and organic traffic data for SEO tracking.",
    icon: "S",
    color: "#EA4335",
    status: "not-connected" as const,
    fields: [
      { name: "siteUrl", label: "Site URL", type: "text" as const, placeholder: "https://yourapp.com" },
      { name: "apiKey", label: "API Key", type: "password" as const, placeholder: "Search Console API key" },
    ],
  },
];

const videoIntegrations = [
  {
    name: "HeyGen",
    description: "Submit video scripts to HeyGen, select AI avatars, render videos, and download results.",
    icon: "H",
    color: "#7C3AED",
    status: "not-connected" as const,
    fields: [
      { name: "apiKey", label: "HeyGen API Key", type: "password" as const, placeholder: "Your HeyGen API key" },
      { name: "avatarId", label: "Default Avatar ID (optional)", type: "text" as const, placeholder: "avatar_id" },
    ],
  },
];

const socialIntegrations = [
  {
    name: "Meta (Facebook / Instagram)",
    description: "Publish posts to Facebook and Instagram, pull engagement and reach metrics.",
    icon: "M",
    color: "#1877F2",
    status: "not-connected" as const,
    fields: [
      { name: "accessToken", label: "Page Access Token", type: "password" as const, placeholder: "Long-lived page token" },
      { name: "pageId", label: "Page ID", type: "text" as const, placeholder: "Your Facebook Page ID" },
    ],
  },
  {
    name: "X (Twitter)",
    description: "Publish tweets and threads, track engagement, impressions, and follower growth.",
    icon: "X",
    color: "#000000",
    status: "not-connected" as const,
    fields: [
      { name: "apiKey", label: "API Key", type: "password" as const, placeholder: "X API key" },
      { name: "apiSecret", label: "API Secret", type: "password" as const, placeholder: "X API secret" },
      { name: "accessToken", label: "Access Token", type: "password" as const, placeholder: "Access token" },
      { name: "accessSecret", label: "Access Token Secret", type: "password" as const, placeholder: "Access token secret" },
    ],
  },
  {
    name: "LinkedIn",
    description: "Publish professional posts, track engagement data and follower analytics.",
    icon: "L",
    color: "#0A66C2",
    status: "not-connected" as const,
    fields: [
      { name: "accessToken", label: "Access Token", type: "password" as const, placeholder: "LinkedIn access token" },
      { name: "orgId", label: "Organization ID", type: "text" as const, placeholder: "Organization URN" },
    ],
  },
];

const mcpIntegrations = [
  {
    name: "Make.com",
    description: "Orchestrate complex multi-step workflows across 1000+ services. Available via your MCP connection.",
    icon: "M",
    color: "#6366F1",
    status: "available" as const,
  },
  {
    name: "Canva",
    description: "Generate social media graphics, ad creatives, and visual content. Available via your MCP connection.",
    icon: "C",
    color: "#00C4CC",
    status: "available" as const,
  },
  {
    name: "Apollo.io",
    description: "Audience research, lead enrichment, and contact discovery. Available via your MCP connection.",
    icon: "A",
    color: "#F59E0B",
    status: "available" as const,
  },
];

export default function IntegrationsPage() {
  async function handleConnect(integration: string, data: Record<string, string>) {
    await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ integration, credentials: data }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect services to power your marketing machine
        </p>
      </div>

      {/* Advertising */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Advertising & SEO
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adIntegrations.map((i) => (
            <IntegrationCard key={i.name} {...i} onConnect={handleConnect} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Video */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Video Production
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videoIntegrations.map((i) => (
            <IntegrationCard key={i.name} {...i} onConnect={handleConnect} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Social */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Social Media
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {socialIntegrations.map((i) => (
            <IntegrationCard key={i.name} {...i} onConnect={handleConnect} />
          ))}
        </div>
      </div>

      <Separator />

      {/* MCP */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Available via MCP (Already Connected)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mcpIntegrations.map((i) => (
            <IntegrationCard key={i.name} {...i} />
          ))}
        </div>
      </div>
    </div>
  );
}
