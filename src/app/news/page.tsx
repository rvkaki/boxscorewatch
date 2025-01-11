import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/server";

export default async function NewsPage() {
  const latestNews = await api.league.getLatestNews();

  return (
    <main className="flex h-full w-full max-w-7xl flex-col items-start justify-center py-6 text-white md:py-12">
      <p className="text-lg font-bold">Latest News</p>
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
        {latestNews.map((news) => (
          <Link
            key={news.title}
            href={news.link}
            target="_blank"
            className="flex w-full flex-col overflow-hidden rounded-md border border-neutral-700 hover:brightness-125"
          >
            {news.imageUrl && (
              <div className="relative aspect-video w-full">
                <Image
                  src={news.imageUrl}
                  alt={news.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}

            <div className="w-full flex-1 bg-neutral-900 px-4 py-3">
              <p className="font-bold">{news.title}</p>
              <p className="text-sm text-neutral-400">
                {format(new Date(news.date), "PP")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
