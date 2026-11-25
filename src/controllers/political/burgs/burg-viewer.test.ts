// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";

import { Burgs } from "@/model/political/burgs-generator";
import { Dialog } from "@/ui/dialog/dialog";
import { BurgViewer } from "./burg-viewer";

const preview = "https://watabou.github.io/city-generator/?seed=1&size=55&preview=1";

function setup(burg: object, previewUrl: string | null = preview) {
  document.body.innerHTML = '<div id="dialogs"></div><svg></svg>';
  vi.stubGlobal("pack", {
    burgs: [null, { i: 1, cell: 0, state: 1, name: "Рудня", population: 10, ...burg }],
    cells: { province: [0] },
    states: [{ name: "Neutrals" }, { name: "Сталевар" }],
    provinces: []
  });
  Object.assign(Burgs, { getPreview: () => ({ link: previewUrl, preview: previewUrl }) });
}

afterEach(() => {
  Dialog.destroy("burgViewer");
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

it("shows the burg preview and its description", () => {
  setup({ note: "<p>Містечко в лісі.</p>" });
  BurgViewer.open(1);

  expect(Dialog.isOpen("burgViewer")).toBe(true);
  expect(document.querySelector<HTMLIFrameElement>("#burgViewer iframe")?.src).toBe(preview);
  expect(document.querySelector("#burgViewer [data-part='note']")?.innerHTML).toBe("<p>Містечко в лісі.</p>");
  expect(document.querySelector("#burgViewer [data-part='place']")?.textContent).toBe("Сталевар");
});

it("leaves out the sections the burg has nothing for", () => {
  setup({}, null);
  BurgViewer.open(1);

  expect(document.querySelector("#burgViewer iframe")).toBeNull();
  expect(document.querySelector("#burgViewer [data-part='description']")).toBeNull();
});

it("never runs markup outside the notes subset", () => {
  setup({ note: '<img src="x" onerror="alert(1)">' });
  BurgViewer.open(1);

  expect(document.querySelector("#burgViewer img")).toBeNull();
});
