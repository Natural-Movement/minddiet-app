// 점수 표시 컴포넌트
// 현재 체크한 음식 기준 점수를 크게 보여주고 상태를 간단히 안내해요

export default function ScoreDisplay({ score }) {
  const isPositive = score > 0
  const isNegative = score < 0

  const badgeClass = isPositive
    ? 'bg-green-100 text-green-700'
    : isNegative
      ? 'bg-red-100 text-red-700'
      : 'bg-gray-100 text-gray-600'

  const scoreClass = isPositive
    ? 'text-green-600'
    : isNegative
      ? 'text-red-600'
      : 'text-gray-700'

  const scoreText = score > 0 ? `+${score}` : `${score}`
  const statusText = isPositive ? '좋아요' : isNegative ? '주의' : '시작해볼까요?'

  return (
    <section className="mb-6 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">현재 점수</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}`}>
          {statusText}
        </span>
      </div>

      <p className={`mt-3 text-5xl font-black leading-none ${scoreClass}`}>
        {scoreText}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        권장 식품은 +1, 제한 식품은 -1점이에요.
      </p>
    </section>
  )
}
