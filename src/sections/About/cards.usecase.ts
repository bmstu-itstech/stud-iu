export interface CardProps {
  title: string;
  description: string;
  caption: string;
  href: string;
}

export const cards: CardProps[] = [
  {
    title: "250 человек",
    description: "Активных студентов, которые работают на результат",
    caption: "Присоединиться к команде",
    href: "https://t.me/studsovet_iu",
  },
  {
    title: "50 мероприятий",
    description: "Проводим в дверях Бауманки за год",
    caption: "Посмотреть все",
    href: "/events",
  },
  {
    title: "∞ идей",
    description: "Генерируем и воплощаем каждый день",
    caption: "Предложить свою",
    href: "/#contacts",
  },
  {
    title: "24/7",
    description: "На связи со студентами и деканатом",
    caption: "Написать нам",
    href: "/#contacts",
  },
];

export default cards;
