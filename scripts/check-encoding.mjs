import fs from "node:fs";
import path from "node:path";

const DEFAULT_TARGETS = ["messages/en.json", "messages/es.json"];

const SUSPICIOUS_PATTERNS = [
  /Ã[\u0080-\u00BF]/g,
  /Â[\u0080-\u00BF]/g,
  /â[\u0080-\u00BF]/g,
  /\uFFFD/g,
];

function resolveTargets(args) {
  const rawTargets = args.length > 0 ? args : DEFAULT_TARGETS;
  return rawTargets.map((target) => path.resolve(process.cwd(), target));
}

function getLineInfo(source, index) {
  const lines = source.slice(0, index).split("\n");
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

function formatSnippet(source, index) {
  const start = Math.max(0, index - 24);
  const end = Math.min(source.length, index + 24);
  return source.slice(start, end).replace(/\s+/g, " ").trim();
}

function inspectFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const findings = [];

  for (const pattern of SUSPICIOUS_PATTERNS) {
    for (const match of source.matchAll(pattern)) {
      if (match.index == null) continue;
      const { line, column } = getLineInfo(source, match.index);
      findings.push({
        token: match[0],
        line,
        column,
        snippet: formatSnippet(source, match.index),
      });
    }
  }

  return findings;
}

function main() {
  const targets = resolveTargets(process.argv.slice(2));
  const failures = [];

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      failures.push(`Missing file: ${target}`);
      continue;
    }

    const findings = inspectFile(target);
    if (findings.length === 0) continue;

    failures.push(target);
    for (const finding of findings) {
      failures.push(
        `  line ${finding.line}, col ${finding.column}: suspicious token "${finding.token}" in "${finding.snippet}"`,
      );
    }
  }

  if (failures.length > 0) {
    console.error("Potential encoding problems found:");
    for (const failure of failures) {
      console.error(failure);
    }
    process.exit(1);
  }

  console.log(`Encoding check passed for ${targets.length} file(s).`);
}

main();
