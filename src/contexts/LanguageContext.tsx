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
      timeDuration: "(Total duration of the lesson will be 45 minutes)",
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
      successDescription: "Thank you for booking! We will inform you about meeting details within 12 hours.",
      toastSuccess: "Request Sent! We will email you shortly.",
      toastError: "Error: Connection failed",
      dbError: "Failed to save booking. Please try again.",
      emailError: "Booking saved, but confirmation email failed. We'll follow up manually.",
      noAvailableDates: "No available dates at the moment. Please check back later.",
      upload: {
        title: "Upload Questions/Materials (Optional)",
        dragDrop: "Drag & drop files here or click to browse",
        fileTypes: "PDF, Word, Images (max 5MB per file)",
        maxFiles: "Maximum 3 files",
        remove: "Remove",
        uploading: "Uploading...",
        tooLarge: "File too large (max 5MB)",
        typeNotAllowed: "File type not allowed",
        uploadFailed: "Upload failed. Please try again."
      }
    },
    admin: {
      loading: "Loading...",
      backToHome: "Back to Home",
      loginTitle: "Admin Login",
      loginSubtitle: "Sign in to manage your availability calendar",
      signupTitle: "Create Admin Account",
      signupSubtitle: "Set up your admin account to manage availability",
      email: "Email",
      password: "Password",
      passwordHint: "Password must be at least 6 characters",
      signIn: "Sign In",
      signUp: "Sign Up",
      signingIn: "Signing in...",
      signingUp: "Creating account...",
      loginSuccess: "Welcome back!",
      loginError: "Login failed. Please check your credentials.",
      signupSuccess: "Account created! You are now logged in.",
      signupError: "Sign up failed. Please try again.",
      logoutSuccess: "Logged out successfully",
      logout: "Logout",
      dashboardTitle: "Availability Manager",
      dashboardSubtitle: "Click dates to toggle availability for students",
      legendAvailable: "Available",
      legendAvailableDesc: "Students can book this date",
      legendBlocked: "Busy / Blocked",
      legendBlockedDesc: "Not available for booking",
      totalAvailable: "Total available",
      days: "days",
      dateAdded: "Date marked as available!",
      dateRemoved: "Date removed from availability",
      fetchError: "Failed to load availability",
      updateError: "Failed to update availability",
      instructions: "Click a date to make it available (green). Click again to remove it."
    },
    footer: {
      adminLogin: "Admin Login"
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
      timePreferences: "希望時間",
      timeDuration: "(1レッスンの時間は45分間です)",
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
      successDescription: "ご予約ありがとうございます。12時間以内にミーティングの詳細をご連絡いたします。",
      toastSuccess: "リクエスト送信完了！まもなくメールでご連絡いたします。",
      toastError: "エラー：接続に失敗しました",
      dbError: "予約の保存に失敗しました。もう一度お試しください。",
      emailError: "予約は保存されましたが、確認メールの送信に失敗しました。手動でフォローアップいたします。",
      noAvailableDates: "現在予約可能な日程がありません。後日ご確認ください。",
      upload: {
        title: "質問・資料をアップロード（任意）",
        dragDrop: "ファイルをドラッグ&ドロップまたはクリックして選択",
        fileTypes: "PDF、Word、画像（1ファイル最大5MB）",
        maxFiles: "最大3ファイル",
        remove: "削除",
        uploading: "アップロード中...",
        tooLarge: "ファイルが大きすぎます（最大5MB）",
        typeNotAllowed: "このファイル形式は使用できません",
        uploadFailed: "アップロードに失敗しました。もう一度お試しください。"
      }
    },
    admin: {
      loading: "読み込み中...",
      backToHome: "ホームに戻る",
      loginTitle: "管理者ログイン",
      loginSubtitle: "カレンダーを管理するためにサインインしてください",
      signupTitle: "管理者アカウント作成",
      signupSubtitle: "予約管理用のアカウントを設定してください",
      email: "メールアドレス",
      password: "パスワード",
      passwordHint: "パスワードは6文字以上必要です",
      signIn: "サインイン",
      signUp: "新規登録",
      signingIn: "サインイン中...",
      signingUp: "アカウント作成中...",
      loginSuccess: "おかえりなさい！",
      loginError: "ログインに失敗しました。認証情報を確認してください。",
      signupSuccess: "アカウントが作成されました！ログイン完了です。",
      signupError: "登録に失敗しました。もう一度お試しください。",
      logoutSuccess: "ログアウトしました",
      logout: "ログアウト",
      dashboardTitle: "予約可能日管理",
      dashboardSubtitle: "日付をクリックして生徒への公開状態を切り替えます",
      legendAvailable: "予約可能",
      legendAvailableDesc: "生徒が予約できます",
      legendBlocked: "予定あり / ブロック",
      legendBlockedDesc: "予約不可",
      totalAvailable: "予約可能日数",
      days: "日",
      dateAdded: "予約可能日として追加しました！",
      dateRemoved: "予約可能日から削除しました",
      fetchError: "予約可能日の読み込みに失敗しました",
      updateError: "予約可能日の更新に失敗しました",
      instructions: "日付をクリックして予約可能（緑）にします。もう一度クリックで削除します。"
    },
    footer: {
      adminLogin: "管理者ログイン"
    }
  }
};
