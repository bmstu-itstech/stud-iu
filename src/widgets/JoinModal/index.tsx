"use client";

import { type FC, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Title, Text } from "@/shared/ui/Typography";
import Button from "@/shared/ui/Button";
import apiClient from "@/shared/api/axios";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Inputs = {
  name: string;
  group: string;
  telegram: string;
  vk_link: string;
  department: string;
  answers: Record<string, any>;
  agreement: boolean;
};

const DEPARTMENTS = [
  { id: "SCIENCE", label: "Научный отдел" },
  { id: "ITS", label: "ITS Tech (IT)" },
  { id: "MEDIA", label: "Медиа-центр" },
  { id: "PARTNERS", label: "Внешние связи" },
  { id: "EVENT", label: "Культ-масс (Event)" },
  { id: "SPORT", label: "Спорт / Киберспорт" },
];

const inputClasses =
  "w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500/20 rounded-[2rem] outline-none transition-all font-bold text-2xl placeholder:text-gray-300 text-gray-900";
const labelClasses =
  "block text-lg font-extrabold text-gray-400 uppercase tracking-widest ml-4 mb-3";
const checkboxClasses = "w-6 h-6 accent-blue-600 cursor-pointer";

const JoinModal: FC<JoinModalProps> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, watch, reset } = useForm<Inputs>({
    defaultValues: {
      department: "SCIENCE",
      agreement: false,
    },
  });

  const selectedDept = watch("department");

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await apiClient.post("/join", {
        ...data,
        answers: data.answers,
      });
      toast.success("Заявка отправлена!");
      onClose();
    } catch (e) {
      toast.error("Ошибка отправки");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div>
            <Title level={2} className="!text-4xl sm:!text-5xl tracking-tight">
              Стать частью команды
            </Title>
            <Text
              level={3}
              className="text-gray-400 mt-2 font-medium !text-3xl"
            >
              Заполни анкету, и мы максимально оперативно свяжемся с тобой
            </Text>
          </div>
          <button
            onClick={onClose}
            className="w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 text-3xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-10 py-10 custom-scrollbar">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-12"
          >
            <div className="space-y-4">
              <label className={labelClasses}>
                Какое направление интересует?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {DEPARTMENTS.map((dept) => (
                  <label
                    key={dept.id}
                    className={`cursor-pointer p-8 rounded-[2rem] border-4 transition-all flex items-center justify-center text-center font-bold text-2xl shadow-sm hover:shadow-lg hover:scale-[1.01] ${
                      selectedDept === dept.id
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      value={dept.id}
                      {...register("department")}
                      className="hidden"
                    />
                    {dept.label}
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className={labelClasses}>ФИО</label>
                <input
                  {...register("name", { required: true })}
                  className={inputClasses}
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>Учебная группа</label>
                <input
                  {...register("group", { required: true })}
                  className={inputClasses}
                  placeholder="ИУ1-11Б"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>Telegram</label>
                <input
                  {...register("telegram", { required: true })}
                  className={inputClasses}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>VK (опционально)</label>
                <input
                  {...register("vk_link")}
                  className={inputClasses}
                  placeholder="Ссылка на профиль"
                />
              </div>
            </div>

            <div className="bg-gray-50/50 border border-gray-100 rounded-[3rem] p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {selectedDept === "SCIENCE" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClasses}>Что тебе интереснее?</label>
                    <div className="relative">
                      <select
                        {...register("answers.science_role")}
                        className={`${inputClasses} appearance-none cursor-pointer`}
                      >
                        <option value="Конференции">
                          Организация научных конференций
                        </option>
                        <option value="Преподавание">
                          Преподавание и менторство
                        </option>
                        <option value="Статьи">
                          Написание статей / Поиск научрука
                        </option>
                      </select>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      Твои академические интересы
                    </label>
                    <textarea
                      {...register("answers.science_interests")}
                      className={`${inputClasses} min-h-[160px] resize-none`}
                      placeholder="ИИ, Робототехника, Математика..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      Был ли опыт выступлений?
                    </label>
                    <textarea
                      {...register("answers.science_exp")}
                      className={`${inputClasses} min-h-[160px] resize-none`}
                    />
                  </div>
                </>
              )}

              {selectedDept === "ITS" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      Ссылка на GitHub / GitLab
                    </label>
                    <input
                      {...register("answers.its_github")}
                      className={inputClasses}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClasses}>
                      Какие направления интересуют?
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        "Бекенд",
                        "Фронтенд",
                        "UI/UX",
                        "DevOps",
                        "Mobile",
                        "QA",
                      ].map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all"
                        >
                          <input
                            type="checkbox"
                            value={role}
                            {...register("answers.its_roles")}
                            className={checkboxClasses}
                          />
                          <span className="font-bold text-xl text-gray-700">
                            {role}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      Расскажи о своём опыте (стек)
                    </label>
                    <textarea
                      {...register("answers.its_exp")}
                      className={`${inputClasses} min-h-[200px] resize-none`}
                      placeholder="Языки, фреймворки, пет-проекты..."
                    />
                  </div>
                </>
              )}

              {selectedDept === "MEDIA" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      Ссылка на портфолио{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("answers.media_portfolio", {
                        required: selectedDept === "MEDIA",
                      })}
                      className={inputClasses}
                      placeholder="Google Disk, Behance, VK..."
                    />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClasses}>
                      Направления (можно несколько)
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        "Фото",
                        "Видео",
                        "Монтаж",
                        "Дизайн",
                        "Копирайтинг",
                        "SMM",
                      ].map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all"
                        >
                          <input
                            type="checkbox"
                            value={role}
                            {...register("answers.media_roles")}
                            className={checkboxClasses}
                          />
                          <span className="font-bold text-xl text-gray-700">
                            {role}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>Софт и техника</label>
                    <input
                      {...register("answers.media_soft")}
                      className={inputClasses}
                      placeholder="Photoshop, Figma, Sony A7..."
                    />
                  </div>
                </>
              )}

              {selectedDept === "PARTNERS" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      Есть ли опыт общения с партнерами?
                    </label>
                    <textarea
                      {...register("answers.partners_exp")}
                      className={`${inputClasses} min-h-[160px] resize-none`}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClasses}>
                      Навык деловой переписки (1-5)
                    </label>
                    <div className="flex gap-6">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <label
                          key={num}
                          className="cursor-pointer flex-1 bg-white py-6 rounded-[2rem] text-center font-extrabold text-2xl text-gray-600 shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all border-2 border-transparent hover:border-blue-200"
                        >
                          <input
                            type="radio"
                            value={num}
                            {...register("answers.partners_skill")}
                            className="hidden"
                          />
                          {num}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      Мини-кейс: Пишем в Red Bull. Тема и первое предложение?
                    </label>
                    <textarea
                      {...register("answers.partners_case")}
                      className={`${inputClasses} min-h-[200px] resize-none`}
                      placeholder="Тема: ... Текст: ..."
                    />
                  </div>
                </>
              )}

              {selectedDept === "EVENT" && (
                <>
                  <div className="space-y-4">
                    <label className={labelClasses}>Какая роль ближе?</label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        "Организатор",
                        "Сценарист",
                        "Тех. группа",
                        "Ведущий/Артист",
                      ].map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all"
                        >
                          <input
                            type="checkbox"
                            value={role}
                            {...register("answers.event_roles")}
                            className={checkboxClasses}
                          />
                          <span className="font-bold text-xl text-gray-700">
                            {role}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className={labelClasses}>Твои скиллы</label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        "Сценарии",
                        "Звук/Свет",
                        "Декорации",
                        "Танцы/Постановка",
                        "Решение проблем",
                      ].map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all"
                        >
                          <input
                            type="checkbox"
                            value={skill}
                            {...register("answers.event_skills")}
                            className={checkboxClasses}
                          />
                          <span className="font-bold text-xl text-gray-700">
                            {skill}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      Твой самый крутой ивент (опыт)
                    </label>
                    <textarea
                      {...register("answers.event_exp")}
                      className={`${inputClasses} min-h-[160px] resize-none`}
                    />
                  </div>
                </>
              )}

              {selectedDept === "SPORT" && (
                <>
                  <div className="space-y-4">
                    <label className={labelClasses}>Что интересует?</label>
                    <div className="flex gap-6">
                      <label className="cursor-pointer flex-1 bg-white p-6 rounded-[2rem] flex items-center justify-center gap-4 shadow-sm font-bold text-xl text-gray-600 hover:text-blue-600 transition-all border-2 border-transparent hover:border-blue-200">
                        <input
                          type="radio"
                          value="Спорт"
                          {...register("answers.sport_type")}
                          className={checkboxClasses}
                        />
                        Классический спорт
                      </label>
                      <label className="cursor-pointer flex-1 bg-white p-6 rounded-[2rem] flex items-center justify-center gap-4 shadow-sm font-bold text-xl text-gray-600 hover:text-blue-600 transition-all border-2 border-transparent hover:border-blue-200">
                        <input
                          type="radio"
                          value="Киберспорт"
                          {...register("answers.sport_type")}
                          className={checkboxClasses}
                        />
                        Киберспорт
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className={labelClasses}>Роль</label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        "Организатор",
                        "Судья/Админ",
                        "Комментатор",
                        "Дизайнер",
                      ].map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all"
                        >
                          <input
                            type="checkbox"
                            value={role}
                            {...register("answers.sport_roles")}
                            className={checkboxClasses}
                          />
                          <span className="font-bold text-xl text-gray-700">
                            {role}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>
                      В каких дисциплинах разбираешься?
                    </label>
                    <input
                      {...register("answers.sport_disciplines")}
                      className={inputClasses}
                      placeholder="Волейбол, Dota 2, CS2..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex items-start gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("agreement", { required: true })}
                  className="w-6 h-6 mt-1 accent-blue-600 rounded-lg cursor-pointer shrink-0"
                />
                <span className="text-gray-500 text-lg font-medium select-none">
                  Нажимая кнопку, я даю согласие на обработку моих персональных
                  данных в соответствии с
                  <Link
                    href="/policy"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-700 underline mx-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Политикой конфиденциальности
                  </Link>
                  и Федеральным законом от 27.07.2006 года №152-ФЗ.
                </span>
              </label>

              <Button
                variant="blue"
                size="full"
                type="submit"
                className="text-3xl py-8 rounded-[2.5rem] shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                <span className="font-bold">Отправить анкету</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinModal;
