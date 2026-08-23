// src/lib/textFormatters.ts
/**
 * Guebly Text Formatter
 *
 * Entrada: Markdown "estilo ChatGPT" (**, _, *, #, listas, --- , blockquote, links, tabelas)
 * Saída:
 *   - WhatsApp: conversão REAL (*negrito* e _itálico_, que o próprio WhatsApp renderiza)
 *   - LinkedIn/Instagram: conversão REAL para Unicode "Mathematical Alphanumeric
 *     Symbols" — os caracteres saem literalmente em negrito/itálico (𝐀𝐁𝐂 / 𝐴𝐵𝐶),
 *     já que essas plataformas não interpretam Markdown.
 */

type ProtectedChunk = { key: string; value: string };

// ── Unicode Mathematical Alphanumeric Symbols ──────────────────────────────
// Mapeia A-Z / a-z / 0-9 para os blocos Unicode de negrito, itálico e
// negrito-itálico "de verdade" (aparecem em negrito/itálico em QUALQUER
// plataforma, mesmo sem suporte a Markdown — LinkedIn, Instagram, etc.)
type MathVariant = "bold" | "italic" | "boldItalic";

const MATH_RANGES: Record<
  MathVariant,
  { upperStart: number; lowerStart: number; digitStart: number | null }
> = {
  bold: { upperStart: 0x1d400, lowerStart: 0x1d41a, digitStart: 0x1d7ce },
  italic: { upperStart: 0x1d434, lowerStart: 0x1d44e, digitStart: null },
  boldItalic: { upperStart: 0x1d468, lowerStart: 0x1d482, digitStart: 0x1d7ce },
};

// U+1D455 (italic lowercase "h") não é um caractere Unicode alocado — o
// padrão usa o símbolo de compatibilidade U+210E (PLANCK CONSTANT) no lugar.
const ITALIC_H = "ℎ";

function toMathVariant(input: string, variant: MathVariant): string {
  const range = MATH_RANGES[variant];
  let out = "";
  for (const ch of input) {
    if (variant === "italic" && ch === "h") {
      out += ITALIC_H;
      continue;
    }
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x41 && code <= 0x5a) {
      out += String.fromCodePoint(range.upperStart + (code - 0x41));
    } else if (code >= 0x61 && code <= 0x7a) {
      out += String.fromCodePoint(range.lowerStart + (code - 0x61));
    } else if (code >= 0x30 && code <= 0x39 && range.digitStart != null) {
      out += String.fromCodePoint(range.digitStart + (code - 0x30));
    } else {
      out += ch;
    }
  }
  return out;
}

function normalize(text: string) {
  return (text ?? "").replace(/\r\n?/g, "\n");
}

function protectCode(text: string) {
  const chunks: ProtectedChunk[] = [];
  let out = text;

  // fenced code blocks
  out = out.replace(/```[\s\S]*?```/g, (m) => {
    const key = `⟦CODEBLOCK_${chunks.length}⟧`;
    chunks.push({ key, value: m });
    return key;
  });

  // inline code
  out = out.replace(/`[^`\n]+`/g, (m) => {
    const key = `⟦CODE_${chunks.length}⟧`;
    chunks.push({ key, value: m });
    return key;
  });

  return { out, chunks };
}

function restoreProtected(text: string, chunks: ProtectedChunk[]) {
  let out = text;
  for (const c of chunks) out = out.replaceAll(c.key, c.value);
  return out;
}

function mdLinksToPlain(text: string) {
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, t, u) => {
    return `${t} (${u})`;
  });
}

function mdTablesToPlain(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const isHeader = /^\|.*\|$/.test(line);
    const next = lines[i + 1] ?? "";
    const isSep = /^\|\s*[:\- ]+\|/.test(next);

    if (!isHeader || !isSep) {
      out.push(line);
      i += 1;
      continue;
    }

    const headers = line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((s) => s.trim());

    i += 2;

    const rows: string[][] = [];
    while (i < lines.length && /^\|.*\|$/.test(lines[i])) {
      const cells = lines[i]
        .trim()
        .slice(1, -1)
        .split("|")
        .map((s) => s.trim());
      rows.push(cells);
      i += 1;
    }

    if (!rows.length) {
      out.push("");
      continue;
    }

    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r];
      for (let c = 0; c < headers.length; c++) {
        const h = headers[c] ?? `Coluna ${c + 1}`;
        const v = (cells[c] ?? "").trim();
        if (!h && !v) continue;
        out.push(`${h}: ${v}`);
      }
      if (r !== rows.length - 1) out.push("");
    }
  }

  return out.join("\n");
}

// Converte blocos de citação (`> texto`) preservando a quebra de
// parágrafo: agrupa linhas "> " consecutivas, remove o prefixo, marca
// visualmente com "❝ " e garante uma linha em branco antes/depois do
// bloco para que não fiquem grudadas no parágrafo anterior/seguinte.
function blockquotesToPlain(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];
  let i = 0;

  const isQuoteLine = (l: string) => /^\s*>\s?/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (!isQuoteLine(line)) {
      out.push(line);
      i += 1;
      continue;
    }

    const quoteLines: string[] = [];
    while (i < lines.length && isQuoteLine(lines[i])) {
      quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
      i += 1;
    }

    if (out.length && out[out.length - 1].trim() !== "") out.push("");
    quoteLines.forEach((q, idx) => {
      out.push(idx === 0 ? `❝ ${q}`.trimEnd() : q.trimEnd());
    });
    if (i < lines.length && lines[i].trim() !== "") out.push("");
  }

  return out.join("\n");
}

function cleanupMarkdown(text: string) {
  let out = text;

  out = out.replace(/^\s*---+\s*$/gm, "────────────");
  out = blockquotesToPlain(out);

  out = mdLinksToPlain(out);
  out = mdTablesToPlain(out);

  return out;
}

function normalizeBullets(text: string, bullet = "•") {
  return text.replace(
    /^(\s*)(?:[-+*]|\d+[.)])\s+/gm,
    (_m, indent) => `${indent}${bullet} `
  );
}

function protectWhatsAppBold(text: string) {
  const chunks: ProtectedChunk[] = [];
  let out = text;

  out = out.replace(/\*([^*\n]+?)\*/g, (m) => {
    const key = `⟦WBOLD_${chunks.length}⟧`;
    chunks.push({ key, value: m });
    return key;
  });

  return { out, chunks };
}

function toWhatsApp(text: string) {
  const code = protectCode(text);
  let out = code.out;

  out = out.replace(/^#{1,6}\s+(.*)$/gm, (_m, t) => `*${t.trim()}*`);
  out = out.replace(/\*\*([^*\n]+?)\*\*/g, (_m, g1) => `*${g1}*`);

  const boldProt = protectWhatsAppBold(out);
  out = boldProt.out;

  out = out
    .split("\n")
    .map((line) =>
      line.replace(
        /(^|[\s([{"'"'])\*([^*\n]+?)\*(?=[\s)\]}.,!?;:'""']|$)/g,
        (_m, p1, g1) => `${p1}_${g1}_`
      )
    )
    .join("\n");

  out = restoreProtected(out, boldProt.chunks);
  out = normalizeBullets(out, "•");
  out = out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  out = restoreProtected(out, code.chunks);
  return out;
}

function toSocialCompatible(text: string) {
  const code = protectCode(text);
  let out = code.out;

  out = out.replace(/^#{1,6}\s+(.*)$/gm, (_m, t) => {
    const title = t.trim();
    return `${title.toUpperCase()}\n`;
  });

  // ***negrito+itálico*** → Unicode bold-italic real
  out = out.replace(/\*\*\*([^*\n]+?)\*\*\*/g, (_m, g1) =>
    toMathVariant(g1, "boldItalic")
  );

  // **negrito** → Unicode bold real (não markdown, o LinkedIn/Instagram não renderizam **)
  out = out.replace(/\*\*([^*\n]+?)\*\*/g, (_m, g1) => toMathVariant(g1, "bold"));

  // *itálico* → Unicode italic real
  out = out
    .split("\n")
    .map((line) =>
      line.replace(
        /(^|[\s([{"'"'])\*([^*\n]+?)\*(?=[\s)\]}.,!?;:'""']|$)/g,
        (_m, p1, g1) => `${p1}${toMathVariant(g1, "italic")}`
      )
    )
    .join("\n");

  // _itálico_ (estilo alternativo, ex: saída do ChatGPT) → Unicode italic real
  out = out
    .split("\n")
    .map((line) =>
      line.replace(
        /(^|[\s([{"'"'])_([^_\n]+?)_(?=[\s)\]}.,!?;:'""']|$)/g,
        (_m, p1, g1) => `${p1}${toMathVariant(g1, "italic")}`
      )
    )
    .join("\n");

  out = normalizeBullets(out, "•");
  out = out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  out = restoreProtected(out, code.chunks);
  return out;
}

export function formatForWhatsApp(input: string) {
  const text = cleanupMarkdown(normalize(input));
  return toWhatsApp(text);
}

export function formatForLinkedIn(input: string) {
  const text = cleanupMarkdown(normalize(input));
  return toSocialCompatible(text);
}

export function formatForInstagram(input: string) {
  const text = cleanupMarkdown(normalize(input));
  return toSocialCompatible(text);
}

export function splitByMaxLen(text: string, maxLen: number) {
  const t = normalize(text).trim();
  if (!t) return [""];
  if (maxLen <= 0) return [t];

  const blocks = t.split(/\n{2,}/g).map((b) => b.trim()).filter(Boolean);
  const chunks: string[] = [];
  let cur = "";

  const pushCur = () => {
    if (cur.trim()) chunks.push(cur.trimEnd());
    cur = "";
  };

  for (const block of blocks) {
    if (!cur) {
      if (block.length <= maxLen) {
        cur = block;
      } else {
        let s = block;
        while (s.length > maxLen) {
          chunks.push(s.slice(0, maxLen));
          s = s.slice(maxLen);
        }
        cur = s;
      }
      continue;
    }

    if (cur.length + 2 + block.length <= maxLen) {
      cur += `\n\n${block}`;
    } else {
      pushCur();
      if (block.length <= maxLen) {
        cur = block;
      } else {
        let s = block;
        while (s.length > maxLen) {
          chunks.push(s.slice(0, maxLen));
          s = s.slice(maxLen);
        }
        cur = s;
      }
    }
  }

  pushCur();
  return chunks.length ? chunks : [t];
}
