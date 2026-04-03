/**
 * AI Urgency Scoring System for Tranquillo Labs
 *
 * Uses Google Gemini (gemini-2.0-flash) to analyze intake sessions and
 * produce an urgency score (1-10) plus a concise AI summary.
 * Scores >= 9 automatically escalate the intake session.
 */
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ── Gemini API config ──────────────────────────────────────────────────
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── System prompt for urgency scoring ──────────────────────────────────
const SYSTEM_PROMPT = `You are an urgency-scoring assistant for a home-services dispatch platform.
Given the details of a customer intake session, return a JSON object with exactly two keys:
  "urgencyScore": an integer from 1 (lowest) to 10 (highest),
  "aiSummary": a concise 1-2 sentence summary of the issue and recommended priority.

Scoring guidelines:
- 1-3: Routine / non-urgent (scheduled maintenance, minor cosmetic issues)
- 4-6: Moderate (appliance not working, minor leak, comfort issue)
- 7-8: High (significant water leak, HVAC failure in extreme weather, electrical hazard)
- 9-10: Critical / Emergency (gas leak, flooding, sewage backup, no heat in winter with vulnerable occupants, fire risk, carbon monoxide)

Consider these factors:
1. Service type and category
2. Issue description - look for emergency keywords (gas leak, flooding, no heat, burst pipe, fire, carbon monoxide, sewage, electrical sparking)
3. Property type (commercial properties may have higher impact)
4. Time of day (after-hours emergencies are more urgent)
5. Whether the issue poses immediate safety risks to occupants

Return ONLY valid JSON, no markdown fences, no extra text.`;

/**
 * scoreIntake - Convex action that scores an intake session via Gemini AI
 *
 * Fetches the intake session, builds a prompt, calls Gemini, parses the
 * response, and updates the intake session with the score and summary.
 */
export const scoreIntake = action({
  args: {
    intakeSessionId: v.id("intakeSessions"),
  },
  handler: async (ctx, args): Promise<{ urgencyScore: number; aiSummary: string }> => {
    // 1. Fetch the intake session
    const session = await ctx.runQuery(api.intakeSessions.getById, {
      id: args.intakeSessionId,
    });

    if (!session) {
      throw new Error(`Intake session not found: ${args.intakeSessionId}`);
    }

    // 2. Build the user prompt with session details
    const createdDate = new Date(session.createdAt);
    const timeOfDay = createdDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const isAfterHours =
      createdDate.getHours() < 7 || createdDate.getHours() >= 19;

    const userPrompt = `Please score the following intake session:

Service Category: ${session.serviceCategory ?? "Not specified"}
Issue Description: ${session.issueRaw}
Property Type: ${session.propertyType ?? "Not specified"}
Time Submitted: ${timeOfDay} (${isAfterHours ? "after hours" : "business hours"})
Channel: ${session.channel}
Customer: ${session.customerName}
Location: ${[session.addressCity, session.addressState].filter(Boolean).join(", ") || "Not specified"}
Tags: ${session.tags?.join(", ") || "None"}
Dispatch Notes: ${session.dispatchNotes ?? "None"}
Access Notes: ${session.accessNotes ?? "None"}`;

    // 3. Call Google Gemini API
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_API_KEY environment variable is not set. " +
        "Configure it in your Convex dashboard under Settings > Environment Variables."
      );
    }

    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent scoring
          maxOutputTokens: 256,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(
        `Gemini API error (${geminiResponse.status}): ${errorBody}`
      );
    }

    const geminiData = await geminiResponse.json();

    // 4. Parse the response
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: { urgencyScore: number; aiSummary: string };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error(
        `Failed to parse Gemini response as JSON: ${rawText.substring(0, 200)}`
      );
    }

    // Validate and clamp the score
    let urgencyScore = Math.round(Number(parsed.urgencyScore));
    if (isNaN(urgencyScore) || urgencyScore < 1) urgencyScore = 1;
    if (urgencyScore > 10) urgencyScore = 10;

    const aiSummary =
      typeof parsed.aiSummary === "string"
        ? parsed.aiSummary
        : "AI summary unavailable.";

    // 5. Determine if auto-escalation is needed
    const shouldEscalate = urgencyScore >= 9;

    // 6. Update the intake session via mutation
    await ctx.runMutation(api.intakeSessions.updateAiScoring, {
      intakeSessionId: args.intakeSessionId,
      urgencyScore,
      aiSummary,
      escalate: shouldEscalate,
    });

    return { urgencyScore, aiSummary };
  },
});
