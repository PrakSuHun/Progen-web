// 겨울방학 AX 프로젝트 신청 (2026-11-05)
// - 11/7 행사 참석자는 /ax 간편 신청(이름+연락처) → 11/7 신청 정보로 AX 행사 신청 건 생성
// - 미참석자 대상 홍보(11/9~)는 기존 행사신청폼(/event-reg) — 11/8부터 getActivePublicEventId()가 AX 행사로 연결
export const AX_EVENT_ID = '30021b5d-a84a-417d-b30e-f12da42ad5cc' // 겨울방학 AX 프로젝트 (2026-11-18)
export const AX_SOURCE_EVENT_ID = 'bedf90c7-eaaf-4c77-a1fe-8a18d55e2953' // 나만의 AI 비서 만들기 클래스 (2026-11-07)

// 크루 신청 일시 중단 (true면 /apply 폼 대신 안내 문구, /api/apply 403)
export const CREW_APPLY_CLOSED = true
