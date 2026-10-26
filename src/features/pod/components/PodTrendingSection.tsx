'use client';

import { useState } from 'react';
import Image from 'next/image';

function IconRadioDot({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

const tabs = [
  {
    id: 'wholesale',
    step: '01',
    tag: 'Direct Importer Pricing',
    stat: 'Up to 40% Wholesale Savings',
    title: 'Wholesale & Bulk Orders at Direct Importer Prices',
    description: 'Special discounted tiers for retail shops, resellers, and bulk buyers across Sri Lanka.',
    mediaSrc: '/pod/why-choose/wholesale.jpg',
  },
  {
    id: 'delivery',
    step: '02',
    tag: 'Islandwide Fast Dispatch',
    stat: 'All 25 Districts Covered',
    title: 'Fast & Safe Islandwide Delivery',
    description: 'Carefully packed and dispatched quickly to your doorstep or business anywhere in Sri Lanka.',
    mediaSrc: '/pod/why-choose/delivery.jpg',
  },
  {
    id: 'quality',
    step: '03',
    tag: '100% Quality Verified',
    stat: 'Handpicked Premium Stock',
    title: '100% Quality-Checked Everyday Products',
    description: 'From hardware & home essentials to stationery, jewelry, and electronics—handpicked for durability and value.',
    mediaSrc: '/pod/why-choose/quality.jpg',
  },
];

export function PodTrendingSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="pdtab-section">
      <div className="container-main">
        <div className="pdtab-grid">

          {/* Left Column: Interactive Tab Rows */}
          <div className="pdtab-content">
            <div className="pdtab-eyebrow">
              <IconRadioDot size={13} />
              WHY CHOOSE RKF
            </div>

            <div className="pdtab-tabs-list">
              {tabs.map((tab, i) => {
                const isActive = activeTab === i;
                return (
                  <div
                    key={tab.id}
                    onMouseEnter={() => setActiveTab(i)}
                    onClick={() => setActiveTab(i)}
                    className={`pdtab-row${isActive ? ' is-active' : ''}`}
                  >
                    <div className="pdtab-row-header">
                      <span className={`pdtab-step-badge${isActive ? ' is-active' : ''}`}>
                        {tab.step}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="pdtab-row-title">
                          {tab.title}
                        </h3>
                        {isActive && (
                          <p className="pdtab-inline-desc">
                            {tab.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Media with Glassmorphism Stat Badge */}
          <div className="pdtab-media">
            {tabs.map((tab, i) => (
              <div
                key={tab.id}
                className={`pdtab-slide transition-[opacity,transform] duration-[400ms] ease-out ${
                  activeTab === i
                    ? 'opacity-100 scale-100 pointer-events-auto z-[2]'
                    : 'opacity-0 scale-[0.98] pointer-events-none z-[1]'
                }`}
              >
                <div className="pdtab-image-frame">
                  <Image
                    src={tab.mediaSrc}
                    alt={tab.title}
                    fill
                    className="object-cover object-center"
                    sizes="(min-width: 750px) 45vw, 90vw"
                    priority={i === 0}
                  />

                  {/* Sleek integrated glassmorphism stat badge over photo */}
                  <div className="pdtab-media-badge">
                    <div className="min-w-0">
                      <span className="pdtab-media-tag">{tab.tag}</span>
                      <span className="pdtab-media-stat">{tab.stat}</span>
                    </div>
                    <div className="w-[8px] h-[8px] rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        .pdtab-grid {
          display: grid;
          grid-template-columns: 1fr;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(11, 28, 61, 0.08);
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .pdtab-content {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px 20px;
          border: 2.5px solid #e01117;
          border-radius: 16px 16px 0 0;
        }

        .pdtab-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #ffffff;
          background: linear-gradient(135deg, #0b1c3d 0%, #183e84 100%);
          padding: 6px 14px;
          border-radius: 999px;
          align-self: flex-start;
          margin-bottom: 16px;
          box-shadow: 0 3px 10px rgba(11, 28, 61, 0.15);
        }

        .pdtab-tabs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pdtab-row {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          transition: border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
        }
        .pdtab-row:hover {
          border-color: #cbd5e1;
          transform: translateX(3px);
        }
        .pdtab-row.is-active {
          border-color: #e01117;
          background: linear-gradient(135deg, rgba(224, 17, 23, 0.03) 0%, rgba(224, 17, 23, 0.06) 100%);
          box-shadow: 0 4px 16px rgba(224, 17, 23, 0.08);
          transform: translateX(4px);
        }

        .pdtab-row-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .pdtab-step-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #64748b;
          background: #f1f5f9;
          flex-shrink: 0;
          margin-top: 1px;
          transition: all 250ms ease;
        }
        .pdtab-step-badge.is-active {
          background: #e01117;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(224, 17, 23, 0.28);
        }

        .pdtab-row-title {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.35;
          letter-spacing: -0.01em;
          transition: color 200ms ease;
        }
        .pdtab-row.is-active .pdtab-row-title {
          color: #0b1c3d;
        }

        .pdtab-inline-desc {
          font-size: 13px;
          color: #475569;
          line-height: 1.55;
          margin: 6px 0 0;
          font-weight: 400;
          animation: pdtabFadeIn 250ms ease;
        }
        @keyframes pdtabFadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pdtab-media {
          position: relative;
          min-height: 280px;
          background: #0b1c3d;
          overflow: hidden;
        }
        .pdtab-slide {
          position: absolute;
          inset: 0;
          padding: 14px;
        }

        .pdtab-image-frame {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
        }

        .pdtab-media-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          z-index: 3;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(11, 28, 61, 0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .pdtab-media-tag {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #93c5fd;
          margin-bottom: 2px;
        }
        .pdtab-media-stat {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.25;
        }

        @media (min-width: 750px) {
          .pdtab-grid {
            grid-template-columns: 1.15fr 0.85fr;
            min-height: 380px;
          }
          .pdtab-content {
            padding: 30px 28px;
            border-radius: 16px 0 0 16px;
            border-right: 2.5px solid #e01117;
          }
          .pdtab-media {
            min-height: 380px;
          }
          .pdtab-slide {
            padding: 16px;
          }
          .pdtab-row {
            padding: 14px 18px;
          }
          .pdtab-row-title {
            font-size: 16px;
          }
          .pdtab-media-stat {
            font-size: 15px;
          }
        }

        @media (min-width: 992px) {
          .pdtab-grid {
            grid-template-columns: 1.18fr 0.82fr;
            min-height: 410px;
          }
          .pdtab-content {
            padding: 32px 36px;
          }
          .pdtab-media {
            min-height: 410px;
          }
          .pdtab-slide {
            padding: 18px;
          }
          .pdtab-row-title {
            font-size: 17px;
          }
          .pdtab-media-stat {
            font-size: 16px;
          }
        }
      `}</style>
    </section>
  );
}
