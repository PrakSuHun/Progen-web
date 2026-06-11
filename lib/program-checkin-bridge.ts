import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 현장 체크인(/checkin)에서 공식 행사 출석을 프로그램 누적 출석으로 자동 반영한다.
 * - 게스트/청강(crewId 없음)은 즉시 무시 → 기존 체크인 동작 100% 보존.
 * - 행사가 program_sessions.event_id 로 연동돼 있고, 그 크루가 해당 프로그램에
 *   '수강중'으로 등록돼 있을 때만 program_attendance 를 present=true 로 upsert.
 * - 전체를 호출부 try/catch 로 감싸므로 실패해도 체크인 흐름을 막지 않는다.
 */
export async function markProgramAttendanceFromCheckin(args: {
  supabase: SupabaseClient
  eventId: string
  crewId: number | null
}): Promise<void> {
  const { supabase, eventId, crewId } = args
  if (crewId == null) return // 게스트/청강

  // 이 행사와 연동된 프로그램 세션
  const { data: session } = await supabase
    .from('program_sessions')
    .select('id, program_id')
    .eq('event_id', eventId)
    .maybeSingle()
  if (!session) return // 공식행사 연동 안 된 회차 → 누적 출석 대상 아님

  // 그 프로그램에 '수강중'으로 등록된 크루인지
  const { data: enrollment } = await supabase
    .from('program_enrollments')
    .select('id')
    .eq('program_id', session.program_id)
    .eq('crew_id', crewId)
    .eq('status', '수강중')
    .maybeSingle()
  if (!enrollment) return // 미등록 크루의 청강

  await supabase
    .from('program_attendance')
    .upsert(
      {
        enrollment_id: enrollment.id,
        session_id: session.id,
        present: true,
        source: 'checkin',
        recorded_by: 'checkin',
        recorded_at: new Date().toISOString(),
      },
      { onConflict: 'enrollment_id,session_id' }
    )
}
