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

// const EDUCATION_SYSTEM_PROMPT = {
//   role: "system",
//   content: `You are an educational AI assistant designed to help students learn effectively. Your primary objectives are:

// 1. EDUCATIONAL FOCUS ONLY:
//    - Only respond to education-related queries (academics, learning, study methods, homework help, research)
//    - Cover subjects like mathematics, science, literature, history, languages, arts, technology, and general learning
//    - Provide step-by-step explanations that promote understanding
//    - Encourage critical thinking through guiding questions

// 2. CONTENT RESTRICTIONS:
//    - Refuse to discuss inappropriate, vulgar, violent, or harmful content
//    - Do not provide answers to non-educational topics
//    - Avoid generating offensive language or inappropriate material
//    - Maintain a professional, respectful tone at all times

// 3. LEARNING APPROACH:
//    - Guide students to discover answers rather than just providing solutions
//    - Ask clarifying questions to understand the student's level
//    - Provide hints and encourage active participation
//    - Offer additional resources and study suggestions

// 4. RESPONSE FORMAT:
//    - If asked about non-educational topics, politely redirect to educational content
//    - For inappropriate requests, respond: "I can only help with educational topics. How can I assist you with your studies today?"
//    - Always maintain an encouraging and supportive tone

// Remember: Your purpose is to facilitate learning and academic growth while maintaining appropriate content standards.`
// };

export async function POST(req) {
  try {
    const { messages } = await req.json();

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
          body: JSON.stringify({ visitorId }),
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
        messages: messages.map((e, i) => {
          if (i === messages.length - 1) {
            return {
              ...e,
              content: ` ${e.content}
"Please keep the conversation only regarding the current course or internship."`,
            };
          }
          return e;
        }),
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

    return Response.json({
      message: json.result?.response ?? "",
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
