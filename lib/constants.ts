// Schools
export const SCHOOLS = [
  '서울대학교',
  '연세대학교',
  '고려대학교',
  '이화여자대학교',
  '카이스트',
  '포항공과대학교',
  '기타',
]

// Grades
export const GRADES = [
  '1학년',
  '2학년',
  '3학년',
  '4학년',
  '대학원생',
  '기타',
]

// Paths (how they found about the event)
export const PATHS = [
  'SNS',
  '친구 추천',
  '검색',
  '포스터/전단',
  '기타',
]

// Projects
export const PROJECTS = [
  '프로젝트 A',
  '프로젝트 B',
  '프로젝트 C',
  '프로젝트 D',
]

// Genders
export const GENDERS = [
  '남성',
  '여성',
  '선택 안함',
]

// Feedback Tags - Good
export const GOOD_TAGS = [
  '좋은 강사진',
  '실습 경험',
  '네트워킹',
  '유용한 내용',
  '좋은 분위기',
]

// Feedback Tags - Bad
export const BAD_TAGS = [
  '시간이 부족했음',
  '내용이 어려웠음',
  '강사 설명이 부족',
  '시설 부족',
  '기타',
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
