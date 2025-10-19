export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C5A572] border-r-transparent mb-4"></div>
        <p className="text-white">Loading users...</p>
      </div>
    </div>
  )
}
