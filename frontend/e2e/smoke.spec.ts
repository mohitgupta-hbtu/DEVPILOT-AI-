import { test, expect } from "@playwright/test";

// Smoke test: the app shell renders and routing works without a backend.
test("loads and shows the workspace shell", async ({ page }) => {
  await page.goto("/");
  // Unauthenticated users are redirected to /login.
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator("text=DevPilot AI")).toBeVisible();
});

test("mentor route requires auth and redirects", async ({ page }) => {
  await page.goto("/mentor");
  await expect(page).toHaveURL(/\/login/);
});
