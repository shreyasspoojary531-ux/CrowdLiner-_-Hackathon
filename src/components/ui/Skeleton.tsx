export function SkeletonCard() {
  return (
    <div className="w-full bg-[#181818] border border-white/5 rounded-2xl p-5 animate-pulse flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 w-2/3">
          <div className="h-5 bg-white/10 rounded w-3/4" />
          <div className="h-3.5 bg-white/5 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
      </div>
      
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between">
          <div className="h-3 bg-white/5 rounded w-1/4" />
          <div className="h-3 bg-white/5 rounded w-1/5" />
        </div>
        <div className="h-2.5 bg-white/10 rounded-full w-full" />
      </div>
    </div>
  );
}

export function SkeletonDetails() {
  return (
    <div className="flex flex-col gap-6 animate-pulse p-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2 w-1/2">
          <div className="h-8 bg-white/10 rounded w-2/3" />
          <div className="h-4 bg-white/5 rounded w-1/3" />
        </div>
        <div className="h-10 bg-white/10 rounded-xl w-32" />
      </div>
      <div className="h-px bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-[#181818] border border-white/5 rounded-2xl md:col-span-2" />
        <div className="h-48 bg-[#181818] border border-white/5 rounded-2xl" />
      </div>
    </div>
  );
}
