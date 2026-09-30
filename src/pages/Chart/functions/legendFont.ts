import * as am5 from "@amcharts/amcharts5";
// Bundled font: the legend must look identical on every device, so it must not
// fall back to the OS system font (SF Pro on iOS, Roboto on Android, Segoe UI on Windows).
import "@fontsource/roboto/400.css";

export const LEGEND_FONT_FAMILY = "Roboto, sans-serif";
export const LEGEND_FONT_WEIGHT = "400";

// Responsive by viewport width only — never by device/OS
export const getLegendFontSize = (): number => {
  const width = window.innerWidth;
  if (width <= 480) return 14;
  if (width <= 1024) return 15;
  return 16;
};

const fontSpec = () => `${LEGEND_FONT_WEIGHT} ${getLegendFontSize()}px Roboto`;

// Start downloading the font as soon as the chart code is loaded
if (typeof document !== "undefined" && document.fonts) {
  void document.fonts.load(fontSpec());
}

export const applyLegendFont = (legend: am5.Legend) => {
  const font = {
    fontFamily: LEGEND_FONT_FAMILY,
    fontWeight: LEGEND_FONT_WEIGHT as am5.ILabelSettings["fontWeight"],
    fontSize: getLegendFontSize(),
  };
  legend.labels.template.setAll(font);
  legend.valueLabels.template.setAll(font);

  // Canvas text doesn't re-render by itself when a webfont finishes loading,
  // so redraw the legend text once Roboto is ready if it wasn't yet.
  if (document.fonts && !document.fonts.check(fontSpec())) {
    document.fonts.load(fontSpec()).then(() => {
      if (legend.isDisposed()) return;
      legend.labels.each((label) => label.text.markDirtyText());
      legend.valueLabels.each((label) => label.text.markDirtyText());
    }).catch(() => {});
  }
};
