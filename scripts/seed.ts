/**
 * Seed de desarrollo: un colegio demo con 5 plazas y un coordinador ya
 * creado (via Admin API, no INSERT crudo, para que el usuario pueda entrar
 * de verdad con magic link). El docente se invita durante la demo siguiendo
 * el flujo real, no se preseedea.
 *
 * Idempotente: usa upsert / comprueba existencia antes de crear.
 */
import { createAdminClient } from "../lib/supabase/admin";

const DEMO_ORG_NAME = "Colegio Demo";
const COORDINATOR_EMAIL = "coordinador@colegiodemo.es";

async function main() {
  const supabase = createAdminClient();

  let { data: org } = await supabase.from("organizations").select("id").eq("name", DEMO_ORG_NAME).maybeSingle();

  if (!org) {
    const { data: newOrg, error } = await supabase
      .from("organizations")
      .insert({ name: DEMO_ORG_NAME, seats_total: 5 })
      .select("id")
      .single();
    if (error) throw error;
    org = newOrg;
    console.log(`Organizacion creada: ${DEMO_ORG_NAME} (${org.id})`);
  } else {
    console.log(`Organizacion ya existia: ${DEMO_ORG_NAME} (${org.id})`);
  }

  const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  let coordinator = usersPage.users.find((u) => u.email === COORDINATOR_EMAIL);

  if (!coordinator) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: COORDINATOR_EMAIL,
      email_confirm: true,
      user_metadata: { full_name: "Coordinadora Demo" },
    });
    if (error) throw error;
    coordinator = data.user;
    console.log(`Usuario coordinador creado: ${COORDINATOR_EMAIL}`);
  } else {
    console.log(`Usuario coordinador ya existia: ${COORDINATOR_EMAIL}`);
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .upsert(
      { profile_id: coordinator.id, organization_id: org.id, role: "COORDINATOR" },
      { onConflict: "profile_id,organization_id" }
    );
  if (membershipError) throw membershipError;

  console.log("Seed completado.");
  console.log(`  Organizacion: ${DEMO_ORG_NAME} (5 plazas)`);
  console.log(`  Coordinador: ${COORDINATOR_EMAIL} (entra con magic link)`);
}

main().catch((error) => {
  console.error("Seed fallido:", error);
  process.exit(1);
});
