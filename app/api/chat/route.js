// For App Router (app/api/chat/route.js)
import OpenAI from "openai";

export const dynamic = "force-dynamic";

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

    const openai = new OpenAI({
      apiKey: process.env.apiKey,
      organization: process.env.orgId,
      project: process.env.projId,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    return Response.json({
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return Response.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
