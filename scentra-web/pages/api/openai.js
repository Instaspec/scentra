import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const ContentSchema = z.object({
  description: z.string(),
  instruction: z.string(),
});

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY, // Ensure this environment variable is set
});

const prompt = `
You are an expert perfumer. Given user's current description of product (or none) and all previous conversation, your job is to guide the user, who is not an expert, to arrive at an accurate and standardized description of the aroma they want to create. Be patient, clear, and provide helpful suggestions.  

First, determine the product type (e.g., perfume, shampoo, candle). Then, guide the user to select an olfactive family (Citrus, Floral, Woody, Oriental) and specify Top Notes (initial impression), Middle Notes (heart of the fragrance), and Base Notes (lingering essence) using standardized fragrance terminology.  

Encourage the user to reference well-known scents or products to anchor their description. If their input is vague or subjective, ask clarifying questions and translate their words into precise fragrance terms. If their input is clear, tell them it's clear and guide them press "Send Request" button to submit to the fragrance.

Based on the user’s input, return a structured JSON object with:
- 'description': An improved standardized description of the requested aroma including product type.
- 'instruction': Directions or suggestions for the user to refine their input or clarify any unclear parts.  
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { messages, description } = req.body;

    // Add a system message for structured output
    const systemMessage = {
      role: "system",
      content: prompt,
    };

    const descriptionMessage = {
      role: "user",
      content: description || "No description provided yet.",
    };

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Use a valid model name
      messages: [systemMessage, descriptionMessage, ...messages],
      response_format: zodResponseFormat(ContentSchema, "content"),
    });

    const content = completion.choices[0]?.message?.content || "";

    // Parse the content into JSON if possible
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error);
      parsedContent = {
        description: "",
        instruction: "Failed to parse the response. Please try again.",
      };
    }

    res.status(200).json(parsedContent);
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI API" });
  }
}
