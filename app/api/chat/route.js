import OpenAI from "openai";
import { NextResponse } from "next/server";

const MODEL_NAME = "dall-e-3";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const data = await req.json();
    const { messages, style, size, textToAdd } = data;
    const latestMessage =
      messages.slice(-1)[0]?.content ||
      "The world's cutest kitten huggin a dog"; // Fallback if no content

    const promptText =
      `A Youtube thumbnail displaying ${latestMessage}. ` +
      `Do not include the youtube logo, or I will be fired.` +
      `${
        textToAdd.length > 0
          ? " Text Overlay: " + textToAdd
          : " Do not add any text."
      }`;

    const response = await openai.images.generate({
      model: MODEL_NAME,
      prompt: promptText,
      n: 1,
      size: size,
      style: style,
      response_format: "b64_json",
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: error.statusCode || 500 } // Use a default error status code if none is provided
    );
  }
}
