// Azgaar and contributors, 2017-2026. MIT License
// https://github.com/Azgaar/Fantasy-Map-Generator

import { Catalog } from "@/utils/i18n";
import { log } from "@/utils/logger";

async function start(): Promise<void> {
  const language = "uk"; // the published map is always in Ukrainian, whatever the browser or a stored choice says
  document.documentElement.lang = language;
  await Catalog.load(language).catch(error => log.error("Interface strings failed to load", error));
  const { boot } = await import("./app");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else void boot();
}

void start();
