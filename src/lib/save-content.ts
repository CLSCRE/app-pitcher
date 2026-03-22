export async function saveContent(
  contentType: string,
  campaignSlug: string,
  data: Record<string, string | undefined>,
  content: string
) {
  const res = await fetch("/api/content/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType,
      campaignSlug,
      data: { ...data, content },
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to save content");
  }

  return res.json();
}
