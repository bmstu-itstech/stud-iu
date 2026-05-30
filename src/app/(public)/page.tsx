import About from "@/sections/About";
import Additional from "@/sections/Additional";
import Events from "@/sections/Events";
import News from "@/sections/News";
import EventsCarousel from "@/widgets/EventsCarousel";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <EventsCarousel />
      <About />
      <News />
      <Events />
      <Additional />
    </main>
  );
}
