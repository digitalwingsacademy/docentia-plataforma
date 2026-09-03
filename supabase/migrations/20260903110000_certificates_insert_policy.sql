-- Hallazgo de un usuario real completando el curso: certificates solo tenia
-- politicas de SELECT. Al completar el 100% del curso, issueCertificateIfComplete
-- inserta el certificado con el cliente del propio docente (nunca con la
-- service_role, ADR-007) - sin politica de INSERT, RLS lo bloqueaba en
-- silencio y el error sin manejar reventaba como un digest generico de
-- Next/React sin ningun mensaje util.
create policy "el docente emite su propio certificado al completar el curso"
  on public.certificates for insert
  with check (
    exists (
      select 1 from public.enrollments e
      where e.id = certificates.enrollment_id
        and e.profile_id = auth.uid()
    )
  );
