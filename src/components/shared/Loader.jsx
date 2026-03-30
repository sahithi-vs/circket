// src/components/shared/Loader.jsx
export default function Loader({ text = '' }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-cricket-darker z-50">
      <div className="w-10 h-10 border-2 border-pitch-500 border-t-transparent rounded-full animate-spin mb-3" />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}
