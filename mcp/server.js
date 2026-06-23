#!/usr/bin/env node
/**
 * Time Doctor CLI — MCP stdio server
 * --------------------------------------------------------------------------
 * Exposes each Time Doctor CLI command as an MCP tool. Tools are derived at
 * startup from the CLI's own service definition
 * (src/TimeDoctor/config/timedoctor.json) so they stay in sync with the CLI.
 *
 * Each tool invocation shells out to:  php timedoctor <command> [--opt val ...]
 * run from the project root, so it reads the root timedoctor.json (auth token).
 *
 * Environment overrides (optional):
 *   TIMEDOCTOR_DIR  - project root containing the `timedoctor` script
 *                     (default: the parent of this mcp/ folder)
 *   TIMEDOCTOR_PHP  - php binary to use (default: "php")
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Project root: the directory holding the `timedoctor` CLI script.
const PROJECT_DIR = resolve(process.env.TIMEDOCTOR_DIR || resolve(__dirname, ".."));
const PHP_BIN = process.env.TIMEDOCTOR_PHP || "php";
const SERVICE_DEF = resolve(PROJECT_DIR, "src/TimeDoctor/config/timedoctor.json");

/**
 * Read the CLI's service definition and turn each public operation into an MCP
 * tool spec. Operations whose name starts with "_" are internal helpers.
 */
function buildTools() {
  const def = JSON.parse(readFileSync(SERVICE_DEF, "utf8"));
  const operations = def.operations || {};
  const tools = [];

  for (const [name, op] of Object.entries(operations)) {
    if (name.startsWith("_")) continue;

    const properties = {};
    const required = [];
    const params = op.parameters || {};

    for (const [paramName, meta] of Object.entries(params)) {
      // Skip static/internal params the caller shouldn't set.
      if (meta && meta.static) continue;
      properties[paramName] = {
        type: "string",
        description: meta && meta.required ? "(required)" : "",
      };
      if (meta && meta.required) required.push(paramName);
    }

    tools.push({
      name,
      description: op.description || `Time Doctor CLI command: ${name}`,
      inputSchema: {
        type: "object",
        properties,
        required,
        additionalProperties: false,
      },
    });
  }

  return tools;
}

const TOOLS = buildTools();
const TOOL_NAMES = new Set(TOOLS.map((t) => t.name));

/**
 * Run `php timedoctor <command> [--key value ...]` from the project root and
 * resolve with the captured output.
 */
function runCli(command, args) {
  return new Promise((resolvePromise) => {
    const cliArgs = ["timedoctor", command];
    for (const [key, value] of Object.entries(args || {})) {
      if (value === undefined || value === null || value === "") continue;
      cliArgs.push(`--${key}`, String(value));
    }

    const child = spawn(PHP_BIN, cliArgs, { cwd: PROJECT_DIR });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (err) => {
      resolvePromise({
        ok: false,
        text: `Failed to launch "${PHP_BIN}": ${err.message}`,
      });
    });

    child.on("close", (code) => {
      const parts = [];
      if (stdout.trim()) parts.push(stdout.trim());
      if (stderr.trim()) parts.push(`[stderr]\n${stderr.trim()}`);
      if (!parts.length) parts.push(`(no output; exit code ${code})`);
      resolvePromise({ ok: code === 0, text: parts.join("\n\n") });
    });
  });
}

const server = new Server(
  { name: "timedoctor-mcp-stdio-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!TOOL_NAMES.has(name)) {
    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
    };
  }

  const result = await runCli(name, args || {});
  return {
    isError: !result.ok,
    content: [{ type: "text", text: result.text }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr is safe for logging on a stdio server (stdout is the protocol channel).
  console.error(
    `timedoctor-cli MCP server ready — ${TOOLS.length} tools, root: ${PROJECT_DIR}`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});