import { NextResponse } from "next/server";
import OpenAI from "openai";
import { INTENT_DESCRIPTIONS } from "@/lib/knowledgeBase";

const SYSTEM_PROMPT = `You are an intent classifier for a Japanese ward office (区役所) voice assistant.

Given a user's spoken request, classify it into exactly one of these intents:

${INTENT_DESCRIPTIONS.map((d) => `- "${d.key}": ${d.description}`).join("\n")}

Rules:
- Respond ONLY with valid JSON: { "intent": "<intent_key>" }
- The user may speak in any language (English, Japanese, Chinese, Korean, Vietnamese, Nepali, or mixed)
- Focus on the meaning, not specific keywords
- If the request is unclear or doesn't match any supported intent, use "unsupported"`;

export async function POST(request: Request) {
  try {
    const openai = new OpenAI();
    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 50,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    const intent = typeof parsed.intent === "string" ? parsed.intent : "unsupported";

    console.log("─── Intent Classification ───");
    console.log("Transcript:", transcript);
    console.log("GPT raw response:", raw);
    console.log("Resolved intent:", intent);
    console.log("Model:", completion.model);
    console.log("Tokens:", completion.usage);
    console.log("─────────────────────────────");

    return NextResponse.json({ intent });
  } catch (error: unknown) {
    console.error("Classify Route Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
