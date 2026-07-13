
-- Tighten bookings: revoke anon direct write, add length checks; edge function will use service role
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;

REVOKE INSERT ON public.bookings FROM anon;
REVOKE INSERT ON public.bookings FROM authenticated;

-- Length validation at DB level
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_student_name_len CHECK (char_length(student_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT bookings_student_email_len CHECK (char_length(student_email) BETWEEN 3 AND 255),
  ADD CONSTRAINT bookings_subject_len CHECK (char_length(subject) BETWEEN 1 AND 50),
  ADD CONSTRAINT bookings_topic_len CHECK (topic IS NULL OR char_length(topic) <= 2000),
  ADD CONSTRAINT bookings_age_len CHECK (age IS NULL OR char_length(age) <= 20),
  ADD CONSTRAINT bookings_line_len CHECK (line_or_phone IS NULL OR char_length(line_or_phone) <= 100),
  ADD CONSTRAINT bookings_time_slot_len CHECK (char_length(time_slot) BETWEEN 1 AND 50);

-- Storage: remove anon read/write access to student-materials.
-- Edge function uses service_role which bypasses RLS.
DROP POLICY IF EXISTS "Anyone can read student-materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to student-materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read student materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload student materials" ON storage.objects;
