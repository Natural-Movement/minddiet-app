// 음식 카드 컴포넌트
// 음식 하나하나를 터치할 수 있는 큰 카드로 보여주는 부품
// 예: [🥬 녹색 잎채소  +1  ✓] 이런 모양

import { Check } from 'lucide-react'

// item = 음식 데이터 (이름, 이모지, 점수 등)
// checked = 이 음식이 체크되었는지 (true/false)
// onToggle = 카드 터치하면 실행되는 함수
export default function FoodCard({ item, checked, onToggle }) {
  // 권장 식품인지 제한 식품인지 구분
  const isGood = item.point > 0

  return (
    <button
      onClick={() => onToggle(item.id)}
      className={`
        w-full flex items-center gap-4
        p-4 rounded-2xl border-2 text-left
        transition-all duration-200
        ${checked
          ? isGood
            ? 'bg-green-50 border-green-500 shadow-md'    // 권장 식품 체크됨 → 초록
            : 'bg-red-50 border-red-500 shadow-md'         // 제한 식품 체크됨 → 빨강
          : 'bg-white border-gray-200 active:scale-[0.98]' // 아직 체크 안 됨
        }
      `}
    >
      {/* 이모지 */}
      <span className="text-3xl w-10 text-center">{item.emoji}</span>

      {/* 음식 이름 + 예시 */}
      <div className="flex-1">
        <p className={`text-lg font-semibold ${
          checked
            ? isGood ? 'text-green-800' : 'text-red-800'
            : 'text-gray-800'
        }`}>
          {item.label}
        </p>
        <p className={`text-sm mt-0.5 ${
          checked
            ? isGood ? 'text-green-600' : 'text-red-600'
            : 'text-gray-400'
        }`}>
          {item.example}
        </p>
      </div>

      {/* 점수 (+1 또는 -1) */}
      <span className={`text-lg font-bold ${
        isGood ? 'text-green-500' : 'text-red-500'
      }`}>
        {isGood ? '+1' : '-1'}
      </span>

      {/* 체크 동그라미 */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center
        border-2 transition-all duration-200
        ${checked
          ? isGood
            ? 'bg-green-500 border-green-500'   // 체크됨 → 초록 동그라미
            : 'bg-red-500 border-red-500'         // 체크됨 → 빨간 동그라미
          : 'bg-white border-gray-300'            // 체크 안 됨 → 빈 동그라미
        }
      `}>
        {/* 체크되면 흰색 체크표시 보여줌 */}
        {checked && <Check size={18} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  )
}
