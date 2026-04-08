// Schools (대전 소재 대학교)
export const SCHOOLS = [
  '충남대학교',
  '한남대학교',
  '배재대학교',
  '대전대학교',
  '우송대학교',
  '목원대학교',
  '한밭대학교',
  'KAIST',
  '을지대학교',
  '대덕대학교',
  '충청대학교',
  '대전보건대학교',
  '혜천대학교',
]

// Grades
export const GRADES = [
  '1학년',
  '2학년',
  '3학년',
  '4학년',
  '휴학',
  '졸업유예',
]

// Paths (알게 된 경로)
export const PATHS = [
  '학과/학교 공지사항 및 단톡방',
  '에브리타임',
  '학교 내 오프라인 포스터/현수막',
  '지인 추천(선배·후배·동기)',
  '대외활동 플랫폼(링커리어·캠퍼스픽 등)',
  '인스타그램',
]

// Projects (관심 프로젝트)
export const PROJECTS = [
  'AI 가성비 공부법',
  'AI 자동화 시스템 만들기',
  'AI 영상·음악 콘텐츠 제작',
  'AI 나만의 캐릭터 굿즈 제작',
  'AI로 수익화하기',
  '모두 관심있어요',
]

// Genders
export const GENDERS = [
  '남성',
  '여성',
]

// Feedback Tags - Good
export const GOOD_TAGS = [
  '좋은 강사진',
  '실습 경험',
  '네트워킹',
  '유용한 내용',
  '좋은 분위기',
  '없음',
]

// Feedback Tags - Bad
export const BAD_TAGS = [
  '시간이 부족했음',
  '내용이 어려웠음',
  '강사 설명이 부족',
  '시설 부족',
  '기타',
  '없음',
]

// Feedback Score Labels
export const SCORE_LABELS = [
  '매우 불만족',
  '불만족',
  '보통',
  '만족',
  '매우 만족',
]

// Phone validation and formatting
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length === 10 || cleanPhone.length === 11
}

export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 10) {
    return `${cleanPhone.slice(0, 2)}-${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`
  }
  if (cleanPhone.length === 11) {
    return `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 7)}-${cleanPhone.slice(7)}`
  }
  return phone
}
