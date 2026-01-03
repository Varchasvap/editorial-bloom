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
    },
    learnSubjects: {
      pageTitle: "Sakura Learning Hub",
      pageSubtitle: "Select your subject and preferred time. We will confirm your slot via email.",
      backToHome: "Back to Home",
      whatToStudy: "What do you want to study?",
      subjects: {
        math: "Math",
        science: "Science",
        english: "English Support",
        social: "Social Studies",
        other: "Other"
      },
      studentDetails: "Student Details",
      studentName: "Student Name",
      studentNamePlaceholder: "Enter student's name",
      age: "Age",
      selectAge: "Select age",
      topic: "Topic",
      topicPlaceholder: "What do you want to learn today?",
      timePreferences: "Time Preferences",
      preferredDate: "Preferred Date",
      preferredTime: "Preferred Start Time",
      flexibleTime: "I am flexible (Open to rescheduling)",
      contactInfo: "Contact Information",
      email: "Email Address",
      emailPlaceholder: "your@email.com",
      lineOrPhone: "LINE ID or Phone",
      lineOrPhonePlaceholder: "LINE ID or phone number",
      optional: "(Optional)",
      submit: "Send Booking Request",
      submitting: "Sending...",
      validationError: "Please fill in all required fields.",
      successTitle: "Thank You!",
      successDescription: "Your request has been sent. We will email you shortly to confirm your lesson time.",
      toastSuccess: "Request Sent! We will email you shortly.",
      toastError: "Error: Connection failed"
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
    },
    learnSubjects: {
      pageTitle: "サクラ・ラーニング・ハブ",
      pageSubtitle: "科目とご希望の時間を選択してください。メールで確認のご連絡をいたします。",
      backToHome: "ホームに戻る",
      whatToStudy: "何を勉強したいですか？",
      subjects: {
        math: "数学",
        science: "理科",
        english: "英語サポート",
        social: "社会",
        other: "その他"
      },
      studentDetails: "生徒情報",
      studentName: "生徒名",
      studentNamePlaceholder: "生徒の名前を入力",
      age: "年齢",
      selectAge: "年齢を選択",
      topic: "トピック",
      topicPlaceholder: "今日は何を学びたいですか？",
      timePreferences: "時間の希望",
      preferredDate: "希望日",
      preferredTime: "希望開始時間",
      flexibleTime: "柔軟に対応可能（日程変更可）",
      contactInfo: "連絡先情報",
      email: "メールアドレス",
      emailPlaceholder: "your@email.com",
      lineOrPhone: "LINE IDまたは電話番号",
      lineOrPhonePlaceholder: "LINE IDまたは電話番号",
      optional: "（任意）",
      submit: "予約リクエストを送信",
      submitting: "送信中...",
      validationError: "必須項目をすべて入力してください。",
      successTitle: "ありがとうございます！",
      successDescription: "リクエストを受け付けました。レッスン時間の確認のため、メールでご連絡いたします。",
      toastSuccess: "リクエスト送信完了！まもなくメールでご連絡いたします。",
      toastError: "エラー：接続に失敗しました"
    }
  }
};
