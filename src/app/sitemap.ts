import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stud-iu.ru";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const news = await db.news.findMany({
      select: { id: true, created_at: true },
    });
    newsEntries = news.map((item) => ({
      url: `${baseUrl}/news/${item.id}`,
      lastModified: new Date(item.created_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Ошибка при генерации sitemap для новостей:", error);
  }

  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const events = await db.event.findMany({
      select: { id: true, type: true, start_datetime: true },
    });
    eventEntries = events.map((event) => {
      const subPath = event.type === "FUTURE" ? "future" : "past";
      return {
        url: `${baseUrl}/events/${subPath}/${event.id}`,
        lastModified: new Date(event.start_datetime),
        changeFrequency: "weekly",
        priority: 0.6,
      };
    });
  } catch (error) {
    console.error("Ошибка при генерации sitemap для мероприятий:", error);
  }

  return [...staticRoutes, ...newsEntries, ...eventEntries];
}
