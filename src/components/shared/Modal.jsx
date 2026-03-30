import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
         style={{ background: 'rgba(0,0,0,0.7)' }}
         onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl p-6 pb-10"
           style={{ background: '#131f2b', border: '1px solid #1e2f40' }}
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl">{title}</h2>
          <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white"
                  style={{ background: '#1e2f40' }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
