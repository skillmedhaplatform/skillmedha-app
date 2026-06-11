// For App Router (app/api/chat/route.js)
import OpenAI from "openai";

const orgId = process.env.orgId;
const projId = process.env.projId;
const apiKey = process.env.apiKey;

const openai = new OpenAI({
  apiKey: apiKey,
  organization: orgId,
  project: projId,
});

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

// export async function POST(req) {
//   try {
//     const { messages } = await req.json();

//     // Step 1: Content moderation check on the latest user message
//     const latestUserMessage = messages[messages.length - 1];
//     if (latestUserMessage.role === 'user') {
//       const moderationResponse = await openai.moderations.create({
//         input: latestUserMessage.content,
//       });

//       const moderationResult = moderationResponse.results[0];

//       if (moderationResult.flagged) {
//         console.log('Content flagged:', moderationResult.categories);
//         return Response.json({
//           error: 'I can only help with educational topics. Please ask me something related to learning, studying, or academics.',
//         }, { status: 400 });
//       }
//     }

//     // Step 2: Check if the query is education-related
//     const educationCheckPrompt = `Is this query related to education, learning, academics, or studying? Answer only "YES" or "NO": "${latestUserMessage.content}"`;

//     const educationCheck = await openai.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [{ role: 'user', content: educationCheckPrompt }],
//       max_tokens: 10,
//       temperature: 0.1,
//     });

//     const isEducational = educationCheck.choices[0].message.content.trim().toUpperCase() === 'YES';

//     if (!isEducational) {
//       return Response.json({
//         message: 'I can only help with educational topics like homework, studying, research, and academic subjects. How can I assist you with your learning today?',
//       });
//     }

//     // Step 3: Generate educational response with system prompt
//     const completion = await openai.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [
//         EDUCATION_SYSTEM_PROMPT,
//         ...messages
//       ],
//       temperature: 0.7,
//       max_tokens: 1000,
//     });

//     const responseContent = completion.choices[0].message.content;

//     // Step 4: Moderation check on AI response
//     const outputModerationResponse = await openai.moderations.create({
//       input: responseContent,
//     });

//     const outputModerationResult = outputModerationResponse.results[0];

//     if (outputModerationResult.flagged) {
//       console.log('AI response flagged:', outputModerationResult.categories);
//       return Response.json({
//         message: 'I apologize, but I need to provide a different response. Could you rephrase your educational question?',
//       });
//     }

//     return Response.json({
//       message: responseContent,
//     });

//   } catch (error) {
//     console.error('OpenAI API error:', error);

//     // Handle specific content policy violations
//     if (error.code === 'content_policy_violation') {
//       return Response.json({
//         error: 'I can only help with educational content. Please ask me about studying, homework, or academic topics.',
//       }, { status: 400 });
//     }

//     return Response.json(
//       { error: 'Failed to get response from AI' },
//       { status: 500 }
//     );
//   }
// }
