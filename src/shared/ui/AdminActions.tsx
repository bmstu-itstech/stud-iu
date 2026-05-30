"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import apiClient from "@/shared/api/axios";

interface AdminActionsProps {
  id: number;
  basePath: string;
  apiPath: string;
}

export const AdminActions = ({ id, basePath, apiPath }: AdminActionsProps) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот элемент?")) return;

    try {
      await apiClient.delete(`${apiPath}/${id}`);
      toast.success("Успешно удалено");
      router.refresh();
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  const handleEdit = () => {
    router.push(`${basePath}/${id}`);
  };

  return (
    <div className="flex justify-end gap-2 sm:gap-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleEdit}
        className="text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors font-bold text-sm sm:text-lg"
      >
        Изменить
      </button>
      <button
        onClick={handleDelete}
        className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors font-bold text-sm sm:text-lg"
      >
        Удалить
      </button>
    </div>
  );
};
