import { mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const dist = resolve(root, "dist");
const artifact = resolve(dist, "unlok-plugin.zip");

if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

if (existsSync(artifact)) {
  rmSync(artifact, { force: true });
}

const include = [
  ".claude-plugin",
  ".mcp.json",
  "capabilities",
  "skills",
  "agents",
  "README.md"
];

const zip = spawnSync("zip", ["-r", artifact, ...include], {
  cwd: root,
  stdio: "inherit"
});

if (zip.status !== 0) {
  console.error("Build failed: zip command returned non-zero exit code");
  process.exit(zip.status || 1);
}

console.log(`Created ${artifact}`);
