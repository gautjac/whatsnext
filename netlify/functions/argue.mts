import type { Context } from "@netlify/functions";
import { runArgue, type ArgueRequest } from "./lib/engine.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: ArgueRequest;
  try {
    body = (await req.json()) as ArgueRequest;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body.profile || typeof body.profile !== "object") return json({ error: "Missing profile" }, 400);

  // An Opus argument can outlast the synchronous proxy's idle timeout (~26s),
  // which returns unparseable HTML. We stream NDJSON instead: a bare-newline
  // heartbeat every 3s holds the connection, then a final { result } (or
  // { error }) line carries the payload. The client reads to end-of-stream and
  // parses the last non-empty line.
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
        const result = await runArgue(body);
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
