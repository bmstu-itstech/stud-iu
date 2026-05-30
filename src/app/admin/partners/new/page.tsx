"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";

import { Title, Text } from "@/shared/ui/Typography";
import apiClient from "@/shared/api/axios";

interface PartnerForm {
  name: string;
  url: string;
  image: FileList;
}

export default function CreatePartnerPage() {
  const router = useRouter();
  const { register, handleSubmit, watch } = useForm<PartnerForm>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const watchedName = watch("name");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const onSubmit = async (data: PartnerForm) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("url", data.url);

    if (data.image?.[0]) {
      formData.append("image", data.image[0]);
    }

    try {
      await apiClient.post("/partners", formData);

      toast.success("Партнер добавлен");
      router.push("/admin/partners");
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Ошибка при создании");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-auto lg:h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Title className="!text-3xl sm:!text-5xl tracking-tight">
          Добавить партнера
        </Title>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
        >
          {isSubmitting ? "Сохранение..." : "Создать"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-10 overflow-visible lg:overflow-hidden">
        <div className="w-full lg:w-1/2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm flex flex-col gap-8 border border-gray-200">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
              Название
            </label>
            <input
              {...register("name", { required: true })}
              className="p-6 bg-gray-50 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Название компании"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
              Веб-сайт
            </label>
            <input
              {...register("url")}
              className="p-6 bg-gray-50 rounded-2xl text-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
              Логотип
            </label>

            <input
              type="file"
              {...register("image", {
                required: true,
                onChange: (e) => handleImageChange(e),
              })}
              className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
            />
          </div>
        </div>

        <div className="hidden xl:flex w-1/2 bg-slate-900 rounded-[2.5rem] p-10 flex-col items-center justify-center relative shadow-2xl">
          <div className="absolute top-8 right-8 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-white tracking-widest uppercase">
            PREVIEW
          </div>

          <div className="w-64 h-64 bg-white rounded-3xl flex items-center justify-center p-8 shadow-2xl">
            {previewImage ? (
              <Image
                src={previewImage}
                width={200}
                height={200}
                alt="Logo"
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="text-gray-300 font-bold text-xl">Логотип</div>
            )}
          </div>
          <Text className="text-white mt-10 !text-3xl font-bold tracking-tight">
            {watchedName || "Название компании"}
          </Text>
        </div>
      </div>
    </div>
  );
}
