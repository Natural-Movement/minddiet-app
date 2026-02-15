// 기록하기 화면
// 1. 끼니 선택 (아침/점심/저녁/간식)
// 2. 먹은 음식 체크 (여러 개 가능)
// 3. "기록하기" 버튼으로 한꺼번에 저장

import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { goodFoods, badFoods } from '../data/foodItems.js'
import { Sun, CloudSun, Moon, Cookie, Check, Save, Loader2 } from 'lucide-react'
import Toast from './Toast'

// 끼니 목록
const meals = [
  { key: 'breakfast', label: '아침', icon: Sun },
  { key: 'lunch',     label: '점심', icon: CloudSun },
  { key: 'dinner',    label: '저녁', icon: Moon },
  { key: 'snack',     label: '간식', icon: Cookie },
]

// 음식 카드 하나 (체크 가능)
function FoodCheckCard({ food, checked, onToggle }) {
  const isGood = food.weeklyTarget !== undefined

  return (
    <button
      onClick={() => onToggle(food.id)}
      className={`
        w-full flex items-center gap-3 p-4 rounded-2xl border-2
        text-left transition-all duration-200
        ${checked
          ? isGood
            ? 'bg-green-50 border-green-500 shadow-md'
            : 'bg-red-50 border-red-500 shadow-md'
          : 'bg-white border-gray-200 active:scale-[0.98]'
        }
      `}
    >
      {/* 이모지 */}
      <span className="text-3xl w-10 text-center">{food.emoji}</span>

      {/* 이름 + 예시 */}
      <div className="flex-1">
        <p className={`text-lg font-semibold ${
          checked
            ? isGood ? 'text-green-800' : 'text-red-800'
            : 'text-gray-800'
        }`}>
          {food.label}
        </p>
        <p className={`text-sm mt-0.5 ${
          checked
            ? isGood ? 'text-green-600' : 'text-red-600'
            : 'text-gray-400'
        }`}>
          {food.example}
        </p>
      </div>

      {/* 체크 동그라미 */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center
        border-2 transition-all duration-200
        ${checked
          ? isGood
            ? 'bg-green-500 border-green-500'
            : 'bg-red-500 border-red-500'
          : 'bg-white border-gray-300'
        }
      `}>
        {checked && <Check size={18} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  )
}

// ===== 메인 기록하기 뷰 =====
export default function LogView() {
  const [mealType, setMealType] = useState('lunch')    // 선택된 끼니
  const [checkedItems, setCheckedItems] = useState([])  // 체크된 음식 id 목록
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // 음식 체크/해제
  const handleToggle = (id) => {
    setCheckedItems(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)   // 이미 체크됨 → 해제
        : [...prev, id]                // 체크 안 됨 → 추가
    )
  }

  // 한꺼번에 저장
  const handleSave = async () => {
    if (checkedItems.length === 0) {
      setToast({ message: '최소 1개 이상 체크해주세요!', type: 'error' })
      return
    }

    setSaving(true)
    try {
      // 체크된 음식마다 1줄씩 만들어서 한꺼번에 저장
      // 예: 견과류 + 생선 체크 → 2줄 저장
      const rows = checkedItems.map(foodId => ({
        meal_type: mealType,
        food_id: foodId,
      }))

      const { error } = await supabase
        .from('mind_logs')
        .insert(rows)  // 여러 줄을 한 번에 넣기

      if (error) throw error

      setToast({
        message: `${checkedItems.length}개 음식이 기록되었어요! 👏`,
        type: 'success'
      })
      // 체크 초기화 (끼니 선택은 유지)
      setCheckedItems([])

    } catch (err) {
      console.error(err)
      setToast({ message: '저장 실패. 네트워크를 확인해주세요.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      {/* ===== 1단계: 끼니 선택 ===== */}
      <h2 className="text-xl font-bold text-gray-800 mb-3">끼니 선택</h2>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {meals.map(({ key, label, icon: Icon }) => {
          const active = mealType === key
          return (
            <button
              key={key}
              onClick={() => setMealType(key)}
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
              <Icon size={28} strokeWidth={2.2} />
              <span className="text-base">{label}</span>
            </button>
          )
        })}
      </div>

      {/* ===== 2단계: 음식 체크 ===== */}
      <h2 className="text-xl font-bold text-green-800 mb-3">
        ✅ 권장 식품
        <span className="ml-2 text-base font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          {goodFoods.filter(f => checkedItems.includes(f.id)).length}/{goodFoods.length}
        </span>
      </h2>
      <div className="space-y-2 mb-6">
        {goodFoods.map(food => (
          <FoodCheckCard
            key={food.id}
            food={food}
            checked={checkedItems.includes(food.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold text-red-800 mb-3">
        ⛔ 제한 식품
        <span className="ml-2 text-base font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
          {badFoods.filter(f => checkedItems.includes(f.id)).length}/{badFoods.length}
        </span>
      </h2>
      <div className="space-y-2 mb-6">
        {badFoods.map(food => (
          <FoodCheckCard
            key={food.id}
            food={food}
            checked={checkedItems.includes(food.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* ===== 3단계: 기록하기 버튼 ===== */}
      <button
        onClick={handleSave}
        disabled={saving || checkedItems.length === 0}
        className={`
          w-full flex items-center justify-center gap-3
          py-4 px-6 rounded-2xl
          text-xl font-bold text-white
          transition-all duration-200
          ${saving || checkedItems.length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg'
          }
        `}
      >
        {saving ? (
          <>
            <Loader2 size={26} className="animate-spin" />
            <span>저장 중...</span>
          </>
        ) : (
          <>
            <Save size={26} strokeWidth={2.2} />
            <span>기록하기 ({checkedItems.length}개)</span>
          </>
        )}
      </button>

      {/* 토스트 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  )
}
