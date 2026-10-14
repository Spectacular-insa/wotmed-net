import express from "express";
import cors from "cors";
import { db } from "./config/db.js";
import { ingestTelemetry } from "./controllers/telemetry.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/v1/telemetry", ingestTelemetry);

app.get("/api/v1/telemetry/logs", (req, res) => {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 200);
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);

  try {
    const logs = db
      .prepare(`
    SELECT id, source_service, rule_id, threat_level,
             client_ip, request_path, http_method,
             heuristic_score, violation_metadata, created_at
    FROM telemetry_events
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
      `)
      .all(limit, offset)
      .map((log) => ({
    ...log,
    violation_metadata: JSON.parse(log.violation_metadata || "{}"),
      }));

    const { total } = db.prepare("SELECT COUNT(*) AS total FROM telemetry_events").get();

    res.json({ logs, total, limit, offset });
  } catch (error) {
    console.error("Failed to retrieve telemetry logs:", error);
    res.status(500).json({
      error: "Failed to retrieve telemetry logs",
    });
  }
});