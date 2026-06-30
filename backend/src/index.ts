import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Scaffold only — feature routes are not implemented yet.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "tablesite-backend" });
});

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TableSite API listening on http://localhost:${PORT}`);
});
