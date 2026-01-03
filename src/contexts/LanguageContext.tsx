import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'jp';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

const translations: Record<Language, Record<string, any>> = {
  en: {
    hero: {
      title: "Sakura Learning Hub",
      subtitle: "Learn, Contribute, Discover."
    },
    features: {
      learnSubjects: {
        title: "Learn Subjects in English",
        description: "Book online lessons to study your school subjects using English.",
        button: "Start Learning →"
      },
      fundEducation: {
        title: "Fund Girl's Education",
        description: "Your donation empowers education for underprivileged girls in India, covering school fees and books.",
        button: "Contribute →"
      },
      learnJapan: {
        title: "Learn About Japan",
        description: "Explore travel insights, cultural wisdom, and the beauty of the Rising Sun.",
        button: "Explore →"
      }
    }
  },
  jp: {
    hero: {
      title: "サクラ・ラーニング・ハブ",
      subtitle: "学び、貢献し、発見する。"
    },
    features: {
      learnSubjects: {
        title: "英語で科目を学ぶ",
        description: "英語を使って学校の科目を学ぶオンラインレッスンを予約しましょう。",
        button: "学習を始める →"
      },
      fundEducation: {
        title: "女子教育への支援",
        description: "あなたの寄付が、インドの恵まれない少女たちの教育を支援します。",
        button: "寄付する →"
      },
      learnJapan: {
        title: "日本について学ぶ",
        description: "旅行の知識、文化的知恵、そして日出ずる国の美しさを探索しましょう。",
        button: "探索する →"
      }
    }
  }
};
