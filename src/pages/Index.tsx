import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";
import { NavigationCard } from "@/components/NavigationCard";
import { BookOpen, Heart, Flower2 } from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <LiquidEffectAnimation />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-20 pb-12">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 text-center tracking-tight leading-tight">
            Learn, <span className="italic">Contribute</span>, Discover.
          </h1>
          <p className="mt-6 font-body text-lg md:text-xl text-slate-600 text-center max-w-2xl leading-relaxed">
            A platform for learning, meaningful giving, and cultural exploration.
          </p>
        </section>

        {/* Navigation Cards */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <NavigationCard
              title="Learn Subjects in English"
              description="Book online lessons to study your school subjects using English."
              icon={BookOpen}
              iconColor="blue"
            />
            <NavigationCard
              title="Fund Girl's Education"
              description="Your gift funds education for poor girls in India—covering school fees and books."
              icon={Heart}
              iconColor="rose"
            />
            <NavigationCard
              title="Learn About Japan"
              description="Explore travel insights, cultural wisdom, and the beauty of the Rising Sun."
              icon={Flower2}
              iconColor="purple"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
