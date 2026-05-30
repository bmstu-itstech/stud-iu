import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
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

export default async function PartnersListPage() {
  const partners = await db.partner.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Title className="!text-3xl sm:!text-5xl mb-2 sm:mb-3 tracking-tight">
            Партнеры
          </Title>
          <Text className="!text-lg sm:!text-xl text-gray-500 font-medium">
            Компании, с которыми мы работаем
          </Text>
        </div>
        <Link
          href="/admin/partners/new"
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-10 sm:py-5 rounded-3xl shadow-xl shadow-blue-200 transition-all active:scale-95"
        >
          <PlusIcon />
          <span className="font-bold text-lg sm:text-xl">
            Добавить партнера
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center gap-6 sm:gap-8 text-center group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
          >
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center bg-gray-50 rounded-3xl p-6 group-hover:scale-105 transition-transform duration-300">
              <Image
                src={getImageUrl(partner.image)}
                width={200}
                height={200}
                className="object-contain w-full h-full"
                alt={partner.name}
              />
            </div>
            <Title className="!text-xl sm:!text-2xl line-clamp-1">
              {partner.name}
            </Title>

            <div className="w-full pt-4 border-t border-gray-100 mt-auto">
              <AdminActions
                id={partner.id}
                basePath="/admin/partners"
                apiPath="/partners"
              />
            </div>
          </div>
        ))}

        {partners.length === 0 && (
          <div className="col-span-full p-12 sm:p-32 text-center text-gray-400 text-xl sm:text-2xl font-medium border-2 border-dashed border-gray-200 rounded-[3rem]">
            Список партнеров пуст
          </div>
        )}
      </div>
    </div>
  );
}
