'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ReportPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">로딩 중...</p></div>}><ReportContent /></Suspense>
}

function ReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reportId = searchParams.get('id')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reportId) return
    fetch(`/api/admin/ai-report?id=${reportId}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setReport(data.report)
        }
      })
      .finally(() => setLoading(false))
  }, [reportId])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">로딩 중...</p></div>
  if (!report) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">보고서를 찾을 수 없습니다</p></div>

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 바 (인쇄 시 숨김) */}
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm font-medium">← 돌아가기</button>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition-colors">PDF 출력</button>
        </div>
      </div>

      {/* 보고서 본문 */}
      <div className="max-w-[800px] mx-auto px-8 py-10 print:px-0 print:py-0">
        <style jsx global>{`
          @media print {
            @page { margin: 20mm 15mm; size: A4; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .report-body h1, .report-body h2, .report-body h3 { page-break-after: avoid; }
            .report-body table, .report-body .highlight, .report-body .summary-box { page-break-inside: avoid; }
          }
          .report-body { font-family: 'Pretendard Variable', sans-serif; color: #333; line-height: 1.8; }
          .report-body h1 { font-size: 22px; font-weight: 800; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px; margin-top: 40px; margin-bottom: 16px; }
          .report-body h2 { font-size: 17px; font-weight: 700; color: #0ea5e9; margin-top: 32px; margin-bottom: 12px; }
          .report-body h3 { font-size: 14px; font-weight: 700; color: #374151; margin-top: 20px; margin-bottom: 8px; }
          .report-body p { margin-bottom: 8px; font-size: 13px; }
          .report-body table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
          .report-body th { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-weight: 600; color: #0ea5e9; }
          .report-body td { border: 1px solid #e2e8f0; padding: 8px 12px; }
          .report-body tr:nth-child(even) { background: #fafafa; }
          .report-body ul, .report-body ol { padding-left: 20px; margin: 8px 0; font-size: 13px; }
          .report-body li { margin-bottom: 4px; }
          .report-body strong { color: #1e293b; }
          .report-body hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
          .report-body .highlight { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 12px 0; }
          .report-body .summary-box { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0; }
          .report-body .summary-item { flex: 1; min-width: 120px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
          .report-body .summary-item .value { font-size: 24px; font-weight: 800; }
          .report-body .summary-item .label { font-size: 11px; color: #64748b; margin-top: 4px; }
        `}</style>
        <div className="report-body" dangerouslySetInnerHTML={{ __html: report.content }} />
      </div>
    </div>
  )
}
