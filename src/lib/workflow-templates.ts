export interface WorkflowStep {
  id: string;
  name: string;
  type: "generate" | "review" | "publish" | "analyze" | "wait";
  contentType?: "video-script" | "google-ad" | "seo-article" | "social-post";
  config?: Record<string, string>;
  description: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  triggerType: "schedule" | "manual" | "performance-threshold";
  triggerConfig: Record<string, string>;
  steps: WorkflowStep[];
  automationMode: "full-auto" | "semi-auto" | "manual";
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "weekly-content-cycle",
    name: "Weekly Content Cycle",
    description:
      "Generates a full week of content: social posts Monday, SEO article Tuesday, Google Ads review Wednesday, video script Thursday, and publishes all approved items Friday.",
    triggerType: "schedule",
    triggerConfig: { cron: "0 9 * * 1", timezone: "America/New_York" },
    automationMode: "semi-auto",
    steps: [
      {
        id: "mon-social",
        name: "Generate Social Posts",
        type: "generate",
        contentType: "social-post",
        config: { count: "3", platforms: "instagram,linkedin,x" },
        description: "Monday: Generate 3 social post drafts for the week",
      },
      {
        id: "mon-review",
        name: "Queue Social for Review",
        type: "review",
        description: "Submit social posts to approval queue",
      },
      {
        id: "tue-seo",
        name: "Generate SEO Article",
        type: "generate",
        contentType: "seo-article",
        config: { wordCount: "1500", articleType: "blog-post" },
        description: "Tuesday: Generate 1 SEO-optimized article",
      },
      {
        id: "tue-review",
        name: "Queue Article for Review",
        type: "review",
        description: "Submit article to approval queue",
      },
      {
        id: "wed-ads",
        name: "Review & Refresh Google Ads",
        type: "analyze",
        contentType: "google-ad",
        description: "Wednesday: Analyze ad performance and generate new copy variants",
      },
      {
        id: "thu-video",
        name: "Generate Video Script",
        type: "generate",
        contentType: "video-script",
        config: { style: "corgi-commercial", duration: "30" },
        description: "Thursday: Generate 1 video ad script concept",
      },
      {
        id: "thu-review",
        name: "Queue Script for Review",
        type: "review",
        description: "Submit video script to approval queue",
      },
      {
        id: "fri-publish",
        name: "Publish Approved Content",
        type: "publish",
        description: "Friday: Publish all approved items from the week",
      },
    ],
  },
  {
    id: "performance-reactor",
    name: "Performance Reactor",
    description:
      "Monitors Google Ads performance. When CTR drops below threshold, automatically generates replacement ad copy and queues it for approval.",
    triggerType: "performance-threshold",
    triggerConfig: { metric: "ctr", threshold: "2.0", operator: "below" },
    automationMode: "semi-auto",
    steps: [
      {
        id: "analyze",
        name: "Analyze Underperformers",
        type: "analyze",
        contentType: "google-ad",
        description: "Identify ad groups with CTR below threshold",
      },
      {
        id: "generate",
        name: "Generate Replacement Copy",
        type: "generate",
        contentType: "google-ad",
        description: "Generate new headlines and descriptions emphasizing winning themes",
      },
      {
        id: "review",
        name: "Queue for Review",
        type: "review",
        description: "Submit replacement copy for approval (or auto-publish if full-auto)",
      },
    ],
  },
  {
    id: "content-repurposer",
    name: "Content Repurposer",
    description:
      "When an SEO article is published, automatically extracts social media snippets and generates a video script summary.",
    triggerType: "manual",
    triggerConfig: { event: "article-published" },
    automationMode: "semi-auto",
    steps: [
      {
        id: "extract-social",
        name: "Extract Social Snippets",
        type: "generate",
        contentType: "social-post",
        config: { count: "5", source: "latest-article" },
        description: "Extract 5 social post snippets from the published article",
      },
      {
        id: "generate-video",
        name: "Generate Video Summary",
        type: "generate",
        contentType: "video-script",
        config: { style: "heygen-avatar", duration: "30", source: "latest-article" },
        description: "Generate a 30s video script summarizing the article",
      },
      {
        id: "review",
        name: "Queue All for Review",
        type: "review",
        description: "Submit all generated content to approval queue",
      },
    ],
  },
];
