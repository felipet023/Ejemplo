import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/db";
import * as eligibility from "./services/eligibility.service";

async function main() {
  await eligibility.ensureDefaults();
  app.listen(env.port, () => {
    console.log(`CRM Assessment backend running on port ${env.port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

process.on("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
