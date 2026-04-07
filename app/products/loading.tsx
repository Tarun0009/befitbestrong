export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="h-8 w-48 bg-[#1C1C1E] rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-[#1C1C1E] rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-[#2C2C2E]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#2C2C2E] rounded w-3/4" />
                <div className="h-4 bg-[#2C2C2E] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
