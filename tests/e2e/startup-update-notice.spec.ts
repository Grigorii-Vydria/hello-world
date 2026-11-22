import { expect, test } from "@playwright/test";
import { waitForMap } from "./wait-for-map";

test.use({ storageState: { cookies: [], origins: [] } });

for (const storedVersion of [null, "1.100.0"]) {
  test(`does not open the update notice on startup with version ${storedVersion}`, async ({ page }) => {
    if (storedVersion) {
      await page.addInitScript(version => localStorage.setItem("version", version), storedVersion);
    }

    await page.goto("/hello-world/");
    await waitForMap(page);
    await page.waitForTimeout(6500);
    await expect(page.locator("#releaseNotes")).not.toBeVisible();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("version"))).not.toBe(storedVersion);

    await page.keyboard.press("F1");
    await expect(page.locator("#releaseNotes")).toBeVisible();
  });
}
