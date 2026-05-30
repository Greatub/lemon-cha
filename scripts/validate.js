const { existsSync, readFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const syntaxOnly = process.argv.includes("--syntax-only");
const target = parseTarget(process.argv);

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

  fail(`unsupported validation target: ${value}`);
  return "all";
}

function createManifestForTarget(baseManifest, browserTarget) {
  const manifest = structuredClone(baseManifest);

  if (browserTarget === "firefox") {
    manifest.background = {
      scripts: [baseManifest.background?.service_worker].filter(Boolean)
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

function validateManifest(browserTarget) {
  const baseManifest = readJson("manifest.json");
  if (!baseManifest) return;

  const manifest = createManifestForTarget(baseManifest, browserTarget);
  if (!manifest) return;

  if (manifest.manifest_version !== 3) {
    fail(`${browserTarget} manifest must use manifest_version 3`);
  }

  if (!manifest.name || !manifest.version) {
    fail(`${browserTarget} manifest must include name and version`);
  }

  if (browserTarget === "chrome") {
    const background = manifest.background?.service_worker;
    if (!background) {
      fail("chrome manifest must define background.service_worker");
    } else {
      checkFileExists(background);
    }
  }

  if (browserTarget === "firefox") {
    const backgroundScripts = manifest.background?.scripts || [];
    if (!backgroundScripts.length) {
      fail("firefox manifest must define background.scripts");
    }
    if (manifest.background?.service_worker) {
      fail("firefox manifest must not define background.service_worker");
    }
    for (const background of backgroundScripts) {
      checkFileExists(background);
    }
    if (!manifest.browser_specific_settings?.gecko?.id) {
      fail("firefox manifest must define browser_specific_settings.gecko.id");
    }
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

function validateCssInteractionStates() {
  const css = readFileSync(path.join(root, "styles.css"), "utf8");
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
  let match;

  while ((match = rulePattern.exec(css)) !== null) {
    const selector = match[1].trim();
    const declarations = match[2];
    if (selector.includes(":hover") && /\bbox-shadow\s*:/.test(declarations)) {
      fail(`hover styles must not use box-shadow; use background/border changes instead: ${selector}`);
    }

    const isContextualCustomSelect = /(?:^|[\s,])(?:\.settings|\.composer-actions)\s+\.custom-select/.test(selector);
    const isCustomSelectState = /(?::hover|:focus-visible|\.open|\[aria-selected=)/.test(selector);
    if (isContextualCustomSelect && isCustomSelectState) {
      fail(`custom select interaction states must be defined globally, not per area: ${selector}`);
    }

    const isContextualSettingsState = /(?:^|[\s,])\.settings\s+\.(?:settings-tab|secondary|danger|settings-actions\b[^,{]*)/.test(selector)
      && /(?::hover|:focus-visible|\.active)/.test(selector);
    if (isContextualSettingsState) {
      fail(`settings component interaction states must use the shared component rules: ${selector}`);
    }
  }
}

for (const file of requiredExtensionFiles) {
  checkFileExists(file);
}

for (const file of runtimeFiles) {
  checkJavaScriptSyntax(file);
}

if (!syntaxOnly) {
  const targets = target === "all" ? ["chrome", "firefox"] : [target];
  for (const browserTarget of targets) {
    validateManifest(browserTarget);
  }
  validateHtmlReferences();
  validateCssInteractionStates();
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(syntaxOnly ? "syntax ok" : "validation ok");
