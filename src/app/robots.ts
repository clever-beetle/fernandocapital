import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Jangan telusuri halaman rahasia API
    },
    sitemap: 'https://fernando-capital.vercel.app/sitemap.xml',
  };
}
