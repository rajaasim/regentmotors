import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Elevate Your Drive." },
  { path: "/inventory", heading: "The Collection" },
  { path: "/financing", heading: "Drive It Home, On Your Terms" },
  { path: "/contact", heading: "Get in Touch" },
] as const;

for (const route of routes) {
  test(`${route.path} renders its primary heading`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      route.heading,
    );
  });
}

test("inventory filters and opens vehicle details", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto("/inventory");

  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  const bodyStyle = page.getByLabel("Body style");
  await expect(bodyStyle).toBeVisible();
  await bodyStyle.selectOption("coupe");
  await expect(page.getByText("2 vehicles available")).toBeVisible();
  const activeFilter = page.getByRole("button", { name: "Remove coupe filter" });
  await expect(activeFilter).toBeVisible();

  const vantageCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Aston Martin Vantage" }),
  });
  await vantageCard.getByRole("button", { name: "View details" }).click();
  const vehicleDialog = page.getByRole("dialog", { name: /Aston Martin Vantage/ });
  const dialogScrollSurface = page.locator("[data-vehicle-dialog-scroll]");
  await expect(vehicleDialog).toBeVisible();
  expect(await dialogScrollSurface.evaluate((element) => element.parentElement === document.body)).toBe(true);
  await dialogScrollSurface.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(await dialogScrollSurface.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await dialogScrollSurface.evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.getByRole("button", { name: "Open full-screen vehicle gallery" }).click();
  const lightbox = page.getByRole("dialog", { name: "Vehicle image gallery" });
  await expect(lightbox).toBeVisible();
  await expect(page.locator("[data-vehicle-lightbox]")).toHaveCSS("overflow-y", "auto");
  await page.getByRole("button", { name: "Close image gallery" }).click();
  await page.getByRole("button", { name: "Close vehicle details" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await activeFilter.click();
  await expect(page.getByText("9 vehicles available")).toBeVisible();
});

test("mobile navigation closes with Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobileNavigation = page.getByRole("dialog", { name: "Mobile navigation" });

  await expect(mobileNavigation).toBeVisible();
  await expect(mobileNavigation.getByRole("link", { name: "Home" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(mobileNavigation).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
});

test("vehicle and test-drive enquiries preserve their context", async ({ page }) => {
  await page.goto("/contact?vehicle=veh-maserati-ghibli-2023");
  await expect(page.getByRole("heading", { name: "Enquire about the 2023 Maserati Ghibli" })).toBeVisible();
  await expect(page.getByText("Your enquiry will include the 2023 Maserati Ghibli.")).toBeVisible();

  await page.goto("/contact?intent=test_drive");
  await expect(page.getByRole("heading", { name: "Book a test drive" })).toBeVisible();

  await page.goto("/financing?vehicle=veh-maserati-ghibli-2023");
  await expect(page.getByRole("heading", { name: "Discuss financing the 2023 Maserati Ghibli" })).toBeVisible();
});

for (const protectedRoute of ["/admin", "/admin/leads", "/admin/settings"] as const) {
  test(`${protectedRoute} redirects unauthenticated visitors`, async ({ page }) => {
    await page.goto(protectedRoute);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in securely" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
  });
}
