

## Update Booking Success Message

**What changes:**
Update the success modal body text in the LanguageContext translations file for both English and Japanese.

**Technical Details:**

File: `src/contexts/LanguageContext.tsx`

- Change `en.learnSubjects.successDescription` from the current text to: `"Thank you for booking! You will be notified via email shortly."`
- Change `jp.learnSubjects.successDescription` from the current text to: `"ご予約ありがとうございます！まもなくメールでご連絡いたします。"`
- The modal title ("Thank You!" / "ありがとうございます！") remains unchanged.

No other files need modification since `LearnSubjects.tsx` already references `t("learnSubjects.successTitle")` and `t("learnSubjects.successDescription")` for the modal.
