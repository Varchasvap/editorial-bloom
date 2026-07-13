
-- 1) bookings: explicit restrictive deny for public inserts (server function uses service role, which bypasses RLS)
DROP POLICY IF EXISTS "Deny public inserts on bookings" ON public.bookings;
CREATE POLICY "Deny public inserts on bookings"
ON public.bookings
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- 2) user_roles: prevent privilege escalation. Only admins can modify roles.
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) storage.objects for student-materials: explicit deny for anon/authenticated across all ops.
-- The bucket is private; edge function uses the service role which bypasses RLS.
DROP POLICY IF EXISTS "Deny public select on student-materials" ON storage.objects;
CREATE POLICY "Deny public select on student-materials"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'student-materials' AND false);

DROP POLICY IF EXISTS "Deny public insert on student-materials" ON storage.objects;
CREATE POLICY "Deny public insert on student-materials"
ON storage.objects
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id <> 'student-materials');

DROP POLICY IF EXISTS "Deny public update on student-materials" ON storage.objects;
CREATE POLICY "Deny public update on student-materials"
ON storage.objects
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (bucket_id <> 'student-materials')
WITH CHECK (bucket_id <> 'student-materials');

DROP POLICY IF EXISTS "Deny public delete on student-materials" ON storage.objects;
CREATE POLICY "Deny public delete on student-materials"
ON storage.objects
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (bucket_id <> 'student-materials');

-- 4) Restrict EXECUTE on SECURITY DEFINER function has_role.
-- RLS policies referencing has_role use `to authenticated`, so authenticated needs EXECUTE.
-- Revoke from PUBLIC and anon to reduce exposure.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
