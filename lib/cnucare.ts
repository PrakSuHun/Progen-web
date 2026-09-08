// 씨엔유케어(별도 서비스) 행사 명단 교차 조회 — 전화번호가 완전히 일치하는 참여자 탐지용.
// 포도가 아닌 신청자가 씨엔유케어 행사에 참여한 이력이 있으면 어드민에서 주황색으로 표시.
// env(CNUCARE_*) 미설정 시 빈 결과 반환 — 사이트 동작 안 막음(solapi 동일 정책).
import { createClient } from '@supabase/supabase-js'

export type CnucareEvent = { name: string; date: string | null }

const digits = (s: string | null | undefined) => (s || '').replace(/\D/g, '')

/** 씨엔유케어 event_attendees 전체(수백 건 규모)를 읽어 전화번호(숫자만) → 참여 행사 목록 맵 생성 */
export async function getCnucareEventsByPhone(): Promise<Map<string, CnucareEvent[]>> {
  const url = process.env.CNUCARE_SUPABASE_URL
  const key = process.env.CNUCARE_ANON_KEY
  const map = new Map<string, CnucareEvent[]>()
  if (!url || !key) return map

  try {
    const client = createClient(url, key)
    const { data, error } = await client
      .from('event_attendees')
      .select('phone, events(name, event_date)')
      .not('phone', 'is', null)
      .limit(2000)
    if (error || !data) return map

    for (const row of data as any[]) {
      const p = digits(row.phone)
      if (p.length < 10) continue
      const ev = row.events
      if (!ev?.name) continue
      const arr = map.get(p) ?? []
      if (!arr.some((e) => e.name === ev.name)) {
        arr.push({ name: ev.name, date: ev.event_date ?? null })
      }
      map.set(p, arr)
    }
  } catch (e) {
    console.error('cnucare cross-check failed:', e)
  }
  return map
}

/** 사람 목록에 cnucare_events 주석 부착 — 포도(is_member)는 제외 */
export function annotateCnucare<T extends { phone?: string | null; is_member?: boolean }>(
  list: T[],
  map: Map<string, CnucareEvent[]>,
): (T & { cnucare_events?: CnucareEvent[] })[] {
  if (map.size === 0) return list
  return list.map((item) => {
    if (item.is_member) return item
    const events = map.get(digits(item.phone))
    return events?.length ? { ...item, cnucare_events: events } : item
  })
}
