import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const result = sql`CREATE TABLE Images (B64_json text, Revised_prompt text)`;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
