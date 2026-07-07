import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = join(root, "store", "assets", "screenshots");
const port = 5180;
const base = `http://127.0.0.1:${port}`;

await mkdir(out, { recursive: true });

const server = spawn(process.execPath, ["tools/server.mjs"], {
  cwd: root,
  env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"]
});

let serverText = "";
server.stdout.on("data", (chunk) => {
  serverText += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverText += chunk.toString();
});

await waitForServer();

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  serviceWorkers: "block"
});

try {
  const page = await context.newPage();
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.goto(`${base}/?screenshots=1`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Garden", exact: true }).click();
  await page.screenshot({
    path: join(out, "fire-tablet-real-01-drawing-studio.png"),
    fullPage: false
  });

  await page.getByText("Animal Friends").click();
  await page.getByRole("button", { name: "Kitty Window", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(out, "fire-tablet-real-02-animal-friends.png"),
    fullPage: false
  });

  await page.getByText("Storybook").click();
  await page.getByRole("button", { name: "Magic Beanstalk", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(out, "fire-tablet-real-03-storybook-pages.png"),
    fullPage: false
  });

  await page.getByRole("button", { name: "Brush", exact: true }).click();
  await page.getByText("Starter").click();
  await page.getByRole("button", { name: "Rocket", exact: true }).click();
  await page.waitForTimeout(500);
  const frame = await page.locator("#canvasFrame").boundingBox();
  if (frame) {
    const startX = frame.x + frame.width * 0.26;
    const startY = frame.y + frame.height * 0.42;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 0; i < 20; i += 1) {
      await page.mouse.move(startX + i * 26, startY + Math.sin(i / 2) * 64);
    }
    await page.mouse.up();
  }
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(out, "fire-tablet-real-04-draw-tools.png"),
    fullPage: false
  });

  await captureIcon(context, 512, join(root, "store", "assets", "icon-512.png"));
  await captureIcon(context, 114, join(root, "store", "assets", "icon-114.png"));
  await capturePromo(context, join(root, "store", "assets", "promo-1024x500.png"));
} finally {
  await browser.close();
  server.kill("SIGTERM");
}

async function captureIcon(context, size, path) {
  const page = await context.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`
    <html>
      <body style="margin:0;background:transparent">
        <img src="${base}/assets/icon.svg" style="display:block;width:${size}px;height:${size}px">
      </body>
    </html>
  `);
  await page.screenshot({ path, omitBackground: true });
  await page.close();
}

async function capturePromo(context, path) {
  const page = await context.newPage();
  await page.setViewportSize({ width: 1024, height: 500 });
  await page.setContent(`
    <html>
      <head>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            width: 1024px;
            height: 500px;
            overflow: hidden;
            color: #172033;
            background: #ffca3a;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          .wrap {
            display: grid;
            grid-template-columns: 1fr 392px;
            gap: 36px;
            width: 100%;
            height: 100%;
            padding: 46px 52px;
            align-items: center;
          }
          h1 {
            margin: 0 0 18px;
            font-size: 76px;
            line-height: 0.96;
            letter-spacing: 0;
          }
          p {
            margin: 0 0 26px;
            max-width: 510px;
            font-size: 30px;
            line-height: 1.15;
            font-weight: 800;
          }
          .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .chip {
            padding: 11px 16px;
            border: 3px solid #172033;
            border-radius: 8px;
            background: #fffdf7;
            font-size: 20px;
            font-weight: 900;
          }
          .preview {
            position: relative;
            height: 345px;
            border: 5px solid #172033;
            border-radius: 8px;
            background: #fffdf7;
            box-shadow: 12px 12px 0 rgba(23, 32, 51, 0.16);
          }
          .preview img {
            position: absolute;
            top: -42px;
            left: 104px;
            width: 160px;
            height: 160px;
            border-radius: 32px;
          }
          .line {
            position: absolute;
            left: 52px;
            right: 52px;
            border: 10px solid transparent;
            border-top-color: #ff4f6d;
            border-radius: 50%;
          }
          .line.one { top: 170px; height: 75px; transform: rotate(-5deg); }
          .line.two { top: 220px; height: 88px; border-top-color: #2f80ed; transform: rotate(4deg); }
          .dots {
            position: absolute;
            left: 78px;
            right: 78px;
            bottom: 38px;
            display: flex;
            justify-content: space-between;
          }
          .dot { width: 42px; height: 42px; border: 4px solid #172033; border-radius: 50%; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <main>
            <h1>Free Draw</h1>
            <p>Kids drawing and coloring studio for Fire tablets.</p>
            <div class="chips">
              <span class="chip">280+ pages</span>
              <span class="chip">No ads</span>
              <span class="chip">Offline</span>
              <span class="chip">Animal Friends</span>
            </div>
          </main>
          <section class="preview">
            <img src="${base}/assets/icon.svg" alt="">
            <div class="line one"></div>
            <div class="line two"></div>
            <div class="dots">
              <span class="dot" style="background:#ff4f6d"></span>
              <span class="dot" style="background:#35c46a"></span>
              <span class="dot" style="background:#2f80ed"></span>
              <span class="dot" style="background:#8957e5"></span>
            </div>
          </section>
        </div>
      </body>
    </html>
  `);
  await page.screenshot({ path, fullPage: false });
  await page.close();
}

console.log("Captured real app screenshots in store/assets/screenshots/");

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited early:\n${serverText}`);
    }
    try {
      const response = await fetch(base);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error(`Timed out waiting for server:\n${serverText}`);
}
