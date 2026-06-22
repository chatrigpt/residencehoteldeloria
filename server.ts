import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const MENU_FILE_PATH = path.join(process.cwd(), "menu.json");

async function startServer() {
  const app = express();

  // Allow high limits for self-contained business card and image modifications (base64)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API: Get current menu
  app.get("/api/menu", async (req, res) => {
    try {
      const data = await fs.readFile(MENU_FILE_PATH, "utf-8");
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (err) {
      console.error("Error reading menu.json:", err);
      res.status(500).json({ error: "Impossible de charger le menu depuis le serveur." });
    }
  });

  // API: Save menu
  app.post("/api/menu", async (req, res) => {
    try {
      const newMenuData = req.body;
      if (!newMenuData || !Array.isArray(newMenuData.categories)) {
        return res.status(400).json({ error: "Structure de menu JSON invalide." });
      }

      await fs.writeFile(MENU_FILE_PATH, JSON.stringify(newMenuData, null, 2), "utf-8");
      res.json({ success: true, message: "Menu sauvegardé et mis à jour instantanément !" });
    } catch (err) {
      console.error("Error writing menu.json:", err);
      res.status(500).json({ error: "Impossible de sauvegarder les modifications du menu." });
    }
  });

  // API: Health status check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Use Vite middleware in development mode, or serve static dist folder in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Restaurant Deloria running on http://localhost:${PORT}`);
  });
}

startServer();
