import { useState, useEffect } from 'react'
import {
  User,
  Users,
  Brain,
  Cloud,
  Star,
  Heart,
  Smile,
  Coffee,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Settings,
  Sparkles,
} from 'lucide-react'

// 사용할 수 있는 아바타 아이콘 목록
const ICON_MAP = {
  brain: Brain,
  cloud: Cloud,
  star: Star,
  heart: Heart,
  smile: Smile,
  coffee: Coffee,
  user: User,
  users: Users,
}

type AvatarIconKey = keyof typeof ICON_MAP

// 사용할 수 있는 테마 그라데이션 목록
const GRADIENTS = [
  { key: 'blue', value: 'from-blue-500 to-indigo-600', border: 'border-blue-300 dark:border-blue-700' },
  { key: 'purple', value: 'from-purple-500 to-pink-600', border: 'border-purple-300 dark:border-purple-700' },
  { key: 'emerald', value: 'from-emerald-400 to-teal-650', border: 'border-emerald-300 dark:border-emerald-700' },
  { key: 'amber', value: 'from-amber-400 to-orange-500', border: 'border-amber-300 dark:border-amber-700' },
  { key: 'rose', value: 'from-rose-500 to-red-650', border: 'border-rose-300 dark:border-rose-700' },
]

export interface Profile {
  id: string
  label: string
  icon: AvatarIconKey
  colorClass: string // 'from-blue-500 to-indigo-600' 등
}

const DEFAULT_PROFILES: Profile[] = [
  { id: 'only_me', label: 'Only Me', icon: 'brain', colorClass: 'from-blue-500 to-indigo-600' },
  { id: 'sky', label: 'Sky', icon: 'cloud', colorClass: 'from-purple-500 to-pink-600' },
]

interface UserSelectProps {
  onSelect: (id: string) => void
}

export default function UserSelect({ onSelect }: UserSelectProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isManageMode, setIsManageMode] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null) // null이면 신규 추가

  // 모달 입력값 상태
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<AvatarIconKey>('user')
  const [selectedGrad, setSelectedGrad] = useState(GRADIENTS[0].value)

  // 프로필 초기 로드
  useEffect(() => {
    const saved = localStorage.getItem('mind_profiles')
    if (saved) {
      try {
        setProfiles(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse profiles', e)
        setProfiles(DEFAULT_PROFILES)
        localStorage.setItem('mind_profiles', JSON.stringify(DEFAULT_PROFILES))
      }
    } else {
      setProfiles(DEFAULT_PROFILES)
      localStorage.setItem('mind_profiles', JSON.stringify(DEFAULT_PROFILES))
    }
  }, [])

  const saveProfilesToStorage = (updated: Profile[]) => {
    setProfiles(updated)
    localStorage.setItem('mind_profiles', JSON.stringify(updated))
  }

  // 모달 열기 (추가 또는 편집)
  const openModal = (profile: Profile | null = null) => {
    if (profile) {
      setEditingProfile(profile)
      setName(profile.label)
      setSelectedIcon(profile.icon)
      setSelectedGrad(profile.colorClass)
    } else {
      setEditingProfile(null)
      setName('')
      setSelectedIcon('user')
      setSelectedGrad(GRADIENTS[0].colorClass || GRADIENTS[0].value)
    }
    setModalOpen(true)
  }

  // 모달 저장 처리
  const handleSave = () => {
    if (!name.trim()) return

    if (editingProfile) {
      // 수정
      const updated = profiles.map((p) =>
        p.id === editingProfile.id
          ? { ...p, label: name.trim(), icon: selectedIcon, colorClass: selectedGrad }
          : p
      )
      saveProfilesToStorage(updated)
    } else {
      // 신규 추가
      const newProfile: Profile = {
        id: `profile_${Date.now()}`,
        label: name.trim(),
        icon: selectedIcon,
        colorClass: selectedGrad,
      }
      saveProfilesToStorage([...profiles, newProfile])
    }
    setModalOpen(false)
  }

  // 프로필 삭제 처리
  const handleDelete = (id: string) => {
    if (confirm('이 프로필을 정말 삭제하시겠습니까?\n해당 프로필의 로컬 캐시 기록은 사라질 수 있습니다.')) {
      const updated = profiles.filter((p) => p.id !== id)
      saveProfilesToStorage(updated)
      setModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-6 py-10 transition-colors duration-200">
      <div className="w-full max-w-md text-center">
        {/* 앱 브랜딩 로고 */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-5 animate-bounce">
          <Brain size={44} strokeWidth={2} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          🧠 MIND Diet Tracker
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2 mb-10">
          인지 및 뇌 건강 관리를 위한 첫걸음, 사용자를 선택하세요.
        </p>

        {/* 프로필 선택 그리드 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {profiles.map((profile) => {
            const IconComponent = ICON_MAP[profile.icon] || User
            return (
              <div key={profile.id} className="relative group">
                <button
                  onClick={() => {
                    if (isManageMode) {
                      openModal(profile)
                    } else {
                      onSelect(profile.id)
                    }
                  }}
                  className={`w-full flex flex-col items-center justify-center py-6 px-4 rounded-3xl border-2 text-white bg-gradient-to-br ${profile.colorClass} shadow-lg premium-card active-press text-center relative overflow-hidden`}
                >
                  {/* 프로필 관리 모드 시 오버레이 연필 아이콘 */}
                  {isManageMode && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-all duration-200">
                      <div className="p-3 bg-white/20 rounded-full border border-white/40">
                        <Edit3 size={24} className="text-white" />
                      </div>
                    </div>
                  )}

                  {/* 아바타 아이콘 원형 백그라운드 */}
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                    <IconComponent size={32} className="text-white" strokeWidth={2.2} />
                  </div>
                  <span className="text-lg font-bold tracking-wide truncate max-w-full">
                    {profile.label}
                  </span>
                </button>
              </div>
            )
          })}

          {/* 프로필 추가 버튼 (관리모드 시 노출) */}
          {isManageMode && (
            <button
              onClick={() => openModal(null)}
              className="w-full flex flex-col items-center justify-center py-6 px-4 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-500 dark:text-gray-400 active-press text-center transition-all"
            >
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center mb-3 group-hover:border-blue-500">
                <Plus size={28} />
              </div>
              <span className="text-base font-bold">프로필 추가</span>
            </button>
          )}
        </div>

        {/* 프로필 관리 토글 버튼 */}
        <button
          onClick={() => setIsManageMode(!isManageMode)}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold border transition-all ${
            isManageMode
              ? 'bg-gray-800 border-gray-800 text-white dark:bg-white dark:border-white dark:text-gray-900'
              : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Settings size={16} />
          {isManageMode ? '관리 완료' : '프로필 관리'}
        </button>
      </div>

      {/* 프로필 추가/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-850 animate-in fade-in zoom-in-95 duration-200">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-blue-500" size={20} />
                {editingProfile ? '프로필 편집' : '새 프로필 만들기'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 space-y-6">
              {/* 프로필 이름 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  이름 / 닉네임
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 우리엄마, 내식단"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-750 bg-gray-50 dark:bg-gray-950 rounded-2xl text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 아바타 아이콘 선택 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  아바타 아이콘
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(ICON_MAP).map(([key, IconComponent]) => {
                    const active = selectedIcon === key
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedIcon(key as AvatarIconKey)}
                        className={`flex items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                          active
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                            : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <IconComponent size={24} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 그라데이션 컬러 선택 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  테마 컬러 그라데이션
                </label>
                <div className="flex gap-3">
                  {GRADIENTS.map((grad) => {
                    const active = selectedGrad === grad.value
                    return (
                      <button
                        key={grad.key}
                        onClick={() => setSelectedGrad(grad.value)}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                          grad.value
                        } flex items-center justify-center text-white ring-2 ring-offset-2 dark:ring-offset-gray-900 transition-all ${
                          active ? 'ring-blue-500 scale-110 shadow-md' : 'ring-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        {active && <Check size={16} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              {editingProfile ? (
                <button
                  onClick={() => handleDelete(editingProfile.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-sm font-bold transition-colors"
                >
                  <Trash2 size={16} />
                  삭제
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm font-bold transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
