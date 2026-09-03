export function Descargable({ href, titulo }: { href: string; titulo: string }) {
  return (
    <a
      href={href}
      download
      className="my-4 flex items-center gap-2 rounded-md border p-3 text-sm font-medium hover:bg-secondary"
    >
      ⬇️ {titulo}
    </a>
  );
}
