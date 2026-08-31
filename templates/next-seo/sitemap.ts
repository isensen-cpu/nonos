import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/site.config';

/**
 * app/sitemap.ts 로 복사. `/sitemap.xml` 로 자동 서빙된다.
 * 배포 후 Search Console에 제출할 것. (docs/seo/04 §7)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1페이지 1키워드 원칙에 따라 만든 정적 페이지들
  const routes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/menu', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/location', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
  ];

  return routes.map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // 블로그 등 동적 경로가 있으면 여기서 목록을 불러와 concat 한다.
}
