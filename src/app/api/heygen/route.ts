import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function getApiKey(): string | null {
  return process.env.HEYGEN_API_KEY || null;
}

// Submit a script to HeyGen for video generation
export async function POST(req: NextRequest) {
  const { scriptId, avatarId, background } = await req.json();

  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "HeyGen API key not configured. Add HEYGEN_API_KEY to environment variables." },
      { status: 400 }
    );
  }

  const script = await db.videoScript.findUnique({ where: { id: scriptId } });
  if (!script) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  // Extract voiceover text from the script, or use the full script
  const inputText = script.voiceoverText || extractVoiceover(script.script);

  try {
    // Create video via HeyGen API v2
    const response = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarId || process.env.HEYGEN_AVATAR_ID || "default",
              avatar_style: "normal",
            },
            voice: {
              type: "text",
              input_text: inputText,
              voice_id: process.env.HEYGEN_VOICE_ID || undefined,
            },
            background: background === "transparent"
              ? { type: "transparent" }
              : background === "custom" && process.env.HEYGEN_BG_URL
                ? { type: "image", value: process.env.HEYGEN_BG_URL }
                : { type: "color", value: "#1a1a2e" },
          },
        ],
        dimension: { width: 1920, height: 1080 },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.message || result.error || "HeyGen API error" },
        { status: response.status }
      );
    }

    const videoId = result.data?.video_id;

    // Update the script record with HeyGen video ID
    await db.videoScript.update({
      where: { id: scriptId },
      data: {
        heygenVideoId: videoId,
        heygenStatus: "processing",
      },
    });

    return NextResponse.json({ success: true, videoId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit to HeyGen" },
      { status: 500 }
    );
  }
}

// Check video status
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");
  const scriptId = req.nextUrl.searchParams.get("scriptId");

  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "HeyGen API key not configured" }, { status: 400 });
  }

  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: { "X-Api-Key": apiKey },
    });

    const result = await response.json();
    const status = result.data?.status;
    const videoUrl = result.data?.video_url;
    const thumbnailUrl = result.data?.thumbnail_url;

    // Update script if we have a scriptId and the video is completed
    if (scriptId && (status === "completed" || status === "failed")) {
      await db.videoScript.update({
        where: { id: scriptId },
        data: {
          heygenStatus: status,
          thumbnailUrl: thumbnailUrl || null,
        },
      });
    }

    return NextResponse.json({
      status,
      videoUrl,
      thumbnailUrl,
      duration: result.data?.duration,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check status" },
      { status: 500 }
    );
  }
}

function extractVoiceover(script: string): string {
  // Try to extract VOICEOVER TEXT section
  const voiceoverMatch = script.match(/VOICEOVER TEXT:\s*\n([\s\S]*?)(?:\n---|\n\n\n|$)/i);
  if (voiceoverMatch) return voiceoverMatch[1].trim();

  // Try to extract NARRATOR lines
  const narratorLines = script.match(/NARRATOR.*?:\s*["""](.+?)["""]/g);
  if (narratorLines) {
    return narratorLines
      .map((line) => line.replace(/NARRATOR.*?:\s*["""]/, "").replace(/["""]$/, ""))
      .join(" ");
  }

  // Fallback: use first 500 chars of script
  return script.slice(0, 500);
}
