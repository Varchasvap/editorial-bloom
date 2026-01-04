-- Create the availability table
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to read availability (for students to see)
CREATE POLICY "Anyone can view availability"
ON public.availability
FOR SELECT
USING (true);

-- Policy 2: Only authenticated users can insert
CREATE POLICY "Authenticated users can insert availability"
ON public.availability
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Only authenticated users can update
CREATE POLICY "Authenticated users can update availability"
ON public.availability
FOR UPDATE
TO authenticated
USING (true);

-- Policy 4: Only authenticated users can delete
CREATE POLICY "Authenticated users can delete availability"
ON public.availability
FOR DELETE
TO authenticated
USING (true);