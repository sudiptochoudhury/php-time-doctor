# Time Doctor MCP Server

> Requirements: PHP >= 7.4, Node.js >= 18

An [MCP](https://modelcontextprotocol.io) **stdio** server that exposes the Time
Doctor PHP CLI commands as MCP tools. Tools are generated at startup from the
CLI's own service definition (`src/TimeDoctor/config/timedoctor.json`), so they
stay in sync with the CLI automatically.

Each tool call shells out to:

```
php timedoctor <command> [--opt value ...]
```

run from the project root, so it reads the project's `timedoctor.json` (your
auth token).

## Available tools

The tools mirror the CLI commands defined in the service definition:

| Tool | Description |
|------|-------------|
| `getCompanies`  | Return the user's account(s) / company |
| `getProjects`   | List projects |
| `getUsers`      | List users in a company |
| `getUser`       | Get info about a user |
| `getUserTasks`  | List a user's tasks |
| `getUserTask`   | Get a single task |
| `getWorklogs`   | Return worklogs under a company (time tracked) |

Required parameters per tool are advertised in each tool's input schema (e.g.
`getWorklogs` requires `company_id`, `start_date`, `end_date`).

## Prerequisites

- **Node.js** >= 18
- **PHP** (the same one that runs the `timedoctor` CLI)
- The `timedoctor` CLI must be working and authenticated. Confirm with:
  ```bash
  php timedoctor getCompanies
  ```
  This reads the auth token from `timedoctor.json` in the project root.

## Install

From this `mcp/` directory:

```bash
npm install
```

That's it — there is no build step.

## Configuration

The server takes no arguments. Two optional environment variables override
defaults:

| Variable | Default | Purpose |
|----------|---------|---------|
| `TIMEDOCTOR_DIR` | parent of this `mcp/` folder | Project root containing the `timedoctor` script and `timedoctor.json` auth token |
| `TIMEDOCTOR_PHP` | `/opt/homebrew/bin/php` | PHP binary to use |

> If `php` is on your `PATH` at a different location (e.g. `/usr/bin/php`), set
> `TIMEDOCTOR_PHP` accordingly, or to just `php`.

## Add to Claude Code

### Option A — `claude mcp add` (recommended)

```bash
claude mcp add timedoctor \
  --env TIMEDOCTOR_DIR=/path/to/your/project/timedoctor \
  --env TIMEDOCTOR_PHP=/opt/homebrew/bin/php \
  -- node /path/to/your/project/timedoctor/mcp/server.js
```

Add `--scope project` to write the entry to a shared `.mcp.json` in the repo, or
`--scope user` to make it available across all your projects. The default scope
is `local` (just you, just this project).

### Option B — JSON config entry

Add this under `mcpServers` in your config file
(`~/.claude.json`, or a project-level `.mcp.json`):

```json
{
  "mcpServers": {
    "timedoctor": {
      "command": "node",
      "args": [
        "/path/to/your/project/timedoctor/mcp/server.js"
      ],
      "env": {
        "TIMEDOCTOR_DIR": "/path/to/your/project/timedoctor",
        "TIMEDOCTOR_PHP": "/opt/homebrew/bin/php"
      }
    }
  }
}
```

Then verify the connection from inside Claude Code:

```
/mcp
```

You should see `timedoctor` listed as connected, with the tools above available.

## Add to Claude Desktop

Edit the Claude Desktop config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Use the same `mcpServers` JSON block shown in Option B, then restart Claude
Desktop.

## Other MCP clients

Any MCP client that supports stdio servers works. The launch command is:

```
node //path/to/your/project/timedoctor/mcp/server.js
```

with the optional `TIMEDOCTOR_DIR` / `TIMEDOCTOR_PHP` environment variables.

## Troubleshooting

- **`Failed to launch "..."`** — the PHP binary path is wrong. Set
  `TIMEDOCTOR_PHP` to your `php` location (`which php`).
- **404 / HTML error pages from a tool** — usually a CLI/service-definition
  issue, not the MCP server. Run the equivalent `php timedoctor <command>`
  directly to see the real error.
- **Auth errors** — the token in `timedoctor.json` may be expired. Re-run the
  CLI's auth flow so a fresh token is written to the project root.
- **stderr noise** — the server logs a readiness line to stderr on startup
  (`timedoctor-cli MCP server ready — N tools …`). This is normal; stdout is
  reserved for the MCP protocol.
```