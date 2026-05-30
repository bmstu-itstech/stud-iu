"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Title, Text, Caption } from "@/shared/ui/Typography";

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Неверный логин или пароль");
      } else {
        toast.success("Добро пожаловать!");
        router.push("/admin/news");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px]">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/50">
        <div className="text-center mb-12">
          <Title level={2} className="mb-3">
            Вход
          </Title>
          <Caption level={1}>Панель администратора StudIU</Caption>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3">
            <Text
              level={3}
              className="font-bold text-gray-700 !text-3xl ml-1 uppercase tracking-wide"
            >
              Email
            </Text>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-4xl placeholder:text-gray-400"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-3">
            <Text
              level={3}
              className="font-bold text-gray-700 ml-1 !text-3xl uppercase tracking-wide"
            >
              Пароль
            </Text>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-4xl placeholder:text-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-6"
          >
            <Text level={3} className="!text-inherit !text-4xl">
              {isLoading ? "Вход..." : "Войти в систему"}
            </Text>
          </button>
        </form>
      </div>
      <div className="text-center mt-8">
        <Caption level={2}>&copy; 2025 ITS Tech</Caption>
      </div>
    </div>
  );
}
