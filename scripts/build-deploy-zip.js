/**
 * Packages the project into a deploy-ready zip for GoDaddy's Linux Node.js hosting.
 *
 * Built on Windows, PowerShell's Compress-Archive writes backslash path separators
 * in the zip's internal entry names, which Linux unzip tools don't treat as folder
 * separators. archiver always writes forward-slash separators regardless of host OS,
 * which is what actually fixes that.
 */
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.resolve(projectRoot, "..", "karamchari-samachar-deploy.zip");

const INCLUDE_DIRS = ["app", "components", "lib", "public"];
const INCLUDE_FILES = [
  "server.js",
  "package.json",
  "package-lock.json",
  "next.config.js",
  "tailwind.config.js",
  "postcss.config.js",
  "tsconfig.json",
  "schema.sql",
];

const EXCLUDE_DIR_NAMES = new Set(["node_modules", ".next", ".git"]);
const EXCLUDE_FILE_NAMES = new Set([".env.local", ".env"]);

function main() {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`Zip created: ${outputPath}`);
    console.log(`Total bytes: ${archive.pointer()}`);
  });

  archive.on("warning", (err) => {
    throw err;
  });
  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  for (const dir of INCLUDE_DIRS) {
    const abs = path.join(projectRoot, dir);
    if (!fs.existsSync(abs)) {
      console.warn(`Skipping missing directory: ${dir}`);
      continue;
    }
    archive.directory(abs, dir, (entry) => {
      const segments = entry.name.split("/");
      if (segments.some((seg) => EXCLUDE_DIR_NAMES.has(seg))) {
        return false;
      }
      const baseName = segments[segments.length - 1];
      if (EXCLUDE_FILE_NAMES.has(baseName)) {
        return false;
      }
      return entry;
    });
  }

  for (const file of INCLUDE_FILES) {
    const abs = path.join(projectRoot, file);
    if (!fs.existsSync(abs)) {
      console.warn(`Skipping missing file: ${file}`);
      continue;
    }
    archive.file(abs, { name: file });
  }

  archive.finalize();
}

main();
