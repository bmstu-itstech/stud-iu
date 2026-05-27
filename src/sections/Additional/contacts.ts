export interface ContactProps {
    avatarUrl: string;
    name: string;
    role: string;
    tg_link: string;
}

const contacts: ContactProps[] = [
    {
        avatarUrl: '/images/a_evdokimova.jpg',
        name: 'Анастасия Евдокимова',
        role: 'Председатель',
        tg_link: '@epkoliptik'
    },
    {
        avatarUrl: '/images/k_zhikharev.jpg',
        name: 'Кирилл Жихарев',
        role: 'Заместитель председателя',
        tg_link: '@zhikhkirill'
    },
    {
        avatarUrl: '/images/d_domnich.jpg',
        name: 'Данил Домнич',
        role: 'Внешние коммуникации',
        tg_link: '@h1rotik'
    },
];

export default contacts;
