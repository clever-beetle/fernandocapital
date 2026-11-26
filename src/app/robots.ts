import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/studio", "/settings"],
    },
    sitemap: "https://fernandocapital.web.id/sitemap.xml",
  };
}
