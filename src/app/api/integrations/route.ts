import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Simple key-value store for integration credentials using a dedicated table
// For now, we'll use environment variables as fallback and store in-memory for the session
// In production, use a proper secrets manager

let integrationStore: Record<string, Record<string, string>> = {};

export async function POST(req: NextRequest) {
  const { integration, credentials } = await req.json();

  if (!integration || !credentials) {
    return NextResponse.json({ error: "Missing integration or credentials" }, { status: 400 });
  }

  integrationStore[integration] = credentials;

  return NextResponse.json({ success: true, integration });
}

export async function GET(req: NextRequest) {
  const integration = req.nextUrl.searchParams.get("integration");
  if (!integration) {
    return NextResponse.json({ integrations: Object.keys(integrationStore) });
  }

  const hasCredentials = !!integrationStore[integration] ||
    (integration === "heygen" && !!process.env.HEYGEN_API_KEY);

  return NextResponse.json({ connected: hasCredentials });
}

export function getHeyGenApiKey(): string | null {
  return integrationStore["heygen"]?.apiKey || process.env.HEYGEN_API_KEY || null;
}

export function getHeyGenAvatarId(): string | null {
  return integrationStore["heygen"]?.avatarId || process.env.HEYGEN_AVATAR_ID || null;
}
