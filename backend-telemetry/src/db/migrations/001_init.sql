CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE telemetry_events (
    id UUID DEFAULT uuid_generate_v4(),
    source_service VARCHAR(64) NOT NULL,
    rule_id VARCHAR(64) NOT NULL,
    threat_level VARCHAR(16) NOT NULL CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    client_ip INET NOT NULL,
    request_path TEXT NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    heuristic_score NUMERIC(5,2) DEFAULT 0.00,
    payload_snapshot JSONB,
    violation_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- September 2026 Partition
CREATE TABLE telemetry_events_y2026m09 PARTITION OF telemetry_events
    FOR VALUES FROM ('2026-09-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

-- High-performance query indexes
CREATE INDEX idx_telemetry_created_at ON telemetry_events (created_at DESC);
CREATE INDEX idx_telemetry_threat ON telemetry_events (threat_level) WHERE threat_level IN ('HIGH', 'CRITICAL');