import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { SITE_NAME } from '@/lib/constants';

const PodHero = dynamic(() => import('@/features/pod/components/PodHero').then(m => ({ default: m.PodHero })));
const PodTopCategories = dynamic(() => import('@/features/pod/components/PodTopCategories').then(m => ({ default: m.PodTopCategories })));
const PodPromoGrid = dynamic(() => import('@/features/pod/components/PodPromoGrid').then(m => ({ default: m.PodPromoGrid })));
const PodFeaturedProducts = dynamic(() => import('@/features/pod/components/PodFeaturedProducts').then(m => ({ default: m.PodFeaturedProducts })));
const PodDealBanner = dynamic(() => import('@/features/pod/components/PodDealBanner').then(m => ({ default: m.PodDealBanner })));
const PodNewArrivals = dynamic(() => import('@/features/pod/components/PodNewArrivals').then(m => ({ default: m.PodNewArrivals })));
const PodTrendingSection = dynamic(() => import('@/features/pod/components/PodTrendingSection').then(m => ({ default: m.PodTrendingSection })));
const PodRandomRecommendations = dynamic(() => import('@/features/pod/components/PodRandomRecommendations').then(m => ({ default: m.PodRandomRecommendations })));
const PodRecentlyViewed = dynamic(() => import('@/features/pod/components/PodRecentlyViewed').then(m => ({ default: m.PodRecentlyViewed })));
const PodMarquee = dynamic(() => import('@/features/pod/components/PodMarquee').then(m => ({ default: m.PodMarquee })));
const PodBannerList = dynamic(() => import('@/features/pod/components/PodBannerList').then(m => ({ default: m.PodBannerList })));
const PodInstagram = dynamic(() => import('@/features/pod/components/PodInstagram').then(m => ({ default: m.PodInstagram })));
const PodTrustBadges = dynamic(() => import('@/features/pod/components/PodTrustBadges').then(m => ({ default: m.PodTrustBadges })));

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
          padding-top: 14px !important;
          padding-bottom: 8px !important;
        }
        .pod-home-sections > * + * {
          margin-top: 36px;
        }
        @media (max-width: 749px) {
          .pod-home-sections { padding-top: 8px !important; padding-bottom: 0px !important; }
          .pod-home-sections > * + * { margin-top: 20px; }
        }
      `}</style>
    </div>
  );
}
