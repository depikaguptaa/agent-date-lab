import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = await readFile(resolve("dist/server/index.js"), "utf8");
const manifest = JSON.parse(await readFile(resolve("dist/.openai/hosting.json"), "utf8"));
assert.ok(manifest.project_id, "hosting manifest must contain a site project id");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const worker = await import(moduleUrl);
assert.equal(typeof worker.default?.fetch, "function", "worker must export default.fetch");
console.log("Artifact is valid ESM and exports default.fetch");
