import Link from "next/link";

export function NoOrganizationMessage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl font-semibold">Todavía no perteneces a ningún colegio</h1>
      <p className="text-sm text-muted-foreground">
        Pide a la persona coordinadora de formación de tu colegio que te invite con tu email, y vuelve
        a entrar cuando lo haya hecho.
      </p>
      <Link href="/" className="text-sm text-primary hover:underline">
        Volver al inicio
      </Link>
    </main>
  );
}
