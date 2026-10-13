const express = require("express");
const WotmedTelemetry = require("./core-engine/telemetry");

const app = express();
const telemetry = new WotmedTelemetry();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "32kb" }));

app.post("/api/v1/telemetry/ingest", async (req, res) => {
	const token = process.env.WOTMED_TELEMETRY_TOKEN;

	if (!token) {
		return res.status(503).json({
			status: "error",
			message: "Telemetry receiver token is not configured",
		});
	}

	if (req.get("authorization") !== `Bearer ${token}`) {
		return res.status(401).json({
			status: "error",
			message: "Unauthorized",
		});
	}

	const event = req.body;
	const metadata = event?.violation_metadata;

	if (
		!event ||
		typeof event.source_service !== "string" ||
		typeof event.rule_id !== "string" ||
		typeof event.client_ip !== "string" ||
		typeof event.request_path !== "string" ||
		typeof event.http_method !== "string"
	) {
		return res.status(400).json({
			status: "error",
			message: "Invalid telemetry event",
		});
	}

	try {
		await telemetry.emit({
			requestContext: {
				clientIp: event.client_ip,
				userAgent: metadata?.user_agent || "unknown",
				path: event.request_path,
				method: event.http_method,
				tlsFingerprint: "STUDENT_MANAGEMENT_DECEPTION",
			},
			evaluationResult: {
				threatScore: event.threat_level === "HIGH" ? 90 : 50,
				actionTaken: "DECEPTION_EVENT_RECORDED",
				triggeredFlags: [event.rule_id],
				timestamp: metadata?.timestamp || new Date().toISOString(),
			},
		});

		console.log(
			`[Telemetry Receiver] Accepted ${event.rule_id} from ${event.source_service}`,
		);

		return res.status(202).json({
			status: "accepted",
			event_type: metadata?.event_type || event.rule_id,
		});
	} catch (error) {
		console.error("[Telemetry Receiver] Error:", error.message);

		return res.status(500).json({
			status: "error",
			message: "Telemetry processing failed",
		});
	}
});

app.listen(PORT, () => {
	console.log(`Wotmed telemetry receiver listening on port ${PORT}`);
});
