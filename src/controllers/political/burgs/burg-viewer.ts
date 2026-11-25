// The read-only burg card of the published map: the burg's map preview and its description
import { Burgs } from "@/model/political/burgs-generator";
import { Dialog } from "@/ui/dialog/dialog";
import { openURL } from "@/utils/common-utils";
import { t } from "@/utils/i18n";
import { ensureEl } from "@/utils/node-utils";
import { rn } from "@/utils/number-utils";
import { isSafeHtml } from "@/utils/validation-utils";

const DIALOG_ID = "burgViewer";

function open(id: number): void {
  const burg = pack.burgs[id];
  if (!burg || burg.removed) return;

  close();
  const province = pack.cells.province[burg.cell];
  const state = pack.states[burg.state!];
  const place = [province ? pack.provinces[province].fullName : "", state?.fullName || state?.name]
    .filter(Boolean)
    .join(", ");
  const population = rn(
    (burg.population || 0) * options.map.units.population.scale * options.map.units.population.urbanization.rate
  );
  const { link, preview } = Burgs.getPreview(burg);

  ensureEl("dialogs").insertAdjacentHTML(
    "beforeend",
    /* html */ `<div id="${DIALOG_ID}" class="dialog stable">
      <div style="font-weight: bold" data-part="place"></div>
      <div>${t("Population")}: <span data-part="population"></span></div>
      <div data-part="preview" style="display: block; width: 100%; margin-top: 0.5em">
        <div style="display: flex; justify-content: space-between">
          <span>${t("Burg preview")}:</span>
          <i data-part="link" data-tip="${t("Open burg map in a new tab")}" class="icon-link-ext pointer"></i>
        </div>
        <div data-part="frame" style="display: block; position: relative; overflow: hidden; width: 100%; height: 320px; max-height: 40vh"></div>
      </div>
      <div data-part="description" style="display: block; width: 100%; margin-top: 0.5em">
        <div>${t("Description")}:</div>
        <div data-part="note" style="display: block; width: 100%; max-height: 30vh; overflow-y: auto"></div>
      </div>
    </div>`
  );

  const part = (name: string) => ensureEl(DIALOG_ID).querySelector<HTMLElement>(`[data-part='${name}']`)!;
  part("place").textContent = place;
  part("population").textContent = String(population);

  if (preview) {
    const frame = document.createElement("iframe");
    frame.style.cssText = "position: absolute; inset: 0; width: 100%; height: 100%; border: none";
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
    frame.src = preview;
    part("frame").append(frame);
    if (link) part("link").addEventListener("click", () => openURL(link));
    else part("link").remove();
  } else part("preview").remove();

  const note = burg.note?.trim();
  if (!note) part("description").remove();
  else if (isSafeHtml(note)) part("note").innerHTML = note;
  else part("note").textContent = note;

  Dialog.open(DIALOG_ID, {
    title: burg.name,
    width: "30em",
    position: { my: "left top", at: "left+10 top+10", of: "svg" },
    onClose: close
  });
}

function close(): void {
  document.getElementById(DIALOG_ID)?.querySelector("iframe")?.remove();
  Dialog.destroy(DIALOG_ID);
}

export const BurgViewer = { open };
