// Secure server-side booking submission.
// - Validates inputs with zod
// - Simple in-memory IP rate limit (5 per 10 minutes)
// - Uploads files to private storage bucket with service role
// - Inserts into public.bookings with service role
// - Sends email via EmailJS REST API using server-only private key
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID");
const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID");
const EMAILJS_PUBLIC_KEY = Deno.env.get("EMAILJS_PUBLIC_KEY");
const EMAILJS_PRIVATE_KEY = Deno.env.get("EMAILJS_PRIVATE_KEY");

const MAX_FILES = 3;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".heic", ".xlsx", ".csv"]);

const PayloadSchema = z.object({
  studentName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  age: z.string().trim().max(20).optional().nullable(),
  subject: z.enum(["math", "science", "english", "social", "other"]),
  topic: z.string().trim().max(2000).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().trim().min(1).max(50),
  lineOrPhone: z.string().trim().max(100).optional().nullable(),
  flexibleTime: z.boolean().optional().default(false),
  website: z.string().max(0).optional().nullable(), // honeypot
});

// Very small in-memory rate limiter (per instance).
const rateBucket = new Map<string, number[]>();
function rateLimit(ip: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const arr = (rateBucket.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    rateBucket.set(ip, arr);
    return false;
  }
  arr.push(now);
  rateBucket.set(ip, arr);
  return true;
}

function safeName(name: string) {
  return name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid form data" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawPayload = form.get("payload");
  if (typeof rawPayload !== "string") {
    return new Response(JSON.stringify({ error: "Missing payload" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let parsed;
  try {
    parsed = PayloadSchema.safeParse(JSON.parse(rawPayload));
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const data = parsed.data;

  // Silently drop honeypot hits
  if (data.website && data.website.length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Date must be >= today + 7 days
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setUTCDate(minDate.getUTCDate() + 7);
  const maxDate = new Date(today);
  maxDate.setUTCDate(maxDate.getUTCDate() + 37);
  const chosen = new Date(data.date + "T00:00:00Z");
  if (chosen < minDate || chosen > maxDate) {
    return new Response(JSON.stringify({ error: "Date outside allowed booking window" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Reject blocked dates
  {
    const { data: blocked } = await admin
      .from("availability")
      .select("date")
      .eq("date", data.date)
      .eq("is_available", false)
      .maybeSingle();
    if (blocked) {
      return new Response(JSON.stringify({ error: "Date is not available" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Collect + validate files
  const files: File[] = [];
  for (let i = 0; i < MAX_FILES; i++) {
    const f = form.get(`file${i}`);
    if (f instanceof File && f.size > 0) files.push(f);
  }
  if (files.length > MAX_FILES) {
    return new Response(JSON.stringify({ error: "Too many files" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  for (const f of files) {
    if (f.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: `File too large: ${f.name}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ALLOWED_EXT.has(ext)) {
      return new Response(JSON.stringify({ error: `File type not allowed: ${f.name}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Upload files to private bucket
  const uploaded: { name: string; path: string; size: number; type: string; signedUrl: string }[] = [];
  for (const f of files) {
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}_${safeName(f.name)}`;
    const { error: upErr } = await admin.storage
      .from("student-materials")
      .upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
    if (upErr) {
      console.error("Upload error:", upErr);
      return new Response(JSON.stringify({ error: "File upload failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // 7-day signed URL for the admin email
    const { data: signed } = await admin.storage
      .from("student-materials")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    uploaded.push({
      name: f.name,
      path,
      size: f.size,
      type: f.type,
      signedUrl: signed?.signedUrl ?? "",
    });
  }

  // Insert booking
  const { error: insertErr } = await admin.from("bookings").insert({
    student_name: data.studentName,
    student_email: data.email,
    age: data.age ?? null,
    subject: data.subject,
    topic: data.topic ?? null,
    date: data.date,
    time_slot: data.timeSlot,
    line_or_phone: data.lineOrPhone ?? null,
    is_flexible: data.flexibleTime ?? false,
    uploaded_files: uploaded.length ? uploaded.map((u) => ({
      name: u.name, path: u.path, size: u.size, type: u.type,
    })) : null,
  });
  if (insertErr) {
    console.error("Insert error:", insertErr);
    return new Response(JSON.stringify({ error: "Could not save booking" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fire off the notification email (best-effort — do not fail the booking if this fails)
  if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY && EMAILJS_PRIVATE_KEY) {
    try {
      const formatSize = (b: number) =>
        b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
      const uploaded_files_list = uploaded.length
        ? "📎 UPLOADED FILES:\n\n" +
          uploaded.map((u, i) => `${i + 1}. ${u.name} (${formatSize(u.size)})\n   👉 ${u.signedUrl}`).join("\n\n")
        : "📎 No files uploaded";

      const emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "origin": "https://api.emailjs.com" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          accessToken: EMAILJS_PRIVATE_KEY,
          template_params: {
            from_name: data.studentName,
            age: data.age || "Not specified",
            subject: data.subject,
            topic: data.topic || "No topic",
            time_slot: data.timeSlot,
            date: data.date,
            contact_email: data.email,
            is_flexible: data.flexibleTime ? "Yes - Open to rescheduling" : "No - Fixed time only",
            uploaded_files_list,
          },
        }),
      });
      if (!emailRes.ok) {
        console.error("EmailJS send failed:", emailRes.status, await emailRes.text());
      }
    } catch (e) {
      console.error("EmailJS exception:", e);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
