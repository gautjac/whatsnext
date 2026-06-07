import type { Context } from "@netlify/functions";
import { runTryout, type TryoutRequest } from "./lib/engine.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: TryoutRequest;
  try {
    body = (await req.json()) as TryoutRequest;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body.profile || typeof body.profile !== "object") return json({ error: "Missing profile" }, 400);
  if (!body.hobby || body.hobby.trim().length < 1) return json({ error: "Missing hobby" }, 400);

  // NDJSON streaming with heartbeats — see argue.mts for the rationale.
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let done = false;
      const beat = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode("\n"));
          } catch {
            /* stream already closed */
          }
        }
      }, 3000);

      try {
        const result = await runTryout(body);
        done = true;
        clearInterval(beat);
        controller.enqueue(enc.encode(JSON.stringify({ result }) + "\n"));
      } catch (err) {
        done = true;
        clearInterval(beat);
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(enc.encode(JSON.stringify({ error: message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
};
