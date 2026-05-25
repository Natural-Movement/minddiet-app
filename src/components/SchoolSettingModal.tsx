import { useState } from 'react'
import { searchSchool, SchoolInfo } from '../lib/schoolMeal'
import { X, Search, School, Loader2, MapPin } from 'lucide-react'

interface SchoolSettingModalProps {
  onClose: () => void
  onSaved: () => void
}

export default function SchoolSettingModal({ onClose, onSaved }: SchoolSettingModalProps) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<SchoolInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const currentSchool: SchoolInfo | null = (() => {
    const saved = localStorage.getItem('mind_school_info')
    return saved ? JSON.parse(saved) : null
  })()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return

    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const data = await searchSchool(keyword)
      setResults(data)
    } catch (err: any) {
      console.error(err)
      setError('검색 중 문제가 발생했습니다. 네트워크를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (school: SchoolInfo) => {
    localStorage.setItem('mind_school_info', JSON.stringify(school))
    onSaved()
    onClose()
  }

  const handleReset = () => {
    localStorage.removeItem('mind_school_info')
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <School className="text-blue-500" size={22} />
              학교 급식 연동 설정
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">급식 자동 동기화용 학교를 설정합니다.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 바디 */}
        <div className="p-6">
          {/* 현재 설정된 학교 */}
          {currentSchool && (
            <div className="mb-5 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-950 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-500 dark:text-blue-400">현재 연동된 학교</p>
                <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-0.5 truncate">{currentSchool.schoolName}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{currentSchool.location}</p>
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors border border-red-200 dark:border-red-900/50 shrink-0"
              >
                해제
              </button>
            </div>
          )}

          {/* 검색 입력 폼 */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="학교명을 입력하세요 (예: 영생)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
            </div>
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 transition-colors shrink-0"
            >
              검색
            </button>
          </form>

          {/* 검색 결과 */}
          <div className="mt-5 max-h-60 overflow-y-auto pr-1 space-y-2">
            {loading && (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="text-sm text-gray-400 dark:text-gray-500 mt-2">학교 검색 중...</span>
              </div>
            )}

            {error && <p className="text-center py-6 text-sm text-red-500">{error}</p>}

            {!loading && !error && results.length === 0 && searched && (
              <p className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">
                검색 결과가 없습니다.<br />학교 이름을 확인해 주세요.
              </p>
            )}

            {!loading &&
              results.map((school) => (
                <button
                  key={school.schoolCode}
                  onClick={() => handleSelect(school)}
                  className="w-full text-left p-4 bg-gray-50 dark:bg-gray-950/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 rounded-2xl border border-gray-100 dark:border-gray-850 flex items-center justify-between group active:scale-[0.99] transition-all"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-gray-800 dark:text-gray-250 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {school.schoolName}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-1">
                      <MapPin size={12} />
                      {school.location}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    선택
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
