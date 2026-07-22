
-- Restrict student-materials DELETE to admins only
DROP POLICY IF EXISTS "Authenticated can delete student materials" ON storage.objects;
CREATE POLICY "Admins can delete student materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-materials' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Convert has_role to SECURITY INVOKER; user_roles RLS + SELECT grant to authenticated already restrict visibility to own row, which is exactly what has_role needs.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
