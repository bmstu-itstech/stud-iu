"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Title, Text } from "@/shared/ui/Typography";
import apiClient from "@/shared/api/axios";
import { formatDate } from "@/shared/utils";

const DEPARTMENTS: Record<string, string> = {
  SCIENCE: "Наука",
  ITS: "ITS Tech",
  MEDIA: "Медиа",
  PARTNERS: "Партнеры",
  EVENT: "Event",
  SPORT: "Спорт",
};

const STATUSES: Record<string, string> = {
  NEW: "Новая",
  VIEWED: "Просмотрено",
  CONTACTED: "Связались",
  INTERVIEW: "Собеседование",
  ACCEPTED: "Принят",
  REJECTED: "Отказ",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  VIEWED: "bg-gray-100 text-gray-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  INTERVIEW: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDept, setFilterDept] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (filterDept !== "ALL") params.append("department", filterDept);

      const res = await apiClient.get(`/join_requests?${params.toString()}`);
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterDept]);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterDept, fetchRequests]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <Title className="!text-3xl sm:!text-5xl mb-2 tracking-tight">
            Заявки
          </Title>
          <Text className="!text-lg sm:!text-xl text-gray-500 font-medium">
            Кандидаты в команду
          </Text>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-6 py-4 bg-white rounded-2xl font-bold text-gray-700 outline-none border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <option value="ALL">Все статусы</option>
            {Object.entries(STATUSES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full sm:w-auto px-6 py-4 bg-white rounded-2xl font-bold text-gray-700 outline-none border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <option value="ALL">Все направления</option>
            {Object.entries(DEPARTMENTS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider">
                  Кандидат
                </th>
                <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider">
                  Направление
                </th>
                <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider text-right">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Загрузка...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Заявок не найдено
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-6 sm:px-10 font-medium text-gray-500 whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-6 py-6 sm:px-10">
                      <div className="font-bold text-lg sm:text-xl text-gray-900">
                        {req.name}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {req.group}
                      </div>
                    </td>
                    <td className="px-6 py-6 sm:px-10">
                      <span className="font-bold text-gray-600 whitespace-nowrap">
                        {DEPARTMENTS[req.department] || req.department}
                      </span>
                    </td>
                    <td className="px-6 py-6 sm:px-10 whitespace-nowrap">
                      <span
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${STATUS_COLORS[req.status] || "bg-gray-100"}`}
                      >
                        {STATUSES[req.status] || req.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 sm:px-10 text-right">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="inline-block bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-2xl font-bold transition-colors"
                      >
                        Открыть
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
