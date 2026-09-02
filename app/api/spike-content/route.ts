import { NextResponse } from "next/server";
import { getSpikeContent } from "@/lib/spike-content";

export async function GET() {
  const content = await getSpikeContent();
  return NextResponse.json(content);
}
