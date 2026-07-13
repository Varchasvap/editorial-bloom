
-- Role enum + user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- has_role security-definer helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Backfill: every existing auth user is an admin (only admins exist today)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Tighten bookings policies
DROP POLICY IF EXISTS "Authenticated can select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can delete bookings" ON public.bookings;

CREATE POLICY "Admins can select bookings"
ON public.bookings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tighten availability policies (admin-only writes; keep public read)
DROP POLICY IF EXISTS "Authenticated users can insert availability" ON public.availability;
DROP POLICY IF EXISTS "Authenticated users can update availability" ON public.availability;
DROP POLICY IF EXISTS "Authenticated users can delete availability" ON public.availability;

CREATE POLICY "Admins can insert availability"
ON public.availability FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update availability"
ON public.availability FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete availability"
ON public.availability FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
