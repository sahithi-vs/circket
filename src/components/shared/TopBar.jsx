import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function TopBar({ title, back, right, transparent }) {
  const nav = useNavigate()
  return (
    <div className={`flex items-center justify-between px-4 py-3 safe-top ${transparent ? '' : 'border-b border-cricket-border'}`}
         style={{ background: transparent ? 'transparent' : '#0f1923' }}>
      <div className="w-10">
        {back && (
          <button onClick={() => nav(back === true ? -1 : back)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-cricket-card transition-all">
            <ChevronLeft size={22} />
          </button>
        )}
      </div>
      <h1 className="font-display font-bold text-lg tracking-wide">{title}</h1>
      <div className="w-10 flex justify-end">{right}</div>
    </div>
  )
}
