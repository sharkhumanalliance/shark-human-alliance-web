import fs from "node:fs";
import path from "node:path";

const DEFAULT_TARGETS = ["."];

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".vercel",
  "node_modules",
]);

const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".sql",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
]);

const TEXT_FILENAMES = new Set([
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
  "vercel.json",
]);

function shouldScanFile(filePath) {
  const basename = path.basename(filePath);
  if (TEXT_FILENAMES.has(basename)) return true;
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function collectFiles(targetPath, files) {
  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    const basename = path.basename(targetPath);
    if (IGNORED_DIRECTORIES.has(basename)) return;

    for (const entry of fs.readdirSync(targetPath)) {
      collectFiles(path.join(targetPath, entry), files);
    }
    return;
  }

  if (stat.isFile() && shouldScanFile(targetPath)) {
    files.push(targetPath);
  }
}

function getLineInfo(buffer, index) {
  let line = 1;
  let column = 1;

  for (let i = 0; i < index; i += 1) {
    if (buffer[i] === 10) {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function inspectFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const findings = [];

  for (let index = 0; index < buffer.length; index += 1) {
    if (buffer[index] !== 0) continue;
    findings.push(getLineInfo(buffer, index));
  }

  return findings;
}

function main() {
  const rawTargets = process.argv.slice(2);
  const targets = rawTargets.length > 0 ? rawTargets : DEFAULT_TARGETS;
  const files = [];

  for (const target of targets) {
    const resolved = path.resolve(process.cwd(), target);
    if (!fs.existsSync(resolved)) {
      console.error(`Missing target: ${resolved}`);
      process.exitCode = 1;
      continue;
    }
    collectFiles(resolved, files);
  }

  const failures = [];

  for (const file of files) {
    const findings = inspectFile(file);
    if (findings.length === 0) continue;

    failures.push({ file, findings });
  }

  if (failures.length > 0) {
    console.error("NULL bytes found in source/text files:");
    for (const failure of failures) {
      const relative = path.relative(process.cwd(), failure.file);
      console.error(relative);
      for (const finding of failure.findings.slice(0, 10)) {
        console.error(`  line ${finding.line}, col ${finding.column}`);
      }
      if (failure.findings.length > 10) {
        console.error(`  ... ${failure.findings.length - 10} more`);
      }
    }
    process.exit(1);
  }

  console.log(`NULL-byte check passed for ${files.length} file(s).`);
}

main();
