import type { VercelRequest, VercelResponse } from "@vercel/node";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type RequestBody = {
  messages?: ChatMessage[];
  exam?: string;
  subject?: string;
  mode?: "Ask" | "Learn" | "Practice" | "Test";
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // --------------------------------------------------
  // CORS / basic response headers
  // --------------------------------------------------

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Only POST requests are allowed.",
    });
  }

  try {
    // --------------------------------------------------
    // Environment variables
    // --------------------------------------------------

    const apiKey = process.env.AI_API_KEY;
    const baseUrl =
      process.env.AI_BASE_URL ||
      "https://api.openai.com/v1";

    const model =
      process.env.AI_MODEL ||
      "gpt-4o-mini";

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error:
          "AI_API_KEY is not configured on the server.",
      });
    }

    // --------------------------------------------------
    // Request body
    // --------------------------------------------------

    const body = req.body as RequestBody;

    if (
      !body.messages ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "messages array is required.",
      });
    }

    // --------------------------------------------------
    // Study context
    // --------------------------------------------------

    const exam = body.exam || "Any Exam";
    const subject = body.subject || "Any Subject";
    const mode = body.mode || "Ask";

    const systemPrompt = `
You are an AI Study Assistant inside an exam preparation platform.

Exam:
${exam}

Subject:
${subject}

Study Mode:
${mode}

Rules:

1. Focus primarily on educational and academic questions.
2. Answer in the language/style used by the student.
3. Hindi, English and Hinglish are supported.
4. Explain difficult concepts in simple steps.
5. If the student asks for practice questions, generate questions
   appropriate to the selected exam and subject.
6. If the student asks for a test, behave like a real test.
7. Do not reveal the answer before the student attempts a question
   when operating in Test mode.
8. For MCQs, provide four options unless the student requests
   another format.
9. If the student gives an answer, evaluate it and explain why it
   is correct or incorrect.
10. Never invent an official exam question and claim it is a PYQ.
11. If a question is ambiguous or information is missing, say so.
12. Prefer NCERT-aligned explanations for school/NEET science
   when applicable.
13. Keep answers focused and useful for exam preparation.
`;

    // --------------------------------------------------
    // Prepare messages
    // --------------------------------------------------

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...body.messages,
    ];

    // --------------------------------------------------
    // OpenAI-compatible request
    // --------------------------------------------------

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          model,
          messages,

          temperature:
            mode === "Test"
              ? 0.4
              : 0.7,

          max_tokens: 2000,
        }),
      }
    );

    // --------------------------------------------------
    // Provider error handling
    // --------------------------------------------------

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "AI Provider Error:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        success: false,
        error: "AI provider request failed.",
        providerStatus: response.status,
      });
    }

    const data = await response.json();

    // --------------------------------------------------
    // Extract response
    // --------------------------------------------------

    const answer =
      data?.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        success: false,
        error:
          "AI provider returned an unexpected response.",
      });
    }

    // --------------------------------------------------
    // Final response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      answer,

      provider: {
        model,
      },

      usage: data?.usage || null,
    });

  } catch (error) {
    console.error("AI API error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal AI service error.",
    });
  }
}
