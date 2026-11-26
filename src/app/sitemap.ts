import { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/research-cms";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fernandocapital.web.id";
  const publishedArticles = await getPublishedArticles(500);

  const articleEntries: MetadataRoute.Sitemap = publishedArticles.map((art) => ({
    url: `${baseUrl}/research/${art.slug}`,
    lastModified: art.updatedAt || art.publishedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...articleEntries,
  ];
}
