import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import { supabase } from "@/integrations/supabase/client";
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calculator, Atom, BookOpen, Globe, MoreHorizontal, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TimeDrumPicker } from "@/components/TimeDrumPicker";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileUploadZone, type SelectedFile } from "@/components/FileUploadZone";

// Initialize EmailJS
emailjs.init("pB-Ip7Hzn8CkafusZ");

const subjectIcons = {
  math: Calculator,
  science: Atom,
  english: BookOpen,
  social: Globe,
  other: MoreHorizontal,
};

const ages = [...Array.from({ length: 13 }, (_, i) => (i + 6).toString()), "Adult"];

interface FormData {
  subject: string;
  studentName: string;
  age: string;
  topic: string;
  preferredDate: string;
  preferredTime: string;
  flexibleTime: boolean;
  email: string;
  lineOrPhone: string;
}

const LearnSubjects = () => {
  const { t } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("17:00 JST");
  const [flexibleTime, setFlexibleTime] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<SelectedFile[]>([]);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>();

  // Fetch available dates from database
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data, error } = await supabase
          .from("availability")
          .select("date")
          .eq("is_available", true);

        if (error) throw error;

        const dates = data?.map((record) => record.date) || [];
        setAvailableDates(dates);
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, []);

  const subjects = [
    { id: "math", label: t("learnSubjects.subjects.math"), icon: subjectIcons.math },
    { id: "science", label: t("learnSubjects.subjects.science"), icon: subjectIcons.science },
    { id: "english", label: t("learnSubjects.subjects.english"), icon: subjectIcons.english },
    { id: "social", label: t("learnSubjects.subjects.social"), icon: subjectIcons.social },
    { id: "other", label: t("learnSubjects.subjects.other"), icon: subjectIcons.other },
  ];

  const validateForm = (data: FormData) => {
    const newErrors: Record<string, boolean> = {};
    
    if (!data.studentName?.trim()) newErrors.studentName = true;
    if (!data.email?.trim()) newErrors.email = true;
    if (!selectedSubject) newErrors.subject = true;
    if (!selectedDate) newErrors.date = true;
    if (!selectedTime) newErrors.time = true;
    
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (data: FormData) => {
    if (!validateForm(data)) {
      toast.error(t("learnSubjects.validationError"));
      return;
    }

    setIsSubmitting(true);
    
    const subjectLabel = subjects.find(s => s.id === selectedSubject)?.label || selectedSubject;
    const dateString = selectedDate ? new Date(selectedDate).toLocaleDateString() : "No Date Selected";
    const flexibilityNote = flexibleTime ? "Yes - Open to rescheduling" : "No - Fixed time only";

    // Upload files to storage
    const fileResults: { name: string; url: string; size: number; type: string }[] = [];
    let uploadFailed = false;

    for (const { file } of uploadedFiles) {
      const filePath = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("student-materials")
        .upload(filePath, file);

      if (error) {
        console.error("File upload error:", error);
        uploadFailed = true;
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("student-materials")
        .getPublicUrl(filePath);

      fileResults.push({
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
      });
    }

    if (uploadFailed && uploadedFiles.length > 0) {
      toast.error(t("learnSubjects.upload.uploadFailed"));
    }

    // Format file list for email
    const formatSize = (bytes: number) =>
      bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    const uploaded_files_list = fileResults.length > 0
      ? "📎 UPLOADED FILES:\nClick the links below to view/download:\n\n" +
        fileResults.map((f, i) => `${i + 1}. ${f.name} (${formatSize(f.size)})\n   👉 ${f.url}`).join("\n\n")
      : "📎 No files uploaded";

    const templateParams = {
      from_name: data.studentName || "Unknown Name",
      age: data.age || "Not specified",
      subject: subjectLabel || "General",
      topic: data.topic || "No topic",
      time_slot: selectedTime || "No specific time picked",
      date: dateString,
      contact_email: data.email || "no-email@test.com",
      is_flexible: flexibilityNote,
      uploaded_files_list,
    };

    try {
      // Save to database
      const { error: dbError } = await supabase.from("bookings").insert({
        student_name: data.studentName,
        student_email: data.email,
        age: data.age || null,
        subject: selectedSubject,
        topic: data.topic || null,
        date: selectedDate,
        time_slot: selectedTime,
        line_or_phone: data.lineOrPhone || null,
        is_flexible: flexibleTime,
        uploaded_files: fileResults.length > 0 ? fileResults : null,
      });

      if (dbError) console.error("DB insert error:", dbError);

      // Send email
      await emailjs.send("service_fu37bdk", "template_6uvrdtx", templateParams);

      toast.success(t("learnSubjects.toastSuccess"));
      reset();
      setSelectedSubject("");
      setSelectedDate("");
      setSelectedTime("17:00 JST");
      setFlexibleTime(false);
      setUploadedFiles([]);
      setValidationErrors({});
      setShowSuccess(true);
    } catch (error: any) {
      console.error("Submission Failed:", error);
      toast.error(t("learnSubjects.toastError"));
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="relative min-h-screen">
      <LiquidEffectAnimation />

      {/* Fixed Back Button - Solid White Pill */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
      >
        <ArrowLeft className="w-4 h-4 text-slate-700" />
        <span className="text-slate-700 font-medium text-sm">{t("learnSubjects.backToHome")}</span>
      </Link>

      <main className="relative z-10 px-4 py-12 pt-20">
        {/* Glass Container */}
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 md:p-12">
          {/* Header */}
          <header className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              {t("learnSubjects.pageTitle")}
            </h1>
            <p className="font-body text-slate-600">
              {t("learnSubjects.pageSubtitle")}
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Section 1: Choose Subject */}
            <section>
              <Label className={cn(
                "font-display text-lg text-slate-800 mb-4 block",
                validationErrors.subject && "text-rose-600"
              )}>
                {t("learnSubjects.whatToStudy")} <span className="text-rose-500">*</span>
              </Label>
              <div className={cn(
                "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-1 rounded-xl",
                validationErrors.subject && "ring-2 ring-rose-500"
              )}>
                {subjects.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(id);
                      setValidationErrors(prev => ({ ...prev, subject: false }));
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      "bg-white hover:bg-blue-50 hover:border-blue-300",
                      selectedSubject === id
                        ? "bg-blue-50 border-blue-500 shadow-md"
                        : "border-slate-200"
                    )}
                  >
                    <Icon className={cn(
                      "w-6 h-6",
                      selectedSubject === id ? "text-blue-600" : "text-slate-500"
                    )} />
                    <span className={cn(
                      "text-sm font-body",
                      selectedSubject === id ? "text-blue-700 font-medium" : "text-slate-600"
                    )}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Section 2: Student Details */}
            <section className="space-y-5">
              <h2 className="font-display text-lg text-slate-800 border-b border-slate-200 pb-2">
                {t("learnSubjects.studentDetails")}
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName" className={cn(
                    "font-body text-slate-700",
                    validationErrors.studentName && "text-rose-600"
                  )}>
                    {t("learnSubjects.studentName")} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="studentName"
                    {...register("studentName", { required: true })}
                    placeholder={t("learnSubjects.studentNamePlaceholder")}
                    className={cn(
                      "mt-1.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400",
                      validationErrors.studentName && "border-rose-500 ring-1 ring-rose-500"
                    )}
                    onChange={(e) => {
                      register("studentName").onChange(e);
                      if (e.target.value.trim()) {
                        setValidationErrors(prev => ({ ...prev, studentName: false }));
                      }
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="font-body text-slate-700">
                    {t("learnSubjects.age")}
                  </Label>
                  <Select onValueChange={(val) => setValue("age", val)}>
                    <SelectTrigger className="mt-1.5 bg-white border-slate-300 text-slate-900">
                      <SelectValue placeholder={t("learnSubjects.selectAge")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {ages.map((age) => (
                        <SelectItem key={age} value={age} className="text-slate-900">
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="topic" className="font-body text-slate-700">
                    {t("learnSubjects.topic")}
                  </Label>
                  <Textarea
                    id="topic"
                    {...register("topic")}
                    placeholder={t("learnSubjects.topicPlaceholder")}
                    className="mt-1.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 min-h-[80px]"
                  />
                </div>
              </div>
            </section>

            {/* Section 2.5: File Upload */}
            <FileUploadZone files={uploadedFiles} onFilesChange={setUploadedFiles} />

            {/* Section 3: Time Preferences */}
            <section className="space-y-5">
              <h2 className="font-display text-lg text-slate-800 border-b border-slate-200 pb-2">
                {t("learnSubjects.timePreferences")}
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className={cn(
                    "font-body text-slate-700 mb-3 block",
                    validationErrors.date && "text-rose-600"
                  )}>
                    {t("learnSubjects.preferredDate")} <span className="text-rose-500">*</span>
                  </Label>
                  {loadingAvailability ? (
                    <div className="w-full bg-white/50 border border-white/60 rounded-lg p-3 text-slate-400 backdrop-blur-sm animate-pulse">
                      Loading available dates...
                    </div>
                  ) : availableDates.length === 0 ? (
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700">
                      {t("learnSubjects.noAvailableDates")}
                    </div>
                  ) : (
                    <select
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setValidationErrors(prev => ({ ...prev, date: false }));
                      }}
                      className={cn(
                        "w-full bg-white/50 border border-white/60 rounded-lg p-3 text-slate-700 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none",
                        validationErrors.date && "border-rose-500 ring-1 ring-rose-500",
                        !selectedDate && "text-slate-400"
                      )}
                    >
                      <option value="" disabled>Select an available date</option>
                      {availableDates
                        .filter((date) => new Date(date) >= new Date(new Date().toISOString().split("T")[0]))
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                        .map((date) => (
                          <option key={date} value={date}>
                            {new Date(date + "T00:00:00").toLocaleDateString(undefined, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div>
                  <Label className={cn(
                    "font-body text-slate-700 mb-3 block",
                    validationErrors.time && "text-rose-600"
                  )}>
                    {t("learnSubjects.preferredTime")} <span className="text-rose-500">*</span>
                  </Label>
                  <TimeDrumPicker
                    value={selectedTime}
                    onChange={useCallback((time: string) => {
                      setSelectedTime(time);
                      setValidationErrors(prev => ({ ...prev, time: false }));
                    }, [])}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="flexibleTime"
                    checked={flexibleTime}
                    onCheckedChange={(checked) => {
                      setFlexibleTime(checked as boolean);
                    }}
                    className="border-slate-400 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="flexibleTime" className="font-body text-slate-700 cursor-pointer">
                    {t("learnSubjects.flexibleTime")}
                  </Label>
                </div>
              </div>
            </section>

            {/* Section 4: Contact Info */}
            <section className="space-y-5">
              <h2 className="font-display text-lg text-slate-800 border-b border-slate-200 pb-2">
                {t("learnSubjects.contactInfo")}
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className={cn(
                    "font-body text-slate-700",
                    validationErrors.email && "text-rose-600"
                  )}>
                    {t("learnSubjects.email")} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder={t("learnSubjects.emailPlaceholder")}
                    className={cn(
                      "mt-1.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400",
                      validationErrors.email && "border-rose-500 ring-1 ring-rose-500"
                    )}
                    onChange={(e) => {
                      register("email").onChange(e);
                      if (e.target.value.trim()) {
                        setValidationErrors(prev => ({ ...prev, email: false }));
                      }
                    }}
                  />
                  {errors.email && (
                    <p className="text-rose-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lineOrPhone" className="font-body text-slate-700">
                    {t("learnSubjects.lineOrPhone")} <span className="text-slate-400">{t("learnSubjects.optional")}</span>
                  </Label>
                  <Input
                    id="lineOrPhone"
                    {...register("lineOrPhone")}
                    placeholder={t("learnSubjects.lineOrPhonePlaceholder")}
                    className="mt-1.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 text-lg font-display bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? t("learnSubjects.submitting") : t("learnSubjects.submit")}
            </Button>
          </form>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-slate-900">
              {t("learnSubjects.successTitle")}
            </DialogTitle>
            <DialogDescription className="font-body text-slate-600 text-base">
              {t("learnSubjects.successDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Link to="/">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                {t("learnSubjects.backToHome")}
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default LearnSubjects;
