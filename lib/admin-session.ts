// 어드민 세션 토큰 — 쿠키 값 위조 방지용 HMAC 서명 토큰.
// 형식: v1.<만료 epoch초>.<HMAC-SHA256 hex>. 서명 키는 ADMIN_PASSWORD에서 파생하므로
// 비밀번호를 바꾸면 기존 세션이 전부 무효화된다. 미들웨어(edge)·라우트(node) 양쪽에서 쓰도록 Web Crypto 사용.

export const ADMIN_SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30일

async function hmacHex(message: string): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(`progen-admin-session:${password}`),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** 로그인 성공 시 발급할 쿠키 값 */
export async function createAdminSessionToken(): Promise<string | null> {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE
  const payload = `v1.${exp}`
  const sig = await hmacHex(payload)
  return sig ? `${payload}.${sig}` : null
}

/** 쿠키 값 검증 — 서명 일치 + 만료 전이어야 true */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return false
  const exp = Number(parts[1])
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false
  const expected = await hmacHex(`v1.${parts[1]}`)
  if (!expected || expected.length !== parts[2].length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts[2].charCodeAt(i)
  return diff === 0
}
