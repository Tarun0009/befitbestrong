import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { spaceType, budget, goals, experience, priorities } = body;

  if (!spaceType || !budget || !goals || !experience || !priorities) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userMessage = `Please recommend gym equipment and gear for the following setup:

Space Type: ${spaceType}
Budget: ${budget}
Primary Goal: ${goals}
Experience Level: ${experience}
Priority Categories: ${Array.isArray(priorities) ? priorities.join(", ") : priorities}

Return ONLY a JSON array of product recommendations with no other text. Each item should follow this exact structure:
[
  {
    "name": "Product name",
    "category": "Category (e.g. Free Weights, Cardio, etc.)",
    "reason": "Why this is recommended for the user's specific setup",
    "estimatedPrice": "Price in INR (e.g. ₹5,000 - ₹8,000)",
    "priority": "essential" | "recommended" | "optional"
  }
]

Provide 8-12 recommendations, prioritizing based on the user's budget and goals. Use Indian Rupee pricing (₹). Focus on products available in the Indian market.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system:
      "You are an expert gym equipment advisor with deep knowledge of fitness equipment, Indian market pricing, and training methodologies. You help people build their ideal gym setups based on their space, budget, goals, and experience level. Always respond with valid JSON arrays only when asked for product recommendations.",
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip markdown code blocks if present
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let recommendations;
  try {
    recommendations = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: cleaned },
      { status: 500 }
    );
  }

  return NextResponse.json({ recommendations });
}
