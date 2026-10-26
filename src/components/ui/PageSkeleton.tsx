import { Container } from '@/components/layout/Container';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export function PageSkeleton() {
  return (
    <Container>
      <div
        role="status"
        aria-label="Loading page content"
        aria-busy="true"
        className="py-[4rem]"
      >
        <div className="mb-[3rem] space-y-[1rem]">
          <Skeleton className="h-[3.2rem] w-[min(28rem,70%)]" />
          <Skeleton className="h-[1.6rem] w-[min(42rem,90%)]" />
        </div>
        <div className="mb-[2rem] flex items-center justify-between">
          <Skeleton className="h-[1.6rem] w-[10rem]" />
          <Skeleton className="h-[3.8rem] w-[14rem]" />
        </div>
        <div className="grid grid-cols-2 gap-[2rem] sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </Container>
  );
}
