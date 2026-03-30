export default function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
           style={{ background: '#1a2a38' }}>
        <Icon size={28} className="text-pitch-500" />
      </div>
      <p className="font-display font-bold text-xl mb-1">{title}</p>
      <p className="text-gray-500 text-sm mb-6">{sub}</p>
      {action}
    </div>
  )
}
