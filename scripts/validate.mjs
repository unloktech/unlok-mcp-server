import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const pluginPath = resolve(root, ".claude-plugin/plugin.json");

function fail(message) {
  console.error(`VALIDATION ERROR: ${message}`);
  process.exit(1);
}

if (!existsSync(pluginPath)) {
  fail(".claude-plugin/plugin.json is missing");
}

const plugin = JSON.parse(readFileSync(pluginPath, "utf8"));

// Validate skills directory structure (nested {name}/SKILL.md)
const skillsDir = resolve(root, "skills");
if (existsSync(skillsDir)) {
  const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter(f => f.isDirectory())
    .map(f => f.name);
  
  for (const skillName of skillDirs) {
    const skillFile = resolve(skillsDir, skillName, "SKILL.md");
    if (!existsSync(skillFile)) {
      fail(`skills/${skillName}/SKILL.md not found`);
    }
  }
  console.log(`✓ Found ${skillDirs.length} skills: ${skillDirs.join(", ")}`);
}

// Validate agents configuration from plugin.json
if (Array.isArray(plugin.agents)) {
  for (const agentPath of plugin.agents) {
    const normalized = String(agentPath).replace(/^\.\//, "");
    const fullPath = resolve(root, normalized);
    if (!existsSync(fullPath)) {
      fail(`agents file not found: ${agentPath}`);
    }
  }
  console.log(`✓ Found ${plugin.agents.length} configured agents`);
} else if (typeof plugin.agents === "string") {
  const normalizedAgentsDir = plugin.agents.replace(/^\.\//, "");
  const agentsDir = resolve(root, normalizedAgentsDir);
  if (!existsSync(agentsDir)) {
    fail(`agents directory not found: ${plugin.agents}`);
  }

  const agentEntries = readdirSync(agentsDir, { withFileTypes: true })
    .filter(f => f.isDirectory())
    .map(f => f.name);

  for (const agentName of agentEntries) {
    const agentFile = resolve(agentsDir, agentName, "SKILL.md");
    if (!existsSync(agentFile)) {
      fail(`agents/${agentName}/SKILL.md not found`);
    }
  }
  console.log(`✓ Found ${agentEntries.length} agents: ${agentEntries.join(", ")}`);
}

console.log("\nValidation passed ✓");
