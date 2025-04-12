
-- Create 'message-attachments' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true);

-- Create policy for authenticated users to upload files
CREATE POLICY "Allow users to upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for authenticated users to update their own files
CREATE POLICY "Allow users to update their own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for authenticated users to read files
CREATE POLICY "Allow users to read all files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'message-attachments');

-- Create policy for authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for public access to files
CREATE POLICY "Allow public access to files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'message-attachments');
