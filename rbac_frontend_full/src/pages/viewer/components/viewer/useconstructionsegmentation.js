/**
 * useConstructionSegmentation.js
 *
 * Pure client-side semantic segmentation tuned for construction-site images.
 *
 * Classes (with fixed semantic colors matching common seg palettes):
 *   sky          – light blue    [135,206,235]
 *   ground       – mud brown     [101, 67, 33]
 *   concrete     – medium gray   [169,169,169]
 *   structure    – slate blue    [ 70,100,160]
 *   scaffolding  – orange        [220,120, 30]
 *   rebar        – dark rust     [160, 60, 20]
 *   equipment    – yellow        [230,190,  0]
 *   worker       – red           [210, 40, 40]
 *   unknown      – dark purple   [ 50, 30, 70]
 *
 * Pipeline:
 *  1. Downsample image to ≤640px
 *  2. Compute per-pixel features: HSL, Lab, local gradient magnitude,
 *     local texture energy, edge density
 *  3. Score every pixel against each class using a weighted rule set
 *  4. Assign the highest-scoring class
 *  5. Majority-filter smoothing (7×7) to remove noise
 *  6. Render blended overlay + white class boundaries
 */

// ── Class definitions ─────────────────────────────────────────────────────
export const CONSTRUCTION_CLASSES = {
  sky: { id: 0, label: "Sky", color: [135, 206, 235], emoji: "🌤" },
  ground: {
    id: 1,
    label: "Ground / Soil / Mud",
    color: [101, 67, 33],
    emoji: "🟫",
  },
  concrete: {
    id: 2,
    label: "Concrete / Cement",
    color: [169, 169, 169],
    emoji: "🪨",
  },
  structure: {
    id: 3,
    label: "Structure / Walls",
    color: [70, 100, 160],
    emoji: "🏗",
  },
  scaffolding: {
    id: 4,
    label: "Scaffolding / Steel",
    color: [220, 120, 30],
    emoji: "🔩",
  },
  rebar: {
    id: 5,
    label: "Rebar / Metal Rods",
    color: [160, 60, 20],
    emoji: "📏",
  },
  equipment: {
    id: 6,
    label: "Equipment / Crane",
    color: [230, 190, 0],
    emoji: "🚧",
  },
  worker: {
    id: 7,
    label: "Worker / Person",
    color: [210, 40, 40],
    emoji: "👷",
  },
  unknown: { id: 8, label: "Unknown", color: [50, 30, 70], emoji: "❓" },
};

const CLASS_LIST = Object.values(CONSTRUCTION_CLASSES);
const NUM_CLASSES = CLASS_LIST.length;

// ── RGB → HSL ─────────────────────────────────────────────────────────────
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

// ── RGB → Lab ─────────────────────────────────────────────────────────────
function rgbToLab(r, g, b) {
  let rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;
  let X = rn * 0.4124 + gn * 0.3576 + bn * 0.1805;
  let Y = rn * 0.2126 + gn * 0.7152 + bn * 0.0722;
  let Z = rn * 0.0193 + gn * 0.1192 + bn * 0.9505;
  X /= 0.95047;
  Z /= 1.08883;
  const f = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// ── Compute gradient magnitude map (Sobel) ────────────────────────────────
function computeGradients(gray, width, height) {
  const grad = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx =
        -gray[i - width - 1] +
        gray[i - width + 1] -
        2 * gray[i - 1] +
        2 * gray[i + 1] -
        gray[i + width - 1] +
        gray[i + width + 1];
      const gy =
        -gray[i - width - 1] -
        2 * gray[i - width] -
        gray[i - width + 1] +
        gray[i + width - 1] +
        2 * gray[i + width] +
        gray[i + width + 1];
      grad[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return grad;
}

// ── Local texture energy: variance in a 5×5 patch ────────────────────────
function computeTextureEnergy(gray, width, height, radius = 2) {
  const energy = new Float32Array(width * height);
  const n = (2 * radius + 1) * (2 * radius + 1);
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let sum = 0,
        sum2 = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const v = gray[(y + dy) * width + (x + dx)];
          sum += v;
          sum2 += v * v;
        }
      }
      const mean = sum / n;
      energy[y * width + x] = sum2 / n - mean * mean; // variance
    }
  }
  return energy;
}

// ── Score a pixel against each construction class ─────────────────────────
// Returns Float32Array of length NUM_CLASSES (higher = more likely)
function scorePixel(h, s, l, La, Lb, grad, tex, normY, normX) {
  const scores = new Float32Array(NUM_CLASSES);

  // ── helpers ──────────────────────────────────────────────────────────
  const isAchromatic = s < 0.1;
  const isWarm = (h >= 0 && h <= 60) || h >= 300;
  const isCool = h > 160 && h < 280;
  const highGrad = grad > 18;
  const lowGrad = grad < 6;
  const richTex = tex > 120;
  const smoothTex = tex < 40;

  // ── 0  SKY ────────────────────────────────────────────────────────────
  // Upper zone, bright, blue or light grey, smooth
  {
    let sc = 0;
    if (normY < 0.3) sc += 3.5;
    else if (normY < 0.45) sc += 1.0;
    if (l > 0.55) sc += 2.0;
    if (l > 0.75) sc += 1.5;
    if (isCool && s > 0.1) sc += 2.5;
    if (isAchromatic && l > 0.65) sc += 1.5;
    if (smoothTex) sc += 1.0;
    if (lowGrad) sc += 0.8;
    if (normY > 0.55) sc -= 4.0; // penalise lower half hard
    scores[0] = Math.max(0, sc);
  }

  // ── 1  GROUND / SOIL / MUD ───────────────────────────────────────────
  // Lower zone, brownish / dark, earthy hues
  {
    let sc = 0;
    if (normY > 0.7) sc += 3.5;
    else if (normY > 0.55) sc += 1.5;
    // earthy: warm hue, low-mid sat, low-mid lum
    if (h > 15 && h < 55 && s > 0.05 && s < 0.55 && l < 0.55) sc += 3.0;
    if (h > 5 && h < 40 && l < 0.35) sc += 2.0; // dark brown
    if (La > 5 && Lb > 5 && l < 0.5) sc += 1.5; // warm Lab
    if (richTex) sc += 0.8; // rough ground texture
    if (normY < 0.4) sc -= 3.0;
    scores[1] = Math.max(0, sc);
  }

  // ── 2  CONCRETE / CEMENT ─────────────────────────────────────────────
  // Mid-gray, achromatic or slightly warm-gray, any zone, smooth-moderate tex
  {
    let sc = 0;
    if (isAchromatic && l > 0.3 && l < 0.78) sc += 4.0;
    if (s < 0.15 && l > 0.35 && l < 0.72) sc += 2.5;
    // warm-gray (slightly yellowish gray typical of concrete)
    if (h > 30 && h < 80 && s < 0.2 && l > 0.35 && l < 0.7) sc += 2.0;
    if (smoothTex || tex < 80) sc += 0.8;
    if (lowGrad) sc += 0.5;
    // penalise very bright (likely sky) or very dark
    if (l > 0.82 || l < 0.22) sc -= 2.5;
    scores[2] = Math.max(0, sc);
  }

  // ── 3  STRUCTURE / WALLS / COLUMNS ───────────────────────────────────
  // Vertical mid-region, cool-grey or warm-grey, large flat areas
  {
    let sc = 0;
    if (normY > 0.15 && normY < 0.85) sc += 1.0;
    // brick-like: warm medium tone
    if (h > 10 && h < 40 && s > 0.1 && s < 0.5 && l > 0.25 && l < 0.65)
      sc += 3.0;
    // concrete-block: cool grey
    if (isCool && isAchromatic && l > 0.3 && l < 0.7) sc += 2.0;
    if (s < 0.18 && l > 0.28 && l < 0.65) sc += 1.5;
    if (smoothTex) sc += 0.8;
    if (normY < 0.1 || normY > 0.9) sc -= 2.0;
    scores[3] = Math.max(0, sc);
  }

  // ── 4  SCAFFOLDING / STEEL FRAMEWORK ─────────────────────────────────
  // Thin metallic structures; high gradient edges, orange-brown or silver metal
  {
    let sc = 0;
    // orange/rust scaffolding pipes
    if (h > 18 && h < 45 && s > 0.3 && s < 0.85 && l > 0.25 && l < 0.65)
      sc += 3.5;
    // silver/galvanised metal
    if (isAchromatic && l > 0.4 && l < 0.75 && highGrad) sc += 2.5;
    if (highGrad) sc += 1.5; // scaffolding always has strong edges
    if (richTex) sc += 1.0;
    // scaffolding appears anywhere vertically
    if (normY < 0.05 || normY > 0.92) sc -= 1.5;
    scores[4] = Math.max(0, sc);
  }

  // ── 5  REBAR / METAL RODS ────────────────────────────────────────────
  // Dark rust-brown/red, very high gradient, thin lines
  {
    let sc = 0;
    // rust: red-orange, moderate-high sat, dark-mid lum
    if (h > 5 && h < 35 && s > 0.25 && l > 0.15 && l < 0.5) sc += 4.0;
    if (La > 15 && Lb > 8 && l < 0.45) sc += 2.5; // warm dark Lab
    if (highGrad) sc += 2.0; // always high gradient
    if (richTex) sc += 1.0;
    if (l > 0.6) sc -= 2.0; // rebar is never bright
    scores[5] = Math.max(0, sc);
  }

  // ── 6  EQUIPMENT / MACHINERY / CRANE ─────────────────────────────────
  // Yellow safety colours, large machinery, upper-mid zone (cranes)
  {
    let sc = 0;
    // safety yellow / construction yellow
    if (h > 42 && h < 70 && s > 0.35 && l > 0.35 && l < 0.8) sc += 5.0;
    // bright orange machinery
    if (h > 22 && h < 45 && s > 0.5 && l > 0.35 && l < 0.7) sc += 3.5;
    // white/red heavy machinery
    if (h > 0 && h < 15 && s > 0.45 && l > 0.3 && l < 0.65) sc += 2.0;
    if (highGrad) sc += 0.8;
    scores[6] = Math.max(0, sc);
  }

  // ── 7  WORKER / PERSON ───────────────────────────────────────────────
  // Skin tones, hi-vis vest (yellow-green / orange), helmets (white/yellow)
  {
    let sc = 0;
    // skin tone
    const isSkin =
      ((h >= 0 && h <= 35) || h >= 340) &&
      s > 0.15 &&
      s < 0.75 &&
      l > 0.35 &&
      l < 0.75 &&
      La > 8 &&
      Lb > 5;
    if (isSkin) sc += 4.5;
    // hi-vis vest: bright yellow-green
    if (h > 60 && h < 100 && s > 0.55 && l > 0.4 && l < 0.8) sc += 3.0;
    // hi-vis orange vest
    if (h > 22 && h < 42 && s > 0.6 && l > 0.45 && l < 0.75) sc += 2.5;
    // white safety helmet
    if (isAchromatic && l > 0.8 && normY < 0.6) sc += 1.5;
    scores[7] = Math.max(0, sc);
  }

  // ── 8  UNKNOWN (fallback — very low base score) ───────────────────────
  scores[8] = 0.5;

  return scores;
}

// ── Majority-vote smoothing ───────────────────────────────────────────────
function smoothLabels(labels, width, height, radius = 3) {
  const out = new Uint8Array(labels.length);
  const votes = new Int32Array(NUM_CLASSES);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      votes.fill(0);
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = Math.min(height - 1, Math.max(0, y + dy));
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          votes[labels[ny * width + nx]]++;
        }
      }
      let best = 0,
        bestV = 0;
      for (let c = 0; c < NUM_CLASSES; c++) {
        if (votes[c] > bestV) {
          bestV = votes[c];
          best = c;
        }
      }
      out[y * width + x] = best;
    }
  }
  return out;
}

// ── Detect present classes ────────────────────────────────────────────────
function detectPresentClasses(labels) {
  const seen = new Set(labels);
  return CLASS_LIST.filter(
    (c) => seen.has(c.id) && c.id !== CONSTRUCTION_CLASSES.unknown.id,
  );
}

// ── Main segmentation ─────────────────────────────────────────────────────
export function segmentConstructionImage(srcImageData, options = {}) {
  const { alpha = 0.62, smoothRadius = 3 } = options;
  const { width, height, data } = srcImageData;
  const N = width * height;

  // Grayscale for gradient / texture
  const gray = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    gray[i] =
      0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  const gradMap = computeGradients(gray, width, height);
  const texMap = computeTextureEnergy(gray, width, height);

  // Per-pixel classification
  const rawLabels = new Uint8Array(N);
  for (let y = 0; y < height; y++) {
    const normY = y / height;
    for (let x = 0; x < width; x++) {
      const normX = x / width;
      const i = y * width + x;
      const r = data[i * 4],
        g = data[i * 4 + 1],
        b = data[i * 4 + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      const [, La, Lb] = rgbToLab(r, g, b);
      const scores = scorePixel(
        h,
        s,
        l,
        La,
        Lb,
        gradMap[i],
        texMap[i],
        normY,
        normX,
      );
      let best = 0,
        bestS = -1;
      for (let c = 0; c < NUM_CLASSES; c++) {
        if (scores[c] > bestS) {
          bestS = scores[c];
          best = c;
        }
      }
      rawLabels[i] = best;
    }
  }

  // Smoothing
  const labels = smoothLabels(rawLabels, width, height, smoothRadius);

  // Render overlay
  const out = new ImageData(width, height);
  const dst = out.data;
  for (let i = 0; i < N; i++) {
    const [cr, cg, cb] = CLASS_LIST[labels[i]].color;
    const si = i * 4;
    dst[si] = data[si] * (1 - alpha) + cr * alpha;
    dst[si + 1] = data[si + 1] * (1 - alpha) + cg * alpha;
    dst[si + 2] = data[si + 2] * (1 - alpha) + cb * alpha;
    dst[si + 3] = 255;
  }

  // Class boundary lines (white)
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const i = y * width + x;
      if (labels[i] !== labels[i + 1] || labels[i] !== labels[i + width]) {
        dst[i * 4] = 255;
        dst[i * 4 + 1] = 255;
        dst[i * 4 + 2] = 255;
        dst[i * 4 + 3] = 200;
      }
    }
  }

  return {
    segmentedImageData: out,
    presentClasses: detectPresentClasses(labels),
  };
}

// ── Public API: image URL → { dataUrl, presentClasses } ──────────────────
export function segmentImageUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const MAX = 640;
      let w = img.naturalWidth,
        h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        const ratio = MAX / Math.max(w, h);
        w = (w * ratio) | 0;
        h = (h * ratio) | 0;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      // Run off main thread tick to keep UI responsive
      requestAnimationFrame(() => {
        try {
          const imageData = ctx.getImageData(0, 0, w, h);
          const { segmentedImageData, presentClasses } =
            segmentConstructionImage(imageData);
          ctx.putImageData(segmentedImageData, 0, 0);
          resolve({ dataUrl: canvas.toDataURL("image/png"), presentClasses });
        } catch (err) {
          reject(err);
        }
      });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}
