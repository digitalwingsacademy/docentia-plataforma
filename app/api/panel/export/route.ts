import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCoordinatorRoster, rosterToCsv } from "@/lib/coordinator";

export async function GET() {
  const supabase = await createClient();
  const roster = await getCoordinatorRoster(supabase);
  const csv = rosterToCsv(roster);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="progreso-claustro.csv"',
    },
  });
}
