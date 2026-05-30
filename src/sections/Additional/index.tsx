'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { usePartners } from '@/shared/hooks/usePartners';
import { useHorizontalScroll } from '@/shared/utils';

import { Text, Title } from '@/shared/ui/Typography';
import Contact from './components/Contact';
import contacts from './contacts';
import { getImageUrl } from "@/shared/utils/getImageUrl";

const Additional: FC = () => {
    const { data: partners, isLoading, isError } = usePartners(12);

    const partnersScrollRef = useHorizontalScroll();
    const contactsScrollRef = useHorizontalScroll();

    return (
        <section
            id="additional"
            className="flex flex-col w-full mx-auto px-6 py-40 pb-32 bg-gradient-to-b from-black to-blue-primary"
        >
            <div className="flex flex-col mx-auto w-full max-w-primary gap-24 overflow-hidden">

                <div className="space-y-16">
                    <Title level={1} className="text-white text-center sm:text-7xl">
                        Наши партнёры
                    </Title>

                    <div ref={partnersScrollRef} className="flex overflow-x-auto gap-8 py-2 pb-4 scrollbar-hide w-full h-fit justify-start sm:justify-center">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-40 h-40 bg-white/10 rounded-xl animate-pulse flex-shrink-0" />
                            ))
                        ) : isError ? (
                            <div className="flex items-center justify-center w-full">
                                <Text level={3} className="text-red-400 text-center">
                                    Не удалось загрузить партнёров
                                </Text>
                            </div>
                        ) : (
                            partners?.map((partner) => {
                                const Content = (
                                    <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center flex-shrink-0 p-4 hover:scale-105 transition-transform cursor-pointer">
                                        <Image
                                            width={120}
                                            height={120}
                                            src={getImageUrl(partner.image)}
                                            alt={partner.name}
                                            className="object-contain w-full h-full pointer-events-none"
                                        />
                                    </div>
                                );

                                if (partner.url) {
                                    return (
                                        <a key={partner.id} href={partner.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                            {Content}
                                        </a>
                                    );
                                }

                                return <div key={partner.id} className="shrink-0">{Content}</div>;
                            })
                        )}
                    </div>
                </div>

                <div className="space-y-16" id="contacts">
                    <Title level={1} className="text-white text-center sm:text-7xl">
                        Контакты
                    </Title>

                    <div ref={contactsScrollRef} className="flex overflow-x-auto lg:overflow-x-visible lg:flex-row lg:justify-between items-center gap-8 lg:gap-16 w-full max-w-[1600px] mx-auto pb-4 px-4 sm:px-0 snap-x snap-mandatory scrollbar-hide">
                        {contacts.map((contact) => (
                            <div key={contact.name} className="snap-center shrink-0">
                                <Contact {...contact} />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Additional;
