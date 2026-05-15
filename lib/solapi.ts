import crypto from 'crypto'
import { createAdminClient } from './supabase-admin'

const SOLAPI_SEND_URL = 'https://api.solapi.com/messages/v4/send'

/**
 * 카카오 알림톡 템플릿 (솔라피 채널 KA01PF260511054914846rCGGdEqH9tS / searchId 'progen').
 * code = 솔라피 비즈센터에 등록된 실제 templateId.
 * 검수 상태(2026-05-11): #5만 APPROVED, 나머지 9종은 INSPECTING(검수중) — 검수 통과 전엔 발송 시 솔라피가 거부.
 */
export const ALIMTALK = {
  EVENT_REG_RECEIVED: { code: 'KA01TP26051106373464071STWgjtSAK', name: '행사 신청 접수' },      // 1
  // 2 참석 확정 — 게스트용(보증금 환불 안내 포함)
  EVENT_CONFIRMED:    { code: 'KA01TP260511064819169WuinqHjdJcx', name: '행사 참석 확정 (게스트)' },
  // 2 참석 확정 — 크루용(보증금 문구 없음). 같은 변수 셋 사용
  EVENT_CONFIRMED_CREW: { code: 'KA01TP260512222214758QYG80poi9FS', name: '행사 참석 확정 (크루)' },
  CREW_CONFIRMED:     { code: 'KA01TP260511070701744h8gIXOphWEW', name: '크루원 신청 접수' },    // 3
  EVENT_D1_NOTICE:    { code: 'KA01TP260511071006653FkF3Kf1v8lW', name: '행사 전 공지' },        // 4
  REG_CANCELLED:      { code: 'KA01TP260511072253259HLsKXmMYVoG', name: '신청 취소 확인' },      // 5
  CHECKIN_WITH_TEAM:  { code: 'KA01TP260511073547316F1HdnAUi1RJ', name: '현장 출석 완료 + 팀 안내' }, // 6
  CHECKIN_NO_TEAM:    { code: 'KA01TP260511075330965NCintRaUSWU', name: '팀 미배정' },           // 7
  EVENT_CHANGED:      { code: 'KA01TP260511073928887bmEyE8XReNZ', name: '행사 일정/장소 변경' }, // 8
  NOSHOW_WARNING:     { code: 'KA01TP2605110744476078SNWeTQFA9a', name: '노쇼 경고 (1회)' },     // 9
  CREW_REVOKED:       { code: 'KA01TP260511074559176oBaEuf8Dkaq', name: '크루 자격 박탈' },      // 10
} as const

export type AlimtalkTemplate = (typeof ALIMTALK)[keyof typeof ALIMTALK]

export type SendTarget = {
  crewId?: string | number | null
  guestId?: string | null
  registrationId?: string | null
  eventId?: string | null
}

export type AlimtalkSendResult = {
  ok: boolean
  /** 환경변수 미설정·잘못된 번호 등으로 발송 자체를 건너뛴 경우 */
  skipped?: boolean
  reason?: string
  messageId?: string
  error?: string
}

function normPhone(phone: string): string {
  return (phone || '').replace(/\D/g, '')
}

function authHeader(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString()
  const salt = crypto.randomBytes(32).toString('hex')
  const signature = crypto.createHmac('sha256', apiSecret).update(date + salt).digest('hex')
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
}

function getConfig() {
  return {
    apiKey: process.env.SOLAPI_API_KEY,
    apiSecret: process.env.SOLAPI_API_SECRET,
    pfId: process.env.SOLAPI_PFID,
    from: process.env.SOLAPI_SENDER_PHONE,
  }
}

async function logSend(params: {
  template: AlimtalkTemplate
  toPhone: string
  target: SendTarget
  ok: boolean
  messageId?: string
  error?: string
  variables: Record<string, string>
}) {
  try {
    const supabase = createAdminClient()
    await supabase.from('alimtalk_logs').insert({
      template_code: params.template.code,
      template_name: params.template.name,
      to_phone: params.toPhone,
      crew_id: params.target.crewId != null ? params.target.crewId : null,
      guest_id: params.target.guestId ?? null,
      registration_id: params.target.registrationId ?? null,
      event_id: params.target.eventId ?? null,
      status: params.ok ? 'sent' : 'failed',
      solapi_message_id: params.messageId ?? null,
      error: params.error ?? null,
      variables: params.variables,
    })
  } catch (e) {
    console.error('alimtalk_logs insert failed:', e)
  }
}

/**
 * 카카오 알림톡 1건 발송 + alimtalk_logs 기록.
 * - 환경변수가 아직 안 채워졌으면(검수 대기 등) 조용히 skip → 사이트 동작은 막지 않음.
 * - 변수 값이 빈 문자열이면 카카오가 거부하므로 공백 한 칸으로 방어.
 * - 발송 실패해도 throw하지 않고 결과 객체로만 알림 (호출부 흐름을 깨지 않음).
 */
export async function sendAlimtalk(
  template: AlimtalkTemplate,
  toPhone: string,
  variables: Record<string, string>,
  target: SendTarget = {},
): Promise<AlimtalkSendResult> {
  const to = normPhone(toPhone)
  if (!to || to.length < 10) return { ok: false, skipped: true, reason: 'invalid_phone' }

  const { apiKey, apiSecret, pfId, from } = getConfig()
  if (!apiKey || !apiSecret || !pfId || !from) {
    return { ok: false, skipped: true, reason: 'solapi_not_configured' }
  }

  const safeVars: Record<string, string> = {}
  for (const [k, v] of Object.entries(variables)) {
    const s = (v ?? '').toString().trim()
    safeVars[k] = s || ' '
  }

  let ok = false
  let messageId: string | undefined
  let error: string | undefined
  try {
    const res = await fetch(SOLAPI_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: authHeader(apiKey, apiSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          to,
          from: normPhone(from),
          kakaoOptions: {
            pfId,
            templateId: template.code,
            variables: safeVars,
            disableSms: true,
          },
        },
      }),
    })
    const json: Record<string, unknown> = await res.json().catch(() => ({}))
    messageId = typeof json.messageId === 'string' ? json.messageId : undefined
    const statusCode = typeof json.statusCode === 'string' ? json.statusCode : undefined
    ok = res.ok && !!statusCode && statusCode.startsWith('2')
    if (!ok) {
      error =
        (typeof json.statusMessage === 'string' && json.statusMessage) ||
        (typeof json.errorMessage === 'string' && json.errorMessage) ||
        `HTTP ${res.status}`
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
    ok = false
  }

  await logSend({ template, toPhone: to, target, ok, messageId, error, variables: safeVars })

  return ok ? { ok: true, messageId } : { ok: false, error }
}

/** 해당 (template, 사람)에게 이미 'sent' 로그가 있는지 — 일괄 발송에서 중복 방지용 */
export async function alreadySent(
  templateCode: string,
  target: { crewId?: string | number | null; guestId?: string | null; registrationId?: string | null },
): Promise<boolean> {
  const supabase = createAdminClient()
  let q = supabase
    .from('alimtalk_logs')
    .select('id')
    .eq('template_code', templateCode)
    .eq('status', 'sent')
    .limit(1)
  if (target.registrationId) q = q.eq('registration_id', target.registrationId)
  else if (target.crewId != null) q = q.eq('crew_id', target.crewId)
  else if (target.guestId) q = q.eq('guest_id', target.guestId)
  else return false
  const { data } = await q
  return Array.isArray(data) && data.length > 0
}

// ───────────── 행사 정보 → 알림톡 변수 ─────────────

export type EventRow = {
  id: string
  title: string | null
  event_date: string | null
  location?: string | null
  entry_time?: string | null
  materials?: string | null
  program_detail?: string | null
  kakao_chat_url?: string | null
}

const FALLBACK = '추후 안내'
const FALLBACK_CHAT = '채팅방 공지 참고'

/** #{프로그램명} 변수 값 — 행사명이 도드라지게 낫표(「」)로 감싼다. 비어 있으면 공백 한 칸. */
export function programLabel(title: string | null | undefined): string {
  const t = (title ?? '').toString().trim()
  return t ? `「${t}」` : ' '
}

/**
 * 오픈채팅 버튼 변수(#{url}) 값 — 카카오 템플릿 버튼 URL이 `https://open.kakao.com/o/#{url}` 형태라
 * 전체 링크가 아니라 코드 조각(`gXySOpui`)만 넘겨야 한다.
 * 어드민에서 전체 URL을 넣어도, 코드만 넣어도 둘 다 처리.
 */
export function openChatCode(input: string | null | undefined): string {
  if (!input) return ''
  const s = input.trim()
  const m = s.match(/open\.kakao\.com\/o\/([^/?#\s]+)/i)
  if (m) return m[1]
  // URL 형태가 아니면(이미 코드만 넣었거나 다른 형식) 스킴/쿼리 제거 후 마지막 경로 조각
  return s.replace(/^https?:\/\//i, '').replace(/[?#].*$/, '').split('/').filter(Boolean).pop() ?? ''
}

/** events 행을 알림톡 변수에 쓸 필드만 골라서 조회 */
export async function loadEventRow(eventId: string): Promise<EventRow | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('events')
    .select('id, title, event_date, location, entry_time, materials, program_detail, kakao_chat_url')
    .eq('id', eventId)
    .maybeSingle()
  return (data as EventRow) ?? null
}

/** 행사 일시를 한국 시간대 기준 한글로 포맷 (예: "2026년 5월 10일 토 오후 2:00") */
export function formatEventDateKo(input: string | Date | null | undefined): string {
  if (!input) return FALLBACK
  const d = new Date(input)
  if (isNaN(d.getTime())) return FALLBACK
  try {
    const datePart = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    }).format(d)
    const timePart = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(d)
    return `${datePart} ${timePart}`
  } catch {
    return d.toISOString()
  }
}

/** 참석 확정(2번) 알림톡을 자동 발송해도 되는지 — 5개 행사 정보가 모두 채워졌을 때만 */
export function eventConfirmReady(ev: EventRow | null | undefined): boolean {
  if (!ev) return false
  return !!(ev.event_date && ev.location && ev.entry_time && ev.materials && ev.program_detail && ev.kakao_chat_url)
}

/** 1번 행사 신청 접수 — 장소가 비어도 fallback으로 그냥 보냄 */
export function varsEventRegReceived(ev: EventRow, name: string): Record<string, string> {
  return {
    '#{이름}': name,
    '#{프로그램명}': programLabel(ev.title),
    '#{일시}': formatEventDateKo(ev.event_date),
    '#{장소}': ev.location || FALLBACK,
  }
}

/** 2번 행사 참석 확정 — eventConfirmReady가 true일 때만 자동 발송. 버튼 변수 #{url}(오픈채팅 코드) 포함 */
export function varsEventConfirmed(ev: EventRow, name: string): Record<string, string> {
  return {
    '#{이름}': name,
    '#{프로그램명}': programLabel(ev.title),
    '#{일시}': formatEventDateKo(ev.event_date),
    '#{입장시간}': ev.entry_time || FALLBACK,
    '#{장소}': ev.location || FALLBACK,
    '#{준비물}': ev.materials || FALLBACK_CHAT,
    '#{진행내용}': ev.program_detail || FALLBACK_CHAT,
    '#{url}': openChatCode(ev.kakao_chat_url),
  }
}

/** 4번 행사 전 공지(D-1) — 운영진이 수동 발송. 비면 fallback. 버튼 변수 #{url} 포함 */
export function varsEventD1Notice(ev: EventRow, name: string): Record<string, string> {
  return {
    '#{이름}': name,
    '#{프로그램명}': programLabel(ev.title),
    '#{일시}': formatEventDateKo(ev.event_date),
    '#{입장시간}': ev.entry_time || FALLBACK,
    '#{장소}': ev.location || FALLBACK,
    '#{준비물}': ev.materials || FALLBACK_CHAT,
    '#{url}': openChatCode(ev.kakao_chat_url),
  }
}

/** 6번 현장 출석 + 팀 안내 */
export function varsCheckinWithTeam(name: string, eventTitle: string | null, teamName: string): Record<string, string> {
  return { '#{이름}': name, '#{프로그램명}': programLabel(eventTitle), '#{팀명}': teamName }
}

/** 7번 팀 미배정 출석 */
export function varsCheckinNoTeam(name: string, eventTitle: string | null): Record<string, string> {
  return { '#{이름}': name, '#{프로그램명}': programLabel(eventTitle) }
}
