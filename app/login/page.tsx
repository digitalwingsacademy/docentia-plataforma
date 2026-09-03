import { signInWithProvider } from "@/lib/actions/auth";
import { MagicLinkForm } from "./magic-link-form";

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID);
  const azureEnabled = Boolean(process.env.AZURE_OAUTH_CLIENT_ID);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Entrar en Docentia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Te enviamos un enlace de acceso a tu email, sin contraseña.
        </p>
      </div>

      <MagicLinkForm />

      {(googleEnabled || azureEnabled) && (
        <div className="flex flex-col gap-2 border-t pt-4">
          {googleEnabled && (
            <form action={async () => { "use server"; await signInWithProvider("google"); }}>
              <button type="submit" className="w-full rounded-md border px-4 py-2 text-sm">
                Entrar con Google
              </button>
            </form>
          )}
          {azureEnabled && (
            <form action={async () => { "use server"; await signInWithProvider("azure"); }}>
              <button type="submit" className="w-full rounded-md border px-4 py-2 text-sm">
                Entrar con Microsoft
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
