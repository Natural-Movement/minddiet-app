// 음식 체크리스트 컴포넌트
// 권장 식품 10개 + 제한 식품 5개를 묶어서 보여주는 부품
// 위에서 만든 FoodCard를 여러 개 나열하는 역할이에요

import FoodCard from './FoodCard'
import { goodFoods, badFoods } from '../data/foodItems'

// checkedItems = 현재 체크된 음식 id 목록 (예: ['nuts', 'fish'])
// onToggle = 카드 터치하면 실행되는 함수
export default function FoodChecklist({ checkedItems, onToggle }) {
  return (
    <section className="mb-6 space-y-6">

      {/* ===== 권장 식품 섹션 ===== */}
      <div>
        {/* 제목 + 카운터 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-green-800">
            ✅ 권장 식품
          </h2>
          {/* 10개 중 몇 개 체크했는지 보여줌 */}
          <span className="text-base font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {goodFoods.filter(f => checkedItems.includes(f.id)).length}/{goodFoods.length}
          </span>
        </div>

        {/* 권장 식품 카드들을 하나씩 나열 */}
        <div className="space-y-2">
          {goodFoods.map(item => (
            <FoodCard
              key={item.id}
              item={item}
              checked={checkedItems.includes(item.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>

      {/* ===== 제한 식품 섹션 ===== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-red-800">
            ⛔ 제한 식품
          </h2>
          <span className="text-base font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {badFoods.filter(f => checkedItems.includes(f.id)).length}/{badFoods.length}
          </span>
        </div>

        <div className="space-y-2">
          {badFoods.map(item => (
            <FoodCard
              key={item.id}
              item={item}
              checked={checkedItems.includes(item.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>

    </section>
  )
}
