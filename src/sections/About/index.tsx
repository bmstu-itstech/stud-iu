'use client';
import Image from 'next/image';
import type { FC } from 'react';

import Button from '@/shared/ui/Button';
import { Text, Title } from '@/shared/ui/Typography';
import { cards } from './cards.usecase';
import Card from './components/Card';

const About: FC = () => {

    return (
        <section
            id="about"
            className="flex flex-col w-full mx-auto mt-24 sm:mt-48 px-6 2xl:px-0 max-w-primary gap-16"
        >
            <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="flex flex-col gap-8 order-2 lg:order-1">
                    <Title level={2} className="leading-tight">
                        <span className="text-blue-primary">Студ_ИУ</span> — это мы.
                        <br />
                        Наше время — действовать.
                    </Title>
                    <Text level={4} className="text-gray-600">
                        Мы — команда из 250 человек, развивающая IT-сообщество. Студсовет
                        объединяет инициативных ребят, готовых создавать проекты и
                        организовывать мероприятия.
                    </Text>
                    <div className="mt-4">
                        <Button variant="blue" size="full" className="w-full sm:w-auto" onClick={() => window.location.href = "https://forms.yandex.ru/u/69b154576d2d73185b353a95"}>
                            <Text level={4}>Стать активистом</Text>
                        </Button>
                    </div>
                </div>

                <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end group perspective-[2000px]">
                    <div className="relative transition-all duration-700 ease-out transform-style-3d group-hover:[transform:rotateY(-12deg)_rotateX(6deg)_scale(1.05)]">
                        <Image
                            src="/images/team.png"
                            className="rounded-2xl object-cover shadow-2xl transition-shadow duration-700 ease-out group-hover:shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.3)]"
                            width={600}
                            height={450}
                            alt="Команда Студсовета"
                            priority
                        />

                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Card {...card} key={card.title} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
