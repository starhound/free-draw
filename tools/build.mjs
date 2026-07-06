import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = join(root, "docs");
const entries = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "privacy.html",
  "src",
  "assets"
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await cp(join(root, entry), join(dist, entry), { recursive: true });
}

console.log("Built static app in docs/");
