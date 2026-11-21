import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";

import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import clientTypeRoutes from "./routes/clienttype.routes";
import competenceRoutes from "./routes/competence.routes";
import questionRoutes from "./routes/question.routes";
import eligibilityRoutes from "./routes/eligibility.routes";
import evaluationRoutes from "./routes/evaluation.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import reportRoutes from "./routes/report.routes";
import aiRoutes from "./routes/ai.routes";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/client-types", clientTypeRoutes);
app.use("/api/competences", competenceRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);
export default app;
