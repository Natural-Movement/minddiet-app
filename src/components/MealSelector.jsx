// 끼니 선택 버튼 컴포넌트
// [아침] [점심] [저녁] [간식] 중 하나를 고르는 버튼 4개를 보여줘요

// lucide-react = 예쁜 아이콘 모음 라이브러리
import { Sun, CloudSun, Moon, Cookie } from 'lucide-react'

// 4개 끼니 정보를 배열로 정리
const meals = [
  { key: 'breakfast', label: '아침', icon: Sun },
  { key: 'lunch',     label: '점심', icon: CloudSun },
  { key: 'dinner',    label: '저녁', icon: Moon },
  { key: 'snack',     label: '간식', icon: Cookie },
]

// selected = 현재 선택된 끼니
// onChange = 버튼 누르면 실행되는 함수 (부모한테 "이거 골랐어!" 알려줌)
export default function MealSelector({ selected, onChange }) {
  return (
    <section className="mb-6">
      {/* 제목 */}
      <h2 className="text-xl font-bold text-gray-800 mb-3">끼니 선택</h2>

      {/* 버튼 4개를 가로로 배치 (grid-cols-4 = 4칸 격자) */}
      <div className="grid grid-cols-4 gap-2">
        {meals.map(({ key, label, icon: Icon }) => {
          // 이 버튼이 현재 선택된 건지 확인
          const active = selected === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`
                flex flex-col items-center justify-center gap-1
                py-3 rounded-xl border-2 font-semibold
                transition-all duration-200
                ${active
                  ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200'
                }
              `}
            >
              {/* 아이콘 */}
              <Icon size={28} strokeWidth={2.2} />
              {/* 글자 */}
              <span className="text-base">{label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
