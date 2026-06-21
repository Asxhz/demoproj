import { browserbase } from "./config";

const API = "https://api.browserbase.com/v1";

function headers() {
  return {
    "X-BB-API-Key": browserbase.apiKey(),
    "Content-Type": "application/json",
  };
}

// Create a cloud browser session and return a shareable live-view URL.
export async function createBrowserbaseSession(): Promise<{
  id: string;
  liveViewUrl: string;
}> {
  const res = await fetch(`${API}/sessions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ projectId: browserbase.projectId() }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Browserbase ${res.status}: ${await res.text()}`);
  }
  const session = (await res.json()) as { id: string };

  let liveViewUrl = `https://www.browserbase.com/sessions/${session.id}`;
  try {
    const dbg = await fetch(`${API}/sessions/${session.id}/debug`, {
      headers: headers(),
      cache: "no-store",
    });
    if (dbg.ok) {
      const data = (await dbg.json()) as {
        debuggerFullscreenUrl?: string;
        debuggerUrl?: string;
      };
      liveViewUrl = data.debuggerFullscreenUrl || data.debuggerUrl || liveViewUrl;
    }
  } catch {
    // fall back to dashboard URL
  }

  return { id: session.id, liveViewUrl };
}
