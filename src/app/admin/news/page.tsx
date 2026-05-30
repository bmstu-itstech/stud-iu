import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatDate } from "@/shared/utils";
import { Title, Text } from "@/shared/ui/Typography";
import { AdminActions } from "@/shared/ui/AdminActions";
import { getImageUrl } from "@/shared/utils/getImageUrl";

const PlusIcon = () => (
  <svg
    className="w-7 h-7"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const news = await db.news.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Title className="!text-3xl sm:!text-5xl mb-2 sm:mb-3 tracking-tight">
            Новости
          </Title>
          <Text className="!text-lg sm:!text-xl text-gray-500 font-medium">
            Управление новостной лентой
          </Text>
        </div>
        <Link
          href="/admin/news/new"
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-10 sm:py-5 rounded-3xl shadow-xl shadow-blue-200 transition-all active:scale-95"
        >
          <PlusIcon />
          <span className="font-bold text-lg sm:text-xl">Создать новость</span>
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider w-[180px]">
                  Обложка
                </th>
                <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider w-1/2">
                  Контент
                </th>
                <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider text-right">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gray-100 relative border border-gray-200 shrink-0 shadow-sm">
                      {item.cover_url ? (
                        <Image
                          src={getImageUrl(item.cover_url)}
                          fill
                          className="object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-lg">
                          NO IMG
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                    <Title className="line-clamp-1 mb-3 !text-xl sm:!text-2xl !leading-tight">
                      {item.title}
                    </Title>
                    <Text className="text-gray-500 line-clamp-2 leading-relaxed !text-base sm:!text-lg font-medium">
                      {item.description || "Нет описания"}
                    </Text>
                  </td>

                  <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle whitespace-nowrap">
                    <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl text-sm sm:text-lg font-bold">
                      {formatDate(item.created_at)}
                    </span>
                  </td>

                  <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle text-right">
                    <AdminActions
                      id={item.id}
                      basePath="/admin/news"
                      apiPath="/news"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {news.length === 0 && (
            <div className="p-12 sm:p-24 text-center text-gray-400 text-xl sm:text-2xl font-medium">
              Список новостей пуст
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
