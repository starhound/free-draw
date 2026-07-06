import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const required = [
  "index.html",
  "src/styles.css",
  "src/main.js",
  "manifest.webmanifest",
  "service-worker.js",
  "assets/icon.svg",
  "privacy.html"
];

for (const file of required) {
  await access(join(root, file));
}

const html = await readFile(join(root, "index.html"), "utf8");
const js = await readFile(join(root, "src/main.js"), "utf8");
const css = await readFile(join(root, "src/styles.css"), "utf8");
const manifest = JSON.parse(await readFile(join(root, "manifest.webmanifest"), "utf8"));
const serviceWorker = await readFile(join(root, "service-worker.js"), "utf8");
const publicDomainSources = JSON.parse(await readFile(join(root, "assets/public-domain/sources.json"), "utf8"));

for (const reference of ["src/styles.css", "src/main.js", "manifest.webmanifest", "assets/icon.svg"]) {
  if (!html.includes(reference)) {
    throw new Error(`index.html is missing ${reference}`);
  }
}

for (const cached of ["./index.html", "./src/styles.css", "./src/main.js", "./manifest.webmanifest", "./assets/icon.svg"]) {
  if (!serviceWorker.includes(cached)) {
    throw new Error(`service worker cache is missing ${cached}`);
  }
}

for (const source of publicDomainSources) {
  const file = `assets/public-domain/${source.file}`;
  await access(join(root, file));
  const svg = await readFile(join(root, file), "utf8");
  if (!svg.includes("<svg")) {
    throw new Error(`${file} is not an SVG`);
  }
  if (!source.source.startsWith("https://openclipart.org/detail/") || !source.license.includes("Public Domain")) {
    throw new Error(`${source.file} is missing public-domain source metadata`);
  }
  if (!serviceWorker.includes(`./${file}`)) {
    throw new Error(`service worker cache is missing ./${file}`);
  }
}

if (manifest.display !== "standalone") {
  throw new Error("manifest must use standalone display");
}

if (/https?:\/\//.test(`${html}\n${css}`)) {
  throw new Error("app shell should not depend on remote assets");
}

if (!css.includes(".canvas-frame canvas") || !css.includes("pointer-events: none")) {
  throw new Error("canvas layers must not intercept frame-level drawing input");
}

if (!js.includes('els.frame.addEventListener("pointerdown"')) {
  throw new Error("drawing input should be bound to the stable canvas frame");
}

if (!js.includes("const WIDTH = 1600") || !js.includes("const HEIGHT = 1000")) {
  throw new Error("drawing canvas should use the Fire tablet oriented 16:10 size");
}

if (!js.includes("makeGeneratedPage") || !js.includes("animals") || !js.includes("patterns") || !js.includes("PUBLIC_DOMAIN_SHEETS")) {
  throw new Error("generated coloring page library is missing");
}

const fakeContext = {
  save() {},
  restore() {},
  scale() {},
  translate() {},
  rotate() {},
  beginPath() {},
  closePath() {},
  moveTo() {},
  lineTo() {},
  bezierCurveTo() {},
  quadraticCurveTo() {},
  arc() {},
  ellipse() {},
  stroke() {},
  fill() {},
  fillRect() {},
  strokeRect() {},
  clearRect() {},
  drawImage() {},
  fillText() {},
  getImageData() {
    return { data: new Uint8ClampedArray(4), width: 1, height: 1 };
  },
  putImageData() {}
};

const fakeElement = {
  value: "22",
  style: { setProperty() {}, getPropertyValue() { return ""; } },
  classList: { toggle() {} },
  dataset: {},
  addEventListener() {},
  setAttribute() {},
  append() {},
  replaceChildren() {},
  getContext() { return fakeContext; },
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 1600, height: 1000 };
  }
};

const scriptBody = js.replace(/\ninit\(\);\s*$/, "\n");
const sandbox = {
  console,
  Uint8ClampedArray,
  Image: class {},
  localStorage: { getItem() { return null; }, setItem() {} },
  navigator: {},
  document: {
    querySelector() {
      return { ...fakeElement };
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { ...fakeElement };
    }
  },
  window: {
    addEventListener() {},
    confirm() { return true; },
    setTimeout(callback) { callback(); },
    requestIdleCallback(callback) { callback(); }
  }
};
sandbox.__ctx = fakeContext;
sandbox.globalThis = sandbox;

vm.runInNewContext(`${scriptBody}
globalThis.__pageCount = PAGES.length;
for (const page of PAGES) {
  page.draw(globalThis.__ctx);
}
`, sandbox, { filename: "src/main.js" });

if (sandbox.__pageCount < 250) {
  throw new Error(`expected at least 250 coloring pages, found ${sandbox.__pageCount}`);
}

console.log("Smoke checks passed");
