
interface WeeklyScoreCardProps {
    score: number | null;
}

export default function WeeklyScoreCard({ score }: WeeklyScoreCardProps) {
    const hasScore = typeof score === 'number'

    return (
        <div className={`
      p-5 rounded-2xl border-2 mb-6 text-center shadow-sm dark:shadow-none transition-colors
      ${!hasScore
                ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800'
                : score >= 10
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : score >= 5
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }
    `}>
            <p className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-1">이번 주 MIND 점수</p>
            <p className={`text-5xl font-extrabold ${!hasScore ? 'text-gray-400 dark:text-gray-500'
                : score >= 10 ? 'text-green-600 dark:text-green-400'
                : score >= 5 ? 'text-amber-500 dark:text-amber-400'
                    : 'text-red-500 dark:text-red-400'
                }`}>
                {hasScore ? score : '-'}
                <span className="text-2xl text-gray-400 dark:text-gray-500"> / 15</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {hasScore ? '최근 7일 기준 (롤링)' : '기록이 쌓이면 점수를 계산합니다'}
            </p>
        </div>
    )
}
