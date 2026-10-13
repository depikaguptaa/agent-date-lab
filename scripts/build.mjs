import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const files = {
  "/index.html": { source: "src/index.html", type: "text/html; charset=utf-8" },
  "/app.js": { source: "src/app.js", type: "text/javascript; charset=utf-8" },
  "/people.js": { source: "src/people.js", type: "text/javascript; charset=utf-8" },
  "/styles.css": { source: "src/styles.css", type: "text/css; charset=utf-8" },
};
const version = createHash("sha256").update(await readFile(resolve(root, files["/app.js"].source))).update(await readFile(resolve(root, files["/people.js"].source))).update(await readFile(resolve(root, files["/styles.css"].source))).digest("hex").slice(0,12);
const assetMap = {};
for (const [url, file] of Object.entries(files)) {
  const body = await readFile(resolve(root, file.source), "utf8");
  assetMap[url] = { body: url === "/index.html" ? body.replaceAll("__ASSET_VERSION__", version) : body, type: file.type };
}

const template = await readFile(resolve(root, "worker/index.template.js"), "utf8");
const output = template.replace("__ASSET_MAP__", () => JSON.stringify(assetMap));
if (output === template) throw new Error("Worker template marker was not replaced.");
const workerPath = resolve(dist, "server/index.js");
await mkdir(dirname(workerPath), { recursive: true });
await writeFile(workerPath, output);
const publicDir = resolve(dist, "public");
await mkdir(publicDir, { recursive: true });
for (const [url, file] of Object.entries(assetMap)) {
  await writeFile(resolve(publicDir, url.slice(1)), file.body);
}
await mkdir(resolve(dist, ".openai"), { recursive: true });
await copyFile(resolve(root, ".openai/hosting.json"), resolve(dist, ".openai/hosting.json"));
console.log(`Built ${workerPath}`);
