// For App Router (app/api/chat/route.js)
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "chatVisitorId";
const VISITOR_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
};

// Without this, the assistant has no idea what course it's embedded in and
// falls back to generic answers even for questions like "what tools does
// this course use" — grounding it in the actual syllabus/topic fixes that.
const buildCourseSystemPrompt = (courseContext) => {
  if (!courseContext?.courseTitle) {
    return "You are a helpful AI learning assistant embedded in an online course. Keep the conversation focused on the student's studies.";
  }

  const syllabusText = (courseContext.syllabus || [])
    .map((s) => `- ${s.section}${s.topics?.length ? `: ${s.topics.join(", ")}` : ""}`)
    .join("\n");

  return `You are an AI learning assistant embedded in the course "${courseContext.courseTitle}".

Course syllabus:
${syllabusText || "(not available)"}

The student is currently viewing: ${courseContext.currentSection || "N/A"} > ${courseContext.currentTopic || "N/A"}
${courseContext.currentTopicSummary ? `Current topic content: ${courseContext.currentTopicSummary}` : ""}

Answer using this course's actual syllabus and topic content above rather than generic, unrelated answers. If the exact answer isn't in the provided content, use your general knowledge but tie it back to the specific technologies/units named in the syllabus above. Keep the conversation focused on this course.`;
};

export async function POST(req) {
  try {
    const { messages, courseContext, studentId } = await req.json();

    // Identify this browser with a long-lived anonymous cookie so the backend
    // can enforce a per-visitor daily message limit (Workers AI isn't unlimited).
    const cookieStore = await cookies();
    let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      cookieStore.set(VISITOR_COOKIE, visitorId, VISITOR_COOKIE_OPTS);
    }

    let quota = { allowed: true };
    try {
      const quotaResp = await fetch(
        `${process.env.NEXT_PUBLIC_REST_URL}/ai/chatWidget/consume`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, studentId }),
          cache: "no-store",
        }
      );
      quota = await quotaResp.json();
    } catch (err) {
      console.error("Chat rate-limit check failed, allowing through:", err);
    }

    if (quota.allowed === false) {
      return Response.json(
        {
          error:
            quota.error ||
            "You've reached today's chat limit. Please try again tomorrow.",
        },
        { status: 429 }
      );
    }

    const model =
      process.env.CLOUDFLARE_AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: buildCourseSystemPrompt(courseContext) },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const json = await resp.json();

    if (!resp.ok || json.success === false) {
      throw new Error(
        json?.errors?.[0]?.message || `Workers AI request failed (${resp.status})`
      );
    }

    // Prefer the guaranteed-string field — Cloudflare's top-level
    // `result.response` gets silently auto-parsed into an object whenever
    // the content happens to look like JSON.
    const rawMessage = json.result?.choices?.[0]?.message?.content;
    const message =
      typeof rawMessage === "string" && rawMessage
        ? rawMessage
        : typeof json.result?.response === "string"
          ? json.result.response
          : "";

    // Report the real neuron cost back to the backend's shared usage
    // tracking (this call bypasses src/shared/utils/ai.js entirely, so
    // without this its spend would be invisible to that account-wide
    // budget). Fire-and-forget — must never block the chat reply already
    // computed above.
    const neuronsUsed = json.result?.usage?.neurons || 0;
    fetch(`${process.env.NEXT_PUBLIC_REST_URL}/ai/chatWidget/trackUsage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ neurons: neuronsUsed, visitorId, studentId }),
      cache: "no-store",
    }).catch((err) => console.error("Chat usage tracking failed:", err));

    return Response.json({
      message,
      remaining: quota.remaining,
    });
  } catch (error) {
    console.error("Workers AI API error:", error);
    return Response.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
