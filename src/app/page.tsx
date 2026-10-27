import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { SITE_NAME } from '@/lib/constants';
import { PodHero } from '@/features/pod/components/PodHero';
import { PodTopCategories } from '@/features/pod/components/PodTopCategories';
const PodFeaturedProducts = dynamic(() => import('@/features/pod/components/PodFeaturedProducts').then(m => ({ default: m.PodFeaturedProducts })));
const PodDealBanner = dynamic(() => import('@/features/pod/components/PodDealBanner').then(m => ({ default: m.PodDealBanner })));
const PodNewArrivals = dynamic(() => import('@/features/pod/components/PodNewArrivals').then(m => ({ default: m.PodNewArrivals })));
const PodTrendingSection = dynamic(() => import('@/features/pod/components/PodTrendingSection').then(m => ({ default: m.PodTrendingSection })));
const PodRandomRecommendations = dynamic(() => import('@/features/pod/components/PodRandomRecommendations').then(m => ({ default: m.PodRandomRecommendations })));
const PodRecentlyViewed = dynamic(() => import('@/features/pod/components/PodRecentlyViewed').then(m => ({ default: m.PodRecentlyViewed })));
const PodMarquee = dynamic(() => import('@/features/pod/components/PodMarquee').then(m => ({ default: m.PodMarquee })));

export const metadata: Metadata = {
  title: `${SITE_NAME}`,
  description: 'RKF Distributer — Premium ecommerce and distribution store.',
};

export default function HomePage() {
  return (
    <div className="pod-home-sections pt-[14px] max-[749px]:!pt-[8px]">
      <PodHero />
      <PodTopCategories />
      <PodFeaturedProducts />
      <PodDealBanner />
      <PodNewArrivals />
      <PodTrendingSection />
      <PodRandomRecommendations />
      <PodMarquee />
      <PodRecentlyViewed />

      <style>{`
        .pod-home-sections {
          padding-top: 12px !important;
          padding-bottom: 8px !important;
        }
        .pod-home-sections > * + * {
          margin-top: 24px;
        }
        @media (max-width: 749px) {
          .pod-home-sections { padding-top: 6px !important; padding-bottom: 0px !important; }
          .pod-home-sections > * + * { margin-top: 14px; }
        }
      `}</style>
    </div>
  );
}
