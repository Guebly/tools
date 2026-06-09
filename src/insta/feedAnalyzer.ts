import type { FeedImage, FeedAnalysis } from "./types";

/**
 * Analyze feed images and generate insights
 * Uses client-side analysis without external dependencies
 */
export async function analyzeFeed(feed: FeedImage[]): Promise<FeedAnalysis> {
  if (feed.length === 0) {
    return {
      harmony: 0,
      dominantColors: [],
      palette: "neutral",
      aesthetic: "minimal",
      recommendations: ["Adicione pelo menos 9 fotos para análise completa"],
    };
  }

  // Extract colors from images using canvas (client-side only)
  const colors: string[] = [];
  const sampleSize = Math.min(feed.length, 9);

  for (let i = 0; i < sampleSize; i++) {
    try {
      const extractedColors = await extractDominantColors(feed[i].url);
      colors.push(...extractedColors);
    } catch {
      // Skip images that fail to load
    }
  }

  // Analyze color harmony
  const harmony = calculateHarmony(colors);
  const dominantColors = colors.slice(0, 5); // Top 5 colors
  const palette = detectPalette(colors);
  const aesthetic = detectAesthetic(colors, feed.length);
  const recommendations = generateRecommendations(harmony, palette, aesthetic, feed.length);

  return {
    harmony,
    dominantColors,
    palette,
    aesthetic,
    recommendations,
  };
}

/**
 * Calculate color harmony score (0-100)
 */
function calculateHarmony(colors: string[]): number {
  if (colors.length < 2) return 50;

  // Calculate variance in hue
  const hues = colors.map(hexToHue);
  const avgHue = hues.reduce((a, b) => a + b, 0) / hues.length;
  const variance = hues.reduce((sum, h) => sum + Math.pow(h - avgHue, 2), 0) / hues.length;

  // Lower variance = better harmony
  const harmonyScore = Math.max(0, 100 - (variance / 10));

  return Math.round(harmonyScore);
}

/**
 * Detect palette type based on color temperature
 */
function detectPalette(colors: string[]): FeedAnalysis["palette"] {
  if (colors.length === 0) return "neutral";

  const temps = colors.map(colorTemperature);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

  if (avgTemp > 0.6) return "warm";
  if (avgTemp < 0.4) return "cool";

  const saturations = colors.map(hexToSaturation);
  const avgSat = saturations.reduce((a, b) => a + b, 0) / saturations.length;

  return avgSat > 0.5 ? "vibrant" : "neutral";
}

/**
 * Detect aesthetic style
 */
function detectAesthetic(colors: string[], feedCount: number): FeedAnalysis["aesthetic"] {
  const saturations = colors.map(hexToSaturation);
  const avgSat = saturations.reduce((a, b) => a + b, 0) / saturations.length;

  if (avgSat < 0.3) return "minimal";
  if (avgSat > 0.7) return "colorful";
  if (feedCount >= 20) return "professional";

  return "lifestyle";
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  harmony: number,
  palette: FeedAnalysis["palette"],
  aesthetic: FeedAnalysis["aesthetic"],
  feedCount: number
): string[] {
  const recs: string[] = [];

  if (harmony < 60) {
    recs.push("Mantenha uma paleta de cores mais consistente entre os posts");
  } else if (harmony > 85) {
    recs.push("Excelente harmonia de cores! Continue com essa consistência");
  }

  if (feedCount < 9) {
    recs.push(`Adicione mais ${9 - feedCount} fotos para completar a primeira linha do grid`);
  }

  if (palette === "vibrant") {
    recs.push("Feed vibrante! Considere adicionar alguns posts neutros para balancear");
  }

  if (aesthetic === "minimal") {
    recs.push("Estética minimalista detectada. Experimente adicionar elementos coloridos");
  }

  if (feedCount % 3 !== 0) {
    recs.push("Complete a última linha do grid para melhor simetria visual");
  }

  if (recs.length === 0) {
    recs.push("Seu feed está otimizado! Continue postando conteúdo de qualidade");
  }

  return recs.slice(0, 4); // Max 4 recommendations
}

/**
 * Convert hex color to HSL hue (0-360)
 */
function hexToHue(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let h = 0;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  return (h * 60 + 360) % 360;
}

/**
 * Convert hex to saturation (0-1)
 */
function hexToSaturation(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max === 0) return 0;
  return (max - min) / max;
}

/**
 * Calculate color temperature (0=cool, 1=warm)
 */
function colorTemperature(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;

  // Simplified: more red/yellow = warmer
  return (rgb.r + rgb.g * 0.5) / (255 * 1.5);
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Extract dominant colors from image using canvas
 * Client-side only - returns promise
 */
async function extractDominantColors(imageUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    // Skip if not in browser
    if (typeof window === "undefined") {
      resolve([]);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve([]);
          return;
        }

        // Scale down for performance
        const size = 50;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // Sample colors from the image
        const colorMap: Record<string, number> = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;

          // Skip very dark or very light colors
          const brightness = (r + g + b) / 3;
          if (brightness < 30 || brightness > 225) continue;

          const hex = rgbToHex(r, g, b);
          colorMap[hex] = (colorMap[hex] || 0) + 1;
        }

        // Get top 2 most common colors
        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([color]) => color);

        resolve(sortedColors);
      } catch {
        resolve([]);
      }
    };

    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}
