import { allDisplayFoods } from '../data/foodItems'

type RuleMap = Record<string, string[]>

export interface MealAnalysisMatch {
  foodId: string
  label: string
  emoji: string
  matchedItems: string[]
}

export interface MealAnalysis {
  menuItems: string[]
  suggestedIds: string[]
  matches: MealAnalysisMatch[]
}

const FOOD_RULES: RuleMap = {
  green_veg: [
    '시금치',
    '상추',
    '깻잎',
    '부추',
    '미나리',
    '청경채',
    '열무',
    '아욱',
    '근대',
    '케일',
    '쑥갓',
    '봄동',
  ],
  other_veg: [
    '김치',
    '깍두기',
    '오이',
    '당근',
    '브로콜리',
    '양배추',
    '무생채',
    '무침',
    '나물',
    '버섯',
    '가지',
    '호박',
    '파프리카',
    '샐러드',
  ],
  nuts: ['견과', '아몬드', '호두', '캐슈', '땅콩'],
  berries: ['블루베리', '딸기', '라즈베리', '베리'],
  beans: ['콩', '두부', '된장', '청국장', '콩나물', '순두부', '유부', '렌틸'],
  whole_grain: ['현미', '잡곡', '보리', '귀리', '흑미', '수수', '차조', '통밀', '잡곡밥', '현미밥', '보리밥'],
  fish: ['생선', '고등어', '삼치', '갈치', '연어', '참치', '임연수', '꽁치', '명태', '코다리', '가자미', '오징어'],
  poultry: ['닭', '닭고기', '오리', '치킨'],
  olive_oil: ['올리브'],
  red_meat: ['소고기', '쇠고기', '돼지', '돼지고기', '돈육', '햄', '스팸', '소시지', '비엔나', '베이컨', '떡갈비', '불고기'],
  butter: ['버터', '마가린', '쇼트닝', '크림'],
  cheese: ['치즈', '모짜렐라', '체다'],
  sweets: ['케이크', '쿠키', '아이스크림', '초코', '초콜릿', '푸딩', '젤리', '시럽', '설탕'],
  fried: ['튀김', '돈까스', '돈가스', '탕수', '커틀렛', '고로케', '핫도그', '감자튀김', '후라이드', '치킨'],
}

function splitMenu(menuText: string) {
  return menuText
    .split(/<br\s*\/?>|\n/i)
    .map((item) =>
      item
        .replace(/\([^)]*\)/g, '')
        .replace(/\d{1,2}\./g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
    .filter((item) => !/우유\s*\(?희망?\)?/.test(item))
}

export function analyzeMealMenu(menuText: string): MealAnalysis {
  const menuItems = splitMenu(menuText)
  const foodMeta = new Map(allDisplayFoods.map((food) => [food.id, food]))

  const matches = Object.entries(FOOD_RULES)
    .map(([foodId, keywords]) => {
      const matchedItems = menuItems.filter((item) => keywords.some((keyword) => item.includes(keyword)))
      const food = foodMeta.get(foodId)

      if (!food || matchedItems.length === 0) {
        return null
      }

      return {
        foodId,
        label: food.label,
        emoji: food.emoji,
        matchedItems,
      }
    })
    .filter((match): match is MealAnalysisMatch => match !== null)

  return {
    menuItems,
    suggestedIds: matches.map((match) => match.foodId),
    matches,
  }
}
