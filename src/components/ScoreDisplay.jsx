// 점수 표시 컴포넌트
// 화면 상단에 "현재 끼니 점수"를 크~게 보여주는 부품이에요
// 음식을 체크할 때마다 이 점수가 실시간으로 바뀜!

import { Brain } from 'lucide-react'

// score = 현재 점수 (부모에서 계산해서 넘겨줌)
export default function ScoreDisplay({ score }) {

  // 점수에 따라 글자 색깔을 다르게
  const getScoreColor = () => {
    if (score >= 5) return 'text-green-600'   // 5점 이상이면 초록
    if (score >= 1) return 'text-amber-500'   // 1~4점이면 주황
    if (score === 0) return 'text-gray-500'   // 0점이면 회색
    return 'text-red-600'                     // 마이너스면 빨강
  }

  // 점수에 따라 배경색도 다르게
  const getBoxStyle = () => {
    if (score >= 5) return 'bg-green-50 border-green-200'
    if (score >= 1) return 'bg-amber-50 border-amber-200'
    if (score === 0) return 'bg-gray-50 border-gray-200'
    return 'bg-red-50 border-red-200'
  }

  // 점수에 따라 응원 메시지도 다르게
  const getMessage = () => {
    if (score >= 8) return '완벽한 뇌 건강 식단! 🧠✨'
    if (score >= 5) return '좋은 선택이에요! 계속 고고 💪'
    if (score >= 1) return '괜찮은 출발! 조금 더 채워볼까요?'
    if (score === 0) return '음식을 선택해보세요!'
    return '제한 식품이 많아요. 균형을 맞춰봐요!'
  }

  return (
    <section className={`
      mb-6 p-5 rounded-2xl border-2 shadow-sm
      ${getBoxStyle()}
    `}>
      <div className="flex items-center justify-between">
        {/* 왼쪽: 아이콘 + 텍스트 */}
        <div className="flex items-center gap-3">
          <Brain size={32} className="text-blue-600" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-gray-500">현재 끼니 점수</p>
            <p className="text-base text-gray-600 mt-0.5">{getMessage()}</p>
          </div>
        </div>

        {/* 오른쪽: 큰 점수 숫자 */}
        <span className={`text-5xl font-extrabold ${getScoreColor()}`}>
          {score > 0 ? `+${score}` : score}
        </span>
      </div>
    </section>
  )
}
s