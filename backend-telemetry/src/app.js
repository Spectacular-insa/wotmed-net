import express from 'express';
import cors from 'cors';
import { ingestTelemetry } from './controllers/telemetry.js';

export const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/v1/telemetry', ingestTelemetry);