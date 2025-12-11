import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
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
import { toast } from "sonner";

// Initialize EmailJS
emailjs.init("pB-Ip7Hzn8CkafusZ");

const subjects = [
  { id: "math", label: "Math", icon: Calculator },
  { id: "science", label: "Science", icon: Atom },
  { id: "english", label: "English Support", icon: BookOpen },
  { id: "social", label: "Social Studies", icon: Globe },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ages = [...Array.from({ length: 13 }, (_, i) => (i + 6).toString()), "Adult"];

interface FormData {
  subject: string;
  studentName: string;
  age: string;
  topic: string;
  preferredDays: string[];
  preferredTime: string;
  flexibleTime: boolean;
  email: string;
  lineOrPhone: string;
}

const LearnSubjects = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("17:00 JST");
  const [flexibleTime, setFlexibleTime] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const subjectLabel = subjects.find(s => s.id === selectedSubject)?.label || selectedSubject;
      
      await emailjs.send(
        "service_fu37bdk",
        "template_vc0nkdh",
        {
          from_name: data.studentName,
          age: data.age,
          subject: subjectLabel,
          topic: data.topic,
          time_slot: selectedTime,
          days: selectedDays.join(", "),
          contact_email: data.email
        }
      );

      toast.success("Request Sent! We will email you shortly to confirm.");
      reset();
      setSelectedSubject("");
      setSelectedDays([]);
      setSelectedTime("17:00 JST");
      setFlexibleTime(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Email Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="relative min-h-screen">
      <LiquidEffectAnimation />

      <main className="relative z-10 px-4 py-12">
        {/* Back Link */}
        <div className="max-w-3xl mx-auto mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Glass Container */}
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 md:p-12">
          {/* Header */}
          <header className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Lesson Reservation
            </h1>
            <p className="font-body text-slate-600">
              Select your subject and preferred time. We will confirm your slot via email.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Section 1: Choose Subject */}
            <section>
              <Label className="font-display text-lg text-slate-800 mb-4 block">
                What do you want to study?
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {subjects.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedSubject(id)}
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
                Student Details
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName" className="font-body text-slate-700">
                    Student Name
                  </Label>
                  <Input
                    id="studentName"
                    {...register("studentName", { required: true })}
                    placeholder="Enter student's name"
                    className="mt-1.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="font-body text-slate-700">
                    Age
                  </Label>
                  <Select onValueChange={(val) => setValue("age", val)}>
                    <SelectTrigger className="mt-1.5 bg-white border-slate-300 text-slate-900">
                      <SelectValue placeholder="Select age" />
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
                    Topic
                  </Label>
                  <Textarea
                    id="topic"
                    {...register("topic")}
                    placeholder="What do you want to learn today?"
                    className="mt-1.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 min-h-[80px]"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Time Preferences */}
            <section className="space-y-5">
              <h2 className="font-display text-lg text-slate-800 border-b border-slate-200 pb-2">
                Time Preferences
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="font-body text-slate-700 mb-3 block">
                    Preferred Days
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={cn(
                          "px-4 py-2 rounded-lg border text-sm font-body transition-all",
                          selectedDays.includes(day)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-300 hover:border-blue-300"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-body text-slate-700 mb-3 block">
                    Preferred Start Time
                  </Label>
                  <TimeDrumPicker 
                    value={selectedTime} 
                    onChange={useCallback((time: string) => setSelectedTime(time), [])} 
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="flexibleTime"
                    checked={flexibleTime}
                    onCheckedChange={(checked) => setFlexibleTime(checked as boolean)}
                    className="border-slate-400 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="flexibleTime" className="font-body text-slate-700 cursor-pointer">
                    I am flexible with time
                  </Label>
                </div>
              </div>
            </section>

            {/* Section 4: Contact Info */}
            <section className="space-y-5">
              <h2 className="font-display text-lg text-slate-800 border-b border-slate-200 pb-2">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="font-body text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder="your@email.com"
                    className="mt-1.5 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  />
                  {errors.email && (
                    <p className="text-rose-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lineOrPhone" className="font-body text-slate-700">
                    LINE ID or Phone <span className="text-slate-400">(Optional)</span>
                  </Label>
                  <Input
                    id="lineOrPhone"
                    {...register("lineOrPhone")}
                    placeholder="LINE ID or phone number"
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
              {isSubmitting ? "Sending..." : "Send Booking Request"}
            </Button>
          </form>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-slate-900">
              Thank You!
            </DialogTitle>
            <DialogDescription className="font-body text-slate-600 text-base">
              Your request has been sent. We will email you shortly to confirm your lesson time.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Link to="/">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearnSubjects;
