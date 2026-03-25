-- Ensure a dedicated DELETE policy exists for authenticated users on availability
DROP POLICY IF EXISTS "Authenticated users can delete availability" ON public.availability;

CREATE POLICY "Authenticated users can delete availability"
ON public.availability
FOR DELETE
TO authenticated
USING (true);