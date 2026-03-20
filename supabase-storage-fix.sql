-- إضافة عمود الحالة للاقتراحات
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'جديد';

-- إصلاح صلاحيات Storage
-- news-covers bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('news-covers', 'news-covers', true) ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read news-covers" ON storage.objects FOR SELECT USING (bucket_id = 'news-covers');
CREATE POLICY "Auth upload news-covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'news-covers' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update news-covers" ON storage.objects FOR UPDATE USING (bucket_id = 'news-covers' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete news-covers" ON storage.objects FOR DELETE USING (bucket_id = 'news-covers' AND auth.role() = 'authenticated');

-- gallery bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Auth upload gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update gallery" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
