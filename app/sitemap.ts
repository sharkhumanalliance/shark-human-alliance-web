import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "es"];
  const routes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
    { path: "/purchase", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/registry", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/impact", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/faq", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/terms", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/cookie-policy", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "/membership", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/membership/Protected-friend-status", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/wanted", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/career", changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  return entries;
}