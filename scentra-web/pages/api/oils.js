import { promises as fs } from "fs";
import path from "path";

async function loadOils() {
  try {
    const oilsDir = path.join(process.cwd(), "data", "oils", "details");
    const files = await fs.readdir(oilsDir);

    const oils = await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith(".json")) return null;

        const filePath = path.join(oilsDir, file);
        const content = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(content);

        return {
          essential_oil_id: data.essential_oil_id,
          essential_oil_name: data.essential_oil_name,
          scent_analysis: {
            primary_notes: data.scent_analysis.primary_notes,
            secondary_notes: data.scent_analysis.secondary_notes,
            intensity: data.scent_analysis.intensity,
          },
          popularity: {
            popularity_score: data.popularity?.popularity_score || -1,
          },
        };
      })
    );

    return oils.filter((oil) => oil !== null);
  } catch (error) {
    console.error("Error loading oils:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const oils = await loadOils();
    return res.status(200).json(oils);
  } catch (error) {
    console.error("Error in oils API:", error);
    return res.status(500).json({ message: "Error loading oils data" });
  }
}
