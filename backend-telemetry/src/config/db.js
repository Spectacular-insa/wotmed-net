import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.resolve(currentDir, "../../telemetry.sqlite");

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS telemetry_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_service TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    threat_level TEXT NOT NULL
      CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    client_ip TEXT NOT NULL,
    request_path TEXT NOT NULL,
    http_method TEXT NOT NULL,
    heuristic_score REAL DEFAULT 0,
    payload_snapshot TEXT,
    violation_metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_telemetry_created_at
    ON telemetry_events (created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_telemetry_threat
    ON telemetry_events (threat_level);
`);
