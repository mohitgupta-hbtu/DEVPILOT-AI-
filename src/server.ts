import "./lib/error-capture";
import { spawn } from "child_process";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

let fastApiSpawned = false;

function ensureFastApiRunning() {
  if (fastApiSpawned) return;
  fastApiSpawned = true;
  console.info("[Node Server] Spawning Python FastAPI server on 127.0.0.1:8000...");

  // Use platform-aware command: python -m uvicorn works on both Windows and Linux
  const isWindows = process.platform === "win32";
  const pythonCmd = isWindows ? "python" : "python3";

  const child = spawn(
    pythonCmd,
    ["-m", "uvicorn", "app.main:app", "--port", "8000", "--host", "127.0.0.1"],
    {
      stdio: "inherit",
      cwd: "backend",
      env: {
        ...process.env,
        PYTHONPATH: "backend",
      },
    },
  );

  child.on("error", (err) => {
    console.error("[Node Server] Failed to start FastAPI server:", err);
  });

  process.on("exit", () => {
    child.kill();
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      ensureFastApiRunning();
      const targetUrl = `http://127.0.0.1:8000${url.pathname}${url.search}`;
      console.log(`[Proxy] Routing ${request.method} ${url.pathname} to ${targetUrl}`);

      const headers = new Headers();
      request.headers.forEach((value, key) => {
        headers.set(key, value);
      });
      headers.set("host", "127.0.0.1:8000");

      let body: string | undefined = undefined;
      if (request.method !== "GET" && request.method !== "HEAD") {
        body = await request.clone().text();
      }

      try {
        let attempts = 0;
        let response: Response | null = null;
        while (attempts < 6) {
          try {
            response = await fetch(targetUrl, {
              method: request.method,
              headers,
              body,
            });
            break;
          } catch (fetchErr) {
            attempts++;
            console.log(`[Proxy] FastAPI not ready yet, retrying in 1s (attempt ${attempts}/6)...`);
            await new Promise((r) => setTimeout(r, 1000));
          }
        }

        if (response) {
          return response;
        } else {
          return new Response(
            JSON.stringify({
              error: "Backend service is booting up. Please try again in a few seconds.",
            }),
            {
              status: 503,
              headers: { "content-type": "application/json" },
            },
          );
        }
      } catch (proxyError) {
        console.error("[Proxy] Error connecting to FastAPI:", proxyError);
        return new Response(
          JSON.stringify({ error: "Failed to proxy request to backend: " + String(proxyError) }),
          {
            status: 502,
            headers: { "content-type": "application/json" },
          },
        );
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
