import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/site.config';

/**
 * app/robots.ts 로 복사. `/robots.txt` 로 자동 서빙된다.
 *
 * ⚠️ 가장 흔한 사고: 스테이징의 전체 차단 설정이 운영에 그대로 배포되는 것.
 *    배포 후 반드시 브라우저로 /robots.txt 를 직접 열어 확인한다.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

  if (!isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
