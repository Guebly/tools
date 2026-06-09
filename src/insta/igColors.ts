import type { IgTheme } from "./types";

export const IG_C = {
  light: {
    bg:        "#ffffff",
    bgSec:     "#fafafa",
    text:      "#262626",
    textSec:   "#737373",
    border:    "#dbdbdb",
    btnBg:     "#efefef",
    navBg:     "#ffffff",
    link:      "#00376b",
    icon:      "#262626",
    tabActive: "#262626",
    tabInact:  "#8e8e8e",
    hlBorder:  "#dbdbdb",
    inputBg:   "#fafafa",
  },
  dark: {
    bg:        "#000000",
    bgSec:     "#121212",
    text:      "#f5f5f5",
    textSec:   "#a8a8a8",
    border:    "#262626",
    btnBg:     "#363636",
    navBg:     "#000000",
    link:      "#e0f1ff",
    icon:      "#f5f5f5",
    tabActive: "#f5f5f5",
    tabInact:  "#737373",
    hlBorder:  "#333333",
    inputBg:   "#1c1c1c",
  },
} as const satisfies Record<IgTheme, Record<string, string>>;

export function igC(theme: IgTheme) {
  return IG_C[theme];
}
