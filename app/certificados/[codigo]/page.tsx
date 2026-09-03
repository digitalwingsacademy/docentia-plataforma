import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Publica: la verificacion de un certificado no exige sesion (para que un
// colegio pueda comprobar uno sin tener cuenta). Se resuelve via el RPC
// verify_certificate en vez de una politica publica sobre toda la tabla.
export default async function CertificatePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("verify_certificate", { code: codigo }).maybeSingle();
  if (!data) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Certificado verificado ✓</h1>
      <p className="text-lg">{data.teacher_name}</p>
      <p className="text-muted-foreground">{data.course_title}</p>
      <p className="text-sm">
        {data.total_hours} horas — emitido el {new Date(data.issued_at).toLocaleDateString("es-ES")}
      </p>
      <p className="font-mono text-xs text-muted-foreground">Código: {data.verification_code}</p>
      <a
        href={`/certificados/${codigo}/descargar`}
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Descargar PDF
      </a>
    </main>
  );
}
