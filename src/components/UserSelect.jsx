import { User, Users } from 'lucide-react'

const users = [
  { id: 'only_me', label: 'Only Me', icon: User, color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'sky',     label: 'Sky',     icon: Users, color: 'bg-purple-600 hover:bg-purple-700' },
]

export default function UserSelect({ onSelect }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">🧠 MIND Diet</h1>
      <p className="text-lg text-gray-500 mb-10">사용자를 선택하세요</p>
      <div className="w-full max-w-sm space-y-4">
        {users.map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => onSelect(id)}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-xl font-bold text-white shadow-lg active:scale-[0.97] transition-all ${color}`}>
            <Icon size={28} strokeWidth={2.2} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-400">마인드 다이어트 식단 기록 앱</p>
    </div>
  )
}
