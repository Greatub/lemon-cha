const { cpSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const target = parseTarget(process.argv);

const entries = [
  "chat.html",
  "styles.css",
  "background.js",
  "popup.js",
  "src",
  "assets"
];

const targets = target === "all" ? ["chrome", "firefox"] : [target];

for (const browserTarget of targets) {
  const outDir = path.join(root, "dist", browserTarget === "chrome" ? "lemon-cha" : "lemon-cha-firefox");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  for (const entry of entries) {
    const from = path.join(root, entry);
    const to = path.join(outDir, entry);
    const stats = statSync(from);
    cpSync(from, to, {
      recursive: stats.isDirectory(),
      filter: (source) => path.basename(source) !== ".DS_Store"
    });
  }

  writeFileSync(
    path.join(outDir, "manifest.json"),
    `${JSON.stringify(createManifest(browserTarget), null, 2)}\n`
  );

  console.log(`built ${browserTarget} extension at ${path.relative(root, outDir)}`);
}

function parseTarget(argv) {
  const targetArg = argv.find((arg) => arg.startsWith("--target"));
  if (!targetArg) {
    return "all";
  }

  const value = targetArg?.includes("=")
    ? targetArg.split("=")[1]
    : argv[argv.indexOf(targetArg) + 1];

  if (!value) {
    return "all";
  }

  if (["all", "chrome", "firefox"].includes(value)) {
    return value;
  }

  throw new Error(`Unsupported build target: ${value}`);
}

function createManifest(browserTarget) {
  const manifest = JSON.parse(readFileSync(path.join(root, "manifest.json"), "utf8"));

  if (browserTarget === "firefox") {
    manifest.background = {
      scripts: [manifest.background.service_worker]
    };
    manifest.browser_specific_settings = {
      ...(manifest.browser_specific_settings || {}),
      gecko: {
        id: "lemon-cha@georgehuang.local",
        strict_min_version: "113.0",
        ...(manifest.browser_specific_settings?.gecko || {})
      }
    };
  }

  return manifest;
}
