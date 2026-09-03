import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoordinatorRoster } from "@/lib/coordinator";
import { InviteTeacherForm } from "@/components/invite-teacher-form";

export default async function CoordinatorPanelPage() {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role")
    .in("role", ["COORDINATOR", "ADMIN"]);

  if (!memberships || memberships.length === 0) {
    redirect("/");
  }

  const roster = await getCoordinatorRoster(supabase);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Panel del claustro</h1>
        <a href="/api/panel/export" className="rounded-md border px-3 py-1.5 text-sm">
          Exportar CSV
        </a>
      </div>

      <div className="mt-4">
        <InviteTeacherForm />
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2">Docente</th>
            <th className="py-2">Curso</th>
            <th className="py-2">Progreso</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((row) => (
            <tr key={row.enrollmentId} className="border-b">
              <td className="py-2">{row.teacherName ?? "(sin nombre)"}</td>
              <td className="py-2">{row.courseTitle}</td>
              <td className="py-2">
                {row.percentComplete}% ({row.completedSections}/{row.totalSections})
              </td>
            </tr>
          ))}
          {roster.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-muted-foreground">
                Todavía no hay docentes matriculados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
