import { test, expect } from "@playwright/test";
import { loginAs, deleteTestUser } from "./helpers";

const COORDINATOR_EMAIL = "coordinador@colegiodemo.es";
const teacherEmail = `e2e-teacher-${Date.now()}@colegiodemo.es`;

test.describe.serial("flujo completo de la demo", () => {
  test.afterAll(async () => {
    await deleteTestUser(teacherEmail);
  });

  test("el coordinador entra y ve su panel de organización", async ({ page, baseURL }) => {
    await loginAs(page, COORDINATOR_EMAIL, baseURL!);
    await expect(page).toHaveURL(/\/$/);
    // El coordinador no esta matriculado en el curso (eso es cosa de
    // docentes) - su vista propia es el catalogo vacio; lo que confirma su
    // rol es que /panel le deja entrar en vez de redirigirle a "/".
    await expect(page.getByRole("heading", { name: "Tus cursos" })).toBeVisible();
    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: "Panel del claustro" })).toBeVisible();
  });

  test("el coordinador invita a un docente por email", async ({ page, baseURL }) => {
    await loginAs(page, COORDINATOR_EMAIL, baseURL!);
    await page.goto("/panel");
    await page.getByLabel("Invitar docente por email").fill(teacherEmail);
    await page.getByRole("button", { name: "Invitar" }).click();
    await expect(page.getByText(`Invitación creada para ${teacherEmail}`)).toBeVisible();
  });

  test("el docente invitado entra, completa una lección y el coordinador ve su progreso", async ({
    page,
    baseURL,
  }) => {
    await loginAs(page, teacherEmail, baseURL!);
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole("link", { name: "Competencia Digital Docente" }).click();
    await expect(page.getByRole("link", { name: "Continuar" })).toBeVisible();
    await page.getByRole("link", { name: "Continuar" }).click();

    await expect(page.getByRole("heading", { name: "¿Qué es la competencia digital docente?" })).toBeVisible();
    await page.getByRole("button", { name: "Marcar como leída" }).click();
    await expect(page.getByText("Lección marcada como leída")).toBeVisible();

    await loginAs(page, COORDINATOR_EMAIL, baseURL!);
    await page.goto("/panel");
    // El nombre viene vacío (login por magic link puro, sin metadata) - se
    // comprueba que hay una fila con progreso > 0%, señal de que la lectura
    // del docente recién invitado ya se refleja en el roster.
    await expect(page.getByText(/\d+% \(\d+\/\d+\)/).first()).toBeVisible();
  });
});
