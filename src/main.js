const WIDTH = 1600;
const HEIGHT = 1000;
const PAPER = "#fffdf7";
const OUTLINE = "#111827";
const TAU = Math.PI * 2;
const HISTORY_LIMIT = 18;

const COLORS = [
  "#ff4f6d",
  "#ff8a00",
  "#ffca3a",
  "#35c46a",
  "#19b7a8",
  "#2f80ed",
  "#8957e5",
  "#f15bb5",
  "#ffffff",
  "#172033"
];

const els = {
  stage: document.querySelector("#stage"),
  frame: document.querySelector("#canvasFrame"),
  drawingCanvas: document.querySelector("#drawingCanvas"),
  outlineCanvas: document.querySelector("#outlineCanvas"),
  colorPalette: document.querySelector("#colorPalette"),
  customColor: document.querySelector("#customColor"),
  brushSize: document.querySelector("#brushSize"),
  brushPreview: document.querySelector("#brushPreview"),
  pageFilters: document.querySelector("#pageFilters"),
  pageCount: document.querySelector("#pageCount"),
  pageList: document.querySelector("#pageList"),
  pageSearch: document.querySelector("#pageSearch"),
  stampList: document.querySelector("#stampList"),
  mirrorButton: document.querySelector("#mirrorButton"),
  undoButton: document.querySelector("#undoButton"),
  redoButton: document.querySelector("#redoButton"),
  saveButton: document.querySelector("#saveButton"),
  clearButton: document.querySelector("#clearButton")
};

const drawingCtx = els.drawingCanvas.getContext("2d", { willReadFrequently: true });
const outlineCtx = els.outlineCanvas.getContext("2d", { willReadFrequently: true });

const state = {
  tool: "brush",
  color: COLORS[0],
  brushSize: Number(els.brushSize.value),
  pageId: "blank",
  pageFilter: "all",
  searchQuery: "",
  stampId: "star",
  mirror: false,
  isDrawing: false,
  lastPoint: null,
  rainbowHue: 0,
  history: [],
  historyIndex: -1,
  restoring: false
};

const PAGE_CATEGORIES = [
  { id: "all", name: "All" },
  { id: "starter", name: "Starter" },
  { id: "ai_sheets", name: "Magic Sheets" },
  { id: "mandalas", name: "Mandalas" },
  { id: "geometric", name: "Geometric Patterns" },
  { id: "animals", name: "Animals & Pets" },
  { id: "vehicles", name: "Vehicles" },
  { id: "food", name: "Food & Snacks" },
  { id: "nature", name: "Nature" },
  { id: "places", name: "Places & Buildings" }
];

const STAMPS = [
  { id: "star", name: "Star" },
  { id: "heart", name: "Heart" },
  { id: "flower", name: "Flower" },
  { id: "smile", name: "Smile" },
  { id: "cloud", name: "Cloud" },
  { id: "bolt", name: "Bolt" }
];

const PUBLIC_DOMAIN_SHEETS = [
  {
    id: "pd-baby-octopus",
    name: "Baby Octopus",
    file: "assets/public-domain/baby-octopus.svg",
    source: "https://openclipart.org/detail/245072/baby-octopus-coloring-page",
    author: "Deadly44",
    license: "CC0 / Public Domain"
  },
  {
    id: "pd-christmas-bear",
    name: "Christmas Bear",
    file: "assets/public-domain/christmas-bear.svg",
    source: "https://openclipart.org/detail/187792/christmas-bear-coloring-page",
    author: "pianoBrad",
    license: "CC0 / Public Domain"
  },
  {
    id: "pd-pumpkin",
    name: "Pumpkin",
    file: "assets/public-domain/pumpkin.svg",
    source: "https://openclipart.org/detail/187791/pumpkin-coloring-page",
    author: "pianoBrad",
    license: "CC0 / Public Domain"
  },
  {
    id: "pd-jingle-bells",
    name: "Jingle Bells",
    file: "assets/public-domain/jingle-bells.svg",
    source: "https://openclipart.org/detail/187793/jingle-bells-coloring-book",
    author: "pianoBrad",
    license: "CC0 / Public Domain"
  },
  {
    id: "pd-coloring-squares",
    name: "Coloring Squares",
    file: "assets/public-domain/coloring-squares.svg",
    source: "https://openclipart.org/detail/321603/coloring-squares",
    author: "butterrcup13@gmail.com",
    license: "CC0 / Public Domain"
  },
  {
    id: "pd-block-head",
    name: "Block Head",
    file: "assets/public-domain/block-head.svg",
    source: "https://openclipart.org/detail/299818/coloring-book-block-head",
    author: "AdamStanislav",
    license: "CC0 / Public Domain"
  },
  {
    id: "pd-stick-head",
    name: "Stick Head",
    file: "assets/public-domain/stick-head.svg",
    source: "https://openclipart.org/detail/299771/coloring-book-stick-head",
    author: "AdamStanislav",
    license: "CC0 / Public Domain"
  },
  {
    id: "pd-elf-girl-face",
    name: "Elf Face",
    file: "assets/public-domain/elf-girl-face.svg",
    source: "https://openclipart.org/detail/335191/elf-girl-face-line-art-coloring-page",
    author: "elizavella",
    license: "CC0 / Public Domain"
  }
];

const GENERATED_SVGS = [
  { id: "gen-mandala-1", name: "Mandala 1", file: "assets/generated-svgs/mandala_1.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-2", name: "Mandala 2", file: "assets/generated-svgs/mandala_2.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-3", name: "Mandala 3", file: "assets/generated-svgs/mandala_3.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-4", name: "Mandala 4", file: "assets/generated-svgs/mandala_4.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-5", name: "Mandala 5", file: "assets/generated-svgs/mandala_5.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-6", name: "Mandala 6", file: "assets/generated-svgs/mandala_6.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-7", name: "Mandala 7", file: "assets/generated-svgs/mandala_7.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-8", name: "Mandala 8", file: "assets/generated-svgs/mandala_8.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-9", name: "Mandala 9", file: "assets/generated-svgs/mandala_9.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-10", name: "Mandala 10", file: "assets/generated-svgs/mandala_10.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-11", name: "Mandala 11", file: "assets/generated-svgs/mandala_11.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-12", name: "Mandala 12", file: "assets/generated-svgs/mandala_12.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-13", name: "Mandala 13", file: "assets/generated-svgs/mandala_13.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-14", name: "Mandala 14", file: "assets/generated-svgs/mandala_14.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-15", name: "Mandala 15", file: "assets/generated-svgs/mandala_15.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-16", name: "Mandala 16", file: "assets/generated-svgs/mandala_16.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-17", name: "Mandala 17", file: "assets/generated-svgs/mandala_17.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-18", name: "Mandala 18", file: "assets/generated-svgs/mandala_18.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-19", name: "Mandala 19", file: "assets/generated-svgs/mandala_19.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-20", name: "Mandala 20", file: "assets/generated-svgs/mandala_20.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-21", name: "Mandala 21", file: "assets/generated-svgs/mandala_21.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-22", name: "Mandala 22", file: "assets/generated-svgs/mandala_22.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-23", name: "Mandala 23", file: "assets/generated-svgs/mandala_23.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-24", name: "Mandala 24", file: "assets/generated-svgs/mandala_24.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-25", name: "Mandala 25", file: "assets/generated-svgs/mandala_25.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-26", name: "Mandala 26", file: "assets/generated-svgs/mandala_26.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-27", name: "Mandala 27", file: "assets/generated-svgs/mandala_27.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-28", name: "Mandala 28", file: "assets/generated-svgs/mandala_28.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-29", name: "Mandala 29", file: "assets/generated-svgs/mandala_29.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-30", name: "Mandala 30", file: "assets/generated-svgs/mandala_30.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-31", name: "Mandala 31", file: "assets/generated-svgs/mandala_31.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-32", name: "Mandala 32", file: "assets/generated-svgs/mandala_32.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-33", name: "Mandala 33", file: "assets/generated-svgs/mandala_33.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-34", name: "Mandala 34", file: "assets/generated-svgs/mandala_34.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-35", name: "Mandala 35", file: "assets/generated-svgs/mandala_35.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-36", name: "Mandala 36", file: "assets/generated-svgs/mandala_36.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-37", name: "Mandala 37", file: "assets/generated-svgs/mandala_37.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-38", name: "Mandala 38", file: "assets/generated-svgs/mandala_38.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-39", name: "Mandala 39", file: "assets/generated-svgs/mandala_39.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-40", name: "Mandala 40", file: "assets/generated-svgs/mandala_40.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-41", name: "Mandala 41", file: "assets/generated-svgs/mandala_41.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-42", name: "Mandala 42", file: "assets/generated-svgs/mandala_42.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-43", name: "Mandala 43", file: "assets/generated-svgs/mandala_43.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-44", name: "Mandala 44", file: "assets/generated-svgs/mandala_44.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-45", name: "Mandala 45", file: "assets/generated-svgs/mandala_45.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-46", name: "Mandala 46", file: "assets/generated-svgs/mandala_46.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-47", name: "Mandala 47", file: "assets/generated-svgs/mandala_47.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-48", name: "Mandala 48", file: "assets/generated-svgs/mandala_48.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-49", name: "Mandala 49", file: "assets/generated-svgs/mandala_49.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-50", name: "Mandala 50", file: "assets/generated-svgs/mandala_50.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-51", name: "Mandala 51", file: "assets/generated-svgs/mandala_51.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-52", name: "Mandala 52", file: "assets/generated-svgs/mandala_52.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-53", name: "Mandala 53", file: "assets/generated-svgs/mandala_53.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-54", name: "Mandala 54", file: "assets/generated-svgs/mandala_54.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-55", name: "Mandala 55", file: "assets/generated-svgs/mandala_55.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-56", name: "Mandala 56", file: "assets/generated-svgs/mandala_56.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-57", name: "Mandala 57", file: "assets/generated-svgs/mandala_57.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-58", name: "Mandala 58", file: "assets/generated-svgs/mandala_58.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-59", name: "Mandala 59", file: "assets/generated-svgs/mandala_59.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-60", name: "Mandala 60", file: "assets/generated-svgs/mandala_60.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-61", name: "Mandala 61", file: "assets/generated-svgs/mandala_61.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-62", name: "Mandala 62", file: "assets/generated-svgs/mandala_62.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-63", name: "Mandala 63", file: "assets/generated-svgs/mandala_63.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-64", name: "Mandala 64", file: "assets/generated-svgs/mandala_64.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-65", name: "Mandala 65", file: "assets/generated-svgs/mandala_65.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-66", name: "Mandala 66", file: "assets/generated-svgs/mandala_66.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-67", name: "Mandala 67", file: "assets/generated-svgs/mandala_67.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-68", name: "Mandala 68", file: "assets/generated-svgs/mandala_68.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-69", name: "Mandala 69", file: "assets/generated-svgs/mandala_69.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-70", name: "Mandala 70", file: "assets/generated-svgs/mandala_70.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-71", name: "Mandala 71", file: "assets/generated-svgs/mandala_71.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-72", name: "Mandala 72", file: "assets/generated-svgs/mandala_72.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-73", name: "Mandala 73", file: "assets/generated-svgs/mandala_73.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-74", name: "Mandala 74", file: "assets/generated-svgs/mandala_74.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-75", name: "Mandala 75", file: "assets/generated-svgs/mandala_75.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-76", name: "Mandala 76", file: "assets/generated-svgs/mandala_76.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-77", name: "Mandala 77", file: "assets/generated-svgs/mandala_77.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-78", name: "Mandala 78", file: "assets/generated-svgs/mandala_78.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-79", name: "Mandala 79", file: "assets/generated-svgs/mandala_79.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-80", name: "Mandala 80", file: "assets/generated-svgs/mandala_80.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-81", name: "Mandala 81", file: "assets/generated-svgs/mandala_81.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-82", name: "Mandala 82", file: "assets/generated-svgs/mandala_82.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-83", name: "Mandala 83", file: "assets/generated-svgs/mandala_83.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-84", name: "Mandala 84", file: "assets/generated-svgs/mandala_84.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-85", name: "Mandala 85", file: "assets/generated-svgs/mandala_85.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-86", name: "Mandala 86", file: "assets/generated-svgs/mandala_86.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-87", name: "Mandala 87", file: "assets/generated-svgs/mandala_87.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-88", name: "Mandala 88", file: "assets/generated-svgs/mandala_88.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-89", name: "Mandala 89", file: "assets/generated-svgs/mandala_89.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-90", name: "Mandala 90", file: "assets/generated-svgs/mandala_90.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-91", name: "Mandala 91", file: "assets/generated-svgs/mandala_91.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-92", name: "Mandala 92", file: "assets/generated-svgs/mandala_92.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-93", name: "Mandala 93", file: "assets/generated-svgs/mandala_93.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-94", name: "Mandala 94", file: "assets/generated-svgs/mandala_94.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-95", name: "Mandala 95", file: "assets/generated-svgs/mandala_95.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-96", name: "Mandala 96", file: "assets/generated-svgs/mandala_96.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-97", name: "Mandala 97", file: "assets/generated-svgs/mandala_97.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-98", name: "Mandala 98", file: "assets/generated-svgs/mandala_98.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-99", name: "Mandala 99", file: "assets/generated-svgs/mandala_99.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-mandala-100", name: "Mandala 100", file: "assets/generated-svgs/mandala_100.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-1", name: "Geometric 1", file: "assets/generated-svgs/grid_1.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-2", name: "Geometric 2", file: "assets/generated-svgs/grid_2.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-3", name: "Geometric 3", file: "assets/generated-svgs/grid_3.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-4", name: "Geometric 4", file: "assets/generated-svgs/grid_4.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-5", name: "Geometric 5", file: "assets/generated-svgs/grid_5.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-6", name: "Geometric 6", file: "assets/generated-svgs/grid_6.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-7", name: "Geometric 7", file: "assets/generated-svgs/grid_7.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-8", name: "Geometric 8", file: "assets/generated-svgs/grid_8.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-9", name: "Geometric 9", file: "assets/generated-svgs/grid_9.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-10", name: "Geometric 10", file: "assets/generated-svgs/grid_10.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-11", name: "Geometric 11", file: "assets/generated-svgs/grid_11.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-12", name: "Geometric 12", file: "assets/generated-svgs/grid_12.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-13", name: "Geometric 13", file: "assets/generated-svgs/grid_13.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-14", name: "Geometric 14", file: "assets/generated-svgs/grid_14.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-15", name: "Geometric 15", file: "assets/generated-svgs/grid_15.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-16", name: "Geometric 16", file: "assets/generated-svgs/grid_16.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-17", name: "Geometric 17", file: "assets/generated-svgs/grid_17.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-18", name: "Geometric 18", file: "assets/generated-svgs/grid_18.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-19", name: "Geometric 19", file: "assets/generated-svgs/grid_19.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-20", name: "Geometric 20", file: "assets/generated-svgs/grid_20.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-21", name: "Geometric 21", file: "assets/generated-svgs/grid_21.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-22", name: "Geometric 22", file: "assets/generated-svgs/grid_22.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-23", name: "Geometric 23", file: "assets/generated-svgs/grid_23.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-24", name: "Geometric 24", file: "assets/generated-svgs/grid_24.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-25", name: "Geometric 25", file: "assets/generated-svgs/grid_25.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-26", name: "Geometric 26", file: "assets/generated-svgs/grid_26.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-27", name: "Geometric 27", file: "assets/generated-svgs/grid_27.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-28", name: "Geometric 28", file: "assets/generated-svgs/grid_28.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-29", name: "Geometric 29", file: "assets/generated-svgs/grid_29.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-30", name: "Geometric 30", file: "assets/generated-svgs/grid_30.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-31", name: "Geometric 31", file: "assets/generated-svgs/grid_31.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-32", name: "Geometric 32", file: "assets/generated-svgs/grid_32.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-33", name: "Geometric 33", file: "assets/generated-svgs/grid_33.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-34", name: "Geometric 34", file: "assets/generated-svgs/grid_34.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-35", name: "Geometric 35", file: "assets/generated-svgs/grid_35.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-36", name: "Geometric 36", file: "assets/generated-svgs/grid_36.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-37", name: "Geometric 37", file: "assets/generated-svgs/grid_37.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-38", name: "Geometric 38", file: "assets/generated-svgs/grid_38.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-39", name: "Geometric 39", file: "assets/generated-svgs/grid_39.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-40", name: "Geometric 40", file: "assets/generated-svgs/grid_40.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-41", name: "Geometric 41", file: "assets/generated-svgs/grid_41.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-42", name: "Geometric 42", file: "assets/generated-svgs/grid_42.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-43", name: "Geometric 43", file: "assets/generated-svgs/grid_43.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-44", name: "Geometric 44", file: "assets/generated-svgs/grid_44.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-45", name: "Geometric 45", file: "assets/generated-svgs/grid_45.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-46", name: "Geometric 46", file: "assets/generated-svgs/grid_46.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-47", name: "Geometric 47", file: "assets/generated-svgs/grid_47.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-48", name: "Geometric 48", file: "assets/generated-svgs/grid_48.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-49", name: "Geometric 49", file: "assets/generated-svgs/grid_49.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-50", name: "Geometric 50", file: "assets/generated-svgs/grid_50.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-51", name: "Geometric 51", file: "assets/generated-svgs/grid_51.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-52", name: "Geometric 52", file: "assets/generated-svgs/grid_52.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-53", name: "Geometric 53", file: "assets/generated-svgs/grid_53.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-54", name: "Geometric 54", file: "assets/generated-svgs/grid_54.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-55", name: "Geometric 55", file: "assets/generated-svgs/grid_55.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-56", name: "Geometric 56", file: "assets/generated-svgs/grid_56.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-57", name: "Geometric 57", file: "assets/generated-svgs/grid_57.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-58", name: "Geometric 58", file: "assets/generated-svgs/grid_58.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-59", name: "Geometric 59", file: "assets/generated-svgs/grid_59.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-60", name: "Geometric 60", file: "assets/generated-svgs/grid_60.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-61", name: "Geometric 61", file: "assets/generated-svgs/grid_61.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-62", name: "Geometric 62", file: "assets/generated-svgs/grid_62.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-63", name: "Geometric 63", file: "assets/generated-svgs/grid_63.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-64", name: "Geometric 64", file: "assets/generated-svgs/grid_64.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-65", name: "Geometric 65", file: "assets/generated-svgs/grid_65.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-66", name: "Geometric 66", file: "assets/generated-svgs/grid_66.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-67", name: "Geometric 67", file: "assets/generated-svgs/grid_67.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-68", name: "Geometric 68", file: "assets/generated-svgs/grid_68.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-69", name: "Geometric 69", file: "assets/generated-svgs/grid_69.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-70", name: "Geometric 70", file: "assets/generated-svgs/grid_70.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-71", name: "Geometric 71", file: "assets/generated-svgs/grid_71.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-72", name: "Geometric 72", file: "assets/generated-svgs/grid_72.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-73", name: "Geometric 73", file: "assets/generated-svgs/grid_73.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-74", name: "Geometric 74", file: "assets/generated-svgs/grid_74.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-75", name: "Geometric 75", file: "assets/generated-svgs/grid_75.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-76", name: "Geometric 76", file: "assets/generated-svgs/grid_76.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-77", name: "Geometric 77", file: "assets/generated-svgs/grid_77.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-78", name: "Geometric 78", file: "assets/generated-svgs/grid_78.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-79", name: "Geometric 79", file: "assets/generated-svgs/grid_79.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-80", name: "Geometric 80", file: "assets/generated-svgs/grid_80.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-81", name: "Geometric 81", file: "assets/generated-svgs/grid_81.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-82", name: "Geometric 82", file: "assets/generated-svgs/grid_82.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-83", name: "Geometric 83", file: "assets/generated-svgs/grid_83.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-84", name: "Geometric 84", file: "assets/generated-svgs/grid_84.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-85", name: "Geometric 85", file: "assets/generated-svgs/grid_85.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-86", name: "Geometric 86", file: "assets/generated-svgs/grid_86.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-87", name: "Geometric 87", file: "assets/generated-svgs/grid_87.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-88", name: "Geometric 88", file: "assets/generated-svgs/grid_88.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-89", name: "Geometric 89", file: "assets/generated-svgs/grid_89.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-90", name: "Geometric 90", file: "assets/generated-svgs/grid_90.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-91", name: "Geometric 91", file: "assets/generated-svgs/grid_91.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-92", name: "Geometric 92", file: "assets/generated-svgs/grid_92.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-93", name: "Geometric 93", file: "assets/generated-svgs/grid_93.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-94", name: "Geometric 94", file: "assets/generated-svgs/grid_94.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-95", name: "Geometric 95", file: "assets/generated-svgs/grid_95.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-96", name: "Geometric 96", file: "assets/generated-svgs/grid_96.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-97", name: "Geometric 97", file: "assets/generated-svgs/grid_97.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-98", name: "Geometric 98", file: "assets/generated-svgs/grid_98.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-99", name: "Geometric 99", file: "assets/generated-svgs/grid_99.svg", source: "Procedural", author: "App", license: "Public Domain" },
  { id: "gen-grid-100", name: "Geometric 100", file: "assets/generated-svgs/grid_100.svg", source: "Procedural", author: "App", license: "Public Domain" }
];

const LOCAL_AI_SHEETS = [
  {
    "id": "local-ai-lion",
    "name": "Lion",
    "file": "assets/local-ai-sheets/lion.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-tiger",
    "name": "Tiger",
    "file": "assets/local-ai-sheets/tiger.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-bear",
    "name": "Bear",
    "file": "assets/local-ai-sheets/bear.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-elephant",
    "name": "Elephant",
    "file": "assets/local-ai-sheets/elephant.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-giraffe",
    "name": "Giraffe",
    "file": "assets/local-ai-sheets/giraffe.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-monkey",
    "name": "Monkey",
    "file": "assets/local-ai-sheets/monkey.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-zebra",
    "name": "Zebra",
    "file": "assets/local-ai-sheets/zebra.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-hippo",
    "name": "Hippo",
    "file": "assets/local-ai-sheets/hippo.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-rhino",
    "name": "Rhino",
    "file": "assets/local-ai-sheets/rhino.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-kangaroo",
    "name": "Kangaroo",
    "file": "assets/local-ai-sheets/kangaroo.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-dog",
    "name": "Dog",
    "file": "assets/local-ai-sheets/dog.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-cat",
    "name": "Cat",
    "file": "assets/local-ai-sheets/cat.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-rabbit",
    "name": "Rabbit",
    "file": "assets/local-ai-sheets/rabbit.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-hamster",
    "name": "Hamster",
    "file": "assets/local-ai-sheets/hamster.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-guinea-pig",
    "name": "Guinea Pig",
    "file": "assets/local-ai-sheets/guinea_pig.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-mouse",
    "name": "Mouse",
    "file": "assets/local-ai-sheets/mouse.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-squirrel",
    "name": "Squirrel",
    "file": "assets/local-ai-sheets/squirrel.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-raccoon",
    "name": "Raccoon",
    "file": "assets/local-ai-sheets/raccoon.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-fox",
    "name": "Fox",
    "file": "assets/local-ai-sheets/fox.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-wolf",
    "name": "Wolf",
    "file": "assets/local-ai-sheets/wolf.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-eagle",
    "name": "Eagle",
    "file": "assets/local-ai-sheets/eagle.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-owl",
    "name": "Owl",
    "file": "assets/local-ai-sheets/owl.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-parrot",
    "name": "Parrot",
    "file": "assets/local-ai-sheets/parrot.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-penguin",
    "name": "Penguin",
    "file": "assets/local-ai-sheets/penguin.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-flamingo",
    "name": "Flamingo",
    "file": "assets/local-ai-sheets/flamingo.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-peacock",
    "name": "Peacock",
    "file": "assets/local-ai-sheets/peacock.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-swan",
    "name": "Swan",
    "file": "assets/local-ai-sheets/swan.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-duck",
    "name": "Duck",
    "file": "assets/local-ai-sheets/duck.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-goose",
    "name": "Goose",
    "file": "assets/local-ai-sheets/goose.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-chicken",
    "name": "Chicken",
    "file": "assets/local-ai-sheets/chicken.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-dolphin",
    "name": "Dolphin",
    "file": "assets/local-ai-sheets/dolphin.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-shark",
    "name": "Shark",
    "file": "assets/local-ai-sheets/shark.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-whale",
    "name": "Whale",
    "file": "assets/local-ai-sheets/whale.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-octopus",
    "name": "Octopus",
    "file": "assets/local-ai-sheets/octopus.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-seahorse",
    "name": "Seahorse",
    "file": "assets/local-ai-sheets/seahorse.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-crab",
    "name": "Crab",
    "file": "assets/local-ai-sheets/crab.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-lobster",
    "name": "Lobster",
    "file": "assets/local-ai-sheets/lobster.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-jellyfish",
    "name": "Jellyfish",
    "file": "assets/local-ai-sheets/jellyfish.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-starfish",
    "name": "Starfish",
    "file": "assets/local-ai-sheets/starfish.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-turtle",
    "name": "Turtle",
    "file": "assets/local-ai-sheets/turtle.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-car",
    "name": "Car",
    "file": "assets/local-ai-sheets/car.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-truck",
    "name": "Truck",
    "file": "assets/local-ai-sheets/truck.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-bus",
    "name": "Bus",
    "file": "assets/local-ai-sheets/bus.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-train",
    "name": "Train",
    "file": "assets/local-ai-sheets/train.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-motorcycle",
    "name": "Motorcycle",
    "file": "assets/local-ai-sheets/motorcycle.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-bicycle",
    "name": "Bicycle",
    "file": "assets/local-ai-sheets/bicycle.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-scooter",
    "name": "Scooter",
    "file": "assets/local-ai-sheets/scooter.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-skateboard",
    "name": "Skateboard",
    "file": "assets/local-ai-sheets/skateboard.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-roller-skates",
    "name": "Roller Skates",
    "file": "assets/local-ai-sheets/roller_skates.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-tractor",
    "name": "Tractor",
    "file": "assets/local-ai-sheets/tractor.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-airplane",
    "name": "Airplane",
    "file": "assets/local-ai-sheets/airplane.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-helicopter",
    "name": "Helicopter",
    "file": "assets/local-ai-sheets/helicopter.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-rocket",
    "name": "Rocket",
    "file": "assets/local-ai-sheets/rocket.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-hot-air-balloon",
    "name": "Hot Air Balloon",
    "file": "assets/local-ai-sheets/hot_air_balloon.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-blimp",
    "name": "Blimp",
    "file": "assets/local-ai-sheets/blimp.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-submarine",
    "name": "Submarine",
    "file": "assets/local-ai-sheets/submarine.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-boat",
    "name": "Boat",
    "file": "assets/local-ai-sheets/boat.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-ship",
    "name": "Ship",
    "file": "assets/local-ai-sheets/ship.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-sailboat",
    "name": "Sailboat",
    "file": "assets/local-ai-sheets/sailboat.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-canoe",
    "name": "Canoe",
    "file": "assets/local-ai-sheets/canoe.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-apple",
    "name": "Apple",
    "file": "assets/local-ai-sheets/apple.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-banana",
    "name": "Banana",
    "file": "assets/local-ai-sheets/banana.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-orange",
    "name": "Orange",
    "file": "assets/local-ai-sheets/orange.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-strawberry",
    "name": "Strawberry",
    "file": "assets/local-ai-sheets/strawberry.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-grapes",
    "name": "Grapes",
    "file": "assets/local-ai-sheets/grapes.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-watermelon",
    "name": "Watermelon",
    "file": "assets/local-ai-sheets/watermelon.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-pineapple",
    "name": "Pineapple",
    "file": "assets/local-ai-sheets/pineapple.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-cherry",
    "name": "Cherry",
    "file": "assets/local-ai-sheets/cherry.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-peach",
    "name": "Peach",
    "file": "assets/local-ai-sheets/peach.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-pear",
    "name": "Pear",
    "file": "assets/local-ai-sheets/pear.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-pizza",
    "name": "Pizza",
    "file": "assets/local-ai-sheets/pizza.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-hamburger",
    "name": "Hamburger",
    "file": "assets/local-ai-sheets/hamburger.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-hot-dog",
    "name": "Hot Dog",
    "file": "assets/local-ai-sheets/hot_dog.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-taco",
    "name": "Taco",
    "file": "assets/local-ai-sheets/taco.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-burrito",
    "name": "Burrito",
    "file": "assets/local-ai-sheets/burrito.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-sandwich",
    "name": "Sandwich",
    "file": "assets/local-ai-sheets/sandwich.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-sushi",
    "name": "Sushi",
    "file": "assets/local-ai-sheets/sushi.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-ice-cream",
    "name": "Ice Cream",
    "file": "assets/local-ai-sheets/ice_cream.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-cupcake",
    "name": "Cupcake",
    "file": "assets/local-ai-sheets/cupcake.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-donut",
    "name": "Donut",
    "file": "assets/local-ai-sheets/donut.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-tree",
    "name": "Tree",
    "file": "assets/local-ai-sheets/tree.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-flower",
    "name": "Flower",
    "file": "assets/local-ai-sheets/flower.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-mushroom",
    "name": "Mushroom",
    "file": "assets/local-ai-sheets/mushroom.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-cactus",
    "name": "Cactus",
    "file": "assets/local-ai-sheets/cactus.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-mountain",
    "name": "Mountain",
    "file": "assets/local-ai-sheets/mountain.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-river",
    "name": "River",
    "file": "assets/local-ai-sheets/river.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-lake",
    "name": "Lake",
    "file": "assets/local-ai-sheets/lake.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-ocean",
    "name": "Ocean",
    "file": "assets/local-ai-sheets/ocean.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-cloud",
    "name": "Cloud",
    "file": "assets/local-ai-sheets/cloud.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-sun",
    "name": "Sun",
    "file": "assets/local-ai-sheets/sun.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-house",
    "name": "House",
    "file": "assets/local-ai-sheets/house.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-castle",
    "name": "Castle",
    "file": "assets/local-ai-sheets/castle.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-barn",
    "name": "Barn",
    "file": "assets/local-ai-sheets/barn.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-skyscraper",
    "name": "Skyscraper",
    "file": "assets/local-ai-sheets/skyscraper.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-tent",
    "name": "Tent",
    "file": "assets/local-ai-sheets/tent.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-bridge",
    "name": "Bridge",
    "file": "assets/local-ai-sheets/bridge.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-lighthouse",
    "name": "Lighthouse",
    "file": "assets/local-ai-sheets/lighthouse.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-windmill",
    "name": "Windmill",
    "file": "assets/local-ai-sheets/windmill.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-factory",
    "name": "Factory",
    "file": "assets/local-ai-sheets/factory.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  },
  {
    "id": "local-ai-school",
    "name": "School",
    "file": "assets/local-ai-sheets/school.jpg",
    "source": "Local AI",
    "author": "Local Model",
    "license": "Public Domain"
  }
];
const AI_SHEETS = [
  {
    id: "ai-dragon",
    name: "Cute Dragon",
    file: "assets/ai-sheets/dragon.jpg",
    source: "AI Generated",
    author: "AI",
    license: "Public Domain"
  },
  {
    id: "ai-spaceship",
    name: "Spaceship",
    file: "assets/ai-sheets/spaceship.jpg",
    source: "AI Generated",
    author: "AI",
    license: "Public Domain"
  },
  {
    id: "ai-unicorn",
    name: "Magical Unicorn",
    file: "assets/ai-sheets/unicorn.jpg",
    source: "AI Generated",
    author: "AI",
    license: "Public Domain"
  },
  {
    id: "ai-mermaid",
    name: "Mermaid",
    file: "assets/ai-sheets/mermaid.jpg",
    source: "AI Generated",
    author: "AI",
    license: "Public Domain"
  },
  {
    id: "ai-pirate-ship",
    name: "Pirate Ship",
    file: "assets/ai-sheets/pirate_ship.jpg",
    source: "AI Generated",
    author: "AI",
    license: "Public Domain"
  },
  {
    id: "ai-castle",
    name: "Fairy Castle",
    file: "assets/ai-sheets/castle.jpg",
    source: "AI Generated",
    author: "AI",
    license: "Public Domain"
  },
  { id: "ai-lion", name: "Majestic Lion", file: "assets/ai-sheets/lion.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-dolphin", name: "Playful Dolphin", file: "assets/ai-sheets/dolphin.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-owl", name: "Wise Owl", file: "assets/ai-sheets/owl.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-puppy", name: "Cute Puppy", file: "assets/ai-sheets/puppy.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-race-car", name: "Race Car", file: "assets/ai-sheets/race_car.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-wizard", name: "Magic Wizard", file: "assets/ai-sheets/wizard.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-astronaut", name: "Astronaut", file: "assets/ai-sheets/astronaut.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-trex", name: "Mighty T-Rex", file: "assets/ai-sheets/t_rex.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-mountain", name: "Mountain Landscape", file: "assets/ai-sheets/mountain.jpg", source: "AI", author: "AI", license: "Public Domain" },
  { id: "ai-pizza", name: "Pizza Slice", file: "assets/ai-sheets/pizza.jpg", source: "AI", author: "AI", license: "Public Domain" }
];

const publicDomainImageCache = new Map();

const PAGES = createPages();

function createPages() {
  const pages = [
    { id: "blank", name: "Blank", category: "starter", draw: drawBlankPage }
  ];

  // Classic sheets removed

  for (const sheet of AI_SHEETS) {
    pages.push({
      id: sheet.id,
      name: sheet.name,
      category: "ai_sheets",
      source: sheet.source,
      license: sheet.license,
      draw: (ctx, options) => drawPublicDomainSheet(ctx, sheet, options)
    });
  }

  
  for (const sheet of LOCAL_AI_SHEETS) { let cat = "ai_sheets";
  const animals = ["lion", "tiger", "bear", "elephant", "giraffe", "monkey", "zebra", "hippo", "rhino", "kangaroo", "dog", "cat", "rabbit", "hamster", "guinea-pig", "mouse", "squirrel", "raccoon", "fox", "wolf", "eagle", "owl", "parrot", "penguin", "flamingo", "peacock", "swan", "duck", "goose", "chicken", "dolphin", "shark", "whale", "octopus", "seahorse", "crab", "lobster", "jellyfish", "starfish", "turtle"];
  const vehicles = ["car", "truck", "bus", "train", "motorcycle", "bicycle", "scooter", "skateboard", "roller-skates", "tractor", "airplane", "helicopter", "rocket", "hot-air-balloon", "blimp", "submarine", "boat", "ship", "sailboat", "canoe"];
  const food = ["apple", "banana", "orange", "strawberry", "grapes", "watermelon", "pineapple", "cherry", "peach", "pear", "pizza", "hamburger", "hot-dog", "taco", "burrito", "sandwich", "sushi", "ice-cream", "cupcake", "donut"];
  const nature = ["tree", "flower", "mushroom", "cactus", "mountain", "river", "lake", "ocean", "cloud", "sun"];
  const places = ["house", "castle", "barn", "skyscraper", "tent", "bridge", "lighthouse", "windmill", "factory", "school"];
  
  const sid = sheet.id.replace("local-ai-", "");
  if (animals.includes(sid)) cat = "animals";
  else if (vehicles.includes(sid)) cat = "vehicles";
  else if (food.includes(sid)) cat = "food";
  else if (nature.includes(sid)) cat = "nature";
  else if (places.includes(sid)) cat = "places";

  pages.push({ id: sheet.id, name: sheet.name, category: cat, source: sheet.source, license: sheet.license, draw: (ctx, options) => drawPublicDomainSheet(ctx, sheet, options) }); }
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

  return pages;

  const storybook = [
    ["Magic Beanstalk", "beanstalk"],
    ["Glass Slipper", "slipper"],
    ["Red Cape Trail", "red_cape"],
    ["Gingerbread Cottage", "gingerbread"],
    ["Three Little Houses", "three_houses"],
    ["Porridge Bears", "porridge"],
    ["Sleeping Castle", "sleeping_castle"],
    ["Snow Queen", "snow_queen"],
    ["Mermaid Cove", "mermaid"],
    ["Wonder Tea", "tea_party"],
    ["Silver Shoes Path", "silver_shoes"],
    ["Wooden Puppet", "puppet"],
    ["Tin Friend", "tin_friend"],
    ["Moonlit Pirate Ship", "pirate_ship"]
  ];

  const animals = [
    ["Cat", "mammal"], ["Dog", "mammal"], ["Rabbit", "rabbit"], ["Fox", "mammal"],
    ["Deer", "mammal"], ["Bear", "mammal"], ["Squirrel", "mammal"], ["Horse", "mammal"],
    ["Cow", "mammal"], ["Sheep", "mammal"], ["Pig", "mammal"], ["Turtle", "turtle"],
    ["Frog", "frog"], ["Bird", "bird"], ["Owl", "owl"], ["Duck", "bird"],
    ["Chicken", "bird"], ["Fish", "fish"], ["Whale", "whale"], ["Dolphin", "whale"],
    ["Crab", "crab"], ["Butterfly", "butterfly"], ["Bee", "bee"], ["Snail", "snail"]
  ];
  const animalScenes = ["Garden", "Meadow", "Sunny Day"];

  const animalFriends = [
    ["Kitty Window", "cat"],
    ["Puppy Park", "dog"],
    ["Bunny Garden", "bunny"],
    ["Fox Woods", "fox"],
    ["Bear Camp", "bear"],
    ["Lion Sunshine", "lion"],
    ["Elephant Parade", "elephant"],
    ["Giraffe Grove", "giraffe"],
    ["Penguin Snow", "penguin"],
    ["Koala Tree", "koala"],
    ["Hedgehog Leaves", "hedgehog"],
    ["Owl Moon", "owl"],
    ["Turtle Pond", "turtle"],
    ["Frog Lily Pad", "frog"],
    ["Whale Splash", "whale"],
    ["Butterfly Blooms", "butterfly"]
  ];

  const vehicles = [
    ["Car", "car"], ["Bus", "bus"], ["Truck", "truck"], ["Train", "train"],
    ["Tractor", "tractor"], ["Bicycle", "bicycle"], ["Scooter", "scooter"], ["Airplane", "plane"],
    ["Helicopter", "helicopter"], ["Sailboat", "sailboat"], ["Tugboat", "boat"], ["Submarine", "submarine"],
    ["Rocket", "rocket"], ["Hot Air Balloon", "balloon"], ["Delivery Van", "van"], ["Snow Plow", "truck"]
  ];
  const vehicleScenes = ["Adventure", "Parade", "Big Trip"];

  const nature = [
    ["Flower Field", "flowers"], ["Tree Grove", "trees"], ["Mountain Lake", "mountains"], ["Rainbow Hills", "rainbow"],
    ["Pond Friends", "pond"], ["Cloud Shapes", "clouds"], ["Snow Day", "snow"], ["Desert Garden", "desert"],
    ["Leaf Pile", "leaves"], ["Mushroom Path", "mushrooms"], ["Seashell Beach", "shells"], ["Sunflower Row", "sunflowers"],
    ["Moon Garden", "moon"], ["Volcano Island", "volcano"], ["Waterfall", "waterfall"], ["Apple Orchard", "orchard"]
  ];
  const natureScenes = ["One", "Two", "Three"];

  const places = [
    ["Cottage", "cottage"], ["Castle", "castle"], ["Lighthouse", "lighthouse"], ["Barn", "barn"],
    ["Schoolhouse", "school"], ["Treehouse", "treehouse"], ["Bridge", "bridge"], ["Windmill", "windmill"],
    ["Cabin", "cabin"], ["Library", "library"], ["Bakery", "shop"], ["Fire Station", "station"],
    ["Playground", "playground"], ["Igloo", "igloo"]
  ];
  const placeScenes = ["Morning", "Afternoon", "Evening"];

  const patterns = [
    ["Star Mosaic", "stars"], ["Flower Mandala", "mandala"], ["Shape Parade", "shapes"], ["Heart Pattern", "hearts"],
    ["Circle Garden", "circles"], ["Kite Grid", "kites"], ["Spiral Suns", "spirals"], ["Wave Tiles", "waves"],
    ["Leaf Quilt", "leaves"], ["Crown Rows", "crowns"], ["Gem Shapes", "gems"], ["Bubble Pop", "bubbles"]
  ];
  const patternScenes = ["A", "B", "C"];

  let seed = 1000;
  for (const [name, shape] of animalFriends) {
    pages.push(makeGeneratedPage("animal_friends", name, "animal_friend", { name, shape }, seed));
    seed += 1;
  }

  for (const [name, shape] of storybook) {
    pages.push(makeGeneratedPage("storybook", name, "storybook", { name, shape }, seed));
    seed += 1;
  }

  for (const [name, shape] of animals) {
    for (const scene of animalScenes) {
      pages.push(makeGeneratedPage("animals", `${name} ${scene}`, "animal", { name, shape, scene }, seed));
      seed += 1;
    }
  }

  for (const [name, shape] of vehicles) {
    for (const scene of vehicleScenes) {
      pages.push(makeGeneratedPage("vehicles", `${name} ${scene}`, "vehicle", { name, shape, scene }, seed));
      seed += 1;
    }
  }

  for (const [name, shape] of nature) {
    for (const scene of natureScenes) {
      pages.push(makeGeneratedPage("nature", scene === "One" ? name : `${name} ${scene}`, "nature", { name, shape, scene }, seed));
      seed += 1;
    }
  }

  for (const [name, shape] of places) {
    for (const scene of placeScenes) {
      pages.push(makeGeneratedPage("places", `${name} ${scene}`, "place", { name, shape, scene }, seed));
      seed += 1;
    }
  }

  for (const [name, shape] of patterns) {
    for (const scene of patternScenes) {
      pages.push(makeGeneratedPage("patterns", `${name} ${scene}`, "pattern", { name, shape, scene }, seed));
      seed += 1;
    }
  }

  return pages;
}

function makeGeneratedPage(category, name, template, data, seed) {
  return {
    id: slugify(`${category}-${name}-${seed}`),
    name,
    category,
    draw: (ctx) => drawGeneratedPage(ctx, { template, data, seed })
  };
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function init() {
  els.drawingCanvas.width = WIDTH;
  els.drawingCanvas.height = HEIGHT;
  els.outlineCanvas.width = WIDTH;
  els.outlineCanvas.height = HEIGHT;

  renderColorPalette();
  renderPageFilters();
  renderPages();
  renderStamps();
  bindControls();
  bindCanvas();
  fitCanvasFrame();

  const savedPage = localStorage.getItem("freeDraw.page");
  if (PAGES.some((page) => page.id === savedPage)) {
    state.pageId = savedPage;
  } else {
    state.pageId = "blank";
  }

  clearDrawingLayer();
  drawCurrentPage();
  updateActivePage();
  updateActiveTool();
  updateActiveStamp();
  updateBrushPreview();

  const savedImage = localStorage.getItem("freeDraw.image");
  if (savedImage) {
    const image = new Image();
    image.onload = () => {
      drawingCtx.drawImage(image, 0, 0, WIDTH, HEIGHT);
      resetHistory();
    };
    image.onerror = resetHistory;
    image.src = savedImage;
  } else {
    resetHistory();
  }

  if ("serviceWorker" in navigator && isLocalDevServer()) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
  } else if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

function isLocalDevServer() {
  return location.hostname === "127.0.0.1" && location.port === "5173";
}

function bindControls() {
  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tool = button.dataset.tool;
      updateActiveTool();
      updateBrushPreview();
    });
  });

  els.mirrorButton.addEventListener("click", () => {
    state.mirror = !state.mirror;
    els.mirrorButton.setAttribute("aria-pressed", String(state.mirror));
  });

  els.brushSize.addEventListener("input", () => {
    state.brushSize = Number(els.brushSize.value);
    updateBrushPreview();
  });

  els.customColor.addEventListener("input", () => {
    setColor(els.customColor.value);
  });

  els.undoButton.addEventListener("click", undo);
  els.redoButton.addEventListener("click", redo);
  els.clearButton.addEventListener("click", () => {
    if (window.confirm("Clear this picture?")) {
      clearDrawingLayer();
      saveHistory();
    }
  });
  els.saveButton.addEventListener("click", savePicture);

  if (els.pageSearch) {
    els.pageSearch.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.toLowerCase();
      renderPages();
    });
  }

  window.addEventListener("resize", fitCanvasFrame);
  window.addEventListener("orientationchange", fitCanvasFrame);
}

function bindCanvas() {
  els.frame.addEventListener("pointerdown", onPointerDown);
  els.frame.addEventListener("pointermove", onPointerMove);
  els.frame.addEventListener("pointerup", onPointerUp);
  els.frame.addEventListener("pointercancel", onPointerUp);
  els.frame.addEventListener("lostpointercapture", onPointerUp);
  els.frame.addEventListener("contextmenu", (event) => event.preventDefault());
}

function renderColorPalette() {
  els.colorPalette.replaceChildren();
  COLORS.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch-button";
    button.style.setProperty("--swatch", color);
    button.setAttribute("aria-label", `Color ${color}`);
    button.title = color;
    button.addEventListener("click", () => setColor(color));
    els.colorPalette.append(button);
  });
}

function renderPageFilters() {
  els.pageFilters.replaceChildren();
  PAGE_CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";
    button.dataset.category = category.id;
    button.textContent = category.name;
    button.setAttribute("aria-pressed", String(category.id === state.pageFilter));
    button.addEventListener("click", () => {
      state.pageFilter = category.id;
      renderPages();
      updateActivePageFilter();
    });
    els.pageFilters.append(button);
  });
  updateActivePageFilter();
}

function renderPages() {
  els.pageList.replaceChildren();
  const visiblePages = PAGES.filter((page) => {
    const matchesCategory = state.pageFilter === "all" || page.category === state.pageFilter;
    const matchesSearch = !state.searchQuery || page.name.toLowerCase().includes(state.searchQuery);
    return matchesCategory && matchesSearch;
  });
  els.pageCount.textContent = `${visiblePages.length} pages`;
  visiblePages.forEach((page) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-button";
    button.dataset.page = page.id;
    button.setAttribute("aria-label", page.name);
    button.title = page.name;

    const thumb = document.createElement("canvas");
    thumb.width = 164;
    thumb.height = 102;
    const label = document.createElement("span");
    label.textContent = page.name;

    button.append(thumb, label);
    button.addEventListener("click", () => changePage(page.id));
    els.pageList.append(button);

    queueThumbnail(thumb, page);
  });
  updateActivePage();
}

function queueThumbnail(canvas, page) {
  drawThumbnailPlaceholder(canvas, page);
  const draw = () => {
    try {
      drawThumbnail(canvas, page);
    } catch (error) {
      console.error(`Could not draw thumbnail for ${page.name}`, error);
      drawThumbnailPlaceholder(canvas, page);
    }
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(draw, { timeout: 1200 });
  } else {
    window.setTimeout(draw, 0);
  }
}

function drawThumbnailPlaceholder(canvas, page) {
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.fillStyle = OUTLINE;
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(page.name.slice(0, 14), canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function renderStamps() {
  els.stampList.replaceChildren();
  STAMPS.forEach((stamp) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stamp-button";
    button.dataset.stamp = stamp.id;
    button.setAttribute("aria-label", stamp.name);
    button.title = stamp.name;

    const icon = document.createElement("canvas");
    icon.width = 88;
    icon.height = 88;
    button.append(icon);
    button.addEventListener("click", () => {
      state.stampId = stamp.id;
      state.tool = "stamp";
      updateActiveStamp();
      updateActiveTool();
    });
    els.stampList.append(button);

    const ctx = icon.getContext("2d");
    drawStamp(ctx, stamp.id, 44, 44, 70, COLORS[0]);
  });
}

function drawThumbnail(canvas, page) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(canvas.width / WIDTH, canvas.height / HEIGHT);
  page.draw(ctx, { onLoaded: () => drawThumbnail(canvas, page) });
  ctx.restore();
}

function setColor(color) {
  state.color = color;
  els.customColor.value = color;
  updateColorButtons();
  updateBrushPreview();
}

function changePage(pageId) {
  if (pageId === state.pageId) {
    return;
  }
  if (!window.confirm("Start a fresh page?")) {
    return;
  }
  state.pageId = pageId;
  clearDrawingLayer();
  drawCurrentPage();
  updateActivePage();
  resetHistory();
  persistDrawing();
}

function clearDrawingLayer() {
  drawingCtx.save();
  drawingCtx.globalCompositeOperation = "source-over";
  drawingCtx.fillStyle = PAPER;
  drawingCtx.fillRect(0, 0, WIDTH, HEIGHT);
  drawingCtx.restore();
}

function drawCurrentPage() {
  outlineCtx.clearRect(0, 0, WIDTH, HEIGHT);
  const page = PAGES.find((item) => item.id === state.pageId) ?? PAGES[0];
  try {
    page.draw(outlineCtx, {
      onLoaded: () => {
        if (state.pageId === page.id) {
          drawCurrentPage();
        }
      }
    });
  } catch (error) {
    console.error(`Could not draw page ${page.name}`, error);
    state.pageId = "blank";
    updateActivePage();
  }
}

function setupOutline(ctx, lineWidth = 16) {
  ctx.save();
  ctx.strokeStyle = OUTLINE;
  ctx.fillStyle = "transparent";
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function finishOutline(ctx) {
  ctx.restore();
}

function drawBlankPage() {}

function drawGardenPage(ctx) {
  setupOutline(ctx);

  ctx.beginPath();
  ctx.arc(1180, 190, 95, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * TAU;
    ctx.beginPath();
    ctx.moveTo(1180 + Math.cos(angle) * 125, 190 + Math.sin(angle) * 125);
    ctx.lineTo(1180 + Math.cos(angle) * 172, 190 + Math.sin(angle) * 172);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(0, 790);
  ctx.bezierCurveTo(250, 650, 430, 700, 625, 805);
  ctx.bezierCurveTo(840, 920, 1070, 760, 1440, 870);
  ctx.stroke();

  ctx.strokeRect(180, 530, 285, 270);
  ctx.beginPath();
  ctx.moveTo(150, 530);
  ctx.lineTo(322, 375);
  ctx.lineTo(495, 530);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeRect(290, 655, 78, 145);
  ctx.strokeRect(212, 585, 70, 70);
  ctx.strokeRect(380, 585, 58, 58);

  ctx.beginPath();
  ctx.moveTo(740, 800);
  ctx.lineTo(740, 575);
  ctx.stroke();
  drawFlower(ctx, 740, 500, 74);
  ctx.beginPath();
  ctx.moveTo(740, 660);
  ctx.bezierCurveTo(660, 610, 640, 720, 740, 700);
  ctx.moveTo(740, 690);
  ctx.bezierCurveTo(820, 640, 860, 735, 740, 735);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(980, 805);
  ctx.lineTo(980, 615);
  ctx.stroke();
  drawFlower(ctx, 980, 555, 58);

  ctx.beginPath();
  ctx.ellipse(1110, 560, 46, 75, -0.5, 0, TAU);
  ctx.ellipse(1210, 560, 46, 75, 0.5, 0, TAU);
  ctx.moveTo(1160, 560);
  ctx.lineTo(1160, 680);
  ctx.stroke();

  finishOutline(ctx);
}

function drawRocketPage(ctx) {
  setupOutline(ctx);

  ctx.beginPath();
  ctx.moveTo(720, 110);
  ctx.bezierCurveTo(530, 300, 520, 610, 720, 795);
  ctx.bezierCurveTo(920, 610, 910, 300, 720, 110);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(720, 380, 92, 0, TAU);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(572, 605);
  ctx.lineTo(390, 790);
  ctx.lineTo(610, 760);
  ctx.closePath();
  ctx.moveTo(868, 605);
  ctx.lineTo(1050, 790);
  ctx.lineTo(830, 760);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(665, 780);
  ctx.bezierCurveTo(620, 870, 670, 940, 720, 1000);
  ctx.bezierCurveTo(770, 940, 820, 870, 775, 780);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(604, 580);
  ctx.lineTo(836, 580);
  ctx.moveTo(640, 690);
  ctx.lineTo(800, 690);
  ctx.stroke();

  drawStarOutline(ctx, 210, 210, 48);
  drawStarOutline(ctx, 1110, 310, 64);
  drawStarOutline(ctx, 1160, 745, 42);
  drawStarOutline(ctx, 300, 750, 50);
  drawStarOutline(ctx, 1020, 145, 36);

  finishOutline(ctx);
}

function drawOceanPage(ctx) {
  setupOutline(ctx);

  ctx.beginPath();
  ctx.ellipse(520, 405, 205, 125, 0, 0, TAU);
  ctx.moveTo(710, 405);
  ctx.lineTo(900, 285);
  ctx.lineTo(900, 525);
  ctx.closePath();
  ctx.moveTo(405, 372);
  ctx.arc(390, 372, 1, 0, TAU);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(945, 695, 155, 93, 0, 0, TAU);
  ctx.arc(1115, 680, 55, 0, TAU);
  ctx.moveTo(835, 740);
  ctx.lineTo(760, 830);
  ctx.moveTo(980, 760);
  ctx.lineTo(1035, 850);
  ctx.moveTo(1005, 620);
  ctx.lineTo(1070, 555);
  ctx.stroke();

  [170, 260, 1140, 1240].forEach((x, i) => {
    ctx.beginPath();
    ctx.arc(x, 260 + i * 45, 32 + i * 5, 0, TAU);
    ctx.stroke();
  });

  for (const x of [185, 255, 1160, 1235]) {
    ctx.beginPath();
    ctx.moveTo(x, 900);
    ctx.bezierCurveTo(x - 70, 780, x + 60, 705, x - 20, 590);
    ctx.moveTo(x + 25, 900);
    ctx.bezierCurveTo(x + 110, 770, x - 10, 695, x + 60, 585);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(0, 930);
  ctx.bezierCurveTo(300, 860, 560, 990, 830, 925);
  ctx.bezierCurveTo(1110, 855, 1280, 915, 1440, 880);
  ctx.stroke();

  finishOutline(ctx);
}

function drawDinoPage(ctx) {
  setupOutline(ctx);

  ctx.beginPath();
  ctx.ellipse(720, 625, 285, 170, 0, 0, TAU);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(925, 548);
  ctx.bezierCurveTo(1045, 405, 1235, 440, 1255, 580);
  ctx.bezierCurveTo(1230, 690, 1040, 665, 940, 650);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(445, 632);
  ctx.bezierCurveTo(245, 575, 190, 735, 360, 790);
  ctx.stroke();

  for (const spike of [
    [520, 465, 585, 340, 650, 465],
    [655, 455, 720, 330, 785, 455],
    [790, 475, 850, 360, 910, 500]
  ]) {
    ctx.beginPath();
    ctx.moveTo(spike[0], spike[1]);
    ctx.lineTo(spike[2], spike[3]);
    ctx.lineTo(spike[4], spike[5]);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(590, 760);
  ctx.lineTo(555, 910);
  ctx.lineTo(660, 910);
  ctx.lineTo(675, 785);
  ctx.moveTo(835, 760);
  ctx.lineTo(890, 910);
  ctx.lineTo(990, 910);
  ctx.lineTo(940, 745);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(1155, 540, 12, 0, TAU);
  ctx.moveTo(1110, 610);
  ctx.quadraticCurveTo(1160, 645, 1210, 600);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(120, 930);
  ctx.lineTo(1320, 930);
  ctx.stroke();

  drawCloudOutline(ctx, 235, 230, 125);
  drawCloudOutline(ctx, 1085, 215, 105);

  finishOutline(ctx);
}

function drawPublicDomainSheet(ctx, sheet, options = {}) {
  setupOutline(ctx, 10);
  const entry = getPublicDomainImage(sheet);

  if (entry.error) {
    drawPublicDomainPlaceholder(ctx, sheet.name);
    finishOutline(ctx);
    return;
  }

  if (!entry.loaded) {
    if (options.onLoaded) {
      entry.listeners.add(options.onLoaded);
    }
    drawPublicDomainPlaceholder(ctx, sheet.name);
    finishOutline(ctx);
    return;
  }

  drawFittedImage(ctx, entry.image, 20);
  finishOutline(ctx);
}

function getPublicDomainImage(sheet) {
  const cached = publicDomainImageCache.get(sheet.file);
  if (cached) {
    return cached;
  }

  const image = new Image();
  const entry = {
    image,
    loaded: false,
    error: false,
    listeners: new Set()
  };

  image.onload = () => {
    entry.loaded = true;
    for (const listener of entry.listeners) {
      listener();
    }
    entry.listeners.clear();
  };
  image.onerror = () => {
    entry.error = true;
    for (const listener of entry.listeners) {
      listener();
    }
    entry.listeners.clear();
  };
  image.src = sheet.file;

  publicDomainImageCache.set(sheet.file, entry);
  return entry;
}

function drawPublicDomainPlaceholder(ctx, name) {
  ctx.save();
  ctx.strokeStyle = OUTLINE;
  ctx.fillStyle = OUTLINE;
  ctx.lineWidth = 12;
  strokeRoundRect(ctx, 410, 240, 780, 520, 28);
  ctx.font = "900 72px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, WIDTH / 2, HEIGHT / 2);
  ctx.restore();
}

function drawFittedImage(ctx, image, margin) {
  // Stretch the image to perfectly fill the canvas width and height
  const drawWidth = WIDTH - margin * 2;
  const drawHeight = HEIGHT - margin * 2;
  const x = margin;
  const y = margin;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawGeneratedPage(ctx, page) {
  const rnd = mulberry32(page.seed);
  setupOutline(ctx, 13);
  ctx.save();

  if (page.template === "animal") {
    drawAnimalPage(ctx, page.data, rnd);
  } else if (page.template === "animal_friend") {
    drawAnimalFriendPage(ctx, page.data, rnd);
  } else if (page.template === "vehicle") {
    drawVehiclePage(ctx, page.data, rnd);
  } else if (page.template === "nature") {
    drawNaturePage(ctx, page.data, rnd);
  } else if (page.template === "place") {
    drawPlacePage(ctx, page.data, rnd);
  } else if (page.template === "storybook") {
    drawStorybookPage(ctx, page.data, rnd);
  } else if (page.template === "pattern") {
    drawPatternPage(ctx, page.data, rnd);
  }

  ctx.restore();
  finishOutline(ctx);
}

function drawAnimalFriendPage(ctx, data, rnd) {
  const water = ["whale", "turtle", "frog"].includes(data.shape);
  const snow = data.shape === "penguin";
  const night = data.shape === "owl";

  if (water) {
    drawWaterLine(ctx, data.shape === "whale" ? 760 : 820);
    drawBubbles(ctx, rnd, 6);
  } else if (snow) {
    drawSnowScene(ctx);
  } else if (night) {
    drawMoon(ctx, 1220, 170, 82);
    for (let i = 0; i < 7; i += 1) {
      drawStarOutline(ctx, 250 + i * 170, 275 + (i % 2) * 65, 24);
    }
    drawGround(ctx, 835, rnd);
  } else {
    drawFriendlySky(ctx, rnd);
    drawGround(ctx, 835, rnd);
  }

  if (data.shape === "cat") {
    drawWindowFrame(ctx, 800, 420, 580, 420);
    drawAnimalHead(ctx, "cat", 800, 515, 1.45);
    drawPaws(ctx, 705, 735, 1.05);
    drawPaws(ctx, 895, 735, 1.05);
    drawYarnBall(ctx, 1130, 760, 0.85);
  } else if (data.shape === "dog") {
    drawAnimalHead(ctx, "dog", 800, 505, 1.45);
    drawSittingBody(ctx, 800, 725, 1.2);
    drawBall(ctx, 1110, 760, 0.9);
    drawBone(ctx, 480, 760, 0.9);
  } else if (data.shape === "bunny") {
    drawAnimalHead(ctx, "bunny", 800, 505, 1.35);
    drawSittingBody(ctx, 800, 725, 1.08);
    for (const x of [430, 535, 1080, 1195]) {
      drawCarrot(ctx, x, 765, 0.82);
    }
    drawSmallFlowers(ctx, rnd, 5);
  } else if (data.shape === "fox") {
    drawTree(ctx, 360, 790, 1.08, false);
    drawTree(ctx, 1220, 805, 1, false);
    drawAnimalHead(ctx, "fox", 800, 500, 1.45);
    drawCurledTail(ctx, 610, 710, 1);
    drawSittingBody(ctx, 800, 725, 1.08);
  } else if (data.shape === "bear") {
    drawTent(ctx, 470, 725, 0.8);
    drawAnimalHead(ctx, "bear", 800, 500, 1.5);
    drawSittingBody(ctx, 800, 730, 1.25);
    drawHoneyPot(ctx, 1110, 760, 0.95);
  } else if (data.shape === "lion") {
    drawAnimalHead(ctx, "lion", 800, 500, 1.55);
    drawSittingBody(ctx, 800, 735, 1.15);
    for (let i = 0; i < 4; i += 1) {
      drawTallGrass(ctx, 420 + i * 250, 820, 0.9 + i * 0.05);
    }
  } else if (data.shape === "elephant") {
    drawElephantFriend(ctx, 800, 615, 1.05);
    drawBalloonCluster(ctx, 1180, 330, 0.95);
  } else if (data.shape === "giraffe") {
    drawTree(ctx, 1125, 745, 1.55, true);
    drawGiraffeFriend(ctx, 715, 610, 1.05);
  } else if (data.shape === "penguin") {
    drawPenguinFriend(ctx, 800, 595, 1.18);
    drawIgloo(ctx, 1150, 715, 0.62);
  } else if (data.shape === "koala") {
    drawTree(ctx, 800, 790, 1.65, false);
    drawKoalaFriend(ctx, 800, 555, 1.08);
  } else if (data.shape === "hedgehog") {
    drawLeafPile(ctx, 800, 785, 1.05);
    drawHedgehogFriend(ctx, 800, 630, 1.15);
  } else if (data.shape === "owl") {
    drawTree(ctx, 800, 820, 1.6, false);
    drawOwlAnimal(ctx, 800, 490);
    drawBook(ctx, 1045, 740, 0.85);
  } else if (data.shape === "turtle") {
    drawLake(ctx, 705);
    drawTurtleAnimal(ctx, 790, 610, 1.28);
    drawReeds(ctx, 370, 830);
    drawReeds(ctx, 1165, 830);
  } else if (data.shape === "frog") {
    drawLake(ctx, 720);
    drawLilyPad(ctx, 800, 705, 1.3);
    drawFrogAnimal(ctx, 800, 595, 1.25);
    drawDragonfly(ctx, 1150, 365, 0.9);
  } else if (data.shape === "whale") {
    drawWhaleAnimal(ctx, 780, 535, 1.2);
    drawBubbles(ctx, rnd, 10);
  } else if (data.shape === "butterfly") {
    drawButterflyAnimal(ctx, 800, 480, 1.55);
    for (let i = 0; i < 7; i += 1) {
      drawFlower(ctx, 335 + i * 155, 765 - (i % 2) * 35, 45);
    }
  }
}

function drawAnimalPage(ctx, data, rnd) {
  const waterAnimal = ["fish", "whale", "crab"].includes(data.shape);
  if (waterAnimal) {
    drawWaterLine(ctx, 820);
    drawBubbles(ctx, rnd, 7);
  } else {
    drawFriendlySky(ctx, rnd);
    drawGround(ctx, 820, rnd);
    drawSmallFlowers(ctx, rnd, data.scene === "Garden" ? 7 : 4);
  }

  if (data.shape === "fish") {
    drawFishAnimal(ctx, 790, 560, 1.25, rnd);
  } else if (data.shape === "whale") {
    drawWhaleAnimal(ctx, 790, 575, data.name === "Dolphin" ? 0.92 : 1.15);
  } else if (data.shape === "bird") {
    drawBirdAnimal(ctx, 800, 565, data.name);
  } else if (data.shape === "owl") {
    drawOwlAnimal(ctx, 800, 565);
  } else if (data.shape === "butterfly") {
    drawButterflyAnimal(ctx, 800, 540, 1.3);
  } else if (data.shape === "bee") {
    drawBeeAnimal(ctx, 800, 560, 1.25);
  } else if (data.shape === "snail") {
    drawSnailAnimal(ctx, 780, 640, 1.25);
  } else if (data.shape === "turtle") {
    drawTurtleAnimal(ctx, 795, 610, 1.2);
  } else if (data.shape === "frog") {
    drawFrogAnimal(ctx, 800, 630, 1.15);
  } else if (data.shape === "crab") {
    drawCrabAnimal(ctx, 800, 625, 1.1);
  } else {
    drawMammalAnimal(ctx, data.name, 780, 620, 1.02, rnd);
  }
}

function drawAnimalHead(ctx, type, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (type === "cat" || type === "fox" || type === "dog") {
    ctx.beginPath();
    ctx.ellipse(0, 10, 105, 95, 0, 0, TAU);
    if (type === "dog") {
      ctx.ellipse(-88, 0, 42, 82, -0.35, 0, TAU);
      ctx.ellipse(88, 0, 42, 82, 0.35, 0, TAU);
    } else {
      ctx.moveTo(-78, -48);
      ctx.lineTo(-105, -138);
      ctx.lineTo(-22, -82);
      ctx.moveTo(78, -48);
      ctx.lineTo(105, -138);
      ctx.lineTo(22, -82);
    }
    ctx.stroke();
    if (type === "fox") {
      ctx.beginPath();
      ctx.moveTo(-62, 20);
      ctx.lineTo(0, 95);
      ctx.lineTo(62, 20);
      ctx.stroke();
    }
  } else if (type === "bunny") {
    ctx.beginPath();
    ctx.ellipse(0, 25, 98, 88, 0, 0, TAU);
    ctx.ellipse(-45, -105, 30, 130, -0.12, 0, TAU);
    ctx.ellipse(45, -105, 30, 130, 0.12, 0, TAU);
    ctx.stroke();
  } else if (type === "bear") {
    ctx.beginPath();
    ctx.ellipse(0, 20, 115, 100, 0, 0, TAU);
    ctx.arc(-82, -62, 36, 0, TAU);
    ctx.arc(82, -62, 36, 0, TAU);
    ctx.stroke();
  } else if (type === "lion") {
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 98, 10 + Math.sin(angle) * 88);
      ctx.lineTo(Math.cos(angle) * 152, 10 + Math.sin(angle) * 135);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, 15, 110, 96, 0, 0, TAU);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(-36, -2, 8, 0, TAU);
  ctx.arc(36, -2, 8, 0, TAU);
  ctx.moveTo(-18, 38);
  ctx.quadraticCurveTo(0, 55, 18, 38);
  ctx.moveTo(0, 18);
  ctx.lineTo(0, 38);
  ctx.stroke();

  if (type === "cat" || type === "fox") {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 20, 28);
      ctx.lineTo(side * 92, 10);
      ctx.moveTo(side * 22, 45);
      ctx.lineTo(side * 96, 52);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawSittingBody(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 115, 145, 0, 0, TAU);
  ctx.ellipse(-62, 126, 45, 32, 0, 0, TAU);
  ctx.ellipse(62, 126, 45, 32, 0, 0, TAU);
  ctx.moveTo(-55, -40);
  ctx.quadraticCurveTo(-110, 40, -70, 110);
  ctx.moveTo(55, -40);
  ctx.quadraticCurveTo(110, 40, 70, 110);
  ctx.stroke();
  ctx.restore();
}

function drawPaws(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 32, 0, 0, TAU);
  for (const toe of [-24, 0, 24]) {
    ctx.moveTo(toe, -18);
    ctx.lineTo(toe, 5);
  }
  ctx.stroke();
  ctx.restore();
}

function drawWindowFrame(ctx, x, y, width, height) {
  ctx.save();
  ctx.translate(x, y);
  strokeRoundRect(ctx, -width / 2, -height / 2, width, height, 24);
  ctx.beginPath();
  ctx.moveTo(0, -height / 2);
  ctx.lineTo(0, height / 2);
  ctx.moveTo(-width / 2, 0);
  ctx.lineTo(width / 2, 0);
  ctx.stroke();
  ctx.restore();
}

function drawYarnBall(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, TAU);
  ctx.moveTo(-62, -20);
  ctx.bezierCurveTo(-10, -70, 60, -20, 15, 62);
  ctx.moveTo(-55, 30);
  ctx.bezierCurveTo(0, 0, 45, 5, 65, 40);
  ctx.moveTo(58, -22);
  ctx.bezierCurveTo(120, -55, 165, -15, 185, 28);
  ctx.stroke();
  ctx.restore();
}

function drawBall(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, TAU);
  ctx.moveTo(-68, 0);
  ctx.quadraticCurveTo(0, -55, 68, 0);
  ctx.moveTo(-68, 0);
  ctx.quadraticCurveTo(0, 55, 68, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBone(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(-75, -25, 28, 0, TAU);
  ctx.arc(-75, 25, 28, 0, TAU);
  ctx.arc(75, -25, 28, 0, TAU);
  ctx.arc(75, 25, 28, 0, TAU);
  ctx.moveTo(-75, 0);
  ctx.lineTo(75, 0);
  ctx.stroke();
  ctx.restore();
}

function drawCarrot(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-45, -20);
  ctx.lineTo(45, -20);
  ctx.lineTo(0, 125);
  ctx.closePath();
  ctx.moveTo(-8, -20);
  ctx.lineTo(-40, -92);
  ctx.moveTo(8, -20);
  ctx.lineTo(40, -92);
  ctx.moveTo(0, -20);
  ctx.lineTo(0, -110);
  ctx.stroke();
  ctx.restore();
}

function drawCurledTail(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, 70);
  ctx.bezierCurveTo(-185, 10, -135, -210, 40, -160);
  ctx.bezierCurveTo(170, -125, 100, 55, -25, 0);
  ctx.stroke();
  ctx.restore();
}

function drawTent(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-160, 95);
  ctx.lineTo(0, -170);
  ctx.lineTo(160, 95);
  ctx.closePath();
  ctx.moveTo(0, -170);
  ctx.lineTo(0, 95);
  ctx.moveTo(0, 95);
  ctx.lineTo(70, 95);
  ctx.lineTo(0, -20);
  ctx.lineTo(-70, 95);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHoneyPot(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, -60, 82, 28, 0, 0, TAU);
  ctx.moveTo(-82, -60);
  ctx.quadraticCurveTo(-85, 95, 0, 110);
  ctx.quadraticCurveTo(85, 95, 82, -60);
  ctx.moveTo(-48, 10);
  ctx.lineTo(48, 10);
  ctx.stroke();
  ctx.restore();
}

function drawTallGrass(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 20, 0);
    ctx.quadraticCurveTo(i * 16 - 45, -90, i * 12 - 10, -175);
    ctx.stroke();
  }
  ctx.restore();
}

function drawElephantFriend(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 20, 220, 160, 0, 0, TAU);
  ctx.ellipse(-125, -65, 105, 115, -0.18, 0, TAU);
  ctx.ellipse(125, -65, 105, 115, 0.18, 0, TAU);
  ctx.moveTo(0, -45);
  ctx.bezierCurveTo(-45, 85, -20, 185, 60, 188);
  ctx.moveTo(-72, 125);
  ctx.lineTo(-90, 255);
  ctx.lineTo(-25, 255);
  ctx.moveTo(72, 125);
  ctx.lineTo(90, 255);
  ctx.lineTo(25, 255);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-48, -70, 9, 0, TAU);
  ctx.arc(48, -70, 9, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawBalloonCluster(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  for (let i = 0; i < 4; i += 1) {
    const bx = (i % 2) * 82 - 42;
    const by = Math.floor(i / 2) * -90;
    ctx.beginPath();
    ctx.ellipse(bx, by, 42, 56, 0, 0, TAU);
    ctx.moveTo(bx, by + 56);
    ctx.lineTo(0, 255);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGiraffeFriend(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 120, 150, 95, 0, 0, TAU);
  ctx.moveTo(65, 55);
  ctx.lineTo(105, -190);
  ctx.lineTo(200, -170);
  ctx.lineTo(155, 70);
  ctx.ellipse(190, -230, 98, 72, 0.1, 0, TAU);
  ctx.moveTo(145, -295);
  ctx.lineTo(132, -370);
  ctx.moveTo(215, -292);
  ctx.lineTo(230, -368);
  ctx.stroke();
  for (const spot of [[-70, 90, 34], [20, 145, 42], [120, 20, 30], [157, -95, 25], [185, -240, 24]]) {
    ctx.beginPath();
    ctx.ellipse(spot[0], spot[1], spot[2], spot[2] * 0.72, 0.35, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(215, -245, 8, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawPenguinFriend(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 20, 125, 185, 0, 0, TAU);
  ctx.ellipse(0, 75, 78, 125, 0, 0, TAU);
  ctx.moveTo(-35, -75);
  ctx.lineTo(0, -35);
  ctx.lineTo(35, -75);
  ctx.moveTo(-112, 55);
  ctx.lineTo(-210, 110);
  ctx.moveTo(112, 55);
  ctx.lineTo(210, 110);
  ctx.moveTo(-55, 205);
  ctx.lineTo(-105, 255);
  ctx.moveTo(55, 205);
  ctx.lineTo(105, 255);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-38, -105, 8, 0, TAU);
  ctx.arc(38, -105, 8, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawKoalaFriend(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 20, 115, 105, 0, 0, TAU);
  ctx.arc(-95, -38, 55, 0, TAU);
  ctx.arc(95, -38, 55, 0, TAU);
  ctx.ellipse(0, 20, 30, 42, 0, 0, TAU);
  ctx.arc(-40, -20, 8, 0, TAU);
  ctx.arc(40, -20, 8, 0, TAU);
  ctx.moveTo(-25, 65);
  ctx.quadraticCurveTo(0, 85, 25, 65);
  ctx.stroke();
  ctx.restore();
}

function drawHedgehogFriend(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-190, 60);
  for (let i = 0; i < 12; i += 1) {
    const px = -170 + i * 30;
    ctx.lineTo(px, i % 2 ? -105 : -160);
  }
  ctx.lineTo(190, 60);
  ctx.quadraticCurveTo(55, 150, -190, 60);
  ctx.closePath();
  ctx.ellipse(155, 20, 75, 58, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(182, 0, 7, 0, TAU);
  ctx.moveTo(220, 22);
  ctx.quadraticCurveTo(238, 30, 220, 40);
  ctx.stroke();
  ctx.restore();
}

function drawLeafPile(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  for (let i = 0; i < 11; i += 1) {
    drawLeaf(ctx, -280 + i * 56, (i % 2) * 22, 46, i * 0.42);
  }
  ctx.restore();
}

function drawBook(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, -85);
  ctx.quadraticCurveTo(-88, -115, -170, -65);
  ctx.lineTo(-170, 85);
  ctx.quadraticCurveTo(-82, 35, 0, 85);
  ctx.quadraticCurveTo(82, 35, 170, 85);
  ctx.lineTo(170, -65);
  ctx.quadraticCurveTo(88, -115, 0, -85);
  ctx.lineTo(0, 85);
  ctx.stroke();
  ctx.restore();
}

function drawLilyPad(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 135, 72, 0, 0, TAU);
  ctx.moveTo(0, 0);
  ctx.lineTo(85, -58);
  ctx.stroke();
  ctx.restore();
}

function drawDragonfly(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.lineTo(0, 150);
  ctx.ellipse(-55, 20, 58, 28, -0.5, 0, TAU);
  ctx.ellipse(55, 20, 58, 28, 0.5, 0, TAU);
  ctx.ellipse(-52, 82, 48, 24, 0.4, 0, TAU);
  ctx.ellipse(52, 82, 48, 24, -0.4, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawVehiclePage(ctx, data, rnd) {
  const waterVehicle = ["sailboat", "boat", "submarine"].includes(data.shape);
  const airVehicle = ["plane", "helicopter", "balloon", "rocket"].includes(data.shape);
  if (waterVehicle) {
    drawFriendlySky(ctx, rnd);
    drawWaterLine(ctx, 780);
  } else if (airVehicle) {
    drawFriendlySky(ctx, rnd);
    drawCloudOutline(ctx, 320, 245, 95);
    drawCloudOutline(ctx, 1230, 290, 115);
  } else {
    drawGround(ctx, 800, rnd);
    drawRoad(ctx, 820);
  }

  if (data.shape === "train") {
    drawTrainVehicle(ctx, 770, 620, 1.1);
  } else if (data.shape === "bicycle") {
    drawBicycleVehicle(ctx, 800, 650, 1.1);
  } else if (data.shape === "scooter") {
    drawScooterVehicle(ctx, 820, 650, 1.1);
  } else if (data.shape === "plane") {
    drawPlaneVehicle(ctx, 800, 500, 1.08);
  } else if (data.shape === "helicopter") {
    drawHelicopterVehicle(ctx, 800, 500, 1.08);
  } else if (data.shape === "sailboat") {
    drawSailboatVehicle(ctx, 800, 610, 1.12);
  } else if (data.shape === "boat") {
    drawBoatVehicle(ctx, 800, 625, 1.1);
  } else if (data.shape === "submarine") {
    drawSubmarineVehicle(ctx, 800, 610, 1.15);
  } else if (data.shape === "rocket") {
    drawRocketVehicle(ctx, 800, 540, 1.02);
  } else if (data.shape === "balloon") {
    drawBalloonVehicle(ctx, 800, 480, 1.1);
  } else {
    drawWheeledVehicle(ctx, data.shape, 800, 620, 1.1);
  }
}

function drawNaturePage(ctx, data, rnd) {
  if (["pond", "shells", "waterfall", "volcano"].includes(data.shape)) {
    drawWaterLine(ctx, 835);
  } else {
    drawFriendlySky(ctx, rnd);
    drawGround(ctx, 835, rnd);
  }

  if (data.shape === "flowers" || data.shape === "sunflowers") {
    const tall = data.shape === "sunflowers";
    for (let i = 0; i < 7; i += 1) {
      const x = 275 + i * 175;
      const y = tall ? 650 + (i % 2) * 35 : 700 + (i % 3) * 25;
      ctx.beginPath();
      ctx.moveTo(x, 835);
      ctx.lineTo(x, y);
      ctx.stroke();
      drawFlower(ctx, x, y - 54, tall ? 58 : 42);
    }
  } else if (data.shape === "trees" || data.shape === "orchard") {
    for (let i = 0; i < 5; i += 1) {
      drawTree(ctx, 280 + i * 250, 760 - (i % 2) * 35, 1 + (i % 3) * 0.1, data.shape === "orchard");
    }
  } else if (data.shape === "mountains") {
    drawMountains(ctx);
    drawLake(ctx, 790);
  } else if (data.shape === "rainbow") {
    drawRainbow(ctx, 800, 560, 430);
    drawCloudOutline(ctx, 420, 710, 110);
    drawCloudOutline(ctx, 1180, 710, 110);
  } else if (data.shape === "pond") {
    drawLake(ctx, 650);
    drawReeds(ctx, 380, 790);
    drawReeds(ctx, 1190, 795);
    drawFishAnimal(ctx, 790, 675, 0.58, rnd);
  } else if (data.shape === "clouds") {
    for (let i = 0; i < 6; i += 1) {
      drawCloudOutline(ctx, 250 + i * 220, 330 + (i % 2) * 75, 82 + (i % 3) * 18);
    }
  } else if (data.shape === "snow") {
    drawSnowScene(ctx);
  } else if (data.shape === "desert") {
    drawDesertScene(ctx);
  } else if (data.shape === "leaves") {
    for (let i = 0; i < 13; i += 1) {
      drawLeaf(ctx, 190 + (i % 7) * 190, 530 + Math.floor(i / 7) * 165, 70, i * 0.45);
    }
  } else if (data.shape === "mushrooms") {
    for (let i = 0; i < 8; i += 1) {
      drawMushroom(ctx, 250 + i * 155, 800 - (i % 2) * 80, 0.9 + (i % 3) * 0.12);
    }
  } else if (data.shape === "shells") {
    for (let i = 0; i < 8; i += 1) {
      drawShell(ctx, 250 + i * 150, 650 + (i % 2) * 95, 1 + (i % 3) * 0.15);
    }
  } else if (data.shape === "moon") {
    drawMoonGarden(ctx);
  } else if (data.shape === "volcano") {
    drawVolcano(ctx);
  } else if (data.shape === "waterfall") {
    drawWaterfall(ctx);
  }
}

function drawPlacePage(ctx, data, rnd) {
  drawFriendlySky(ctx, rnd);
  drawGround(ctx, 835, rnd);

  if (data.shape === "castle") {
    drawCastle(ctx, 800, 620, 1.05);
  } else if (data.shape === "lighthouse") {
    drawLighthouse(ctx, 800, 575, 1.08);
  } else if (data.shape === "barn") {
    drawBarn(ctx, 800, 640, 1.1);
  } else if (data.shape === "school") {
    drawSchool(ctx, 800, 630, 1.05);
  } else if (data.shape === "treehouse") {
    drawTree(ctx, 800, 745, 1.8, false);
    drawHouseShape(ctx, 800, 490, 260, 190, "treehouse");
  } else if (data.shape === "bridge") {
    drawBridge(ctx, 800, 650, 1.12);
    drawWaterLine(ctx, 830);
  } else if (data.shape === "windmill") {
    drawWindmill(ctx, 800, 600, 1.1);
  } else if (data.shape === "cabin") {
    drawHouseShape(ctx, 800, 640, 420, 260, "cabin");
  } else if (data.shape === "library") {
    drawLibrary(ctx, 800, 635, 1.05);
  } else if (data.shape === "shop") {
    drawShop(ctx, 800, 640, 1.08);
  } else if (data.shape === "station") {
    drawStation(ctx, 800, 640, 1.08);
  } else if (data.shape === "playground") {
    drawPlayground(ctx, 800, 635, 1.05);
  } else if (data.shape === "igloo") {
    drawIgloo(ctx, 800, 675, 1.18);
  } else {
    drawHouseShape(ctx, 800, 640, 380, 270, "cottage");
  }
}

function drawStorybookPage(ctx, data, rnd) {
  drawFriendlySky(ctx, rnd);
  drawGround(ctx, 835, rnd);

  if (data.shape === "beanstalk") {
    ctx.beginPath();
    ctx.moveTo(780, 835);
    ctx.bezierCurveTo(690, 660, 880, 545, 770, 370);
    ctx.bezierCurveTo(690, 245, 840, 185, 790, 65);
    ctx.stroke();
    for (let i = 0; i < 9; i += 1) {
      const x = 735 + (i % 2) * 90;
      const y = 735 - i * 72;
      drawLeaf(ctx, x, y, 46, i % 2 ? -0.7 : 0.7);
    }
    drawCloudOutline(ctx, 815, 120, 125);
    drawCastle(ctx, 820, 210, 0.35);
  } else if (data.shape === "slipper") {
    drawStarOutline(ctx, 310, 270, 38);
    drawStarOutline(ctx, 1235, 260, 42);
    ctx.beginPath();
    ctx.moveTo(470, 635);
    ctx.bezierCurveTo(610, 500, 735, 545, 845, 610);
    ctx.bezierCurveTo(980, 690, 1110, 650, 1195, 585);
    ctx.bezierCurveTo(1190, 750, 990, 820, 700, 785);
    ctx.bezierCurveTo(545, 765, 455, 730, 470, 635);
    ctx.closePath();
    ctx.moveTo(825, 610);
    ctx.quadraticCurveTo(815, 710, 720, 784);
    ctx.stroke();
    drawPumpkinCarriage(ctx, 365, 720, 0.65);
  } else if (data.shape === "red_cape") {
    drawTree(ctx, 305, 800, 1.1, false);
    drawTree(ctx, 1275, 810, 1.05, false);
    ctx.beginPath();
    ctx.moveTo(620, 835);
    ctx.bezierCurveTo(665, 720, 745, 655, 820, 580);
    ctx.bezierCurveTo(900, 495, 980, 440, 1015, 310);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(790, 515, 48, 0, TAU);
    ctx.moveTo(745, 565);
    ctx.lineTo(670, 755);
    ctx.lineTo(888, 755);
    ctx.lineTo(835, 565);
    ctx.closePath();
    ctx.moveTo(868, 630);
    ctx.lineTo(975, 675);
    ctx.stroke();
    drawBasket(ctx, 1010, 700, 0.9);
  } else if (data.shape === "gingerbread") {
    drawHouseShape(ctx, 800, 610, 430, 285, "cottage");
    for (const point of [[610, 505], [700, 455], [900, 455], [990, 505], [635, 705], [965, 705]]) {
      ctx.beginPath();
      ctx.arc(point[0], point[1], 20, 0, TAU);
      ctx.stroke();
    }
    drawCandyCane(ctx, 445, 755, 1);
    drawCandyCane(ctx, 1160, 755, -1);
  } else if (data.shape === "three_houses") {
    drawTinyHouse(ctx, 410, 690, "straw");
    drawTinyHouse(ctx, 800, 690, "sticks");
    drawTinyHouse(ctx, 1190, 690, "bricks");
  } else if (data.shape === "porridge") {
    strokeRoundRect(ctx, 420, 635, 760, 82, 18);
    for (let i = 0; i < 3; i += 1) {
      drawBowl(ctx, 610 + i * 190, 602, 1 + i * 0.15);
      drawBearFace(ctx, 520 + i * 285, 430, 0.78 + i * 0.08);
    }
    for (const x of [450, 1120]) {
      ctx.beginPath();
      ctx.moveTo(x, 715);
      ctx.lineTo(x - 60, 835);
      ctx.moveTo(x + 95, 715);
      ctx.lineTo(x + 150, 835);
      ctx.stroke();
    }
  } else if (data.shape === "sleeping_castle") {
    drawMoon(ctx, 1220, 170, 88);
    drawCastle(ctx, 800, 610, 1.05);
    for (let i = 0; i < 6; i += 1) {
      drawStarOutline(ctx, 260 + i * 190, 300 + (i % 2) * 70, 25);
    }
  } else if (data.shape === "snow_queen") {
    drawSnowflake(ctx, 315, 245, 60);
    drawSnowflake(ctx, 1225, 250, 70);
    drawIcePalace(ctx, 800, 625, 1.05);
    drawCrown(ctx, 800, 320, 105);
  } else if (data.shape === "mermaid") {
    drawWaterLine(ctx, 760);
    drawShell(ctx, 410, 745, 0.8);
    drawShell(ctx, 1160, 720, 0.9);
    ctx.beginPath();
    ctx.arc(790, 390, 54, 0, TAU);
    ctx.moveTo(790, 445);
    ctx.lineTo(770, 560);
    ctx.bezierCurveTo(660, 610, 630, 740, 760, 820);
    ctx.lineTo(820, 720);
    ctx.lineTo(930, 820);
    ctx.bezierCurveTo(920, 695, 875, 605, 810, 560);
    ctx.lineTo(790, 445);
    ctx.moveTo(760, 498);
    ctx.lineTo(670, 560);
    ctx.moveTo(820, 498);
    ctx.lineTo(920, 552);
    ctx.stroke();
  } else if (data.shape === "tea_party") {
    strokeRoundRect(ctx, 400, 655, 800, 90, 22);
    drawTeapot(ctx, 800, 600, 1.1);
    for (const x of [550, 675, 930, 1060]) {
      drawCup(ctx, x, 610, 0.9);
    }
    drawPocketWatch(ctx, 1190, 455, 0.75);
    drawRegularPolygon(ctx, 375, 500, 70, 4, 0.25);
  } else if (data.shape === "silver_shoes") {
    ctx.beginPath();
    ctx.moveTo(520, 835);
    ctx.bezierCurveTo(650, 705, 685, 600, 790, 500);
    ctx.bezierCurveTo(900, 610, 950, 715, 1080, 835);
    ctx.stroke();
    drawShoeOutline(ctx, 660, 660, 1);
    drawShoeOutline(ctx, 935, 660, -1);
    drawFlower(ctx, 420, 760, 38);
    drawFlower(ctx, 1180, 760, 38);
  } else if (data.shape === "puppet") {
    drawToyPuppet(ctx, 800, 560, 1.12);
  } else if (data.shape === "tin_friend") {
    drawTinFriend(ctx, 800, 575, 1.08);
  } else if (data.shape === "pirate_ship") {
    drawMoon(ctx, 1230, 170, 82);
    drawWaterLine(ctx, 785);
    drawSailboatVehicle(ctx, 800, 610, 1);
    ctx.beginPath();
    ctx.moveTo(800, 360);
    ctx.lineTo(800, 210);
    ctx.lineTo(930, 255);
    ctx.lineTo(800, 300);
    ctx.stroke();
  }
}

function drawPumpkinCarriage(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 130, 88, 0, 0, TAU);
  ctx.ellipse(-55, 0, 62, 82, 0, 0, TAU);
  ctx.ellipse(55, 0, 62, 82, 0, 0, TAU);
  ctx.arc(-82, 100, 32, 0, TAU);
  ctx.arc(82, 100, 32, 0, TAU);
  ctx.moveTo(-50, 82);
  ctx.lineTo(-95, 110);
  ctx.moveTo(50, 82);
  ctx.lineTo(95, 110);
  ctx.stroke();
  ctx.restore();
}

function drawBasket(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-70, -35);
  ctx.quadraticCurveTo(0, -125, 70, -35);
  ctx.moveTo(-95, -35);
  ctx.lineTo(-62, 95);
  ctx.lineTo(62, 95);
  ctx.lineTo(95, -35);
  ctx.closePath();
  ctx.moveTo(-72, 12);
  ctx.lineTo(72, 12);
  ctx.moveTo(-55, 56);
  ctx.lineTo(55, 56);
  ctx.stroke();
  ctx.restore();
}

function drawCandyCane(ctx, x, y, direction) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, 1);
  ctx.beginPath();
  ctx.moveTo(0, 95);
  ctx.lineTo(0, -72);
  ctx.quadraticCurveTo(0, -150, 78, -150);
  ctx.quadraticCurveTo(142, -150, 142, -92);
  ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-28, 60 - i * 42);
    ctx.lineTo(30, 28 - i * 42);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTinyHouse(ctx, x, y, texture) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeRect(-130, -110, 260, 220);
  ctx.beginPath();
  ctx.moveTo(-155, -110);
  ctx.lineTo(0, -235);
  ctx.lineTo(155, -110);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeRect(-36, 10, 72, 100);
  ctx.strokeRect(-100, -58, 58, 54);
  ctx.strokeRect(42, -58, 58, 54);
  if (texture === "straw") {
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-118 + i * 38, -100);
      ctx.lineTo(-138 + i * 38, 105);
      ctx.stroke();
    }
  } else if (texture === "sticks") {
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-130, -80 + i * 32);
      ctx.lineTo(130, -108 + i * 36);
      ctx.stroke();
    }
  } else {
    for (let yy = -80; yy < 100; yy += 46) {
      ctx.beginPath();
      ctx.moveTo(-130, yy);
      ctx.lineTo(130, yy);
      ctx.stroke();
    }
    for (let xx = -90; xx < 110; xx += 70) {
      ctx.beginPath();
      ctx.moveTo(xx, -110);
      ctx.lineTo(xx, 110);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBowl(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 86, 28, 0, 0, TAU);
  ctx.moveTo(-86, 0);
  ctx.quadraticCurveTo(-55, 95, 0, 95);
  ctx.quadraticCurveTo(55, 95, 86, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBearFace(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 86, 0, TAU);
  ctx.arc(-58, -55, 32, 0, TAU);
  ctx.arc(58, -55, 32, 0, TAU);
  ctx.arc(-28, -12, 8, 0, TAU);
  ctx.arc(28, -12, 8, 0, TAU);
  ctx.moveTo(-20, 35);
  ctx.quadraticCurveTo(0, 55, 20, 35);
  ctx.stroke();
  ctx.restore();
}

function drawMoon(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0.25 * Math.PI, 1.65 * Math.PI);
  ctx.quadraticCurveTo(x - radius * 0.5, y, x, y - radius);
  ctx.stroke();
}

function drawSnowflake(ctx, x, y, radius) {
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * TAU;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(angle) * radius, y - Math.sin(angle) * radius);
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.18, 0, TAU);
  ctx.stroke();
}

function drawIcePalace(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeRect(-310, -30, 620, 240);
  for (const towerX of [-245, 0, 245]) {
    ctx.beginPath();
    ctx.moveTo(towerX - 78, 210);
    ctx.lineTo(towerX - 55, -120);
    ctx.lineTo(towerX, -245);
    ctx.lineTo(towerX + 55, -120);
    ctx.lineTo(towerX + 78, 210);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 210, 70, Math.PI, TAU);
  ctx.lineTo(70, 210);
  ctx.moveTo(-70, 210);
  ctx.lineTo(-70, 85);
  ctx.moveTo(70, 85);
  ctx.lineTo(70, 210);
  ctx.stroke();
  ctx.restore();
}

function drawCrown(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x - size, y + size * 0.45);
  ctx.lineTo(x - size * 0.78, y - size * 0.55);
  ctx.lineTo(x - size * 0.25, y);
  ctx.lineTo(x, y - size);
  ctx.lineTo(x + size * 0.25, y);
  ctx.lineTo(x + size * 0.78, y - size * 0.55);
  ctx.lineTo(x + size, y + size * 0.45);
  ctx.closePath();
  ctx.stroke();
}

function drawTeapot(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 20, 105, 75, 0, 0, TAU);
  ctx.moveTo(-40, -48);
  ctx.lineTo(-20, -100);
  ctx.lineTo(20, -100);
  ctx.lineTo(40, -48);
  ctx.moveTo(92, 5);
  ctx.quadraticCurveTo(175, 20, 142, 88);
  ctx.moveTo(-92, 5);
  ctx.quadraticCurveTo(-180, 20, -140, 88);
  ctx.stroke();
  ctx.restore();
}

function drawCup(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 58, 18, 0, 0, TAU);
  ctx.moveTo(-58, 0);
  ctx.quadraticCurveTo(-45, 72, 0, 72);
  ctx.quadraticCurveTo(45, 72, 58, 0);
  ctx.moveTo(55, 20);
  ctx.quadraticCurveTo(105, 28, 68, 58);
  ctx.stroke();
  ctx.restore();
}

function drawPocketWatch(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 88, 0, TAU);
  ctx.arc(0, -112, 22, 0, TAU);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -52);
  ctx.moveTo(0, 0);
  ctx.lineTo(48, 20);
  ctx.stroke();
  ctx.restore();
}

function drawShoeOutline(ctx, x, y, direction) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, 1);
  ctx.beginPath();
  ctx.moveTo(-120, 10);
  ctx.bezierCurveTo(-45, -72, 42, -42, 96, 0);
  ctx.bezierCurveTo(165, 55, 240, 20, 278, -18);
  ctx.bezierCurveTo(270, 82, 148, 126, -45, 105);
  ctx.bezierCurveTo(-135, 95, -170, 60, -120, 10);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawToyPuppet(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-185, -300);
  ctx.lineTo(185, -300);
  ctx.moveTo(-110, -300);
  ctx.lineTo(-80, -105);
  ctx.moveTo(110, -300);
  ctx.lineTo(80, -105);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -85, 70, 0, TAU);
  ctx.moveTo(45, -92);
  ctx.lineTo(145, -70);
  ctx.moveTo(-70, -5);
  ctx.lineTo(-155, 100);
  ctx.moveTo(70, -5);
  ctx.lineTo(155, 100);
  ctx.stroke();
  strokeRoundRect(ctx, -75, -5, 150, 190, 24);
  ctx.beginPath();
  ctx.moveTo(-45, 185);
  ctx.lineTo(-85, 325);
  ctx.moveTo(45, 185);
  ctx.lineTo(85, 325);
  ctx.stroke();
  ctx.restore();
}

function drawTinFriend(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  strokeRoundRect(ctx, -82, -185, 164, 105, 18);
  ctx.beginPath();
  ctx.moveTo(-100, -185);
  ctx.lineTo(0, -290);
  ctx.lineTo(100, -185);
  ctx.moveTo(-120, -35);
  ctx.lineTo(-240, 80);
  ctx.moveTo(120, -35);
  ctx.lineTo(240, 80);
  ctx.stroke();
  strokeRoundRect(ctx, -115, -80, 230, 260, 28);
  drawHeartOutline(ctx, 0, 25, 38);
  ctx.beginPath();
  ctx.arc(-34, -135, 8, 0, TAU);
  ctx.arc(34, -135, 8, 0, TAU);
  ctx.moveTo(-25, -105);
  ctx.quadraticCurveTo(0, -84, 25, -105);
  ctx.moveTo(-70, 180);
  ctx.lineTo(-95, 325);
  ctx.moveTo(70, 180);
  ctx.lineTo(95, 325);
  ctx.stroke();
  ctx.restore();
}

function drawPatternPage(ctx, data, rnd) {
  if (data.shape === "mandala") {
    drawMandalaPattern(ctx, 800, 500, 360, rnd);
  } else {
    const cols = 5;
    const rows = 3;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = 280 + col * 260;
        const y = 260 + row * 240;
        const index = row * cols + col;
        drawPatternShape(ctx, data.shape, x, y, 105 + (index % 3) * 12, index);
      }
    }
  }
}

function drawFriendlySky(ctx, rnd) {
  const sunX = 225 + rnd() * 130;
  const sunY = 170 + rnd() * 70;
  drawSun(ctx, sunX, sunY, 62);
  drawCloudOutline(ctx, 1140 + rnd() * 160, 175 + rnd() * 75, 88);
}

function drawSun(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * TAU;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * (radius + 24), y + Math.sin(angle) * (radius + 24));
    ctx.lineTo(x + Math.cos(angle) * (radius + 66), y + Math.sin(angle) * (radius + 66));
    ctx.stroke();
  }
}

function drawGround(ctx, y, rnd) {
  const lift = (rnd() - 0.5) * 50;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.bezierCurveTo(300, y - 85 + lift, 540, y + 72, 815, y);
  ctx.bezierCurveTo(1110, y - 80, 1350, y + 40, WIDTH, y - 25);
  ctx.stroke();
}

function drawRoad(ctx, y) {
  ctx.beginPath();
  ctx.moveTo(0, y + 60);
  ctx.lineTo(WIDTH, y + 20);
  ctx.moveTo(0, y + 165);
  ctx.lineTo(WIDTH, y + 125);
  ctx.stroke();
  for (let x = 100; x < WIDTH; x += 220) {
    ctx.beginPath();
    ctx.moveTo(x, y + 110);
    ctx.lineTo(x + 85, y + 108);
    ctx.stroke();
  }
}

function drawWaterLine(ctx, y) {
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y + i * 45);
    for (let x = 0; x <= WIDTH; x += 160) {
      ctx.quadraticCurveTo(x + 80, y - 30 + i * 45, x + 160, y + i * 45);
    }
    ctx.stroke();
  }
}

function drawSmallFlowers(ctx, rnd, count) {
  for (let i = 0; i < count; i += 1) {
    const x = 170 + rnd() * 1260;
    const y = 740 + rnd() * 95;
    ctx.beginPath();
    ctx.moveTo(x, y + 65);
    ctx.lineTo(x, y + 12);
    ctx.stroke();
    drawFlower(ctx, x, y, 18 + rnd() * 10);
  }
}

function drawBubbles(ctx, rnd, count) {
  for (let i = 0; i < count; i += 1) {
    ctx.beginPath();
    ctx.arc(180 + rnd() * 1240, 160 + rnd() * 520, 20 + rnd() * 32, 0, TAU);
    ctx.stroke();
  }
}

function drawMammalAnimal(ctx, name, x, y, scale, rnd) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(-70, 20, 250, 135, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(190, -65, 100, 88, 0, 0, TAU);
  ctx.stroke();

  for (const legX of [-210, -90, 40, 125]) {
    strokeRoundRect(ctx, legX, 120, 45, 145, 18);
  }

  if (name === "Rabbit") {
    ctx.beginPath();
    ctx.ellipse(160, -170, 28, 94, -0.25, 0, TAU);
    ctx.ellipse(220, -170, 28, 94, 0.25, 0, TAU);
    ctx.stroke();
  } else if (name === "Deer") {
    drawAntler(ctx, 150, -150, -1);
    drawAntler(ctx, 225, -150, 1);
  } else if (["Bear", "Sheep"].includes(name)) {
    ctx.beginPath();
    ctx.arc(130, -125, 32, 0, TAU);
    ctx.arc(245, -125, 32, 0, TAU);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(135, -123);
    ctx.lineTo(164, -205);
    ctx.lineTo(200, -125);
    ctx.moveTo(205, -125);
    ctx.lineTo(250, -190);
    ctx.lineTo(270, -112);
    ctx.stroke();
  }

  ctx.beginPath();
  if (name === "Squirrel") {
    ctx.moveTo(-310, 5);
    ctx.bezierCurveTo(-475, -175, -230, -260, -220, -75);
    ctx.bezierCurveTo(-275, -85, -305, -45, -310, 5);
  } else if (name === "Pig") {
    ctx.arc(-330, 30, 38, 0, TAU);
  } else {
    ctx.moveTo(-305, 5);
    ctx.quadraticCurveTo(-390, -50, -335, -130);
  }
  ctx.stroke();

  if (name === "Cow") {
    drawSpot(ctx, -155, -40, 58);
    drawSpot(ctx, 45, 55, 42);
  } else if (name === "Sheep") {
    for (let i = 0; i < 8; i += 1) {
      ctx.beginPath();
      ctx.arc(-235 + i * 50, -75 + (i % 2) * 12, 30, 0, TAU);
      ctx.stroke();
    }
  } else if (name === "Horse") {
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(112 + i * 20, -120);
      ctx.lineTo(128 + i * 18, -45);
      ctx.stroke();
    }
  } else if (name === "Fox") {
    drawSpot(ctx, 205, -20, 38);
    ctx.beginPath();
    ctx.moveTo(-335, -130);
    ctx.lineTo(-390, -85);
    ctx.lineTo(-315, -80);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(225, -82, 8, 0, TAU);
  ctx.moveTo(286, -54);
  ctx.quadraticCurveTo(320, -34, 286, -14);
  ctx.moveTo(220, -20);
  ctx.quadraticCurveTo(250, 8, 285, -14);
  ctx.stroke();
  ctx.restore();
}

function drawAntler(ctx, x, y, direction) {
  ctx.beginPath();
  ctx.moveTo(x, y + 36);
  ctx.lineTo(x + direction * 38, y - 55);
  ctx.moveTo(x + direction * 24, y - 18);
  ctx.lineTo(x + direction * 70, y - 58);
  ctx.moveTo(x + direction * 36, y - 34);
  ctx.lineTo(x + direction * 40, y - 88);
  ctx.stroke();
}

function drawSpot(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.7, 0.4, 0, TAU);
  ctx.stroke();
}

function drawBirdAnimal(ctx, x, y, name) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.ellipse(0, 40, 145, 118, 0, 0, TAU);
  ctx.ellipse(92, -80, 78, 70, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(160, -78);
  ctx.lineTo(235, -38);
  ctx.lineTo(160, -8);
  ctx.closePath();
  ctx.moveTo(-20, 150);
  ctx.lineTo(-42, 230);
  ctx.moveTo(50, 150);
  ctx.lineTo(36, 230);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-25, 45, 74, 55, -0.45, 0, TAU);
  ctx.stroke();
  if (name === "Chicken") {
    ctx.beginPath();
    ctx.arc(70, -155, 20, 0, TAU);
    ctx.arc(100, -160, 20, 0, TAU);
    ctx.arc(130, -150, 20, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(112, -92, 8, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawOwlAnimal(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.ellipse(0, 40, 165, 205, 0, 0, TAU);
  ctx.moveTo(-90, -115);
  ctx.lineTo(-150, -210);
  ctx.lineTo(-25, -150);
  ctx.moveTo(90, -115);
  ctx.lineTo(150, -210);
  ctx.lineTo(25, -150);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-58, -45, 45, 0, TAU);
  ctx.arc(58, -45, 45, 0, TAU);
  ctx.moveTo(-15, 5);
  ctx.lineTo(0, 38);
  ctx.lineTo(15, 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-55, 85, 60, 82, -0.35, 0, TAU);
  ctx.ellipse(55, 85, 60, 82, 0.35, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawFishAnimal(ctx, x, y, scale, rnd) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 210, 118, 0, 0, TAU);
  ctx.moveTo(195, 0);
  ctx.lineTo(345, -100);
  ctx.lineTo(345, 100);
  ctx.closePath();
  ctx.moveTo(-40, -82);
  ctx.lineTo(25, -180);
  ctx.lineTo(80, -82);
  ctx.moveTo(-20, 95);
  ctx.lineTo(50, 175);
  ctx.lineTo(98, 80);
  ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(-100 + i * 55, 0, 36 + rnd() * 4, -0.55 * Math.PI, 0.55 * Math.PI);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(-145, -35, 9, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawWhaleAnimal(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 265, 118, 0, 0, TAU);
  ctx.moveTo(225, -20);
  ctx.lineTo(380, -108);
  ctx.lineTo(345, 0);
  ctx.lineTo(380, 108);
  ctx.lineTo(225, 20);
  ctx.moveTo(-40, 72);
  ctx.lineTo(42, 165);
  ctx.lineTo(95, 70);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-160, -30, 10, 0, TAU);
  ctx.moveTo(-205, 18);
  ctx.quadraticCurveTo(-165, 48, -110, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-58, -120);
  ctx.bezierCurveTo(-95, -210, -20, -210, -45, -275);
  ctx.moveTo(-8, -120);
  ctx.bezierCurveTo(30, -205, -35, -205, -8, -270);
  ctx.stroke();
  ctx.restore();
}

function drawButterflyAnimal(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(-95, -55, 92, 125, -0.45, 0, TAU);
  ctx.ellipse(-95, 95, 82, 100, 0.45, 0, TAU);
  ctx.ellipse(95, -55, 92, 125, 0.45, 0, TAU);
  ctx.ellipse(95, 95, 82, 100, -0.45, 0, TAU);
  ctx.stroke();
  strokeRoundRect(ctx, -18, -135, 36, 295, 20);
  ctx.beginPath();
  ctx.moveTo(-5, -132);
  ctx.quadraticCurveTo(-90, -205, -135, -135);
  ctx.moveTo(5, -132);
  ctx.quadraticCurveTo(90, -205, 135, -135);
  ctx.stroke();
  ctx.restore();
}

function drawBeeAnimal(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 185, 92, 0, 0, TAU);
  ctx.ellipse(-65, -105, 72, 58, -0.5, 0, TAU);
  ctx.ellipse(55, -105, 72, 58, 0.5, 0, TAU);
  ctx.moveTo(178, 0);
  ctx.lineTo(252, -45);
  ctx.lineTo(252, 45);
  ctx.closePath();
  ctx.stroke();
  for (let xLine = -80; xLine <= 85; xLine += 55) {
    ctx.beginPath();
    ctx.moveTo(xLine, -82);
    ctx.lineTo(xLine + 18, 82);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(-125, -20, 8, 0, TAU);
  ctx.moveTo(-145, -68);
  ctx.quadraticCurveTo(-190, -145, -230, -80);
  ctx.moveTo(-110, -72);
  ctx.quadraticCurveTo(-90, -155, -30, -110);
  ctx.stroke();
  ctx.restore();
}

function drawSnailAnimal(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(-40, -5, 130, 115, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-40, -5, 82, 0.15 * Math.PI, 1.9 * Math.PI);
  ctx.arc(-40, -5, 45, 0.15 * Math.PI, 1.75 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(80, 88);
  ctx.lineTo(225, 88);
  ctx.quadraticCurveTo(280, 78, 270, 25);
  ctx.quadraticCurveTo(235, -5, 210, 38);
  ctx.moveTo(220, 20);
  ctx.lineTo(250, -65);
  ctx.moveTo(245, 20);
  ctx.lineTo(300, -50);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(252, -68, 8, 0, TAU);
  ctx.arc(303, -52, 8, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawTurtleAnimal(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 210, 135, 0, 0, TAU);
  ctx.ellipse(235, -10, 62, 58, 0, 0, TAU);
  ctx.arc(248, -25, 7, 0, TAU);
  ctx.moveTo(-190, 90);
  ctx.ellipse(-160, 95, 48, 30, 0.2, 0, TAU);
  ctx.moveTo(145, 95);
  ctx.ellipse(160, 95, 48, 30, -0.2, 0, TAU);
  ctx.moveTo(-110, -110);
  ctx.ellipse(-130, -105, 45, 28, -0.4, 0, TAU);
  ctx.moveTo(100, -110);
  ctx.ellipse(122, -105, 45, 28, 0.4, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-165, -5);
  ctx.lineTo(0, -125);
  ctx.lineTo(165, -5);
  ctx.moveTo(-125, 70);
  ctx.lineTo(0, -125);
  ctx.lineTo(125, 70);
  ctx.stroke();
  ctx.restore();
}

function drawFrogAnimal(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 40, 180, 120, 0, 0, TAU);
  ctx.arc(-82, -68, 52, 0, TAU);
  ctx.arc(82, -68, 52, 0, TAU);
  ctx.arc(-82, -68, 12, 0, TAU);
  ctx.arc(82, -68, 12, 0, TAU);
  ctx.moveTo(-72, 60);
  ctx.quadraticCurveTo(0, 120, 72, 60);
  ctx.moveTo(-160, 122);
  ctx.lineTo(-245, 210);
  ctx.moveTo(160, 122);
  ctx.lineTo(245, 210);
  ctx.stroke();
  ctx.restore();
}

function drawCrabAnimal(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 180, 105, 0, 0, TAU);
  ctx.arc(-65, -80, 10, 0, TAU);
  ctx.arc(65, -80, 10, 0, TAU);
  ctx.moveTo(-65, -72);
  ctx.lineTo(-65, -150);
  ctx.moveTo(65, -72);
  ctx.lineTo(65, -150);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    const yLeg = -35 + i * 30;
    ctx.beginPath();
    ctx.moveTo(-150, yLeg);
    ctx.lineTo(-250, yLeg - 55);
    ctx.moveTo(150, yLeg);
    ctx.lineTo(250, yLeg - 55);
    ctx.stroke();
  }
  drawClaw(ctx, -275, -125, -1);
  drawClaw(ctx, 275, -125, 1);
  ctx.restore();
}

function drawClaw(ctx, x, y, direction) {
  ctx.beginPath();
  ctx.arc(x, y, 45, direction > 0 ? -0.35 * Math.PI : -0.65 * Math.PI, direction > 0 ? 0.75 * Math.PI : 1.35 * Math.PI);
  ctx.lineTo(x + direction * 12, y);
  ctx.stroke();
}

function drawWheeledVehicle(ctx, shape, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const tall = ["bus", "truck", "van"].includes(shape);
  const tractor = shape === "tractor";
  const width = tall ? 470 : 410;
  const height = tall ? 170 : 135;
  strokeRoundRect(ctx, -width / 2, -height / 2, width, height, 28);
  ctx.beginPath();
  ctx.moveTo(-160, -height / 2);
  ctx.lineTo(-90, -150);
  ctx.lineTo(110, -150);
  ctx.lineTo(180, -height / 2);
  ctx.stroke();
  for (let wx = -135; wx <= 135; wx += 135) {
    ctx.beginPath();
    ctx.arc(wx, height / 2 + 28, tractor && wx < 0 ? 62 : 48, 0, TAU);
    ctx.arc(wx, height / 2 + 28, tractor && wx < 0 ? 24 : 18, 0, TAU);
    ctx.stroke();
  }
  ctx.strokeRect(-118, -125, 78, 68);
  ctx.strokeRect(-8, -125, 78, 68);
  if (shape === "truck") {
    ctx.beginPath();
    ctx.moveTo(120, -68);
    ctx.lineTo(245, -68);
    ctx.lineTo(245, 12);
    ctx.lineTo(120, 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTrainVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  strokeRoundRect(ctx, -380, -95, 230, 165, 24);
  strokeRoundRect(ctx, -120, -75, 210, 145, 18);
  strokeRoundRect(ctx, 125, -75, 210, 145, 18);
  ctx.strokeRect(-335, -180, 90, 85);
  ctx.beginPath();
  ctx.moveTo(-410, -95);
  ctx.lineTo(-455, 70);
  ctx.lineTo(-380, 70);
  ctx.moveTo(-150, 0);
  ctx.lineTo(-120, 0);
  ctx.moveTo(90, 0);
  ctx.lineTo(125, 0);
  ctx.stroke();
  for (let wx = -340; wx <= 275; wx += 115) {
    ctx.beginPath();
    ctx.arc(wx, 98, 35, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBicycleVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(-150, 80, 80, 0, TAU);
  ctx.arc(150, 80, 80, 0, TAU);
  ctx.moveTo(-150, 80);
  ctx.lineTo(-20, -60);
  ctx.lineTo(60, 80);
  ctx.lineTo(-150, 80);
  ctx.moveTo(-20, -60);
  ctx.lineTo(150, 80);
  ctx.moveTo(60, 80);
  ctx.lineTo(105, -42);
  ctx.lineTo(180, -42);
  ctx.moveTo(-20, -60);
  ctx.lineTo(-60, -115);
  ctx.lineTo(-115, -115);
  ctx.stroke();
  ctx.restore();
}

function drawScooterVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(-140, 85, 50, 0, TAU);
  ctx.arc(145, 85, 50, 0, TAU);
  ctx.moveTo(-140, 35);
  ctx.lineTo(145, 35);
  ctx.lineTo(220, -125);
  ctx.lineTo(290, -125);
  ctx.moveTo(55, 35);
  ctx.lineTo(10, -65);
  ctx.lineTo(-55, -65);
  ctx.stroke();
  ctx.restore();
}

function drawPlaneVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 310, 64, 0, 0, TAU);
  ctx.moveTo(-70, 0);
  ctx.lineTo(-250, 175);
  ctx.lineTo(25, 72);
  ctx.moveTo(-70, 0);
  ctx.lineTo(-250, -175);
  ctx.lineTo(25, -72);
  ctx.moveTo(245, 0);
  ctx.lineTo(360, -90);
  ctx.lineTo(315, 0);
  ctx.lineTo(360, 90);
  ctx.closePath();
  ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(-125 + i * 70, -6, 16, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHelicopterVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 20, 210, 85, 0, 0, TAU);
  ctx.moveTo(185, 10);
  ctx.lineTo(380, -70);
  ctx.lineTo(395, -20);
  ctx.moveTo(-80, -80);
  ctx.lineTo(-80, -160);
  ctx.moveTo(-260, -160);
  ctx.lineTo(100, -160);
  ctx.moveTo(-120, 110);
  ctx.lineTo(-190, 175);
  ctx.lineTo(120, 175);
  ctx.lineTo(55, 110);
  ctx.stroke();
  ctx.strokeRect(-85, -35, 90, 58);
  ctx.strokeRect(35, -30, 72, 52);
  ctx.restore();
}

function drawSailboatVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-240, 115);
  ctx.lineTo(250, 115);
  ctx.lineTo(160, 230);
  ctx.lineTo(-160, 230);
  ctx.closePath();
  ctx.moveTo(0, 115);
  ctx.lineTo(0, -250);
  ctx.lineTo(-190, 90);
  ctx.lineTo(0, 90);
  ctx.moveTo(18, -230);
  ctx.lineTo(220, 90);
  ctx.lineTo(18, 90);
  ctx.stroke();
  ctx.restore();
}

function drawBoatVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-290, 65);
  ctx.lineTo(290, 65);
  ctx.lineTo(205, 190);
  ctx.lineTo(-210, 190);
  ctx.closePath();
  ctx.strokeRect(-150, -72, 260, 137);
  ctx.strokeRect(130, -20, 90, 85);
  ctx.stroke();
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(-90 + i * 90, 0, 18, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSubmarineVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 40, 280, 100, 0, 0, TAU);
  ctx.moveTo(235, 40);
  ctx.lineTo(360, -25);
  ctx.lineTo(360, 105);
  ctx.closePath();
  ctx.moveTo(-20, -60);
  ctx.lineTo(-20, -165);
  ctx.lineTo(110, -165);
  ctx.lineTo(110, -60);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(-130 + i * 82, 35, 28, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRocketVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, -295);
  ctx.bezierCurveTo(-140, -150, -140, 105, 0, 245);
  ctx.bezierCurveTo(140, 105, 140, -150, 0, -295);
  ctx.closePath();
  ctx.moveTo(-102, 92);
  ctx.lineTo(-260, 225);
  ctx.lineTo(-80, 210);
  ctx.moveTo(102, 92);
  ctx.lineTo(260, 225);
  ctx.lineTo(80, 210);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -88, 62, 0, TAU);
  ctx.moveTo(-55, 245);
  ctx.bezierCurveTo(-85, 340, -10, 370, 0, 430);
  ctx.bezierCurveTo(10, 370, 85, 340, 55, 245);
  ctx.stroke();
  ctx.restore();
}

function drawBalloonVehicle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, -90, 165, 220, 0, 0, TAU);
  ctx.moveTo(-82, 100);
  ctx.lineTo(-48, 190);
  ctx.lineTo(48, 190);
  ctx.lineTo(82, 100);
  ctx.moveTo(-55, 190);
  ctx.lineTo(-80, 285);
  ctx.lineTo(80, 285);
  ctx.lineTo(55, 190);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -305);
  ctx.bezierCurveTo(-60, -220, -60, -10, 0, 120);
  ctx.bezierCurveTo(60, -10, 60, -220, 0, -305);
  ctx.stroke();
  ctx.restore();
}

function drawTree(ctx, x, y, scale, fruit) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  strokeRoundRect(ctx, -32, -168, 64, 170, 18);
  ctx.beginPath();
  ctx.arc(-80, -210, 78, 0, TAU);
  ctx.arc(0, -268, 92, 0, TAU);
  ctx.arc(86, -210, 78, 0, TAU);
  ctx.arc(0, -185, 88, 0, TAU);
  ctx.stroke();
  if (fruit) {
    for (const point of [[-62, -238], [35, -268], [88, -202], [-10, -185]]) {
      ctx.beginPath();
      ctx.arc(point[0], point[1], 14, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawMountains(ctx) {
  ctx.beginPath();
  ctx.moveTo(90, 760);
  ctx.lineTo(405, 260);
  ctx.lineTo(720, 760);
  ctx.lineTo(950, 360);
  ctx.lineTo(1430, 760);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(345, 360);
  ctx.lineTo(405, 455);
  ctx.lineTo(465, 360);
  ctx.moveTo(888, 465);
  ctx.lineTo(950, 550);
  ctx.lineTo(1018, 465);
  ctx.stroke();
}

function drawLake(ctx, y) {
  ctx.beginPath();
  ctx.ellipse(800, y, 390, 95, 0, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(535, y - 10 + i * 35);
    ctx.quadraticCurveTo(800, y - 65 + i * 35, 1065, y - 10 + i * 35);
    ctx.stroke();
  }
}

function drawRainbow(ctx, x, y, radius) {
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(x, y, radius - i * 46, Math.PI, TAU);
    ctx.stroke();
  }
}

function drawReeds(ctx, x, y) {
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * 24, y);
    ctx.quadraticCurveTo(x - 25 + i * 30, y - 120, x + 10 + i * 22, y - 230);
    ctx.stroke();
  }
}

function drawSnowScene(ctx) {
  drawCloudOutline(ctx, 420, 230, 105);
  drawCloudOutline(ctx, 1180, 235, 120);
  for (let i = 0; i < 18; i += 1) {
    drawStarOutline(ctx, 130 + (i % 9) * 165, 370 + Math.floor(i / 9) * 120, 16);
  }
  ctx.beginPath();
  ctx.moveTo(0, 800);
  ctx.bezierCurveTo(360, 725, 760, 850, 1110, 785);
  ctx.bezierCurveTo(1325, 745, 1470, 785, WIDTH, 760);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(800, 675, 92, 0, TAU);
  ctx.arc(800, 520, 72, 0, TAU);
  ctx.arc(800, 400, 52, 0, TAU);
  ctx.moveTo(748, 525);
  ctx.lineTo(615, 455);
  ctx.moveTo(852, 525);
  ctx.lineTo(985, 455);
  ctx.stroke();
}

function drawDesertScene(ctx) {
  drawSun(ctx, 1210, 180, 62);
  ctx.beginPath();
  ctx.moveTo(0, 770);
  ctx.bezierCurveTo(380, 650, 635, 820, 920, 730);
  ctx.bezierCurveTo(1200, 650, 1385, 725, WIDTH, 690);
  ctx.stroke();
  for (const x of [360, 800, 1170]) {
    ctx.beginPath();
    ctx.moveTo(x, 755);
    ctx.lineTo(x, 460);
    ctx.moveTo(x, 560);
    ctx.lineTo(x - 90, 500);
    ctx.lineTo(x - 90, 420);
    ctx.moveTo(x, 610);
    ctx.lineTo(x + 95, 545);
    ctx.lineTo(x + 95, 465);
    ctx.stroke();
  }
}

function drawLeaf(ctx, x, y, size, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size, -size * 0.6, size, size * 0.6, 0, size);
  ctx.bezierCurveTo(-size, size * 0.6, -size, -size * 0.6, 0, -size);
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.moveTo(0, -size * 0.15);
  ctx.lineTo(size * 0.55, -size * 0.45);
  ctx.moveTo(0, size * 0.18);
  ctx.lineTo(-size * 0.55, -size * 0.1);
  ctx.stroke();
  ctx.restore();
}

function drawMushroom(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-95, -60);
  ctx.quadraticCurveTo(0, -190, 95, -60);
  ctx.lineTo(-95, -60);
  ctx.closePath();
  ctx.stroke();
  strokeRoundRect(ctx, -38, -58, 76, 145, 28);
  ctx.beginPath();
  ctx.arc(-35, -95, 15, 0, TAU);
  ctx.arc(20, -125, 18, 0, TAU);
  ctx.arc(45, -82, 13, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawShell(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-90, 70);
  ctx.quadraticCurveTo(0, -145, 90, 70);
  ctx.closePath();
  for (let i = -2; i <= 2; i += 1) {
    ctx.moveTo(0, -135);
    ctx.quadraticCurveTo(i * 35, -30, i * 42, 70);
  }
  ctx.stroke();
  ctx.restore();
}

function drawMoonGarden(ctx) {
  ctx.beginPath();
  ctx.arc(1230, 195, 95, 0.35 * Math.PI, 1.65 * Math.PI);
  ctx.quadraticCurveTo(1165, 195, 1230, 45);
  ctx.stroke();
  drawCloudOutline(ctx, 330, 245, 100);
  drawGround(ctx, 820, () => 0.45);
  for (let i = 0; i < 7; i += 1) {
    drawStarOutline(ctx, 240 + i * 170, 400 + (i % 2) * 75, 32);
  }
  drawSmallFlowers(ctx, mulberry32(888), 6);
}

function drawVolcano(ctx) {
  drawSun(ctx, 260, 185, 55);
  ctx.beginPath();
  ctx.moveTo(300, 830);
  ctx.lineTo(760, 280);
  ctx.lineTo(860, 280);
  ctx.lineTo(1300, 830);
  ctx.closePath();
  ctx.moveTo(730, 280);
  ctx.bezierCurveTo(705, 170, 790, 150, 760, 60);
  ctx.moveTo(830, 280);
  ctx.bezierCurveTo(900, 180, 810, 150, 880, 75);
  ctx.stroke();
}

function drawWaterfall(ctx) {
  drawMountains(ctx);
  ctx.beginPath();
  ctx.moveTo(690, 405);
  ctx.lineTo(690, 825);
  ctx.moveTo(910, 405);
  ctx.lineTo(910, 825);
  ctx.moveTo(746, 430);
  ctx.bezierCurveTo(725, 565, 775, 680, 742, 820);
  ctx.moveTo(835, 425);
  ctx.bezierCurveTo(860, 560, 810, 700, 850, 820);
  ctx.stroke();
  drawLake(ctx, 840);
}

function drawHouseShape(ctx, x, y, width, height, kind) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeRect(-width / 2, -height / 2, width, height);
  ctx.beginPath();
  ctx.moveTo(-width / 2 - 45, -height / 2);
  ctx.lineTo(0, -height / 2 - 180);
  ctx.lineTo(width / 2 + 45, -height / 2);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeRect(-55, height / 2 - 120, 110, 120);
  ctx.strokeRect(-width / 2 + 60, -height / 2 + 65, 88, 80);
  ctx.strokeRect(width / 2 - 148, -height / 2 + 65, 88, 80);
  if (kind === "cabin") {
    for (let yy = -height / 2 + 38; yy < height / 2; yy += 48) {
      ctx.beginPath();
      ctx.moveTo(-width / 2, yy);
      ctx.lineTo(width / 2, yy);
      ctx.stroke();
    }
  } else if (kind === "treehouse") {
    ctx.beginPath();
    ctx.moveTo(-width / 2, height / 2);
    ctx.lineTo(-width / 2 - 115, height / 2 + 115);
    ctx.moveTo(width / 2, height / 2);
    ctx.lineTo(width / 2 + 115, height / 2 + 115);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCastle(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeRect(-310, -55, 620, 265);
  for (const towerX of [-350, 0, 350]) {
    ctx.strokeRect(towerX - 70, -180, 140, 390);
    ctx.beginPath();
    ctx.moveTo(towerX - 90, -180);
    ctx.lineTo(towerX, -300);
    ctx.lineTo(towerX + 90, -180);
    ctx.closePath();
    ctx.stroke();
  }
  for (let i = 0; i < 5; i += 1) {
    ctx.strokeRect(-250 + i * 125, -110, 62, 70);
  }
  ctx.beginPath();
  ctx.arc(0, 210, 72, Math.PI, TAU);
  ctx.lineTo(72, 210);
  ctx.moveTo(-72, 210);
  ctx.lineTo(-72, 80);
  ctx.moveTo(72, 80);
  ctx.lineTo(72, 210);
  ctx.stroke();
  ctx.restore();
}

function drawLighthouse(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-100, 270);
  ctx.lineTo(-55, -220);
  ctx.lineTo(55, -220);
  ctx.lineTo(100, 270);
  ctx.closePath();
  ctx.moveTo(-90, -65);
  ctx.lineTo(90, -105);
  ctx.moveTo(-75, 50);
  ctx.lineTo(75, 10);
  ctx.moveTo(-58, 165);
  ctx.lineTo(58, 125);
  ctx.stroke();
  strokeRoundRect(ctx, -100, -305, 200, 85, 18);
  ctx.beginPath();
  ctx.moveTo(-150, -305);
  ctx.lineTo(150, -305);
  ctx.moveTo(0, -385);
  ctx.lineTo(120, -305);
  ctx.lineTo(-120, -305);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawBarn(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeRect(-285, -90, 570, 300);
  ctx.beginPath();
  ctx.moveTo(-320, -90);
  ctx.lineTo(0, -310);
  ctx.lineTo(320, -90);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeRect(-85, 40, 170, 170);
  ctx.beginPath();
  ctx.moveTo(-85, 40);
  ctx.lineTo(85, 210);
  ctx.moveTo(85, 40);
  ctx.lineTo(-85, 210);
  ctx.stroke();
  ctx.strokeRect(-225, -20, 92, 82);
  ctx.strokeRect(130, -20, 92, 82);
  ctx.restore();
}

function drawSchool(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeRect(-330, -120, 660, 330);
  ctx.beginPath();
  ctx.moveTo(-370, -120);
  ctx.lineTo(0, -320);
  ctx.lineTo(370, -120);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -190, 44, 0, TAU);
  ctx.moveTo(0, -190);
  ctx.lineTo(0, -222);
  ctx.moveTo(0, -190);
  ctx.lineTo(26, -190);
  ctx.stroke();
  ctx.strokeRect(-55, 60, 110, 150);
  for (const wx of [-230, -115, 115, 230]) {
    ctx.strokeRect(wx - 36, -45, 72, 72);
  }
  ctx.restore();
}

function drawBridge(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-420, 120);
  ctx.bezierCurveTo(-230, -120, 230, -120, 420, 120);
  ctx.lineTo(420, 200);
  ctx.lineTo(-420, 200);
  ctx.closePath();
  ctx.moveTo(-320, 120);
  ctx.lineTo(-320, 200);
  ctx.moveTo(-160, 35);
  ctx.lineTo(-160, 200);
  ctx.moveTo(0, 5);
  ctx.lineTo(0, 200);
  ctx.moveTo(160, 35);
  ctx.lineTo(160, 200);
  ctx.moveTo(320, 120);
  ctx.lineTo(320, 200);
  ctx.stroke();
  ctx.restore();
}

function drawWindmill(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-120, 260);
  ctx.lineTo(-70, -90);
  ctx.lineTo(70, -90);
  ctx.lineTo(120, 260);
  ctx.closePath();
  ctx.moveTo(-100, -90);
  ctx.lineTo(0, -220);
  ctx.lineTo(100, -90);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -180, 26, 0, TAU);
  for (let i = 0; i < 4; i += 1) {
    const angle = i * Math.PI / 2;
    ctx.moveTo(Math.cos(angle) * 28, -180 + Math.sin(angle) * 28);
    ctx.lineTo(Math.cos(angle) * 185, -180 + Math.sin(angle) * 185);
  }
  ctx.stroke();
  ctx.strokeRect(-42, 115, 84, 145);
  ctx.restore();
}

function drawLibrary(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeRect(-340, -95, 680, 305);
  ctx.beginPath();
  ctx.moveTo(-390, -95);
  ctx.lineTo(0, -300);
  ctx.lineTo(390, -95);
  ctx.closePath();
  for (const col of [-235, -80, 80, 235]) {
    ctx.moveTo(col, -95);
    ctx.lineTo(col, 210);
  }
  ctx.stroke();
  ctx.strokeRect(-58, 60, 116, 150);
  ctx.restore();
}

function drawShop(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeRect(-330, -70, 660, 280);
  ctx.beginPath();
  ctx.moveTo(-360, -70);
  ctx.lineTo(-320, -185);
  ctx.lineTo(320, -185);
  ctx.lineTo(360, -70);
  ctx.closePath();
  for (let i = 0; i < 7; i += 1) {
    ctx.moveTo(-300 + i * 100, -185);
    ctx.lineTo(-330 + i * 110, -70);
  }
  ctx.stroke();
  ctx.strokeRect(-250, 5, 145, 105);
  ctx.strokeRect(105, 5, 145, 105);
  ctx.strokeRect(-52, 60, 104, 150);
  ctx.restore();
}

function drawStation(ctx, x, y, scale) {
  drawShop(ctx, x, y, scale);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, -125, 45, 0, TAU);
  ctx.moveTo(0, -165);
  ctx.lineTo(0, -85);
  ctx.moveTo(-40, -125);
  ctx.lineTo(40, -125);
  ctx.stroke();
  ctx.restore();
}

function drawPlayground(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-320, 220);
  ctx.lineTo(-150, -165);
  ctx.lineTo(10, 220);
  ctx.moveTo(-250, -5);
  ctx.lineTo(-55, -5);
  ctx.moveTo(-175, -165);
  ctx.lineTo(-175, -260);
  ctx.lineTo(240, -260);
  ctx.lineTo(240, 220);
  ctx.moveTo(150, -260);
  ctx.lineTo(150, -120);
  ctx.arc(150, -82, 38, 0, Math.PI);
  ctx.moveTo(240, -260);
  ctx.lineTo(360, 220);
  ctx.stroke();
  ctx.restore();
}

function drawIgloo(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 80, 230, Math.PI, TAU);
  ctx.lineTo(230, 80);
  ctx.lineTo(-230, 80);
  ctx.closePath();
  ctx.moveTo(-80, 80);
  ctx.arc(0, 80, 80, Math.PI, TAU);
  ctx.lineTo(80, 80);
  ctx.moveTo(-155, -75);
  ctx.lineTo(155, -75);
  ctx.moveTo(-220, 5);
  ctx.lineTo(220, 5);
  ctx.moveTo(-72, -145);
  ctx.lineTo(-120, 80);
  ctx.moveTo(72, -145);
  ctx.lineTo(120, 80);
  ctx.stroke();
  ctx.restore();
}

function drawMandalaPattern(ctx, x, y, radius, rnd) {
  for (let ring = 0; ring < 4; ring += 1) {
    ctx.beginPath();
    ctx.arc(x, y, radius - ring * 72, 0, TAU);
    ctx.stroke();
  }
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * TAU;
    const px = x + Math.cos(angle) * 230;
    const py = y + Math.sin(angle) * 230;
    drawFlower(ctx, px, py, 34 + rnd() * 8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    ctx.stroke();
  }
  drawFlower(ctx, x, y, 82);
}

function drawPatternShape(ctx, shape, x, y, size, index) {
  if (shape === "stars") {
    drawStarOutline(ctx, x, y, size);
  } else if (shape === "shapes") {
    const sides = 3 + (index % 5);
    drawRegularPolygon(ctx, x, y, size, sides, index * 0.25);
  } else if (shape === "hearts") {
    drawHeartOutline(ctx, x, y, size);
  } else if (shape === "circles" || shape === "bubbles") {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.arc(x, y, size * 0.55, 0, TAU);
    ctx.stroke();
  } else if (shape === "kites") {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.72, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.45, y);
    ctx.closePath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.moveTo(x - size * 0.45, y);
    ctx.lineTo(x + size * 0.72, y);
    ctx.stroke();
  } else if (shape === "spirals") {
    drawSun(ctx, x, y, size * 0.42);
    ctx.beginPath();
    for (let i = 0; i < 38; i += 1) {
      const r = i * size / 42;
      const angle = i * 0.48;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  } else if (shape === "waves") {
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x - size, y - size / 2 + i * size / 4);
      ctx.quadraticCurveTo(x - size / 2, y - size + i * size / 4, x, y - size / 2 + i * size / 4);
      ctx.quadraticCurveTo(x + size / 2, y + i * size / 4, x + size, y - size / 2 + i * size / 4);
      ctx.stroke();
    }
  } else if (shape === "leaves") {
    drawLeaf(ctx, x, y, size, index * 0.35);
  } else if (shape === "crowns") {
    ctx.beginPath();
    ctx.moveTo(x - size, y + size * 0.55);
    ctx.lineTo(x - size * 0.8, y - size * 0.65);
    ctx.lineTo(x - size * 0.25, y);
    ctx.lineTo(x, y - size);
    ctx.lineTo(x + size * 0.25, y);
    ctx.lineTo(x + size * 0.8, y - size * 0.65);
    ctx.lineTo(x + size, y + size * 0.55);
    ctx.closePath();
    ctx.stroke();
  } else if (shape === "gems") {
    ctx.beginPath();
    ctx.moveTo(x - size, y - size * 0.35);
    ctx.lineTo(x - size * 0.45, y - size);
    ctx.lineTo(x + size * 0.45, y - size);
    ctx.lineTo(x + size, y - size * 0.35);
    ctx.lineTo(x, y + size);
    ctx.closePath();
    ctx.moveTo(x - size, y - size * 0.35);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x + size, y - size * 0.35);
    ctx.moveTo(x - size * 0.45, y - size);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x + size * 0.45, y - size);
    ctx.stroke();
  } else {
    drawFlower(ctx, x, y, size * 0.5);
  }
}

function drawHeartOutline(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.82);
  ctx.bezierCurveTo(x - size * 1.25, y + size * 0.1, x - size, y - size * 0.9, x - size * 0.15, y - size * 0.52);
  ctx.bezierCurveTo(x, y - size * 0.95, x + size, y - size * 0.9, x + size, y);
  ctx.bezierCurveTo(x + size, y + size * 0.45, x + size * 0.55, y + size * 0.72, x, y + size * 0.82);
  ctx.closePath();
  ctx.stroke();
}

function drawRegularPolygon(ctx, x, y, radius, sides, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = rotation - Math.PI / 2 + (i / sides) * TAU;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

function strokeRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.stroke();
}

function mulberry32(seed) {
  return () => {
    let t = seed += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawFlower(ctx, x, y, size) {
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * TAU;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(angle) * size * 0.6,
      y + Math.sin(angle) * size * 0.6,
      size * 0.35,
      size * 0.58,
      angle,
      0,
      TAU
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, size * 0.35, 0, TAU);
  ctx.stroke();
}

function drawStarOutline(ctx, x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i / 10) * TAU;
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

function drawCloudOutline(ctx, x, y, size) {
  ctx.beginPath();
  ctx.arc(x - size * 0.38, y + size * 0.12, size * 0.32, Math.PI, TAU);
  ctx.arc(x, y - size * 0.08, size * 0.42, Math.PI, TAU);
  ctx.arc(x + size * 0.42, y + size * 0.08, size * 0.35, Math.PI, TAU);
  ctx.lineTo(x + size * 0.78, y + size * 0.4);
  ctx.lineTo(x - size * 0.72, y + size * 0.4);
  ctx.closePath();
  ctx.stroke();
}

function onPointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }
  event.preventDefault();
  if (els.frame.setPointerCapture) {
    els.frame.setPointerCapture(event.pointerId);
  }
  const point = getCanvasPoint(event);

  if (state.tool === "fill") {
    floodFill(point.x, point.y, state.color);
    saveHistory();
    return;
  }

  if (state.tool === "stamp") {
    placeStamp(point);
    saveHistory();
    return;
  }

  state.isDrawing = true;
  state.lastPoint = point;
  drawDot(point);
  if (state.mirror) {
    drawDot(mirrorPoint(point));
  }
}

function onPointerMove(event) {
  if (!state.isDrawing || !state.lastPoint) {
    return;
  }
  event.preventDefault();
  const point = getCanvasPoint(event);
  drawSegment(state.lastPoint, point);
  if (state.mirror) {
    drawSegment(mirrorPoint(state.lastPoint), mirrorPoint(point));
  }
  state.lastPoint = point;
}

function onPointerUp() {
  if (!state.isDrawing) {
    return;
  }
  state.isDrawing = false;
  state.lastPoint = null;
  saveHistory();
}

function getCanvasPoint(event) {
  const rect = els.frame.getBoundingClientRect();
  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * WIDTH, 0, WIDTH - 1),
    y: clamp(((event.clientY - rect.top) / rect.height) * HEIGHT, 0, HEIGHT - 1)
  };
}

function mirrorPoint(point) {
  return {
    x: WIDTH - 1 - point.x,
    y: point.y
  };
}

function drawDot(point) {
  const ctx = drawingCtx;
  ctx.save();
  setupPaint(ctx);
  ctx.beginPath();
  ctx.arc(point.x, point.y, getPaintSize() / 2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawSegment(from, to) {
  const ctx = drawingCtx;
  ctx.save();
  
  if (state.tool === "marker") {
    // Implement a Crayon/Chalk scatter effect for the marker tool
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / 2));
    ctx.fillStyle = state.color;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i <= steps; i++) {
      const x = from.x + (to.x - from.x) * (i / steps);
      const y = from.y + (to.y - from.y) * (i / steps);
      const density = Math.max(1, Math.floor(state.brushSize / 4));
      for (let j = 0; j < density; j++) {
        const rx = x + (Math.random() - 0.5) * state.brushSize;
        const ry = y + (Math.random() - 0.5) * state.brushSize;
        ctx.beginPath();
        ctx.arc(rx, ry, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    setupPaint(ctx);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  
  ctx.restore();
}

function setupPaint(ctx) {
  const erasing = state.tool === "eraser";
  const isNeon = state.tool === "neon";
  const isMarker = state.tool === "marker";
  const color = state.tool === "rainbow" ? nextRainbowColor() : state.color;
  
  if (isMarker) {
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.6;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
  }
  
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = getPaintSize();
  ctx.strokeStyle = erasing ? PAPER : color;
  ctx.fillStyle = erasing ? PAPER : color;

  if (isNeon) {
    ctx.shadowBlur = ctx.lineWidth * 1.5;
    ctx.shadowColor = color;
  } else {
    ctx.shadowBlur = 0;
  }
}

function getPaintSize() {
  return state.tool === "eraser" ? state.brushSize * 1.45 : state.brushSize;
}

function nextRainbowColor() {
  state.rainbowHue = (state.rainbowHue + 7) % 360;
  return `hsl(${state.rainbowHue} 92% 56%)`;
}

function placeStamp(point) {
  const size = clamp(state.brushSize * 5, 72, 240);
  drawStamp(drawingCtx, state.stampId, point.x, point.y, size, state.color);
  if (state.mirror) {
    drawStamp(drawingCtx, state.stampId, WIDTH - 1 - point.x, point.y, size, state.color);
  }
}

function drawStamp(ctx, stampId, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = OUTLINE;
  ctx.fillStyle = color;

  if (stampId === "star") {
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = -Math.PI / 2 + (i / 10) * TAU;
      const r = i % 2 === 0 ? 43 : 19;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  if (stampId === "heart") {
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.bezierCurveTo(-52, 5, -42, -38, -7, -22);
    ctx.bezierCurveTo(0, -36, 42, -38, 42, 0);
    ctx.bezierCurveTo(42, 19, 24, 31, 0, 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  if (stampId === "flower") {
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * TAU;
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle) * 25, Math.sin(angle) * 25, 16, 28, angle, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#ffca3a";
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  if (stampId === "smile") {
    ctx.fillStyle = "#ffca3a";
    ctx.beginPath();
    ctx.arc(0, 0, 43, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(-16, -10, 5, 0, TAU);
    ctx.arc(16, -10, 5, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 4, 20, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  if (stampId === "cloud") {
    ctx.fillStyle = color === "#ffffff" ? "#dff4ff" : color;
    ctx.beginPath();
    ctx.arc(-26, 10, 23, Math.PI, TAU);
    ctx.arc(0, -8, 32, Math.PI, TAU);
    ctx.arc(30, 8, 25, Math.PI, TAU);
    ctx.lineTo(56, 32);
    ctx.lineTo(-52, 32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  if (stampId === "bolt") {
    ctx.fillStyle = color === "#ffffff" ? "#ffca3a" : color;
    ctx.beginPath();
    ctx.moveTo(-4, -45);
    ctx.lineTo(-36, 8);
    ctx.lineTo(-8, 8);
    ctx.lineTo(-18, 45);
    ctx.lineTo(36, -16);
    ctx.lineTo(8, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function floodFill(startX, startY, color) {
  const x = Math.floor(startX);
  const y = Math.floor(startY);
  const fill = hexToRgb(color);
  if (!fill) {
    return;
  }

  const paint = drawingCtx.getImageData(0, 0, WIDTH, HEIGHT);
  const outline = outlineCtx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = paint.data;
  const lines = outline.data;
  const startIndex = pixelIndex(x, y);

  if (isOutlinePixel(lines, startIndex)) {
    return;
  }

  const target = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3]
  ];

  if (colorDistance(target, [fill.r, fill.g, fill.b, 255]) < 12) {
    return;
  }

  const tolerance = 38;
  const stack = [[x, y]];

  const canFill = (px, py) => {
    if (px < 0 || py < 0 || px >= WIDTH || py >= HEIGHT) {
      return false;
    }
    const index = pixelIndex(px, py);
    if (isOutlinePixel(lines, index)) {
      return false;
    }
    return colorDistance(
      [data[index], data[index + 1], data[index + 2], data[index + 3]],
      target
    ) <= tolerance;
  };

  while (stack.length) {
    const point = stack.pop();
    let px = point[0];
    const py = point[1];

    while (px >= 0 && canFill(px, py)) {
      px -= 1;
    }
    px += 1;

    let spanUp = false;
    let spanDown = false;

    while (px < WIDTH && canFill(px, py)) {
      const index = pixelIndex(px, py);
      data[index] = fill.r;
      data[index + 1] = fill.g;
      data[index + 2] = fill.b;
      data[index + 3] = 255;

      if (py > 0) {
        if (canFill(px, py - 1)) {
          if (!spanUp) {
            stack.push([px, py - 1]);
            spanUp = true;
          }
        } else {
          spanUp = false;
        }
      }

      if (py < HEIGHT - 1) {
        if (canFill(px, py + 1)) {
          if (!spanDown) {
            stack.push([px, py + 1]);
            spanDown = true;
          }
        } else {
          spanDown = false;
        }
      }

      px += 1;
    }
  }

  drawingCtx.putImageData(paint, 0, 0);
}

function pixelIndex(x, y) {
  return (y * WIDTH + x) * 4;
}

function isOutlinePixel(data, index) {
  return data[index + 3] > 48 && data[index] < 120 && data[index + 1] < 120 && data[index + 2] < 120;
}

function colorDistance(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) + Math.abs(a[3] - b[3]) * 0.25;
}

function hexToRgb(hex) {
  const normalized = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function saveHistory() {
  if (state.restoring) {
    return;
  }
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  state.history.push(drawingCtx.getImageData(0, 0, WIDTH, HEIGHT));
  if (state.history.length > HISTORY_LIMIT) {
    state.history.shift();
  }
  state.historyIndex = state.history.length - 1;
  updateHistoryButtons();
  persistDrawing();
}

function resetHistory() {
  state.history = [];
  state.historyIndex = -1;
  saveHistory();
}

function undo() {
  if (state.historyIndex <= 0) {
    return;
  }
  state.historyIndex -= 1;
  restoreHistory();
}

function redo() {
  if (state.historyIndex >= state.history.length - 1) {
    return;
  }
  state.historyIndex += 1;
  restoreHistory();
}

function restoreHistory() {
  state.restoring = true;
  drawingCtx.putImageData(state.history[state.historyIndex], 0, 0);
  state.restoring = false;
  updateHistoryButtons();
  persistDrawing();
}

function persistDrawing() {
  try {
    localStorage.setItem("freeDraw.page", state.pageId);
    localStorage.setItem("freeDraw.image", els.drawingCanvas.toDataURL("image/png"));
  } catch {
    // Storage can be unavailable in some embedded web views.
  }
}

function savePicture() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = WIDTH;
  exportCanvas.height = HEIGHT;
  const exportCtx = exportCanvas.getContext("2d");
  exportCtx.fillStyle = PAPER;
  exportCtx.fillRect(0, 0, WIDTH, HEIGHT);
  exportCtx.drawImage(els.drawingCanvas, 0, 0);
  exportCtx.drawImage(els.outlineCanvas, 0, 0);

  const filename = `free-draw-${new Date().toISOString().slice(0, 10)}.png`;
  exportCanvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function fitCanvasFrame() {
  const stageRect = els.stage.getBoundingClientRect();
  const availableWidth = Math.max(stageRect.width - 16, 180);
  const availableHeight = Math.max(stageRect.height - 16, 140);
  const ratio = HEIGHT / WIDTH;
  let width = Math.min(availableWidth, 1660);
  let height = width * ratio;
  if (height > availableHeight) {
    height = availableHeight;
    width = height / ratio;
  }
  els.frame.style.width = `${Math.floor(width)}px`;
  els.frame.style.height = `${Math.floor(height)}px`;
}

function updateActiveTool() {
  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === state.tool);
  });
}

function updateActivePage() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.page === state.pageId);
  });
}

function updateActivePageFilter() {
  document.querySelectorAll("[data-category]").forEach((button) => {
    const active = button.dataset.category === state.pageFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateActiveStamp() {
  document.querySelectorAll("[data-stamp]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.stamp === state.stampId);
  });
}

function updateColorButtons() {
  document.querySelectorAll(".swatch-button").forEach((button) => {
    button.classList.toggle("is-active", button.style.getPropertyValue("--swatch").trim() === state.color);
  });
}

function updateHistoryButtons() {
  els.undoButton.disabled = state.historyIndex <= 0;
  els.redoButton.disabled = state.historyIndex >= state.history.length - 1;
}

function updateBrushPreview() {
  els.brushPreview.style.setProperty("--preview-size", `${state.brushSize}px`);
  els.brushPreview.style.setProperty("--preview-color", state.tool === "eraser" ? PAPER : state.color);
  updateColorButtons();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

init();
