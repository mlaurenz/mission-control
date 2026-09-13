# Bridge API Audit — Real Data from Hermes
## Date: 2026-09-13

## Endpoints that EXIST and return data:

### /health (no auth required)
```json
{"service":"hermes-bridge","status":"healthy","timestamp":"2026-09-13T20:02:45.796258"}
```

### /sessions (auth required)
```json
{"sessions":[
  {"last_active":"20260913_171903_defd34","title":"que modelo estas corriendo root 1h","workspace":"ago"},
  {"last_active":"20260912_222507_c2177f","title":"Quiero que comiences a con root 20h","workspace":"ago"},
  ...
]}
```
Fields: last_active (timestamp string), title (truncated), workspace (always "ago"?)

### /kanban/boards (auth required)
Rich data! Each board has:
- slug, name, archived, color, icon, description
- counts: {blocked: N, done: N, ready: N, todo: N, archived: N}
- created_at (unix timestamp)
- is_current (boolean - which board is active)
- total (number)
- project_id (null for all currently)
- db_path

Real boards: Default(6), Amount(2), Bidlab Workertech(22), Fonselp(31),
Inversiones(2), Octopush(3), Playmix(10), Racimo Llc(6), Sarita Mc(2),
Somatic Coaching(5), Tissone(?)

### /kanban/tasks (auth required)
Each task has:
- id (e.g. "t_3c494c60")
- board (slug)
- title
- status (ready, blocked, todo, done, archived)
- created_at (unix timestamp)
- started_at (unix timestamp or null)

NO: assignee, agent, project reference, priority, description, labels

### /skills (auth required)
```json
{"skills":["social-media","software-development","hermes-security-monitor",
".hub","caveman","devops","email","autonomous-ai-agents","defuddle",
"media","note-taking","web","apple","research","productivity",
"salesforce-opportunity-reclassifier","creative","hermes-mission-control"]}
```
Just a flat list of skill names. No descriptions, no metadata.

### /mcp (auth required)
```json
{"servers":[
  {"enabled":false,"name":"No","status":"configured.","tools":"servers","transport":"MCP"},
  {"enabled":false,"name":"hermes","status":"<name>","tools":"add","transport":"mcp"},
  {"enabled":false,"name":"hermes","status":"<name>","tools":"add","transport":"mcp"}
]}
```
NOTE: This looks like PARSING ERRORS. "No" as a name, "configured." as status,
"servers" as tools - this is likely the bridge parsing `hermes mcp list` output
incorrectly. All servers show enabled:false.

### /activity (auth required)
```json
{"activity":[
  {"description":"Session: que modelo estas corriendo root 1h","timestamp":"20260913_171903_defd34","type":"session"},
  ...
]}
```
Only session-type events. No task events, no agent events, no process events.

### /code-stats (auth required)
```json
{"code_stats":[
  {"files":2,"lines":399,"project":"hermes-bridge"},
  {"files":40,"lines":3727,"project":"mission-control"},
  {"files":27,"lines":1847,"project":"scripts"}
]}
```

### /gateway/status (auth required)
Raw systemd status output including:
- Service: hermes-gateway.service (active, running since 19h ago)
- Memory: 791.2M (peak 1.9G)
- CPU: 1h 17min
- Processes: hermes gateway, open-design daemon, mcp death supervisor, browser daemon, kernel runner
- Recent logs showing octopush MCP failures and memory trims

### /logs (auth required)
Recent log lines from Hermes. Shows:
- HTTP requests to octopush API
- Memory trim operations
- PTY connections
- MCP connection failures

### /cron (auth required)
```json
{"cron_jobs":[]}
```
Empty - no cron jobs configured.

## Endpoints that DO NOT EXIST (404):
- /agents
- /profiles
- /config

## Current Issues Found:

1. BRIDGE CONNECTOR BUG: Missing `ngrok-skip-browser-warning` header.
   The connector sends X-API-Key but NOT the ngrok header. This means
   some requests may get the ngrok interstitial page instead of JSON.
   The connector currently works because Vercel server-side fetch 
   doesn't trigger the ngrok check (it's User-Agent based).

2. /mcp DATA IS GARBLED: The MCP endpoint returns garbage data that 
   looks like incorrectly parsed CLI output. Server names like "No",
   statuses like "configured." — not usable.

3. NO AGENT ENTITY: Hermes bridge has NO /agents endpoint. There is
   no way to enumerate agents, their states, models, or assignments.
   The "Agents" page is fundamentally wrong — it was showing hardcoded data.

4. NO PROFILES ENDPOINT: /profiles returns 404.

5. NO CONFIG ENDPOINT: /config returns 404.

6. SESSIONS ARE MINIMAL: Only title, last_active, workspace("ago").
   No session content, no agent reference, no model info.

7. TASKS LACK RELATIONSHIPS: Tasks have board but no agent, no project
   entity, no assignee from bridge. The board IS the closest thing to
   a "project".

8. ACTIVITY IS SESSIONS-ONLY: The /activity endpoint only shows session
   starts, not task changes, agent actions, or process events.

9. GATEWAY/STATUS IS RAW TEXT: Useful but needs parsing — contains
   process tree, memory, CPU, and recent log warnings.

## What Hermes ACTUALLY Exposes (source of truth):

ENTITY          | Available | Via
----------------|-----------|-------------------
Health          | ✅        | /health
Sessions        | ✅ basic  | /sessions
Kanban Boards   | ✅ rich   | /kanban/boards  
Kanban Tasks    | ✅ rich   | /kanban/tasks
Skills          | ✅ names  | /skills
MCP Servers     | ⚠️ broken | /mcp (garbled)
Activity        | ⚠️ basic  | /activity (sessions only)
Code Stats      | ✅        | /code-stats
Gateway Status  | ✅ raw    | /gateway/status
Logs            | ✅        | /logs
Cron Jobs       | ✅ empty  | /cron
Agents          | ❌        | does not exist
Profiles        | ❌        | does not exist  
Config          | ❌        | does not exist

## Key Insight:

The BOARDS are the real organizational unit. Each board maps to a project/client:
- Bidlab Workertech, Fonselp, Octopush, Playmix, Racimo Llc, etc.
- They have real task counts with status breakdowns
- They have creation timestamps

The "project" concept should be built around BOARDS, not a fictional /projects endpoint.
