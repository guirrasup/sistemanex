import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import app from "./server/index";
import { logger } from "./server/logger";
import { checkDatabaseConnection } from "./server/config/database";

dotenv.config();

// Nota: este arquivo é bundlado para CommonJS (esbuild --format=cjs) no build de produção.
// "import.meta.url" / fileURLToPath não funcionam nesse formato (não existe import.meta em
// CJS), e derrubavam o processo com "ERR_INVALID_ARG_TYPE: path ... Received undefined".
// __filename/__dirname não eram usados no restante do arquivo, então foram removidos.

const PORT = 3000;

async function startServer() {
  // Database Connection Check
  await checkDatabaseConnection();

  // Webhooks
  app.post("/api/webhooks/sefaz", (req, res) => {
    const { event, nfe_key, status } = req.body || {};
    logger.info("SEFAZ Webhook Received", { event, nfe_key, status });
    return res.json({ received: true, processedAt: new Date().toISOString() });
  });

  app.post("/api/webhooks/open-finance", (req, res) => {
    const { bank_code, transaction_id, amount } = req.body || {};
    logger.info("Open Finance Webhook Received", { bank_code, transaction_id, amount });
    return res.json({ status: "ACK", transaction_id });
  });

  // Vite Integration (Development vs Production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`🚀 NEX ERP Enterprise Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
