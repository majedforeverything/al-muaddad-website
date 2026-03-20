-- ═══════════════════════════════════════
-- جداول موقع آل معضد
-- ═══════════════════════════════════════

-- 1. الأخبار
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  body TEXT,
  cover_image_url TEXT,
  show_on_homepage BOOLEAN DEFAULT false,
  homepage_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. تصنيفات المعرض
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  filter TEXT NOT NULL
);

INSERT INTO categories (id, title, filter) VALUES
  ('events', 'المناسبات', 'المناسبات'),
  ('eids', 'الأعياد', 'الأعياد'),
  ('memories', 'الذكريات', 'الذكريات');

-- 3. الألبومات
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. الصور
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. الاقتراحات والشكاوى
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- صلاحيات RLS
-- ═══════════════════════════════════════

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read news" ON news FOR SELECT USING (true);
CREATE POLICY "Admin write news" ON news FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update news" ON news FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete news" ON news FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read albums" ON albums FOR SELECT USING (true);
CREATE POLICY "Admin write albums" ON albums FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update albums" ON albums FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete albums" ON albums FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Admin write photos" ON photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update photos" ON photos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete photos" ON photos FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read submissions" ON submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update submissions" ON submissions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete submissions" ON submissions FOR DELETE USING (auth.role() = 'authenticated');
