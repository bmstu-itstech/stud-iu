export interface CardProps {
  title: string;
  description: string;
  caption: string;
  href: string;
}

export const cards: CardProps[] = [
  {
    title: "250 активистов",
    description: "сплочённая команда, работающая на результат",
    caption: "Присоединиться к команде",
    href: "https://t.me/studsovet_iu",
  },
  {
    title: "50 мероприятий",
    description: "проводим в стенах Бауманки за год",
    caption: "Посмотреть все",
    href: "/events",
  },
  {
    title: "∞ идей",
    description: "генерируем и воплощаем каждый день",
    caption: "Предложить свою",
    href: "/#contacts",
  },
  {
    title: "24/7",
    description: "на связи со студентами и деканатом",
    caption: "Написать нам",
    href: "/#contacts",
  },
];

export default cards;
