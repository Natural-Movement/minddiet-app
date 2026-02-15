// 마인드 다이어트 음식 목록 (업그레이드 버전)
// 이제 각 음식마다 주간 목표 횟수와 0/0.5/1점 기준이 포함돼요

// ===== 권장 식품 10종 =====
export const goodFoods = [
  {
    id: 'green_veg', label: '녹색 잎채소', emoji: '🥬',
    example: '시금치, 케일, 상추',
    weeklyTarget: 6,       // 주 6회 이상이면 1점
    scoring: { zero: 2, half: [3, 5], full: 6 },
    // 0점: ≤2회, 0.5점: 3~5회, 1점: ≥6회
  },
  {
    id: 'other_veg', label: '기타 채소', emoji: '🥕',
    example: '브로콜리, 당근, 파프리카',
    weeklyTarget: 7,
    scoring: { zero: 4, half: [5, 6], full: 7 },
  },
  {
    id: 'nuts', label: '견과류', emoji: '🥜',
    example: '아몬드, 호두, 캐슈넛',
    weeklyTarget: 5,
    scoring: { zero: 0, half: [1, 4], full: 5 },
  },
  {
    id: 'berries', label: '베리류', emoji: '🫐',
    example: '블루베리, 딸기, 라즈베리',
    weeklyTarget: 2,
    scoring: { zero: 0, half: [1, 1], full: 2 },
  },
  {
    id: 'beans', label: '콩류', emoji: '🫘',
    example: '두부, 렌틸콩, 검은콩',
    weeklyTarget: 4,
    scoring: { zero: 0, half: [1, 3], full: 4 },
  },
  {
    id: 'whole_grain', label: '통곡물', emoji: '🌾',
    example: '현미, 귀리, 통밀빵',
    weeklyTarget: 21,
    scoring: { zero: 6, half: [7, 13], full: 21 },
    // 하루 3회 = 주 21회 기준
  },
  {
    id: 'fish', label: '생선', emoji: '🐟',
    example: '연어, 고등어, 참치',
    weeklyTarget: 1,
    scoring: { zero: 0, half: [0, 0], full: 1 },
    // 논문 기준: 거의 안 먹음=0, 1~3회/월=0.5, ≥1회/주=1
    // 주간 앱에서는 간소화: 0회=0, 1회=1
  },
  {
    id: 'poultry', label: '가금류', emoji: '🍗',
    example: '닭가슴살, 오리, 칠면조',
    weeklyTarget: 2,
    scoring: { zero: 0, half: [1, 1], full: 2 },
  },
  {
    id: 'olive_oil', label: '올리브유', emoji: '🫒',
    example: '엑스트라 버진 올리브유',
    weeklyTarget: 7,
    scoring: { zero: 0, half: [1, 6], full: 7 },
    // 논문: 주요 오일이면 1점, 아니면 0점. 앱에서는 사용 횟수로 추적
  },
  {
    id: 'wine', label: '와인', emoji: '🍷',
    example: '레드와인 1잔 (하루 1잔)',
    weeklyTarget: 7,
    scoring: { zero: 0, half: [1, 6], full: 7 },
    // 논문: 하루 1잔=1점, 안 마시거나 1잔 초과=0점
    // 와인은 특수해서 초과도 안 좋음 (나중에 로직에서 처리)
  },
]

// ===== 제한 식품 5종 =====
// 제한 식품은 "미만"이 기준! (이하가 아님)
export const badFoods = [
  {
    id: 'red_meat', label: '붉은 육류', emoji: '🥩',
    example: '소고기, 돼지고기, 양고기',
    weeklyLimit: 4,        // 4회 미만이면 1점
    scoring: { zero: 7, half: [4, 6], full: 3 },
    // 0점: ≥7회, 0.5점: 4~6회, 1점: <4회(=3회 이하)
  },
  {
    id: 'butter', label: '버터/마가린', emoji: '🧈',
    example: '버터, 마가린, 쇼트닝',
    weeklyLimit: 7,
    scoring: { zero: 14, half: [7, 13], full: 6 },
    // 논문: >2T/일=0, 1~2T/일=0.5, <1T/일=1
    // 주간: ≥14회=0, 7~13회=0.5, <7회(=6회 이하)=1
  },
  {
    id: 'cheese', label: '치즈', emoji: '🧀',
    example: '체다, 모짜렐라, 크림치즈',
    weeklyLimit: 1,
    scoring: { zero: 7, half: [1, 6], full: 0 },
    // 0점: ≥7회, 0.5점: 1~6회, 1점: <1회(=0회)
  },
  {
    id: 'sweets', label: '당분/디저트', emoji: '🍰',
    example: '케이크, 쿠키, 아이스크림',
    weeklyLimit: 5,
    scoring: { zero: 7, half: [5, 6], full: 4 },
    // 0점: ≥7회, 0.5점: 5~6회, 1점: <5회(=4회 이하)
  },
  {
    id: 'fried', label: '튀김/패스트푸드', emoji: '🍟',
    example: '치킨, 감자튀김, 햄버거',
    weeklyLimit: 1,
    scoring: { zero: 4, half: [1, 3], full: 0 },
    // 0점: ≥4회, 0.5점: 1~3회, 1점: <1회(=0회)
  },
]

export const allFoods = [...goodFoods, ...badFoods]

// 주간 횟수로 MIND 점수(0, 0.5, 1) 계산하는 함수
export function calcItemScore(food, count) {
  const s = food.scoring

  // 권장 식품: 많이 먹을수록 좋음
  if (food.weeklyTarget !== undefined) {
    if (count >= s.full) return 1
    if (count >= s.half[0] && count <= s.half[1]) return 0.5
    return 0
  }

  // 제한 식품: 적게 먹을수록 좋음
  if (food.weeklyLimit !== undefined) {
    if (count <= s.full) return 1
    if (count >= s.half[0] && count <= s.half[1]) return 0.5
    return 0
  }

  return 0
}
