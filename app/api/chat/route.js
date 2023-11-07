import OpenAI from "openai";
import { NextResponse } from "next/server";

const MODEL_NAME = "dall-e-3";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const data = await req.json(); // Make sure to await the Promise
    const { messages } = data;
    console.log("Messages:", messages.slice(-1));
    // Rest of your code...
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A Youtube thumbnail displaying ${messages.slice(-1)[0].content}`,
      n: 1,
      size: "1024x1024",
    });
    // const image_url = response.data.data[0].url;
    console.log("Prompt:", response.data[0].url);

    return NextResponse.json(response);
  } catch (error) {
    // Catch any errors that occur during the process.
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
