export function PodTopCategoriesSkeleton() {
  return (
    <section className="pdcat-section">
      <div className="container-main">
        <div className="flex items-center justify-between gap-[12px] mb-[8px] min-[750px]:mb-[14px]">
          <h2 className="text-[17px] min-[750px]:text-[28px] font-semibold text-[#222]">Shop by categories</h2>
          <div className="h-[20px] w-[130px] bg-neutral-200/70 rounded animate-pulse" />
        </div>

        <div className="pdcat-slider-outer">
          <div className="grid grid-cols-3 min-[750px]:grid-cols-4 min-[992px]:grid-cols-5 gap-[10px] min-[750px]:gap-[18px] min-[992px]:gap-[24px] py-[4px] px-[6px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-[6px] min-[750px]:gap-[10px] w-full ${
                  i >= 3 ? 'hidden min-[750px]:flex' : ''
                } ${i >= 4 ? 'hidden min-[992px]:flex' : ''}`}
              >
                <div className="w-full max-w-[220px] aspect-square rounded-full bg-[#ebf0f5] animate-pulse shadow-[0_8px_16px_-2px_rgba(24,62,132,0.08)]" />
                <div className="h-[14px] w-[65%] min-[750px]:w-[50%] bg-neutral-200/80 rounded animate-pulse mt-[2px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
