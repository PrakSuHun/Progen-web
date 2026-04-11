import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 보고서 목록 조회
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })

  const eventId = request.nextUrl.searchParams.get('eventId')
  const reportId = request.nextUrl.searchParams.get('id')
  const supabase = createAdminClient()

  // 단건 조회
  if (reportId) {
    const { data, error } = await supabase.from('reports').select('*').eq('id', reportId).single()
    if (error) return NextResponse.json({ message: '보고서를 찾을 수 없습니다' }, { status: 404 })
    return NextResponse.json({ report: data })
  }

  let query = supabase.from('reports').select('id, event_id, title, mode, content, created_at').order('created_at', { ascending: false })
  if (eventId) query = query.eq('event_id', eventId)

  const { data, error } = await query
  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json({ reports: data ?? [] })
}

// 보고서 저장
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })

  try {
    const { event_id, title, mode, content } = await request.json()
    if (!event_id || !title || !content) return NextResponse.json({ message: '필수 항목이 누락되었습니다' }, { status: 400 })

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reports')
      .insert([{ event_id, title, mode: mode || 'general', content }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ message: '보고서가 저장되었습니다', report: data })
  } catch (error) {
    console.error('report save error:', error)
    return NextResponse.json({ message: '저장 중 오류가 발생했습니다' }, { status: 500 })
  }
}

// 보고서 삭제
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ message: 'id가 필요합니다' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (error) {
    console.error('report delete error:', error)
    return NextResponse.json({ message: '삭제 중 오류가 발생했습니다' }, { status: 500 })
  }
}
