// 저장 버튼 컴포넌트
// "기록하기"를 누르면 데이터가 Supabase로 전송돼요
// 저장 중일 때는 빙글빙글 로딩 표시가 나와요

import { Save, Loader2 } from 'lucide-react'

// onClick = 버튼 누르면 실행되는 함수
// loading = 저장 중인지 (true면 로딩 표시)
// disabled = 버튼 비활성화 (체크한 게 없으면 못 누르게)
export default function SaveButton({ onClick, loading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        w-full flex items-center justify-center gap-3
        py-4 px-6 rounded-2xl
        text-xl font-bold text-white
        transition-all duration-200
        ${loading || disabled
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg'
        }
      `}
    >
      {loading ? (
        <>
          {/* 저장 중이면 빙글빙글 아이콘 */}
          <Loader2 size={26} className="animate-spin" />
          <span>저장 중...</span>
        </>
      ) : (
        <>
          {/* 평소에는 저장 아이콘 */}
          <Save size={26} strokeWidth={2.2} />
          <span>기록하기</span>
        </>
      )}
    </button>
  )
}