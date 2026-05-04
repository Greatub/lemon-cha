const { existsSync, readFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const syntaxOnly = process.argv.includes("--syntax-only");

const runtimeFiles = [
  "background.js",
  "popup.js",
  "local-ollama-proxy.js",
  "src/components/AppIcon.js"
];

const requiredExtensionFiles = [
  "manifest.json",
  "chat.html",
  "styles.css",
  "background.js",
  "popup.js",
  "src/components/AppIcon.js",
  "assets/icon-16.png",
  "assets/icon-32.png",
  "assets/icon-48.png",
  "assets/icon-128.png",
  "assets/logo.png"
];

function fail(message) {
  console.error(`validate: ${message}`);
  process.exitCode = 1;
}

function checkFileExists(relativePath) {
  if (!existsSync(path.join(root, relativePath))) {
    fail(`missing required file: ${relativePath}`);
  }
}

function checkJavaScriptSyntax(relativePath) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, relativePath)], {
    cwd: root,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    fail(`syntax check failed: ${relativePath}`);
    if (result.stderr) {
      console.error(result.stderr.trim());
    }
  }
}

function readJson(relativePath) {
  try {
    return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    fail(`invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function validateManifest() {
  const manifest = readJson("manifest.json");
  if (!manifest) return;

  if (manifest.manifest_version !== 3) {
    fail("manifest.json must use manifest_version 3");
  }

  if (!manifest.name || !manifest.version) {
    fail("manifest.json must include name and version");
  }

  const background = manifest.background?.service_worker;
  if (!background) {
    fail("manifest.json must define background.service_worker");
  } else {
    checkFileExists(background);
  }

  for (const iconPath of Object.values(manifest.icons || {})) {
    checkFileExists(iconPath);
  }

  for (const iconPath of Object.values(manifest.action?.default_icon || {})) {
    checkFileExists(iconPath);
  }
}

function validateHtmlReferences() {
  const html = readFileSync(path.join(root, "chat.html"), "utf8");
  const references = [
    ...html.matchAll(/(?:src|href)="([^"]+)"/g)
  ].map((match) => match[1]).filter((value) => !value.startsWith("http") && !value.startsWith("#"));

  for (const reference of references) {
    checkFileExists(reference);
  }
}

for (const file of requiredExtensionFiles) {
  checkFileExists(file);
}

for (const file of runtimeFiles) {
  checkJavaScriptSyntax(file);
}

if (!syntaxOnly) {
  validateManifest();
  validateHtmlReferences();
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(syntaxOnly ? "syntax ok" : "validation ok");
