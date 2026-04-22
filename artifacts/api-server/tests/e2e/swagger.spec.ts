import { test, expect } from "@playwright/test";

test.describe("Swagger UI", () => {
  test("redirects /api/docs to /api/docs/", async ({ request }) => {
    const res = await request.get("/api/docs", { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()["location"]).toBe("/api/docs/");
  });

  test("serves the OpenAPI JSON spec", async ({ request }) => {
    const res = await request.get("/api/docs/openapi.json");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty("openapi");
    expect(body).toHaveProperty("paths");
    expect(body.paths).toHaveProperty("/openrouter/conversations");
  });

  test("renders the Swagger UI page", async ({ page }) => {
    const response = await page.goto("/api/docs/");
    expect(response?.ok()).toBeTruthy();

    // Title is set in app.ts to "Story Together API"
    await expect(page).toHaveTitle(/Story Together API/i);

    // Swagger UI's root container should be present in the DOM
    await expect(page.locator("#swagger-ui")).toBeAttached();

    // Wait for the spec info header to render (Swagger UI bundle hydrates the container)
    await expect(page.locator(".swagger-ui .info")).toBeVisible({
      timeout: 30_000,
    });

    // The "openrouter" tag from the spec should be displayed
    await expect(page.locator(".swagger-ui").getByText(/openrouter/i).first())
      .toBeVisible({ timeout: 15_000 });
  });
});
