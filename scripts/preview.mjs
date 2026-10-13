import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";

const artifact = await readFile(resolve("dist/server/index.js"), "utf8");
const worker = await import(`data:text/javascript;base64,${Buffer.from(artifact).toString("base64")}`);
const port = Number(process.env.PORT || 4173);
createServer(async (incoming, outgoing) => {
  try {
    const request = new Request(`http://localhost:${port}${incoming.url}`, { method: incoming.method, headers: incoming.headers });
    const response = await worker.default.fetch(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    outgoing.writeHead(500, {"content-type":"text/plain; charset=utf-8"});
    outgoing.end(`Preview error: ${error.message}`);
  }
}).listen(port, "127.0.0.1", () => console.log(`Date Lab preview: http://127.0.0.1:${port}`));
