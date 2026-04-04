import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { goal, dietaryRestrictions, monthlyBudget, supplementExperience } = body;

  if (!goal || !dietaryRestrictions || !monthlyBudget || !supplementExperience) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userMessage = `Please recommend a supplement stack for the following profile:

Primary Goal: ${goal}
Dietary Restrictions: ${dietaryRestrictions}
Monthly Supplement Budget: ${monthlyBudget}
Experience with Supplements: ${supplementExperience}

Return ONLY a JSON array of supplement recommendations with no other text. Each item should follow this exact structure:
[
  {
    "supplement": "Supplement name",
    "reason": "Why this supplement is recommended for this person's specific goal and dietary needs",
    "dosage": "Recommended dosage and timing (e.g. 25g post-workout)",
    "estimatedMonthlyPrice": "Monthly cost in INR (e.g. ₹1,500 - ₹2,500)",
    "priority": "core" | "recommended" | "optional"
  }
]

Provide 5-8 supplements that fit within the budget and respect dietary restrictions. Use Indian Rupee pricing (₹) based on Indian market rates. Prioritize safety and effectiveness.`;

  const message = await getAnthropic().messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system:
      "You are an expert sports nutritionist with extensive knowledge of supplements, their efficacy, safety, and Indian market pricing. You provide personalized supplement recommendations based on individual goals, dietary restrictions, and budgets. Always respond with valid JSON arrays only when asked for supplement recommendations. Never recommend anything that contradicts stated dietary restrictions.",
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

  let stack;
  try {
    stack = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: cleaned },
      { status: 500 }
    );
  }

  return NextResponse.json({ stack });
}
