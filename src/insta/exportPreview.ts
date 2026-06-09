/**
 * exportPreview
 * Captures the phone frame element and composes it over a branded
 * background (IG gradient + Guebly logo watermark), then downloads
 * the result as a PNG.
 */

export interface ExportOptions {
  /** The DOM element wrapping the phone frame */
  frameEl: HTMLElement;
  /** Instagram username — used in the filename */
  username?: string;
}

export async function exportPreview({ frameEl, username }: ExportOptions): Promise<void> {
  // Dynamic import so html2canvas is never in the main bundle
  const html2canvas = (await import("html2canvas")).default;

  // ── 1. Capture the phone frame ──────────────────────────────────────
  const frameCanvas = await html2canvas(frameEl, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    scale: 2,              // retina quality
    logging: false,
  });

  const PW = frameCanvas.width;   // phone width  (px × scale)
  const PH = frameCanvas.height;  // phone height (px × scale)

  // ── 2. Build output canvas with padding + branding ──────────────────
  const PAD    = 80 * 2;          // 80px padding each side, at 2x scale
  const FOOTER = 72 * 2;          // space below phone for branding bar
  const W      = PW + PAD * 2;
  const H      = PH + PAD * 2 + FOOTER;

  const out = document.createElement("canvas");
  out.width  = W;
  out.height = H;
  const ctx  = out.getContext("2d")!;

  // ── 3. Background: deep dark + subtle IG glow blobs ─────────────────
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // glow — orange bottom-left
  const g1 = ctx.createRadialGradient(0, H, 0, 0, H, W * 0.7);
  g1.addColorStop(0,   "rgba(240,148,51,0.12)");
  g1.addColorStop(1,   "rgba(240,148,51,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // glow — purple top-right
  const g2 = ctx.createRadialGradient(W, 0, 0, W, 0, W * 0.7);
  g2.addColorStop(0,   "rgba(188,24,136,0.12)");
  g2.addColorStop(1,   "rgba(188,24,136,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  // subtle dot grid
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  const DOT = 24 * 2;
  for (let x = 0; x < W; x += DOT) {
    for (let y = 0; y < H; y += DOT) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── 4. Stamp the phone frame ─────────────────────────────────────────
  const phoneX = PAD;
  const phoneY = PAD;

  // soft shadow behind phone
  ctx.save();
  ctx.shadowColor   = "rgba(0,0,0,0.7)";
  ctx.shadowBlur    = 80 * 2;
  ctx.shadowOffsetY = 20 * 2;
  ctx.fillStyle     = "rgba(0,0,0,0.01)"; // nearly transparent fill just to trigger shadow
  ctx.beginPath();
  ctx.roundRect(phoneX, phoneY, PW, PH, 44 * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(frameCanvas, phoneX, phoneY);

  // ── 5. Footer branding bar ────────────────────────────────────────────
  const BAR_Y = phoneY + PH + PAD * 0.6;

  // IG gradient line accent
  const lineGrad = ctx.createLinearGradient(phoneX, 0, phoneX + PW, 0);
  lineGrad.addColorStop(0,    "#f09433");
  lineGrad.addColorStop(0.22, "#e6683c");
  lineGrad.addColorStop(0.45, "#dc2743");
  lineGrad.addColorStop(0.72, "#cc2366");
  lineGrad.addColorStop(1,    "#bc1888");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(phoneX, BAR_Y, PW, 3 * 2);

  // "InstaPreview" text
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font      = `600 ${13 * 2}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText("InstaPreview", phoneX, BAR_Y + 28 * 2);

  // "by Guebly" text
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font      = `400 ${11 * 2}px Inter, system-ui, sans-serif`;
  const byText  = "by guebly.com.br";
  const byW     = ctx.measureText(byText).width;
  ctx.fillText(byText, phoneX + PW - byW, BAR_Y + 28 * 2);

  // ── 6. Download ───────────────────────────────────────────────────────
  const slug     = (username || "preview").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  const filename = `instapreview_${slug}_${Date.now()}.png`;

  const link     = document.createElement("a");
  link.download  = filename;
  link.href      = out.toDataURL("image/png");
  link.click();
}
