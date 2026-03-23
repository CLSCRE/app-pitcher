"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  Video,
  BarChart3,
  Search,
  Share2,
  CheckCircle2,
  LineChart,
  Zap,
  Plug,
  Settings,
  Dog,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

interface Campaign {
  slug: string;
  name: string;
  primaryColor: string | null;
}

const mainNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/approvals", label: "Approvals", icon: CheckCircle2, badge: true },
];

function getCampaignNav(slug: string) {
  return [
    { href: `/campaigns/${slug}`, label: "Overview", icon: Megaphone },
    { href: `/campaigns/${slug}/video-ads`, label: "Video Ads", icon: Video },
    { href: `/campaigns/${slug}/google-ads`, label: "Google Ads", icon: BarChart3 },
    { href: `/campaigns/${slug}/seo`, label: "SEO Content", icon: Search },
    { href: `/campaigns/${slug}/social`, label: "Social Media", icon: Share2 },
    { href: `/campaigns/${slug}/settings`, label: "Settings", icon: Settings },
  ];
}

const bottomNav = [
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/automation", label: "Automation", icon: Zap },
  { href: "/integrations", label: "Integrations", icon: Plug },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Detect active campaign from URL
  const slugFromUrl = pathname.match(/\/campaigns\/([^/]+)/)?.[1];

  const [activeCampaignSlug, setActiveCampaignSlug] = useState<string | null>(slugFromUrl || null);

  // Fetch campaigns and pending count
  useEffect(() => {
    fetch("/api/sidebar-data")
      .then((r) => r.json())
      .then((data) => {
        setCampaigns(data.campaigns || []);
        setPendingCount(data.pendingCount || 0);
        if (!activeCampaignSlug && data.campaigns?.length > 0) {
          setActiveCampaignSlug(data.campaigns[0].slug);
        }
      })
      .catch(() => {});
  }, []);

  // Sync active campaign when URL changes
  useEffect(() => {
    if (slugFromUrl) {
      setActiveCampaignSlug(slugFromUrl);
    }
  }, [slugFromUrl]);

  const activeCampaign = campaigns.find((c) => c.slug === activeCampaignSlug) || campaigns[0];
  const campaignNav = activeCampaign ? getCampaignNav(activeCampaign.slug) : [];

  function handleCampaignSwitch(campaign: Campaign) {
    setActiveCampaignSlug(campaign.slug);
    // Navigate to the same sub-page but for the new campaign
    if (slugFromUrl) {
      const subPath = pathname.replace(`/campaigns/${slugFromUrl}`, "");
      router.push(`/campaigns/${campaign.slug}${subPath}`);
    } else {
      router.push(`/campaigns/${campaign.slug}`);
    }
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Dog className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">App Pitcher</h1>
          <p className="text-[10px] text-muted-foreground">Marketing Command Center</p>
        </div>
      </div>

      <Separator />

      {/* Main Nav */}
      <nav className="flex flex-col gap-0.5 px-2 py-3">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {item.badge && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px]">
                {pendingCount}
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      <Separator />

      {/* Campaign Switcher */}
      <div className="px-2 py-3">
        <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Campaign
        </p>
        {activeCampaign ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2 truncate">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: activeCampaign.primaryColor || "#888" }}
                />
                {activeCampaign.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {campaigns.map((campaign) => (
                <DropdownMenuItem
                  key={campaign.slug}
                  onClick={() => handleCampaignSwitch(campaign)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: campaign.primaryColor || "#888" }}
                    />
                    {campaign.name}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="px-2.5 text-xs text-muted-foreground">Loading...</p>
        )}
      </div>

      {/* Campaign Nav */}
      <nav className="flex flex-col gap-0.5 px-2">
        {campaignNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      <Separator />

      {/* Bottom Nav */}
      <nav className="flex flex-col gap-0.5 px-2 py-3">
        {bottomNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
