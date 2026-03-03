
-- Allow public uploads to student-materials bucket
CREATE POLICY "Anyone can upload to student-materials"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'student-materials');

-- Allow public read access to student-materials bucket
CREATE POLICY "Anyone can read student-materials"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'student-materials');
