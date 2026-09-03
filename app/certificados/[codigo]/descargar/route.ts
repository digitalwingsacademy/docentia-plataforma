import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("verify_certificate", { code: codigo }).maybeSingle();
  if (!data) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 420]); // A5 apaisado
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  const center = (text: string, y: number, font = regular, size = 14) => {
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (595 - width) / 2, y, size, font, color: rgb(0.1, 0.1, 0.1) });
  };

  // full_name puede no existir todavia (login solo con magic link, sin
  // ningun paso que pida nombre) - sin fallback, pdf-lib revienta al pedirle
  // que dibuje null en vez de un string.
  center("Certificado de Aprovechamiento", 340, bold, 22);
  center(data.teacher_name ?? "Docente", 280, bold, 18);
  center("ha completado el curso", 250, regular, 12);
  center(data.course_title ?? "", 220, bold, 16);
  center(
    `${data.total_hours} horas de formación — ${new Date(data.issued_at).toLocaleDateString("es-ES")}`,
    180,
    regular,
    12
  );
  center(`Código de verificación: ${data.verification_code}`, 60, regular, 10);

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${codigo}.pdf"`,
    },
  });
}
