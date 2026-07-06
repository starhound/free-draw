const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'assets', 'generated-svgs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// PRNG for consistent seeds
let s = 1;
const random = () => {
  s = (s * 1664525 + 1013904223) % 4294967296;
  return s / 4294967296;
};

// Mandala Generator
function createMandala(seed) {
  s = seed;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <rect width="100%" height="100%" fill="white"/>
    <g transform="translate(400, 400)" fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">`;
  
  const numLayers = Math.floor(random() * 6) + 4;
  const segments = (Math.floor(random() * 8) + 3) * 2;
  
  for (let i = 0; i < numLayers; i++) {
    const radius = 40 + (320 / numLayers) * i + random() * 20;
    const shapeType = Math.floor(random() * 5);
    
    for (let j = 0; j < segments; j++) {
      const angle = (j * 360) / segments;
      svg += `<g transform="rotate(${angle})">`;
      if (shapeType === 0) {
        svg += `<path d="M 0 ${radius} Q ${radius/3} ${radius*1.2} 0 ${radius*1.5} Q ${-radius/3} ${radius*1.2} 0 ${radius}"/>`;
      } else if (shapeType === 1) {
        svg += `<circle cx="0" cy="${radius}" r="${radius/4}"/>`;
      } else if (shapeType === 2) {
        svg += `<path d="M 0 ${radius} L ${radius/4} ${radius*1.2} L 0 ${radius*1.4} L ${-radius/4} ${radius*1.2} Z"/>`;
      } else if (shapeType === 3) {
        svg += `<path d="M ${-radius/4} ${radius} Q 0 ${radius*1.2} ${radius/4} ${radius}"/>`;
      } else {
        svg += `<path d="M 0 ${radius} L 0 ${radius*1.3}"/>`;
      }
      svg += `</g>`;
    }
  }
  
  svg += `</g></svg>`;
  return svg;
}

// Grid Generator
function createGrid(seed) {
  s = seed;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <rect width="100%" height="100%" fill="white"/>
    <g fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">`;
  
  const cols = Math.floor(random() * 5) + 3; // 3 to 7
  const rows = cols;
  const cellW = 700 / cols;
  const cellH = 700 / rows;
  const margin = 50;
  
  const type = Math.floor(random() * 3);
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = margin + c * cellW + cellW/2;
      const cy = margin + r * cellH + cellH/2;
      
      if (type === 0) {
        // nested squares
        const steps = Math.floor(random() * 4) + 2;
        for (let i=1; i<=steps; i++) {
          const w = (cellW * i) / (steps + 1);
          svg += `<rect x="${cx - w/2}" y="${cy - w/2}" width="${w}" height="${w}"/>`;
        }
      } else if (type === 1) {
        // concentric circles
        const steps = Math.floor(random() * 4) + 2;
        for (let i=1; i<=steps; i++) {
          const rad = (cellW / 2 * i) / (steps + 1);
          svg += `<circle cx="${cx}" cy="${cy}" r="${rad}"/>`;
        }
      } else {
        // stars
        svg += `<path d="M ${cx} ${cy - cellH/3} L ${cx + cellW/8} ${cy - cellH/8} L ${cx + cellW/3} ${cy} L ${cx + cellW/8} ${cy + cellH/8} L ${cx} ${cy + cellH/3} L ${cx - cellW/8} ${cy + cellH/8} L ${cx - cellW/3} ${cy} L ${cx - cellW/8} ${cy - cellH/8} Z"/>`;
        svg += `<rect x="${cx - cellW/2}" y="${cy - cellH/2}" width="${cellW}" height="${cellH}"/>`;
      }
    }
  }
  
  svg += `</g></svg>`;
  return svg;
}

const sheets = [];

// Generate 100 Mandalas
for (let i = 1; i <= 100; i++) {
  const name = `Mandala ${i}`;
  const filename = `mandala_${i}.svg`;
  const svgContent = createMandala(i * 12345);
  fs.writeFileSync(path.join(outDir, filename), svgContent);
  sheets.push(`  { id: "gen-mandala-${i}", name: "${name}", file: "assets/generated-svgs/${filename}", source: "Procedural", author: "App", license: "Public Domain" }`);
}

// Generate 100 Geometric Grids
for (let i = 1; i <= 100; i++) {
  const name = `Geometric ${i}`;
  const filename = `grid_${i}.svg`;
  const svgContent = createGrid(i * 54321);
  fs.writeFileSync(path.join(outDir, filename), svgContent);
  sheets.push(`  { id: "gen-grid-${i}", name: "${name}", file: "assets/generated-svgs/${filename}", source: "Procedural", author: "App", license: "Public Domain" }`);
}

// Update main.js
let mainJs = fs.readFileSync(path.join(__dirname, 'src', 'main.js'), 'utf-8');

const generatedSheetsCode = `const GENERATED_SVGS = [\n${sheets.join(',\n')}\n];\n`;

// Insert GENERATED_SVGS before AI_SHEETS if not already there
if (!mainJs.includes('const GENERATED_SVGS = [')) {
  mainJs = mainJs.replace(/const AI_SHEETS = \[/, generatedSheetsCode + '\nconst AI_SHEETS = [');
}

// Update PAGE_CATEGORIES
if (!mainJs.includes('{ id: "mandalas", name: "Mandalas" }')) {
  mainJs = mainJs.replace(/{ id: "ai_sheets", name: "Magic Sheets" }/, '{ id: "ai_sheets", name: "Magic Sheets" },\n  { id: "mandalas", name: "Mandalas" },\n  { id: "geometric", name: "Geometric Patterns" }');
}

// Update createPages to push GENERATED_SVGS
const pushCode = `
  for (const sheet of GENERATED_SVGS) {
    pages.push({
      id: sheet.id,
      name: sheet.name,
      category: sheet.id.includes('mandala') ? 'mandalas' : 'geometric',
      source: sheet.source,
      license: sheet.license,
      draw: (ctx, options) => drawPublicDomainSheet(ctx, sheet, options)
    });
  }
`;

if (!mainJs.includes('category: sheet.id.includes(\\\'mandala\\\')')) {
  mainJs = mainJs.replace(/return pages;/, `${pushCode}\n  return pages;`);
}

fs.writeFileSync(path.join(__dirname, 'src', 'main.js'), mainJs);
console.log('Successfully generated 200 SVGs and updated main.js');
