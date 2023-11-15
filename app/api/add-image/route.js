import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(req) {
  console.log('GET')
  const { searchParams } = new URL(req.url);
  const b64String = searchParams.get("b64_json");
  const revisedPrompt = searchParams.get("revised_prompt");
  console.log("GET: ", b64String);

  try {
    if (!b64String || !revisedPrompt)
      throw new Error("B64 string and revised prompt required");
    await sql`insert into images (B64_json, Revised_prompt) values (${b64String}, ${revisedPrompt})`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const images = await sql`select * from images`;
  return NextResponse.json({ images }, { status: 200 });
}
