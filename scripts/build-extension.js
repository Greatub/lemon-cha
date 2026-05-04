const { cpSync, mkdirSync, rmSync, statSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist", "llmon-cha");

const entries = [
  "manifest.json",
  "chat.html",
  "styles.css",
  "background.js",
  "popup.js",
  "src",
  "assets"
];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const entry of entries) {
  const from = path.join(root, entry);
  const to = path.join(outDir, entry);
  const stats = statSync(from);
  cpSync(from, to, { recursive: stats.isDirectory() });
}

console.log(`built extension at ${path.relative(root, outDir)}`);
