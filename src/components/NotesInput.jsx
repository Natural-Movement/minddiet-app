// 비고 입력 컴포넌트
// 오늘 식단에 대한 메모를 자유롭게 적을 수 있어요

export default function NotesInput({ value, onChange }) {
  return (
    <section className="mb-6">
      <label htmlFor="notes" className="block text-xl font-bold text-gray-800 mb-3">
        비고
      </label>

      <textarea
        id="notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="오늘 식단 메모를 남겨보세요. (예: 점심에 샐러드 + 연어)"
        rows={4}
        maxLength={300}
        className="
          w-full rounded-2xl border-2 border-gray-200
          px-4 py-3 text-base text-gray-800
          placeholder:text-gray-400
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          resize-none bg-white
        "
      />

      <p className="mt-2 text-xs text-gray-400 text-right">
        {value.length}/300
      </p>
    </section>
  )
}
