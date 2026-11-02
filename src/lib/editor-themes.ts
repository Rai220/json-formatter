/**
 * The syntax-theme registry — the single source every theme consumer derives
 * from.
 *
 * 45 themes. `azure-light` is the branded palette hand-rolled in
 * `editor-setup.ts` (contrast-gated >= 4.5:1 on every pair). Everything else is
 * a faithful port from a maintained community package — imported as-is and
 * never restyled, because people want Dracula to be Dracula. The breadth is the
 * point: this is other people's work on display, not ours.
 *
 * Each entry also declares the pane-chrome mapping (`css`): the values written
 * onto the workbench as `--jf-*` custom properties so the toolbar row, tab row,
 * hairlines and status strips follow the editor surface. `paneBg` and `ink` are
 * read straight from each package's own `defaultSettings*` export rather than
 * eyeballed, so a theme cannot drift from its source.
 *
 * Contrast audit (foreground on background, WCAG relative luminance). Imported
 * themes are DOCUMENTED, NOT GATED — the port ships as its authors made it, and
 * these 6 sit below 4.5:1 on plain text:
 *
 *   tokyo-night 4.18
 *   tokyo-night-storm 3.87
 *   duotone-dark 2.72
 *   solarized-light 4.13
 *   duotone-light 2.64
 *   material-light 2.48
 *
 * Full audit:
 *   dracula              #f8f8f2   on #282a36   13.36
 *   monokai              #f8f8f2   on #272822   13.94
 *   github-dark          #c9d1d9   on #0d1117   12.26
 *   nord                 #FFFFFF   on #2e3440   12.49
 *   tokyo-night          #787c99   on #1a1b26   4.18
 *   tokyo-night-storm    #7982a9   on #24283b   3.87
 *   gruvbox-dark         #ebdbb2   on #282828   10.75
 *   solarized-dark       #839496   on #002B36   4.75
 *   vscode-dark          #9cdcfe   on #1e1e1e   11.18
 *   xcode-dark           #CECFD0   on #292A30   9.17
 *   atomone              #9d9b97   on #272C35   5.05
 *   androidstudio        #a9b7c6   on #282b2e   6.97
 *   material             #bdbdbd   on #2e3235   6.88
 *   abcdef               #defdef   on #0f0f0f   17.71
 *   abyss                #6688cc   on #000c18   5.59
 *   andromeda            #D5CED9   on #23262E   9.84
 *   aura                 #edecee   on #21202e   13.61
 *   bespin               #9d9b97   on #28211c   5.71
 *   copilot              #939da5   on #232a2f   5.27
 *   darcula              #f8f8f2   on #2B2B2B   13.28
 *   kimbie               #d3af86   on #221a0f   8.38
 *   monokai-dimmed       #c5c8c6   on #1e1e1e   9.88
 *   okaidia              #FFFFFF   on #272822   14.86
 *   red                  #F8F8F8   on #390000   16.84
 *   sublime              #FFFFFF   on #303841   11.88
 *   tomorrow-night-blue  #ffffff   on #002451   15.32
 *   basic-dark           #DDDDDD   on #2E3235   9.52
 *   console-dark         #fff      on #000      21.00
 *   duotone-dark         #6c6783   on #2a2734   2.72
 *   github-light         #24292e   on #fff      14.67
 *   solarized-light      #657B83   on #FDF6E3   4.13
 *   vscode-light         #383a42   on #ffffff   11.34
 *   xcode-light          #3D3D3D   on #fff      10.86
 *   gruvbox-light        #3c3836   on #fbf1c7   10.22
 *   tokyo-night-day      #3760bf   on #e1e2e7   4.52
 *   quietlight           #333333   on #F5F5F5   11.59
 *   noctis-lilac         #0c006b   on #f2f1f8   15.24
 *   eclipse              #000      on #fff      21.00
 *   bbedit               #000000   on #FFFFFF   21.00
 *   basic-light          #2e3440   on #ffffff   12.49
 *   duotone-light        #b29762   on #faf8f5   2.64
 *   material-light       #90A4AE   on #FAFAFA   2.48
 *   console-light        #000      on #fff      21.00
 */
import type { Extension } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  abcdef,
  abyss,
  androidstudio,
  andromeda,
  atomone,
  aura,
  basicDark,
  basicLight,
  bbedit,
  bespin,
  consoleDark,
  consoleLight,
  copilot,
  darcula,
  dracula,
  duotoneDark,
  duotoneLight,
  eclipse,
  githubDark,
  githubLight,
  gruvboxDark,
  gruvboxLight,
  kimbie,
  material,
  materialLight,
  monokai,
  monokaiDimmed,
  noctisLilac,
  nord,
  okaidia,
  quietlight,
  red,
  solarizedDark,
  solarizedLight,
  sublime,
  tokyoNight,
  tokyoNightDay,
  tokyoNightStorm,
  tomorrowNightBlue,
  vscodeDark,
  vscodeLight,
  xcodeDark,
  xcodeLight,
} from "@uiw/codemirror-themes-all";
import { toolEditorTheme, toolHighlight } from "@/lib/editor-setup";

export interface EditorThemeCss {
  paneBg: string;
  ink: string;
  inkDim: string;
  hairline: string;
  dangerBg: string;
  dangerInk: string;
  dangerBorder: string;
}

export interface EditorTheme {
  id: string;
  label: string;
  surface: "light" | "dark";
  /** [surface, ink, accent] — the three chips in the picker swatch. */
  swatch: [string, string, string];
  /** The complete CodeMirror extension set (theme + syntax highlighting). */
  extension: Extension;
  /** Pane-chrome mapping written as `--jf-*` custom properties. */
  css: EditorThemeCss;
}

// A developer tool opens dark. Every light theme is still one click away, and a
// saved choice always wins over this.
export const DEFAULT_THEME_ID = "one-dark";

export const EDITOR_THEMES: EditorTheme[] = [
  {
    id: "one-dark",
    label: "One Dark",
    surface: "dark",
    swatch: ["#282c34", "#abb2bf", "#61afef"],
    extension: oneDark,
    css: {
      paneBg: "#282c34",
      ink: "#abb2bf",
      inkDim: "rgba(171, 178, 191, 0.82)",
      hairline: "rgba(171, 178, 191, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "dracula",
    label: "Dracula",
    surface: "dark",
    swatch: ["#282a36", "#f8f8f2", "#f8f8f0"],
    extension: dracula,
    css: {
      paneBg: "#282a36",
      ink: "#f8f8f2",
      inkDim: "rgba(248, 248, 242, 0.82)",
      hairline: "rgba(248, 248, 242, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "monokai",
    label: "Monokai",
    surface: "dark",
    swatch: ["#272822", "#f8f8f2", "#f8f8f0"],
    extension: monokai,
    css: {
      paneBg: "#272822",
      ink: "#f8f8f2",
      inkDim: "rgba(248, 248, 242, 0.82)",
      hairline: "rgba(248, 248, 242, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    surface: "dark",
    swatch: ["#0d1117", "#c9d1d9", "#c9d1d9"],
    extension: githubDark,
    css: {
      paneBg: "#0d1117",
      ink: "#c9d1d9",
      inkDim: "rgba(201, 209, 217, 0.82)",
      hairline: "rgba(201, 209, 217, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "nord",
    label: "Nord",
    surface: "dark",
    swatch: ["#2e3440", "#FFFFFF", "#FFFFFF"],
    extension: nord,
    css: {
      paneBg: "#2e3440",
      ink: "#FFFFFF",
      inkDim: "rgba(255, 255, 255, 0.82)",
      hairline: "rgba(255, 255, 255, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night",
    surface: "dark",
    swatch: ["#1a1b26", "#787c99", "#c0caf5"],
    extension: tokyoNight,
    css: {
      paneBg: "#1a1b26",
      ink: "#787c99",
      inkDim: "rgba(120, 124, 153, 0.82)",
      hairline: "rgba(120, 124, 153, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "tokyo-night-storm",
    label: "Tokyo Night Storm",
    surface: "dark",
    swatch: ["#24283b", "#7982a9", "#c0caf5"],
    extension: tokyoNightStorm,
    css: {
      paneBg: "#24283b",
      ink: "#7982a9",
      inkDim: "rgba(121, 130, 169, 0.82)",
      hairline: "rgba(121, 130, 169, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "gruvbox-dark",
    label: "Gruvbox Dark",
    surface: "dark",
    swatch: ["#282828", "#ebdbb2", "#ebdbb2"],
    extension: gruvboxDark,
    css: {
      paneBg: "#282828",
      ink: "#ebdbb2",
      inkDim: "rgba(235, 219, 178, 0.82)",
      hairline: "rgba(235, 219, 178, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "solarized-dark",
    label: "Solarized Dark",
    surface: "dark",
    swatch: ["#002B36", "#839496", "#D30102"],
    extension: solarizedDark,
    css: {
      paneBg: "#002B36",
      ink: "#839496",
      inkDim: "rgba(131, 148, 150, 0.82)",
      hairline: "rgba(131, 148, 150, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "vscode-dark",
    label: "VS Code Dark",
    surface: "dark",
    swatch: ["#1e1e1e", "#9cdcfe", "#c6c6c6"],
    extension: vscodeDark,
    css: {
      paneBg: "#1e1e1e",
      ink: "#9cdcfe",
      inkDim: "rgba(156, 220, 254, 0.82)",
      hairline: "rgba(156, 220, 254, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "xcode-dark",
    label: "Xcode Dark",
    surface: "dark",
    swatch: ["#292A30", "#CECFD0", "#fff"],
    extension: xcodeDark,
    css: {
      paneBg: "#292A30",
      ink: "#CECFD0",
      inkDim: "rgba(206, 207, 208, 0.82)",
      hairline: "rgba(206, 207, 208, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "atomone",
    label: "Atom One",
    surface: "dark",
    swatch: ["#272C35", "#9d9b97", "#797977"],
    extension: atomone,
    css: {
      paneBg: "#272C35",
      ink: "#9d9b97",
      inkDim: "rgba(157, 155, 151, 0.82)",
      hairline: "rgba(157, 155, 151, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "androidstudio",
    label: "Android Studio",
    surface: "dark",
    swatch: ["#282b2e", "#a9b7c6", "#00FF00"],
    extension: androidstudio,
    css: {
      paneBg: "#282b2e",
      ink: "#a9b7c6",
      inkDim: "rgba(169, 183, 198, 0.82)",
      hairline: "rgba(169, 183, 198, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "material",
    label: "Material",
    surface: "dark",
    swatch: ["#2e3235", "#bdbdbd", "#a0a4ae"],
    extension: material,
    css: {
      paneBg: "#2e3235",
      ink: "#bdbdbd",
      inkDim: "rgba(189, 189, 189, 0.82)",
      hairline: "rgba(189, 189, 189, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "abcdef",
    label: "abcdef",
    surface: "dark",
    swatch: ["#0f0f0f", "#defdef", "#00FF00"],
    extension: abcdef,
    css: {
      paneBg: "#0f0f0f",
      ink: "#defdef",
      inkDim: "rgba(222, 253, 239, 0.82)",
      hairline: "rgba(222, 253, 239, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "abyss",
    label: "Abyss",
    surface: "dark",
    swatch: ["#000c18", "#6688cc", "#ddbb88"],
    extension: abyss,
    css: {
      paneBg: "#000c18",
      ink: "#6688cc",
      inkDim: "rgba(102, 136, 204, 0.82)",
      hairline: "rgba(102, 136, 204, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "andromeda",
    label: "Andromeda",
    surface: "dark",
    swatch: ["#23262E", "#D5CED9", "#FFF"],
    extension: andromeda,
    css: {
      paneBg: "#23262E",
      ink: "#D5CED9",
      inkDim: "rgba(213, 206, 217, 0.82)",
      hairline: "rgba(213, 206, 217, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "aura",
    label: "Aura",
    surface: "dark",
    swatch: ["#21202e", "#edecee", "#a277ff"],
    extension: aura,
    css: {
      paneBg: "#21202e",
      ink: "#edecee",
      inkDim: "rgba(237, 236, 238, 0.82)",
      hairline: "rgba(237, 236, 238, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "bespin",
    label: "Bespin",
    surface: "dark",
    swatch: ["#28211c", "#9d9b97", "#797977"],
    extension: bespin,
    css: {
      paneBg: "#28211c",
      ink: "#9d9b97",
      inkDim: "rgba(157, 155, 151, 0.82)",
      hairline: "rgba(157, 155, 151, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "copilot",
    label: "Copilot",
    surface: "dark",
    swatch: ["#232a2f", "#939da5", "#939da5"],
    extension: copilot,
    css: {
      paneBg: "#232a2f",
      ink: "#939da5",
      inkDim: "rgba(147, 157, 165, 0.82)",
      hairline: "rgba(147, 157, 165, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "darcula",
    label: "Darcula",
    surface: "dark",
    swatch: ["#2B2B2B", "#f8f8f2", "#FFFFFF"],
    extension: darcula,
    css: {
      paneBg: "#2B2B2B",
      ink: "#f8f8f2",
      inkDim: "rgba(248, 248, 242, 0.82)",
      hairline: "rgba(248, 248, 242, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "kimbie",
    label: "Kimbie",
    surface: "dark",
    swatch: ["#221a0f", "#d3af86", "#d3af86"],
    extension: kimbie,
    css: {
      paneBg: "#221a0f",
      ink: "#d3af86",
      inkDim: "rgba(211, 175, 134, 0.82)",
      hairline: "rgba(211, 175, 134, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "monokai-dimmed",
    label: "Monokai Dimmed",
    surface: "dark",
    swatch: ["#1e1e1e", "#c5c8c6", "#c07020"],
    extension: monokaiDimmed,
    css: {
      paneBg: "#1e1e1e",
      ink: "#c5c8c6",
      inkDim: "rgba(197, 200, 198, 0.82)",
      hairline: "rgba(197, 200, 198, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "okaidia",
    label: "Okaidia",
    surface: "dark",
    swatch: ["#272822", "#FFFFFF", "#FFFFFF"],
    extension: okaidia,
    css: {
      paneBg: "#272822",
      ink: "#FFFFFF",
      inkDim: "rgba(255, 255, 255, 0.82)",
      hairline: "rgba(255, 255, 255, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "red",
    label: "Red",
    surface: "dark",
    swatch: ["#390000", "#F8F8F8", "#970000"],
    extension: red,
    css: {
      paneBg: "#390000",
      ink: "#F8F8F8",
      inkDim: "rgba(248, 248, 248, 0.82)",
      hairline: "rgba(248, 248, 248, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "sublime",
    label: "Sublime",
    surface: "dark",
    swatch: ["#303841", "#FFFFFF", "#FBAC52"],
    extension: sublime,
    css: {
      paneBg: "#303841",
      ink: "#FFFFFF",
      inkDim: "rgba(255, 255, 255, 0.82)",
      hairline: "rgba(255, 255, 255, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "tomorrow-night-blue",
    label: "Tomorrow Night Blue",
    surface: "dark",
    swatch: ["#002451", "#ffffff", "#ffffff"],
    extension: tomorrowNightBlue,
    css: {
      paneBg: "#002451",
      ink: "#ffffff",
      inkDim: "rgba(255, 255, 255, 0.82)",
      hairline: "rgba(255, 255, 255, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "basic-dark",
    label: "Basic Dark",
    surface: "dark",
    swatch: ["#2E3235", "#DDDDDD", "#DDDDDD"],
    extension: basicDark,
    css: {
      paneBg: "#2E3235",
      ink: "#DDDDDD",
      inkDim: "rgba(221, 221, 221, 0.82)",
      hairline: "rgba(221, 221, 221, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "console-dark",
    label: "Console Dark",
    surface: "dark",
    swatch: ["#000", "#fff", "#fff"],
    extension: consoleDark,
    css: {
      paneBg: "#000",
      ink: "#fff",
      inkDim: "rgba(255, 255, 255, 0.82)",
      hairline: "rgba(255, 255, 255, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "duotone-dark",
    label: "Duotone Dark",
    surface: "dark",
    swatch: ["#2a2734", "#6c6783", "#ffad5c"],
    extension: duotoneDark,
    css: {
      paneBg: "#2a2734",
      ink: "#6c6783",
      inkDim: "rgba(108, 103, 131, 0.82)",
      hairline: "rgba(108, 103, 131, 0.14)",
      dangerBg: "rgba(248, 113, 113, 0.12)",
      dangerInk: "#fca5a5",
      dangerBorder: "rgba(248, 113, 113, 0.35)",
    },
  },
  {
    id: "azure-light",
    label: "Azure Light",
    surface: "light",
    swatch: ["#ffffff", "#0b2545", "#004db3"],
    extension: [toolEditorTheme, toolHighlight],
    css: {
      paneBg: "#ffffff",
      ink: "#0b2545",
      inkDim: "rgba(11, 37, 69, 0.82)",
      hairline: "rgba(0, 38, 84, 0.12)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "github-light",
    label: "GitHub Light",
    surface: "light",
    swatch: ["#fff", "#24292e", "#24292e"],
    extension: githubLight,
    css: {
      paneBg: "#fff",
      ink: "#24292e",
      inkDim: "rgba(36, 41, 46, 0.82)",
      hairline: "rgba(36, 41, 46, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "solarized-light",
    label: "Solarized Light",
    surface: "light",
    swatch: ["#FDF6E3", "#657B83", "#657B83"],
    extension: solarizedLight,
    css: {
      paneBg: "#FDF6E3",
      ink: "#657B83",
      inkDim: "rgba(101, 123, 131, 0.82)",
      hairline: "rgba(101, 123, 131, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "vscode-light",
    label: "VS Code Light",
    surface: "light",
    swatch: ["#ffffff", "#383a42", "#000"],
    extension: vscodeLight,
    css: {
      paneBg: "#ffffff",
      ink: "#383a42",
      inkDim: "rgba(56, 58, 66, 0.82)",
      hairline: "rgba(56, 58, 66, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "xcode-light",
    label: "Xcode Light",
    surface: "light",
    swatch: ["#fff", "#3D3D3D", "#3D3D3D"],
    extension: xcodeLight,
    css: {
      paneBg: "#fff",
      ink: "#3D3D3D",
      inkDim: "rgba(61, 61, 61, 0.82)",
      hairline: "rgba(61, 61, 61, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "gruvbox-light",
    label: "Gruvbox Light",
    surface: "light",
    swatch: ["#fbf1c7", "#3c3836", "#af3a03"],
    extension: gruvboxLight,
    css: {
      paneBg: "#fbf1c7",
      ink: "#3c3836",
      inkDim: "rgba(60, 56, 54, 0.82)",
      hairline: "rgba(60, 56, 54, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "tokyo-night-day",
    label: "Tokyo Night Day",
    surface: "light",
    swatch: ["#e1e2e7", "#3760bf", "#3760bf"],
    extension: tokyoNightDay,
    css: {
      paneBg: "#e1e2e7",
      ink: "#3760bf",
      inkDim: "rgba(55, 96, 191, 0.82)",
      hairline: "rgba(55, 96, 191, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "quietlight",
    label: "Quiet Light",
    surface: "light",
    swatch: ["#F5F5F5", "#333333", "#54494B"],
    extension: quietlight,
    css: {
      paneBg: "#F5F5F5",
      ink: "#333333",
      inkDim: "rgba(51, 51, 51, 0.82)",
      hairline: "rgba(51, 51, 51, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "noctis-lilac",
    label: "Noctis Lilac",
    surface: "light",
    swatch: ["#f2f1f8", "#0c006b", "#5c49e9"],
    extension: noctisLilac,
    css: {
      paneBg: "#f2f1f8",
      ink: "#0c006b",
      inkDim: "rgba(12, 0, 107, 0.82)",
      hairline: "rgba(12, 0, 107, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "eclipse",
    label: "Eclipse",
    surface: "light",
    swatch: ["#fff", "#000", "#FFFFFF"],
    extension: eclipse,
    css: {
      paneBg: "#fff",
      ink: "#000",
      inkDim: "rgba(0, 0, 0, 0.82)",
      hairline: "rgba(0, 0, 0, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "bbedit",
    label: "BBEdit",
    surface: "light",
    swatch: ["#FFFFFF", "#000000", "#FBAC52"],
    extension: bbedit,
    css: {
      paneBg: "#FFFFFF",
      ink: "#000000",
      inkDim: "rgba(0, 0, 0, 0.82)",
      hairline: "rgba(0, 0, 0, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "basic-light",
    label: "Basic Light",
    surface: "light",
    swatch: ["#ffffff", "#2e3440", "#3b4252"],
    extension: basicLight,
    css: {
      paneBg: "#ffffff",
      ink: "#2e3440",
      inkDim: "rgba(46, 52, 64, 0.82)",
      hairline: "rgba(46, 52, 64, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "duotone-light",
    label: "Duotone Light",
    surface: "light",
    swatch: ["#faf8f5", "#b29762", "#93abdc"],
    extension: duotoneLight,
    css: {
      paneBg: "#faf8f5",
      ink: "#b29762",
      inkDim: "rgba(178, 151, 98, 0.82)",
      hairline: "rgba(178, 151, 98, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "material-light",
    label: "Material Light",
    surface: "light",
    swatch: ["#FAFAFA", "#90A4AE", "#272727"],
    extension: materialLight,
    css: {
      paneBg: "#FAFAFA",
      ink: "#90A4AE",
      inkDim: "rgba(144, 164, 174, 0.82)",
      hairline: "rgba(144, 164, 174, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
  {
    id: "console-light",
    label: "Console Light",
    surface: "light",
    swatch: ["#fff", "#000", "#000"],
    extension: consoleLight,
    css: {
      paneBg: "#fff",
      ink: "#000",
      inkDim: "rgba(0, 0, 0, 0.82)",
      hairline: "rgba(0, 0, 0, 0.14)",
      dangerBg: "#fff1f2",
      dangerInk: "#9f1239",
      dangerBorder: "#fecdd3",
    },
  },
];

/** Grouped for the picker — 30 dark, 15 light. */
export const THEME_GROUPS: Array<{ surface: "dark" | "light"; label: string; themes: EditorTheme[] }> = [
  { surface: "dark", label: "Dark", themes: EDITOR_THEMES.filter((t) => t.surface === "dark") },
  { surface: "light", label: "Light", themes: EDITOR_THEMES.filter((t) => t.surface === "light") },
];

export function resolveTheme(id: string | null): EditorTheme {
  return EDITOR_THEMES.find((t) => t.id === id) ?? EDITOR_THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}
