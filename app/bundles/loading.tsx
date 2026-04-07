export default function BundlesLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="h-10 w-56 bg-[#1C1C1E] rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#1C1C1E] rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-[#2C2C2E]" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-[#2C2C2E] rounded w-3/4" />
                <div className="h-4 bg-[#2C2C2E] rounded w-full" />
                <div className="h-4 bg-[#2C2C2E] rounded w-2/3" />
                <div className="h-8 bg-[#2C2C2E] rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
