import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: members, error } = await supabase
    .from('crew_members')
    .select('id, name, phone, school, grade, age, major, path, project, gender, motivation, role, status, is_member, noshow_count, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json(members ?? [])
}