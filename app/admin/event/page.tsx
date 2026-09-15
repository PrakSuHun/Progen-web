'use client'

// 이벤트 전용 어드민 — 행사 대시보드와 동일 UI/탭, is_event=true 행사만 집계
import { AdminDashboard } from '../dashboard/Dashboard'

export default function EventAdminPage() {
  return <AdminDashboard kind="event" />
}
