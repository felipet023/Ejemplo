import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  databaseUrl: process.env.DATABASE_URL!,
  ai: {
    provider: (process.env.AI_PROVIDER || "none") as "openai" | "gemini" | "none",
    openaiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
    geminiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 30000),
    maxRetries: Number(process.env.AI_MAX_RETRIES || 2),
  },
};
