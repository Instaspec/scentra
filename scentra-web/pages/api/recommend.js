import fs from "fs";
import path from "path";

// Helper function to load oils
export async function loadOils() {
  const oils = [];
  const detailsDir = path.join(
    process.cwd(),
    "..",
    "..",
    "data",
    "oils",
    "details"
  );

  try {
    const files = await fs.promises.readdir(detailsDir);

    for (const filename of files) {
      if (filename.endsWith(".json")) {
        const filePath = path.join(detailsDir, filename);
        try {
          const fileContent = await fs.promises.readFile(filePath, "utf-8");
          const oilData = JSON.parse(fileContent);
          oils.push(oilData);
        } catch (error) {
          console.error(`Error loading ${filename}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }

  return oils;
}

// Function to find matching oils
async function findMatchingOils(customerDescription, oils) {
  const prompt = `Given this customer's fragrance description:
"${customerDescription}"

And this list of essential oils with their scent profiles:
${JSON.stringify(
  oils.map((oil) => ({
    name: oil.essential_oil_name || "Unknown",
    popularity: oil.popularity?.popularity_score || -1,
    oil_id: oil.essential_oil_id || "Unknown",
    scent_analysis: oil.scent_analysis || {},
  })),
  null,
  2
)}

Please analyze which essential oils would best match the customer's desired fragrance. Consider:
1. Primary and secondary scent notes
2. Intensity levels
3. Blending potential
4. Popularity

Provide your analysis in this JSON format:
{
  "recommended_oils": [
    {
      "name": "Oil name",
      "oil_id": "Oil ID",
      "match_score": "Score from 1-10",
      "reasoning": "Why this oil matches",
      "blending_suggestions": ["How to blend with other recommended oils"]
    }
  ],
  "blending_notes": "General notes about blending these oils together",
  "alternative_suggestions": ["Alternative oils if the primary recommendations aren't available"]
}

Focus on creating a harmonious blend that matches the customer's description.`;

  try {
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert in essential oils and fragrance blending. Your task is to match customer fragrance descriptions with appropriate essential oils and suggest blending combinations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response from OpenAI API");
    }

    const data = await response.json();
    return JSON.parse(data.content);
  } catch (error) {
    console.error("Error finding matching oils:", error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { customerDescription } = req.body;
    // Take reference receipe and update prompt

    if (!customerDescription) {
      return res
        .status(400)
        .json({ message: "Customer description is required" });
    }

    // Load oils
    const oils = await loadOils();
    if (!oils.length) {
      return res.status(404).json({ message: "No essential oil data found" });
    }

    // Find matching oils
    const recommendations = await findMatchingOils(customerDescription, oils);

    if (!recommendations) {
      return res
        .status(500)
        .json({ message: "Failed to generate recommendations" });
    }

    // Save recommendations
    const outputFile = path.join(
      process.cwd(),
      "results",
      "recommendations.json"
    );
    await fs.promises.writeFile(
      outputFile,
      JSON.stringify(
        {
          customer_description: customerDescription,
          recommendations,
        },
        null,
        2
      ),
      "utf-8"
    );

    return res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error in recommend API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
