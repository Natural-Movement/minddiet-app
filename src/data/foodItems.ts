// 마인드 다이어트 음식 목록 (업그레이드 버전)
// 이제 각 음식마다 주간 목표 횟수와 0/0.5/1점 기준이 포함돼요

export interface ScoringCriteria {
  zero: number;
  half: [number, number];
  full: number;
}

export interface FoodItem {
  id: string;
  label: string;
  emoji: string;
  example: string;
  weeklyTarget?: number;
  weeklyLimit?: number;
  scoring: ScoringCriteria;
}

// ===== 건강 음료 (통합 1점) =====
export interface BeverageItem {
  id: string;
  label: string;
  emoji: string;
  example: string;
  dailyTarget: number; // 하루 목표 잔 수
}

export const beverageFoods: BeverageItem[] = [
  {
    id: 'coffee', label: '종이 필터 커피', emoji: '☕',
    example: '드립 커피, 핸드드립',
    dailyTarget: 2, // 하루 2잔
  },
  {
    id: 'green_tea', label: '녹차/말차', emoji: '🍵',
    example: '녹차, 말차 라떼 (무가당)',
    dailyTarget: 3, // 하루 3잔
  },
  {
    id: 'grape_juice', label: '무가당 포도즙', emoji: '🍇',
    example: '무가당 100% 포도즙',
    dailyTarget: 1, // 하루 1잔
  },
]

// ===== 권장 식품 9종 (와인 제거) =====
export const goodFoods: FoodItem[] = [
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
]

// ===== 제한 식품 5종 =====
// 제한 식품은 "미만"이 기준! (이하가 아님)
export const badFoods: FoodItem[] = [
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

// allFoods: 기존 권장 + 제한 식품 (음료 제외, 기존 calcItemScore 방식으로 계산)
export const allFoods: FoodItem[] = [...goodFoods, ...badFoods]

// allDisplayFoods: LogView UI 표시용 (음료 포함 전체 목록)
export const allDisplayFoods: (FoodItem | BeverageItem)[] = [...goodFoods, ...beverageFoods as any[], ...badFoods]

// 주간 횟수로 MIND 점수(0, 0.5, 1) 계산하는 함수
export function calcItemScore(food: FoodItem, count: number): number {
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

// 건강 음료 통합 점수 계산 (7일 날짜별 카운트 배열 필요)
// dailyCounts: 각 날짜의 { coffee: n, green_tea: n, grape_juice: n } 배열 (7일)
// 하루에 어떤 음료든 dailyTarget 이상 마시면 그 날 "충족"
// 7일 충족 → 1점, 4~6일 → 0.5점, 0~3일 → 0점
export function calcBeverageScore(dailyCounts: Record<string, number>[]): number {
  let fulfilledDays = 0

  for (const dayCounts of dailyCounts) {
    const met = beverageFoods.some(bev => (dayCounts[bev.id] || 0) >= bev.dailyTarget)
    if (met) fulfilledDays++
  }

  if (fulfilledDays >= 7) return 1
  if (fulfilledDays >= 4) return 0.5
  return 0
}
