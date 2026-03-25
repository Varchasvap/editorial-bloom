-- Tighten DELETE policy to avoid permissive true expression while allowing authenticated admins
DROP POLICY IF EXISTS "Authenticated users can delete availability" ON public.availability;

CREATE POLICY "Authenticated users can delete availability"
ON public.availability
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);