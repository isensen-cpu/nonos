import type { Metadata } from 'next';
import { siteConfig } from './site.config';

type BuildMetadataInput = {
  /** 50~60자. 타깃 키워드를 앞쪽에, 브랜드는 뒤에 */
  title: string;
  /** 120~155자. 순위가 아니라 클릭률(CTR)에 영향을 준다 */
  description?: string;
  /** 사이트 루트 기준 경로 (예: '/menu') */
  path?: string;
  image?: string;
  noIndex?: boolean;
};

/**
 * 페이지 메타데이터 생성.
 * canonical을 절대 URL로 항상 넣어 중복 색인을 막는다. (docs/seo/04 §1)
 */
export function buildMetadata({
  title, description, path = '/', image, noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = `${siteConfig.url}${path}`;
  const desc = description ?? siteConfig.description;
  const ogImage = image ?? siteConfig.ogImage;

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      type: 'website',
      url,
      siteName: siteConfig.name,
      title,
      description: desc,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [ogImage] },
  };
}

/** 홈 페이지용 — Tier S 키워드 1개를 앞에 둔다 */
export const homeMetadata = buildMetadata({
  title: `${siteConfig.name} - 포트무디 한식당 | 김치찌개·한식 BBQ`,
  path: '/',
});
