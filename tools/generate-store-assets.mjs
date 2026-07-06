import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = join(root, "store", "assets");
const screenshots = join(out, "screenshots");

const COLORS = {
  ink: [23, 32, 51, 255],
  muted: [105, 115, 134, 255],
  paper: [255, 253, 247, 255],
  bg: [232, 238, 246, 255],
  panel: [255, 255, 255, 255],
  line: [215, 222, 234, 255],
  yellow: [255, 202, 58, 255],
  orange: [255, 138, 0, 255],
  pink: [255, 79, 109, 255],
  green: [53, 196, 106, 255],
  teal: [25, 183, 168, 255],
  blue: [47, 128, 237, 255],
  purple: [137, 87, 229, 255]
};

class Image {
  constructor(width, height, fill = COLORS.bg) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
    this.fill(fill);
  }

  fill(color) {
    for (let i = 0; i < this.data.length; i += 4) {
      this.data.set(color, i);
    }
  }

  set(x, y, color) {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) {
      return;
    }
    const index = (py * this.width + px) * 4;
    this.data[index] = color[0];
    this.data[index + 1] = color[1];
    this.data[index + 2] = color[2];
    this.data[index + 3] = color[3] ?? 255;
  }

  rect(x, y, w, h, color) {
    for (let py = Math.max(0, Math.floor(y)); py < Math.min(this.height, Math.ceil(y + h)); py += 1) {
      for (let px = Math.max(0, Math.floor(x)); px < Math.min(this.width, Math.ceil(x + w)); px += 1) {
        this.set(px, py, color);
      }
    }
  }

  strokeRect(x, y, w, h, color, size = 3) {
    this.rect(x, y, w, size, color);
    this.rect(x, y + h - size, w, size, color);
    this.rect(x, y, size, h, color);
    this.rect(x + w - size, y, size, h, color);
  }

  circle(cx, cy, r, color) {
    const r2 = r * r;
    for (let y = cy - r; y <= cy + r; y += 1) {
      for (let x = cx - r; x <= cx + r; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          this.set(x, y, color);
        }
      }
    }
  }

  strokeCircle(cx, cy, r, color, size = 4) {
    const outer = r * r;
    const inner = (r - size) * (r - size);
    for (let y = cy - r; y <= cy + r; y += 1) {
      for (let x = cx - r; x <= cx + r; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        const d = dx * dx + dy * dy;
        if (d <= outer && d >= inner) {
          this.set(x, y, color);
        }
      }
    }
  }

  line(x0, y0, x1, y1, color, size = 3) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i += 1) {
      const t = steps === 0 ? 0 : i / steps;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      this.circle(x, y, size / 2, color);
    }
  }

  poly(points, color, size = 3) {
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      this.line(a[0], a[1], b[0], b[1], color, size);
    }
  }
}

const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["10010", "10010", "10010", "11111", "00010", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"]
};

function text(img, value, x, y, scale, color) {
  let cursor = x;
  for (const raw of value.toUpperCase()) {
    const glyph = FONT[raw] ?? FONT[" "];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === "1") {
          img.rect(cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += 6 * scale;
  }
}

function tabletShell(img, title) {
  img.rect(0, 0, img.width, img.height, COLORS.bg);
  img.rect(0, 0, img.width, 74, COLORS.panel);
  img.strokeRect(0, 72, img.width, 4, COLORS.line, 4);
  drawLogoMark(img, 30, 16, 42);
  text(img, "FREE DRAW", 90, 25, 5, COLORS.ink);
  text(img, title, img.width - 490, 26, 4, COLORS.muted);
  img.rect(0, 74, 96, img.height - 74, COLORS.panel);
  img.rect(img.width - 188, 74, 188, img.height - 74, COLORS.panel);
  img.strokeRect(96, 74, 4, img.height - 74, COLORS.line, 4);
  img.strokeRect(img.width - 190, 74, 4, img.height - 74, COLORS.line, 4);
  for (let i = 0; i < 6; i += 1) {
    const y = 96 + i * 64;
    img.rect(22, y, 52, 52, i === 0 ? COLORS.yellow : COLORS.panel);
    img.strokeRect(22, y, 52, 52, COLORS.line, 3);
  }
  for (let i = 0; i < 10; i += 1) {
    img.circle(28 + (i % 2) * 36, 515 + Math.floor(i / 2) * 43, 16, Object.values(COLORS)[7 + (i % 6)]);
  }
  for (let i = 0; i < 5; i += 1) {
    const y = 104 + i * 98;
    img.rect(img.width - 170, y, 146, 76, COLORS.paper);
    img.strokeRect(img.width - 170, y, 146, 76, COLORS.line, 3);
    drawSimpleAnimal(img, img.width - 98, y + 38, 0.25 + i * 0.01, COLORS.ink);
  }
}

function canvasArea(img) {
  const x = 118;
  const y = 96;
  const w = img.width - 330;
  const h = img.height - 122;
  img.rect(x, y, w, h, COLORS.paper);
  img.strokeRect(x, y, w, h, COLORS.ink, 5);
  return { x, y, w, h };
}

function drawLogoMark(img, x, y, size) {
  img.rect(x, y, size, size, COLORS.yellow);
  img.strokeCircle(x + size * 0.25, y + size * 0.72, size * 0.13, COLORS.ink, 4);
  img.strokeCircle(x + size * 0.5, y + size * 0.65, size * 0.13, COLORS.ink, 4);
  img.strokeCircle(x + size * 0.75, y + size * 0.72, size * 0.13, COLORS.ink, 4);
  img.line(x + size * 0.18, y + size * 0.58, x + size * 0.72, y + size * 0.36, COLORS.ink, 5);
}

function drawSimpleAnimal(img, cx, cy, s, color) {
  img.strokeCircle(cx, cy, 105 * s, color, 8 * s);
  img.poly([[cx - 70 * s, cy - 66 * s], [cx - 115 * s, cy - 155 * s], [cx - 20 * s, cy - 95 * s]], color, 7 * s);
  img.poly([[cx + 70 * s, cy - 66 * s], [cx + 115 * s, cy - 155 * s], [cx + 20 * s, cy - 95 * s]], color, 7 * s);
  img.strokeCircle(cx - 36 * s, cy - 8 * s, 10 * s, color, 5 * s);
  img.strokeCircle(cx + 36 * s, cy - 8 * s, 10 * s, color, 5 * s);
  img.line(cx - 26 * s, cy + 46 * s, cx + 26 * s, cy + 46 * s, color, 6 * s);
}

function drawRocket(img, cx, cy, s, color) {
  img.poly([[cx, cy - 200 * s], [cx - 95 * s, cy + 55 * s], [cx, cy + 165 * s], [cx + 95 * s, cy + 55 * s]], color, 8 * s);
  img.strokeCircle(cx, cy - 50 * s, 42 * s, color, 8 * s);
  img.poly([[cx - 70 * s, cy + 50 * s], [cx - 170 * s, cy + 165 * s], [cx - 55 * s, cy + 140 * s]], color, 8 * s);
  img.poly([[cx + 70 * s, cy + 50 * s], [cx + 170 * s, cy + 165 * s], [cx + 55 * s, cy + 140 * s]], color, 8 * s);
}

function drawFlowers(img, area) {
  for (let i = 0; i < 8; i += 1) {
    const x = area.x + 130 + i * 102;
    const y = area.y + area.h - 95 - (i % 2) * 22;
    img.line(x, y + 65, x, y, COLORS.ink, 4);
    for (let p = 0; p < 6; p += 1) {
      const angle = (p / 6) * Math.PI * 2;
      img.strokeCircle(x + Math.cos(angle) * 24, y + Math.sin(angle) * 24, 16, COLORS.ink, 4);
    }
    img.strokeCircle(x, y, 16, COLORS.ink, 4);
  }
}

function screenshotDrawing() {
  const img = new Image(1280, 800);
  tabletShell(img, "DRAW + COLOR");
  const area = canvasArea(img);
  drawFlowers(img, area);
  drawRocket(img, area.x + area.w * 0.6, area.y + area.h * 0.43, 0.88, COLORS.ink);
  img.line(area.x + 80, area.y + area.h - 115, area.x + area.w - 70, area.y + area.h - 75, COLORS.green, 16);
  img.line(area.x + 180, area.y + 210, area.x + 390, area.y + 165, COLORS.pink, 20);
  img.line(area.x + 210, area.y + 260, area.x + 520, area.y + 250, COLORS.blue, 18);
  text(img, "BRUSH RAINBOW FILL STAMPS", area.x + 72, area.y + 48, 5, COLORS.ink);
  return img;
}

function screenshotPages() {
  const img = new Image(1280, 800);
  tabletShell(img, "280+ PAGES");
  const area = canvasArea(img);
  text(img, "ANIMAL FRIENDS", area.x + 70, area.y + 54, 7, COLORS.ink);
  const centers = [[area.x + 210, area.y + 280], [area.x + 520, area.y + 280], [area.x + 830, area.y + 280], [area.x + 365, area.y + 540], [area.x + 675, area.y + 540]];
  centers.forEach((point, index) => {
    img.rect(point[0] - 110, point[1] - 90, 220, 180, COLORS.paper);
    img.strokeRect(point[0] - 110, point[1] - 90, 220, 180, COLORS.line, 4);
    drawSimpleAnimal(img, point[0], point[1], 0.7, COLORS.ink);
    img.circle(point[0] + 72, point[1] + 70, 16, [COLORS.pink, COLORS.green, COLORS.blue, COLORS.yellow, COLORS.purple][index]);
  });
  return img;
}

function screenshotTools() {
  const img = new Image(1280, 800);
  tabletShell(img, "SIMPLE TOOLS");
  const area = canvasArea(img);
  text(img, "BIG TOUCH TOOLS", area.x + 88, area.y + 58, 7, COLORS.ink);
  const labels = ["BRUSH", "RAINBOW", "ERASER", "FILL", "STAMPS", "SAVE"];
  labels.forEach((label, i) => {
    const x = area.x + 110 + (i % 3) * 280;
    const y = area.y + 185 + Math.floor(i / 3) * 205;
    img.rect(x, y, 210, 135, i === 0 ? COLORS.yellow : COLORS.panel);
    img.strokeRect(x, y, 210, 135, COLORS.ink, 5);
    text(img, label, x + 28, y + 52, 5, COLORS.ink);
  });
  return img;
}

function screenshotOffline() {
  const img = new Image(1280, 800);
  tabletShell(img, "OFFLINE KIDS ART");
  const area = canvasArea(img);
  text(img, "NO ADS", area.x + 130, area.y + 130, 10, COLORS.ink);
  text(img, "NO ACCOUNTS", area.x + 130, area.y + 260, 10, COLORS.ink);
  text(img, "OFFLINE READY", area.x + 130, area.y + 390, 10, COLORS.ink);
  img.strokeCircle(area.x + area.w - 220, area.y + 300, 110, COLORS.green, 18);
  img.line(area.x + area.w - 280, area.y + 300, area.x + area.w - 230, area.y + 355, COLORS.green, 18);
  img.line(area.x + area.w - 230, area.y + 355, area.x + area.w - 145, area.y + 240, COLORS.green, 18);
  return img;
}

function promo() {
  const img = new Image(1024, 500, COLORS.paper);
  img.rect(0, 0, 1024, 500, COLORS.yellow);
  img.rect(40, 40, 944, 420, COLORS.paper);
  img.strokeRect(40, 40, 944, 420, COLORS.ink, 8);
  text(img, "FREE DRAW", 85, 90, 13, COLORS.ink);
  text(img, "KIDS DRAWING + COLORING", 88, 205, 7, COLORS.ink);
  text(img, "280+ PAGES  NO ADS  OFFLINE", 88, 300, 6, COLORS.ink);
  drawSimpleAnimal(img, 820, 250, 1.25, COLORS.ink);
  img.circle(740, 385, 30, COLORS.pink);
  img.circle(815, 385, 30, COLORS.green);
  img.circle(890, 385, 30, COLORS.blue);
  return img;
}

function icon(size) {
  const img = new Image(size, size, COLORS.yellow);
  const s = size / 512;
  img.rect(0, 0, size, size, COLORS.yellow);
  img.strokeCircle(177 * s, 358 * s, 35 * s, COLORS.ink, 20 * s);
  img.strokeCircle(262 * s, 336 * s, 35 * s, COLORS.ink, 20 * s);
  img.strokeCircle(348 * s, 356 * s, 35 * s, COLORS.ink, 20 * s);
  img.circle(177 * s, 358 * s, 25 * s, COLORS.pink);
  img.circle(262 * s, 336 * s, 25 * s, COLORS.green);
  img.circle(348 * s, 356 * s, 25 * s, COLORS.blue);
  img.line(104 * s, 356 * s, 340 * s, 355 * s, COLORS.ink, 34 * s);
  img.line(135 * s, 286 * s, 388 * s, 277 * s, COLORS.ink, 34 * s);
  img.poly([[151 * s, 142 * s], [193 * s, 103 * s], [235 * s, 142 * s], [193 * s, 181 * s]], COLORS.ink, 18 * s);
  return img;
}

function png(image) {
  const raw = Buffer.alloc((image.width * 4 + 1) * image.height);
  let offset = 0;
  for (let y = 0; y < image.height; y += 1) {
    raw[offset] = 0;
    offset += 1;
    raw.set(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4), offset);
    offset += image.width * 4;
  }

  const chunks = [
    chunk("IHDR", Buffer.concat([
      uint32(image.width),
      uint32(image.height),
      Buffer.from([8, 6, 0, 0, 0])
    ])),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ];

  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]);
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  return Buffer.concat([uint32(data.length), name, data, uint32(crc32(Buffer.concat([name, data])))]);
}

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

await mkdir(screenshots, { recursive: true });
await writeFile(join(out, "icon-512.png"), png(icon(512)));
await writeFile(join(out, "icon-114.png"), png(icon(114)));
await writeFile(join(out, "promo-1024x500.png"), png(promo()));
await writeFile(join(screenshots, "fire-tablet-01-draw-and-color.png"), png(screenshotDrawing()));
await writeFile(join(screenshots, "fire-tablet-02-animal-friends.png"), png(screenshotPages()));
await writeFile(join(screenshots, "fire-tablet-03-simple-tools.png"), png(screenshotTools()));
await writeFile(join(screenshots, "fire-tablet-04-offline-kids-art.png"), png(screenshotOffline()));

console.log("Generated store assets in store/assets/");
