import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import fs from "node:fs";

const [, , inputPath, outputPath, brightnessArg] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node cutout.mjs <input.jpeg> <output.png> [brightnessMin]");
  process.exit(1);
}

const BRIGHTNESS_MIN = brightnessArg ? Number(brightnessArg) : 200;
const SATURATION_MAX = 18;
const TRIM_PADDING = 6;

const buf = fs.readFileSync(inputPath);
const img = jpeg.decode(buf, { useTArray: true });
const { width, height, data } = img;

function isBackgroundColor(i) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  return min > BRIGHTNESS_MIN && max - min < SATURATION_MAX;
}

const visited = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
let queueEnd = 0;

function tryEnqueue(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return;
  }
  const idx = y * width + x;
  if (visited[idx]) {
    return;
  }
  const i = idx * 4;
  if (!isBackgroundColor(i)) {
    return;
  }
  visited[idx] = 1;
  queue[queueEnd++] = idx;
}

for (let x = 0; x < width; x++) {
  tryEnqueue(x, 0);
  tryEnqueue(x, height - 1);
}
for (let y = 0; y < height; y++) {
  tryEnqueue(0, y);
  tryEnqueue(width - 1, y);
}

let queueStart = 0;
while (queueStart < queueEnd) {
  const idx = queue[queueStart++];
  const x = idx % width;
  const y = Math.floor(idx / width);
  tryEnqueue(x + 1, y);
  tryEnqueue(x - 1, y);
  tryEnqueue(x, y + 1);
  tryEnqueue(x, y - 1);
}

const out = new Uint8Array(width * height * 4);
let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    const i = idx * 4;
    const isBg = visited[idx] === 1;
    out[i] = data[i];
    out[i + 1] = data[i + 1];
    out[i + 2] = data[i + 2];
    out[i + 3] = isBg ? 0 : 255;
    if (!isBg) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

minX = Math.max(0, minX - TRIM_PADDING);
minY = Math.max(0, minY - TRIM_PADDING);
maxX = Math.min(width - 1, maxX + TRIM_PADDING);
maxY = Math.min(height - 1, maxY + TRIM_PADDING);

const trimmedWidth = maxX - minX + 1;
const trimmedHeight = maxY - minY + 1;

const png = new PNG({ width: trimmedWidth, height: trimmedHeight });
for (let y = 0; y < trimmedHeight; y++) {
  for (let x = 0; x < trimmedWidth; x++) {
    const srcIdx = ((y + minY) * width + (x + minX)) * 4;
    const dstIdx = (y * trimmedWidth + x) * 4;
    png.data[dstIdx] = out[srcIdx];
    png.data[dstIdx + 1] = out[srcIdx + 1];
    png.data[dstIdx + 2] = out[srcIdx + 2];
    png.data[dstIdx + 3] = out[srcIdx + 3];
  }
}

fs.mkdirSync(outputPath.substring(0, outputPath.lastIndexOf("/")), { recursive: true });
png.pack().pipe(fs.createWriteStream(outputPath)).on("finish", () => {
  console.log(`${outputPath}: ${trimmedWidth}x${trimmedHeight} (from ${width}x${height})`);
});
