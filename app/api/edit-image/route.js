import OpenAI from "openai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function base64ToPng(base64, filename = "image.png") {
  const base64Data = base64.split(";base64,").pop();

  // const tmpDir = "/tmp";
  const filePath = path.join(__dirname, filename);

  fs.writeFileSync(filePath, base64Data, { encoding: "base64" });

  return filePath;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// export const runtime = "edge";

export async function POST(req) {
  try {
    const data = await req.json();
    const { image, mask, prompt } = data;

    const pngImage = base64ToPng(image, "image.png");
    const pngMask = base64ToPng(mask, "mask.png");

    const response = await openai.images.edit({
      image: fs.createReadStream(pngImage),
      mask: fs.createReadStream(pngMask),
      prompt,
      n: 3,
    });

    fs.unlinkSync(pngImage);
    fs.unlinkSync(pngMask);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: error.statusCode || 500 } // Use a default error status code if none is provided
    );
  }
}
