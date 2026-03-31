import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_date, is_mandatory, created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { title, event_date, is_mandatory } = await request.json()
    if (!title || !event_date) {
      return NextResponse.json({ message: '제목과 날짜를 입력해주세요' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('events')
      .insert([{ title, event_date, is_mandatory: is_mandatory ?? false }])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ message: '이벤트가 생성되었습니다', data })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}
