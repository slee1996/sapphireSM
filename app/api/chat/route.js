import OpenAI from "openai";
import { NextResponse } from "next/server";

const MODEL_NAME = "dall-e-3";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req) {
  try {
    const data = await req.json();
    const { messages, style, size, textToAdd } = data;
    const latestMessage =
      messages.slice(-1)[0]?.content ||
      "The world's cutest kitten huggin a dog"; // Fallback if no content

    const promptText =
      `An image appropriate for a YouTube thumbnail displaying ${latestMessage}.` +
      `${textToAdd.length > 0 ? " Text Overlay: " + textToAdd : ""}` +
      ` Do NOT include the youtube logo or any associated iconography, or I will be fired from my job.`;

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
