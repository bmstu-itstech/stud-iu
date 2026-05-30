export interface LinkProps {
  label: string;
  href: string;
}

const links: LinkProps[] = [
  { label: "О нас", href: "/#about" },
  { label: "Новости", href: "/#news" },
  { label: "Мероприятия", href: "/events" },
  { label: "Контакты", href: "/#contacts" },
];

export default links;
