import { useCallback, useState } from 'react'
import type { EditionSummary } from '@/actions/reports/edition-summary.action'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function usePdfExport() {
  const [exporting, setExporting] = useState(false)

  const exportEditionReport = useCallback(async (summary: EditionSummary) => {
    setExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = doc.internal.pageSize.getWidth()
      const orange = [234, 88, 12] as [number, number, number]
      const dark   = [31, 41, 55]  as [number, number, number]
      const muted  = [107, 114, 128] as [number, number, number]
      const light  = [249, 250, 251] as [number, number, number]

      let y = 0

      // ── Header ──────────────────────────────────────────────────────────
      doc.setFillColor(...orange)
      doc.rect(0, 0, W, 28, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO DE EDIÇÃO', 14, 12)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(summary.edition.name.toUpperCase(), 14, 20)
      doc.text(`Gerado em ${new Date(summary.generatedAt).toLocaleString('pt-BR')}`, W - 14, 20, { align: 'right' })

      y = 36

      // ── Info da edição ───────────────────────────────────────────────────
      doc.setTextColor(...muted)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('DETALHES DA EDIÇÃO', 14, y)
      y += 5

      doc.setFillColor(...light)
      doc.roundedRect(14, y, W - 28, 16, 2, 2, 'F')

      doc.setTextColor(...dark)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Produção: ${fmtDate(summary.edition.productionDate)}`, 18, y + 6)
      doc.text(`Preço: ${fmt(summary.edition.dogPrice)}`, 18, y + 12)
      doc.text(`Limite: ${summary.edition.limitSale} dogões`, 80, y + 6)
      doc.text(`Código: ${summary.edition.code}`, 80, y + 12)
      y += 24

      // ── Totais gerais ────────────────────────────────────────────────────
      doc.setTextColor(...muted)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAIS GERAIS', 14, y)
      y += 5

      const boxW = (W - 28 - 9) / 4
      const boxes = [
        { label: 'DOGÕES VENDIDOS', value: String(summary.totals.dogs), sub: `${summary.totals.orders} pedidos` },
        { label: 'RECEITA TOTAL',   value: fmt(summary.totals.revenue), sub: '' },
        { label: 'VIA SITE',        value: String(summary.totals.byOrigin.site.dogs), sub: fmt(summary.totals.byOrigin.site.revenue) },
        { label: 'VIA PDV',         value: String(summary.totals.byOrigin.pdv.dogs),  sub: fmt(summary.totals.byOrigin.pdv.revenue) },
      ]
      boxes.forEach((b, i) => {
        const x = 14 + i * (boxW + 3)
        doc.setFillColor(i === 0 ? 255 : i === 1 ? 240 : 245, i === 0 ? 247 : i === 1 ? 253 : 249, i === 0 ? 237 : i === 1 ? 244 : 251)
        doc.roundedRect(x, y, boxW, 20, 2, 2, 'F')
        doc.setTextColor(...muted)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(b.label, x + 3, y + 5)
        doc.setTextColor(...dark)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text(b.value, x + 3, y + 13)
        if (b.sub) {
          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(...muted)
          doc.text(b.sub, x + 3, y + 18)
        }
      })
      y += 28

      // ── Tipo de entrega ──────────────────────────────────────────────────
      doc.setTextColor(...muted)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('POR TIPO DE ENTREGA', 14, y)
      y += 5

      autoTable(doc, {
        startY: y,
        head: [['Tipo', 'Pedidos', 'Dogões']],
        body: [
          ['Retirada', summary.deliverySummary.pickup.orders,   summary.deliverySummary.pickup.dogs],
          ['Entrega',  summary.deliverySummary.delivery.orders, summary.deliverySummary.delivery.dogs],
          ['Doacao',   summary.deliverySummary.donate.orders,   summary.deliverySummary.donate.dogs],
        ],
        theme: 'grid',
        headStyles: { fillColor: orange, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: dark },
        alternateRowStyles: { fillColor: light },
        margin: { left: 14, right: 14 },
        tableWidth: W - 28,
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
      })

      y = (doc as any).lastAutoTable.finalY + 10

      // ── Ranking por vendedor ─────────────────────────────────────────────
      doc.setTextColor(...muted)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`RANKING POR VENDEDOR — SITE (${summary.rankingBySeller.length} vendedores)`, 14, y)
      y += 5

      const medals = ['1o', '2o', '3o']
      const siteDogs = summary.totals.byOrigin.site.dogs

      autoTable(doc, {
        startY: y,
        head: [['#', 'Vendedor', 'Tag', 'Pedidos', 'Dogões', 'Receita', '% Dogs']],
        body: summary.rankingBySeller.map((s) => [
          medals[s.position - 1] ?? `${s.position}º`,
          s.name,
          `@${s.tag}`,
          s.orders,
          s.dogs,
          fmt(s.revenue),
          siteDogs > 0 ? `${((s.dogs / siteDogs) * 100).toFixed(1)}%` : '0%',
        ]),
        theme: 'striped',
        headStyles: { fillColor: dark, textColor: [255,255,255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: dark },
        alternateRowStyles: { fillColor: light },
        margin: { left: 14, right: 14 },
        tableWidth: W - 28,
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center', fontStyle: 'bold' },
          5: { halign: 'right' },
          6: { halign: 'right' },
        },
        didParseCell: (data) => {
          // Destaca o 1º lugar
          if (data.row.index === 0 && data.section === 'body') {
            data.cell.styles.fillColor = [255, 251, 235]
          }
        },
      })

      // ── Footer ───────────────────────────────────────────────────────────
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(...muted)
        doc.text(
          `Dogão do Pastor • ${summary.edition.name} • Página ${i} de ${pageCount}`,
          W / 2, doc.internal.pageSize.getHeight() - 6,
          { align: 'center' }
        )
      }

      const filename = `relatorio-${summary.edition.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
      doc.save(filename)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert(`Erro ao gerar PDF: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setExporting(false)
    }
  }, [])

  return { exportEditionReport, exporting }
}
