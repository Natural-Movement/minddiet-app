// 토스트 컴포넌트
// 저장 성공/실패 시 화면 아래에서 잠깐 올라왔다 사라지는 알림이에요
// 카카오톡 알림처럼 톡! 나타나는 거예요

import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useEffect } from 'react'

// message = 알림 메시지 ("저장 완료!" 같은)
// type = 'success'(성공) 또는 'error'(에러)
// onClose = 알림 닫기 함수
export default function Toast({ message, type = 'success', onClose }) {

  // 3초 후에 자동으로 사라지게
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    // 컴포넌트가 사라질 때 타이머도 정리
    return () => clearTimeout(timer)
  }, [onClose])

  const isSuccess = type === 'success'

  return (
    <div className="fixed bottom-28 left-4 right-4 z-50 flex justify-center">
      <div className={`
        flex items-center gap-3 px-5 py-4 rounded-2xl
        shadow-lg max-w-md w-full text-white
        ${isSuccess ? 'bg-green-700' : 'bg-red-700'}
      `}>
        {/* 성공이면 체크 아이콘, 실패면 경고 아이콘 */}
        {isSuccess
          ? <CheckCircle2 size={24} />
          : <AlertCircle size={24} />
        }

        {/* 메시지 텍스트 */}
        <p className="text-lg flex-1">{message}</p>

        {/* X 닫기 버튼 */}
        <button onClick={onClose} className="p-1">
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
