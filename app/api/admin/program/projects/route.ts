import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 프로젝트 + 산출물(spec) 셋업. { program_id, name, sort_order?, specs:[{name, deadline?, sort_order?}] }
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { program_id, name, sort_order, specs } = await request.json()
    if (!program_id || !name) {
      return NextResponse.json({ message: 'program_id와 name이 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { data: project, error } = await supabase
      .from('program_projects')
      .insert({ program_id, name, sort_order: sort_order ?? 0 })
      .select('id, name, sort_order')
      .single()
    if (error) throw error

    if (Array.isArray(specs) && specs.length > 0) {
      const rows = specs.map((s: any, i: number) => ({
        project_id: project.id,
        name: s.name,
        deadline: s.deadline ?? null,
        sort_order: s.sort_order ?? i,
      }))
      const { error: specErr } = await supabase.from('program_deliverable_specs').insert(rows)
      if (specErr) throw specErr
    }

    return NextResponse.json({ message: '프로젝트가 추가되었습니다', data: project })
  } catch (error) {
    console.error('projects POST error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

// 프로젝트 삭제(산출물·제출 기록 CASCADE)
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { project_id } = await request.json()
    if (!project_id) {
      return NextResponse.json({ message: 'project_id가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('program_projects').delete().eq('id', project_id)
    if (error) throw error
    return NextResponse.json({ message: '프로젝트가 삭제되었습니다' })
  } catch (error) {
    console.error('projects DELETE error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}
