import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";
import { FeatureRow } from "@/components/FeatureRow";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen flex flex-col">
      <LiquidEffectAnimation />
      
      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="min-h-[50vh] flex flex-col items-center justify-center px-6 pt-20 pb-12">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 text-center tracking-tight leading-tight max-w-[calc(100vw-6rem)]">
            {t('hero.title')}
          </h1>
          <p className="mt-6 font-body text-lg md:text-xl text-slate-700 text-center max-w-2xl leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </section>

        {/* Feature Rows - Vertical Scroll */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            {/* Row 1: Learn Subjects in English */}
            <FeatureRow
              title={t('features.learnSubjects.title')}
              description={t('features.learnSubjects.description')}
              buttonText={t('features.learnSubjects.button')}
              buttonVariant="ghost"
              buttonColor="slate"
              imageUrl="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80"
              imageAlt="Student studying with books"
              href="/learn-subjects"
            />

            {/* Row 2: Fund Girl's Education (Reversed) */}
            <FeatureRow
              title={t('features.fundEducation.title')}
              description={t('features.fundEducation.description')}
              buttonText={t('features.fundEducation.button')}
              buttonVariant="ghost"
              buttonColor="rose"
              imageUrl="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80"
              imageAlt="Children in classroom"
              reversed
            />

            {/* Row 3: Learn About Japan */}
            <FeatureRow
              title={t('features.learnJapan.title')}
              description={t('features.learnJapan.description')}
              buttonText={t('features.learnJapan.button')}
              buttonVariant="ghost"
              buttonColor="indigo"
              imageUrl="https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80"
              imageAlt="Traditional Japanese architecture"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
