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
  await page.goto("/inventory");

  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await page.getByLabel("Body style").selectOption("coupe");
  await expect(page.getByText("2 vehicles available")).toBeVisible();

  const vantageCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Aston Martin Vantage" }),
  });
  await vantageCard.getByRole("button", { name: "View details" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close vehicle details" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
