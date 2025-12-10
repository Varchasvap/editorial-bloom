import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";
import { FeatureRow } from "@/components/FeatureRow";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <LiquidEffectAnimation />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[50vh] flex flex-col items-center justify-center px-6 pt-20 pb-12">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 text-center tracking-tight leading-tight">
            Learn, <span className="italic">Contribute</span>, Discover.
          </h1>
          <p className="mt-6 font-body text-lg md:text-xl text-slate-700 text-center max-w-2xl leading-relaxed">
            A platform for learning, meaningful giving, and cultural exploration.
          </p>
        </section>

        {/* Feature Rows - Vertical Scroll */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            {/* Row 1: Learn Subjects in English */}
            <FeatureRow
              title="Learn Subjects in English"
              description="Book online lessons to study your school subjects using English."
              buttonText="Start Learning →"
              buttonVariant="ghost"
              buttonColor="slate"
              imageUrl="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80"
              imageAlt="Student studying with books"
            />

            {/* Row 2: Fund Girl's Education (Reversed) */}
            <FeatureRow
              title="Fund Girl's Education"
              description="Your gift funds education for poor girls in India—covering school fees and books."
              buttonText="Contribute →"
              buttonVariant="ghost"
              buttonColor="rose"
              imageUrl="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80"
              imageAlt="Children in classroom"
              reversed
            />

            {/* Row 3: Learn About Japan */}
            <FeatureRow
              title="Learn About Japan"
              description="Explore travel insights, cultural wisdom, and the beauty of the Rising Sun."
              buttonText="Explore →"
              buttonVariant="ghost"
              buttonColor="indigo"
              imageUrl="https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80"
              imageAlt="Traditional Japanese architecture"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
