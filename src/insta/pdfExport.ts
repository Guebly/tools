import { jsPDF } from "jspdf";
import type { ProfileData, FeedAnalysis } from "./types";

export interface PDFProposalOptions {
  profile: ProfileData;
  analysis: FeedAnalysis | null;
  currentFeedScreenshot?: string; // base64 data URL
  optimizedFeedScreenshot?: string;
}

export async function exportPDFProposal(options: PDFProposalOptions): Promise<void> {
  const { profile, analysis } = options;
  const doc = new jsPDF();

  // ═══════════════════════════════════════════════════════════════
  // PÁGINA 1: CAPA
  // ═══════════════════════════════════════════════════════════════

  // Background gradient (simulado com retângulos)
  doc.setFillColor(220, 39, 67);
  doc.rect(0, 0, 210, 297, "F");

  // Logo Guebly (simulado com texto)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Guebly", 20, 30);

  // Título
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  const username = profile.username || "Cliente";
  doc.text(`Proposta para`, 20, 80);
  doc.text(`@${username}`, 20, 95);

  // Subtítulo
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Análise de Performance do Instagram", 20, 110);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 20, 118);

  // Footer
  doc.setFontSize(10);
  doc.text("Powered by InstaPreview · guebly.com.br", 20, 285);

  // ═══════════════════════════════════════════════════════════════
  // PÁGINA 2: ANÁLISE ATUAL
  // ═══════════════════════════════════════════════════════════════

  doc.addPage();

  // Reset colors
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, "F");
  doc.setTextColor(0, 0, 0);

  // Título
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Análise do Perfil Atual", 20, 25);

  // Informações do perfil
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Username: @${profile.username || "não definido"}`, 20, 40);
  doc.text(`Nome: ${profile.displayName || "não definido"}`, 20, 48);
  doc.text(`Seguidores: ${profile.followers || "0"}`, 20, 56);
  doc.text(`Publicações: ${profile.posts || "0"}`, 20, 64);

  // Análise com IA (se disponível)
  if (analysis) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Score de Harmonia Visual", 20, 85);

    // Score circle (simplified)
    const harmony = analysis.harmony;
    doc.setFillColor(102, 126, 234);
    doc.circle(40, 105, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(String(harmony), 33, 110);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`/100`, 50, 110);

    // Detalhes
    doc.text(`Paleta: ${analysis.palette}`, 70, 100);
    doc.text(`Estética: ${analysis.aesthetic}`, 70, 108);

    // Recomendações
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Recomendações", 20, 135);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let y = 145;
    analysis.recommendations.forEach((rec, idx) => {
      const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6;
    });
  } else {
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Adicione fotos ao feed para gerar análise com IA", 20, 85);
  }

  // ═══════════════════════════════════════════════════════════════
  // PÁGINA 3: PROPOSTA DE VALOR
  // ═══════════════════════════════════════════════════════════════

  doc.addPage();
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Como a Guebly Pode Ajudar", 20, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const benefits = [
    {
      title: "Análise Inteligente",
      desc: "Utilizamos IA para analisar a harmonia visual do seu feed e identificar oportunidades de melhoria."
    },
    {
      title: "Estratégia de Conteúdo",
      desc: "Desenvolvemos um calendário editorial personalizado baseado no comportamento da sua audiência."
    },
    {
      title: "Crescimento Orgânico",
      desc: "Técnicas comprovadas para aumentar alcance e engajamento sem depender de anúncios pagos."
    },
    {
      title: "Acompanhamento Mensal",
      desc: "Relatórios detalhados e reuniões estratégicas para garantir resultados consistentes."
    }
  ];

  let yPos = 45;
  benefits.forEach((benefit) => {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`• ${benefit.title}`, 20, yPos);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(benefit.desc, 165);
    doc.text(descLines, 25, yPos + 7);

    yPos += 7 + descLines.length * 5 + 10;
  });

  // CTA
  doc.setFillColor(220, 39, 67);
  doc.roundedRect(20, 240, 170, 30, 5, 5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Agende uma Consulta Gratuita", 105, 252, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("guebly.com.br/consultoria", 105, 262, { align: "center" });

  // Footer with results promise
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text("✅ Aumento médio de 127% em engajamento · 📊 +200 marcas atendidas · 🚀 Resultados em 60 dias", 105, 280, { align: "center" });

  // ═══════════════════════════════════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════════════════════════════════

  const filename = `proposta-${profile.username || "instagram"}-${Date.now()}.pdf`;
  doc.save(filename);
}
