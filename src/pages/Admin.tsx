import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface AvailabilityRecord {
  id: string;
  date: string;
  is_available: boolean;
}

const Admin = () => {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch availability when logged in
  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    setCalendarLoading(true);
    try {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("is_available", true);

      if (error) throw error;

      const dates = (data as AvailabilityRecord[]).map((record) => new Date(record.date + "T00:00:00"));
      setAvailableDates(dates);
    } catch (error: any) {
      console.error("Error fetching availability:", error);
      toast.error(t("admin.fetchError"));
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success(t("admin.loginSuccess"));
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || t("admin.loginError"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t("admin.logoutSuccess"));
  };

  const handleDateClick = async (date: Date | undefined) => {
    if (!date) return;

    const dateString = date.toISOString().split("T")[0];
    const isCurrentlyAvailable = availableDates.some(
      (d) => d.toISOString().split("T")[0] === dateString
    );

    setCalendarLoading(true);
    try {
      if (isCurrentlyAvailable) {
        // Remove the date
        const { error } = await supabase
          .from("availability")
          .delete()
          .eq("date", dateString);

        if (error) throw error;

        setAvailableDates((prev) =>
          prev.filter((d) => d.toISOString().split("T")[0] !== dateString)
        );
        toast.success(t("admin.dateRemoved"));
      } else {
        // Add the date
        const { error } = await supabase
          .from("availability")
          .insert({ date: dateString, is_available: true });

        if (error) throw error;

        setAvailableDates((prev) => [...prev, date]);
        toast.success(t("admin.dateAdded"));
      }
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error(t("admin.updateError"));
    } finally {
      setCalendarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600">{t("admin.loading")}</div>
      </div>
    );
  }

  // Login/Signup Form
  if (!user) {
    return (
      <div className="relative min-h-screen">
        <LiquidEffectAnimation />

        <Link
          to="/"
          className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
          <span className="text-slate-700 font-medium text-sm">{t("admin.backToHome")}</span>
        </Link>

        <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8">
            <header className="text-center mb-8">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {t("admin.loginTitle")}
              </h1>
              <p className="font-body text-slate-600 text-sm">
                {t("admin.loginSubtitle")}
              </p>
            </header>

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <Label htmlFor="email" className="font-body text-slate-700">
                  {t("admin.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="mt-1.5 bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <Label htmlFor="password" className="font-body text-slate-700">
                  {t("admin.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="mt-1.5 bg-white border-slate-300 text-slate-900"
                />
              </div>

              <Button
                type="submit"
                disabled={authLoading}
                className="w-full py-5 font-display bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                {authLoading ? t("admin.signingIn") : t("admin.signIn")}
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="relative min-h-screen">
      <LiquidEffectAnimation />

      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
      >
        <ArrowLeft className="w-4 h-4 text-slate-700" />
        <span className="text-slate-700 font-medium text-sm">{t("admin.backToHome")}</span>
      </Link>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
      >
        <LogOut className="w-4 h-4 text-slate-700" />
        <span className="text-slate-700 font-medium text-sm">{t("admin.logout")}</span>
      </button>

      <main className="relative z-10 px-4 py-12 pt-20">
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 md:p-12">
          {/* Header */}
          <header className="text-center mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {t("admin.dashboardTitle")}
            </h1>
            <p className="font-body text-slate-600 text-sm">
              {t("admin.dashboardSubtitle")}
            </p>
          </header>

          {/* Enhanced Legend */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md">
                <span className="text-white text-lg">🟢</span>
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-emerald-700">{t("admin.legendAvailable")}</p>
                <p className="font-body text-xs text-slate-500">{t("admin.legendAvailableDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shadow-md">
                <span className="text-slate-400 text-lg">⚪</span>
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-slate-700">{t("admin.legendBlocked")}</p>
                <p className="font-body text-xs text-slate-500">{t("admin.legendBlockedDesc")}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center mb-6">
            <p className="font-body text-sm text-slate-600">
              {t("admin.totalAvailable")}: <span className="font-semibold text-emerald-600">{availableDates.length}</span> {t("admin.days")}
            </p>
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              onSelect={handleDateClick}
              disabled={calendarLoading}
              className={cn(
                "p-4 pointer-events-auto bg-white rounded-2xl border border-slate-200 shadow-lg",
                calendarLoading && "opacity-50"
              )}
              modifiers={{
                available: availableDates,
              }}
              modifiersStyles={{
                available: {
                  backgroundColor: "rgb(16, 185, 129)",
                  color: "white",
                  fontWeight: "bold",
                },
              }}
              fromDate={new Date()}
            />
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="font-body text-sm text-blue-800 text-center">
              💡 {t("admin.instructions")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
