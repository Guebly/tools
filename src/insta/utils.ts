export const uid = () => Math.random().toString(36).slice(2, 10);

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function saveTheme(theme: "dark" | "light") {
  try { localStorage.setItem("instapreview-theme", theme); } catch {}
}
export function loadTheme(): "dark" | "light" | null {
  try {
    const v = localStorage.getItem("instapreview-theme");
    if (v === "dark" || v === "light") return v;
  } catch {}
  return null;
}
export function saveIgTheme(theme: "dark" | "light") {
  try { localStorage.setItem("instapreview-ig-theme", theme); } catch {}
}
export function loadIgTheme(): "dark" | "light" | null {
  try {
    const v = localStorage.getItem("instapreview-ig-theme");
    if (v === "dark" || v === "light") return v;
  } catch {}
  return null;
}
